'use client';

import { Box, Flex } from '@chakra-ui/react';
import Image from 'next/image';
import { useState } from 'react';

interface Props {
  photos: string[];
  name: string;
}

export default function PhotoGallery({ photos, name }: Props) {
  const [selected, setSelected] = useState(0);

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
