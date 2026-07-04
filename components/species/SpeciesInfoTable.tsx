'use client';

import { Box, Flex, Heading, Link, Separator, Text } from '@chakra-ui/react';
import type { Species } from '@/lib/types';

interface Props {
  species: Species;
}

const rows = (s: Species): [string, string | undefined][] => [
  ['分類群', s.category],
  ['目', s.order],
  ['科', s.family],
  ['属', s.genus],
  ['定着状況', s.status],
];

export default function SpeciesInfoTable({ species: s }: Props) {
  return (
    <Box
      bg="white"
      rounded="xl"
      borderWidth="1px"
      borderColor="gray.300"
      overflow="hidden"
    >
      <Heading
        size="xs"
        fontWeight="semibold"
        color="gray.700"
        textTransform="uppercase"
        letterSpacing="wide"
        px={5}
        py={3}
        borderBottomWidth="1px"
        borderColor="gray.200"
      >
        基本情報
      </Heading>
      {rows(s).map(([label, value], i) => (
        <Box key={label}>
          {i > 0 && <Separator />}
          <Flex px={5} py={3} gap={4}>
            <Text
              as="dt"
              w={24}
              fontSize="sm"
              fontWeight="medium"
              color="gray.700"
              flexShrink={0}
            >
              {label}
            </Text>
            <Text as="dd" fontSize="sm" color="gray.900">
              {value || '—'}
            </Text>
          </Flex>
        </Box>
      ))}
      {s.niesUrl && (
        <Box>
          <Separator />
          <Flex px={5} py={3} gap={4}>
            <Text
              as="dt"
              w={24}
              fontSize="sm"
              fontWeight="medium"
              color="gray.700"
              flexShrink={0}
            >
              NIESリンク
            </Text>
            <Text as="dd" fontSize="sm">
              <Link
                href={s.niesUrl}
                target="_blank"
                rel="noopener noreferrer"
                color="green.700"
                _hover={{ textDecoration: 'underline' }}
              >
                NIES詳細ページ ↗
              </Link>
            </Text>
          </Flex>
        </Box>
      )}
    </Box>
  );
}
