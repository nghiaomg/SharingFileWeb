import React from 'react';
import { Typography, Row, Skeleton } from 'antd';
import { useDashboardCategoriesQuery } from '../hooks/useDashboardQuery';
import { formatBytes } from '@/shared/utils';

const { Text } = Typography;

const COLORS = ['#1677ff', '#52c41a', '#faad14', '#eb2f96', '#13c2c2', '#722ed1'];

export const StorageCategoryChart: React.FC = () => {
  const { data: categories, isLoading } = useDashboardCategoriesQuery();

  if (isLoading) return <Skeleton active paragraph={{ rows: 5 }} />;

  const total = categories?.reduce((a, c) => a + c.size, 0) ?? 0;

  return (
    <>
      {categories?.map((cat, idx) => {
        const pct = total > 0 ? Math.round((cat.size / total) * 100) : 0;
        return (
          <div key={cat.title} style={{ marginBottom: idx < 5 ? 16 : 0 }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 5 }}>
              <Text style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{cat.title}</Text>
              <Text style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {formatBytes(cat.size)}
              </Text>
            </Row>
            <div style={{ height: 4, borderRadius: 2, background: 'var(--progress-track)', overflow: 'hidden' }}>
              <div style={{
                width: `${pct}%`,
                height: '100%',
                borderRadius: 2,
                background: COLORS[idx % COLORS.length],
              }} />
            </div>
          </div>
        );
      })}
    </>
  );
};
