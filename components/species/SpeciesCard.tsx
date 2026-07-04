'use client';

import { Badge, Box, LinkBox, LinkOverlay, Text } from '@chakra-ui/react';
import Image from 'next/image';
import NextLink from 'next/link';
import { isHazardous } from '@/lib/description';
import type { Category, Species } from '@/lib/types';

const CATEGORY_EMOJI: Record<Category, string> = {
  哺乳類: '🦊',
  鳥類: '🐦',
  爬虫類: '🦎',
  両生類: '🐸',
  魚類: '🐟',
  昆虫類: '🪲',
  甲殻類: '🦀',
  'クモ・サソリ類': '🕷️',
  軟体動物等: '🐌',
  植物: '🌿',
};

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
      borderColor="gray.300"
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
            fontSize="4xl"
          >
            {CATEGORY_EMOJI[s.category as Category] ?? '?'}
          </Box>
        )}
        {s.isConditional && (
          <Badge
            position="absolute"
            top={1}
            right={1}
            colorPalette="orange"
            variant="solid"
            fontWeight="bold"
            size="sm"
          >
            条件付
          </Badge>
        )}
        {isHazardous(s.description) && (
          <Badge
            position="absolute"
            top={1}
            left={1}
            colorPalette="purple"
            variant="solid"
            fontWeight="bold"
            size="sm"
            title="人体に害のある毒性についての記載があります"
          >
            ☠ 毒
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
        <Text fontSize="xs" color="gray.600" truncate fontStyle="italic">
          {s.scientificName}
        </Text>
        <Text fontSize="xs" color="gray.700" mt={0.5}>
          {s.category}
        </Text>
      </Box>
    </LinkBox>
  );
}
