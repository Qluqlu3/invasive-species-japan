'use client';

import { Box, Button, Text } from '@chakra-ui/react';
import { useEffect } from 'react';
import PageHeader from '@/components/layout/PageHeader';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main>
      <PageHeader title="エラーが発生しました" />
      <Box className="page-content" textAlign="center" py={20}>
        <Text color="gray.600" mb={6}>
          データの読み込み中に問題が発生しました。しばらくしてから再度お試しください。
        </Text>
        <Button colorPalette="green" onClick={reset}>
          再読み込み
        </Button>
      </Box>
    </main>
  );
}
