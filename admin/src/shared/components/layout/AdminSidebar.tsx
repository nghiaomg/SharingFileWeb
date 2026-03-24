import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  UserOutlined,
  FileOutlined,
  FolderOpenOutlined,
  LinkOutlined,
  BellOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

export const AdminSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/users', icon: <UserOutlined />, label: 'Người dùng' },
    { key: '/files', icon: <FileOutlined />, label: 'Tệp tin (Files)' },
    { key: '/folders', icon: <FolderOpenOutlined />, label: 'Thư mục' },
    { key: '/share-links', icon: <LinkOutlined />, label: 'Liên kết chia sẻ' },
    { key: '/notifications', icon: <BellOutlined />, label: 'Thông báo' },
    { key: '/trash', icon: <DeleteOutlined />, label: 'Thùng rác' },
  ];

  const getSelectedKey = () => {
    const path = location.pathname;
    const match = menuItems.find(item => path.startsWith(item.key));
    return match ? match.key : '/dashboard';
  };

  return (
    <Sider width={250} theme="light" style={{ boxShadow: '2px 0 8px rgba(0,21,41,0.05)', zIndex: 2 }}>
      <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #f0f0f0' }}>
        <h2 style={{ margin: 0, fontWeight: 700, color: '#1677ff', fontSize: '1.2rem' }}>Sharing File</h2>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        style={{ borderRight: 0, padding: '16px 8px' }}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
      />
    </Sider>
  );
};
