import { describe, expect, it } from 'vitest';
import { parseFilters, toParamValue } from './useSpeciesListParams';

describe('parseFilters', () => {
  it('パラメータが無い場合は既定値になる', () => {
    expect(parseFilters(new URLSearchParams())).toEqual({
      query: '',
      category: '',
      conditional: 'all',
      status: '',
      prefecture: '',
      sort: '',
      favoriteOnly: false,
      hazardousOnly: false,
      photoOnly: false,
    });
  });

  it('URLのパラメータ名から各条件を復元する', () => {
    const filters = parseFilters(
      new URLSearchParams(
        'q=アライグマ&category=哺乳類&conditional=yes&status=定着&prefecture=東京&sort=name&favorite=1&hazardous=1&photo=1',
      ),
    );
    expect(filters).toEqual({
      query: 'アライグマ',
      category: '哺乳類',
      conditional: 'yes',
      status: '定着',
      prefecture: '東京',
      sort: 'name',
      favoriteOnly: true,
      hazardousOnly: true,
      photoOnly: true,
    });
  });

  it('conditionalに未知の値が来た場合はallとして扱う', () => {
    expect(
      parseFilters(new URLSearchParams('conditional=foo')).conditional,
    ).toBe('all');
  });

  it('フラグは"1"の場合だけ真になる', () => {
    expect(
      parseFilters(new URLSearchParams('favorite=true')).favoriteOnly,
    ).toBe(false);
  });
});

describe('toParamValue', () => {
  it('真偽値は"1"/空文字に変換する', () => {
    expect(toParamValue(true)).toBe('1');
    expect(toParamValue(false)).toBe('');
  });

  it('"all"は空文字（パラメータ削除）に変換する', () => {
    expect(toParamValue('all')).toBe('');
  });

  it('それ以外の文字列はそのまま返す', () => {
    expect(toParamValue('東京')).toBe('東京');
    expect(toParamValue('')).toBe('');
  });
});
