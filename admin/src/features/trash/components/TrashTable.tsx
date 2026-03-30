import React from 'react';
import { Table, Button, Space, Popconfirm, Tabs, Tooltip } from 'antd';
import { DeleteOutlined, UndoOutlined, FileOutlined, FolderOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useTrashQuery, useRestoreTrashMutation, usePermanentDeleteMutation } from '../hooks/useTrashHooks';
import type { TrashItem } from '../types/trash.types';

interface RawStorageFile {
  id: string;
  name: string;
  size?: number;
  createdAt: string;
}

interface RawFolder {
  id: string;
  name: string;
  createdAt: string;
}
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  return `${parseFloat(value.toFixed(2))} ${sizes[i]}`;
};

export const TrashTable: React.FC = () => {
  const { data: trashData, isLoading } = useTrashQuery();
  const restoreMutation = useRestoreTrashMutation();
  const deleteMutation = usePermanentDeleteMutation();

  const columns = (type: 'file' | 'folder') => [
    {
      title: 'Tên',
      key: 'name',
      render: (_: unknown, record: TrashItem) => (
        <Space>
          {type === 'file' ? (
            <FileOutlined style={{ color: '#1677ff' }} />
          ) : (
            <FolderOutlined style={{ color: '#fa8c16' }} />
          )}
          {record.name}
        </Space>
      ),
    },
    ...(type === 'file' ? [{
      title: 'Kích thước',
      dataIndex: 'size',
      key: 'size',
      render: (size?: number) => formatBytes(size || 0),
    }] : []),
    {
      title: 'Ngày xóa',
      key: 'deletedAt',
      render: (_: unknown, record: TrashItem) => (
        <Tooltip title={record.deletedAt ? dayjs(record.deletedAt).format('DD/MM/YYYY HH:mm:ss') : '-'}>
          <Space>
            <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
            <span>{record.deletedAt ? dayjs(record.deletedAt).format('DD/MM/YYYY') : '-'}</span>
          </Space>
        </Tooltip>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: unknown, record: TrashItem) => (
        <Space size="small">
          <Button
            type="text"
            icon={<UndoOutlined style={{ color: '#52c41a' }} />}
            size="small"
            onClick={() => restoreMutation.mutate({ type, id: record.id })}
            loading={restoreMutation.isPending}
          >
            Khôi phục
          </Button>
          <Popconfirm
            title="Xóa vĩnh viễn?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => deleteMutation.mutate({ type, id: record.id })}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              loading={deleteMutation.isPending}
            >
              Xóa vĩnh viễn
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Tabs defaultActiveKey="file" type="card">
      <Tabs.TabPane tab={<span><FileOutlined /> Tệp tin ({trashData?.files?.length || 0})</span>} key="file">
        <Table
          scroll={{ x: 'max-content' }}
          dataSource={trashData?.files?.map((f) => ({ ...f, type: 'file' as const, deletedAt: (f as unknown as RawStorageFile).createdAt })) || []}
          columns={columns('file')}
          rowKey="id"
          loading={isLoading}
          pagination={false}
        />
      </Tabs.TabPane>
      <Tabs.TabPane tab={<span><FolderOutlined /> Thư mục ({trashData?.folders?.length || 0})</span>} key="folder">
        <Table
          scroll={{ x: 'max-content' }}
          dataSource={trashData?.folders?.map((f) => ({ ...f, type: 'folder' as const, deletedAt: (f as unknown as RawFolder).createdAt })) || []}
          columns={columns('folder')}
          rowKey="id"
          loading={isLoading}
          pagination={false}
        />
      </Tabs.TabPane>
    </Tabs>
  );
};
