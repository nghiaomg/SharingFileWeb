import React, { useState } from 'react';
import { Typography, Row, Col, Card, Segmented, Space, Statistic, Progress, Tag, Tooltip } from 'antd';
import {
  FolderOutlined,
  LinkOutlined,
  SafetyCertificateOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { DashboardStats } from '../components/DashboardStats';
import { StorageCategoryChart } from '../components/StorageCategoryChart';
import { RecentFilesTable } from '../components/RecentFilesTable';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { TopStorageUsers } from '../components/TopStorageUsers';
import { useUsersQuery } from '@/features/users/hooks/useUsersHooks';
import { useFilesQuery } from '@/features/files/hooks/useFilesHooks';
import { useFoldersQuery } from '@/features/folders/hooks/useFoldersHooks';
import { useShareLinksQuery } from '@/features/shareLinks/hooks/useShareLinksHooks';
import { useStorageUsageQuery } from '../hooks/useDashboardQuery';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

type ViewMode = 'overview' | 'detailed' | 'analytics';

const DashboardPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const { data: users } = useUsersQuery();
  const { data: files } = useFilesQuery();
  const { data: folders } = useFoldersQuery();
  const { data: shareLinks } = useShareLinksQuery();
  const { data: storageUsage } = useStorageUsageQuery();

  const totalFiles = files?.length || 0;
  const totalFolders = folders?.length || 0;
  const activeLinks = shareLinks?.filter(link => !link.isRevoked).length || 0;

  // Calculate growth metrics (simulated based on data)
  const publicFiles = files?.filter(f => f.accessMode === 'PUBLIC').length || 0;
  const restrictedFiles = files?.filter(f => f.accessMode === 'RESTRICTED').length || 0;
  const privateFiles = files?.filter(f => f.accessMode === 'PRIVATE').length || 0;

  // User statistics
  const proUsers = users?.filter(u => u.subscriptionPlan === 'PRO').length || 0;
  const freeUsers = users?.filter(u => u.subscriptionPlan === 'FREE').length || 0;

  // Share link statistics
  const linksWithPassword = shareLinks?.filter(l => l.hasPassword).length || 0;
  const expiredLinks = shareLinks?.filter(l => l.expiresAt && dayjs(l.expiresAt).isBefore(dayjs())).length || 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Bảng điều khiển</Title>
        <Space>
          <Segmented
            options={[
              { label: 'Tổng quan', value: 'overview' },
              { label: 'Chi tiết', value: 'detailed' },
              { label: 'Phân tích', value: 'analytics' },
            ]}
            value={viewMode}
            onChange={(value) => setViewMode(value as ViewMode)}
          />
        </Space>
      </div>

      {/* Main Stats Cards */}
      <DashboardStats />

      {/* Storage Usage Progress */}
      {storageUsage && (
        <Card style={{ marginBottom: 24 }} loading={!storageUsage}>
          <Row gutter={24} align="middle">
            <Col span={16}>
              <div>
                <Text strong>Tổng dung lượng đã sử dụng</Text>
                <Progress
                  percent={Math.round(storageUsage.percentUsed)}
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                  format={() => `${formatBytes(storageUsage.used)} / ${formatBytes(storageUsage.limit)}`}
                />
              </div>
            </Col>
            <Col span={8}>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Gói FREE"
                    value={freeUsers}
                    suffix="người"
                    prefix={<Tag color="default">FREE</Tag>}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Gói PRO"
                    value={proUsers}
                    suffix="người"
                    prefix={<Tag color="gold">PRO</Tag>}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>
      )}

      <Row gutter={[24, 24]}>
        {/* Storage Categories Chart */}
        <Col xs={24} lg={viewMode === 'overview' ? 12 : 8}>
          <StorageCategoryChart />
        </Col>

        {/* File Distribution */}
        {viewMode !== 'overview' && (
          <Col xs={24} lg={8}>
            <Card title="Phân bố quyền truy cập" size="small">
              <div style={{ marginBottom: 16 }}>
                <Row justify="space-between">
                  <Text>Công khai</Text>
                  <Text strong>{publicFiles} tệp</Text>
                </Row>
                <Progress percent={totalFiles > 0 ? Math.round((publicFiles / totalFiles) * 100) : 0} strokeColor="#52c41a" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <Row justify="space-between">
                  <Text>Hạn chế</Text>
                  <Text strong>{restrictedFiles} tệp</Text>
                </Row>
                <Progress percent={totalFiles > 0 ? Math.round((restrictedFiles / totalFiles) * 100) : 0} strokeColor="#faad14" />
              </div>
              <div>
                <Row justify="space-between">
                  <Text>Riêng tư</Text>
                  <Text strong>{privateFiles} tệp</Text>
                </Row>
                <Progress percent={totalFiles > 0 ? Math.round((privateFiles / totalFiles) * 100) : 0} strokeColor="#8c8c8c" />
              </div>
            </Card>
          </Col>
        )}

        {/* Quick Stats */}
        <Col xs={24} lg={viewMode === 'overview' ? 12 : 8}>
          <Card title="Thống kê nhanh" size="small">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Tooltip title="Tổng số thư mục trong hệ thống">
                  <Statistic
                    title="Thư mục"
                    value={totalFolders}
                    prefix={<FolderOutlined style={{ color: '#fa8c16' }} />}
                    styles={{ content: { color: '#fa8c16', fontSize: 24 } }}
                  />
                </Tooltip>
              </Col>
              <Col span={12}>
                <Tooltip title="Link chia sẻ đang hoạt động">
                  <Statistic
                    title="Link hoạt động"
                    value={activeLinks}
                    prefix={<LinkOutlined style={{ color: '#eb2f96' }} />}
                    styles={{ content: { color: '#eb2f96', fontSize: 24 } }}
                  />
                </Tooltip>
              </Col>
              <Col span={12}>
                <Tooltip title="Link có mật khẩu bảo vệ">
                  <Statistic
                    title="Bảo mật"
                    value={linksWithPassword}
                    suffix={`/ ${activeLinks}`}
                    prefix={<SafetyCertificateOutlined style={{ color: '#52c41a' }} />}
                    styles={{ content: { color: '#52c41a', fontSize: 24 } }}
                  />
                </Tooltip>
              </Col>
              <Col span={12}>
                <Tooltip title="Link đã hết hạn">
                  <Statistic
                    title="Đã hết hạn"
                    value={expiredLinks}
                    prefix={<ClockCircleOutlined style={{ color: '#ff4d4f' }} />}
                    styles={{ content: { color: '#ff4d4f', fontSize: 24 } }}
                  />
                </Tooltip>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Analytics View - Additional Charts */}
        {viewMode === 'analytics' && (
          <>
            <Col xs={24} lg={12}>
              <Card title="Hoạt động hệ thống" size="small">
                <ActivityTimeline />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Top người dùng sử dụng dung lượng" size="small">
                <TopStorageUsers />
              </Card>
            </Col>
          </>
        )}

        {/* Recent Files */}
        <Col xs={24}>
          <RecentFilesTable />
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
