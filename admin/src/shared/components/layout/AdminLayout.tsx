import React, { Suspense } from 'react';
import { Layout, Spin } from 'antd';
import { Outlet } from 'react-router-dom';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';

const { Content } = Layout;

export const AdminLayout: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <AdminSidebar />
      <Layout>
        <AdminHeader />
        <Content style={{ margin: 0, overflow: 'initial', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 24, background: '#fff', flex: 1, display: 'flex', flexDirection: 'column', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)' }}>
            <Suspense fallback={<div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>}>
              <Outlet />
            </Suspense>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
