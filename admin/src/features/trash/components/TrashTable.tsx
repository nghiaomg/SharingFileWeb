import React from 'react';
import { Table, Button, Space, Popconfirm, Tabs } from 'antd';
import { DeleteOutlined, UndoOutlined } from '@ant-design/icons';
import { useTrashQuery, useRestoreItemMutation, useDeletePermanentMutation } from '../hooks/useTrashHooks';
import type { TrashItem } from '../types/trash.types';
import dayjs from 'dayjs';

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const TrashTable: React.FC = () => {
  const { data: trashItems, isLoading } = useTrashQuery();
  const restoreMutation = useRestoreItemMutation();
  const deleteMutation = useDeletePermanentMutation();

  const columns = (type: 'file' | 'folder') => [
    { title: 'Tên', dataIndex: 'name', key: 'name' },
    ...(type === 'file' ? [{ title: 'Kích thước', dataIndex: 'size', key: 'size', render: formatBytes }] : []),
    { title: 'Ngày xóa', dataIndex: 'deletedAt', key: 'deletedAt', render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm') },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: unknown, record: TrashItem) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<UndoOutlined />}
            size="small"
            onClick={() => restoreMutation.mutate({ type, id: record.id })}
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
            <Button type="primary" danger icon={<DeleteOutlined />} size="small">
              Xóa vĩnh viễn
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Tabs defaultActiveKey="file" type="card">
      <Tabs.TabPane tab="Tệp tin" key="file">
        <Table
          dataSource={trashItems?.files || []}
          columns={columns('file')}
          rowKey="id"
          loading={isLoading}
        />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Thư mục" key="folder">
        <Table
          dataSource={trashItems?.folders || []}
          columns={columns('folder')}
          rowKey="id"
          loading={isLoading}
        />
      </Tabs.TabPane>
    </Tabs>
  );
};
