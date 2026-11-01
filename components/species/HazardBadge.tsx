import { Badge, type BadgeProps } from '@chakra-ui/react';
import { HAZARD_NOTE } from '@/lib/designation';

/** 人体に害のある毒性の記載がある種に付けるバッジ（ラベルは表示場所に応じてchildrenで渡す） */
export default function HazardBadge(props: BadgeProps) {
  return (
    <Badge
      colorPalette="purple"
      variant="solid"
      fontWeight="bold"
      title={HAZARD_NOTE}
      {...props}
    />
  );
}
