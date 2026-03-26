import React from 'react';
import { Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
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

interface AdminSidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuProps['items'] = [
    {
      label: 'TỔNG QUAN',
      key: 'overview',
      type: 'group',
      children: [
        { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
        { key: '/notifications', icon: <BellOutlined />, label: 'Thông báo' },
      ],
    },
    {
      label: 'QUẢN TRỊ DỮ LIỆU',
      key: 'data',
      type: 'group',
      children: [
        { key: '/files', icon: <FileOutlined />, label: 'Tệp tin (Files)' },
        { key: '/folders', icon: <FolderOpenOutlined />, label: 'Thư mục' },
        { key: '/share-links', icon: <LinkOutlined />, label: 'Liên kết chia sẻ' },
      ],
    },
    {
      label: 'HỆ THỐNG',
      key: 'system',
      type: 'group',
      children: [
        { key: '/users', icon: <UserOutlined />, label: 'Người dùng' },
        { key: '/trash', icon: <DeleteOutlined />, label: 'Thùng rác' },
      ],
    },
  ];

  const getSelectedKey = () => {
    const path = location.pathname;
    const flatPaths = [
      '/dashboard', '/notifications',
      '/files', '/folders', '/share-links',
      '/users', '/trash'
    ];
    const match = flatPaths.find(p => path.startsWith(p));
    return match ? match : '/dashboard';
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      onBreakpoint={(broken) => {
        if (broken) {
          setCollapsed(true);
        }
      }}
      breakpoint="lg"
      collapsedWidth="0"
      width={250}
      theme="light"
      style={{ boxShadow: '2px 0 8px rgba(0,21,41,0.05)', zIndex: 2 }}
    >
      <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #f0f0f0', overflow: 'hidden' }}>
        <h2 style={{ margin: 0, fontWeight: 700, color: '#1677ff', fontSize: collapsed ? '1.2rem' : '1.5rem', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
          {collapsed ? 'SF' : 'Sharing File'}
        </h2>
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
