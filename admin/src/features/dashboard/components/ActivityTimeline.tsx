import React, { useMemo } from 'react';
import { Typography, Empty } from 'antd';
import {
  UploadOutlined,
  ShareAltOutlined,
  DeleteOutlined,
  LoginOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { useDashboardRecentFilesQuery, useNotificationsQuery } from '../hooks/useDashboardQuery';
import { formatBytes } from '@/shared/utils';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

type ActivityType = 'upload' | 'share' | 'delete' | 'login' | 'download';

const META: Record<ActivityType, { icon: React.ReactNode; color: string }> = {
  upload: { icon: <UploadOutlined />, color: '#52c41a' },
  share: { icon: <ShareAltOutlined />, color: '#1677ff' },
  delete: { icon: <DeleteOutlined />, color: '#ff4d4f' },
  login: { icon: <LoginOutlined />, color: '#722ed1' },
  download: { icon: <DownloadOutlined />, color: '#13c2c2' },
};

export const ActivityTimeline: React.FC = () => {
  const { data: recentFiles } = useDashboardRecentFilesQuery();
  const { data: notifications } = useNotificationsQuery();

  const items = useMemo(() => {
    const fromFiles = (recentFiles ?? []).slice(0, 5).map(f => ({
      id: `f-${f.id}`, type: 'upload' as ActivityType, title: f.name,
      desc: formatBytes(f.size), time: f.createdAt,
    }));
    const fromNotifs = (notifications ?? []).filter(n => !n.isRead).slice(0, 3).map(n => ({
      id: `n-${n.id}`, type: 'share' as ActivityType, title: n.title,
      desc: n.message, time: n.createdAt,
    }));
    return [...fromFiles, ...fromNotifs]
      .sort((a, b) => dayjs(b.time).valueOf() - dayjs(a.time).valueOf())
      .slice(0, 6);
  }, [recentFiles, notifications]);

  if (!items.length) return <Empty description="Không có hoạt động" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ margin: '32px 0' }} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {items.map((item, idx) => {
        const meta = META[item.type] ?? META.upload;
        return (
          <div key={item.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '8px 0',
            borderBottom: idx < items.length - 1 ? '1px solid var(--progress-track)' : 'none',
          }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: `${meta.color}18`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              flexShrink: 0,
              color: meta.color,
            }}>
              {meta.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Typography.Text style={{ fontSize: 13, color: 'var(--text-primary)' }} ellipsis>
                {item.title}
              </Typography.Text>
            </div>
            <Typography.Text style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>
              {dayjs(item.time).fromNow()}
            </Typography.Text>
          </div>
        );
      })}
    </div>
  );
};
