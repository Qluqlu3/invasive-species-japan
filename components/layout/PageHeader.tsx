'use client';

import { Badge, Box, Flex, Heading, Link, Text } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else if (backHref) {
      router.push(backHref);
    }
  };

  return (
    <Box
      as="header"
      bg="green.700"
      color="white"
      px={{ base: 4, md: 6 }}
      py={4}
    >
      {backHref && (
        <Link
          as="button"
          onClick={handleBack}
          display="inline-block"
          color="green.50"
          fontSize="sm"
          mb={2}
          cursor="pointer"
          _hover={{ color: 'white' }}
        >
          {backLabel ?? '← 戻る'}
        </Link>
      )}
      <Flex align="center" gap={3} wrap="wrap">
        <Heading
          size={{ base: 'lg', md: 'xl' }}
          fontWeight="bold"
          letterSpacing="tight"
        >
          {title}
        </Heading>
        {badge && (
          <Badge
            colorPalette={badgeColorPalette}
            variant="solid"
            fontWeight="bold"
            flexShrink={0}
            px={2}
            py={1}
          >
            ⚠ {badge}
          </Badge>
        )}
      </Flex>
      {subtitle && (
        <Text fontSize="sm" color="green.50" mt={1}>
          {subtitle}
        </Text>
      )}
    </Box>
  );
}
