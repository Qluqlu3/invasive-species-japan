import { Box, Flex, type FlexProps, Text } from '@chakra-ui/react';
import { MAP_EMPTY_COLOR } from './JapanMap';

interface LegendItem {
  label: string;
  color: string;
}

interface Props extends FlexProps {
  items: LegendItem[];
  /** 末尾に置く「該当なし」系の項目のラベル（地図の未着色と同じ色で表示する） */
  emptyLabel: string;
}

function LegendSwatch({
  label,
  color,
  bordered,
}: LegendItem & { bordered?: boolean }) {
  return (
    <Flex align="center" gap={1.5}>
      <Box
        w={3}
        h={3}
        bg={color}
        rounded="sm"
        borderWidth={bordered ? '1px' : undefined}
        borderColor={bordered ? 'gray.300' : undefined}
      />
      <Text fontSize="xs" fontWeight="medium" color="gray.700">
        {label}
      </Text>
    </Flex>
  );
}

/** JapanMapの塗り分けの凡例 */
export default function MapLegend({ items, emptyLabel, ...flexProps }: Props) {
  return (
    <Flex align="center" {...flexProps}>
      {items.map((item) => (
        <LegendSwatch key={item.label} {...item} />
      ))}
      <LegendSwatch label={emptyLabel} color={MAP_EMPTY_COLOR} bordered />
    </Flex>
  );
}
