'use client';

import { Box, Button, Flex, Link, Text, Textarea } from '@chakra-ui/react';
import { useState } from 'react';

interface Props {
  jaName: string;
  scientificName: string;
}

type GeoState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; lat: number; lng: number; accuracy: number }
  | { status: 'error'; message: string };

const IKILOG_REPORT_URL = 'https://ikilog.biodic.go.jp/ReportRegister/';
const CONTACT_LIST_URL = 'https://www.env.go.jp/nature/intro/reo.html';

function buildReportText(
  jaName: string,
  scientificName: string,
  geo: GeoState,
): string {
  const lines = [
    `種名: ${jaName}（${scientificName}）`,
    `確認日時: ${new Date().toLocaleString('ja-JP')}`,
  ];
  if (geo.status === 'success') {
    lines.push(
      `位置情報: 緯度 ${geo.lat.toFixed(6)}, 経度 ${geo.lng.toFixed(6)}（誤差 約${Math.round(geo.accuracy)}m）`,
      `地図で確認: https://www.google.com/maps?q=${geo.lat},${geo.lng}`,
    );
  }
  return lines.join('\n');
}

/**
 * 実際の目撃報告・データ収集は環境省いきものログ/地方環境事務所側が担う。
 * 本コンポーネントは位置情報付きの報告メモを作成し、外部窓口への導線を
 * 用意するだけで、報告データ自体は保存しない。
 */
export default function SightingReportSection({
  jaName,
  scientificName,
}: Props) {
  const [geo, setGeo] = useState<GeoState>({ status: 'idle' });
  const [copied, setCopied] = useState(false);

  const handleLocate = () => {
    if (!('geolocation' in navigator)) {
      setGeo({
        status: 'error',
        message: 'この端末では位置情報を取得できません',
      });
      return;
    }
    setGeo({ status: 'loading' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({
          status: 'success',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      () => {
        setGeo({
          status: 'error',
          message: '位置情報を取得できませんでした（許可設定をご確認ください）',
        });
      },
    );
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(
      buildReportText(jaName, scientificName, geo),
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box
      bg="blue.50"
      borderWidth="1px"
      borderColor="blue.200"
      rounded="xl"
      p={4}
    >
      <Text fontWeight="semibold" color="blue.900" mb={1}>
        📍 この種を見つけましたか?
      </Text>
      <Text fontSize="sm" color="gray.700" mb={3}>
        位置情報付きの報告メモを作成できます。実際の報告はいきものログや地方環境事務所等へお願いします（本サイトはデータを収集しません）。
      </Text>
      <Flex wrap="wrap" gap={2} mb={2}>
        <Button
          size="sm"
          colorPalette="blue"
          onClick={handleLocate}
          loading={geo.status === 'loading'}
        >
          現在地を取得する
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCopy}
          disabled={geo.status !== 'success'}
        >
          {copied ? 'コピーしました' : '報告メモをコピー'}
        </Button>
      </Flex>
      {geo.status === 'error' && (
        <Text fontSize="xs" color="red.600" mb={2}>
          {geo.message}
        </Text>
      )}
      {geo.status === 'success' && (
        <Textarea
          value={buildReportText(jaName, scientificName, geo)}
          readOnly
          rows={3}
          fontSize="xs"
          bg="white"
          mb={3}
        />
      )}
      <Flex gap={4} fontSize="sm" wrap="wrap">
        <Link
          href={IKILOG_REPORT_URL}
          target="_blank"
          rel="noopener noreferrer"
          color="green.700"
          _hover={{ textDecoration: 'underline' }}
        >
          いきものログで報告する ↗
        </Link>
        <Link
          href={CONTACT_LIST_URL}
          target="_blank"
          rel="noopener noreferrer"
          color="green.700"
          _hover={{ textDecoration: 'underline' }}
        >
          地方環境事務所等 連絡先一覧 ↗
        </Link>
      </Flex>
    </Box>
  );
}
