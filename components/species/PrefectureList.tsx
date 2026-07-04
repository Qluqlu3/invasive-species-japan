'use client';

import { Badge, Box, Flex, Heading, Text } from '@chakra-ui/react';
import { prefectureUnitLabel, REGIONS } from '@/lib/types';
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
        国内分布 ({prefectures.length}
        {prefectureUnitLabel(prefectures)})
      </Heading>

      <Box px={1} pt={3} pb={1}>
        <JapanMap highlightedPrefectures={prefectures} />
        <Flex gap={4} px={2} py={2} align="center">
          <Flex align="center" gap={1.5}>
            <Box w={3} h={3} bg="#16a34a" rounded="sm" />
            <Text fontSize="xs" fontWeight="medium" color="gray.700">
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
            <Text fontSize="xs" fontWeight="medium" color="gray.700">
              記録なし
            </Text>
          </Flex>
        </Flex>
      </Box>

      {prefectures.length > 0 ? (
        <Box
          px={5}
          py={3}
          borderTopWidth="1px"
          borderColor="gray.200"
          display="flex"
          flexDirection="column"
          gap={3}
        >
          {REGIONS.map((region) => {
            const matched = region.prefectures.filter((p) =>
              prefectures.includes(p),
            );
            if (matched.length === 0) return null;
            return (
              <Flex key={region.name} align="baseline" gap={3} wrap="wrap">
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  color="gray.600"
                  w={16}
                  flexShrink={0}
                >
                  {region.name}
                </Text>
                <Flex wrap="wrap" gap={2}>
                  {matched.map((p) => (
                    <Badge
                      key={p}
                      colorPalette="green"
                      variant="subtle"
                      size="lg"
                      px={3}
                      py={1.5}
                      rounded="full"
                      fontSize="sm"
                      fontWeight="medium"
                    >
                      {p}
                    </Badge>
                  ))}
                </Flex>
              </Flex>
            );
          })}
        </Box>
      ) : (
        <Text px={5} py={4} fontSize="sm" color="gray.600">
          分布データなし
        </Text>
      )}
    </Box>
  );
}
