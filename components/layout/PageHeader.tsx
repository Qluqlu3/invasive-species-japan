'use client';

import { Badge, Box, Flex, Heading, Link, Text } from '@chakra-ui/react';
import NextLink from 'next/link';

interface Props {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  badge?: string;
  badgeColorPalette?: string;
}

export default function PageHeader({
  title,
  subtitle,
  backHref,
  backLabel,
  badge,
  badgeColorPalette = 'orange',
}: Props) {
  return (
    <Box as="header" bg="green.700" color="white" px={6} py={4}>
      <Flex align="center" gap={4}>
        {backHref && (
          <Link
            asChild
            color="green.200"
            fontSize="sm"
            flexShrink={0}
            _hover={{ color: 'white' }}
          >
            <NextLink href={backHref}>{backLabel ?? '← 戻る'}</NextLink>
          </Link>
        )}
        <Box py={backHref ? 0 : 1}>
          <Heading size="xl" fontWeight="bold" letterSpacing="tight">
            {title}
          </Heading>
          {subtitle && (
            <Text fontSize="sm" color="green.200" mt={1}>
              {subtitle}
            </Text>
          )}
        </Box>
        {badge && (
          <Badge
            ml="auto"
            colorPalette={badgeColorPalette}
            flexShrink={0}
            px={2}
            py={1}
          >
            {badge}
          </Badge>
        )}
      </Flex>
    </Box>
  );
}
