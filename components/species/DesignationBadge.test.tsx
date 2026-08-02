import { describe, expect, it } from 'vitest';
import { renderWithChakra, screen } from '@/components/test-utils';
import DesignationBadge from './DesignationBadge';

describe('DesignationBadge', () => {
  it('isConditional=falseの場合「特定外来生物」バッジを表示する', () => {
    renderWithChakra(<DesignationBadge isConditional={false} />);
    expect(screen.getByText('⚠ 特定外来生物')).toBeInTheDocument();
    expect(screen.queryByText('⚠ 条件付特定外来生物')).not.toBeInTheDocument();
  });

  it('isConditional=trueの場合「条件付特定外来生物」バッジを表示する', () => {
    renderWithChakra(<DesignationBadge isConditional={true} />);
    expect(screen.getByText('⚠ 条件付特定外来生物')).toBeInTheDocument();
  });

  it('hazardous未指定時は毒ありバッジを表示しない', () => {
    renderWithChakra(<DesignationBadge isConditional={false} />);
    expect(screen.queryByText('☠ 毒あり')).not.toBeInTheDocument();
  });

  it('hazardous=trueの場合は毒ありバッジを表示する', () => {
    renderWithChakra(<DesignationBadge isConditional={false} hazardous />);
    expect(screen.getByText('☠ 毒あり')).toBeInTheDocument();
  });
});
