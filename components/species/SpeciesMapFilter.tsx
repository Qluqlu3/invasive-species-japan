'use client';

import { Box, Button, Text } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { aggregatePrefectureStatus } from '@/lib/species-filter';
import { ALL_PREFECTURES, STATUS_COLORS, STATUS_PRIORITY } from '@/lib/types';
import JapanMap, { MAP_EMPTY_COLOR } from './JapanMap';
import MapLegend from './MapLegend';

const STATUS_LEGEND_ITEMS = STATUS_PRIORITY.map((st) => ({
  label: st,
  color: STATUS_COLORS[st],
}));

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
      result[p] = status ? STATUS_COLORS[status] : MAP_EMPTY_COLOR;
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
          <MapLegend
            items={STATUS_LEGEND_ITEMS}
            emptyLabel="該当なし"
            gap={3}
            wrap="wrap"
            justify="center"
            mt={3}
          />
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
