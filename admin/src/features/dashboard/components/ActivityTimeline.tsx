import React from 'react';
import { Timeline, Tag, Typography, Empty } from 'antd';
import {
  UploadOutlined,
  ShareAltOutlined,
  DeleteOutlined,
  LoginOutlined,
  DownloadOutlined,
  EditOutlined,
  FolderAddOutlined,
  UserAddOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useDashboardRecentFilesQuery, useNotificationsQuery } from '../hooks/useDashboardQuery';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text } = Typography;

interface Activity {
  id: string;
  type: 'upload' | 'share' | 'delete' | 'login' | 'download' | 'edit' | 'create_folder' | 'register' | 'warning';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
  color: string;
}

export const ActivityTimeline: React.FC = () => {
  const { data: recentFiles } = useDashboardRecentFilesQuery();
  const { data: notifications } = useNotificationsQuery();

  // Combine activities from files and notifications
  const activities: Activity[] = React.useMemo(() => {
    const fileActivities: Activity[] = (recentFiles || []).slice(0, 5).map((file) => ({
      id: `file-${file.id}`,
      type: 'upload' as const,
      title: 'Tải lên tệp mới',
      description: `${file.name} (${formatBytes(file.size)})`,
      timestamp: file.createdAt,
      icon: <UploadOutlined />,
      color: '#52c41a',
    }));

    const notificationActivities: Activity[] = (notifications || [])
      .filter((n) => !n.isRead)
      .slice(0, 3)
      .map((notif) => ({
        id: `notif-${notif.id}`,
        type: 'share' as const,
        title: notif.title,
        description: notif.message,
        timestamp: notif.createdAt,
        icon: <ShareAltOutlined />,
        color: '#1677ff',
      }));

    return [...fileActivities, ...notificationActivities]
      .sort((a, b) => dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf())
      .slice(0, 8);
  }, [recentFiles, notifications]);

  const getIconForType = (type: Activity['type']) => {
    switch (type) {
      case 'upload':
        return <UploadOutlined style={{ color: '#52c41a' }} />;
      case 'share':
        return <ShareAltOutlined style={{ color: '#1677ff' }} />;
      case 'delete':
        return <DeleteOutlined style={{ color: '#ff4d4f' }} />;
      case 'login':
        return <LoginOutlined style={{ color: '#722ed1' }} />;
      case 'download':
        return <DownloadOutlined style={{ color: '#13c2c2' }} />;
      case 'edit':
        return <EditOutlined style={{ color: '#faad14' }} />;
      case 'create_folder':
        return <FolderAddOutlined style={{ color: '#fa8c16' }} />;
      case 'register':
        return <UserAddOutlined style={{ color: '#eb2f96' }} />;
      case 'warning':
        return <WarningOutlined style={{ color: '#fa8c16' }} />;
      default:
        return <UploadOutlined />;
    }
  };

  const getTagForType = (type: Activity['type']) => {
    const tags: Record<Activity['type'], { color: string; label: string }> = {
      upload: { color: 'green', label: 'Upload' },
      share: { color: 'blue', label: 'Chia sẻ' },
      delete: { color: 'red', label: 'Xóa' },
      login: { color: 'purple', label: 'Đăng nhập' },
      download: { color: 'cyan', label: 'Tải xuống' },
      edit: { color: 'orange', label: 'Chỉnh sửa' },
      create_folder: { color: 'gold', label: 'Tạo thư mục' },
      register: { color: 'magenta', label: 'Đăng ký' },
      warning: { color: 'orange', label: 'Cảnh báo' },
    };
    const tag = tags[type];
    return <Tag color={tag.color}>{tag.label}</Tag>;
  };

  if (activities.length === 0) {
    return <Empty description="Không có hoạt động gần đây" />;
  }

  return (
    <Timeline
      items={activities.map((activity) => ({
        dot: (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: `${activity.color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
            }}
          >
            {getIconForType(activity.type)}
          </div>
        ),
        children: (
          <div style={{ paddingBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Text strong style={{ fontSize: 13 }}>{activity.title}</Text>
              {getTagForType(activity.type)}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>{activity.description}</Text>
            <div style={{ marginTop: 4 }}>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {dayjs(activity.timestamp).fromNow()}
              </Text>
            </div>
          </div>
        ),
      }))}
    />
  );
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
