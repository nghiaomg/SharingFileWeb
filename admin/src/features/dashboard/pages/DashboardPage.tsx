import React from 'react';
import { Row, Col, Progress, Typography, Skeleton } from 'antd';
import {
  UserOutlined, FileTextOutlined, DatabaseOutlined, LinkOutlined, FileImageOutlined,
} from '@ant-design/icons';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useStorageUsageQuery, useDashboardRecentFilesQuery } from '../hooks/useDashboardQuery';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { formatBytes } from '@/shared/utils';
import dayjs from 'dayjs';

const { Text } = Typography;

/* ── Stat ── */
const Stat: React.FC<{ value: number | string; icon: React.ReactNode; accent: string }> = ({ value, icon, accent }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
    <div style={{
      width: 44, height: 44, borderRadius: 10,
      background: `${accent}18`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
    }}>
      {icon}
    </div>
    <span style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
      {value}
    </span>
  </div>
);

/* ── Card ── */
const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: 'var(--bg-surface)', borderRadius: 12, padding: '18px 20px', ...style }}>
    {children}
  </div>
);

/* ── Storage ── */
const StorageBar: React.FC = () => {
  const { data: su } = useStorageUsageQuery();
  if (!su) return <Skeleton.Button active style={{ width: '100%', height: 40 }} />;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <Text style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Storage</Text>
        <Text style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          {formatBytes(su.used)} / {formatBytes(su.limit)}
        </Text>
      </div>
      <Progress
        percent={Math.min(Math.round(su.percentUsed), 100)}
        strokeColor={{ '0%': 'var(--accent)', '100%': '#52c41a' }}
        trailColor="var(--progress-track)"
        size={['default', 8]}
        showInfo={false}
      />
    </div>
  );
};

/* ── Access bars ── */
const AccessBars: React.FC = () => {
  const { publicFiles, restrictedFiles, privateFiles, totalFiles } = useDashboardStats();
  const total = totalFiles || 1;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[
        { label: 'Public',     value: publicFiles,    color: '#52c41a' },
        { label: 'Restricted', value: restrictedFiles, color: '#faad14' },
        { label: 'Private',    value: privateFiles,  color: '#8c8c8c' },
      ].map(bar => (
        <div key={bar.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', width: 80 }}>{bar.label}</span>
          <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--progress-track)', overflow: 'hidden' }}>
            <div style={{ width: `${Math.round((bar.value / total) * 100)}%`, height: '100%', borderRadius: 3, background: bar.color }} />
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', width: 32, textAlign: 'right' }}>{bar.value}</span>
        </div>
      ))}
    </div>
  );
};

/* ── Plan badges ── */
const PlanBadges: React.FC = () => {
  const { freeUsers, proUsers } = useDashboardStats();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[
        ['FREE', freeUsers],
        ['PRO',  proUsers],
      ].map(([plan, count]) => (
        <div key={plan} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{
            fontSize: 11, fontWeight: 700,
            background: plan === 'PRO' ? '#fffbe6' : 'var(--bg-hover)',
            color: plan === 'PRO' ? '#d48806' : 'var(--text-muted)',
            padding: '3px 10px', borderRadius: 5,
          }}>
            {plan}
          </span>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{count}</span>
        </div>
      ))}
    </div>
  );
};

/* ── Recent files ── */
const RecentFiles: React.FC = () => {
  const { data: files, isLoading } = useDashboardRecentFilesQuery();
  if (isLoading) return <Skeleton active paragraph={{ rows: 6 }} />;
  if (!files?.length) return <Text style={{ fontSize: 14, color: 'var(--text-muted)' }}>No files</Text>;
  return (
    <div>
      {files.slice(0, 8).map((f) => (
        <div key={f.id} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '9px 0',
          borderBottom: '1px solid var(--progress-track)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
            <FileImageOutlined style={{ fontSize: 14, color: '#52c41a', flexShrink: 0 }} />
            <Text style={{ fontSize: 14, color: 'var(--text-primary)' }} ellipsis>{f.name}</Text>
          </div>
          <Text style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 12, flexShrink: 0 }}>
            {formatBytes(f.size)} · {dayjs(f.createdAt).format('DD/MM')}
          </Text>
        </div>
      ))}
    </div>
  );
};

/* ── DashboardPage ── */
const DashboardPage: React.FC = () => {
  const { totalUsers, totalFiles, totalStorage, activeLinks } = useDashboardStats();

  return (
    <div>
      {/* Row 1: 4 stats */}
      <Row gutter={[20, 20]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6}>
          <Stat value={totalUsers}          icon={<UserOutlined      style={{ color: '#1677ff' }} />} accent="#1677ff" />
        </Col>
        <Col xs={12} sm={6}>
          <Stat value={totalFiles}          icon={<FileTextOutlined  style={{ color: '#52c41a' }} />} accent="#52c41a" />
        </Col>
        <Col xs={12} sm={6}>
          <Stat value={formatBytes(totalStorage)} icon={<DatabaseOutlined style={{ color: '#faad14' }} />} accent="#faad14" />
        </Col>
        <Col xs={12} sm={6}>
          <Stat value={activeLinks}         icon={<LinkOutlined     style={{ color: '#eb2f96' }} />} accent="#eb2f96" />
        </Col>
      </Row>

      {/* Row 2: Storage + Plan + Access */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={14}>
          <Card><StorageBar /></Card>
        </Col>
        <Col xs={12} sm={5}>
          <Card style={{ height: '100%' }}><PlanBadges /></Card>
        </Col>
        <Col xs={12} sm={5}>
          <Card style={{ height: '100%' }}><AccessBars /></Card>
        </Col>
      </Row>

      {/* Row 3: Activity + Recent files */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={10}>
          <Card><ActivityTimeline /></Card>
        </Col>
        <Col xs={24} md={14}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Text style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Recent files</Text>
            </div>
            <RecentFiles />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
