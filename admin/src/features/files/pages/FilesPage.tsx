import React from 'react';
import { Card, Typography } from 'antd';
import { FileTable } from '../components/FileTable';

const { Title } = Typography;

const FilesPage: React.FC = () => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Quản lý tệp tin</Title>
      </div>
      <Card>
        <FileTable />
      </Card>
    </div>
  );
};

export default FilesPage;
