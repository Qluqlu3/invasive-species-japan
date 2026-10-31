import { fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/components/test-utils';
import JapanMap, {
  MAP_EMPTY_COLOR as EMPTY,
  MAP_FOUND_COLOR as FOUND,
} from './JapanMap';

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

  it('単一種の分布表示では生息確認のある都道府県のツールチップに「生息確認」を出す', () => {
    render(<JapanMap highlightedPrefectures={['東京']} />);
    fireEvent.mouseEnter(screen.getByLabelText('東京'));
    expect(screen.getByText('生息確認')).toBeInTheDocument();

    fireEvent.mouseEnter(screen.getByLabelText('大阪'));
    expect(screen.queryByText('生息確認')).not.toBeInTheDocument();
  });

  it('hoverLabelsを指定するとツールチップにその補足テキストを出す', () => {
    render(
      <JapanMap
        prefectureColors={{ 東京: '#f59e0b' }}
        hoverLabels={{ 東京: '該当 3 種' }}
      />,
    );
    fireEvent.mouseEnter(screen.getByLabelText('東京'));
    expect(screen.getByText('該当 3 種')).toBeInTheDocument();
  });
});
