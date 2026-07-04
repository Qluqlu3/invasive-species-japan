'use client';

import { Badge, Box, Flex, Link, Text } from '@chakra-ui/react';

interface Props {
  isConditional: boolean;
  hazardous?: boolean;
}

const DESIGNATION = {
  conditional: {
    label: '⚠ 条件付特定外来生物',
    colorPalette: 'orange',
    bg: 'orange.100',
    borderColor: 'orange.400',
    description:
      '学術研究・防除など特定の目的に限り、主務大臣の許可を得た場合のみ取り扱い可能な外来生物。無許可での飼養・運搬・輸入などは禁止。',
    url: 'https://www.env.go.jp/nature/intro/1law/regulation.html',
  },
  designated: {
    label: '⚠ 特定外来生物',
    colorPalette: 'red',
    bg: 'red.100',
    borderColor: 'red.400',
    description:
      '生態系・人体・農林水産業への被害を防ぐため、飼養・栽培・保管・運搬・輸入・野外放出などが原則禁止される外来生物。',
    url: 'https://www.env.go.jp/nature/intro/1law/regulation.html',
  },
};

export default function DesignationBadge({ isConditional, hazardous }: Props) {
  const d = isConditional ? DESIGNATION.conditional : DESIGNATION.designated;

  return (
    <Box
      position="relative"
      bg={d.bg}
      borderWidth="2px"
      borderColor={d.borderColor}
      rounded="xl"
      px={5}
      py={4}
    >
      <Link
        href={d.url}
        target="_blank"
        rel="noopener noreferrer"
        position="absolute"
        top={2}
        right={2}
        title="環境省による解説ページを開く"
      >
        <Flex
          w={6}
          h={6}
          rounded="full"
          borderWidth="1px"
          borderColor="gray.500"
          align="center"
          justify="center"
          fontSize="xs"
          fontWeight="bold"
          color="gray.700"
          _hover={{ borderColor: 'gray.800', color: 'gray.900' }}
        >
          ?
        </Flex>
      </Link>
      <Flex wrap="wrap" gap={2} mb={2}>
        <Badge
          colorPalette={d.colorPalette}
          variant="solid"
          size="lg"
          fontWeight="bold"
        >
          {d.label}
        </Badge>
        {hazardous && (
          <Badge
            colorPalette="purple"
            variant="solid"
            size="lg"
            fontWeight="bold"
            title="人体に害のある毒性についての記載があります"
          >
            ☠ 毒あり
          </Badge>
        )}
      </Flex>
      <Box overflowX="auto" pr={{ base: 0, md: 8 }}>
        <Text
          fontSize="sm"
          fontWeight="medium"
          color="gray.900"
          lineHeight="tall"
          whiteSpace={{ base: 'normal', md: 'nowrap' }}
        >
          {d.description}
        </Text>
      </Box>
    </Box>
  );
}
