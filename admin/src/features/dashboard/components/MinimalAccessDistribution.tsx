import React from 'react';
import { Typography } from 'antd';
import { useDashboardStats } from '../hooks/useDashboardStats';

const { Text } = Typography;

export const MinimalAccessDistribution: React.FC = () => {
    const { publicFiles, restrictedFiles, privateFiles } = useDashboardStats();
    const data = [
        { label: 'Công khai', value: publicFiles },
        { label: 'Giới hạn', value: restrictedFiles },
        { label: 'Riêng tư', value: privateFiles },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.map((item) => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--progress-track)', paddingBottom: 8 }}>
                    <Text style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{item.label}</Text>
                    <Text style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 600 }}>{item.value}</Text>
                </div>
            ))}
        </div>
    );
};
