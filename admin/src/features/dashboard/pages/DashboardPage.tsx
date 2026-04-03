import React from 'react';
import { Row, Col, Typography, Divider } from 'antd';
import { MinimalistStorageBar } from '../components/MinimalistStorageBar';
import { MinimalAccessDistribution } from '../components/MinimalAccessDistribution';
import { MinimalistRecentFiles } from '../components/MinimalistRecentFiles';
import { DashboardStatsGrid } from '../components/DashboardStatsGrid';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { DashboardCharts } from '../components/DashboardCharts';

const { Title, Text } = Typography;

const DashboardPage: React.FC = () => {
    return (
        <div style={{ background: 'transparent', minHeight: '100%', padding: '16px 8px' }}>
            <div style={{ borderBottom: '2px solid var(--text-primary)', paddingBottom: 16, marginBottom: 32 }}>
                <Title level={3} style={{ margin: 0, fontWeight: 400, fontFamily: 'serif', color: 'var(--text-primary)' }}>Bảng điều khiển</Title>
            </div>

            <DashboardStatsGrid />

            <Row gutter={[32, 32]}>
                <Col xs={24} lg={16} style={{ overflow: 'hidden' }}>
                    <DashboardCharts />
                    <div style={{ marginBottom: 40 }}>
                        <Text style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 16 }}>
                            Hoạt động tệp gần đây
                        </Text>
                        <MinimalistRecentFiles />
                    </div>
                    <div>
                        <Text style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 16 }}>
                            Sử dụng tài nguyên
                        </Text>
                        <MinimalistStorageBar />
                    </div>
                </Col>
                <Col xs={24} lg={8}>
                    <div style={{ padding: '24px', border: '1px solid var(--progress-track)', background: 'var(--bg-surface)' }}>
                        <Text style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 20 }}>
                            Phân bổ truy cập
                        </Text>
                        <MinimalAccessDistribution />

                        <Divider style={{ borderColor: 'var(--progress-track)' }} />

                        <Text style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 20 }}>
                            Dòng thời gian
                        </Text>
                        <ActivityTimeline />
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardPage;
