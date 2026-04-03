import React, { useState } from 'react';
import { Image, Typography, Spin, Tag } from 'antd';
import { FileTextOutlined, FileExcelOutlined, FileZipOutlined, FileUnknownOutlined } from '@ant-design/icons';
import { env } from '@/config/env';

const { Text } = Typography;

interface FilePreviewContentProps {
  fileId: string;
  fileName: string;
  fileType: string;
}

/* ── helpers ── */
const isImage = (t: string) => t.startsWith('image/');
const isPdf = (t: string) => t.includes('pdf');
const isVideo = (t: string) => t.startsWith('video/') || t.includes('mp4') || t.includes('mov') || t.includes('webm');
const isAudio = (t: string) => t.startsWith('audio/') || t.includes('mp3') || t.includes('wav') || t.includes('ogg');
const isText = (t: string) => t.startsWith('text/') || t.includes('json') || t.includes('xml') || t.includes('csv') || t.includes('javascript');
const isOffice = (t: string) => t.includes('word') || t.includes('document') || t.includes('excel') || t.includes('spreadsheet') || t.includes('powerpoint');
const isZip = (t: string) => t.includes('zip') || t.includes('rar') || t.includes('tar') || t.includes('gz') || t.includes('7z');

/* ── Preview components ── */
const ImagePreview: React.FC<{ fileId: string; fileName: string }> = ({ fileId, fileName }) => (
  <div style={{ textAlign: 'center' }}>
    <Image
      src={`${env.API_URL}/api/files/${fileId}/preview`}
      alt={fileName}
      style={{ maxWidth: '100%', borderRadius: 8 }}
      fallback={`${env.API_URL}/api/files/${fileId}/thumbnail`}
      preview={{ mask: null }}
    />
  </div>
);

const PdfPreview: React.FC<{ fileId: string; fileName: string }> = ({ fileId, fileName }) => (
  <iframe
    src={`${env.API_URL}/api/files/${fileId}/preview`}
    title={fileName}
    style={{ width: '100%', height: '100%', minHeight: 480, border: 'none', borderRadius: 8 }}
  />
);

const VideoPreview: React.FC<{ fileId: string; fileName: string }> = ({ fileId }) => (
  <video
    controls
    src={`${env.API_URL}/api/files/${fileId}/preview`}
    style={{ width: '100%', maxHeight: 480, borderRadius: 8 }}
  >
    Trình duyệt không hỗ trợ video.
  </video>
);

const AudioPreview: React.FC<{ fileId: string }> = ({ fileId }) => (
  <div style={{ padding: '24px 0', textAlign: 'center' }}>
    <audio
      controls
      src={`${env.API_URL}/api/files/${fileId}/preview`}
      style={{ width: '100%' }}
    />
  </div>
);

const TextPreview: React.FC<{ fileId: string }> = ({ fileId }) => {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  React.useEffect(() => {
    fetch(`${env.API_URL}/api/files/${fileId}/preview`)
      .then(r => r.text())
      .then(t => { setContent(t); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [fileId]);

  if (loading) return <div style={{ textAlign: 'center', padding: 32 }}><Spin /></div>;
  if (error) return <Text type="secondary">Không thể tải nội dung</Text>;

  return (
    <pre style={{
      background: 'var(--bg-surface)',
      borderRadius: 8,
      padding: 16,
      fontSize: 12,
      maxHeight: 400,
      overflow: 'auto',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      color: 'var(--text-primary)',
    }}>
      {content}
    </pre>
  );
};

const OfficePreview: React.FC<{ fileType: string }> = ({ fileType }) => {
  const isWord = fileType.includes('word') || fileType.includes('document');
  const isExcel = fileType.includes('excel') || fileType.includes('spreadsheet');
  const Icon = isWord ? FileTextOutlined : isExcel ? FileExcelOutlined : FileUnknownOutlined;
  const label = isWord ? 'Word' : isExcel ? 'Excel' : 'Office';

  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <Icon style={{ fontSize: 64, color: isWord ? '#1677ff' : isExcel ? '#52c41a' : '#8c8c8c' }} />
      <div style={{ marginTop: 16 }}>
        <Tag>{label} Document</Tag>
      </div>
      <div style={{ marginTop: 8 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Preview không khả dụng cho loại file này
        </Text>
      </div>
    </div>
  );
};

const ZipPreview: React.FC = () => (
  <div style={{ textAlign: 'center', padding: '40px 0' }}>
    <FileZipOutlined style={{ fontSize: 64, color: '#faad14' }} />
    <div style={{ marginTop: 16 }}>
      <Text type="secondary">Nén file — không thể preview trực tiếp</Text>
    </div>
  </div>
);

const UnsupportedPreview: React.FC<{ fileType: string }> = ({ fileType }) => (
  <div style={{ textAlign: 'center', padding: '40px 0' }}>
    <FileUnknownOutlined style={{ fontSize: 64, color: '#8c8c8c' }} />
    <div style={{ marginTop: 16 }}>
      <Tag>{fileType}</Tag>
    </div>
    <div style={{ marginTop: 8 }}>
      <Text type="secondary">Loại file này không hỗ trợ preview</Text>
    </div>
  </div>
);

/* ── Main component ── */
export const FilePreviewContent: React.FC<FilePreviewContentProps> = ({ fileId, fileName, fileType }) => {
  if (isImage(fileType)) return <ImagePreview fileId={fileId} fileName={fileName} />;
  if (isPdf(fileType)) return <PdfPreview fileId={fileId} fileName={fileName} />;
  if (isVideo(fileType)) return <VideoPreview fileId={fileId} fileName={fileName} />;
  if (isAudio(fileType)) return <AudioPreview fileId={fileId} />;
  if (isText(fileType)) return <TextPreview fileId={fileId} />;
  if (isOffice(fileType)) return <OfficePreview fileType={fileType} />;
  if (isZip(fileType)) return <ZipPreview />;
  return <UnsupportedPreview fileType={fileType} />;
};
