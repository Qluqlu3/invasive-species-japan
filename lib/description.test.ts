import { describe, expect, it } from 'vitest';
import { isHazardous, isMeaningful, splitMorphology } from './description';

describe('isMeaningful', () => {
  it('undefinedはfalse', () => {
    expect(isMeaningful(undefined)).toBe(false);
  });

  it('空文字・空白のみはfalse', () => {
    expect(isMeaningful('')).toBe(false);
    expect(isMeaningful('   ')).toBe(false);
  });

  it.each([
    '情報整理中',
    '不明',
    '整理中',
    '-',
    '－',
    '−',
  ])('プレースホルダー値 "%s" はfalse', (value) => {
    expect(isMeaningful(value)).toBe(false);
  });

  it('前後に空白があってもプレースホルダー値と一致すればfalse', () => {
    expect(isMeaningful('  不明  ')).toBe(false);
  });

  it('実質的な内容があればtrue', () => {
    expect(isMeaningful('本州以南に広く分布する。')).toBe(true);
  });
});

describe('splitMorphology', () => {
  it('undefinedは空オブジェクトを返す', () => {
    expect(splitMorphology(undefined)).toEqual({});
  });

  it('判別ポイントを含む文が無ければmorphologyのみ返す', () => {
    const text = '体長は10cm程度。背中に模様がある。';
    expect(splitMorphology(text)).toEqual({ morphology: text });
  });

  it('判別ポイントを含む文だけをidentificationに分離する', () => {
    const text =
      '体長は10cm程度。在来種との区別が難しい場合がある。背中に模様がある。';
    const result = splitMorphology(text);
    expect(result.identification).toBe('在来種との区別が難しい場合がある。');
    expect(result.morphology).toBe('体長は10cm程度。背中に模様がある。');
  });

  it('全文が判別ポイントの場合はmorphologyがundefinedになる', () => {
    const text = '在来種との識別点は模様の有無である。';
    const result = splitMorphology(text);
    expect(result.identification).toBe(text);
    expect(result.morphology).toBeUndefined();
  });

  it('判別ポイントのキーワードは複数種類を認識する', () => {
    const text =
      '見分け方は尾の長さである。判別は容易ではない。類似した種が多い。';
    const result = splitMorphology(text);
    expect(result.morphology).toBeUndefined();
    expect(result.identification).toBe(text);
  });
});

describe('isHazardous', () => {
  it('descriptionが無ければfalse', () => {
    expect(isHazardous(undefined)).toBe(false);
  });

  it('形態・影響のどちらにも毒の記述が無ければfalse', () => {
    expect(
      isHazardous({
        morphology: '体長は10cm程度。',
        impact: '農作物を食害する。',
      }),
    ).toBe(false);
  });

  it('形態に毒の記述があればtrue', () => {
    expect(isHazardous({ morphology: '毒腺を持つ。' })).toBe(true);
  });

  it('影響に毒の記述があればtrue', () => {
    expect(isHazardous({ impact: '刺されると毒により腫れる。' })).toBe(true);
  });

  it('「無毒」のみの場合はfalse（誤検出しない）', () => {
    expect(isHazardous({ morphology: '無毒であり人体への影響はない。' })).toBe(
      false,
    );
  });

  it('「無毒」の記述があっても別箇所に毒の記述があればtrue', () => {
    expect(
      isHazardous({
        morphology: '無毒の在来種に似るが、本種は有毒である。',
      }),
    ).toBe(true);
  });

  it('防除方法（control）や生息環境等の毒の記述は対象外', () => {
    expect(isHazardous({ control: '毒餌による防除が行われる。' })).toBe(false);
  });
});
