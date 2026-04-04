import React, { useState, useMemo } from 'react';
import {
  Card,
  Typography,
  Input,
  Button,
  Space,
  Tag,
  Popconfirm,
  Row,
  Col,
  Tooltip,
  message,
  Segmented,
} from 'antd';
import {
  SearchOutlined,
  DeleteOutlined,
  LinkOutlined,
  CopyOutlined,
  ReloadOutlined,
  LockOutlined,
  UnlockOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { ShareLinkDetailDrawer } from '../components/ShareLinkDetailDrawer';
import { useShareLinksQuery, useDeleteShareLinkMutation } from '../hooks/useShareLinksHooks';
import type { ShareLink } from '../types/shareLink.types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { StatCard } from '@/shared/components/StatCard';
import ResponsiveCardList from '@/shared/components/ResponsiveCardList';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

const ShareLinksPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'revoked' | 'expired'>('all');
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedLink, setSelectedLink] = useState<ShareLink | null>(null);

  const { data: shareLinks, isLoading, refetch } = useShareLinksQuery();
  const deleteMutation = useDeleteShareLinkMutation();

  const filteredLinks = useMemo(() => {
    if (!shareLinks) return [];
    return shareLinks.filter((link) => {
      const matchesSearch =
        searchText === '' ||
        link.token?.toLowerCase().includes(searchText.toLowerCase()) ||
        link.fileId?.toLowerCase().includes(searchText.toLowerCase()) ||
        link.createdBy?.toLowerCase().includes(searchText.toLowerCase());

      let matchesStatus = true;
      const isExpired = link.expiresAt ? dayjs(link.expiresAt).isBefore(dayjs()) : false;
      const isRevoked = link.isRevoked;
      switch (filterStatus) {
        case 'active': matchesStatus = !isRevoked && !isExpired; break;
        case 'revoked': matchesStatus = isRevoked; break;
        case 'expired': matchesStatus = isExpired; break;
      }
      return matchesSearch && matchesStatus;
    });
  }, [shareLinks, searchText, filterStatus]);

  const stats = useMemo(() => {
    const total = shareLinks?.length || 0;
    const active = shareLinks?.filter((l) => !l.isRevoked && (!l.expiresAt || dayjs(l.expiresAt).isAfter(dayjs()))).length || 0;
    const revoked = shareLinks?.filter((l) => l.isRevoked).length || 0;
    const expired = shareLinks?.filter((l) => l.expiresAt && dayjs(l.expiresAt).isBefore(dayjs()) && !l.isRevoked).length || 0;
    const withPassword = shareLinks?.filter((l) => l.hasPassword).length || 0;
    return { total, active, revoked, expired, withPassword };
  }, [shareLinks]);

  const handleViewDetail = (link: ShareLink) => {
    setSelectedLink(link);
    setDetailDrawerVisible(true);
  };

  const handleDeleteLink = (linkId: string) => deleteMutation.mutate(linkId);

  const handleCopyLink = (link: ShareLink) => {
    const url = link.fullUrl || `${window.location.origin}/share/${link.token}`;
    navigator.clipboard.writeText(url);
    message.success('Đã sao chép liên kết!');
  };

  /* ── Table columns ── */
  const columns: ColumnsType<ShareLink> = [
    {
      title: 'Token',
      key: 'token',
      width: 150,
      render: (_, record) => (
        <Space orientation="vertical" size={0}>
          <Text copyable={{ text: record.token }} style={{ fontFamily: 'monospace', fontSize: 12 }}>
            {record.token?.substring(0, 12)}...
          </Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{record.id?.substring(0, 8)}...</Text>
        </Space>
      ),
    },
    {
      title: 'Quyền',
      dataIndex: 'permission',
      key: 'permission',
      width: 120,
      render: (permission: string) => (
        <Tag icon={permission === 'DOWNLOAD' ? <DownloadOutlined /> : <EyeOutlined />} color={permission === 'DOWNLOAD' ? 'blue' : 'green'}>
          {permission === 'DOWNLOAD' ? 'Tải xuống' : 'Xem'}
        </Tag>
      ),
    },
    {
      title: 'Bảo mật',
      key: 'security',
      width: 100,
      render: (_, record) => (
        <Tooltip title={record.hasPassword ? 'Có mật khẩu' : 'Không có mật khẩu'}>
          {record.hasPassword
            ? <LockOutlined style={{ color: '#faad14', fontSize: 18 }} />
            : <UnlockOutlined style={{ color: '#8c8c8c', fontSize: 18 }} />
          }
        </Tooltip>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 140,
      render: (_, record) => {
        const isExpired = record.expiresAt && dayjs(record.expiresAt).isBefore(dayjs());
        const isRevoked = record.isRevoked;
        if (isRevoked) return <Tag icon={<CloseCircleOutlined />} color="red">Đã thu hồi</Tag>;
        if (isExpired) return <Tag icon={<ClockCircleOutlined />} color="default">Đã hết hạn</Tag>;
        if (!record.expiresAt) return <Tag icon={<CheckCircleOutlined />} color="green">Vĩnh viễn</Tag>;
        return <Tag icon={<CheckCircleOutlined />} color="green">Hoạt động</Tag>;
      },
    },
    {
      title: 'Hết hạn',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      width: 150,
      render: (date: string | null) => {
        if (!date) return <Text type="secondary">Không có</Text>;
        const isExpired = dayjs(date).isBefore(dayjs());
        return (
          <Tooltip title={dayjs(date).format('DD/MM/YYYY HH:mm:ss')}>
            <Text type={isExpired ? 'danger' : 'secondary'}>
              {isExpired ? 'Đã hết hạn' : dayjs(date).fromNow()}
            </Text>
          </Tooltip>
        );
      },
    },
    {
      title: 'Người tạo',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 150,
      render: (createdBy: string) => <Text type="secondary">{createdBy || 'N/A'}</Text>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => <Text type="secondary">{dayjs(date).format('DD/MM/YYYY')}</Text>,
      sorter: (a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Hành động',
      key: 'action',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Sao chép liên kết"><Button type="text" icon={<CopyOutlined />} onClick={() => handleCopyLink(record)} /></Tooltip>
          <Tooltip title="Xem chi tiết"><Button type="text" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)} /></Tooltip>
          <Popconfirm title="Thu hồi và xóa liên kết này?" icon={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />} onConfirm={() => handleDeleteLink(record.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
            <Tooltip title="Xóa"><Button type="text" danger icon={<DeleteOutlined />} /></Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  /* ── Card renderer for mobile ── */
  const renderLinkCard = (link: ShareLink) => {
    const isExpired = link.expiresAt && dayjs(link.expiresAt).isBefore(dayjs());
    const isRevoked = link.isRevoked;

    return (
      <Space direction="vertical" style={{ width: '100%' }} size={8}>
        {/* Header */}
        <Space align="start" style={{ width: '100%' }}>
          <LinkOutlined style={{ fontSize: 20, color: '#1677ff' }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text copyable={{ text: link.token }} style={{ fontFamily: 'monospace', fontSize: 12, display: 'block' }}>
              {link.token?.substring(0, 16)}...
            </Text>
            <Space size={4} style={{ marginTop: 4 }}>
              <Tag icon={link.permission === 'DOWNLOAD' ? <DownloadOutlined /> : <EyeOutlined />} color={link.permission === 'DOWNLOAD' ? 'blue' : 'green'}>
                {link.permission === 'DOWNLOAD' ? 'Tải xuống' : 'Xem'}
              </Tag>
              {link.hasPassword && <Tag icon={<LockOutlined />} color="orange">Có mật khẩu</Tag>}
            </Space>
          </div>
          <Tooltip title={link.hasPassword ? 'Có mật khẩu' : 'Không có mật khẩu'}>
            {link.hasPassword
              ? <LockOutlined style={{ color: '#faad14' }} />
              : <UnlockOutlined style={{ color: '#8c8c8c' }} />
            }
          </Tooltip>
        </Space>

        {/* Status */}
        <div>
          {isRevoked && <Tag icon={<CloseCircleOutlined />} color="red">Đã thu hồi</Tag>}
          {isExpired && !isRevoked && <Tag icon={<ClockCircleOutlined />} color="default">Đã hết hạn</Tag>}
          {!isRevoked && !isExpired && <Tag icon={<CheckCircleOutlined />} color="green">{link.expiresAt ? 'Hoạt động' : 'Vĩnh viễn'}</Tag>}
        </div>

        {/* Info grid */}
        <Row gutter={[8, 4]}>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: 11 }}>Người tạo</Text>
            <br />
            <Text style={{ fontSize: 12 }}>{link.createdBy || 'N/A'}</Text>
          </Col>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: 11 }}>Hết hạn</Text>
            <br />
            {link.expiresAt
              ? <Text style={{ fontSize: 12 }} type={isExpired ? 'danger' : undefined}>{isExpired ? 'Đã hết hạn' : dayjs(link.expiresAt).fromNow()}</Text>
              : <Text style={{ fontSize: 12 }}>Vĩnh viễn</Text>
            }
          </Col>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: 11 }}>Ngày tạo</Text>
            <br />
            <Text style={{ fontSize: 12 }}>{dayjs(link.createdAt).format('DD/MM/YYYY')}</Text>
          </Col>
        </Row>

        {/* Actions */}
        <Space style={{ marginTop: 4 }}>
          <Button size="small" icon={<CopyOutlined />} onClick={() => handleCopyLink(link)}>Sao chép</Button>
          <Button size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(link)}>Chi tiết</Button>
          <Popconfirm title="Thu hồi và xóa liên kết này?" icon={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />} onConfirm={() => handleDeleteLink(link.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
            <Button size="small" danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      </Space>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Quản lý liên kết chia sẻ</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>Làm mới</Button>
        </Space>
      </div>

      {/* Statistics */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}><StatCard title="Tổng liên kết" value={stats.total} icon={<LinkOutlined style={{ color: '#1677ff' }} />} /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Đang hoạt động" value={stats.active} icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />} /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Đã thu hồi" value={stats.revoked} icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />} /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Cần bảo mật" value={stats.withPassword} trend={`/ ${stats.total}`} icon={<LockOutlined style={{ color: '#faad14' }} />} /></Col>
      </Row>

      {/* Filters */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Input placeholder="Tìm kiếm theo token, file ID..." prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} allowClear style={{ maxWidth: 300 }} />
          </Col>
          <Col>
            <Space>
              <FilterOutlined />
              <Segmented
                options={[
                  { label: `Tất cả (${stats.total})`, value: 'all' },
                  { label: `Hoạt động (${stats.active})`, value: 'active' },
                  { label: `Đã thu hồi (${stats.revoked})`, value: 'revoked' },
                  { label: `Hết hạn (${stats.expired})`, value: 'expired' },
                ]}
                value={filterStatus}
                onChange={(value) => setFilterStatus(value as typeof filterStatus)}
              />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Table / Cards */}
      <ResponsiveCardList
        data={filteredLinks}
        columns={columns}
        renderCard={renderLinkCard}
        loading={isLoading}
        onReload={refetch}
        emptyText="Chưa có liên kết chia sẻ nào"
      />

      <ShareLinkDetailDrawer
        link={selectedLink}
        visible={detailDrawerVisible}
        onClose={() => { setDetailDrawerVisible(false); setSelectedLink(null); }}
        onCopyLink={handleCopyLink}
      />
    </div>
  );
};

export default ShareLinksPage;
