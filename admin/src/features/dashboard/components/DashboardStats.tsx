import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { 
  UserOutlined, 
  FileTextOutlined, 
  DatabaseOutlined, 
  LinkOutlined 
} from '@ant-design/icons';
import { useUsersQuery } from '@/features/users/hooks/useUsersHooks';
import { useFilesQuery } from '@/features/files/hooks/useFilesHooks';
import { useShareLinksQuery } from '@/features/shareLinks/hooks/useShareLinksHooks';
import { useDashboardCategoriesQuery } from '../hooks/useDashboardQuery';

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const DashboardStats: React.FC = () => {
  const { data: users, isLoading: loadingUsers } = useUsersQuery();
  const { data: files, isLoading: loadingFiles } = useFilesQuery();
  const { data: shareLinks, isLoading: loadingLinks } = useShareLinksQuery();
  const { data: categories, isLoading: loadingCategories } = useDashboardCategoriesQuery();

  const totalUsers = users?.length || 0;
  const totalFiles = files?.length || 0;
  // Fallback to active links if isRevoked exists
  const activeLinks = shareLinks?.filter(link => !link.isRevoked).length || 0;
  const totalStorage = categories?.reduce((acc, cat) => acc + cat.totalSize, 0) || 0;

  return (
    <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <Card bordered={false} loading={loadingUsers} style={{ borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          <Statistic
            title="Tổng người dùng"
            value={totalUsers}
            prefix={<UserOutlined style={{ color: '#1677ff' }} />}
            valueStyle={{ color: '#1677ff', fontWeight: 'bold' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card bordered={false} loading={loadingFiles} style={{ borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          <Statistic
            title="Tổng tệp tin"
            value={totalFiles}
            prefix={<FileTextOutlined style={{ color: '#52c41a' }} />}
            valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card bordered={false} loading={loadingCategories} style={{ borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          <Statistic
            title="Dung lượng đã dùng"
            value={totalStorage}
            formatter={(val) => formatBytes(val as number)}
            prefix={<DatabaseOutlined style={{ color: '#faad14' }} />}
            valueStyle={{ color: '#faad14', fontWeight: 'bold' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card bordered={false} loading={loadingLinks} style={{ borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          <Statistic
            title="Liên kết hoạt động"
            value={activeLinks}
            prefix={<LinkOutlined style={{ color: '#eb2f96' }} />}
            valueStyle={{ color: '#eb2f96', fontWeight: 'bold' }}
          />
        </Card>
      </Col>
    </Row>
  );
};
