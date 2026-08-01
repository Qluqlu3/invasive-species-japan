# 日本の特定外来生物ビューア — 現状分析と今後の改善提案

作成日: 2026-08-01（コードベース調査に基づく棚卸し）

## 1. プロジェクト概要

環境省指定の特定外来生物・条件付特定外来生物（168種）を閲覧できる Next.js 16 / React 19 製 Web アプリ。
データは環境省・NIES 等のサイトから事前にスクレイピングし、`data/species.json` に静的データとして同梱。アプリ本体はそれを読み込んで一覧・検索・詳細表示するだけの構成（実行時に外部通信はしない）。

- スタック: Next.js 16 (App Router) / React 19 / Chakra UI v3 / Biome (lint+format) / Vitest
- データ収集: `scripts/` 配下の TypeScript スクレイパー群（cheerio + sharp + Python/Pillow の GIF 解析）
- デプロイ形態: Docker (`pnpm dev` を CMD にした開発モード起動)、CI は GitHub Actions

## 2. 実装済みの機能（現状で「できていること」）

### 画面
- **一覧画面** (`app/page.tsx` → `SpeciesList`)
  - 検索（和名・学名・科・目・属、300ms デバウンス）
  - フィルタ: 分類群・指定区分（特定/条件付）・定着状況・都道府県
  - ソート: 名前順・分類群順・定着状況順
  - フィルタ状態を URL クエリパラメータに同期（共有可能なリンクになる）
  - 無限スクロール（IntersectionObserver ベースの自前フック）
  - 一覧専用の軽量DTO（`SpeciesListItem`）でペイロード削減済み（詳細情報を含めない）
- **詳細画面** (`app/species/[id]/page.tsx`)
  - 写真ギャラリー（出典・ライセンス表示、`next/image` 使用済み）
  - 基本分類情報テーブル
  - 解説文（形態・生態・侵入経路・影響など、NIES 由来）
  - 似ている在来種との判別ポイント（60種、手動キュレーション + 出典リンク）
  - 国内分布都道府県（地方別グループ化バッジ + 日本地図コンポーネント）
  - 防除の公示・確認・認定を受けた主体（78種、434件）
  - ヒアリ類相談ダイヤル案内（対象種のみ）
  - いきものログ目撃情報検索への外部リンク
  - 人体に害のある種への毒マーク（形態・影響記述からキーワード判定）
  - OGP画像自動生成（一覧・詳細ページとも）
- フッターに相談・通報窓口リンク、データ最終更新日を表示
- `error.tsx` / `not-found.tsx` / `loading.tsx` 一式あり

### データパイプライン（`scripts/`）
- `scrape-list.ts`: 環境省リストページから基本情報
- `scrape-photos.ts`: 環境省写真集から画像URL
- `scrape-nies.ts` + `scrape-nies-map.ts`: NIES DB のテキスト分布 + GIF分布マップのピクセル解析
- `scrape-descriptions.ts`: NIES の解説文
- `scrape-kouji.ts` / `apply-kouji.ts`: 防除の公示一覧
- `scrape-wikimedia.ts` / `backfill-env-credits.ts`: Wikimedia Commons からの補完写真・クレジット（`build:data` の自動パイプラインには組み込まれておらず、個別コマンドで手動実行する運用）
- `download-images.ts`: 画像のローカルダウンロード + sharp でのリサイズ
- `lookalikes-data.ts` / `apply-lookalikes.ts`: 判別ポイントの手動キュレーションデータ反映
- `species-matching.ts`: 複数ソース間の種名突合ロジック（表記ゆれ吸収）
- 型定義は `lib/types.ts` に一本化済み（旧 `scripts/types.ts` から統合済み、リファクタリング履歴あり）

### テスト・CI・コード品質
- Vitest によるユニットテスト（計676行、7ファイル）
  - `lib/species-filter.test.ts`: 一覧のフィルタ・ソート・ページネーション
  - `scripts/*.test.ts`: scrape-list / scrape-nies / scrape-photos / scrape-descriptions / scrape-kouji / species-matching
- GitHub Actions CI: install → lint (Biome) → `tsc --noEmit` → test → build
- Biome の lint ルールがかなり細かく設定済み（a11y warn 込み、`noExplicitAny` error など）

### 現状のデータ品質（実データから確認、README記載の数値より進んでいる）
| 項目 | 件数 / 168種 |
|---|---|
| 写真あり | 144種（README記載の87は古い。Wikimedia補完で増加） |
| 解説文あり | 150種 |
| 似ている在来種の判別ポイント | 60種 |
| 防除の公示・確認・認定情報 | 78種（434件） |
| 都道府県分布データあり | 150種 |
| 学名が空 | 6種（グループ指定エントリ） |
| NIESリンクあり | 150種 |

