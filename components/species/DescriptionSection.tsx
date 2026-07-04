'use client';

import { Box, Separator, Text } from '@chakra-ui/react';
import { splitMorphology } from '@/lib/description';
import type { SpeciesDescription } from '@/lib/types';

type DisplayKey = keyof SpeciesDescription | 'identification';

const SECTIONS: {
  key: DisplayKey;
  label: string;
  icon: string;
}[] = [
  { key: 'morphology', label: '形態', icon: '📏' },
  { key: 'identification', label: '見分け方・特徴', icon: '🔍' },
  { key: 'habitat', label: '生息環境', icon: '🌳' },
  { key: 'impact', label: '影響', icon: '⚠️' },
  { key: 'control', label: '防除方法', icon: '🛡️' },
];

interface Props {
  description: SpeciesDescription;
}

export default function DescriptionSection({ description }: Props) {
  const { morphology, identification } = splitMorphology(
    description.morphology,
  );
  const display: Partial<Record<DisplayKey, string>> = {
    ...description,
    morphology,
    identification,
  };
  const entries = SECTIONS.filter(({ key }) => display[key]);
  if (entries.length === 0) return null;

  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="gray.300"
      rounded="xl"
      overflow="hidden"
    >
      {entries.map(({ key, label, icon }, i) => (
        <Box key={key}>
          {i > 0 && <Separator />}
          <Box px={4} py={3} borderLeftWidth="3px" borderLeftColor="green.600">
            <Text fontSize="sm" fontWeight="700" color="gray.800" mb={1}>
              {icon} {label}
            </Text>
            <Text fontSize="sm" color="gray.900" lineHeight="1.7">
              {display[key]}
            </Text>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
