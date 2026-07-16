# 日本の特定外来生物ビューア

環境省が指定する特定外来生物・条件付特定外来生物（168種）を閲覧できる Next.js 製の Web アプリです。

## クイックスタート

**前提条件**: Node.js 22 以上、pnpm（`corepack enable` で有効化可能）

```bash
pnpm install
pnpm dev
```

[http://localhost:3000](http://localhost:3000) を開き、特定外来生物の一覧が表示されれば起動成功です。データは `data/species.json` に同梱済みなので、この2コマンドだけで確認できます（データの再取得は任意・後述）。

### Docker で起動する場合

Node.js のセットアップ不要で、Docker だけで起動できます。

```bash
docker compose up
```

同じく [http://localhost:3000](http://localhost:3000) で確認できます。

## 画面構成

- **一覧画面**: カテゴリ・和名・学名・科・目でフィルタ＆検索
- **詳細画面**: 写真ギャラリー、基本分類情報、国内分布都道府県、NIES リンク、いきものログ検索リンク、似ている在来種との判別ポイント（対象種のみ）、防除の公示・確認・認定を受けた主体（対象種のみ）、ヒアリ類の相談ダイヤル案内（対象種のみ）

## ディレクトリ構成

```text
invasive/
├── data/
│   ├── species.json       # 収集済みデータ（168種）
│   └── meta.json          # データ最終更新日（build:data 実行時に自動生成）
├── scripts/               # データ収集スクリプト（Node.js / TypeScript）
│   ├── build-data.ts      # メインビルダー（全スクレイパーを統合実行）
│   ├── scrape-list.ts     # 環境省リストページから基本情報を取得
│   ├── scrape-photos.ts   # 環境省写真集から画像 URL を取得
│   ├── scrape-nies.ts     # NIES 侵入生物 DB から分布データを取得
│   ├── scrape-nies-map.ts # NIES GIF 分布マップをピクセル解析して分布を補完
│   ├── lookalikes-data.ts # 似ている在来種との判別ポイント（手動キュレーション、出典付き）
│   ├── apply-lookalikes.ts # lookalikes-data.ts の内容だけを再スクレイピングなしで反映
│   ├── scrape-kouji.ts    # 環境省「防除の公示一覧」から防除の主体情報を取得
│   ├── apply-kouji.ts     # scrape-kouji.ts の内容だけを反映（他のスクレイパーは再実行しない）
│   └── types.ts           # 型定義・定数
├── app/                   # App Router ページ
├── components/            # React コンポーネント
└── lib/                   # データアクセス・型定義
```

## データの再取得

ルートディレクトリで実行します（外部サイトへのリクエストがあるため数分かかります）:

```bash
pnpm build:data
```

以下の順でデータを収集・統合して `data/species.json` を更新します:

1. **環境省リストページ**（`env.go.jp`）から和名・学名・分類・定着状況を取得
2. **環境省外来種写真集**から画像 URL を取得
3. **NIES 侵入生物データベース**の TOC ページから国内分布テキストを取得
4. NIES 各詳細ページを個別にフェッチして都道府県データを補完
5. NIES の GIF 分布マップを Python/Pillow でピクセル解析してさらに補完
6. **環境省「防除の公示一覧」**から防除の公示・確認・認定を受けた主体（自治体・省庁等）を取得

GIF マップ解析には Python 3 と Pillow が必要です:

```bash
pip install Pillow
```

### 似ている在来種との判別ポイントだけを更新する場合

`scripts/lookalikes-data.ts` は環境省「特定外来生物 同定マニュアル」等から手動で転記したデータです。
再スクレイピングせずにこのデータだけを `data/species.json` に反映したい場合は以下を実行します:

```bash
pnpm apply:lookalikes
```

### 防除の公示・確認・認定情報だけを更新する場合

環境省「防除の公示一覧」は随時更新されるため、他のスクレイパーを再実行せずにこの情報だけを
最新化したい場合は以下を実行します:

```bash
pnpm apply:kouji
```

## データソース

| ソース | 利用内容 |
| ------ | -------- |
| [環境省 特定外来生物等一覧](https://www.env.go.jp/nature/intro/2outline/list.html) | 基本情報 |
| [環境省 外来種写真集](https://www.env.go.jp/nature/intro/4document/asimg.html) | 写真（クレジット: 環境省提供） |
| [NIES 侵入生物データベース](https://www.nies.go.jp/biodiversity/invasive/DB/) | 国内分布 |
| [環境省 特定外来生物 同定マニュアル](https://www.env.go.jp/nature/intro/2outline/manual.html) / [ヒアリ特設サイト](https://www.env.go.jp/nature/intro/2outline/attention/hiari.html) | 似ている在来種との判別ポイント |
| [環境省 新法に基づく防除の公示一覧](https://www.env.go.jp/nature/intro/3control/kouji.html) | 防除の公示・確認・認定を受けた主体 |
| [いきものログ](https://ikilog.biodic.go.jp/LifeSearch/) | 目撃情報検索（外部リンクのみ、深いリンクなし） |

## データの品質について

- **学名**: スクレイパーで解決できないものは手動補正マップ（`scripts/build-data.ts` 内 `SCIENTIFIC_NAME_CORRECTIONS`）で補完しています
- **学名が空のエントリ**: 「その他の〇〇科」「〇〇全種」のようなグループ指定のエントリで、単一の学名が存在しないものです
- **都道府県データ**: NIES DB のテキストおよび GIF 分布マップから自動抽出。データなし（18種）はグループエントリまたは国内未定着種です
- **写真**: 環境省提供の写真のみ（87/168種）。写真なしの種は `?` プレースホルダーを表示します
- **似ている在来種との判別ポイント**: 環境省の同定マニュアル等に「在来種」と明記された比較のみを掲載（60種）。網羅的なものではなく、実際の同定・駆除の判断には専門家・自治体への確認を案内しています
- **防除の公示・確認・認定を受けた主体**: 環境省「防除の公示一覧」を和名で突き合わせて掲載（78種、434件）。表記ゆれにより一部（255件中1件程度）は突き合わせできていません
