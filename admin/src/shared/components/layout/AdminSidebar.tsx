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
import { useTheme } from '@/shared/contexts/useTheme';

const { Sider } = Layout;

export const AdminSidebar: React.FC<{ collapsed: boolean; setCollapsed: (v: boolean) => void }> = ({
  collapsed, setCollapsed,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode } = useTheme();

  const menuItems: MenuProps['items'] = [
    {
      label: 'TỔNG QUAN',
      key: 'overview',
      type: 'group',
      children: [
        { key: '/dashboard',    icon: <DashboardOutlined />, label: 'Dashboard' },
        { key: '/notifications', icon: <BellOutlined />,     label: 'Thông báo' },
      ],
    },
    {
      label: 'QUẢN TRỊ DỮ LIỆU',
      key: 'data',
      type: 'group',
      children: [
        { key: '/files',       icon: <FileOutlined />,       label: 'Tệp tin' },
        { key: '/folders',      icon: <FolderOpenOutlined />, label: 'Thư mục' },
        { key: '/share-links',  icon: <LinkOutlined />,       label: 'Liên kết chia sẻ' },
      ],
    },
    {
      label: 'HỆ THỐNG',
      key: 'system',
      type: 'group',
      children: [
        { key: '/users', icon: <UserOutlined />,     label: 'Người dùng' },
        { key: '/trash', icon: <DeleteOutlined />,   label: 'Thùng rác' },
      ],
    },
  ];

  const selected = [
    '/dashboard', '/notifications',
    '/files', '/folders', '/share-links',
    '/users', '/trash',
  ].find(p => location.pathname.startsWith(p)) ?? '/dashboard';

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onBreakpoint={broken => { if (broken) setCollapsed(true); }}
      breakpoint="lg"
      collapsedWidth={0}
      width={248}
      style={{
        boxShadow: 'var(--sidebar-shadow)',
        zIndex: 2,
        background: 'var(--sidebar-bg)',
        borderRight: 'var(--sidebar-border)',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div className="sidebar-logo">
        <span style={{
          fontWeight: 800,
          fontSize: collapsed ? 16 : 18,
          color: 'var(--sidebar-logo-color)',
          transition: 'font-size 0.2s',
          letterSpacing: '-0.5px',
        }}>
          {collapsed ? 'SF' : 'Sharing File'}
        </span>
      </div>

      {/* Menu */}
      <Menu
        mode="inline"
        theme={mode}
        selectedKeys={[selected]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        style={{ borderRight: 0, padding: '12px 8px', background: 'transparent' }}
      />
    </Sider>
  );
};
