import React from 'react';
import { Card, Typography } from 'antd';
import { UserTable } from '../components/UserTable';

const { Title } = Typography;

const UsersPage: React.FC = () => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Quản lý người dùng</Title>
      </div>
      <Card>
        <UserTable />
      </Card>
    </div>
  );
};

export default UsersPage;
