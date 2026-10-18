'use client';

import { Box, Flex, Link, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { isMeaningful } from '@/lib/description';
import type { Species } from '@/lib/types';
import SectionCard from './SectionCard';

interface Props {
  species: Species;
}

interface InfoRowData {
  label: string;
  content: ReactNode;
}

const IKILOG_SEARCH_URL = 'https://ikilog.biodic.go.jp/LifeSearch/';

function googleNewsUrl(jaName: string): string {
  return `https://news.google.com/search?q=${encodeURIComponent(`${jaName} 外来種`)}&hl=ja&gl=JP&ceid=JP:ja`;
}

function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      color="green.700"
      _hover={{ textDecoration: 'underline' }}
    >
      {children}
    </Link>
  );
}

const textRow = (label: string, value: string): InfoRowData => ({
  label,
  content: value || '—',
});

const optionalTextRow = (
  label: string,
  value: string | undefined,
): InfoRowData[] => (isMeaningful(value) ? [textRow(label, value)] : []);

const rows = (s: Species): InfoRowData[] => {
  const d = s.description;
  return [
    textRow('分類群', s.category),
    textRow('目', s.order),
    textRow('科', s.family),
    textRow('属', s.genus),
    ...optionalTextRow('英名', d?.englishName),
    ...optionalTextRow('自然分布', d?.nativeRange),
    textRow('定着状況', s.status),
    ...optionalTextRow('移入元', d?.sourceRegion),
    ...optionalTextRow('侵入経路', d?.pathway),
    ...optionalTextRow('侵入年代', d?.invasionEra),
    ...optionalTextRow('海外移入分布', d?.overseasRange),
    ...(s.niesUrl
      ? [
          {
            label: 'NIESリンク',
            content: (
              <ExternalLink href={s.niesUrl}>NIES詳細ページ ↗</ExternalLink>
            ),
          },
        ]
      : []),
    {
      label: '目撃情報',
      content: (
        <ExternalLink href={IKILOG_SEARCH_URL}>
          いきものログで「{s.jaName}」を検索 ↗
        </ExternalLink>
      ),
    },
    {
      label: '関連ニュース',
      content: (
        <ExternalLink href={googleNewsUrl(s.jaName)}>
          Google Newsで「{s.jaName}」の関連ニュースを検索 ↗
        </ExternalLink>
      ),
    },
  ];
};

export default function SpeciesInfoTable({ species: s }: Props) {
  return (
    <SectionCard title="基本情報">
      <Box as="dl">
        {rows(s).map(({ label, content }, i) => (
          <Flex
            key={label}
            px={5}
            py={3}
            gap={4}
            borderTopWidth={i > 0 ? '1px' : undefined}
            borderColor="border"
          >
            <Text
              as="dt"
              w={24}
              fontSize="sm"
              fontWeight="medium"
              color="gray.700"
              flexShrink={0}
            >
              {label}
            </Text>
            <Text as="dd" fontSize="sm" color="gray.900">
              {content}
            </Text>
          </Flex>
        ))}
      </Box>
    </SectionCard>
  );
}
