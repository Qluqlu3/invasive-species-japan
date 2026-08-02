import { fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithChakra, screen } from '@/components/test-utils';
import type { SpeciesListItem } from '@/lib/types';
import SpeciesCard from './SpeciesCard';

function makeItem(overrides: Partial<SpeciesListItem>): SpeciesListItem {
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
    prefectures: ['東京'],
    hazardous: false,
    ...overrides,
  };
}

describe('SpeciesCard', () => {
  it('お気に入り登録済みでない場合は☆を表示する', () => {
    renderWithChakra(
      <SpeciesCard
        species={makeItem({})}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
      />,
    );
    expect(
      screen.getByRole('button', { name: 'お気に入りに追加' }),
    ).toBeInTheDocument();
  });

  it('お気に入り登録済みの場合は★を表示する', () => {
    renderWithChakra(
      <SpeciesCard
        species={makeItem({})}
        isFavorite={true}
        onToggleFavorite={vi.fn()}
      />,
    );
    expect(
      screen.getByRole('button', { name: 'お気に入りから外す' }),
    ).toBeInTheDocument();
  });

  it('お気に入りボタンをクリックするとonToggleFavoriteが種のIDで呼ばれ、ページ遷移は起きない', () => {
    const onToggleFavorite = vi.fn();
    renderWithChakra(
      <SpeciesCard
        species={makeItem({})}
        isFavorite={false}
        onToggleFavorite={onToggleFavorite}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'お気に入りに追加' }));

    expect(onToggleFavorite).toHaveBeenCalledWith('procyon-lotor');
    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
  });

  it('種名の見出しは詳細ページへのリンクになっている', () => {
    renderWithChakra(
      <SpeciesCard
        species={makeItem({})}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
      />,
    );
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/species/procyon-lotor',
    );
  });

  it('写真が無い場合はカテゴリ絵文字のプレースホルダーを表示する', () => {
    renderWithChakra(
      <SpeciesCard
        species={makeItem({ photos: [] })}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
      />,
    );
    expect(screen.getByText('🦊')).toBeInTheDocument();
  });
});
