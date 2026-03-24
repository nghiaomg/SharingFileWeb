import React from 'react';
import { Card, Table } from 'antd';
import { useDashboardRecentFilesQuery } from '../hooks/useDashboardQuery';
import dayjs from 'dayjs';

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const RecentFilesTable: React.FC = () => {
  const { data: recentFiles, isLoading } = useDashboardRecentFilesQuery();

  const columns = [
    { title: 'Tên file', dataIndex: 'name', key: 'name' },
    { title: 'Kích thước', dataIndex: 'size', key: 'size', render: (size: number) => formatBytes(size) },
    { title: 'Loại', dataIndex: 'type', key: 'type' },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm') },
  ];

  return (
    <Card title="Tệp tin tải lên gần đây" style={{ marginTop: 24 }}>
      <Table
        dataSource={recentFiles}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={false}
      />
    </Card>
  );
};
