/**
 * build-data.ts
 * 3つのスクレイパーを実行して data/species.json を生成する
 *
 * 使い方: npx ts-node scripts/build-data.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import { LOOKALIKES } from './lookalikes-data';
import { scrapeList } from './scrape-list';
import { scrapeNies, scrapeNiesDetails } from './scrape-nies';
import { scrapeGifPrefectures } from './scrape-nies-map';
import { scrapePhotos } from './scrape-photos';
import { makeId, matchNiesEntry, matchPhotos } from './species-matching';
import type { Species } from './types';

const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'species.json');
const META_PATH = path.join(__dirname, '..', 'data', 'meta.json');

/** スクレイパーで正確に抽出できない学名を手動で補正するマップ */
const SCIENTIFIC_NAME_CORRECTIONS: Record<string, string> = {
  // 哺乳類
  アムールハリネズミ: 'Erinaceus amurensis',
  クリハラリス: 'Callosciurus erythraeus',
  // 爬虫類
  ハナガメ: 'Mauremys mutica',
  // 両生類
  キューバズツキガエル: 'Osteopilus septentrionalis',
  // 魚類
  ヨーロッパナマズ: 'Silurus glanis',
  パイクパーチ: 'Sander lucioperca',
  // 甲殻類
  ウチダザリガニ: 'Pacifastacus leniusculus',
  // クモ・サソリ類
  ハイイロゴケグモ: 'Latrodectus geometricus',
  セアカゴケグモ: 'Latrodectus hasseltii',
  クロゴケグモ: 'Latrodectus mactans',
  // 軟体動物等
  カワヒバリガイ: 'Limnoperna fortunei',
  ヤマヒタチオビ: 'Euglandina rosea',
  // 植物（属名が解決できず種小名のみになるケース）
  ナガエツルノゲイトウ: 'Alternanthera philoxeroides',
  ブラジルチドメグサ: 'Hydrocotyle ranunculoides',
  ボタンウキクサ: 'Pistia stratiotes',
  'アゾラ・クリスタータ': 'Azolla cristata',
  オオキンケイギク: 'Coreopsis lanceolata',
  ミズヒマワリ: 'Gymnocoronis spilanthoides',
  ツルヒヨドリ: 'Mikania micrantha',
  オオハンゴンソウ: 'Rudbeckia laciniata',
  ナルトサワギク: 'Senecio madagascariensis',
  アレチウリ: 'Sicyos angulatus',
  ナガエモウセンゴケ: 'Drosera intermedia',
  オオフサモ: 'Myriophyllum aquaticum',
  エフクレタヌキモ: 'Utricularia inflata',
  'ルドウィギア・グランディフロラ': 'Ludwigia grandiflora',
  ビーチグラス: 'Ammophila arenaria',
  'スパルティナ・アルテルニフロラ': 'Spartina alterniflora',
  'スパルティナ・アングリカ': 'Spartina anglica',
  オオカワヂシャ: 'Veronica anagallis-aquatica',
};

