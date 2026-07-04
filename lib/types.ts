export interface SpeciesDescription {
  morphology?: string; // 形態
  habitat?: string; // 生息環境
  impact?: string; // 影響
  control?: string; // 防除方法
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
  prefectures: string[];
  description?: SpeciesDescription;
  niesUrl?: string;
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
