'use client';

import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  defineConfig,
} from '@chakra-ui/react';

const config = defineConfig({
  globalCss: {
    body: {
      bg: 'gray.100',
      color: 'gray.900',
    },
  },
});

const system = createSystem(defaultConfig, config);

export function Providers({ children }: { children: React.ReactNode }) {
  return <ChakraProvider value={system}>{children}</ChakraProvider>;
}
