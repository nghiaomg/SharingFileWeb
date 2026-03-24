import React from 'react';
import { Card, Typography } from 'antd';
import { FolderTable } from '../components/FolderTable';

const { Title } = Typography;

const FoldersPage: React.FC = () => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Quản lý thư mục</Title>
      </div>
      <Card>
        <FolderTable />
      </Card>
    </div>
  );
};

export default FoldersPage;
