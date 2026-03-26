import React from 'react';
import { Table, Button, Space, Tag, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { ShareLink } from '../types/shareLink.types';
import { useShareLinksQuery, useDeleteShareLinkMutation } from '../hooks/useShareLinksHooks';
import dayjs from 'dayjs';

export const ShareLinkTable: React.FC = () => {
  const { data: shareLinks, isLoading } = useShareLinksQuery();
  const deleteMutation = useDeleteShareLinkMutation();

  const columns = [
    { title: 'Token / URL', dataIndex: 'token', key: 'token' },
    { title: 'File ID', dataIndex: 'fileId', key: 'fileId' },
    { 
      title: 'Quyền', 
      dataIndex: 'permission', 
      key: 'permission',
      render: (perm: string) => (
        <Tag color={perm === 'VIEW' ? 'blue' : 'orange'}>
          {perm}
        </Tag>
      )
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'isRevoked', 
      key: 'isRevoked',
      render: (isRevoked: boolean) => (
        <Tag color={isRevoked ? 'red' : 'green'}>
          {isRevoked ? 'Đã thu hồi' : 'Đang hoạt động'}
        </Tag>
      )
    },
    { 
      title: 'Hết hạn lúc', 
      dataIndex: 'expiresAt', 
      key: 'expiresAt', 
      render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : 'Không giới hạn' 
    },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm') },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: unknown, record: ShareLink) => (
        <Space size="middle">
          <Popconfirm
            title="Thu hồi liên kết này?"
            description="Hành động này sẽ làm liên kết không thể truy cập được nữa."
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="Thu hồi"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="primary" danger icon={<DeleteOutlined />} size="small">
              Thu hồi
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      scroll={{ x: 'max-content' }}
      dataSource={shareLinks}
      columns={columns}
      rowKey="id"
      loading={isLoading}
    />
  );
};
