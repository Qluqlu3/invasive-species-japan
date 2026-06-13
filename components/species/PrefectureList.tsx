'use client';

import { Badge, Box, Flex, Heading, Text } from '@chakra-ui/react';
import { ALL_PREFECTURES } from '@/lib/types';

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
      {prefectures.length > 0 ? (
        <Flex px={5} py={4} wrap="wrap" gap={2}>
          {ALL_PREFECTURES.filter((p) => prefectures.includes(p)).map((p) => (
            <Badge
              key={p}
              colorPalette="green"
              variant="subtle"
              size="sm"
              px={2.5}
              py={1}
              rounded="full"
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
