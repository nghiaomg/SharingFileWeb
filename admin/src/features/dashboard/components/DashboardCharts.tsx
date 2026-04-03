import React, { useState } from 'react';
import { Card, Segmented, Typography, Skeleton } from 'antd';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useDashboardChartsQuery } from '../hooks/useDashboardQuery';
import { formatBytes } from '@/shared/utils';

const { Text } = Typography;

export const DashboardCharts: React.FC = () => {
    const [days, setDays] = useState<number>(7);
    const { data: chartData, isLoading } = useDashboardChartsQuery(days);

    // Dummy data generation if API is not fully implemented or data is empty
    const renderData = chartData?.length ? chartData : [];

    return (
        <Card styles={{ body: { padding: '24px' } }} style={{ marginBottom: 32, background: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Thống kê truy cập & tải lên
                </Text>
                <Segmented
                    options={[
                        { label: '7 Ngày', value: 7 },
                        { label: '14 Ngày', value: 14 },
                        { label: '30 Ngày', value: 30 },
                    ]}
                    value={days}
                    onChange={(val) => setDays(val as number)}
                />
            </div>

            {isLoading ? (
                <Skeleton active paragraph={{ rows: 10 }} />
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                    <div style={{ height: 350 }}>
                        <Text style={{ display: 'block', marginBottom: 16, color: 'var(--text-secondary)' }}>Lượt truy cập hệ thống</Text>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={renderData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--progress-track)" vertical={false} />
                                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--progress-track)', borderRadius: 8, color: 'var(--text-primary)' }}
                                    itemStyle={{ color: 'var(--text-primary)' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="visits" name="Lượt truy cập" stroke="#1677ff" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={{ height: 350 }}>
                        <Text style={{ display: 'block', marginBottom: 16, color: 'var(--text-secondary)' }}>Số lượng tệp được tải lên</Text>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={renderData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--progress-track)" vertical={false} />
                                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis yAxisId="left" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis yAxisId="right" orientation="right" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val: number) => formatBytes(val)} />
                                <Tooltip
                                    cursor={{ fill: 'var(--progress-track)', opacity: 0.4 }}
                                    contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--progress-track)', borderRadius: 8, color: 'var(--text-primary)' }}
                                    itemStyle={{ color: 'var(--text-primary)' }}
                                    formatter={(value: number, name: string) => {
                                        if (name === 'Dung lượng tải lên') return formatBytes(value);
                                        return value;
                                    }}
                                />
                                <Legend />
                                <Bar yAxisId="left" dataKey="uploadedFiles" name="Số lượng tệp" fill="#52c41a" radius={[4, 4, 0, 0]} barSize={30} />
                                <Bar yAxisId="right" dataKey="uploadedSize" name="Dung lượng tải lên" fill="#fa8c16" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </Card>
    );
};
