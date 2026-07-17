/**
 * 写真が無い種について、Wikimedia Commons（Wikidata経由）から
 * フリーライセンスの画像を取得して補完するスクリプト。
 *
 * 対象: data/species.json の photos が空の種のみ（既存の写真がある種には触れない）
 * 出力: public/images/species/{id}/0.webp, data/species.json の photos / photoCredits
 */
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import type { PhotoCredit, Species } from '../lib/types';

const DATA_PATH = path.join(process.cwd(), 'data', 'species.json');
const PUBLIC_DIR = path.join(process.cwd(), 'public', 'images', 'species');

const UA = {
  'User-Agent':
    'invasive-species-viewer/1.0 (research; contact keita.yokoyama@ai2-jp.com)',
};

const UPSCALE_THRESHOLD = 400;
const MAX_WIDTH = 1200;
const WEBP_QUALITY = 85;
const DELAY_MS = 200;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 学名が使い物にならない（空 / 複数属のグループ / 交雑種 / spp.）かどうか */
function isGroupOrInvalid(name: string): boolean {
  const trimmed = (name || '').trim();
  if (!trimmed) return true;
  if (/spp\.?/i.test(trimmed)) return true;
  if (trimmed.includes('×')) return true;
  const tokens = trimmed.split(/\s+/);
  // 全トークンが大文字始まり（小文字の種小名が無い）＝複数属の並記とみなす
  if (tokens.length >= 2 && tokens.every((t) => /^[A-Z]/.test(t))) {
    return true;
  }
  return false;
}

/** 属の和名表記（例: "アノール属Anolis"）から末尾のラテン語部分を抽出 */
function extractGenusLatin(genus: string): string | null {
  const m = genus.match(/[A-Za-z][A-Za-z ]*$/);
  if (!m) return null;
  const latin = m[0].trim();
  return latin || null;
}

interface Candidate {
  name: string;
  label: string;
}

