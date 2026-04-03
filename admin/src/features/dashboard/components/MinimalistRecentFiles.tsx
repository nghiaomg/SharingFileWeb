import React from 'react';
import { Skeleton, Typography } from 'antd';
import { useDashboardRecentFilesQuery } from '../hooks/useDashboardQuery';
import { formatBytes } from '@/shared/utils';
import dayjs from 'dayjs';

const { Text } = Typography;

export const MinimalistRecentFiles: React.FC = () => {
    const { data: files, isLoading } = useDashboardRecentFilesQuery();

    if (isLoading) return <Skeleton active paragraph={{ rows: 5 }} />;
    if (!files?.length) return <Text style={{ color: 'var(--text-muted)' }}>Không có tệp tải lên gần đây.</Text>;

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid var(--progress-track)', textAlign: 'left' }}>
                        <th style={{ padding: '12px 0', color: 'var(--text-muted)', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Tên tệp</th>
                        <th style={{ padding: '12px 0', color: 'var(--text-muted)', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', textAlign: 'right' }}>Kích thước</th>
                        <th style={{ padding: '12px 0', color: 'var(--text-muted)', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', textAlign: 'right' }}>Ngày tạo</th>
                    </tr>
                </thead>
                <tbody>
                    {files.slice(0, 5).map(f => (
                        <tr key={f.id} style={{ borderBottom: '1px solid var(--progress-track)' }}>
                            <td style={{ padding: '16px 0', color: 'var(--text-primary)', fontSize: 14 }}>{f.name}</td>
                            <td style={{ padding: '16px 0', color: 'var(--text-secondary)', fontSize: 14, textAlign: 'right' }}>{formatBytes(f.size)}</td>
                            <td style={{ padding: '16px 0', color: 'var(--text-muted)', fontSize: 14, textAlign: 'right' }}>{dayjs(f.createdAt).format('YYYY-MM-DD')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
