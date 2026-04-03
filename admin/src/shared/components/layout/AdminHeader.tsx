import React, { useState } from 'react';
import { Layout, Dropdown, Space, Avatar, Button, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LockOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons';
import { useAuthStore, useLogoutMutation } from '@/features/auth';
import { ChangePasswordModal } from '@/features/auth/components/ChangePasswordModal';
import { useTheme } from '@/shared/contexts/useTheme';

const { Header } = Layout;

export const AdminHeader: React.FC<{ collapsed: boolean; setCollapsed: (v: boolean) => void }> = ({
  collapsed, setCollapsed,
}) => {
  const user = useAuthStore(s => s.user);
  const logoutMutation = useLogoutMutation();
  const { mode, toggle } = useTheme();
  const [pwdOpen, setPwdOpen] = useState(false);

  const userMenu: MenuProps['items'] = [
    { key: 'change-password', label: 'Đổi mật khẩu', icon: <LockOutlined />, onClick: () => setPwdOpen(true) },
    { type: 'divider' },
    { key: 'logout', label: 'Đăng xuất', icon: <LogoutOutlined />, danger: true, onClick: () => logoutMutation.mutate() },
  ];

  return (
    <Header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 1,
    }}>
      {/* Menu toggle */}
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        style={{ fontSize: 18, width: 44, height: 44 }}
      />

      {/* Right actions */}
      <Space size={8}>
        <Tooltip title={mode === 'light' ? 'Dark mode' : 'Light mode'}>
          <Button
            type="text"
            icon={mode === 'light' ? <MoonOutlined /> : <SunOutlined />}
            onClick={toggle}
            style={{ fontSize: 17, width: 40, height: 40 }}
          />
        </Tooltip>

        <Dropdown menu={{ items: userMenu }} placement="bottomRight">
          <Space style={{ cursor: 'pointer', padding: '4px 8px' }}>
            <Avatar icon={<UserOutlined />} size={34} />
            <span style={{
              fontWeight: 500,
              fontSize: 14,
              color: 'var(--text-primary)',
            }}>
              {user?.username ?? 'Admin'}
            </span>
          </Space>
        </Dropdown>
      </Space>

      <ChangePasswordModal open={pwdOpen} onCancel={() => setPwdOpen(false)} />
    </Header>
  );
};