async function main() {
  console.log('=== データ収集を開始 ===\n');

  // 1. 環境省リスト
  const listData = await scrapeList();
  console.log(`\n✓ リスト取得: ${listData.length} 件\n`);

  // 2. 環境省写真集
  const photoMap = await scrapePhotos();
  console.log(`\n✓ 写真取得: ${photoMap.size} 種\n`);

  // 3. NIES 分布データ
  const niesMap = await scrapeNies();
  console.log(`\n✓ NIES データ取得: ${niesMap.size} 件\n`);

  // 4. データ統合
  console.log('=== データを統合中 ===\n');
  const species: Species[] = [];
  // 重複除去のため和名セット
  const seen = new Set<string>();
  const usedIds = new Set<string>();

  for (let i = 0; i < listData.length; i++) {
    const item = listData[i];

    // 重複チェック
    if (seen.has(item.jaName)) continue;
    seen.add(item.jaName);

    // 写真マッチング（完全一致 → 正規化一致 → 部分マッチ）
    const photos = matchPhotos(item.jaName, photoMap);

    // NIES マッチング（完全一致 → 正規化一致）
    const niesEntry = matchNiesEntry(item.jaName, niesMap);

    const prefectures = niesEntry?.prefectures ?? [];
    const niesUrl = item.niesUrl ?? niesEntry?.niesDetailUrl;
    const scientificName =
      SCIENTIFIC_NAME_CORRECTIONS[item.jaName] ?? item.scientificName;

    species.push({
      id: makeId(scientificName, i, usedIds),
      jaName: item.jaName,
      scientificName,
      category: item.category,
      order: item.order,
      family: item.family,
      genus: item.genus,
      status: item.status,
      isConditional: item.isConditional,
      photos,
      prefectures,
      niesUrl,
    });
  }

  // 5. NIES詳細ページから都道府県データを補完
  const niesUrls = [
    ...new Set(species.filter((s) => s.niesUrl).map((s) => s.niesUrl!)),
  ];
  if (niesUrls.length > 0) {
    console.log(
      `\n=== NIES詳細ページから都道府県データを補完中 (${niesUrls.length}件) ===\n`,
    );
    const detailPrefMap = await scrapeNiesDetails(niesUrls);

    let improved = 0;
    for (const s of species) {
      if (!s.niesUrl) continue;
      const prefs = detailPrefMap.get(s.niesUrl);
      if (!prefs || prefs.length === 0) continue;
      const merged = [...new Set([...s.prefectures, ...prefs])];
      if (merged.length > s.prefectures.length) {
        s.prefectures = merged;
        improved++;
      }
    }
    console.log(`\n✓ 都道府県データ補完: ${improved} 種が改善\n`);
  }

  // 6. NIESのGIF分布マップから都道府県データを補完（都道府県が未取得の種）
  const speciesForGif = species.filter(
    (s) => s.niesUrl && s.prefectures.length === 0,
  );
  if (speciesForGif.length > 0) {
    console.log(
      `\n=== GIF分布マップから都道府県データを補完中 (${speciesForGif.length}件) ===\n`,
    );
    const gifUrlMap = new Map<string, string>();
    for (const s of speciesForGif) {
      gifUrlMap.set(s.jaName, s.niesUrl!);
    }
    const gifPrefMap = await scrapeGifPrefectures(gifUrlMap);

    let gifImproved = 0;
    for (const s of species) {
      const prefs = gifPrefMap.get(s.jaName);
      if (!prefs || prefs.length === 0) continue;
      const merged = [...new Set([...s.prefectures, ...prefs])];
      if (merged.length > s.prefectures.length) {
        s.prefectures = merged;
        gifImproved++;
      }
    }
    console.log(`\n✓ GIF補完: ${gifImproved} 種が改善\n`);
  }

  // 7. 似ている在来種との判別ポイントを付与（手動キュレーションデータ）
  let lookalikesAdded = 0;
  for (const s of species) {
    const lookalikes = LOOKALIKES[s.id];
    if (lookalikes) {
      s.lookalikes = lookalikes;
      lookalikesAdded++;
    }
  }
  console.log(`\n✓ 判別ポイント付与: ${lookalikesAdded} 種\n`);

  // 8. 出力
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(species, null, 2), 'utf-8');

  const now = new Date();
  const lastUpdated = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  fs.writeFileSync(
    META_PATH,
    `${JSON.stringify({ lastUpdated }, null, 2)}\n`,
    'utf-8',
  );

  console.log(`\n=== 完了 ===`);
  console.log(`出力: ${OUTPUT_PATH}`);
  console.log(`出力: ${META_PATH} (lastUpdated: ${lastUpdated})`);
  console.log(`総種数: ${species.length}`);
  console.log(`写真あり: ${species.filter((s) => s.photos.length > 0).length}`);
  console.log(
    `都道府県データあり: ${species.filter((s) => s.prefectures.length > 0).length}`,
  );
  console.log(`NIESリンクあり: ${species.filter((s) => s.niesUrl).length}`);
}

main().catch((err) => {
  console.error('エラー:', err);
  process.exit(1);
});