function buildCandidates(s: Species): Candidate[] {
  const candidates: Candidate[] = [];
  const sci = (s.scientificName || '').trim();

  if (sci && !isGroupOrInvalid(sci)) {
    candidates.push({ name: sci, label: '学名' });
  }

  // 省略属名形式（例: "A allogus"）の場合、完全な二名法名を再構築
  if (sci && /^[A-Z]\.?\s+\S/.test(sci)) {
    const genusLatin = extractGenusLatin(s.genus || '');
    if (genusLatin) {
      const tokens = sci.split(/\s+/);
      const epithet = tokens.slice(1).join(' ');
      if (epithet) {
        candidates.push({
          name: `${genusLatin} ${epithet}`,
          label: '再構築学名',
        });
      }
    }
  }

  return candidates;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function isFreeLicense(licenseCode?: string, licenseShort?: string): boolean {
  const code = (licenseCode || '').toLowerCase();
  const short = (licenseShort || '').toLowerCase();
  const combined = `${code} ${short}`;

  if (
    combined.includes('non-commercial') ||
    combined.includes('-nc') ||
    combined.includes('fair use')
  ) {
    return false;
  }
  if (
    code.startsWith('cc0') ||
    code.startsWith('cc-by') ||
    code.startsWith('pd') ||
    code.startsWith('publicdomain')
  ) {
    return true;
  }
  if (combined.includes('public domain')) {
    return true;
  }
  return false;
}

interface WikidataSearchResponse {
  search?: { id: string }[];
}

interface WikidataClaimsResponse {
  claims?: {
    P18?: { mainsnak?: { datavalue?: { value?: string } } }[];
  };
}

interface CommonsExtMetadataField {
  value?: string;
}

interface CommonsImageInfoRaw {
  url?: string;
  thumburl?: string;
  extmetadata?: {
    LicenseShortName?: CommonsExtMetadataField;
    License?: CommonsExtMetadataField;
    LicenseUrl?: CommonsExtMetadataField;
    Artist?: CommonsExtMetadataField;
  };
}

interface CommonsPage {
  imageinfo?: CommonsImageInfoRaw[];
}

interface CommonsQueryResponse {
  query?: {
    pages?: Record<string, CommonsPage>;
  };
}

async function wikidataSearchEntity(name: string): Promise<string | null> {
  const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(
    name,
  )}&language=en&type=item&format=json&limit=1`;
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`wbsearchentities HTTP ${res.status}`);
  const json = (await res.json()) as WikidataSearchResponse;
  return json.search?.[0]?.id ?? null;
}

async function wikidataGetP18(entityId: string): Promise<string | null> {
  const url = `https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=${entityId}&property=P18&format=json`;
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`wbgetclaims HTTP ${res.status}`);
  const json = (await res.json()) as WikidataClaimsResponse;
  return json.claims?.P18?.[0]?.mainsnak?.datavalue?.value ?? null;
}

interface CommonsImageInfo {
  downloadUrl: string;
  licenseShort?: string;
  licenseCode?: string;
  licenseUrl?: string;
  artist: string;
  descPage: string;
}

async function getCommonsImageInfo(
  filename: string,
): Promise<CommonsImageInfo | null> {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(
    `File:${filename}`,
  )}&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1200&format=json`;
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`imageinfo HTTP ${res.status}`);
  const json = (await res.json()) as CommonsQueryResponse;
  const pages = json.query?.pages;
  if (!pages) return null;
  const page = Object.values(pages)[0];
  const ii = page?.imageinfo?.[0];
  if (!ii) return null;
  const em = ii.extmetadata ?? {};

  const downloadUrl = ii.thumburl || ii.url;
  if (!downloadUrl) return null;

  const licenseShort: string | undefined = em.LicenseShortName?.value;
  const licenseCode: string | undefined = em.License?.value;
  const licenseUrl: string | undefined = em.LicenseUrl?.value;
  const artistHtml: string | undefined = em.Artist?.value;
  const artist = artistHtml ? stripHtml(artistHtml) : '';

  return {
    downloadUrl,
    licenseShort,
    licenseCode,
    licenseUrl,
    artist: artist || 'Wikimedia Commons',
    descPage: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(
      filename,
    )}`,
  };
}

async function fetchImage(url: string): Promise<Buffer> {
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function processImage(buf: Buffer): Promise<Buffer> {
  const meta = await sharp(buf).metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;

  let pipeline = sharp(buf);

  if (w > 0 && w < UPSCALE_THRESHOLD) {
    pipeline = pipeline.resize(w * 2, h > 0 ? h * 2 : undefined, {
      kernel: sharp.kernel.lanczos3,
    });
  } else if (w > MAX_WIDTH) {
    pipeline = pipeline.resize(MAX_WIDTH, undefined, {
      kernel: sharp.kernel.lanczos3,
    });
  }

  pipeline = pipeline.sharpen({ sigma: 1.2, m1: 0.5, m2: 2.5 });

  return pipeline.webp({ quality: WEBP_QUALITY }).toBuffer();
}

async function tryCandidate(
  candidate: Candidate,
): Promise<{ info: CommonsImageInfo } | null> {
  await sleep(DELAY_MS);
  const entityId = await wikidataSearchEntity(candidate.name);
  if (!entityId) return null;

  await sleep(DELAY_MS);
  const filename = await wikidataGetP18(entityId);
  if (!filename) return null;

  await sleep(DELAY_MS);
  const info = await getCommonsImageInfo(filename);
  if (!info) return null;

  if (!isFreeLicense(info.licenseCode, info.licenseShort)) {
    return null;
  }

  return { info };
}

async function main() {
  const species: Species[] = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));

  let filled = 0;
  let skipped = 0;
  const skippedNames: string[] = [];

  for (let idx = 0; idx < species.length; idx++) {
    const s = species[idx];
    if (s.photos.length > 0) continue;

    try {
      const candidates = buildCandidates(s);
      if (candidates.length === 0) {
        console.log(`[${idx}] ${s.jaName}: 使用可能な学名なし。スキップ`);
        skipped++;
        skippedNames.push(s.jaName);
        continue;
      }

      let matched: { candidate: Candidate; info: CommonsImageInfo } | null =
        null;

      for (const candidate of candidates) {
        try {
          const result = await tryCandidate(candidate);
          if (result) {
            matched = { candidate, info: result.info };
            break;
          }
        } catch (e) {
          console.warn(`  ✗ ${s.jaName} candidate "${candidate.name}": ${e}`);
        }
      }

      if (!matched) {
        console.log(
          `[${idx}] ${s.jaName}: 画像が見つからず（候補: ${candidates
            .map((c) => c.name)
            .join(', ')}）`,
        );
        skipped++;
        skippedNames.push(s.jaName);
        continue;
      }

      const { candidate, info } = matched;
      const dir = path.join(PUBLIC_DIR, s.id);
      fs.mkdirSync(dir, { recursive: true });
      const localFsPath = path.join(dir, '0.webp');
      const localPath = `/images/species/${s.id}/0.webp`;

      if (!fs.existsSync(localFsPath)) {
        const raw = await fetchImage(info.downloadUrl);
        const processed = await processImage(raw);
        fs.writeFileSync(localFsPath, processed);
      }

      s.photos = [localPath];
      const credit: PhotoCredit = {
        source: 'wikimedia',
        credit: info.artist,
        license: info.licenseShort,
        licenseUrl: info.licenseUrl,
        sourceUrl: info.descPage,
      };
      s.photoCredits = { ...(s.photoCredits || {}), [localPath]: credit };

      filled++;
      console.log(
        `[${idx}] ${s.jaName}: ${candidate.label}「${candidate.name}」で取得 (${
          info.licenseShort || info.licenseCode || '不明ライセンス'
        })`,
      );
    } catch (e) {
      console.error(`  ✗✗ ${s.jaName}: ${e}`);
      skipped++;
      skippedNames.push(s.jaName);
    }
  }

  fs.writeFileSync(DATA_PATH, JSON.stringify(species, null, 2));

  console.log(`\n完了: ${filled} 件取得, ${skipped} 件スキップ`);
  if (skippedNames.length > 0) {
    console.log('スキップした種:');
    for (const n of skippedNames) console.log(`  - ${n}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
