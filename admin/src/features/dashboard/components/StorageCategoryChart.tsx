import React from 'react';
import { Card, Progress, Typography, Row, Col } from 'antd';
import { useDashboardCategoriesQuery } from '../hooks/useDashboardQuery';

const { Text } = Typography;

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const StorageCategoryChart: React.FC = () => {
  const { data: categories, isLoading } = useDashboardCategoriesQuery();

  if (isLoading) return <Card loading={true} />;

  const totalSize = categories?.reduce((acc, cat) => acc + cat.totalSize, 0) || 0;

  return (
    <Card title="Thống kê lưu trữ theo loại file">
      {categories?.map((cat) => {
        const percent = totalSize > 0 ? Math.round((cat.totalSize / totalSize) * 100) : 0;
        return (
          <div key={cat.category} style={{ marginBottom: 16 }}>
            <Row justify="space-between" style={{ marginBottom: 4 }}>
              <Col><Text strong>{cat.category}</Text></Col>
              <Col><Text type="secondary">{formatBytes(cat.totalSize)} ({cat.fileCount} tệp)</Text></Col>
            </Row>
            <Progress percent={percent} strokeColor="#1677ff" />
          </div>
        );
      })}
    </Card>
  );
};
