'use client';

import { Badge, Box, Flex, Link, Text } from '@chakra-ui/react';
import { getDesignation } from '@/lib/designation';
import HazardBadge from './HazardBadge';

interface Props {
  isConditional: boolean;
  hazardous?: boolean;
}

export default function DesignationBadge({ isConditional, hazardous }: Props) {
  const d = getDesignation(isConditional);

  return (
    <Box
      position="relative"
      bg={`${d.colorPalette}.100`}
      borderWidth="2px"
      borderColor={`${d.colorPalette}.400`}
      rounded="xl"
      px={5}
      py={4}
    >
      <Link
        href={d.url}
        target="_blank"
        rel="noopener noreferrer"
        position="absolute"
        top={2}
        right={2}
        title="環境省による解説ページを開く"
      >
        <Flex
          w={6}
          h={6}
          rounded="full"
          borderWidth="1px"
          borderColor="gray.500"
          align="center"
          justify="center"
          fontSize="xs"
          fontWeight="bold"
          color="gray.700"
          _hover={{ borderColor: 'gray.800', color: 'gray.900' }}
        >
          ?
        </Flex>
      </Link>
      <Flex wrap="wrap" gap={2} mb={2}>
        <Badge
          colorPalette={d.colorPalette}
          variant="solid"
          size="lg"
          fontWeight="bold"
        >
          ⚠ {d.label}
        </Badge>
        {hazardous && <HazardBadge size="lg">☠ 毒あり</HazardBadge>}
      </Flex>
      <Box overflowX="auto" pr={{ base: 0, md: 8 }}>
        <Text
          fontSize="sm"
          fontWeight="medium"
          color="gray.900"
          lineHeight="tall"
          whiteSpace={{ base: 'normal', md: 'nowrap' }}
        >
          {d.description}
        </Text>
      </Box>
    </Box>
  );
}
