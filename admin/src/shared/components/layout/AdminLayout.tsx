import React, { Suspense, useState } from 'react';
import { Layout, Spin } from 'antd';
import { Outlet } from 'react-router-dom';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';

const { Content } = Layout;

export const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh', background: '#0f0f0f' }}>
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Layout style={{ background: '#0f0f0f' }}>
        <AdminHeader collapsed={collapsed} setCollapsed={setCollapsed} />
        <Content style={{ margin: 0, overflow: 'initial', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 16, background: '#0f0f0f', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Suspense fallback={<div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>}>
              <Outlet />
            </Suspense>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
