import React from 'react';
import { Card, Typography } from 'antd';
import { ShareLinkTable } from '../components/ShareLinkTable';

const { Title } = Typography;

const ShareLinksPage: React.FC = () => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Quản lý liên kết chia sẻ</Title>
      </div>
      <Card>
        <ShareLinkTable />
      </Card>
    </div>
  );
};

export default ShareLinksPage;
