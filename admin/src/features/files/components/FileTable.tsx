import React from 'react';
import { Table, Button, Space, Tag, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { StorageFile } from '../types/file.types';
import { useFilesQuery, useDeleteFileMutation } from '../hooks/useFilesHooks';
import dayjs from 'dayjs';

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const FileTable: React.FC = () => {
  const { data: files, isLoading } = useFilesQuery();
  const deleteMutation = useDeleteFileMutation();

  const columns = [
    { title: 'Tên file', dataIndex: 'name', key: 'name' },
    { title: 'Kích thước', dataIndex: 'size', key: 'size', render: formatBytes },
    { title: 'Loại', dataIndex: 'type', key: 'type' },
    { title: 'Chủ sở hữu ID', dataIndex: 'ownerId', key: 'ownerId' },
    { 
      title: 'Quyền', 
      dataIndex: 'accessMode', 
      key: 'accessMode',
      render: (mode: string) => (
        <Tag color={mode === 'PUBLIC' ? 'green' : mode === 'RESTRICTED' ? 'orange' : 'default'}>
          {mode}
        </Tag>
      )
    },
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
      render: (_: unknown, record: StorageFile) => (
        <Space size="middle">
          <Popconfirm
            title="Xóa vĩnh viễn tệp này?"
            description="Hành động này không thể hoàn tác."
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
      dataSource={files}
      columns={columns}
      rowKey="id"
      loading={isLoading}
    />
  );
};
