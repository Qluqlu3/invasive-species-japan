import { describe, expect, it } from 'vitest';
import { renderWithChakra, screen } from '@/components/test-utils';
import HiariHotlineNotice, {
  shouldShowHiariHotline,
} from './HiariHotlineNotice';

describe('shouldShowHiariHotline', () => {
  it.each([
    'solenopsis',
    'solenopsis-2',
    'solenopsis-3',
    'solenopsis-4',
    'solenopsis-5',
    'solenopsis-geminata',
    'wasmannia-auropunctata',
  ])('%s は対象種としてtrueを返す', (id) => {
    expect(shouldShowHiariHotline(id)).toBe(true);
  });

  it('対象外の種はfalseを返す', () => {
    expect(shouldShowHiariHotline('procyon-lotor')).toBe(false);
  });
});

describe('HiariHotlineNotice', () => {
  it('相談ダイヤルの電話番号を表示する', () => {
    renderWithChakra(<HiariHotlineNotice />);
    expect(screen.getByText('0570-046-110')).toBeInTheDocument();
  });

  it('tel:リンクが正しい電話番号を指す', () => {
    renderWithChakra(<HiariHotlineNotice />);
    const link = screen.getByRole('link', { name: '0570-046-110' });
    expect(link).toHaveAttribute('href', 'tel:0570046110');
  });
});
