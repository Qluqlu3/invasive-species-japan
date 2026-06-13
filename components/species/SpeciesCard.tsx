'use client';

import { Badge, Box, LinkBox, LinkOverlay, Text } from '@chakra-ui/react';
import Image from 'next/image';
import NextLink from 'next/link';
import type { Species } from '@/lib/types';

interface Props {
  species: Species;
}

export default function SpeciesCard({ species: s }: Props) {
  return (
    <LinkBox
      as="article"
      rounded="xl"
      overflow="hidden"
      borderWidth="1px"
      borderColor="gray.200"
      bg="white"
      transition="all 0.2s"
      _hover={{ borderColor: 'green.400', shadow: 'md' }}
    >
      <Box position="relative" aspectRatio="1 / 1" bg="gray.100">
        {s.photos[0] ? (
          <Image
            src={s.photos[0]}
            alt={s.jaName}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            h="full"
            color="gray.300"
            fontSize="3xl"
          >
            ?
          </Box>
        )}
        {s.isConditional && (
          <Badge
            position="absolute"
            top={1}
            right={1}
            colorPalette="orange"
            size="sm"
          >
            条件付
          </Badge>
        )}
      </Box>
      <Box p={2}>
        <LinkOverlay asChild>
          <NextLink href={`/species/${s.id}`}>
            <Text fontSize="sm" fontWeight="medium" color="gray.900" truncate>
              {s.jaName}
            </Text>
          </NextLink>
        </LinkOverlay>
        <Text fontSize="xs" color="gray.400" truncate fontStyle="italic">
          {s.scientificName}
        </Text>
        <Text fontSize="xs" color="gray.500" mt={0.5}>
          {s.category}
        </Text>
      </Box>
    </LinkBox>
  );
}
