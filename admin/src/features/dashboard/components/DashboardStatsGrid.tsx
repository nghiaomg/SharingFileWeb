import React from 'react';
import { Row, Col } from 'antd';
import { UserOutlined, FileTextOutlined, DatabaseOutlined, LinkOutlined } from '@ant-design/icons';
import { StatCard } from '@/shared/components/StatCard';
import { formatBytes } from '@/shared/utils';
import { useDashboardStats } from '../hooks/useDashboardStats';

export const DashboardStatsGrid: React.FC = () => {
    const { totalUsers, totalFiles, totalStorage, activeLinks } = useDashboardStats();

    return (
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
            <Col xs={24} sm={12} lg={6}>
                <StatCard title="Người dùng đăng ký" value={totalUsers} icon={<UserOutlined style={{ color: '#1677ff' }} />} />
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <StatCard title="Tổng số tệp" value={totalFiles} icon={<FileTextOutlined style={{ color: '#52c41a' }} />} />
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <StatCard title="Dung lượng đã dùng" value={formatBytes(totalStorage)} icon={<DatabaseOutlined style={{ color: '#fa8c16' }} />} />
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <StatCard title="Liên kết đang hoạt động" value={activeLinks} icon={<LinkOutlined style={{ color: '#722ed1' }} />} />
            </Col>
        </Row>
    );
};
