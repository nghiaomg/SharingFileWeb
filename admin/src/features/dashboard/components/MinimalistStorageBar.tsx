import React from 'react';
import { Progress, Skeleton, Typography } from 'antd';
import { useStorageUsageQuery } from '../hooks/useDashboardQuery';
import { formatBytes } from '@/shared/utils';

const { Text } = Typography;

export const MinimalistStorageBar: React.FC = () => {
    const { data: su } = useStorageUsageQuery();

    if (!su) {
        return <Skeleton.Button active style={{ width: '100%', height: 40 }} />;
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>Bộ nhớ hệ thống</Text>
                <Text style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>
                    {formatBytes(su.used)} / {formatBytes(su.limit)}
                </Text>
            </div>
            <Progress
                percent={Math.min(Math.round(su.percentUsed), 100)}
                strokeColor="var(--text-primary)"
                trailColor="var(--progress-track)"
                size={['default', 4]}
                showInfo={false}
            />
        </div>
    );
};
