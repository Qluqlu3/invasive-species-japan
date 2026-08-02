import { describe, expect, it } from 'vitest';
import { renderWithChakra, screen } from '@/components/test-utils';
import type { Species } from '@/lib/types';
import SpeciesInfoTable from './SpeciesInfoTable';

function makeSpecies(overrides: Partial<Species>): Species {
  return {
    id: 'procyon-lotor',
    jaName: 'アライグマ',
    scientificName: 'Procyon lotor',
    category: '哺乳類',
    order: 'ネコ目',
    family: 'アライグマ科',
    genus: 'アライグマ属',
    status: '定着',
    isConditional: false,
    photos: [],
    prefectures: [],
    ...overrides,
  };
}

describe('SpeciesInfoTable', () => {
  it('Google Newsの関連ニュースリンクを和名でURLエンコードして生成する', () => {
    renderWithChakra(<SpeciesInfoTable species={makeSpecies({})} />);
    const link = screen.getByRole('link', {
      name: 'Google Newsで「アライグマ」の関連ニュースを検索 ↗',
    });
    expect(link).toHaveAttribute(
      'href',
      'https://news.google.com/search?q=%E3%82%A2%E3%83%A9%E3%82%A4%E3%82%B0%E3%83%9E%20%E5%A4%96%E6%9D%A5%E7%A8%AE&hl=ja&gl=JP&ceid=JP:ja',
    );
  });

  it('いきものログの目撃情報リンクを表示する（深いリンクではなくトップページ）', () => {
    renderWithChakra(<SpeciesInfoTable species={makeSpecies({})} />);
    const link = screen.getByRole('link', {
      name: 'いきものログで「アライグマ」を検索 ↗',
    });
    expect(link).toHaveAttribute(
      'href',
      'https://ikilog.biodic.go.jp/LifeSearch/',
    );
  });

  it('niesUrlが無い場合はNIESリンク行を表示しない', () => {
    renderWithChakra(<SpeciesInfoTable species={makeSpecies({})} />);
    expect(screen.queryByText('NIESリンク')).not.toBeInTheDocument();
  });

  it('niesUrlがある場合はNIESリンク行を表示する', () => {
    renderWithChakra(
      <SpeciesInfoTable
        species={makeSpecies({ niesUrl: 'https://www.nies.go.jp/example' })}
      />,
    );
    const link = screen.getByRole('link', { name: 'NIES詳細ページ ↗' });
    expect(link).toHaveAttribute('href', 'https://www.nies.go.jp/example');
  });
});
