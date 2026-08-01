'use client';

import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { aggregatePrefectureStatus } from '@/lib/species-filter';
import {
  ALL_PREFECTURES,
  STATUS_COLORS,
  STATUS_PRIORITY,
  type Status,
} from '@/lib/types';
import JapanMap from './JapanMap';

const EMPTY_COLOR = '#e5e7eb';

interface Props {
  species: { status: string; prefectures: string[] }[];
  selectedPrefecture: string;
  onSelectPrefecture: (prefecture: string) => void;
}

export default function SpeciesMapFilter({
  species,
  selectedPrefecture,
  onSelectPrefecture,
}: Props) {
  const [open, setOpen] = useState(false);

  const aggregation = useMemo(
    () => aggregatePrefectureStatus(species, ALL_PREFECTURES),
    [species],
  );

  const colors = useMemo(() => {
    const result: Record<string, string> = {};
    for (const p of ALL_PREFECTURES) {
      const status = aggregation[p]?.dominantStatus;
      result[p] = status ? STATUS_COLORS[status as Status] : EMPTY_COLOR;
    }
    return result;
  }, [aggregation]);

  const hoverLabels = useMemo(() => {
    const result: Record<string, string> = {};
    for (const p of ALL_PREFECTURES) {
      const count = aggregation[p]?.count ?? 0;
      result[p] = count > 0 ? `該当 ${count} 種` : '該当なし';
    }
    return result;
  }, [aggregation]);

  return (
    <Box borderBottomWidth="1px" borderColor="gray.300" bg="white">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen((o) => !o)}
        w="full"
        justifyContent="space-between"
        rounded="none"
        px={4}
        py={2}
        fontWeight="medium"
        color="gray.700"
      >
        <Text as="span">地図から都道府県で絞り込む</Text>
        <Text as="span" fontSize="xs" color="gray.500">
          {open ? '閉じる ▲' : '開く ▼'}
        </Text>
      </Button>
      {open && (
        <Box px={4} pb={4}>
          <Box maxW="480px" mx="auto">
            <JapanMap
              prefectureColors={colors}
              selectedPrefecture={selectedPrefecture || null}
              hoverLabels={hoverLabels}
              onPrefectureClick={(p) =>
                onSelectPrefecture(p === selectedPrefecture ? '' : p)
              }
            />
          </Box>
          <Flex gap={3} wrap="wrap" justify="center" mt={3}>
            {STATUS_PRIORITY.map((st) => (
              <Flex key={st} align="center" gap={1.5}>
                <Box w={3} h={3} bg={STATUS_COLORS[st]} rounded="sm" />
                <Text fontSize="xs" fontWeight="medium" color="gray.700">
                  {st}
                </Text>
              </Flex>
            ))}
            <Flex align="center" gap={1.5}>
              <Box
                w={3}
                h={3}
                bg={EMPTY_COLOR}
                rounded="sm"
                borderWidth="1px"
                borderColor="gray.300"
              />
              <Text fontSize="xs" fontWeight="medium" color="gray.700">
                該当なし
              </Text>
            </Flex>
          </Flex>
          {selectedPrefecture && (
            <Text textAlign="center" fontSize="xs" color="gray.500" mt={2}>
              {selectedPrefecture}
              で絞り込み中・もう一度クリックすると解除されます
            </Text>
          )}
        </Box>
      )}
    </Box>
  );
}
