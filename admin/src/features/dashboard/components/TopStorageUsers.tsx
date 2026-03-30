import React from 'react';
import { List, Avatar, Typography, Progress, Tag, Space } from 'antd';
import { UserOutlined, CrownOutlined } from '@ant-design/icons';
import { useUsersQuery } from '@/features/users/hooks/useUsersHooks';

const { Text } = Typography;

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const TopStorageUsers: React.FC = () => {
  const { data: users, isLoading } = useUsersQuery();

  // Sort users by storage used (descending)
  const sortedUsers = React.useMemo(() => {
    return [...(users || [])]
      .sort((a, b) => (b.storageUsed || 0) - (a.storageUsed || 0))
      .slice(0, 5);
  }, [users]);

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  if (sortedUsers.length === 0) {
    return <div>Không có dữ liệu</div>;
  }

  return (
    <List
      loading={isLoading}
      dataSource={sortedUsers}
      renderItem={(user, index) => {
        const percentUsed = user.maxStorage > 0
          ? Math.round(((user.storageUsed || 0) / user.maxStorage) * 100)
          : 0;
        const isNearLimit = percentUsed >= 80;
        const isAdmin = user.roles?.some(r => r.name === 'ROLE_ADMIN');

        return (
          <List.Item
            key={user.id}
            style={{ padding: '12px 0' }}
            extra={
              <Space direction="vertical" align="end" size={0}>
                <Text strong style={{ fontSize: 13 }}>{formatBytes(user.storageUsed || 0)}</Text>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  / {formatBytes(user.maxStorage)}
                </Text>
              </Space>
            }
          >
            <List.Item.Meta
              avatar={
                <div style={{ position: 'relative' }}>
                  <Avatar
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                    icon={<UserOutlined />}
                    style={{
                      border: isAdmin ? '2px solid #faad14' : '2px solid #f0f0f0',
                    }}
                  />
                  {index === 0 && (
                    <CrownOutlined
                      style={{
                        position: 'absolute',
                        top: -4,
                        right: -4,
                        color: '#faad14',
                        fontSize: 14,
                        background: '#fff',
                        borderRadius: '50%',
                        padding: 2,
                      }}
                    />
                  )}
                </div>
              }
              title={
                <Space>
                  <Text strong style={{ fontSize: 13 }}>{user.username}</Text>
                  {isAdmin && <Tag color="gold" style={{ margin: 0 }}>Admin</Tag>}
                  <Tag color={user.subscriptionPlan === 'PRO' ? 'gold' : 'default'}>
                    {user.subscriptionPlan}
                  </Tag>
                </Space>
              }
              description={
                <div style={{ marginTop: 4 }}>
                  <Progress
                    percent={percentUsed}
                    size="small"
                    strokeColor={isNearLimit ? '#ff4d4f' : '#1677ff'}
                    showInfo={false}
                    style={{ marginBottom: 4, width: 150 }}
                  />
                  <Space size={4}>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {percentUsed}% sử dụng
                    </Text>
                    {isNearLimit && (
                      <Tag color="red" style={{ margin: 0, fontSize: 10 }}>
                        Gần đầy
                      </Tag>
                    )}
                  </Space>
                </div>
              }
            />
          </List.Item>
        );
      }}
    />
  );
};
