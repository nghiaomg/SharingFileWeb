import React, { useState } from 'react';
import { Table, Button, Space, Tag, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { User } from '../types/user.types';
import { useUsersQuery, useDeleteUserMutation } from '../hooks/useUsersHooks';
import { UserFormModal } from './UserFormModal';
import dayjs from 'dayjs';

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const UserTable: React.FC = () => {
  const { data: users, isLoading } = useUsersQuery();
  const deleteMutation = useDeleteUserMutation();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const columns = [
    { title: 'Username', dataIndex: 'username', key: 'username' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Roles',
      key: 'roles',
      render: (_: unknown, record: User) => (
        <>
          {record.roles.map((role) => (
            <Tag color={role.name === 'ROLE_ADMIN' ? 'red' : 'blue'} key={role.name}>
              {role.name.replace('ROLE_', '')}
            </Tag>
          ))}
        </>
      ),
    },
    { title: 'Gói', dataIndex: 'subscriptionPlan', key: 'plan', render: (plan: string) => <Tag color={plan === 'PRO' ? 'gold' : 'default'}>{plan}</Tag> },
    { title: 'Dung lượng tối đa', dataIndex: 'maxStorage', key: 'maxStorage', render: formatBytes },
    { title: 'Ngày tham gia', dataIndex: 'createdAt', key: 'createdAt', render: (date: string) => dayjs(date).format('DD/MM/YYYY') },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: unknown, record: User) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setSelectedUser(record);
              setEditModalVisible(true);
            }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa người dùng?"
            description="Bạn có chắc chắn muốn xóa người dùng này không?"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="primary" danger icon={<DeleteOutlined />} size="small">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table
        scroll={{ x: 'max-content' }}
        dataSource={users}
        columns={columns}
        rowKey="id"
        loading={isLoading}
      />
      <UserFormModal
        visible={editModalVisible}
        initialData={selectedUser}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedUser(null);
        }}
      />
    </>
  );
};
