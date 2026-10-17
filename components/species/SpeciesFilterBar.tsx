'use client';

import {
  Box,
  Button,
  Checkbox,
  Flex,
  Input,
  NativeSelect,
  Text,
} from '@chakra-ui/react';
import type {
  SetFilter,
  SpeciesListFilters,
} from '@/hooks/useSpeciesListParams';
import { ALL_PREFECTURES, CATEGORIES, STATUSES } from '@/lib/types';

interface SelectOption {
  value: string;
  label: string;
}

/** 先頭に「すべて」（空文字）を置いた選択肢を作る。値をそのまま表示ラベルにする */
function withAllOption(
  allLabel: string,
  values: readonly string[],
): SelectOption[] {
  return [
    { value: '', label: allLabel },
    ...values.map((v) => ({ value: v, label: v })),
  ];
}

const CATEGORY_OPTIONS = withAllOption('分類群: すべて', CATEGORIES);
const STATUS_OPTIONS = withAllOption('定着状況: すべて', STATUSES);
const PREFECTURE_OPTIONS = withAllOption('都道府県: すべて', ALL_PREFECTURES);

const CONDITIONAL_OPTIONS: SelectOption[] = [
  { value: 'all', label: '指定区分: すべて' },
  { value: 'no', label: '特定外来生物のみ' },
  { value: 'yes', label: '条件付特定外来生物のみ' },
];

const SORT_OPTIONS: SelectOption[] = [
  { value: '', label: '並び順: デフォルト' },
  { value: 'name', label: '名前順' },
  { value: 'category', label: '分類群順' },
  { value: 'status', label: '定着状況順' },
  { value: 'hazardous', label: '毒性あり優先' },
  { value: 'photos', label: '写真あり優先' },
];

interface FilterSelectProps<T extends string> {
  value: T;
  options: SelectOption[];
  onChange: (value: T) => void;
}

function FilterSelect<T extends string>({
  value,
  options,
  onChange,
}: FilterSelectProps<T>) {
  return (
    <NativeSelect.Root size="sm" w="auto">
      <NativeSelect.Field
        value={value}
        // optionsには型Tの値しか含めないため、選択値もTとして扱える
        onChange={(e) => onChange(e.target.value as T)}
        rounded="lg"
        cursor="pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </NativeSelect.Field>
      <NativeSelect.Indicator />
    </NativeSelect.Root>
  );
}

interface Props {
  filters: SpeciesListFilters;
  /** 入力中の検索語（URLへの反映はデバウンスされるため filters.query とは別に持つ） */
  query: string;
  count: number;
  onQueryChange: (v: string) => void;
  onFilterChange: SetFilter;
}

export default function SpeciesFilterBar({
  filters,
  query,
  count,
  onQueryChange,
  onFilterChange,
}: Props) {
  const {
    category,
    conditional,
    status,
    prefecture,
    sort,
    favoriteOnly,
    hazardousOnly,
    photoOnly,
  } = filters;

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
      <Flex wrap="wrap" gap={2} align="center" mb={2}>
        <Text fontSize="xs" color="gray.600" mr={1}>
          クイックフィルタ:
        </Text>
        <Button
          size="xs"
          rounded="full"
          variant={hazardousOnly ? 'solid' : 'outline'}
          colorPalette="purple"
          onClick={() => onFilterChange('hazardousOnly', !hazardousOnly)}
        >
          ☠ 毒のある種だけ
        </Button>
        <Button
          size="xs"
          rounded="full"
          variant={photoOnly ? 'solid' : 'outline'}
          colorPalette="green"
          onClick={() => onFilterChange('photoOnly', !photoOnly)}
        >
          📷 写真ありのみ
        </Button>
        <Button
          size="xs"
          rounded="full"
          variant={conditional === 'no' ? 'solid' : 'outline'}
          colorPalette="orange"
          onClick={() =>
            onFilterChange('conditional', conditional === 'no' ? 'all' : 'no')
          }
        >
          特定外来生物のみ
        </Button>
      </Flex>
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
        <FilterSelect
          value={category}
          options={CATEGORY_OPTIONS}
          onChange={(v) => onFilterChange('category', v)}
        />
        <FilterSelect
          value={conditional}
          options={CONDITIONAL_OPTIONS}
          onChange={(v) => onFilterChange('conditional', v)}
        />
        <FilterSelect
          value={status}
          options={STATUS_OPTIONS}
          onChange={(v) => onFilterChange('status', v)}
        />
        <FilterSelect
          value={prefecture}
          options={PREFECTURE_OPTIONS}
          onChange={(v) => onFilterChange('prefecture', v)}
        />
        <FilterSelect
          value={sort}
          options={SORT_OPTIONS}
          onChange={(v) => onFilterChange('sort', v)}
        />
        <Checkbox.Root
          checked={favoriteOnly}
          onCheckedChange={(d) => onFilterChange('favoriteOnly', !!d.checked)}
          size="sm"
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Checkbox.Label>★ お気に入りのみ</Checkbox.Label>
        </Checkbox.Root>
        <Text fontSize="sm" fontWeight="medium" color="gray.800" ml="auto">
          {count} 件
        </Text>
      </Flex>
    </Box>
  );
}
