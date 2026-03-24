import React from 'react';
import { Card, Typography } from 'antd';
import { NotificationTable } from '../components/NotificationTable';

const { Title } = Typography;

const NotificationsPage: React.FC = () => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Thông báo cá nhân</Title>
      </div>
      <Card>
        <NotificationTable />
      </Card>
    </div>
  );
};

export default NotificationsPage;
