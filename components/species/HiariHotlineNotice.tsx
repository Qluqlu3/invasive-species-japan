import { Box, Link, Text } from '@chakra-ui/react';

/** ヒアリ類（4種群+交雑種）とコカミアリ。環境省が要緊急対処特定外来生物として
 * まとめて扱っており、ヒアリ相談ダイヤルの案内対象としている種。 */
const HIARI_HOTLINE_SPECIES_IDS = new Set([
  'solenopsis',
  'solenopsis-2',
  'solenopsis-3',
  'solenopsis-4',
  'solenopsis-5',
  'solenopsis-geminata',
  'wasmannia-auropunctata',
]);

export function shouldShowHiariHotline(speciesId: string): boolean {
  return HIARI_HOTLINE_SPECIES_IDS.has(speciesId);
}

export default function HiariHotlineNotice() {
  return (
    <Box
      bg="red.50"
      borderWidth="2px"
      borderColor="red.400"
      rounded="xl"
      px={5}
      py={4}
    >
      <Text fontSize="sm" fontWeight="bold" color="red.700" mb={1}>
        ヒアリ・アカカミアリ等に似たアリを見つけたら
      </Text>
      <Text fontSize="sm" color="gray.800">
        環境省ヒアリ相談ダイヤル:{' '}
        <Link
          href="tel:0570046110"
          color="red.700"
          fontWeight="bold"
          _hover={{ textDecoration: 'underline' }}
        >
          0570-046-110
        </Link>{' '}
        （IP電話の場合: 06-7634-7300）
      </Text>
      <Text fontSize="xs" color="gray.600" mt={1}>
        通話料は発信者負担です。刺されて症状がある場合はお近くの病院にご相談ください。
      </Text>
    </Box>
  );
}
