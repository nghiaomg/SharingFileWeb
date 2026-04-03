import React from 'react';
import { Typography, Skeleton } from 'antd';
import { CrownOutlined } from '@ant-design/icons';
import { useUsersQuery } from '@/features/users/hooks/useUsersHooks';
import { formatBytes } from '@/shared/utils';

const { Text } = Typography;

export const TopStorageUsers: React.FC = () => {
  const { data: users, isLoading } = useUsersQuery();

  const sorted = React.useMemo(() =>
    [...(users ?? [])].sort((a, b) => (b.storageUsed ?? 0) - (a.storageUsed ?? 0)).slice(0, 5),
    [users]
  );

  if (isLoading) return <Skeleton active paragraph={{ rows: 5 }} />;
  if (!sorted.length) return <Text style={{ fontSize: 13, color: 'var(--text-muted)' }}>No data</Text>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {sorted.map((user, idx) => {
        const pct = user.maxStorage > 0 ? Math.round(((user.storageUsed ?? 0) / user.maxStorage) * 100) : 0;
        const isNear = pct >= 80;

        return (
          <div key={user.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {idx === 0 && <CrownOutlined style={{ color: '#faad14', fontSize: 12 }} />}
                <Text style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{user.username}</Text>
              </div>
              <Text style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {formatBytes(user.storageUsed ?? 0)}
              </Text>
            </div>
            <div style={{ height: 5, borderRadius: 3, background: 'var(--progress-track)', overflow: 'hidden' }}>
              <div style={{
                width: `${pct}%`,
                height: '100%',
                borderRadius: 2,
                background: isNear ? '#ff4d4f' : 'var(--accent)',
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
