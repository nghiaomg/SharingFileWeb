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
  Timeline,
  Button,
  Avatar,
} from 'antd';
import {
  FolderOutlined,
  FolderOpenOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EditOutlined,
  HomeOutlined,
  SafetyOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import type { Folder } from '../types/folder.types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text } = Typography;

interface FolderDetailDrawerProps {
  folder: Folder | null;
  visible: boolean;
  onClose: () => void;
}

export const FolderDetailDrawer: React.FC<FolderDetailDrawerProps> = ({
  folder,
  visible,
  onClose,
}) => {
  if (!folder) return null;

  const isDeleted = folder.isDeleted;

  return (
    <Drawer
      title={
        <Space>
          {isDeleted ? (
            <FolderOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />
          ) : (
            <FolderOpenOutlined style={{ fontSize: 24, color: '#fa8c16' }} />
          )}
          <div>
            <Text strong style={{ display: 'block', fontSize: 16 }}>{folder.name}</Text>
            {isDeleted && <Tag color="red" style={{ marginLeft: 8 }}>Đã xóa</Tag>}
          </div>
        </Space>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={520}
      extra={
        <Button icon={<EditOutlined />} onClick={onClose}>
          Chỉnh sửa
        </Button>
      }
    >
      {/* Status Card */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <div style={{ textAlign: 'center', padding: 16, background: '#f6ffed', borderRadius: 8 }}>
              <FolderOutlined style={{ fontSize: 24, color: isDeleted ? '#ff4d4f' : '#52c41a' }} />
              <div style={{ marginTop: 8 }}>
                <Tag color={isDeleted ? 'red' : 'green'}>
                  {isDeleted ? 'Trong thùng rác' : 'Hoạt động'}
                </Tag>
              </div>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ textAlign: 'center', padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
              {folder.parentId ? (
                <>
                  <FolderOutlined style={{ fontSize: 24, color: '#fa8c16' }} />
                  <div style={{ marginTop: 8 }}>
                    <Tag color="orange">Có thư mục cha</Tag>
                  </div>
                </>
              ) : (
                <>
                  <HomeOutlined style={{ fontSize: 24, color: '#1677ff' }} />
                  <div style={{ marginTop: 8 }}>
                    <Tag color="blue">Thư mục gốc</Tag>
                  </div>
                </>
              )}
            </div>
          </Col>
        </Row>
      </Card>

      {/* Folder Information */}
      <Card
        size="small"
        title={
          <Space>
            <FolderOutlined />
            Thông tin thư mục
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Descriptions column={1} size="small">
          <Descriptions.Item label="ID Thư mục">
            <Text copyable style={{ fontFamily: 'monospace' }}>{folder.id}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Tên thư mục">
            <Text strong>{folder.name}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="ID Chủ sở hữu">
            <Space>
              <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
              <Text copyable style={{ fontFamily: 'monospace' }}>{folder.ownerId}</Text>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Thư mục cha">
            {folder.parentId ? (
              <Tag icon={<FolderOutlined />}>{folder.parentId.substring(0, 12)}...</Tag>
            ) : (
              <Tag icon={<HomeOutlined />} color="blue">Thư mục gốc (Root)</Tag>
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Timeline */}
      <Card
        size="small"
        title={
          <Space>
            <HistoryOutlined />
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
                  <Text strong>Thư mục được tạo</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {dayjs(folder.createdAt).format('DD/MM/YYYY HH:mm')}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    ({dayjs(folder.createdAt).fromNow()})
                  </Text>
                </div>
              ),
            },
            ...(folder.updatedAt && folder.updatedAt !== folder.createdAt ? [{
              color: 'blue',
              children: (
                <div>
                  <Text strong>Cập nhật lần cuối</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {dayjs(folder.updatedAt).format('DD/MM/YYYY HH:mm')}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    ({dayjs(folder.updatedAt).fromNow()})
                  </Text>
                </div>
              ),
            }] : []),
            ...(isDeleted ? [{
              color: 'red',
              children: (
                <div>
                  <Text strong style={{ color: '#ff4d4f' }}>Đã chuyển vào thùng rác</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    Có thể khôi phục trong 30 ngày
                  </Text>
                </div>
              ),
            }] : []),
          ]}
        />
      </Card>

      {/* Quick Info */}
      <Card
        size="small"
        title={
          <Space>
            <SafetyOutlined />
            Thông tin nhanh
          </Space>
        }
      >
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 8, textAlign: 'center' }}>
              <CalendarOutlined style={{ fontSize: 20, color: '#1677ff' }} />
              <div style={{ marginTop: 4 }}>
                <Text type="secondary" style={{ fontSize: 11 }}>Ngày tạo</Text>
                <div><Text style={{ fontSize: 12 }}>{dayjs(folder.createdAt).format('DD/MM/YY')}</Text></div>
              </div>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 8, textAlign: 'center' }}>
              <ClockCircleOutlined style={{ fontSize: 20, color: '#52c41a' }} />
              <div style={{ marginTop: 4 }}>
                <Text type="secondary" style={{ fontSize: 11 }}>Cập nhật</Text>
                <div><Text style={{ fontSize: 12 }}>{folder.updatedAt ? dayjs(folder.updatedAt).format('DD/MM/YY') : '-'}</Text></div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </Drawer>
  );
};
