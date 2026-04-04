import React, { useState, useMemo } from 'react';
import { Input, Button, Tag, Popconfirm, Select, Row, Col, Typography, Checkbox, Tooltip, message, Space } from 'antd';
import {
  SearchOutlined, DeleteOutlined, EyeOutlined, CopyOutlined,
  ReloadOutlined, FileImageOutlined, FilePdfOutlined, FileTextOutlined,
  FileExcelOutlined, FileZipOutlined, VideoCameraOutlined, AudioOutlined,
  FileUnknownOutlined, ExclamationCircleOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { FilePreviewDrawer } from '../components/FilePreviewDrawer';
import { useFilesQuery, useDeleteFileMutation } from '../hooks/useFilesHooks';
import type { StorageFile } from '../types/file.types';
import { formatBytes } from '@/shared/utils';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { StatCard } from '@/shared/components/StatCard';
import ResponsiveCardList from '@/shared/components/ResponsiveCardList';

dayjs.extend(relativeTime);

const { Text } = Typography;

type FilterAccess = 'all' | 'public' | 'private' | 'restricted';
type FilterStatus = 'all' | 'active' | 'deleted';

const iconFor = (type: string) => {
  if (type.startsWith('image/')) return <FileImageOutlined style={{ color: '#52c41a', fontSize: 16 }} />;
  if (type.includes('pdf')) return <FilePdfOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />;
  if (type.includes('excel') || type.includes('spreadsheet')) return <FileExcelOutlined style={{ color: '#52c41a', fontSize: 16 }} />;
  if (type.includes('word') || type.includes('document')) return <FileTextOutlined style={{ color: '#1677ff', fontSize: 16 }} />;
  if (type.includes('video') || type.includes('mp4')) return <VideoCameraOutlined style={{ color: '#722ed1', fontSize: 16 }} />;
  if (type.includes('audio') || type.includes('mp3')) return <AudioOutlined style={{ color: '#fa8c16', fontSize: 16 }} />;
  if (type.includes('zip') || type.includes('rar')) return <FileZipOutlined style={{ color: '#faad14', fontSize: 16 }} />;
  return <FileUnknownOutlined style={{ color: '#8c8c8c', fontSize: 16 }} />;
};

/* ── FilesPage ── */
const FilesPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [filterAccess, setFilterAccess] = useState<FilterAccess>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [previewFile, setPreviewFile] = useState<StorageFile | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data: files, isLoading, refetch } = useFilesQuery();
  const deleteMutation = useDeleteFileMutation();

  /* ── Filtered ── */
  const filtered = useMemo(() => {
    if (!files) return [];
    return files.filter(f => {
      const match = searchText === '' ||
        f.name.toLowerCase().includes(searchText.toLowerCase()) ||
        f.type.toLowerCase().includes(searchText.toLowerCase());
      const matchAccess = filterAccess === 'all' ||
        (filterAccess === 'public' && f.accessMode === 'PUBLIC') ||
        (filterAccess === 'private' && f.accessMode === 'PRIVATE') ||
        (filterAccess === 'restricted' && f.accessMode === 'RESTRICTED');
      const matchStatus = filterStatus === 'all' ||
        (filterStatus === 'active' && !f.isDeleted) ||
        (filterStatus === 'deleted' && f.isDeleted);
      return match && matchAccess && matchStatus;
    });
  }, [files, searchText, filterAccess, filterStatus]);

  /* ── Stats ── */
  const stats = useMemo(() => {
    const all = files ?? [];
    return {
      total: all.length,
      active: all.filter(f => !f.isDeleted).length,
      deleted: all.filter(f => f.isDeleted).length,
      totalSize: all.filter(f => !f.isDeleted).reduce((a, f) => a + (f.size ?? 0), 0),
    };
  }, [files]);

  /* ── Table columns ── */
  const columns: ColumnsType<StorageFile> = [
    {
      title: '',
      key: 'check',
      width: 44,
      render: (_, r) => (
        <Checkbox checked={selectedIds.includes(r.id)} onChange={e => setSelectedIds(prev => e.target.checked ? [...prev, r.id] : prev.filter(id => id !== r.id))} />
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 320,
      render: (name, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {iconFor(r.type)}
          <Text style={{ fontSize: 14, color: 'var(--text-primary)' }} ellipsis>{name}</Text>
          {r.isDeleted && <Tag color="red" style={{ margin: 0, fontSize: 11 }}>Trash</Tag>}
        </div>
      ),
    },
    {
      title: 'Size', dataIndex: 'size', key: 'size', width: 100,
      render: (s: number) => <Text style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{formatBytes(s)}</Text>,
    },
    {
      title: 'Type', dataIndex: 'type', key: 'type', width: 110,
      render: (t: string) => <Text style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.split('/')[1]}</Text>,
    },
    {
      title: 'Access', dataIndex: 'accessMode', key: 'access', width: 120,
      render: (m: string) => <Tag color={m === 'PUBLIC' ? 'green' : m === 'RESTRICTED' ? 'orange' : 'default'} style={{ fontSize: 12, margin: 0 }}>{m}</Tag>,
    },
    {
      title: 'Date', dataIndex: 'createdAt', key: 'date', width: 130,
      render: (d: string) => <Text style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{dayjs(d).format('DD/MM/YYYY')}</Text>,
    },
    {
      title: '',
      key: 'action',
      width: 110,
      render: (_, r) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Tooltip title="Preview"><Button type="text" icon={<EyeOutlined />} onClick={() => setPreviewFile(r)} /></Tooltip>
          <Tooltip title="Copy link">
            <Button type="text" icon={<CopyOutlined />} onClick={() => { navigator.clipboard.writeText(`${location.origin}/api/files/download/${r.id}`); message.success('Link copied'); }} />
          </Tooltip>
          <Popconfirm title="Delete this file?" icon={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />} onConfirm={() => deleteMutation.mutate(r.id)} okText="Delete" okButtonProps={{ danger: true }}>
            <Tooltip title="Delete"><Button type="text" danger icon={<DeleteOutlined />} /></Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  /* ── Card renderer for mobile ── */
  const renderFileCard = (file: StorageFile) => (
    <Space direction="vertical" style={{ width: '100%' }} size={8}>
      {/* Header */}
      <Space align="start" style={{ width: '100%' }}>
        {iconFor(file.type)}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text strong style={{ display: 'block', wordBreak: 'break-word' }} ellipsis>{file.name}</Text>
          <Space size={4} style={{ marginTop: 4 }}>
            <Tag color={file.accessMode === 'PUBLIC' ? 'green' : file.accessMode === 'RESTRICTED' ? 'orange' : 'default'} style={{ fontSize: 10, margin: 0 }}>{file.accessMode}</Tag>
            <Tag style={{ fontSize: 10, margin: 0 }}>{file.type.split('/')[1]?.toUpperCase()}</Tag>
            {file.isDeleted && <Tag color="red" style={{ fontSize: 10, margin: 0 }}>Trash</Tag>}
          </Space>
        </div>
      </Space>

      {/* Info */}
      <Row gutter={[8, 4]}>
        <Col span={12}>
          <Text type="secondary" style={{ fontSize: 11 }}>Size</Text>
          <br />
          <Text style={{ fontSize: 12 }}>{formatBytes(file.size ?? 0)}</Text>
        </Col>
        <Col span={12}>
          <Text type="secondary" style={{ fontSize: 11 }}>Date</Text>
          <br />
          <Text style={{ fontSize: 12 }}>{dayjs(file.createdAt).format('DD/MM/YYYY')}</Text>
        </Col>
      </Row>

      {/* Actions */}
      <Space style={{ marginTop: 4 }}>
        <Button size="small" icon={<EyeOutlined />} onClick={() => setPreviewFile(file)}>Preview</Button>
        <Button size="small" icon={<CopyOutlined />} onClick={() => { navigator.clipboard.writeText(`${location.origin}/api/files/download/${file.id}`); message.success('Link copied'); }}>Copy</Button>
        <Popconfirm title="Delete this file?" icon={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />} onConfirm={() => deleteMutation.mutate(file.id)} okText="Delete" okButtonProps={{ danger: true }}>
          <Button size="small" danger icon={<DeleteOutlined />}>Delete</Button>
        </Popconfirm>
      </Space>

      {/* Bulk select toggle */}
      <div style={{ marginTop: 4 }}>
        <Checkbox checked={selectedIds.includes(file.id)} onChange={e => setSelectedIds(prev => e.target.checked ? [...prev, file.id] : prev.filter(id => id !== file.id))}>
          <Text type="secondary" style={{ fontSize: 12 }}>Select</Text>
        </Checkbox>
      </div>
    </Space>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' }}>Files</Text>
        <Button icon={<ReloadOutlined />} onClick={() => refetch()}>Refresh</Button>
      </div>

      {/* Stats */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}><StatCard title="Total" value={stats.total} icon={<FileTextOutlined style={{ color: '#1677ff' }} />} /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Active" value={stats.active} icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />} /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Trash" value={stats.deleted} icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />} /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Storage Used" value={parseFloat(formatBytes(stats.totalSize).split(' ')[0])} trend={formatBytes(stats.totalSize).split(' ')[1]} icon={<ExclamationCircleOutlined style={{ color: '#faad14' }} />} /></Col>
      </Row>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <Input placeholder="Search name, type..." prefix={<SearchOutlined style={{ color: 'var(--text-muted)' }} />} value={searchText} onChange={e => setSearchText(e.target.value)} allowClear style={{ width: 240 }} />
        <Select value={filterAccess} onChange={setFilterAccess} style={{ width: 150 }}
          options={[{ label: 'All Access', value: 'all' }, { label: 'Public', value: 'public' }, { label: 'Private', value: 'private' }, { label: 'Restricted', value: 'restricted' }]}
        />
        <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 130 }}
          options={[{ label: 'All', value: 'all' }, { label: 'Active', value: 'active' }, { label: 'Trash', value: 'deleted' }]}
        />

        {selectedIds.length > 0 && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{selectedIds.length} selected</Text>
            <Button onClick={() => setSelectedIds([])}>Clear</Button>
            <Popconfirm title={`Delete ${selectedIds.length} files?`} icon={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />} onConfirm={() => { selectedIds.forEach(id => deleteMutation.mutate(id)); message.success(`Deleted ${selectedIds.length} files`); setSelectedIds([]); }} okText="Delete" okButtonProps={{ danger: true }}>
              <Button danger icon={<DeleteOutlined />}>Delete ({selectedIds.length})</Button>
            </Popconfirm>
          </div>
        )}
      </div>

      {/* Table / Cards */}
      <ResponsiveCardList
        data={filtered}
        columns={columns}
        renderCard={renderFileCard}
        loading={isLoading}
        onReload={refetch}
        emptyText="No files"
      />

      {/* Preview */}
      <FilePreviewDrawer file={previewFile} visible={!!previewFile} onClose={() => setPreviewFile(null)} />
    </div>
  );
};

export default FilesPage;
