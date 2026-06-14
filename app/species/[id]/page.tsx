import { Box } from '@chakra-ui/react';
import { notFound } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import DesignationBadge from '@/components/species/DesignationBadge';
import PhotoGallery from '@/components/species/PhotoGallery';
import PrefectureList from '@/components/species/PrefectureList';
import SpeciesInfoTable from '@/components/species/SpeciesInfoTable';
import { getAllSpecies, getSpeciesById } from '@/lib/data';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return getAllSpecies().map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const s = getSpeciesById(id);
  if (!s) return {};
  return { title: `${s.jaName} | 日本の特定外来生物` };
}

export default async function SpeciesPage({ params }: Props) {
  const { id } = await params;
  const s = getSpeciesById(id);
  if (!s) notFound();

  return (
    <Box minH="100vh" bg="gray.50">
      <PageHeader
        title={s.jaName}
        subtitle={s.scientificName}
        backHref="/"
        backLabel="← 一覧に戻る"
        badge={s.isConditional ? '条件付特定外来生物' : '特定外来生物'}
        badgeColorPalette={s.isConditional ? 'orange' : 'red'}
      />
      <Box maxW="4xl" mx="auto" px={4} py={6} spaceY={6}>
        <DesignationBadge isConditional={s.isConditional} />
        {s.photos.length > 0 && (
          <Box as="section">
            <Box
              as="h2"
              fontSize="xs"
              fontWeight="semibold"
              color="gray.500"
              textTransform="uppercase"
              letterSpacing="wide"
              mb={3}
            >
              写真
            </Box>
            <PhotoGallery photos={s.photos} name={s.jaName} />
          </Box>
        )}
        <SpeciesInfoTable species={s} />
        <PrefectureList prefectures={s.prefectures} />
      </Box>
    </Box>
  );
}
