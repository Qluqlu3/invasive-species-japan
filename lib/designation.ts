/**
 * 外来生物法上の指定区分（特定外来生物 / 条件付特定外来生物）ごとの表示定義。
 * 法令上の区分名・説明文を画面ごとに書き分けて食い違わないよう、ここに集約する。
 */
export interface Designation {
  /** 区分の正式名称 */
  label: string;
  /** 一覧カード等の狭い場所で使う略称 */
  shortLabel: string;
  /** Chakra UIのカラーパレット名（バッジ・枠の色） */
  colorPalette: 'red' | 'orange';
  /** OGP画像の背景色（next/ogではChakraのトークンが使えないため色コードで持つ） */
  ogBackground: string;
  /** 区分の規制内容の説明 */
  description: string;
  /** 環境省による解説ページ */
  url: string;
}

const REGULATION_URL =
  'https://www.env.go.jp/nature/intro/1law/regulation.html';

const DESIGNATED: Designation = {
  label: '特定外来生物',
  shortLabel: '特定',
  colorPalette: 'red',
  ogBackground: '#166534',
  description:
    '生態系・人体・農林水産業への被害を防ぐため、飼養・栽培・保管・運搬・輸入・野外放出などが原則禁止される外来生物。',
  url: REGULATION_URL,
};

const CONDITIONAL: Designation = {
  label: '条件付特定外来生物',
  shortLabel: '条件付',
  colorPalette: 'orange',
  ogBackground: '#9A3412',
  description:
    '学術研究・防除など特定の目的に限り、主務大臣の許可を得た場合のみ取り扱い可能な外来生物。無許可での飼養・運搬・輸入などは禁止。',
  url: REGULATION_URL,
};

export function getDesignation(isConditional: boolean): Designation {
  return isConditional ? CONDITIONAL : DESIGNATED;
}

/** 毒性バッジのツールチップに出す補足（isHazardousの判定根拠の説明） */
export const HAZARD_NOTE = '人体に害のある毒性についての記載があります';
