'use client';

import { Box, Flex, Input, NativeSelect, Text } from '@chakra-ui/react';
import { ALL_PREFECTURES, CATEGORIES, STATUSES } from '@/lib/types';

interface Props {
  query: string;
  category: string;
  conditional: 'all' | 'yes' | 'no';
  status: string;
  prefecture: string;
  sort: string;
  count: number;
  onQueryChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onConditionalChange: (v: 'all' | 'yes' | 'no') => void;
  onStatusChange: (v: string) => void;
  onPrefectureChange: (v: string) => void;
  onSortChange: (v: string) => void;
}

export default function SpeciesFilterBar({
  query,
  category,
  conditional,
  status,
  prefecture,
  sort,
  count,
  onQueryChange,
  onCategoryChange,
  onConditionalChange,
  onStatusChange,
  onPrefectureChange,
  onSortChange,
}: Props) {
  return (
    <Box
      position="sticky"
      top={0}
      zIndex={10}
      bg="gray.100/90"
      backdropFilter="blur(8px)"
      borderBottomWidth="1px"
      borderColor="gray.300"
      px={4}
      py={3}
    >
      <Flex wrap="wrap" gap={3} align="center">
        <Input
          type="search"
          placeholder="和名・学名・科・目で検索"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          size="sm"
          w={64}
          rounded="lg"
        />
        <NativeSelect.Root size="sm" w="auto">
          <NativeSelect.Field
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            rounded="lg"
            cursor="pointer"
          >
            <option value="">分類群: すべて</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
        <NativeSelect.Root size="sm" w="auto">
          <NativeSelect.Field
            value={conditional}
            onChange={(e) =>
              onConditionalChange(e.target.value as 'all' | 'yes' | 'no')
            }
            rounded="lg"
            cursor="pointer"
          >
            <option value="all">指定区分: すべて</option>
            <option value="no">特定外来生物のみ</option>
            <option value="yes">条件付特定外来生物のみ</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
        <NativeSelect.Root size="sm" w="auto">
          <NativeSelect.Field
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            rounded="lg"
            cursor="pointer"
          >
            <option value="">定着状況: すべて</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
        <NativeSelect.Root size="sm" w="auto">
          <NativeSelect.Field
            value={prefecture}
            onChange={(e) => onPrefectureChange(e.target.value)}
            rounded="lg"
            cursor="pointer"
          >
            <option value="">都道府県: すべて</option>
            {ALL_PREFECTURES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
        <NativeSelect.Root size="sm" w="auto">
          <NativeSelect.Field
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            rounded="lg"
            cursor="pointer"
          >
            <option value="">並び順: デフォルト</option>
            <option value="name">名前順</option>
            <option value="category">分類群順</option>
            <option value="status">定着状況順</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
        <Text fontSize="sm" fontWeight="medium" color="gray.800" ml="auto">
          {count} 件
        </Text>
      </Flex>
    </Box>
  );
}
