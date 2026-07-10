'use client';

import { Box, Flex, Link, Text } from '@chakra-ui/react';
import Image from 'next/image';
import { useState } from 'react';
import type { PhotoCredit } from '@/lib/types';

interface Props {
  photos: string[];
  name: string;
  credits?: Record<string, PhotoCredit>;
}

export default function PhotoGallery({ photos, name, credits }: Props) {
  const [selected, setSelected] = useState(0);
  const credit = credits?.[photos[selected]];

  return (
    <Box spaceY={2}>
      <Box
        position="relative"
        w="full"
        aspectRatio="4 / 3"
        rounded="xl"
        overflow="hidden"
        bg="gray.100"
      >
        <Image
          src={photos[selected]}
          alt={name}
          fill
          sizes="(max-width: 896px) 100vw, 896px"
          style={{ objectFit: 'contain' }}
          priority
        />
      </Box>
      {credit && (
        <Text fontSize="xs" color="gray.500" mt={1}>
          出典:{' '}
          {credit.sourceUrl ? (
            <Link
              href={credit.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {credit.credit}
            </Link>
          ) : (
            credit.credit
          )}
          {credit.license && (
            <>
              {' / '}
              {credit.licenseUrl ? (
                <Link
                  href={credit.licenseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {credit.license}
                </Link>
              ) : (
                credit.license
              )}
            </>
          )}
        </Text>
      )}
      {photos.length > 1 && (
        <Flex gap={2} overflowX="auto" pb={1}>
          {photos.map((url, i) => (
            <Box
              key={i}
              as="button"
              onClick={() => setSelected(i)}
              position="relative"
              flexShrink={0}
              w={16}
              h={16}
              rounded="lg"
              overflow="hidden"
              cursor="pointer"
              borderWidth="2px"
              borderColor={i === selected ? 'green.600' : 'transparent'}
              transition="border-color 0.15s"
              _hover={{
                borderColor: i === selected ? 'green.600' : 'gray.300',
              }}
            >
              <Image
                src={url}
                alt={`${name} ${i + 1}`}
                fill
                sizes="64px"
                style={{ objectFit: 'cover' }}
              />
            </Box>
          ))}
        </Flex>
      )}
    </Box>
  );
}
