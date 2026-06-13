/**
 * scrape-photos.ts
 * 環境省「外来種写真集」ページから 種名→画像URL配列 のマップを生成する
 * https://www.env.go.jp/nature/intro/4document/asimg.html
 *
 * 注意: 写真利用時は「環境省提供」とクレジットの表示が必要
 */
import * as cheerio from 'cheerio';

const PHOTO_URL = 'https://www.env.go.jp/nature/intro/4document/asimg.html';
const BASE_URL = 'https://www.env.go.jp';

/** 環境省写真集から 和名 → 画像URL配列 のマップを返す */
export async function scrapePhotos(): Promise<Map<string, string[]>> {
  console.log('[scrape-photos] フェッチ中:', PHOTO_URL);
  const res = await fetch(PHOTO_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (invasive-species-viewer/1.0; research)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const photoMap = new Map<string, string[]>();

  // 写真集ページの構造:
  // <table>
  //   <tr>
  //     <td>フクロギツネ</td>
  //     <td>
  //       <a href="..."><img src="/nature/intro/4document/files/asimg/..." alt="..."></a>
  //       ...
  //     </td>
  //   </tr>
  // </table>

  $('table tr').each((_, tr) => {
    const cells = $('td', tr);
    if (cells.length < 2) return;

    // 最初の td が種名、残り（通常1つ）に画像が入る
    const nameCell = cells.first();
    const name = nameCell.text().replace(/\s+/g, ' ').trim();

    // 種名らしい判定（空白なし、記号なし、長すぎない）
    if (!name || name.length > 50 || name.includes('|')) return;

    const photos: string[] = [];
    cells.slice(1).each((_, cell) => {
      $('img', cell).each((_, img) => {
        const src = $(img).attr('src') ?? '';
        if (!src) return;
        // URL クラスで相対パスを正しく解決する
        let fullUrl: string;
        try {
          fullUrl = new URL(src, PHOTO_URL).href;
        } catch {
          return;
        }
        // サムネイルではなくオリジナルパスのみ（_s. などのサムネイル除外）
        if (!fullUrl.includes('_s.') && !fullUrl.includes('/thumb/')) {
          photos.push(fullUrl);
        }
      });
    });

    if (photos.length > 0) {
      // 同一種名でエントリが重複する場合はマージ
      const existing = photoMap.get(name) ?? [];
      photoMap.set(name, [...existing, ...photos]);
    }
  });

  console.log(
    `[scrape-photos] 種数: ${photoMap.size}, 総画像数: ${[...photoMap.values()].flat().length}`,
  );
  return photoMap;
}

// 単体実行
if (require.main === module) {
  scrapePhotos().then((map) => {
    for (const [name, urls] of [...map.entries()].slice(0, 5)) {
      console.log(name, urls);
    }
  });
}
