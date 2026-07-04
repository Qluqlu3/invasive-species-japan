import { Flex, Spinner, Text } from '@chakra-ui/react';

export default function Loading() {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      gap={3}
      minH="60vh"
    >
      <Spinner size="lg" color="green.600" />
      <Text fontSize="sm" color="gray.600">
        読み込み中...
      </Text>
    </Flex>
  );
}
