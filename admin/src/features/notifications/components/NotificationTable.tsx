import React from 'react';
import { Table, Button, Space, Tag } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import type { Notification } from '../types/notification.types';
import { useNotificationsQuery, useMarkAsReadMutation } from '../hooks/useNotificationsHooks';
import dayjs from 'dayjs';

export const NotificationTable: React.FC = () => {
  const { data: notifications, isLoading } = useNotificationsQuery();
  const markAsReadMutation = useMarkAsReadMutation();

  const columns = [
    { title: 'Tiêu đề', dataIndex: 'title', key: 'title' },
    { title: 'Nội dung', dataIndex: 'message', key: 'message' },
    { title: 'Loại', dataIndex: 'type', key: 'type', render: (type: string) => <Tag color="blue">{type}</Tag> },
    { 
      title: 'Trạng thái', 
      dataIndex: 'isRead', 
      key: 'isRead',
      render: (isRead: boolean) => (
        <Tag color={isRead ? 'default' : 'red'}>
          {isRead ? 'Đã đọc' : 'Chưa đọc'}
        </Tag>
      )
    },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm') },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: unknown, record: Notification) => (
        <Space size="middle">
          {!record.isRead && (
            <Button
              type="text"
              icon={<CheckOutlined />}
              onClick={() => markAsReadMutation.mutate(record.id)}
            >
              Đánh dấu đã đọc
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table
      dataSource={notifications}
      columns={columns}
      rowKey="id"
      loading={isLoading}
    />
  );
};
