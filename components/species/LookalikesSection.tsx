import { Box, Heading, Link, Separator, Text } from '@chakra-ui/react';
import type { Lookalike } from '@/lib/types';

interface Props {
  lookalikes: Lookalike[];
}

export default function LookalikesSection({ lookalikes }: Props) {
  if (lookalikes.length === 0) return null;

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
        似ている在来種との判別ポイント
      </Heading>
      <Box>
        {lookalikes.map((lk, i) => (
          <Box key={`${lk.nativeName}-${i}`}>
            {i > 0 && <Separator />}
            <Box px={5} py={4}>
              <Text fontSize="sm" fontWeight="700" color="gray.800" mb={1}>
                {lk.nativeName}
                {lk.nativeScientificName && (
                  <Text as="span" fontWeight="400" color="gray.500" ml={1}>
                    ({lk.nativeScientificName})
                  </Text>
                )}
              </Text>
              <Text fontSize="sm" color="gray.900" lineHeight="1.7" mb={2}>
                {lk.point}
              </Text>
              <Link
                href={lk.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                fontSize="xs"
                color="green.700"
              >
                出典を見る ↗
              </Link>
            </Box>
          </Box>
        ))}
      </Box>
      <Text
        px={5}
        py={3}
        fontSize="xs"
        color="gray.500"
        borderTopWidth="1px"
        borderColor="gray.200"
        bg="gray.50"
      >
        環境省の同定マニュアル等をもとに記載しています。実際の同定・駆除の判断は専門家や自治体にご確認ください。
      </Text>
    </Box>
  );
}
