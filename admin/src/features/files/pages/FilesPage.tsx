import React, { useState, useMemo } from 'react';
import { Input, Button, Table, Tag, Popconfirm, Select, Row, Col, Typography, Checkbox, Tooltip, message } from 'antd';
import {
  SearchOutlined, DeleteOutlined, EyeOutlined, CopyOutlined,
  ReloadOutlined, FileImageOutlined, FilePdfOutlined, FileTextOutlined,
  FileExcelOutlined, FileZipOutlined, VideoCameraOutlined, AudioOutlined,
  FileUnknownOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { FilePreviewDrawer } from '../components/FilePreviewDrawer';
import { useFilesQuery, useDeleteFileMutation } from '../hooks/useFilesHooks';
import type { StorageFile } from '../types/file.types';
import { formatBytes } from '@/shared/utils';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text } = Typography;

type FilterAccess = 'all' | 'public' | 'private' | 'restricted';
type FilterStatus = 'all' | 'active' | 'deleted';

/* ── Icon helper ── */
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

/* ── Stat pill ── */
const Pill: React.FC<{ value: number; label: string; accent?: string }> = ({ value, label, accent = 'var(--text-primary)' }) => (
  <div style={{ background: 'var(--bg-surface)', borderRadius: 10, padding: '14px 20px', textAlign: 'center' }}>
    <div style={{ fontSize: 24, fontWeight: 700, color: accent, lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{label}</div>
  </div>
);

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

  /* ── Columns ── */
  const columns: ColumnsType<StorageFile> = [
    {
      title: '',
      key: 'check',
      width: 44,
      render: (_, r) => (
        <Checkbox
          checked={selectedIds.includes(r.id)}
          onChange={e => setSelectedIds(prev =>
            e.target.checked ? [...prev, r.id] : prev.filter(id => id !== r.id)
          )}
        />
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
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      width: 100,
      render: (s: number) => <Text style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{formatBytes(s)}</Text>,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 110,
      render: (t: string) => (
        <Text style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          {t.split('/')[1]}
        </Text>
      ),
    },
    {
      title: 'Access',
      dataIndex: 'accessMode',
      key: 'access',
      width: 120,
      render: (m: string) => (
        <Tag color={m === 'PUBLIC' ? 'green' : m === 'RESTRICTED' ? 'orange' : 'default'} style={{ fontSize: 12, margin: 0 }}>
          {m}
        </Tag>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      width: 130,
      render: (d: string) => (
        <Text style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{dayjs(d).format('DD/MM/YYYY')}</Text>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 110,
      render: (_, r) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Tooltip title="Preview">
            <Button type="text" icon={<EyeOutlined />} onClick={() => setPreviewFile(r)} />
          </Tooltip>
          <Tooltip title="Copy link">
            <Button
              type="text" icon={<CopyOutlined />}
              onClick={() => {
                navigator.clipboard.writeText(`${location.origin}/api/files/download/${r.id}`);
                message.success('Link copied');
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this file?"
            icon={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
            onConfirm={() => deleteMutation.mutate(r.id)}
            okText="Delete" okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' }}>Files</Text>
        <Button icon={<ReloadOutlined />} onClick={() => refetch()}>Refresh</Button>
      </div>

      {/* Stats */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6} md={3}><Pill value={stats.total}    label="Total"     accent="var(--text-primary)" /></Col>
        <Col xs={12} sm={6} md={3}><Pill value={stats.active}   label="Active"    accent="#52c41a" /></Col>
        <Col xs={12} sm={6} md={3}><Pill value={stats.deleted}  label="Trash"     accent="#ff4d4f" /></Col>
        <Col xs={12} sm={6} md={3}>
          <Pill value={parseFloat(formatBytes(stats.totalSize).split(' ')[0])} label={formatBytes(stats.totalSize).split(' ')[1] + ' used'} accent="#faad14" />
        </Col>
      </Row>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <Input
          placeholder="Search name, type..."
          prefix={<SearchOutlined style={{ color: 'var(--text-muted)' }} />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          allowClear
          style={{ width: 240 }}
        />
        <Select value={filterAccess} onChange={setFilterAccess} style={{ width: 150 }}
          options={[
            { label: 'All Access',   value: 'all' },
            { label: 'Public',       value: 'public' },
            { label: 'Private',      value: 'private' },
            { label: 'Restricted',    value: 'restricted' },
          ]}
        />
        <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 130 }}
          options={[
            { label: 'All',    value: 'all' },
            { label: 'Active', value: 'active' },
            { label: 'Trash',  value: 'deleted' },
          ]}
        />

        {/* Bulk delete */}
        {selectedIds.length > 0 && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{selectedIds.length} selected</Text>
            <Button onClick={() => setSelectedIds([])}>Clear</Button>
            <Popconfirm
              title={`Delete ${selectedIds.length} files?`}
              icon={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
              onConfirm={() => {
                selectedIds.forEach(id => deleteMutation.mutate(id));
                message.success(`Deleted ${selectedIds.length} files`);
                setSelectedIds([]);
              }}
              okText="Delete" okButtonProps={{ danger: true }}
            >
              <Button danger icon={<DeleteOutlined />}>Delete ({selectedIds.length})</Button>
            </Popconfirm>
          </div>
        )}
      </div>

      {/* Table */}
      <Table
        dataSource={filtered}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        scroll={{ x: 900 }}
        pagination={{ pageSize: 15, showSizeChanger: true }}
        rowClassName={r => r.isDeleted ? 'file-row-deleted' : ''}
        locale={{ emptyText: 'No files' }}
      />

      {/* Preview */}
      <FilePreviewDrawer file={previewFile} visible={!!previewFile} onClose={() => setPreviewFile(null)} />
    </div>
  );
};

export default FilesPage;
