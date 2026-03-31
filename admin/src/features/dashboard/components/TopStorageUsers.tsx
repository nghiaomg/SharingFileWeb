import React from 'react';
import { Avatar, Typography, Progress, Tag, Space, Spin } from 'antd';
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

  const sortedUsers = React.useMemo(() => {
    return [...(users || [])]
      .sort((a, b) => (b.storageUsed || 0) - (a.storageUsed || 0))
      .slice(0, 5);
  }, [users]);

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: 20 }}><Spin /></div>;
  }

  if (sortedUsers.length === 0) {
    return <div style={{ textAlign: 'center', padding: 20 }}>Không có dữ liệu</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {sortedUsers.map((user, index) => {
        const percentUsed = user.maxStorage > 0
          ? Math.round(((user.storageUsed || 0) / user.maxStorage) * 100)
          : 0;
        const isNearLimit = percentUsed >= 80;
        const isAdmin = user.roles?.some(r => r.name === 'ROLE_ADMIN');

        return (
          <div
            key={user.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 0',
              borderBottom: index < sortedUsers.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}
          >
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <Avatar
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                icon={<UserOutlined />}
                style={{
                  border: isAdmin ? '2px solid #faad14' : '2px solid rgba(255,255,255,0.1)',
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
                    background: '#161616',
                    borderRadius: '50%',
                    padding: 2,
                  }}
                />
              )}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <Space style={{ marginBottom: 4 }}>
                <Text strong style={{ fontSize: 13 }}>{user.username}</Text>
                {isAdmin && <Tag color="gold" style={{ margin: 0 }}>Admin</Tag>}
                <Tag color={user.subscriptionPlan === 'PRO' ? 'gold' : 'default'}>
                  {user.subscriptionPlan}
                </Tag>
              </Space>
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
            </div>

            {/* Storage info */}
            <div style={{ flexShrink: 0, textAlign: 'right' }}>
              <Text strong style={{ fontSize: 13 }}>{formatBytes(user.storageUsed || 0)}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 11 }}>
                / {formatBytes(user.maxStorage)}
              </Text>
            </div>
          </div>
        );
      })}
    </div>
  );
};
