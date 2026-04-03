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
  Progress,
  Avatar,
  Tooltip,
  Row,
  Col,
  Segmented,
  Badge,
  message,
} from 'antd';
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  SafetyOutlined,
  CrownOutlined,
  LockOutlined,
  UnlockOutlined,
  ReloadOutlined,
  PlusOutlined,
  TeamOutlined,
  FilterOutlined,
  FileOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { UserFormModal } from '../components/UserFormModal';
import { UserDetailDrawer } from '../components/UserDetailDrawer';
import { useUsersQuery, useDeleteUserMutation, useUpgradeUserPlanMutation } from '../hooks/useUsersHooks';
import type { User } from '../types/user.types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { StatCard } from '@/shared/components/StatCard';

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
type FilterStatus = 'all' | 'pro' | 'free' | 'admin';

const UsersPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data: users, isLoading, refetch } = useUsersQuery();
  const deleteMutation = useDeleteUserMutation();
  const upgradePlanMutation = useUpgradeUserPlanMutation();

  // Filter users based on search and status
  const filteredUsers = useMemo(() => {
    if (!users) return [];

    return users.filter((user) => {
      // Search filter
      const matchesSearch =
        searchText === '' ||
        user.username.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(searchText.toLowerCase());

      // Status filter
      const isAdmin = user.roles?.some((r) => r.name === 'ROLE_ADMIN');
      const isPro = user.subscriptionPlan === 'PRO';

      let matchesStatus = true;
      switch (filterStatus) {
        case 'pro':
          matchesStatus = isPro;
          break;
        case 'free':
          matchesStatus = !isPro;
          break;
        case 'admin':
          matchesStatus = isAdmin;
          break;
      }

      return matchesSearch && matchesStatus;
    });
  }, [users, searchText, filterStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = users?.length || 0;
    const proCount = users?.filter((u) => u.subscriptionPlan === 'PRO').length || 0;
    const freeCount = users?.filter((u) => u.subscriptionPlan === 'FREE').length || 0;
    const adminCount = users?.filter((u) => u.roles?.some((r) => r.name === 'ROLE_ADMIN')).length || 0;
    const newUsersToday = users?.filter((u) => dayjs(u.createdAt).isAfter(dayjs().startOf('day'))).length || 0;

    return { total, proCount, freeCount, adminCount, newUsersToday };
  }, [users]);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditModalVisible(true);
  };

  const handleViewDetail = (user: User) => {
    setSelectedUser(user);
    setDetailDrawerVisible(true);
  };

  const handleDeleteUser = (userId: string) => {
    deleteMutation.mutate(userId);
  };

  const handleUpgradePlan = (userId: string) => {
    upgradePlanMutation.mutate(userId);
    message.success('Nâng cấp gói PRO thành công!');
  };

  const columns: ColumnsType<User> = [
    {
      title: 'Người dùng',
      key: 'user',
      fixed: 'left',
      width: 250,
      render: (_, record) => (
        <Space>
          <Avatar
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${record.username}`}
            icon={<UserOutlined />}
            style={{ backgroundColor: '#1677ff' }}
          />
          <div>
            <Text strong style={{ display: 'block' }}>{record.username}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Vai trò',
      key: 'roles',
      width: 150,
      render: (_, record) => (
        <Space wrap>
          {record.roles?.map((role) => (
            <Tag
              key={role.name}
              color={role.name === 'ROLE_ADMIN' ? 'red' : role.name === 'ROLE_MODERATOR' ? 'orange' : 'blue'}
              icon={role.name === 'ROLE_ADMIN' ? <CrownOutlined /> : undefined}
            >
              {role.name.replace('ROLE_', '')}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Gói cước',
      dataIndex: 'subscriptionPlan',
      key: 'plan',
      width: 100,
      render: (plan: string) => (
        <Tag color={plan === 'PRO' ? 'gold' : 'default'} icon={plan === 'PRO' ? <CrownOutlined /> : undefined}>
          {plan}
        </Tag>
      ),
    },
    {
      title: 'Dung lượng',
      key: 'storage',
      width: 200,
      render: (_, record) => {
        const usedPercent = record.maxStorage > 0
          ? Math.round(((record.storageUsed || 0) / record.maxStorage) * 100)
          : 0;
        const isNearLimit = usedPercent >= 80;

        return (
          <div>
            <Text style={{ fontSize: 12 }}>{formatBytes(record.storageUsed || 0)} / {formatBytes(record.maxStorage)}</Text>
            <Progress
              percent={usedPercent}
              size="small"
              strokeColor={isNearLimit ? '#ff4d4f' : '#1677ff'}
              showInfo={false}
              style={{ marginTop: 4 }}
            />
          </div>
        );
      },
    },
    {
      title: 'Kích thước file tối đa',
      dataIndex: 'maxFileSize',
      key: 'maxFileSize',
      width: 130,
      render: (size: number) => formatBytes(size),
    },
    {
      title: 'Ngày tham gia',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => (
        <Tooltip title={dayjs(date).format('DD/MM/YYYY HH:mm')}>
          <Text type="secondary">{dayjs(date).format('DD/MM/YYYY')}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Đăng nhập gần nhất',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: 130,
      render: (date: string | null) => (
        date ? (
          <Tooltip title={dayjs(date).format('DD/MM/YYYY HH:mm')}>
            <Text type="secondary">{dayjs(date).fromNow()}</Text>
          </Tooltip>
        ) : (
          <Text type="secondary">Chưa đăng nhập</Text>
        )
      ),
    },
    {
      title: '2FA',
      dataIndex: 'twoFactorEnabled',
      key: '2fa',
      width: 80,
      render: (enabled: boolean) => (
        <Tooltip title={enabled ? 'Đã bật' : 'Chưa bật'}>
          {enabled ? (
            <LockOutlined style={{ color: '#52c41a' }} />
          ) : (
            <UnlockOutlined style={{ color: '#8c8c8c' }} />
          )}
        </Tooltip>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<FileOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditUser(record)}
            />
          </Tooltip>
          {record.subscriptionPlan !== 'PRO' && (
            <Tooltip title="Nâng cấp PRO">
              <Button
                type="text"
                icon={<CrownOutlined style={{ color: '#faad14' }} />}
                onClick={() => handleUpgradePlan(record.id)}
                loading={upgradePlanMutation.isPending}
              />
            </Tooltip>
          )}
          <Popconfirm
            title="Xóa người dùng?"
            description="Hành động này sẽ xóa vĩnh viễn tài khoản người dùng."
            icon={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
            onConfirm={() => handleDeleteUser(record.id)}
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
        <Title level={2} style={{ margin: 0 }}>Quản lý người dùng</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            Làm mới
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setSelectedUser(null); setEditModalVisible(true); }}>
            Thêm người dùng
          </Button>
        </Space>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Tổng người dùng" value={stats.total} icon={<TeamOutlined style={{ color: '#1677ff' }} />} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Người dùng PRO" value={stats.proCount} icon={<CrownOutlined style={{ color: '#faad14' }} />} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Người dùng FREE" value={stats.freeCount} icon={<UserOutlined style={{ color: '#8c8c8c' }} />} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Quản trị viên" value={stats.adminCount} icon={<SafetyOutlined style={{ color: '#ff4d4f' }} />} />
        </Col>
      </Row>

      {/* Filters */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Input
              placeholder="Tìm kiếm theo tên hoặc email..."
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
              <Segmented
                options={[
                  { label: `Tất cả (${stats.total})`, value: 'all' },
                  { label: <Badge count={stats.proCount} showZero color="gold"><span>PRO</span></Badge>, value: 'pro' },
                  { label: <Badge count={stats.freeCount} showZero><span>FREE</span></Badge>, value: 'free' },
                  { label: <Badge count={stats.adminCount} showZero color="red"><span>Admin</span></Badge>, value: 'admin' },
                ]}
                value={filterStatus}
                onChange={(value) => setFilterStatus(value as FilterStatus)}
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

      {/* Users Table */}
      <Card>
        <Table
          scroll={{ x: 'max-content' }}
          dataSource={filteredUsers}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} người dùng`,
          }}
          rowClassName={(record) => record.roles?.some((r) => r.name === 'ROLE_ADMIN') ? 'ant-table-row-admin' : ''}
        />
      </Card>

      {/* User Edit Modal */}
      <UserFormModal
        visible={editModalVisible}
        initialData={selectedUser}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedUser(null);
        }}
      />

      {/* User Detail Drawer */}
      <UserDetailDrawer
        visible={detailDrawerVisible}
        user={selectedUser}
        onClose={() => {
          setDetailDrawerVisible(false);
          setSelectedUser(null);
        }}
        onEdit={() => {
          setDetailDrawerVisible(false);
          setEditModalVisible(true);
        }}
      />
    </div>
  );
};

export default UsersPage;
