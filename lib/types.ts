export interface SpeciesDescription {
  englishName?: string; // 英名等
  nativeRange?: string; // 自然分布
  morphology?: string; // 形態
  ecology?: string; // 生態的特性
  breeding?: string; // 繁殖生態
  habitat?: string; // 生息環境
  sourceRegion?: string; // 移入元
  pathway?: string; // 侵入経路
  invasionEra?: string; // 侵入年代
  overseasRange?: string; // 海外移入分布
  impact?: string; // 影響
  legalNote?: string; // 法的扱い
  control?: string; // 防除方法
  issues?: string; // 問題点等
  remarks?: string; // 備考
}

export interface PhotoCredit {
  source: 'env' | 'wikimedia';
  credit: string; // 表示テキスト（例: "環境省提供" / "Andrew Mercer"）
  license?: string; // 例: "CC BY-SA 4.0"
  licenseUrl?: string;
  sourceUrl?: string; // 出典ページ（Commonsファイル説明ページ等）
}

export interface DataMeta {
  lastUpdated: string; // YYYY-MM-DD（データ収集パイプラインの最終実行日）
}

export interface Lookalike {
  nativeName: string; // 似ている在来種の和名
  nativeScientificName?: string; // 学名（判明している場合）
  point: string; // 判別ポイント（出典の記述に基づく）
  sourceUrl: string; // 出典URL（環境省 同定マニュアル等）
}

export interface ControlAuthorization {
  type: string; // 公示 | 確認 | 認定
  organization: string; // 主体名（自治体・省庁・NPO等）
  region: string; // 地方区分
  area: string; // 区域
  period: string; // 期間
  objective: string; // 防除の目標
  sourceUrl: string; // 出典（環境省 防除の公示一覧）
}

export interface Species {
  id: string;
  jaName: string;
  scientificName: string;
  category: string;
  order: string;
  family: string;
  genus: string;
  status: string;
  isConditional: boolean;
  photos: string[];
  photoCredits?: Record<string, PhotoCredit>;
  prefectures: string[];
  description?: SpeciesDescription;
  niesUrl?: string;
  lookalikes?: Lookalike[];
  controlAuthorizations?: ControlAuthorization[];
}

/**
 * 一覧画面用の軽量DTO。description・lookalikes・controlAuthorizations等の
 * 詳細画面専用フィールドを持たず、代わりに毒性有無だけを事前計算して含む。
 */
export type SpeciesListItem = Pick<
  Species,
  | 'id'
  | 'jaName'
  | 'scientificName'
  | 'category'
  | 'order'
  | 'family'
  | 'genus'
  | 'status'
  | 'isConditional'
  | 'photos'
  | 'prefectures'
> & {
  hazardous: boolean;
};

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

export const STATUSES = ['定着', '未定着', '根絶', '近年生息情報なし'] as const;
export type Status = (typeof STATUSES)[number];

export const REGIONS = [
  { name: '北海道', prefectures: ['北海道'] },
  {
    name: '東北',
    prefectures: ['青森', '岩手', '宮城', '秋田', '山形', '福島'],
  },
  {
    name: '関東',
    prefectures: ['茨城', '栃木', '群馬', '埼玉', '千葉', '東京', '神奈川'],
  },
  {
    name: '中部',
    prefectures: [
      '新潟',
      '富山',
      '石川',
      '福井',
      '山梨',
      '長野',
      '岐阜',
      '静岡',
      '愛知',
    ],
  },
  {
    name: '近畿',
    prefectures: ['三重', '滋賀', '京都', '大阪', '兵庫', '奈良', '和歌山'],
  },
  { name: '中国', prefectures: ['鳥取', '島根', '岡山', '広島', '山口'] },
  { name: '四国', prefectures: ['徳島', '香川', '愛媛', '高知'] },
  {
    name: '九州・沖縄',
    prefectures: [
      '福岡',
      '佐賀',
      '長崎',
      '熊本',
      '大分',
      '宮崎',
      '鹿児島',
      '沖縄',
    ],
  },
] as const;

export const ALL_PREFECTURES = REGIONS.flatMap((r) => r.prefectures);

/**
 * 「都道府県」は実際に含まれる区分（都・道・府・県）だけで組み立てる。
 * 例: 東京が無ければ「道府県」、県しか無ければ「県」。
 */
export function prefectureUnitLabel(prefectures: string[]): string {
  const hasTo = prefectures.includes('東京');
  const hasDo = prefectures.includes('北海道');
  const hasFu = prefectures.includes('大阪') || prefectures.includes('京都');
  const hasKen = prefectures.some(
    (p) => !['東京', '北海道', '大阪', '京都'].includes(p),
  );

  const label = `${hasTo ? '都' : ''}${hasDo ? '道' : ''}${hasFu ? '府' : ''}${hasKen ? '県' : ''}`;
  return label || '都道府県';
}
