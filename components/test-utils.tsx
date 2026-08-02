import { type RenderOptions, render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { Providers } from '@/app/providers';

/** ChakraProviderでラップしてレンダリングする（コンポーネントテスト共通のヘルパー） */
export function renderWithChakra(ui: ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: Providers, ...options });
}

export * from '@testing-library/react';
