'use client';

import { useEffect } from 'react';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';

interface Props {
  speciesId: string;
}

/** 詳細画面の閲覧をlocalStorageに記録するだけの副作用専用コンポーネント */
export default function RecentlyViewedTracker({ speciesId }: Props) {
  const { recordView } = useRecentlyViewed();

  useEffect(() => {
    recordView(speciesId);
  }, [speciesId, recordView]);

  return null;
}
