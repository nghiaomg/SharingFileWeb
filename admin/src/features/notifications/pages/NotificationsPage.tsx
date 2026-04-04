import React, { useState, useMemo } from 'react';
import {
  Card,
  Typography,
  Button,
  Space,
  Tag,
  Row,
  Col,
  Tooltip,
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
import { StatCard } from '@/shared/components/StatCard';
import ResponsiveCardList from '@/shared/components/ResponsiveCardList';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

const getNotificationIcon = (type: string) => {
  switch (type?.toUpperCase()) {
    case 'SHARE': return <ShareAltOutlined style={{ color: '#1677ff' }} />;
    case 'UPLOAD': return <UploadOutlined style={{ color: '#52c41a' }} />;
    case 'DELETE': return <DeleteOutlined style={{ color: '#ff4d4f' }} />;
    case 'REGISTER': return <UserAddOutlined style={{ color: '#722ed1' }} />;
    case 'WARNING': return <WarningOutlined style={{ color: '#faad14' }} />;
    case 'INFO': return <InfoCircleOutlined style={{ color: '#1677ff' }} />;
    default: return <NotificationOutlined style={{ color: '#8c8c8c' }} />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type?.toUpperCase()) {
    case 'SHARE': return 'blue';
    case 'UPLOAD': return 'green';
    case 'DELETE': return 'red';
    case 'REGISTER': return 'purple';
    case 'WARNING': return 'orange';
    case 'INFO': return 'cyan';
    default: return 'default';
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

  const filteredNotifications = useMemo(() => {
    if (!notifications) return [];
    return notifications.filter((notif) => {
      const matchesSearch =
        searchText === '' ||
        notif.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        notif.message?.toLowerCase().includes(searchText.toLowerCase());
      let matchesFilter = true;
      switch (filter) {
        case 'unread': matchesFilter = !notif.isRead; break;
        case 'read': matchesFilter = notif.isRead; break;
      }
      return matchesSearch && matchesFilter;
    });
  }, [notifications, filter, searchText]);

  const stats = useMemo(() => {
    const total = notifications?.length || 0;
    const unread = notifications?.filter((n) => !n.isRead).length || 0;
    const read = notifications?.filter((n) => n.isRead).length || 0;
    const shareNotifications = notifications?.filter((n) => n.type === 'SHARE').length || 0;
    return { total, unread, read, shareNotifications };
  }, [notifications]);

  const handleMarkAsRead = (notificationId: string) => markReadMutation.mutate(notificationId);

  const handleMarkAllAsRead = () => {
    markAllReadMutation.mutate();
    message.success('Đã đánh dấu tất cả thông báo là đã đọc!');
  };

  const handleViewDetail = (notification: Notification) => {
    setSelectedNotification(notification);
    setDetailDrawerVisible(true);
    if (!notification.isRead) handleMarkAsRead(notification.id);
  };

  /* ── Table columns ── */
  const columns: ColumnsType<Notification> = [
    {
      title: 'Thông báo',
      key: 'notification',
      width: 350,
      render: (_, record) => (
        <Space>
          {!record.isRead && <Badge status="processing" />}
          {getNotificationIcon(record.type)}
          <div style={{ maxWidth: 280 }}>
            <Text strong={!record.isRead} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{record.title}</Text>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{record.message}</Text>
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
        <Tag color={getNotificationColor(type)} icon={getNotificationIcon(type)}>{type || 'INFO'}</Tag>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 100,
      render: (_, record) => (
        record.isRead
          ? <Tag icon={<CheckCircleOutlined />} color="default">Đã đọc</Tag>
          : <Tag icon={<ClockCircleOutlined />} color="processing">Chưa đọc</Tag>
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
          <Tooltip title="Xem chi tiết"><Button type="text" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)} /></Tooltip>
          {!record.isRead && (
            <Tooltip title="Đánh dấu đã đọc">
              <Button type="text" icon={<CheckOutlined style={{ color: '#52c41a' }} />} onClick={() => handleMarkAsRead(record.id)} loading={markReadMutation.isPending} />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  /* ── Card renderer for mobile ── */
  const renderNotificationCard = (notification: Notification) => (
    <Space direction="vertical" style={{ width: '100%' }} size={8}>
      {/* Header */}
      <Space align="start" style={{ width: '100%' }}>
        {!notification.isRead && <Badge status="processing" />}
        {getNotificationIcon(notification.type)}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text strong={!notification.isRead} style={{ display: 'block', wordBreak: 'break-word' }}>{notification.title}</Text>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{notification.message}</Text>
        </div>
        <Tag color={getNotificationColor(notification.type)} style={{ fontSize: 10, margin: 0 }}>{notification.type || 'INFO'}</Tag>
      </Space>

      {/* Status + time */}
      <Row gutter={[8, 4]}>
        <Col span={12}>
          <Text type="secondary" style={{ fontSize: 11 }}>Trạng thái</Text>
          <br />
          {notification.isRead
            ? <Tag icon={<CheckCircleOutlined />} color="default" style={{ margin: 0 }}>Đã đọc</Tag>
            : <Tag icon={<ClockCircleOutlined />} color="processing" style={{ margin: 0 }}>Chưa đọc</Tag>
          }
        </Col>
        <Col span={12}>
          <Text type="secondary" style={{ fontSize: 11 }}>Thời gian</Text>
          <br />
          <Text style={{ fontSize: 12 }}>{dayjs(notification.createdAt).format('DD/MM/YYYY')}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>{dayjs(notification.createdAt).fromNow()}</Text>
        </Col>
      </Row>

      {/* Actions */}
      <Space style={{ marginTop: 4 }}>
        <Button size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(notification)}>Chi tiết</Button>
        {!notification.isRead && (
          <Button size="small" icon={<CheckOutlined style={{ color: '#52c41a' }} />} onClick={() => handleMarkAsRead(notification.id)} loading={markReadMutation.isPending}>Đã đọc</Button>
        )}
      </Space>
    </Space>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Space>
          <Title level={2} style={{ margin: 0 }}>Thông báo</Title>
          {unreadCount && unreadCount.count > 0 && <Badge count={unreadCount.count} overflowCount={99} />}
        </Space>
        <Space>
          <Popconfirm title="Đánh dấu tất cả là đã đọc?" onConfirm={handleMarkAllAsRead} okText="Xác nhận" cancelText="Hủy" disabled={stats.unread === 0}>
            <Button icon={<CheckCircleOutlined />} onClick={handleMarkAllAsRead} disabled={stats.unread === 0} loading={markAllReadMutation.isPending}>Đánh dấu tất cả đã đọc</Button>
          </Popconfirm>
          <Button icon={<ReloadOutlined spin={isLoading} />} onClick={() => refetch()}>Làm mới</Button>
        </Space>
      </div>

      {/* Statistics */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}><StatCard title="Tổng thông báo" value={stats.total} icon={<NotificationOutlined style={{ color: '#1677ff' }} />} /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Chưa đọc" value={stats.unread} icon={<NotificationOutlined style={{ color: '#ff4d4f' }} />} /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Đã đọc" value={stats.read} icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />} /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Chia sẻ" value={stats.shareNotifications} icon={<ShareAltOutlined style={{ color: '#722ed1' }} />} /></Col>
      </Row>

      {/* Filters */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Input placeholder="Tìm kiếm thông báo..." prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} allowClear style={{ maxWidth: 300 }} />
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

      {/* Table / Cards */}
      <ResponsiveCardList
        data={filteredNotifications}
        columns={columns}
        renderCard={renderNotificationCard}
        loading={isLoading}
        onReload={refetch}
        emptyText={searchText || filter !== 'all' ? 'Không tìm thấy thông báo nào phù hợp' : 'Chưa có thông báo nào'}
      />

      {/* Detail Drawer */}
      <Drawer
        title={<Space>{selectedNotification && getNotificationIcon(selectedNotification.type)}<span>Chi tiết thông báo</span></Space>}
        placement="right"
        onClose={() => { setDetailDrawerVisible(false); setSelectedNotification(null); }}
        open={detailDrawerVisible}
        width={480}
        extra={
          selectedNotification && !selectedNotification.isRead && (
            <Button type="primary" icon={<CheckOutlined />} onClick={() => handleMarkAsRead(selectedNotification.id)} loading={markReadMutation.isPending}>Đánh dấu đã đọc</Button>
          )
        }
      >
        {selectedNotification && (
          <div>
            <Card size="small" style={{ marginBottom: 16, background: selectedNotification.isRead ? '#fafafa' : '#f6ffed' }}>
              <Space orientation="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {!selectedNotification.isRead && <Badge status="processing" />}
                  <Tag color={getNotificationColor(selectedNotification.type)} icon={getNotificationIcon(selectedNotification.type)}>{selectedNotification.type || 'INFO'}</Tag>
                  <Text type="secondary" style={{ marginLeft: 'auto' }}>
                    {selectedNotification.isRead
                      ? <Tag icon={<CheckCircleOutlined />} color="default" style={{ margin: 0 }}>Đã đọc</Tag>
                      : <Tag icon={<ClockCircleOutlined />} color="processing" style={{ margin: 0 }}>Chưa đọc</Tag>
                    }
                  </Text>
                </div>
              </Space>
            </Card>

            <Card size="small" title="Nội dung" style={{ marginBottom: 16 }}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Tiêu đề"><Text strong>{selectedNotification.title}</Text></Descriptions.Item>
                <Descriptions.Item label="Nội dung"><Text>{selectedNotification.message}</Text></Descriptions.Item>
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
                items={[{
                  color: selectedNotification.isRead ? 'green' : 'blue',
                  content: (
                    <div>
                      <Text strong>{selectedNotification.isRead ? 'Đã đọc' : 'Thông báo mới'}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 11 }}>{dayjs(selectedNotification.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 11 }}>({dayjs(selectedNotification.createdAt).fromNow()})</Text>
                    </div>
                  ),
                }]}
              />
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default NotificationsPage;
