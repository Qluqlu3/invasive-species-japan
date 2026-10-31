import { describe, expect, it } from 'vitest';
import { renderWithChakra, screen } from '@/components/test-utils';
import MapLegend from './MapLegend';

describe('MapLegend', () => {
  it('指定した項目の後ろに「該当なし」系の項目を並べる', () => {
    renderWithChakra(
      <MapLegend
        items={[
          { label: '定着', color: '#dc2626' },
          { label: '未定着', color: '#f59e0b' },
        ]}
        emptyLabel="該当なし"
      />,
    );
    const labels = screen
      .getAllByText(/定着|未定着|該当なし/)
      .map((el) => el.textContent);
    expect(labels).toEqual(['定着', '未定着', '該当なし']);
  });
});
