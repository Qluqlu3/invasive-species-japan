import { Box, Flex, Link, Text } from '@chakra-ui/react';

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

export default function Footer() {
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
        <Text color="gray.500">
          本サイトは公開データを基にした非公式のビューアです。最新の指定状況は環境省の公式情報をご確認ください。
        </Text>
      </Flex>
    </Box>
  );
}
