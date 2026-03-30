import React from 'react';
import {
  Drawer,
  Descriptions,
  Tag,
  Space,
  Typography,
  Card,
  Row,
  Col,
  Divider,
  Button,
  Timeline,
  message,
} from 'antd';
import {
  LinkOutlined,
  CopyOutlined,
  LockOutlined,
  UnlockOutlined,
  EyeOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import type { ShareLink } from '../types/shareLink.types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text } = Typography;

interface ShareLinkDetailDrawerProps {
  link: ShareLink | null;
  visible: boolean;
  onClose: () => void;
  onCopyLink: (link: ShareLink) => void;
}

export const ShareLinkDetailDrawer: React.FC<ShareLinkDetailDrawerProps> = ({
  link,
  visible,
  onClose,
  onCopyLink,
}) => {
  if (!link) return null;

  const isExpired = link.expiresAt && dayjs(link.expiresAt).isBefore(dayjs());
  const isActive = !link.isRevoked && !isExpired;
  const shareUrl = link.fullUrl || `${window.location.origin}/share/${link.token}`;

  return (
    <Drawer
      title={
        <Space>
          <LinkOutlined style={{ fontSize: 24, color: '#1677ff' }} />
          <div>
            <Text strong style={{ display: 'block', fontSize: 16 }}>Chi tiết liên kết chia sẻ</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{link.token?.substring(0, 16)}...</Text>
          </div>
        </Space>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={520}
      extra={
        <Space>
          <Button icon={<CopyOutlined />} onClick={() => onCopyLink(link)}>
            Sao chép liên kết
          </Button>
        </Space>
      }
    >
      {/* Status Card */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <div style={{ textAlign: 'center', padding: 16, background: isActive ? '#f6ffed' : '#fff1f0', borderRadius: 8, border: isActive ? '1px solid #b7eb8f' : '1px solid #ffccc7' }}>
              {isActive ? (
                <>
                  <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                  <div style={{ marginTop: 8 }}>
                    <Tag color="green">Hoạt động</Tag>
                  </div>
                </>
              ) : (
                <>
                  <CloseCircleOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />
                  <div style={{ marginTop: 8 }}>
                    <Tag color="red">{link.isRevoked ? 'Đã thu hồi' : 'Đã hết hạn'}</Tag>
                  </div>
                </>
              )}
            </div>
          </Col>
          <Col span={8}>
            <div style={{ textAlign: 'center', padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
              {link.permission === 'DOWNLOAD' ? (
                <>
                  <DownloadOutlined style={{ fontSize: 24, color: '#1677ff' }} />
                  <div style={{ marginTop: 8 }}>
                    <Tag color="blue">Tải xuống</Tag>
                  </div>
                </>
              ) : (
                <>
                  <EyeOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                  <div style={{ marginTop: 8 }}>
                    <Tag color="green">Xem</Tag>
                  </div>
                </>
              )}
            </div>
          </Col>
          <Col span={8}>
            <div style={{ textAlign: 'center', padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
              {link.hasPassword ? (
                <>
                  <LockOutlined style={{ fontSize: 24, color: '#faad14' }} />
                  <div style={{ marginTop: 8 }}>
                    <Tag color="gold">Có mật khẩu</Tag>
                  </div>
                </>
              ) : (
                <>
                  <UnlockOutlined style={{ fontSize: 24, color: '#8c8c8c' }} />
                  <div style={{ marginTop: 8 }}>
                    <Tag>Không mật khẩu</Tag>
                  </div>
                </>
              )}
            </div>
          </Col>
        </Row>
      </Card>

      {/* Share Link Info */}
      <Card
        size="small"
        title={
          <Space>
            <LinkOutlined />
            Liên kết chia sẻ
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Token">
            <Space>
              <Text copyable={{ text: link.token }} style={{ fontFamily: 'monospace' }}>
                {link.token}
              </Text>
              <Button
                type="text"
                size="small"
                icon={<CopyOutlined />}
                onClick={() => {
                  navigator.clipboard.writeText(link.token || '');
                  message.success('Đã sao chép token!');
                }}
              />
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="URL đầy đủ">
            <Text copyable={{ text: shareUrl }} style={{ wordBreak: 'break-all', fontSize: 12 }}>
              {shareUrl}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="File ID">
            <Text copyable style={{ fontFamily: 'monospace' }}>{link.fileId}</Text>
          </Descriptions.Item>
        </Descriptions>

        <Divider style={{ margin: '12px 0' }} />

        <Button block icon={<CopyOutlined />} onClick={() => onCopyLink(link)}>
          Sao chép liên kết chia sẻ
        </Button>
      </Card>

      {/* Permission & Security */}
      <Card
        size="small"
        title={
          <Space>
            <SafetyOutlined />
            Quyền & Bảo mật
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Text type="secondary">Quyền truy cập:</Text>
            <div style={{ marginTop: 4 }}>
              <Tag icon={link.permission === 'DOWNLOAD' ? <DownloadOutlined /> : <EyeOutlined />} color={link.permission === 'DOWNLOAD' ? 'blue' : 'green'}>
                {link.permission === 'DOWNLOAD' ? 'Tải xuống' : 'Xem'}
              </Tag>
            </div>
          </Col>
          <Col span={12}>
            <Text type="secondary">Bảo mật mật khẩu:</Text>
            <div style={{ marginTop: 4 }}>
              <Tag icon={link.hasPassword ? <LockOutlined /> : <UnlockOutlined />} color={link.hasPassword ? 'gold' : 'default'}>
                {link.hasPassword ? 'Có mật khẩu' : 'Không có'}
              </Tag>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Timeline */}
      <Card
        size="small"
        title={
          <Space>
            <CalendarOutlined />
            Lịch sử
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Timeline
          items={[
            {
              color: 'green',
              children: (
                <div>
                  <Text strong>Liên kết được tạo</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {dayjs(link.createdAt).format('DD/MM/YYYY HH:mm')}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    ({dayjs(link.createdAt).fromNow()})
                  </Text>
                </div>
              ),
            },
            ...(link.expiresAt ? [{
              color: isExpired ? 'red' : 'blue',
              children: (
                <div>
                  <Text strong>Ngày hết hạn</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {dayjs(link.expiresAt).format('DD/MM/YYYY HH:mm')}
                  </Text>
                  <br />
                  {isExpired ? (
                    <Tag color="red" style={{ marginTop: 4 }}>Đã hết hạn</Tag>
                  ) : (
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      Còn lại: {dayjs(link.expiresAt).fromNow()}
                    </Text>
                  )}
                </div>
              ),
            }] : [{
              color: 'gold',
              children: (
                <div>
                  <Text strong>Không có thời hạn</Text>
                  <br />
                  <Tag color="gold">Vĩnh viễn</Tag>
                </div>
              ),
            }]),
            ...(link.isRevoked ? [{
              color: 'red',
              children: (
                <div>
                  <Text strong style={{ color: '#ff4d4f' }}>Liên kết đã bị thu hồi</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    Liên kết không còn hoạt động
                  </Text>
                </div>
              ),
            }] : []),
          ]}
        />
      </Card>

      {/* Creator Info */}
      <Card
        size="small"
        title={
          <Space>
            <UserOutlined />
            Người tạo
          </Space>
        }
      >
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Người tạo">
            <Space>
              <UserOutlined />
              <Text>{link.createdBy || 'N/A'}</Text>
            </Space>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </Drawer>
  );
};
