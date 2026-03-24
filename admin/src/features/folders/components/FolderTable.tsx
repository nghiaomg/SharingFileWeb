import React from 'react';
import { Table, Button, Space, Tag, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { Folder } from '../types/folder.types';
import { useFoldersQuery, useDeleteFolderMutation } from '../hooks/useFoldersHooks';
import dayjs from 'dayjs';

export const FolderTable: React.FC = () => {
  const { data: folders, isLoading } = useFoldersQuery();
  const deleteMutation = useDeleteFolderMutation();

  const columns = [
    { title: 'Tên thư mục', dataIndex: 'name', key: 'name' },
    { title: 'Thư mục cha ID', dataIndex: 'parentId', key: 'parentId', render: (id: string) => id || 'Gốc' },
    { title: 'Chủ sở hữu ID', dataIndex: 'ownerId', key: 'ownerId' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'isDeleted', 
      key: 'isDeleted',
      render: (isDeleted: boolean) => (
        <Tag color={isDeleted ? 'red' : 'green'}>
          {isDeleted ? 'Trong thùng rác' : 'Bình thường'}
        </Tag>
      )
    },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm') },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: unknown, record: Folder) => (
        <Space size="middle">
          <Popconfirm
            title="Xóa vĩnh viễn thư mục này?"
            description="Hành động này sẽ xóa cả các thư mục và file con bên trong nó."
            onConfirm={() => deleteMutation.mutate(record.id)}
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
    <Table
      dataSource={folders}
      columns={columns}
      rowKey="id"
      loading={isLoading}
    />
  );
};
