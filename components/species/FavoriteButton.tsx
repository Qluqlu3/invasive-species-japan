'use client';

import { Button } from '@chakra-ui/react';
import { useFavorites } from '@/hooks/useFavorites';

interface Props {
  speciesId: string;
}

export default function FavoriteButton({ speciesId }: Props) {
  const { favorites, toggleFavorite } = useFavorites();
  const isFavorite = favorites.has(speciesId);

  return (
    <Button
      onClick={() => toggleFavorite(speciesId)}
      size="sm"
      variant="outline"
      colorPalette={isFavorite ? 'yellow' : 'gray'}
      alignSelf="flex-start"
    >
      {isFavorite ? '★ お気に入り登録済み' : '☆ お気に入りに追加'}
    </Button>
  );
}
