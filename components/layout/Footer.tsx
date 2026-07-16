import { Box, Flex, Link, Text } from '@chakra-ui/react';
import { getDataMeta } from '@/lib/data';

const SOURCES = [
  {
    label: '環境省 特定外来生物等一覧',
    url: 'https://www.env.go.jp/nature/intro/2outline/list.html',
  },
  {
    label: 'NIES 侵入生物データベース',
    url: 'https://www.nies.go.jp/biodiversity/invasive/DB/',
  },
];

/** "YYYY-MM-DD" を日本語表記に変換する（タイムゾーン変換を避けるため文字列のまま処理） */
function formatJaDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${y}年${Number(m)}月${Number(d)}日`;
}

export default function Footer() {
  const meta = getDataMeta();

  return (
    <Box
      as="footer"
      bg="gray.800"
      color="gray.300"
      px={{ base: 4, md: 6 }}
      py={6}
    >
      <Flex
        direction="column"
        gap={2}
        maxW="56rem"
        mx="auto"
        fontSize="xs"
        lineHeight="tall"
      >
        <Flex wrap="wrap" gap={1}>
          <Text as="span">データ出典:</Text>
          {SOURCES.map((s, i) => (
            <Text as="span" key={s.url}>
              <Link
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                color="gray.200"
                _hover={{ color: 'white', textDecoration: 'underline' }}
              >
                {s.label}
              </Link>
              {i < SOURCES.length - 1 && ' / '}
            </Text>
          ))}
        </Flex>
        {meta && (
          <Text color="gray.400">
            データ最終更新日: {formatJaDate(meta.lastUpdated)}
          </Text>
        )}
        <Text as="span">
          野外で外来生物を見つけた場合の相談・通報先:{' '}
          <Link
            href="https://www.env.go.jp/nature/intro/reo.html"
            target="_blank"
            rel="noopener noreferrer"
            color="gray.200"
            _hover={{ color: 'white', textDecoration: 'underline' }}
          >
            地方環境事務所等 連絡先一覧
          </Link>
          {
            ' / 環境省 自然環境局 野生生物課 外来生物対策室 TEL: 03-3581-3351（代表）'
          }
        </Text>
        <Text color="gray.500">
          本サイトは公開データを基にした非公式のビューアです。最新の指定状況は環境省の公式情報をご確認ください。
        </Text>
      </Flex>
    </Box>
  );
}
