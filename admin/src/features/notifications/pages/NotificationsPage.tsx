import React, { useState, useMemo } from 'react';
import {
  Card,
  Typography,
  Button,
  Space,
  Table,
  Tag,
  Row,
  Col,
  Statistic,
  Tooltip,
  Empty,
  message,
  Badge,
  Popconfirm,
  Segmented,
  Input,
  Drawer,
  Descriptions,
  Timeline,
} from 'antd';
import {
  BellOutlined,
  ReloadOutlined,
  CheckOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  ShareAltOutlined,
  UploadOutlined,
  DeleteOutlined,
  UserAddOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  NotificationOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNotificationsQuery, useUnreadCountQuery, useMarkNotificationReadMutation, useMarkAllNotificationsReadMutation } from '../hooks/useNotificationsHooks';
import type { Notification } from '../types/notification.types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

const getNotificationIcon = (type: string) => {
  switch (type?.toUpperCase()) {
    case 'SHARE':
      return <ShareAltOutlined style={{ color: '#1677ff' }} />;
    case 'UPLOAD':
      return <UploadOutlined style={{ color: '#52c41a' }} />;
    case 'DELETE':
      return <DeleteOutlined style={{ color: '#ff4d4f' }} />;
    case 'REGISTER':
      return <UserAddOutlined style={{ color: '#722ed1' }} />;
    case 'WARNING':
      return <WarningOutlined style={{ color: '#faad14' }} />;
    case 'INFO':
      return <InfoCircleOutlined style={{ color: '#1677ff' }} />;
    default:
      return <NotificationOutlined style={{ color: '#8c8c8c' }} />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type?.toUpperCase()) {
    case 'SHARE':
      return 'blue';
    case 'UPLOAD':
      return 'green';
    case 'DELETE':
      return 'red';
    case 'REGISTER':
      return 'purple';
    case 'WARNING':
      return 'orange';
    case 'INFO':
      return 'cyan';
    default:
      return 'default';
  }
};

const NotificationsPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [searchText, setSearchText] = useState('');
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const { data: notifications, isLoading, refetch } = useNotificationsQuery();
  const { data: unreadCount } = useUnreadCountQuery();
  const markReadMutation = useMarkNotificationReadMutation();
  const markAllReadMutation = useMarkAllNotificationsReadMutation();

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    if (!notifications) return [];

    return notifications.filter((notif) => {
      const matchesSearch =
        searchText === '' ||
        notif.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        notif.message?.toLowerCase().includes(searchText.toLowerCase());

      let matchesFilter = true;
      switch (filter) {
        case 'unread':
          matchesFilter = !notif.isRead;
          break;
        case 'read':
          matchesFilter = notif.isRead;
          break;
      }

      return matchesSearch && matchesFilter;
    });
  }, [notifications, filter, searchText]);

  // Statistics
  const stats = useMemo(() => {
    const total = notifications?.length || 0;
    const unread = notifications?.filter((n) => !n.isRead).length || 0;
    const read = notifications?.filter((n) => n.isRead).length || 0;
    const shareNotifications = notifications?.filter((n) => n.type === 'SHARE').length || 0;

    return { total, unread, read, shareNotifications };
  }, [notifications]);

  const handleMarkAsRead = (notificationId: string) => {
    markReadMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllReadMutation.mutate();
    message.success('Đã đánh dấu tất cả thông báo là đã đọc!');
  };

  const handleViewDetail = (notification: Notification) => {
    setSelectedNotification(notification);
    setDetailDrawerVisible(true);

    // Mark as read when viewing
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
  };

  const columns: ColumnsType<Notification> = [
    {
      title: (
        <Space>
          {getNotificationIcon('INFO')}
          <span>Thông báo</span>
        </Space>
      ),
      key: 'notification',
      fixed: 'left',
      width: 350,
      render: (_, record) => (
        <Space>
          {!record.isRead && (
            <Badge status="processing" />
          )}
          {getNotificationIcon(record.type)}
          <div style={{ maxWidth: 280 }}>
            <Text
              strong={!record.isRead}
              style={{
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {record.title}
            </Text>
            <Text
              type="secondary"
              style={{
                fontSize: 12,
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {record.message}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => (
        <Tag color={getNotificationColor(type)} icon={getNotificationIcon(type)}>
          {type || 'INFO'}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 100,
      render: (_, record) => (
        record.isRead ? (
          <Tag icon={<CheckCircleOutlined />} color="default">Đã đọc</Tag>
        ) : (
          <Tag icon={<ClockCircleOutlined />} color="processing">Chưa đọc</Tag>
        )
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => (
        <Tooltip title={dayjs(date).format('DD/MM/YYYY HH:mm:ss')}>
          <Space>
            <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
            <Text type="secondary">{dayjs(date).fromNow()}</Text>
          </Space>
        </Tooltip>
      ),
      sorter: (a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Hành động',
      key: 'action',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          {!record.isRead && (
            <Tooltip title="Đánh dấu đã đọc">
              <Button
                type="text"
                icon={<CheckOutlined style={{ color: '#52c41a' }} />}
                onClick={() => handleMarkAsRead(record.id)}
                loading={markReadMutation.isPending}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Space>
          <Title level={2} style={{ margin: 0 }}>Thông báo</Title>
          {unreadCount && unreadCount.count > 0 && (
            <Badge count={unreadCount.count} overflowCount={99} />
          )}
        </Space>
        <Space>
          <Popconfirm
            title="Đánh dấu tất cả là đã đọc?"
            onConfirm={handleMarkAllAsRead}
            okText="Xác nhận"
            cancelText="Hủy"
            disabled={stats.unread === 0}
          >
            <Button
              icon={<CheckCircleOutlined />}
              onClick={handleMarkAllAsRead}
              disabled={stats.unread === 0}
              loading={markAllReadMutation.isPending}
            >
              Đánh dấu tất cả đã đọc
            </Button>
          </Popconfirm>
          <Button icon={<ReloadOutlined spin={isLoading} />} onClick={() => refetch()}>
            Làm mới
          </Button>
        </Space>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Tổng thông báo"
              value={stats.total}
              prefix={<BellOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Chưa đọc"
              value={stats.unread}
              prefix={<NotificationOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Đã đọc"
              value={stats.read}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Chia sẻ"
              value={stats.shareNotifications}
              prefix={<ShareAltOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Input
              placeholder="Tìm kiếm thông báo..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ maxWidth: 300 }}
            />
          </Col>
          <Col>
            <Segmented
              options={[
                { label: `Tất cả (${stats.total})`, value: 'all' },
                { label: `Chưa đọc (${stats.unread})`, value: 'unread' },
                { label: `Đã đọc (${stats.read})`, value: 'read' },
              ]}
              value={filter}
              onChange={(value) => setFilter(value as typeof filter)}
            />
          </Col>
        </Row>
      </Card>

      {/* Notifications Table */}
      <Card>
        {filteredNotifications.length > 0 ? (
          <Table
            scroll={{ x: 'max-content' }}
            dataSource={filteredNotifications}
            columns={columns}
            rowKey="id"
            loading={isLoading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} thông báo`,
            }}
            rowClassName={(record) => !record.isRead ? 'ant-table-row-unread' : ''}
          />
        ) : (
          <Empty
            description={searchText || filter !== 'all'
              ? 'Không tìm thấy thông báo nào phù hợp'
              : 'Chưa có thông báo nào'
            }
          />
        )}
      </Card>

      {/* Notification Detail Drawer */}
      <Drawer
        title={
          <Space>
            {selectedNotification && getNotificationIcon(selectedNotification.type)}
            <span>Chi tiết thông báo</span>
          </Space>
        }
        placement="right"
        onClose={() => {
          setDetailDrawerVisible(false);
          setSelectedNotification(null);
        }}
        open={detailDrawerVisible}
        width={480}
        extra={
          selectedNotification && !selectedNotification.isRead && (
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => handleMarkAsRead(selectedNotification.id)}
              loading={markReadMutation.isPending}
            >
              Đánh dấu đã đọc
            </Button>
          )
        }
      >
        {selectedNotification && (
          <div>
            <Card
              size="small"
              style={{ marginBottom: 16, background: selectedNotification.isRead ? '#fafafa' : '#f6ffed' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {!selectedNotification.isRead && <Badge status="processing" />}
                  <Tag color={getNotificationColor(selectedNotification.type)} icon={getNotificationIcon(selectedNotification.type)}>
                    {selectedNotification.type || 'INFO'}
                  </Tag>
                  <Text type="secondary" style={{ marginLeft: 'auto' }}>
                    {selectedNotification.isRead ? (
                      <Tag icon={<CheckCircleOutlined />} color="default" style={{ margin: 0 }}>Đã đọc</Tag>
                    ) : (
                      <Tag icon={<ClockCircleOutlined />} color="processing" style={{ margin: 0 }}>Chưa đọc</Tag>
                    )}
                  </Text>
                </div>
              </Space>
            </Card>

            <Card size="small" title="Nội dung" style={{ marginBottom: 16 }}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Tiêu đề">
                  <Text strong>{selectedNotification.title}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Nội dung">
                  <Text>{selectedNotification.message}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Thời gian">
                  <Space>
                    {dayjs(selectedNotification.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                    <Text type="secondary">({dayjs(selectedNotification.createdAt).fromNow()})</Text>
                  </Space>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {selectedNotification.metadata && Object.keys(selectedNotification.metadata).length > 0 && (
              <Card size="small" title="Thông tin bổ sung" style={{ marginBottom: 16 }}>
                <Descriptions column={1} size="small">
                  {Object.entries(selectedNotification.metadata).map(([key, value]) => (
                    <Descriptions.Item key={key} label={key}>
                      <Text copyable style={{ fontFamily: 'monospace' }}>{value}</Text>
                    </Descriptions.Item>
                  ))}
                </Descriptions>
              </Card>
            )}

            <Card size="small" title="Lịch sử">
              <Timeline
                items={[
                  {
                    color: selectedNotification.isRead ? 'green' : 'blue',
                    children: (
                      <div>
                        <Text strong>{selectedNotification.isRead ? 'Đã đọc' : 'Thông báo mới'}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {dayjs(selectedNotification.createdAt).format('DD/MM/YYYY HH:mm')}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          ({dayjs(selectedNotification.createdAt).fromNow()})
                        </Text>
                      </div>
                    ),
                  },
                ]}
              />
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default NotificationsPage;
