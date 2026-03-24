import React from 'react';
import { Typography, Row, Col } from 'antd';
import { DashboardStats } from '../components/DashboardStats';
import { StorageCategoryChart } from '../components/StorageCategoryChart';
import { RecentFilesTable } from '../components/RecentFilesTable';

const { Title } = Typography;

const DashboardPage: React.FC = () => {
  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>Dashboard</Title>
      
      <DashboardStats />

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <StorageCategoryChart />
        </Col>
      </Row>

      <RecentFilesTable />
    </div>
  );
};

export default DashboardPage;
