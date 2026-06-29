'use client';

import { Box, Separator, Text } from '@chakra-ui/react';
import type { SpeciesDescription } from '@/lib/types';

const SECTIONS: { key: keyof SpeciesDescription; label: string }[] = [
  { key: 'morphology', label: '形態' },
  { key: 'habitat', label: '生息環境' },
  { key: 'impact', label: '影響' },
  { key: 'control', label: '防除方法' },
];

interface Props {
  description: SpeciesDescription;
}

export default function DescriptionSection({ description }: Props) {
  const entries = SECTIONS.filter(({ key }) => description[key]);
  if (entries.length === 0) return null;

  return (
    <Box
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="md"
      overflow="hidden"
    >
      {entries.map(({ key, label }, i) => (
        <Box key={key}>
          {i > 0 && <Separator />}
          <Box px={4} py={3}>
            <Text
              fontSize="xs"
              fontWeight="600"
              color="gray.500"
              textTransform="uppercase"
              letterSpacing="0.05em"
              mb={1}
            >
              {label}
            </Text>
            <Text fontSize="sm" color="gray.700" lineHeight="1.7">
              {description[key]}
            </Text>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
