import type { SpeciesDescription } from './types';

const IDENTIFICATION_KEYWORDS = ['区別', '識別', '類似', '見分け', '判別'];
const PLACEHOLDER_VALUES = ['情報整理中', '不明', '整理中', '-', '－', '−'];

/**
 * NIES のデータには「情報整理中」「不明」など実質的に空の値が入っていることが
 * 多いため、表示する価値がある値かどうかを判定する。
 */
export function isMeaningful(text: string | undefined): text is string {
  if (!text) return false;
  const trimmed = text.trim();
  if (!trimmed) return false;
  return !PLACEHOLDER_VALUES.includes(trimmed);
}

interface SplitMorphology {
  morphology?: string;
  identification?: string;
}

/**
 * 形態の文章には類似種との見分け方に触れた一文が混在していることがある。
 * その一文だけを抜き出して別枠で見せるための分割処理。
 */
export function splitMorphology(text: string | undefined): SplitMorphology {
  if (!text) return {};

  const sentences = text.split(/(?<=[。])/).filter((s) => s.trim());
  const idSentences = sentences.filter((s) =>
    IDENTIFICATION_KEYWORDS.some((k) => s.includes(k)),
  );

  if (idSentences.length === 0) return { morphology: text };

  const restSentences = sentences.filter((s) => !idSentences.includes(s));

  return {
    morphology: restSentences.join('').trim() || undefined,
    identification: idSentences.join('').trim(),
  };
}

/**
 * 形態・影響の記述から、人体に害のある毒性（毒蛇・毒グモ・毒針・皮膚毒など）に
 * 触れているかどうかを判定する。「無毒」は除外し、防除方法欄の「毒餌」等は
 * 対象外（形態・影響のみを見る）にすることで誤検出を防ぐ。
 */
export function isHazardous(
  description: SpeciesDescription | undefined,
): boolean {
  if (!description) return false;
  const text = [description.morphology, description.impact]
    .filter(Boolean)
    .join(' ')
    .replace(/無毒/g, '');
  return text.includes('毒');
}
