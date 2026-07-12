import { Box, Button, Text } from '@chakra-ui/react';
import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';

export default function SpeciesNotFound() {
  return (
    <main>
      <PageHeader
        title="種が見つかりません"
        backHref="/"
        backLabel="← 一覧に戻る"
      />
      <Box className="page-content" textAlign="center" py={20}>
        <Text color="gray.600" mb={6}>
          指定された種のデータは存在しないか、削除された可能性があります。
        </Text>
        <Button asChild colorPalette="green">
          <Link href="/">一覧に戻る</Link>
        </Button>
      </Box>
    </main>
  );
}
