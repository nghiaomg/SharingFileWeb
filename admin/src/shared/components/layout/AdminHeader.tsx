import React from 'react';
import { Layout, Dropdown, Space, Avatar, Button } from 'antd';
import type { MenuProps } from 'antd';
import { UserOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, LockOutlined } from '@ant-design/icons';
import { useAuthStore, useLogoutMutation } from '@/features/auth';
import { ChangePasswordModal } from '@/features/auth/components/ChangePasswordModal';

const { Header } = Layout;

interface AdminHeaderProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ collapsed, setCollapsed }) => {
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogoutMutation();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] = React.useState(false);

  const items: MenuProps['items'] = [
    {
      key: 'change-password',
      label: 'Đổi mật khẩu',
      icon: <LockOutlined />,
      onClick: () => setIsChangePasswordModalVisible(true),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Header style={{ padding: '0 16px', background: '#161616', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.4)', zIndex: 1, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        style={{
          fontSize: '16px',
          width: 48,
          height: 48,
        }}
      />
      <Dropdown menu={{ items }} placement="bottomRight">
        <Space style={{ cursor: 'pointer' }}>
          <Avatar icon={<UserOutlined />} />
          <span style={{ fontWeight: 500 }}>{user?.username || 'Admin'}</span>
        </Space>
      </Dropdown>
      
      <ChangePasswordModal 
        open={isChangePasswordModalVisible} 
        onCancel={() => setIsChangePasswordModalVisible(false)} 
      />
    </Header>
  );
};
