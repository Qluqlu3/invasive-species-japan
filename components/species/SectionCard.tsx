import { Box, Heading, type HeadingProps } from '@chakra-ui/react';
import type { ReactNode } from 'react';

/** 詳細画面の各セクション共通の見出し（小さめ・大文字・字間広め） */
export function SectionHeading(props: HeadingProps) {
  return (
    <Heading
      as="h2"
      size="xs"
      fontWeight="semibold"
      color="gray.700"
      textTransform="uppercase"
      letterSpacing="wide"
      {...props}
    />
  );
}

interface Props {
  title: ReactNode;
  footer?: ReactNode;
  maxBodyHeight?: string;
  children: ReactNode;
}

/** 詳細画面の「ヘッダー＋区切りリスト＋出典フッター」構造を持つセクション共通の枠 */
export default function SectionCard({
  title,
  footer,
  maxBodyHeight,
  children,
}: Props) {
  return (
    <Box
      as="section"
      bg="white"
      rounded="xl"
      borderWidth="1px"
      borderColor="gray.300"
      overflow="hidden"
    >
      <SectionHeading
        px={5}
        py={3}
        borderBottomWidth="1px"
        borderColor="gray.200"
      >
        {title}
      </SectionHeading>
      <Box maxH={maxBodyHeight} overflowY={maxBodyHeight ? 'auto' : undefined}>
        {children}
      </Box>
      {footer && (
        <Box
          px={5}
          py={3}
          borderTopWidth="1px"
          borderColor="gray.200"
          bg="gray.50"
        >
          {footer}
        </Box>
      )}
    </Box>
  );
}
