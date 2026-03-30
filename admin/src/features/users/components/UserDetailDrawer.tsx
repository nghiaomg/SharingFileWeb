import React from 'react';
import {
  Drawer,
  Descriptions,
  Tag,
  Avatar,
  Space,
  Typography,
  Card,
  Progress,
  Row,
  Col,
  Divider,
  Button,
  Timeline,
  Statistic,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  UnlockOutlined,
  SafetyOutlined,
  CrownOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  FolderOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import type { User } from '../types/user.types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text } = Typography;

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

interface UserDetailDrawerProps {
  visible: boolean;
  user: User | null;
  onClose: () => void;
  onEdit: () => void;
}

export const UserDetailDrawer: React.FC<UserDetailDrawerProps> = ({
  visible,
  user,
  onClose,
  onEdit,
}) => {
  if (!user) return null;

  const usedPercent = user.maxStorage > 0
    ? Math.round(((user.storageUsed || 0) / user.maxStorage) * 100)
    : 0;
  const isNearLimit = usedPercent >= 80;
  const isAdmin = user.roles?.some((r) => r.name === 'ROLE_ADMIN');
  const isPro = user.subscriptionPlan === 'PRO';

  return (
    <Drawer
      title={
        <Space>
          <Avatar
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
            icon={<UserOutlined />}
            size="large"
            style={{ backgroundColor: isAdmin ? '#ff4d4f' : '#1677ff' }}
          />
          <div>
            <Text strong style={{ display: 'block', fontSize: 16 }}>{user.username}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{user.email}</Text>
          </div>
        </Space>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={520}
      extra={
        <Button type="primary" onClick={onEdit}>
          Chỉnh sửa
        </Button>
      }
    >
      {/* Account Status */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="Gói cước"
              value={user.subscriptionPlan}
              prefix={isPro ? <CrownOutlined style={{ color: '#faad14' }} /> : <Tag>FREE</Tag>}
              valueStyle={{ fontSize: 18 }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="2FA"
              value={user.twoFactorEnabled ? 'Bật' : 'Tắt'}
              prefix={user.twoFactorEnabled ? <LockOutlined style={{ color: '#52c41a' }} /> : <UnlockOutlined style={{ color: '#8c8c8c' }} />}
              valueStyle={{ fontSize: 18 }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Vai trò"
              value={isAdmin ? 'Admin' : 'User'}
              prefix={<SafetyOutlined style={{ color: isAdmin ? '#ff4d4f' : '#1677ff' }} />}
              valueStyle={{ fontSize: 18, color: isAdmin ? '#ff4d4f' : '#1677ff' }}
            />
          </Col>
        </Row>
      </Card>

      {/* Storage Usage */}
      <Card
        size="small"
        title={
          <Space>
            <FolderOutlined />
            Dung lượng lưu trữ
          </Space>
        }
        extra={
          <Tag color={isNearLimit ? 'red' : 'green'}>
            {usedPercent}% sử dụng
          </Tag>
        }
        style={{ marginBottom: 16 }}
      >
        <Progress
          percent={usedPercent}
          strokeColor={isNearLimit ? '#ff4d4f' : '#1677ff'}
          format={() => `${formatBytes(user.storageUsed || 0)} / ${formatBytes(user.maxStorage)}`}
          style={{ marginBottom: 16 }}
        />
        <Row gutter={16}>
          <Col span={12}>
            <Text type="secondary">Dung lượng đã dùng</Text>
            <div><Text strong>{formatBytes(user.storageUsed || 0)}</Text></div>
          </Col>
          <Col span={12}>
            <Text type="secondary">Dung lượng tối đa</Text>
            <div><Text strong>{formatBytes(user.maxStorage)}</Text></div>
          </Col>
        </Row>
        <Divider style={{ margin: '12px 0' }} />
        <Row gutter={16}>
          <Col span={12}>
            <Text type="secondary">Kích thước file tối đa</Text>
            <div><Text strong>{formatBytes(user.maxFileSize)}</Text></div>
          </Col>
        </Row>
      </Card>

      {/* Account Information */}
      <Card
        size="small"
        title={
          <Space>
            <UserOutlined />
            Thông tin tài khoản
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Descriptions column={1} size="small">
          <Descriptions.Item label={<Space><MailOutlined /> Email</Space>}>
            <a href={`mailto:${user.email}`}>{user.email}</a>
          </Descriptions.Item>
          <Descriptions.Item label={<Space><CalendarOutlined /> Ngày tạo</Space>}>
            {dayjs(user.createdAt).format('DD/MM/YYYY HH:mm')}
            <Text type="secondary" style={{ marginLeft: 8 }}>
              ({dayjs(user.createdAt).fromNow()})
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label={<Space><ClockCircleOutlined /> Đăng nhập gần nhất</Space>}>
            {user.lastLogin ? (
              <>
                {dayjs(user.lastLogin).format('DD/MM/YYYY HH:mm')}
                <Text type="secondary" style={{ marginLeft: 8 }}>
                  ({dayjs(user.lastLogin).fromNow()})
                </Text>
              </>
            ) : (
              <Tag>Chưa đăng nhập</Tag>
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Roles */}
      <Card
        size="small"
        title={
          <Space>
            <SafetyOutlined />
            Vai trò & Quyền hạn
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Space wrap>
          {user.roles?.map((role) => (
            <Tag
              key={role.name}
              color={
                role.name === 'ROLE_ADMIN' ? 'red' :
                role.name === 'ROLE_MODERATOR' ? 'orange' : 'blue'
              }
              style={{ padding: '4px 12px', fontSize: 13 }}
            >
              {role.name === 'ROLE_ADMIN' && <SafetyOutlined />}
              {role.name === 'ROLE_MODERATOR' && <SafetyOutlined />}
              {' '}{role.name.replace('ROLE_', '')}
            </Tag>
          ))}
        </Space>
      </Card>

      {/* Recent Activity (simulated) */}
      <Card
        size="small"
        title={
          <Space>
            <HistoryOutlined />
            Hoạt động gần đây
          </Space>
        }
      >
        <Timeline
          items={[
            {
              color: 'green',
              children: (
                <div>
                  <Text>Đăng nhập vào hệ thống</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {user.lastLogin ? dayjs(user.lastLogin).fromNow() : 'Chưa có'}
                  </Text>
                </div>
              ),
            },
            {
              color: 'blue',
              children: (
                <div>
                  <Text>Tạo tài khoản</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {dayjs(user.createdAt).format('DD/MM/YYYY')}
                  </Text>
                </div>
              ),
            },
            ...(isPro ? [{
              color: 'gold',
              children: (
                <div>
                  <Text>Nâng cấp lên PRO</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {user.subscriptionPlan === 'PRO' ? 'Đang sử dụng gói PRO' : 'Chưa nâng cấp'}
                  </Text>
                </div>
              ),
            }] : []),
          ]}
        />
      </Card>
    </Drawer>
  );
};
