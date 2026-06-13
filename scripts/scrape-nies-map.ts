/**
 * scrape-nies-map.ts
 * NIESの分布GIF画像からピクセルカラーを解析して都道府県情報を抽出する
 * Python3 + Pillow を使用（ローカル実行専用）
 */
import { spawnSync } from 'child_process';

const DELAY_MS = 500;
const RADIUS = 8; // ±ピクセル検索半径

// 都道府県 → 主要サンプル点 [lat, lon][]
const PREF_POINTS: Record<string, [number, number][]> = {
  北海道: [
    [43.06, 141.35],
    [43.77, 141.65],
    [42.8, 141.34],
  ],
  青森: [[40.82, 140.74]],
  岩手: [[39.7, 141.15]],
  宮城: [[38.27, 140.87]],
  秋田: [[39.72, 140.1]],
  山形: [[38.24, 140.34]],
  福島: [[37.75, 140.47]],
  茨城: [[36.34, 140.45]],
  栃木: [[36.57, 139.88]],
  群馬: [[36.39, 139.06]],
  埼玉: [[35.86, 139.65]],
  千葉: [[35.61, 140.12]],
  東京: [
    [35.68, 139.75],
    [35.56, 139.65],
  ],
  神奈川: [[35.45, 139.64]],
  新潟: [[37.9, 139.02]],
  富山: [[36.7, 137.21]],
  石川: [[36.59, 136.63]],
  福井: [[35.95, 136.18]],
  山梨: [[35.66, 138.57]],
  長野: [
    [36.65, 138.18],
    [35.9, 137.9],
  ],
  岐阜: [[35.39, 136.72]],
  静岡: [[34.98, 138.38]],
  愛知: [[35.18, 136.91]],
  三重: [[34.73, 136.51]],
  滋賀: [[35.0, 135.86]],
  京都: [[35.02, 135.75]],
  大阪: [[34.69, 135.5]],
  兵庫: [
    [34.69, 135.2],
    [34.81, 134.87],
  ],
  奈良: [[34.69, 135.83]],
  和歌山: [[34.23, 135.17]],
  鳥取: [[35.5, 133.82]],
  島根: [[35.47, 132.65]],
  岡山: [[34.66, 133.93]],
  広島: [[34.4, 132.46]],
  山口: [[34.19, 131.47]],
  徳島: [[34.07, 134.54]],
  香川: [[34.34, 134.05]],
  愛媛: [[33.84, 132.77]],
  高知: [[33.56, 133.53]],
  福岡: [[33.6, 130.42]],
  佐賀: [[33.27, 130.32]],
  長崎: [[32.74, 129.87]],
  熊本: [[32.79, 130.74]],
  大分: [[33.24, 131.6]],
  宮崎: [[31.91, 131.42]],
  鹿児島: [[31.56, 130.56]],
  沖縄: [[26.21, 127.68]],
};

