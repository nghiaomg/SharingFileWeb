import React from 'react';
import { Card, Typography } from 'antd';

const { Text } = Typography;

export const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
}> = ({ title, value, icon, trend }) => {
    return (
        <Card bodyStyle={{ padding: '20px 24px' }} style={{ borderRadius: 0, border: '1px solid var(--progress-track)', background: 'var(--bg-surface)', boxShadow: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <Text style={{ color: 'var(--text-muted)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>{title}</Text>
                    <div style={{ fontSize: 30, fontWeight: 400, color: 'var(--text-primary)', marginTop: 8, fontFamily: 'serif' }}>{value}</div>
                    {trend && <Text style={{ color: '#10b981', fontSize: 13, marginTop: 4, display: 'block' }}>{trend}</Text>}
                </div>
                <div style={{ fontSize: 20, color: 'var(--text-muted)' }}>
                    {icon}
                </div>
            </div>
        </Card>
    );
};
