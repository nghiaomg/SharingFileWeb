import React, { useState, useMemo } from 'react';
import {
  Card,
  Typography,
  Input,
  Button,
  Space,
  Table,
  Tag,
  Popconfirm,
  Segmented,
  Row,
  Col,
  Statistic,
  Tooltip,
  Select,
  Badge,
  Empty,
  message,
  Checkbox,
} from 'antd';
import {
  SearchOutlined,
  DeleteOutlined,
  EyeOutlined,
  CopyOutlined,
  ReloadOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileTextOutlined,
  FileExcelOutlined,
  FileZipOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  FileUnknownOutlined,
  ThunderboltOutlined,
  ExclamationCircleOutlined,
  SafetyOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { FilePreviewDrawer } from '../components/FilePreviewDrawer';
import { useFilesQuery, useDeleteFileMutation } from '../hooks/useFilesHooks';
import type { StorageFile } from '../types/file.types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

type ViewMode = 'table' | 'cards';
type FilterAccess = 'all' | 'public' | 'private' | 'restricted';
type FilterStatus = 'all' | 'active' | 'deleted';

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return <FileImageOutlined style={{ color: '#52c41a' }} />;
  if (type.includes('pdf')) return <FilePdfOutlined style={{ color: '#ff4d4f' }} />;
  if (type.includes('excel') || type.includes('spreadsheet')) return <FileExcelOutlined style={{ color: '#52c41a' }} />;
  if (type.includes('word') || type.includes('document')) return <FileTextOutlined style={{ color: '#1677ff' }} />;
  if (type.includes('video') || type.includes('mp4') || type.includes('mov')) return <VideoCameraOutlined style={{ color: '#722ed1' }} />;
  if (type.includes('audio') || type.includes('mp3') || type.includes('wav')) return <AudioOutlined style={{ color: '#fa8c16' }} />;
  if (type.includes('zip') || type.includes('rar') || type.includes('tar') || type.includes('gz')) return <FileZipOutlined style={{ color: '#faad14' }} />;
  return <FileUnknownOutlined style={{ color: '#8c8c8c' }} />;
};

const getAccessIcon = (mode: string) => {
  switch (mode) {
    case 'PUBLIC':
      return <SafetyOutlined style={{ color: '#52c41a' }} />;
    case 'RESTRICTED':
      return <SafetyOutlined style={{ color: '#faad14' }} />;
    default:
      return <SafetyOutlined style={{ color: '#8c8c8c' }} />;
  }
};

const FilesPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [filterAccess, setFilterAccess] = useState<FilterAccess>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedFile, setSelectedFile] = useState<StorageFile | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);

  const { data: files, isLoading, refetch } = useFilesQuery();
  const deleteMutation = useDeleteFileMutation();

  // Filter files based on search and filters
  const filteredFiles = useMemo(() => {
    if (!files) return [];

    return files.filter((file) => {
      // Search filter
      const matchesSearch =
        searchText === '' ||
        file.name.toLowerCase().includes(searchText.toLowerCase()) ||
        file.type.toLowerCase().includes(searchText.toLowerCase()) ||
        (file.ownerId && file.ownerId.toLowerCase().includes(searchText.toLowerCase()));

      // Access mode filter
      let matchesAccess = true;
      switch (filterAccess) {
        case 'public':
          matchesAccess = file.accessMode === 'PUBLIC';
          break;
        case 'private':
          matchesAccess = file.accessMode === 'PRIVATE';
          break;
        case 'restricted':
          matchesAccess = file.accessMode === 'RESTRICTED';
          break;
      }

      // Status filter
      let matchesStatus = true;
      switch (filterStatus) {
        case 'active':
          matchesStatus = !file.isDeleted;
          break;
        case 'deleted':
          matchesStatus = file.isDeleted;
          break;
      }

      return matchesSearch && matchesAccess && matchesStatus;
    });
  }, [files, searchText, filterAccess, filterStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = files?.length || 0;
    const active = files?.filter((f) => !f.isDeleted).length || 0;
    const deleted = files?.filter((f) => f.isDeleted).length || 0;
    const publicFiles = files?.filter((f) => f.accessMode === 'PUBLIC').length || 0;
    const totalSize = files?.filter((f) => !f.isDeleted).reduce((acc, f) => acc + (f.size || 0), 0) || 0;

    return { total, active, deleted, publicFiles, totalSize };
  }, [files]);

  const handlePreview = (file: StorageFile) => {
    setSelectedFile(file);
    setPreviewVisible(true);
  };

  const handleDeleteSelected = () => {
    if (selectedFileIds.length === 0) {
      message.warning('Vui lòng chọn ít nhất một tệp để xóa');
      return;
    }

    selectedFileIds.forEach((id) => {
      deleteMutation.mutate(id);
    });
    message.success(`Đã xóa ${selectedFileIds.length} tệp tin`);
    setSelectedFileIds([]);
  };

  const handleCopyLink = (fileId: string) => {
    const link = `${window.location.origin}/api/files/download/${fileId}`;
    navigator.clipboard.writeText(link);
    message.success('Đã sao chép liên kết tải xuống!');
  };

  const columns: ColumnsType<StorageFile> = [
    {
      title: (
        <Checkbox
          indeterminate={selectedFileIds.length > 0 && selectedFileIds.length < filteredFiles.length}
          checked={selectedFileIds.length === filteredFiles.length && filteredFiles.length > 0}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedFileIds(filteredFiles.map((f) => f.id));
            } else {
              setSelectedFileIds([]);
            }
          }}
        />
      ),
      key: 'checkbox',
      width: 50,
      render: (_, record) => (
        <Checkbox
          checked={selectedFileIds.includes(record.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedFileIds([...selectedFileIds, record.id]);
            } else {
              setSelectedFileIds(selectedFileIds.filter((id) => id !== record.id));
            }
          }}
        />
      ),
    },
    {
      title: 'Tên file',
      key: 'name',
      fixed: 'left',
      width: 300,
      render: (_, record) => (
        <Space>
          <Tooltip title={record.type}>
            {getFileIcon(record.type)}
          </Tooltip>
          <Text strong style={{ wordBreak: 'break-word' }}>{record.name}</Text>
        </Space>
      ),
    },
    {
      title: 'Kích thước',
      dataIndex: 'size',
      key: 'size',
      width: 120,
      render: (size: number) => formatBytes(size),
      sorter: (a, b) => (a.size || 0) - (b.size || 0),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      ellipsis: true,
      render: (type: string) => (
        <Tag icon={getFileIcon(type)}>{type.split('/')[1]?.toUpperCase() || type}</Tag>
      ),
    },
    {
      title: 'Quyền truy cập',
      dataIndex: 'accessMode',
      key: 'accessMode',
      width: 130,
      render: (mode: string) => (
        <Space>
          {getAccessIcon(mode)}
          <Tag color={
            mode === 'PUBLIC' ? 'green' :
            mode === 'RESTRICTED' ? 'orange' : 'default'
          }>
            {mode}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isDeleted',
      key: 'status',
      width: 120,
      render: (isDeleted: boolean) => (
        <Badge
          status={isDeleted ? 'error' : 'success'}
          text={isDeleted ? 'Trong thùng rác' : 'Hoạt động'}
        />
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => (
        <Tooltip title={dayjs(date).format('DD/MM/YYYY HH:mm:ss')}>
          <Text type="secondary">{dayjs(date).format('DD/MM/YYYY HH:mm')}</Text>
        </Tooltip>
      ),
      sorter: (a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Hành động',
      key: 'action',
      fixed: 'right',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handlePreview(record)}
            />
          </Tooltip>
          <Tooltip title="Sao chép liên kết">
            <Button
              type="text"
              icon={<CopyOutlined />}
              onClick={() => handleCopyLink(record.id)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa vĩnh viễn tệp này?"
            description="Hành động này không thể hoàn tác."
            icon={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa vĩnh viễn">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Quản lý tệp tin</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            Làm mới
          </Button>
        </Space>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Tổng tệp tin"
              value={stats.total}
              prefix={<FileOutlined />}
              styles={{ content: { color: '#1677ff' } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Đang hoạt động"
              value={stats.active}
              prefix={<ThunderboltOutlined style={{ color: '#52c41a' }} />}
              styles={{ content: { color: '#52c41a' } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Trong thùng rác"
              value={stats.deleted}
              prefix={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
              styles={{ content: { color: '#ff4d4f' } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Tổng dung lượng"
              value={stats.totalSize}
              formatter={(val) => formatBytes(val as number)}
              prefix={<SafetyOutlined style={{ color: '#faad14' }} />}
              styles={{ content: { color: '#faad14' } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Input
              placeholder="Tìm kiếm theo tên, loại file..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ maxWidth: 300 }}
            />
          </Col>
          <Col>
            <Space>
              <FilterOutlined />
              <Select
                placeholder="Quyền truy cập"
                value={filterAccess}
                onChange={setFilterAccess}
                style={{ width: 150 }}
                options={[
                  { label: 'Tất cả', value: 'all' },
                  { label: 'Công khai', value: 'public' },
                  { label: 'Riêng tư', value: 'private' },
                  { label: 'Hạn chế', value: 'restricted' },
                ]}
              />
              <Select
                placeholder="Trạng thái"
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: 130 }}
                options={[
                  { label: 'Tất cả', value: 'all' },
                  { label: 'Hoạt động', value: 'active' },
                  { label: 'Đã xóa', value: 'deleted' },
                ]}
              />
            </Space>
          </Col>
          <Col>
            <Segmented
              options={[
                { label: 'Bảng', value: 'table' },
                { label: 'Thẻ', value: 'cards' },
              ]}
              value={viewMode}
              onChange={(value) => setViewMode(value as ViewMode)}
            />
          </Col>
        </Row>
      </Card>

      {/* Bulk Actions */}
      {selectedFileIds.length > 0 && (
        <Card size="small" style={{ marginBottom: 16, background: '#f6ffed', borderColor: '#b7eb8f' }}>
          <Space>
            <Text strong>Đã chọn {selectedFileIds.length} tệp tin</Text>
            <Button size="small" onClick={() => setSelectedFileIds([])}>Hủy chọn</Button>
            <Popconfirm
              title={`Xóa ${selectedFileIds.length} tệp tin đã chọn?`}
              description="Hành động này không thể hoàn tác."
              onConfirm={handleDeleteSelected}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button size="small" danger icon={<DeleteOutlined />}>
                Xóa ({selectedFileIds.length})
              </Button>
            </Popconfirm>
          </Space>
        </Card>
      )}

      {/* Files Table */}
      <Card>
        {filteredFiles.length > 0 ? (
          <Table
            scroll={{ x: 'max-content' }}
            dataSource={filteredFiles}
            columns={columns}
            rowKey="id"
            loading={isLoading}
            pagination={{
              pageSize: 15,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} tệp tin`,
            }}
            rowClassName={(record) => record.isDeleted ? 'ant-table-row-deleted' : ''}
          />
        ) : (
          <Empty
            description={searchText || filterAccess !== 'all' || filterStatus !== 'all'
              ? 'Không tìm thấy tệp tin nào phù hợp'
              : 'Chưa có tệp tin nào'
            }
          />
        )}
      </Card>

      {/* File Preview Drawer */}
      <FilePreviewDrawer
        file={selectedFile}
        visible={previewVisible}
        onClose={() => {
          setPreviewVisible(false);
          setSelectedFile(null);
        }}
      />
    </div>
  );
};

export default FilesPage;
