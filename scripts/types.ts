export interface PhotoCredit {
  source: 'env' | 'wikimedia';
  credit: string; // 表示テキスト（例: "環境省提供" / "Andrew Mercer"）
  license?: string; // 例: "CC BY-SA 4.0"
  licenseUrl?: string;
  sourceUrl?: string; // 出典ページ（Commonsファイル説明ページ等）
}

/** 特定外来生物の型定義 */
export interface Species {
  id: string;
  jaName: string; // 和名
  scientificName: string; // 学名
  category: string; // 分類群（哺乳類, 鳥類, etc.）
  order: string; // 目
  family: string; // 科
  genus: string; // 属
  status: string; // 定着状況
  isConditional: boolean; // 条件付特定外来生物
  photos: string[]; // 画像URL（env.go.jp）
  photoCredits?: Record<string, PhotoCredit>; // 画像の出典情報（key: photos内のパス）
  prefectures: string[]; // 分布都道府県
  niesUrl?: string; // NIES詳細ページURL
}

export const CATEGORIES = [
  '哺乳類',
  '鳥類',
  '爬虫類',
  '両生類',
  '魚類',
  '昆虫類',
  '甲殻類',
  'クモ・サソリ類',
  '軟体動物等',
  '植物',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const ALL_PREFECTURES = [
  '北海道',
  '青森',
  '岩手',
  '宮城',
  '秋田',
  '山形',
  '福島',
  '茨城',
  '栃木',
  '群馬',
  '埼玉',
  '千葉',
  '東京',
  '神奈川',
  '新潟',
  '富山',
  '石川',
  '福井',
  '山梨',
  '長野',
  '岐阜',
  '静岡',
  '愛知',
  '三重',
  '滋賀',
  '京都',
  '大阪',
  '兵庫',
  '奈良',
  '和歌山',
  '鳥取',
  '島根',
  '岡山',
  '広島',
  '山口',
  '徳島',
  '香川',
  '愛媛',
  '高知',
  '福岡',
  '佐賀',
  '長崎',
  '熊本',
  '大分',
  '宮崎',
  '鹿児島',
  '沖縄',
] as const;