// Pillow を使った GIF ピクセル解析 Python コード
const PYTHON_ANALYZER = `
import sys, json, urllib.request, io, ssl
from PIL import Image

ssl._create_default_https_context = ssl._create_unverified_context

def is_dist(r, g, b):
    """暖色系（分布あり色）かどうか判定"""
    if r > 240 and g > 240 and b > 240: return False   # 白・背景
    if r < 20 and g < 20 and b < 20: return False      # 黒（境界線）
    if max(r, g, b) - min(r, g, b) < 30: return False  # グレー
    if b > r + 30: return False                          # 青系（海）
    if g > r + 15 and b > r + 15 and r < 150: return False  # シアン・ティール
    if g > r and b > r and r < 60: return False         # 暗ティール
    return True  # 赤・オレンジ・黄・ピンク・マゼンタ = 分布あり

def get_pix(img, x, y, w, h):
    x = max(0, min(x, w - 1))
    y = max(0, min(y, h - 1))
    return img.getpixel((x, y))

tasks = json.loads(sys.stdin.read())
results = {}
R = ${RADIUS}

for url, pref_points in tasks.items():
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=12) as r:
            data = r.read()
        img = Image.open(io.BytesIO(data)).convert('RGB')
        w, h = img.size
        found = []
        for pref, pts in pref_points.items():
            ok = False
            for lat, lon in pts:
                cx = max(0, min(round((lon - 122.0) / 32.0 * w), w - 1))
                cy = max(0, min(round((46.0 - lat) / 22.0 * h), h - 1))
                for dy in range(-R, R + 1):
                    for dx in range(-R, R + 1):
                        px = get_pix(img, cx + dx, cy + dy, w, h)
                        if is_dist(*px):
                            ok = True
                            break
                    if ok: break
                if ok: break
            if ok:
                found.append(pref)
        results[url] = found
    except Exception as e:
        results[url] = []

print(json.dumps(results, ensure_ascii=False))
`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** GIF URL → 検出された都道府県リスト（Python Pillow で解析） */
function analyzeGifUrls(
  tasks: Record<string, Record<string, [number, number][]>>,
): Record<string, string[]> {
  const input = JSON.stringify(tasks);
  const result = spawnSync('python3', ['-c', PYTHON_ANALYZER], {
    input,
    encoding: 'utf8',
    timeout: 60000 * 5, // 5分
  });

  if (result.error || result.status !== 0) {
    console.warn(`  [gif] Pythonエラー: ${result.stderr?.slice(0, 200)}`);
    return {};
  }

  try {
    return JSON.parse(result.stdout);
  } catch {
    console.warn(`  [gif] JSON解析エラー: ${result.stdout?.slice(0, 100)}`);
    return {};
  }
}

/** NIES の detail URL から GIF URL を生成 */
function gifUrlFromDetailUrl(detailUrl: string): string | null {
  const match = detailUrl.match(/\/detail\/(\d+)\.html$/);
  if (!match) return null;
  return `https://www.nies.go.jp/biodiversity/invasive/DB/image/map/${match[1]}.gif`;
}

/**
 * NIES GIF マップから都道府県分布を取得する
 * @param niesUrlMap species jaName → niesDetailUrl
 * @returns jaName → 検出された都道府県リスト
 */
export async function scrapeGifPrefectures(
  niesUrlMap: Map<string, string>,
): Promise<Map<string, string[]>> {
  const result = new Map<string, string[]>();

  // GIF URL を持つエントリのみ処理
  const entries: [string, string][] = [];
  for (const [jaName, detailUrl] of niesUrlMap) {
    const gifUrl = gifUrlFromDetailUrl(detailUrl);
    if (gifUrl) entries.push([jaName, gifUrl]);
  }

  if (entries.length === 0) return result;

  // バッチ処理（10件ずつ Python に渡す）
  const BATCH = 10;
  const total = entries.length;

  for (let start = 0; start < total; start += BATCH) {
    const batch = entries.slice(start, start + BATCH);
    console.log(
      `[scrape-gif] (${start + 1}〜${Math.min(start + BATCH, total)}/${total})`,
    );

    // tasks: { gifUrl: { pref: [[lat,lon], ...] } }
    const tasks: Record<string, Record<string, [number, number][]>> = {};
    for (const [, gifUrl] of batch) {
      tasks[gifUrl] = PREF_POINTS as Record<string, [number, number][]>;
    }

    const batchResult = analyzeGifUrls(tasks);

    for (const [jaName, gifUrl] of batch) {
      const prefs = batchResult[gifUrl] ?? [];
      result.set(jaName, prefs);
    }

    if (start + BATCH < total) await sleep(DELAY_MS);
  }

  return result;
}

// 単体実行（検証用）
if (require.main === module) {
  const testUrls = new Map([
    [
      'アライグマ',
      'https://www.nies.go.jp/biodiversity/invasive/DB/detail/10060.html',
    ],
    [
      'タイワンザル',
      'https://www.nies.go.jp/biodiversity/invasive/DB/detail/10030.html',
    ],
  ]);
  scrapeGifPrefectures(testUrls).then((map) => {
    for (const [name, prefs] of map) {
      console.log(`${name}: ${prefs.join(', ')}`);
    }
  });
}
