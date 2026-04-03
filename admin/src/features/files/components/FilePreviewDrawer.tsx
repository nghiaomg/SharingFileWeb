import React from 'react';
import { Drawer, Button, Space, Typography, Tag, Tooltip, message } from 'antd';
import {
  DownloadOutlined,
  CopyOutlined,
  SafetyOutlined,
  GlobalOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { env } from '@/config/env';
import { FilePreviewContent } from './FilePreviewContent';
import { formatBytes } from '@/shared/utils';
import type { StorageFile } from '../types/file.types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text } = Typography;

interface FilePreviewDrawerProps {
  file: StorageFile | null;
  visible: boolean;
  onClose: () => void;
}

const FileIcon: React.FC<{ type: string; size?: number }> = ({ type, size = 20 }) => {
  const color = type.startsWith('image/') ? '#52c41a'
    : type.includes('pdf') ? '#ff4d4f'
    : type.includes('video') ? '#722ed1'
    : type.includes('audio') ? '#fa8c16'
    : type.includes('zip') ? '#faad14'
    : '#8c8c8c';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color }}>
      <Text style={{ fontSize: size, color }}>{type.split('/')[1]?.toUpperCase().slice(0, 8)}</Text>
    </span>
  );
};

export const FilePreviewDrawer: React.FC<FilePreviewDrawerProps> = ({ file, visible, onClose }) => {
  if (!file) return null;

  const downloadUrl = `${env.API_URL}/api/files/download/${file.id}`;
  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    message.success(`Đã sao chép ${label}`);
  };

  const meta = [
    { label: 'Size',      value: formatBytes(file.size ?? 0) },
    { label: 'Created',   value: dayjs(file.createdAt).format('DD/MM/YYYY HH:mm') },
    { label: 'Access',    value: file.accessMode },
    { label: 'Status',    value: file.isDeleted ? 'Deleted' : 'Active' },
  ];

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <FileIcon type={file.type} size={18} />
          <Text style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }} ellipsis>
            {file.name}
          </Text>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={640}
      styles={{ body: { padding: '16px 20px' }, header: { padding: '12px 20px' } }}
      extra={
        <Space size={4}>
          <Tooltip title="Copy link">
            <Button size="small" icon={<CopyOutlined />} onClick={() => copy(downloadUrl, 'link')} />
          </Tooltip>
          <Tooltip title="Download">
            <Button size="small" type="primary" icon={<DownloadOutlined />} onClick={() => window.open(downloadUrl, '_blank')} />
          </Tooltip>
        </Space>
      }
    >
      {/* Preview area */}
      <div style={{
        background: 'var(--bg-surface)',
        borderRadius: 10,
        minHeight: 200,
        maxHeight: 480,
        overflow: 'hidden',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <FilePreviewContent
          fileId={file.id}
          fileName={file.name}
          fileType={file.type}
        />
      </div>

      {/* Meta row */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {meta.map(m => (
          <div key={m.label} style={{
            background: 'var(--bg-surface)',
            borderRadius: 6,
            padding: '6px 12px',
            flex: '1 1 auto',
            minWidth: 80,
          }}>
            <Text style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {m.label}
            </Text>
            <Text style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              {m.value}
            </Text>
          </div>
        ))}
      </div>

      {/* Access badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
      }}>
        <SafetyOutlined style={{ color: 'var(--text-secondary)', fontSize: 13 }} />
        <Text style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Access:</Text>
        {file.accessMode === 'PUBLIC' && (
          <Tag icon={<GlobalOutlined />} color="green" style={{ margin: 0 }}>Public</Tag>
        )}
        {file.accessMode === 'RESTRICTED' && (
          <Tag color="orange" style={{ margin: 0 }}>Restricted</Tag>
        )}
        {file.accessMode === 'PRIVATE' && (
          <Tag icon={<LockOutlined />} style={{ margin: 0 }}>Private</Tag>
        )}
        {file.isDeleted && <Tag color="red" style={{ margin: 0 }}>Deleted</Tag>}
      </div>

      {/* Owner */}
      {file.ownerId && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Owner: <Text code style={{ fontSize: 11 }}>{file.ownerId}</Text>
          </Text>
        </div>
      )}

      {/* Link */}
      <div style={{
        marginTop: 12,
        padding: '10px 12px',
        background: 'var(--bg-surface)',
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <Text style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>URL:</Text>
        <Text style={{ fontSize: 11, color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {downloadUrl}
        </Text>
        <Button size="small" type="text" icon={<CopyOutlined />} style={{ flexShrink: 0 }} onClick={() => copy(downloadUrl, 'URL')} />
      </div>
    </Drawer>
  );
};
