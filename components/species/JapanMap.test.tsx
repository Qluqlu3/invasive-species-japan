import { fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/components/test-utils';
import JapanMap from './JapanMap';

const FOUND = '#16a34a';
const EMPTY = '#e5e7eb';

describe('JapanMap', () => {
  it('highlightedPrefecturesに含まれる都道府県をFOUND色で塗る', () => {
    render(<JapanMap highlightedPrefectures={['東京', '大阪']} />);
    expect(screen.getByLabelText('東京')).toHaveAttribute('fill', FOUND);
    expect(screen.getByLabelText('大阪')).toHaveAttribute('fill', FOUND);
    expect(screen.getByLabelText('北海道')).toHaveAttribute('fill', EMPTY);
  });

  it('prefectureColorsを指定するとその色で塗り分けられる（highlightedPrefecturesより優先）', () => {
    render(
      <JapanMap
        highlightedPrefectures={['東京']}
        prefectureColors={{ 東京: '#f59e0b' }}
      />,
    );
    expect(screen.getByLabelText('東京')).toHaveAttribute('fill', '#f59e0b');
    // prefectureColorsに無い都道府県はEMPTY色にフォールバックする
    expect(screen.getByLabelText('大阪')).toHaveAttribute('fill', EMPTY);
  });

  it('selectedPrefectureは枠線で強調表示される', () => {
    render(<JapanMap highlightedPrefectures={[]} selectedPrefecture="東京" />);
    expect(screen.getByLabelText('東京')).toHaveAttribute('stroke', '#111827');
    expect(screen.getByLabelText('大阪')).toHaveAttribute('stroke', 'white');
  });

  it('都道府県クリックでonPrefectureClickが都道府県名付きで呼ばれる', () => {
    const onClick = vi.fn();
    render(
      <JapanMap highlightedPrefectures={[]} onPrefectureClick={onClick} />,
    );
    fireEvent.click(screen.getByLabelText('東京'));
    expect(onClick).toHaveBeenCalledWith('東京');
  });

  it('47都道府県すべてのpathを描画する', () => {
    const { container } = render(<JapanMap highlightedPrefectures={[]} />);
    expect(container.querySelectorAll('path')).toHaveLength(47);
  });
});
