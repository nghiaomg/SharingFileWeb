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
  Empty,
  Avatar,
} from 'antd';
import {
  SearchOutlined,
  DeleteOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  ReloadOutlined,
  HomeOutlined,
  EyeOutlined,
  EditOutlined,
  FileOutlined,
  ClockCircleOutlined,
  UserOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { FolderGrid } from '../components/FolderGrid';
import { FolderFilesModal } from '../components/FolderFilesModal';
import { FilePreviewModal } from '../components/FilePreviewModal';
import { FolderDetailDrawer } from '../components/FolderDetailDrawer';
import { CreateFolderModal } from '../components/CreateFolderModal';
import { useFoldersQuery, useDeleteFolderMutation } from '../hooks/useFoldersHooks';
import type { Folder, FolderFile } from '../types/folder.types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

type ViewMode = 'table' | 'grid';

const getFolderIcon = (isDeleted: boolean, isSelected: boolean = false) => {
  if (isDeleted) {
    return <FolderOutlined style={{ color: '#ff4d4f' }} />;
  }
  if (isSelected) {
    return <FolderOpenOutlined style={{ color: '#1677ff' }} />;
  }
  return <FolderOutlined style={{ color: '#fa8c16' }} />;
};

const FoldersPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchText, setSearchText] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedFolderName, setSelectedFolderName] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<FolderFile | null>(null);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const { data: folders, isLoading, refetch } = useFoldersQuery();
  const deleteMutation = useDeleteFolderMutation();

  // Filter folders based on search
  const filteredFolders = useMemo(() => {
    if (!folders) return [];

    return folders.filter((folder) => {
      const matchesSearch =
        searchText === '' ||
        folder.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (folder.ownerId && folder.ownerId.toLowerCase().includes(searchText.toLowerCase()));

      return matchesSearch;
    });
  }, [folders, searchText]);

  // Statistics
  const folderStats = useMemo(() => {
    const total = folders?.length || 0;
    const active = folders?.filter((f) => !f.isDeleted).length || 0;
    const deleted = folders?.filter((f) => f.isDeleted).length || 0;
    return { total, active, deleted };
  }, [folders]);

  const handleFolderClick = (folder: Folder) => {
    setSelectedFolderId(folder.id);
    setSelectedFolderName(folder.name);
  };

  const handleViewDetail = (folder: Folder) => {
    setSelectedFolder(folder);
    setDetailDrawerVisible(true);
  };

  const handleDeleteFolder = (folderId: string) => {
    deleteMutation.mutate(folderId);
  };

  const columns: ColumnsType<Folder> = [
    {
      title: 'Tên thư mục',
      key: 'name',
      fixed: 'left',
      width: 300,
      render: (_, record) => (
        <Space>
          {getFolderIcon(record.isDeleted)}
          <Text strong style={{ wordBreak: 'break-word' }}>{record.name}</Text>
          {record.isDeleted && (
            <Tag color="red" style={{ marginLeft: 8 }}>Đã xóa</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Chủ sở hữu',
      dataIndex: 'ownerId',
      key: 'ownerId',
      width: 200,
      render: (ownerId: string) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
          <Text type="secondary">{ownerId ? ownerId.substring(0, 8) + '...' : 'N/A'}</Text>
        </Space>
      ),
    },
    {
      title: 'Thư mục cha',
      dataIndex: 'parentId',
      key: 'parentId',
      width: 150,
      render: (parentId: string | null) => (
        parentId ? (
          <Tag icon={<FolderOutlined />}>{parentId.substring(0, 8)}...</Tag>
        ) : (
          <Tag icon={<HomeOutlined />} color="blue">Root</Tag>
        )
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => (
        <Tooltip title={dayjs(date).format('DD/MM/YYYY HH:mm:ss')}>
          <Space>
            <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
            <Text type="secondary">{dayjs(date).format('DD/MM/YYYY')}</Text>
          </Space>
        </Tooltip>
      ),
      sorter: (a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 150,
      render: (date: string | null) => (
        date ? (
          <Tooltip title={dayjs(date).format('DD/MM/YYYY HH:mm:ss')}>
            <Space>
              <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
              <Text type="secondary">{dayjs(date).fromNow()}</Text>
            </Space>
          </Tooltip>
        ) : (
          <Text type="secondary">-</Text>
        )
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      render: (_, record) => (
        <Tag color={record.isDeleted ? 'red' : 'green'}>
          {record.isDeleted ? 'Đã xóa' : 'Hoạt động'}
        </Tag>
      ),
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
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Xem files">
            <Button
              type="text"
              icon={<FileOutlined />}
              onClick={() => handleFolderClick(record)}
            />
          </Tooltip>
          {!record.isDeleted && (
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => handleViewDetail(record)}
              />
            </Tooltip>
          )}
          <Popconfirm
            title="Xóa thư mục này?"
            description="Hành động này sẽ chuyển thư mục vào thùng rác."
            icon={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
            onConfirm={() => handleDeleteFolder(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
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
        <Title level={2} style={{ margin: 0 }}>Quản lý thư mục</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            Làm mới
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
            Tạo thư mục
          </Button>
        </Space>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8}>
          <Card size="small">
            <Statistic
              title="Tổng thư mục"
              value={folderStats.total}
              prefix={<FolderOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card size="small">
            <Statistic
              title="Đang hoạt động"
              value={folderStats.active}
              prefix={<FolderOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card size="small">
            <Statistic
              title="Trong thùng rác"
              value={folderStats.deleted}
              prefix={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search and View Mode */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Input
              placeholder="Tìm kiếm thư mục..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ maxWidth: 300 }}
            />
          </Col>
          <Col>
            <Segmented
              options={[
                { label: <span><AppstoreOutlined /> Lưới</span>, value: 'grid' },
                { label: <span><UnorderedListOutlined /> Bảng</span>, value: 'table' },
              ]}
              value={viewMode}
              onChange={(value) => setViewMode(value as ViewMode)}
            />
          </Col>
        </Row>
      </Card>

      {/* Folders List */}
      <Card>
        {filteredFolders.length > 0 ? (
          viewMode === 'table' ? (
            <Table
              scroll={{ x: 'max-content' }}
              dataSource={filteredFolders}
              columns={columns}
              rowKey="id"
              loading={isLoading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} thư mục`,
              }}
              rowClassName={(record) => record.isDeleted ? 'ant-table-row-deleted' : ''}
            />
          ) : (
            <FolderGrid onFolderClick={handleFolderClick} searchText={searchText} />
          )
        ) : (
          <Empty
            description={searchText ? 'Không tìm thấy thư mục nào phù hợp' : 'Chưa có thư mục nào'}
          />
        )}
      </Card>

      {/* Folder Files Modal */}
      <FolderFilesModal
        folderId={selectedFolderId}
        folderName={selectedFolderName}
        onClose={() => setSelectedFolderId(null)}
        onFileClick={(file) => setSelectedFile(file)}
      />

      {/* File Preview Modal */}
      <FilePreviewModal
        file={selectedFile}
        onClose={() => setSelectedFile(null)}
      />

      {/* Folder Detail Drawer */}
      <FolderDetailDrawer
        folder={selectedFolder}
        visible={detailDrawerVisible}
        onClose={() => {
          setDetailDrawerVisible(false);
          setSelectedFolder(null);
        }}
      />

      {/* Create Folder Modal */}
      <CreateFolderModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        parentFolders={folders || []}
      />
    </div>
  );
};

export default FoldersPage;
