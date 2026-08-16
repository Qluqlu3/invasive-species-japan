'use client';

import { Box, Flex, Text } from '@chakra-ui/react';
import Image from 'next/image';
import NextLink from 'next/link';
import type { SpeciesListItem } from '@/lib/types';

interface Props {
  species: SpeciesListItem[];
}

export default function RecentlyViewedShelf({ species }: Props) {
  if (species.length === 0) return null;

  return (
    <Box
      borderBottomWidth="1px"
      borderColor="gray.300"
      bg="white"
      px={4}
      py={3}
    >
      <Text fontSize="xs" fontWeight="medium" color="gray.600" mb={2}>
        🕓 最近見た種
      </Text>
      <Flex gap={3} overflowX="auto" pb={1}>
        {species.map((s) => (
          <NextLink
            key={s.id}
            href={`/species/${s.id}`}
            style={{ flexShrink: 0 }}
          >
            <Flex direction="column" align="center" w={16}>
              <Box
                position="relative"
                w={12}
                h={12}
                rounded="full"
                overflow="hidden"
                bg="gray.100"
                borderWidth="1px"
                borderColor="gray.200"
              >
                {s.photos[0] ? (
                  <Image
                    src={s.photos[0]}
                    alt={s.jaName}
                    fill
                    sizes="48px"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <Flex align="center" justify="center" h="full" fontSize="lg">
                    🔎
                  </Flex>
                )}
              </Box>
              <Text
                fontSize="xs"
                color="gray.700"
                mt={1}
                textAlign="center"
                truncate
                w="full"
              >
                {s.jaName}
              </Text>
            </Flex>
          </NextLink>
        ))}
      </Flex>
    </Box>
  );
}
