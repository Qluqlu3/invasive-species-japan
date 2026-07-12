import { Box, Button, Text } from '@chakra-ui/react';
import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';

export default function NotFound() {
  return (
    <main>
      <PageHeader title="ページが見つかりません" />
      <Box className="page-content" textAlign="center" py={20}>
        <Text color="gray.600" mb={6}>
          お探しのページは存在しないか、移動した可能性があります。
        </Text>
        <Button asChild colorPalette="green">
          <Link href="/">トップに戻る</Link>
        </Button>
      </Box>
    </main>
  );
}
