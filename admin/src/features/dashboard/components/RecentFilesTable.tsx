import React from 'react';
import { Table, Typography } from 'antd';
import { useDashboardRecentFilesQuery } from '../hooks/useDashboardQuery';
import { formatBytes } from '@/shared/utils';
import dayjs from 'dayjs';

const { Text } = Typography;

const TYPE_COLORS: Record<string, string> = {
  pdf: '#eb2f96', doc: '#1677ff', docx: '#1677ff', xls: '#52c41a',
  xlsx: '#52c41a', png: '#faad14', jpg: '#faad14', mp4: '#722ed1',
};

export const RecentFilesTable: React.FC = () => {
  const { data: files, isLoading } = useDashboardRecentFilesQuery();

  return (
    <Table
      dataSource={files}
      rowKey="id"
      loading={isLoading}
      pagination={false}
      size="small"
      locale={{ emptyText: 'No files' }}
      columns={[
        {
          title: 'Name',
          dataIndex: 'name',
          key: 'name',
          render: (name: string) => (
            <Text style={{ fontSize: 13, color: 'var(--text-primary)' }} ellipsis>{name}</Text>
          ),
        },
        {
          title: 'Type',
          dataIndex: 'type',
          key: 'type',
          width: 70,
          render: (type: string) => (
            <Text style={{ fontSize: 11, fontWeight: 600, color: TYPE_COLORS[type.toLowerCase().split('/').pop() ?? ''] ?? 'var(--text-muted)', textTransform: 'uppercase' }}>
              {type.split('/').pop()}
            </Text>
          ),
        },
        {
          title: 'Size',
          dataIndex: 'size',
          key: 'size',
          width: 80,
          render: (size: number) => (
            <Text style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{formatBytes(size)}</Text>
          ),
        },
        {
          title: 'Date',
          dataIndex: 'createdAt',
          key: 'createdAt',
          width: 100,
          render: (date: string) => (
            <Text style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{dayjs(date).format('DD/MM/YYYY')}</Text>
          ),
        },
      ]}
    />
  );
};
