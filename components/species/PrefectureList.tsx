'use client';

import { Badge, Box, Flex, Heading, Text } from '@chakra-ui/react';
import { ALL_PREFECTURES } from '@/lib/types';
import JapanMap from './JapanMap';

interface Props {
  prefectures: string[];
}

export default function PrefectureList({ prefectures }: Props) {
  return (
    <Box
      bg="white"
      rounded="xl"
      borderWidth="1px"
      borderColor="gray.200"
      overflow="hidden"
    >
      <Heading
        size="xs"
        fontWeight="semibold"
        color="gray.500"
        textTransform="uppercase"
        letterSpacing="wide"
        px={5}
        py={3}
        borderBottomWidth="1px"
        borderColor="gray.100"
      >
        国内分布 ({prefectures.length} 都道府県)
      </Heading>

      <Box px={3} pt={3} pb={1}>
        <JapanMap highlightedPrefectures={prefectures} />
        <Flex gap={4} px={2} py={2} align="center">
          <Flex align="center" gap={1.5}>
            <Box w={3} h={3} bg="#16a34a" rounded="sm" />
            <Text fontSize="xs" color="gray.500">
              生息確認
            </Text>
          </Flex>
          <Flex align="center" gap={1.5}>
            <Box
              w={3}
              h={3}
              bg="#e5e7eb"
              rounded="sm"
              borderWidth="1px"
              borderColor="gray.300"
            />
            <Text fontSize="xs" color="gray.500">
              記録なし
            </Text>
          </Flex>
        </Flex>
      </Box>

      {prefectures.length > 0 ? (
        <Flex
          px={5}
          py={3}
          wrap="wrap"
          gap={1.5}
          borderTopWidth="1px"
          borderColor="gray.100"
        >
          {ALL_PREFECTURES.filter((p) => prefectures.includes(p)).map((p) => (
            <Badge
              key={p}
              colorPalette="green"
              variant="subtle"
              size="sm"
              px={2}
              py={1}
              rounded="full"
              fontSize="xs"
            >
              {p}
            </Badge>
          ))}
        </Flex>
      ) : (
        <Text px={5} py={4} fontSize="sm" color="gray.400">
          分布データなし
        </Text>
      )}
    </Box>
  );
}
