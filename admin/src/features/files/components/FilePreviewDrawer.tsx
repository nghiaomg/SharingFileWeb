import React from 'react';
import {
  Drawer,
  Descriptions,
  Tag,
  Space,
  Typography,
  Card,
  Image,
  Button,
  Divider,
  Row,
  Col,
  Tooltip,
  message,
} from 'antd';
import {
  FileOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileTextOutlined,
  FileExcelOutlined,
  FileZipOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  FileUnknownOutlined,
  DownloadOutlined,
  CopyOutlined,
  FolderOutlined,
  SafetyOutlined,
  LinkOutlined,
  EyeOutlined,
  GlobalOutlined,
  TeamOutlined,
  LockOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { StorageFile } from '../types/file.types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text } = Typography;

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (type: string, size: number = 48) => {
  const style = { fontSize: size };
  if (type.startsWith('image/')) return <FileImageOutlined style={{ ...style, color: '#52c41a' }} />;
  if (type.includes('pdf')) return <FilePdfOutlined style={{ ...style, color: '#ff4d4f' }} />;
  if (type.includes('excel') || type.includes('spreadsheet')) return <FileExcelOutlined style={{ ...style, color: '#52c41a' }} />;
  if (type.includes('word') || type.includes('document')) return <FileTextOutlined style={{ ...style, color: '#1677ff' }} />;
  if (type.includes('video') || type.includes('mp4') || type.includes('mov')) return <VideoCameraOutlined style={{ ...style, color: '#722ed1' }} />;
  if (type.includes('audio') || type.includes('mp3') || type.includes('wav')) return <AudioOutlined style={{ ...style, color: '#fa8c16' }} />;
  if (type.includes('zip') || type.includes('rar') || type.includes('tar') || type.includes('gz')) return <FileZipOutlined style={{ ...style, color: '#faad14' }} />;
  return <FileUnknownOutlined style={{ ...style, color: '#8c8c8c' }} />;
};

interface FilePreviewDrawerProps {
  file: StorageFile | null;
  visible: boolean;
  onClose: () => void;
}

export const FilePreviewDrawer: React.FC<FilePreviewDrawerProps> = ({
  file,
  visible,
  onClose,
}) => {
  if (!file) return null;

  const isImage = file.type?.startsWith('image/');

  const downloadUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/files/download/${file.id}`;

  const handleCopyLink = (url: string, label: string) => {
    navigator.clipboard.writeText(url);
    message.success(`Đã sao chép ${label}!`);
  };

  const handleDownload = () => {
    window.open(downloadUrl, '_blank');
  };

  return (
    <Drawer
      title={
        <Space>
          {getFileIcon(file.type || '', 32)}
          <div>
            <Text strong style={{ display: 'block', fontSize: 16, wordBreak: 'break-word' }}>{file.name}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{formatBytes(file.size || 0)}</Text>
          </div>
        </Space>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={600}
      extra={
        <Space>
          <Tooltip title="Sao chép liên kết tải xuống">
            <Button
              icon={<CopyOutlined />}
              onClick={() => handleCopyLink(downloadUrl, 'liên kết tải xuống')}
            />
          </Tooltip>
          <Tooltip title="Tải xuống">
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleDownload}
            />
          </Tooltip>
        </Space>
      }
    >
      {/* Preview Section */}
      <Card
        size="small"
        style={{ marginBottom: 16, textAlign: 'center', background: '#fafafa' }}
        bodyStyle={{ padding: isImage ? 0 : 16 }}
      >
        {isImage ? (
          <Image
            src={`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/files/${file.id}/preview`}
            alt={file.name}
            style={{ maxWidth: '100%', borderRadius: 8 }}
            fallback={`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/files/${file.id}/thumbnail`}
          />
        ) : (
          <div style={{ padding: 40 }}>
            {getFileIcon(file.type || '', 80)}
            <div style={{ marginTop: 16 }}>
              <Tag>{file.type}</Tag>
            </div>
          </div>
        )}
      </Card>

      {/* File Information */}
      <Card
        size="small"
        title={
          <Space>
            <FileOutlined />
            Thông tin tệp tin
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Tên file">
            <Text copyable style={{ wordBreak: 'break-word' }}>{file.name}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Loại file">
            <Tag icon={getFileIcon(file.type || '', 16)}>{file.type}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Kích thước">
            <Text strong>{formatBytes(file.size || 0)}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            <Space>
              {dayjs(file.createdAt).format('DD/MM/YYYY HH:mm:ss')}
              <Text type="secondary">({dayjs(file.createdAt).fromNow()})</Text>
            </Space>
          </Descriptions.Item>
          {file.folderId && (
            <Descriptions.Item label="Thư mục">
              <Tag icon={<FolderOutlined />}>{file.folderId}</Tag>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Access Control */}
      <Card
        size="small"
        title={
          <Space>
            <SafetyOutlined />
            Quyền truy cập
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Row gutter={16}>
          <Col span={8}>
            <div style={{ textAlign: 'center', padding: 16, background: file.accessMode === 'PUBLIC' ? '#f6ffed' : '#f5f5f5', borderRadius: 8, border: file.accessMode === 'PUBLIC' ? '1px solid #b7eb8f' : 'none' }}>
              <GlobalOutlined style={{ fontSize: 24, color: '#52c41a' }} />
              <div style={{ marginTop: 8 }}>
                <Tag color={file.accessMode === 'PUBLIC' ? 'green' : 'default'}>
                  {file.accessMode === 'PUBLIC' ? 'Công khai' : file.accessMode === 'RESTRICTED' ? 'Hạn chế' : 'Riêng tư'}
                </Tag>
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ textAlign: 'center', padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
              {file.isDeleted ? (
                <>
                  <DeleteOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />
                  <div style={{ marginTop: 8 }}>
                    <Tag color="red">Đã xóa</Tag>
                  </div>
                </>
              ) : (
                <>
                  <EyeOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                  <div style={{ marginTop: 8 }}>
                    <Tag color="green">Hoạt động</Tag>
                  </div>
                </>
              )}
            </div>
          </Col>
          <Col span={8}>
            <div style={{ textAlign: 'center', padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
              {file.isPublic ? (
                <>
                  <GlobalOutlined style={{ fontSize: 24, color: '#1677ff' }} />
                  <div style={{ marginTop: 8 }}>
                    <Tag color="blue">Công khai</Tag>
                  </div>
                </>
              ) : (
                <>
                  <LockOutlined style={{ fontSize: 24, color: '#8c8c8c' }} />
                  <div style={{ marginTop: 8 }}>
                    <Tag>Riêng tư</Tag>
                  </div>
                </>
              )}
            </div>
          </Col>
        </Row>

        <Divider />

        <Descriptions column={1} size="small">
          <Descriptions.Item label="Chế độ truy cập">
            <Space>
              {file.accessMode === 'PUBLIC' && <GlobalOutlined style={{ color: '#52c41a' }} />}
              {file.accessMode === 'RESTRICTED' && <TeamOutlined style={{ color: '#faad14' }} />}
              {file.accessMode === 'PRIVATE' && <LockOutlined style={{ color: '#8c8c8c' }} />}
              <Text strong>{file.accessMode}</Text>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="ID Chủ sở hữu">
            <Text copyable>{file.ownerId}</Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Quick Actions */}
      <Card
        size="small"
        title={
          <Space>
            <LinkOutlined />
            Liên kết & Thao tác
          </Space>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>Liên kết tải xuống:</Text>
            <div style={{ marginTop: 4 }}>
              <Text copyable style={{ wordBreak: 'break-all', fontSize: 12 }}>{downloadUrl}</Text>
            </div>
          </div>

          <Divider style={{ margin: '8px 0' }} />

          <Row gutter={8}>
            <Col span={12}>
              <Button
                block
                icon={<DownloadOutlined />}
                onClick={handleDownload}
              >
                Tải xuống
              </Button>
            </Col>
            <Col span={12}>
              <Button
                block
                icon={<CopyOutlined />}
                onClick={() => handleCopyLink(downloadUrl, 'liên kết')}
              >
                Sao chép liên kết
              </Button>
            </Col>
          </Row>
        </Space>
      </Card>
    </Drawer>
  );
};
