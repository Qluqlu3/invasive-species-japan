import {
  Badge,
  Box,
  Flex,
  Heading,
  Link,
  Separator,
  Text,
} from '@chakra-ui/react';
import type { ControlAuthorization } from '@/lib/types';

interface Props {
  authorizations: ControlAuthorization[];
}

const KOUJI_URL = 'https://www.env.go.jp/nature/intro/3control/kouji.html';

const TYPE_COLOR: Record<string, string> = {
  公示: 'blue',
  確認: 'purple',
  認定: 'teal',
};

export default function ControlAuthorizationsSection({
  authorizations,
}: Props) {
  if (authorizations.length === 0) return null;

  return (
    <Box
      bg="white"
      rounded="xl"
      borderWidth="1px"
      borderColor="gray.300"
      overflow="hidden"
    >
      <Heading
        size="xs"
        fontWeight="semibold"
        color="gray.700"
        textTransform="uppercase"
        letterSpacing="wide"
        px={5}
        py={3}
        borderBottomWidth="1px"
        borderColor="gray.200"
      >
        防除の公示・確認・認定を受けた主体 ({authorizations.length})
      </Heading>
      <Box maxH="400px" overflowY="auto">
        {authorizations.map((a, i) => (
          <Box key={`${a.organization}-${a.area}-${i}`}>
            {i > 0 && <Separator />}
            <Flex px={5} py={3} gap={3} wrap="wrap" align="center">
              <Badge
                colorPalette={TYPE_COLOR[a.type] ?? 'gray'}
                variant="subtle"
              >
                {a.type}
              </Badge>
              <Text fontSize="sm" fontWeight="700" color="gray.800">
                {a.organization}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {a.region} ・ {a.area}
              </Text>
              <Text fontSize="xs" color="gray.500" ml="auto">
                {a.period}
              </Text>
            </Flex>
          </Box>
        ))}
      </Box>
      <Box
        px={5}
        py={3}
        borderTopWidth="1px"
        borderColor="gray.200"
        bg="gray.50"
      >
        <Link
          href={KOUJI_URL}
          target="_blank"
          rel="noopener noreferrer"
          fontSize="xs"
          color="green.700"
        >
          出典: 環境省 新法に基づく防除の公示一覧 ↗
        </Link>
        <Text fontSize="xs" color="gray.500" mt={1}>
          外来生物法に基づき、防除の公示・確認・認定を受けている主体の一覧です（網羅的ではありません）。
        </Text>
      </Box>
    </Box>
  );
}