**README の写真件数（87/168）は実態（144/168）と乖離しているため、要更新。**

## 3. 不足している・改善余地がある点

### コンポーネントテストが手薄
ユニットテストは `lib/species-filter.ts` とスクレイパー群のみ。`components/species/*.tsx`（14ファイル、計1358行）には一切テストがない。特に以下はロジックを含むため優先度が高い:
- `lib/description.ts`（`isHazardous` / `splitMorphology` / `isMeaningful`）— ロジックの中核だが未テスト
- `PhotoGallery`, `JapanMap`, `SpeciesInfoTable` などUIロジックを含むコンポーネント

### E2E / 統合テストが存在しない
Playwright 等は導入されておらず、フィルタ→詳細遷移→戻る、といったユーザーフローの検証はユニットテストの組み合わせに依存している。

### SEO / PWA 関連ファイルが未整備
- `sitemap.xml`（`app/sitemap.ts`）なし — 168種の詳細ページが検索エンジンに発見されにくい
- `robots.txt` なし
- `manifest.json`（PWA向け）なし

### Docker が開発モード起動のまま
`Dockerfile` の CMD が `pnpm dev`。本番相当の検証をしたい場合 `next build && next start` の本番用ステージがない（マルチステージビルドも未対応）。README や用途次第では許容範囲だが、本番運用を見据えるなら要検討。

### データ品質の細部
- 学名欠落6件・防除情報の表記ゆれによる突合漏れ（README記載: 255件中1件程度）は未解消
- 写真なし24種（168-144）はプレースホルダー絵文字表示のみ
- Wikimedia 補完スクリプトが `build:data` パイプラインに未統合で、手動実行を忘れると情報が古いまま

### 多言語対応なし
`lang="ja"` 固定。外国人観光客・研究者等の利用を想定するなら英語版の需要がありそう（環境省サイト自体は日本語のみだが、学名・分類は国際的に使える情報)。

### 検索・閲覧体験の伸びしろ
- お気に入り/ブックマーク機能なし（ローカルストレージで実装可能）
- 複合検索条件の保存・共有はURLクエリで可能だが、プリセット（例:「毒のある種だけ」）は用意されていない
- 地図から都道府県をクリックして絞り込む導線がない（`JapanMap` は詳細ページの表示専用で、一覧側にインタラクティブな地図フィルタはない）
- 一覧のソートに「写真あり優先」「毒性あり優先」等の切り口がない

### 監視・運用面
- エラーバウンダリ (`error.tsx`) はあるが `console.error` のみで外部エラートラッキング（Sentry等）との連携なし
- アクセス解析（analytics）が入っていない

## 4. 今後追加・改善すべきことの提案（優先度順）

### 優先度高（低コストで価値が大きい）
1. **README のデータ件数を実態に合わせて更新**（写真87→144など）
2. **`sitemap.xml` / `robots.txt` の追加** — Next.js の `app/sitemap.ts` で168詳細ページを機械的に列挙するだけなので実装コストは低い
3. **`lib/description.ts` にユニットテストを追加** — ロジックの核であるにもかかわらず未テストなのはリスク

### 優先度中
4. **一覧画面に都道府県クリック→フィルタのインタラクティブ地図を追加**（既存 `JapanMap` を流用可能）
5. **お気に入り機能**（localStorage、認証不要で実装できる）
6. **Wikimedia 補完スクリプトを `build:data` の自動パイプラインに統合**、もしくは README に手動実行が必要な理由と頻度を明記
7. **主要コンポーネント（PhotoGallery, SpeciesInfoTable, JapanMap）に最低限のレンダリングテストを追加**

### 優先度低（余力があれば）
8. Docker本番ビルド用のマルチステージ Dockerfile
9. Playwright 等での主要フローのE2Eテスト
10. 英語版（i18n）対応の検討
11. 学名欠落6件・表記ゆれ突合漏れの手動補正

## 5. 総評

コア機能（一覧・検索・フィルタ・詳細表示・データ収集パイプライン）は高い完成度で実装済み。直近の開発はリファクタリング（DTO導入によるペイロード削減、共通コンポーネント抽出、スクレイパーのfetch共通化）とテスト追加に向かっており、技術的負債の解消フェーズに入っている。次の一手としては、SEO対応（sitemap）とコンポーネントテストの拡充といった「地味だが効果の高い」項目から着手するのが良さそう。機能追加であれば、既存の `JapanMap` を活かしたインタラクティブ地図フィルタが最もUXへのインパクトが大きい。
