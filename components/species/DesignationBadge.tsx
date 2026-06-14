'use client';

import { Badge, Box, Flex, Link, Text } from '@chakra-ui/react';

interface Props {
  isConditional: boolean;
}

const DESIGNATION = {
  conditional: {
    label: '条件付特定外来生物',
    colorPalette: 'orange',
    bg: 'orange.50',
    borderColor: 'orange.200',
    description:
      '学術研究・防除など特定の目的に限り、主務大臣の許可を得た場合のみ取り扱い可能な外来生物。無許可での飼養・運搬・輸入などは禁止。',
    url: 'https://www.env.go.jp/nature/intro/2outline/regulation.html',
  },
  designated: {
    label: '特定外来生物',
    colorPalette: 'red',
    bg: 'red.50',
    borderColor: 'red.200',
    description:
      '生態系・人体・農林水産業への被害を防ぐため、飼養・栽培・保管・運搬・輸入・野外放出などが原則禁止される外来生物。',
    url: 'https://www.env.go.jp/nature/intro/2outline/regulation.html',
  },
};

export default function DesignationBadge({ isConditional }: Props) {
  const d = isConditional ? DESIGNATION.conditional : DESIGNATION.designated;

  return (
    <Box
      bg={d.bg}
      borderWidth="1px"
      borderColor={d.borderColor}
      rounded="xl"
      px={5}
      py={4}
    >
      <Flex justify="space-between" align="flex-start" gap={4}>
        <Box>
          <Badge colorPalette={d.colorPalette} size="lg" mb={2}>
            {d.label}
          </Badge>
          <Text fontSize="sm" color="gray.700" lineHeight="tall">
            {d.description}
          </Text>
        </Box>
        <Link
          href={d.url}
          target="_blank"
          rel="noopener noreferrer"
          flexShrink={0}
          title="環境省による解説ページを開く"
        >
          <Flex
            w={6}
            h={6}
            rounded="full"
            borderWidth="1px"
            borderColor="gray.400"
            align="center"
            justify="center"
            fontSize="xs"
            color="gray.500"
            _hover={{ borderColor: 'gray.600', color: 'gray.700' }}
          >
            ?
          </Flex>
        </Link>
      </Flex>
    </Box>
  );
}
