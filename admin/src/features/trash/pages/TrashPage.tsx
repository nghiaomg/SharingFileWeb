import React, { useState, useMemo } from 'react';
import {
  Card,
  Typography,
  Button,
  Space,
  Tag,
  Popconfirm,
  Row,
  Col,
  Tooltip,
  message,
  Modal,
  Drawer,
  Descriptions,
  Timeline,
  Checkbox,
} from 'antd';
import {
  DeleteOutlined,
  ReloadOutlined,
  FileOutlined,
  FolderOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  EyeOutlined,
  DeleteRowOutlined,
  InfoCircleOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTrashQuery, useRestoreTrashMutation, usePermanentDeleteMutation, useEmptyTrashMutation } from '../hooks/useTrashHooks';
import type { StorageFile } from '@/features/files/types/file.types';
import type { Folder } from '@/features/folders/types/folder.types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { StatCard } from '@/shared/components/StatCard';
import ResponsiveCardList from '@/shared/components/ResponsiveCardList';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

type TrashItem = (StorageFile | Folder) & { itemType: 'file' | 'folder' };

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const TrashPage: React.FC = () => {
  const { data: trashData, isLoading, refetch } = useTrashQuery();
  const restoreMutation = useRestoreTrashMutation();
  const permanentDeleteMutation = usePermanentDeleteMutation();
  const emptyTrashMutation = useEmptyTrashMutation();

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TrashItem | null>(null);

  const trashItems = useMemo(() => {
    const items: TrashItem[] = [];
    (trashData?.files || []).forEach((file) => items.push({ ...file, itemType: 'file' } as TrashItem));
    (trashData?.folders || []).forEach((folder) => items.push({ ...folder, itemType: 'folder' } as TrashItem));
    return items.sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf());
  }, [trashData]);

  const stats = useMemo(() => {
    const totalFiles = trashData?.files?.length || 0;
    const totalFolders = trashData?.folders?.length || 0;
    const totalItems = trashData?.totalItems || 0;
    const totalSize = (trashData?.files || []).reduce((acc, f) => acc + (f.size || 0), 0);
    return { totalFiles, totalFolders, totalItems, totalSize };
  }, [trashData]);

  const handleRestore = (item: TrashItem) => restoreMutation.mutate({ type: item.itemType, id: item.id });
  const handlePermanentDelete = (item: TrashItem) => permanentDeleteMutation.mutate({ type: item.itemType, id: item.id });

  const handleRestoreSelected = () => {
    if (selectedItems.length === 0) { message.warning('Vui lòng chọn ít nhất một mục để khôi phục'); return; }
    selectedItems.forEach((id) => {
      const item = trashItems.find((i) => i.id === id);
      if (item) restoreMutation.mutate({ type: item.itemType, id });
    });
    message.success(`Đã khôi phục ${selectedItems.length} mục!`);
    setSelectedItems([]);
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) { message.warning('Vui lòng chọn ít nhất một mục để xóa'); return; }
    Modal.confirm({
      title: 'Xóa vĩnh viễn các mục đã chọn?',
      icon: <WarningOutlined style={{ color: '#ff4d4f' }} />,
      content: <div><Text>Bạn đã chọn <strong>{selectedItems.length}</strong> mục để xóa vĩnh viễn.</Text><br /><Text type="secondary">Hành động này không thể hoàn tác!</Text></div>,
      okText: 'Xóa vĩnh viễn', cancelText: 'Hủy', okButtonProps: { danger: true },
      onOk: () => {
        selectedItems.forEach((id) => {
          const item = trashItems.find((i) => i.id === id);
          if (item) permanentDeleteMutation.mutate({ type: item.itemType, id });
        });
        message.success(`Đã xóa vĩnh viễn ${selectedItems.length} mục!`);
        setSelectedItems([]);
      },
    });
  };

  const handleViewDetail = (item: TrashItem) => { setSelectedItem(item); setDetailDrawerVisible(true); };

  const handleEmptyTrash = () => {
    Modal.confirm({
      title: 'Dọn sạch thùng rác?',
      icon: <WarningOutlined style={{ color: '#ff4d4f' }} />,
      content: <div><Text>Tất cả <strong>{stats.totalItems}</strong> mục trong thùng rác sẽ bị xóa vĩnh viễn.</Text><br /><Text type="danger">Hành động này không thể hoàn tác!</Text></div>,
      okText: 'Dọn sạch', cancelText: 'Hủy', okButtonProps: { danger: true, loading: emptyTrashMutation.isPending },
      onOk: () => emptyTrashMutation.mutate(),
    });
  };

  /* ── Table columns ── */
  const columns: ColumnsType<TrashItem> = [
    {
      title: <Checkbox indeterminate={selectedItems.length > 0 && selectedItems.length < trashItems.length} checked={selectedItems.length === trashItems.length && trashItems.length > 0} onChange={(e) => { if (e.target.checked) setSelectedItems(trashItems.map((i) => i.id)); else setSelectedItems([]); }} />,
      key: 'checkbox',
      width: 50,
      render: (_, record) => (
        <Checkbox checked={selectedItems.includes(record.id)} onChange={(e) => { if (e.target.checked) setSelectedItems([...selectedItems, record.id]); else setSelectedItems(selectedItems.filter((id) => id !== record.id)); }} />
      ),
    },
    {
      title: 'Tên',
      key: 'name',
      width: 300,
      render: (_, record) => (
        <Space>
          {record.itemType === 'file' ? <FileOutlined style={{ color: '#1677ff' }} /> : <FolderOutlined style={{ color: '#fa8c16' }} />}
          <Text strong style={{ wordBreak: 'break-word' }}>{(record as StorageFile).name || (record as Folder).name}</Text>
          <Tag color={record.itemType === 'file' ? 'blue' : 'orange'}>{record.itemType === 'file' ? 'Tệp' : 'Thư mục'}</Tag>
        </Space>
      ),
    },
    {
      title: 'Kích thước',
      key: 'size',
      width: 120,
      render: (_, record) => record.itemType === 'file' ? formatBytes((record as StorageFile).size || 0) : '-',
    },
    {
      title: 'Ngày xóa',
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
    },
    {
      title: 'Ngày hết hạn',
      key: 'expiresAt',
      width: 150,
      render: (_, record) => {
        const deletedAt = dayjs(record.createdAt);
        const expiresAt = deletedAt.add(30, 'day');
        const daysLeft = expiresAt.diff(dayjs(), 'day');
        if (daysLeft <= 0) return <Tag color="red" icon={<WarningOutlined />}>Đã hết hạn</Tag>;
        if (daysLeft <= 7) return <Tag color="orange" icon={<ClockCircleOutlined />}>{daysLeft} ngày</Tag>;
        return <Tag color="green" icon={<ClockCircleOutlined />}>{daysLeft} ngày</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết"><Button type="text" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)} /></Tooltip>
          <Tooltip title="Khôi phục"><Button type="text" icon={<UndoOutlined style={{ color: '#52c41a' }} />} onClick={() => handleRestore(record)} loading={restoreMutation.isPending} /></Tooltip>
          <Popconfirm title="Xóa vĩnh viễn mục này?" icon={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />} onConfirm={() => handlePermanentDelete(record)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
            <Tooltip title="Xóa vĩnh viễn"><Button type="text" danger icon={<DeleteRowOutlined />} loading={permanentDeleteMutation.isPending} /></Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  /* ── Card renderer for mobile ── */
  const renderTrashCard = (item: TrashItem) => {
    const deletedAt = dayjs(item.createdAt);
    const expiresAt = deletedAt.add(30, 'day');
    const daysLeft = expiresAt.diff(dayjs(), 'day');
    const itemName = (item as StorageFile).name || (item as Folder).name;

    return (
      <Space direction="vertical" style={{ width: '100%' }} size={8}>
        {/* Header */}
        <Space align="start" style={{ width: '100%' }}>
          {item.itemType === 'file'
            ? <FileOutlined style={{ fontSize: 20, color: '#1677ff' }} />
            : <FolderOutlined style={{ fontSize: 20, color: '#fa8c16' }} />
          }
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text strong style={{ display: 'block', wordBreak: 'break-word' }}>{itemName}</Text>
            <Space size={4} style={{ marginTop: 4 }}>
              <Tag color={item.itemType === 'file' ? 'blue' : 'orange'} style={{ margin: 0 }}>{item.itemType === 'file' ? 'Tệp' : 'Thư mục'}</Tag>
              {item.itemType === 'file' && <Tag style={{ margin: 0 }}>{formatBytes((item as StorageFile).size || 0)}</Tag>}
              {daysLeft <= 0 && <Tag color="red" style={{ margin: 0 }} icon={<WarningOutlined />}>Đã hết hạn</Tag>}
              {daysLeft > 0 && daysLeft <= 7 && <Tag color="orange" style={{ margin: 0 }} icon={<ClockCircleOutlined />}>{daysLeft} ngày</Tag>}
            </Space>
          </div>
        </Space>

        {/* Info */}
        <Row gutter={[8, 4]}>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: 11 }}>Ngày xóa</Text>
            <br />
            <Text style={{ fontSize: 12 }}>{dayjs(item.createdAt).format('DD/MM/YYYY')}</Text>
          </Col>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: 11 }}>Còn lại</Text>
            <br />
            {daysLeft <= 0
              ? <Text type="danger" style={{ fontSize: 12 }}>Đã hết hạn</Text>
              : <Text style={{ fontSize: 12 }}>{daysLeft} ngày</Text>
            }
          </Col>
        </Row>

        {/* Select checkbox */}
        <div>
          <Checkbox checked={selectedItems.includes(item.id)} onChange={(e) => { if (e.target.checked) setSelectedItems([...selectedItems, item.id]); else setSelectedItems(selectedItems.filter((id) => id !== item.id)); }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Chọn</Text>
          </Checkbox>
        </div>

        {/* Actions */}
        <Space style={{ marginTop: 4 }}>
          <Button size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(item)}>Chi tiết</Button>
          <Button size="small" icon={<UndoOutlined style={{ color: '#52c41a' }} />} onClick={() => handleRestore(item)} loading={restoreMutation.isPending}>Khôi phục</Button>
          <Popconfirm title="Xóa vĩnh viễn mục này?" icon={<WarningOutlined style={{ color: '#ff4d4f' }} />} onConfirm={() => handlePermanentDelete(item)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
            <Button size="small" danger icon={<DeleteRowOutlined />} loading={permanentDeleteMutation.isPending}>Xóa</Button>
          </Popconfirm>
        </Space>
      </Space>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Thùng rác</Title>
        <Space>
          <Button icon={<ReloadOutlined spin={isLoading} />} onClick={() => refetch()}>Làm mới</Button>
        </Space>
      </div>

      {/* Statistics */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}><StatCard title="Tổng mục" value={stats.totalItems} icon={<DeleteOutlined style={{ color: '#1677ff' }} />} /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Tệp tin" value={stats.totalFiles} icon={<FileOutlined style={{ color: '#1677ff' }} />} /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Thư mục" value={stats.totalFolders} icon={<FolderOutlined style={{ color: '#fa8c16' }} />} /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Dung lượng" value={formatBytes(stats.totalSize as number)} icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />} /></Col>
      </Row>

      {/* Warning Banner */}
      {stats.totalItems > 0 && (
        <Card size="small" style={{ marginBottom: 16, background: '#fffbe6', borderColor: '#ffe58f' }} bodyStyle={{ padding: '12px 16px' }}>
          <Space><WarningOutlined style={{ color: '#faad14', fontSize: 18 }} /><Text type="secondary">Các mục trong thùng rác sẽ tự động bị xóa vĩnh viễn sau <strong>30 ngày</strong>.</Text></Space>
        </Card>
      )}

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <Card size="small" style={{ marginBottom: 16, background: '#f6ffed', borderColor: '#b7eb8f' }}>
          <Space wrap>
            <Text strong>Đã chọn {selectedItems.length} mục</Text>
            <Button size="small" onClick={() => setSelectedItems([])}>Hủy chọn</Button>
            <Button size="small" icon={<UndoOutlined />} onClick={handleRestoreSelected} loading={restoreMutation.isPending}>Khôi phục ({selectedItems.length})</Button>
            <Button size="small" danger icon={<DeleteRowOutlined />} onClick={handleDeleteSelected} loading={permanentDeleteMutation.isPending}>Xóa vĩnh viễn ({selectedItems.length})</Button>
          </Space>
        </Card>
      )}

      {/* Trash Actions */}
      <Card size="small" style={{ marginBottom: 16 }} extra={
        <Popconfirm title="Dọn sạch thùng rác?" description="Tất cả các mục trong thùng rác sẽ bị xóa vĩnh viễn." icon={<WarningOutlined style={{ color: '#ff4d4f' }} />} onConfirm={handleEmptyTrash} okText="Dọn sạch" cancelText="Hủy" okButtonProps={{ danger: true, loading: emptyTrashMutation.isPending }}>
          <Button type="primary" danger icon={<DeleteOutlined />} loading={emptyTrashMutation.isPending} disabled={stats.totalItems === 0}>Dọn sạch thùng rác</Button>
        </Popconfirm>
      }>
        <Text type="secondary"><InfoCircleOutlined style={{ marginRight: 8 }} />Thùng rác lưu trữ các tệp và thư mục đã xóa. Bạn có thể khôi phục hoặc xóa vĩnh viễn các mục.</Text>
      </Card>

      {/* Table / Cards */}
      <ResponsiveCardList
        data={trashItems}
        columns={columns}
        renderCard={renderTrashCard}
        loading={isLoading}
        onReload={refetch}
        emptyText={
          <div><Text type="secondary">Thùng rác trống</Text><br /><Text type="secondary" style={{ fontSize: 12 }}>Các tệp và thư mục đã xóa sẽ xuất hiện ở đây</Text></div>
        }
      />

      {/* Item Detail Drawer */}
      <Drawer
        title="Chi tiết mục trong thùng rác"
        placement="right"
        onClose={() => { setDetailDrawerVisible(false); setSelectedItem(null); }}
        open={detailDrawerVisible}
        width={480}
        extra={
          selectedItem && (
            <Space>
              <Button icon={<UndoOutlined />} onClick={() => { handleRestore(selectedItem); setDetailDrawerVisible(false); }} loading={restoreMutation.isPending}>Khôi phục</Button>
              <Popconfirm title="Xóa vĩnh viễn?" onConfirm={() => { handlePermanentDelete(selectedItem); setDetailDrawerVisible(false); }} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
                <Button danger icon={<DeleteRowOutlined />} loading={permanentDeleteMutation.isPending}>Xóa vĩnh viễn</Button>
              </Popconfirm>
            </Space>
          )
        }
      >
        {selectedItem && (
          <div>
            <Card size="small" style={{ marginBottom: 16 }}>
              <Space orientation="vertical" align="center">
                {selectedItem.itemType === 'file'
                  ? <FileOutlined style={{ fontSize: 48, color: '#1677ff' }} />
                  : <FolderOutlined style={{ fontSize: 48, color: '#fa8c16' }} />
                }
                <Text strong style={{ fontSize: 18 }}>{(selectedItem as StorageFile).name || (selectedItem as Folder).name}</Text>
                <Tag color={selectedItem.itemType === 'file' ? 'blue' : 'orange'}>{selectedItem.itemType === 'file' ? 'Tệp tin' : 'Thư mục'}</Tag>
              </Space>
            </Card>

            <Card size="small" title="Thông tin">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="ID">{selectedItem.id}</Descriptions.Item>
                <Descriptions.Item label="Kích thước">{selectedItem.itemType === 'file' ? formatBytes((selectedItem as StorageFile).size || 0) : '-'}</Descriptions.Item>
                <Descriptions.Item label="Ngày xóa">{dayjs(selectedItem.createdAt).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
                <Descriptions.Item label="Ngày hết hạn">{dayjs(selectedItem.createdAt).add(30, 'day').format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
              </Descriptions>
            </Card>

            <Card size="small" title="Lịch sử" style={{ marginTop: 16 }}>
              <Timeline items={[
                { color: 'green', content: <div><Text strong>Mục bị xóa</Text><br /><Text type="secondary" style={{ fontSize: 11 }}>{dayjs(selectedItem.createdAt).format('DD/MM/YYYY HH:mm')}</Text></div> },
                { color: 'orange', content: <div><Text strong>Hết hạn khôi phục</Text><br /><Text type="secondary" style={{ fontSize: 11 }}>{dayjs(selectedItem.createdAt).add(30, 'day').format('DD/MM/YYYY HH:mm')}</Text><br /><Text type="danger" style={{ fontSize: 11 }}>Còn lại: {dayjs(selectedItem.createdAt).add(30, 'day').diff(dayjs(), 'day')} ngày</Text></div> },
              ]} />
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default TrashPage;
