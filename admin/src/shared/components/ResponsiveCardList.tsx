import React from 'react';
import { Table, Card, Typography, Row, Col, Button, Space, Tooltip, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ReloadOutlined } from '@ant-design/icons';
import { useIsMobile } from '../hooks/useIsMobile';

const { Text } = Typography;

interface ResponsiveCardListProps<T extends { id: string }> {
  /** Dữ liệu cần render */
  data: T[];
  /** Cột cho bảng (desktop) */
  columns: ColumnsType<T>;
  /** Hàm render 1 card trên mobile — trả về ReactNode */
  renderCard: (item: T, extra: { isMobile: boolean }) => React.ReactNode;
  /** Key cho rowKey của table */
  rowKey?: string;
  loading?: boolean;
  /** Phân trang */
  pagination?: false | {
    pageSize?: number;
    showSizeChanger?: boolean;
    showTotal?: (total: number, range: [number, number]) => string;
  };
  /** Tổng số dòng (nếu dùng pagination bên ngoài) */
  total?: number;
  /** Class cho row table */
  rowClassName?: string | ((record: T, index: number) => string);
  /** Icon refresh */
  onReload?: () => void;
  /** Thêm action buttons ở header (table mode) */
  tableExtra?: React.ReactNode;
  /** Custom footer card (mobile) */
  cardFooter?: (item: T) => React.ReactNode;
  /** Empty text */
  emptyText?: React.ReactNode;
}

function ResponsiveCardList<T extends { id: string }>({
  data,
  columns,
  renderCard,
  rowKey = 'id',
  loading,
  pagination = { pageSize: 10, showSizeChanger: true },
  total,
  rowClassName,
  onReload,
  tableExtra,
  emptyText = 'Không có dữ liệu',
}: ResponsiveCardListProps<T>) {
  const isMobile = useIsMobile();

  if (!isMobile) {
    // ── Desktop: Table ──
    return (
      <Card
        size="small"
        title={
          <Space>
            {onReload && (
              <Tooltip title="Làm mới">
                <Button
                  type="text"
                  icon={<ReloadOutlined spin={loading} />}
                  onClick={onReload}
                  size="small"
                />
              </Tooltip>
            )}
            {tableExtra}
          </Space>
        }
        extra={
          pagination !== false && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {total != null ? `${data.length} / ${total}` : data.length} dòng
            </Text>
          )
        }
        styles={{ body: { padding: 0 } }}
      >
        {data.length > 0 ? (
          <Table
            dataSource={data}
            columns={columns}
            rowKey={rowKey}
            loading={loading}
            scroll={{ x: 'max-content' }}
            pagination={
              pagination === false
                ? false
                : {
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (t, range) => `${range[0]}-${range[1]} của ${t}`,
                    ...pagination,
                  }
            }
            rowClassName={rowClassName}
            size="small"
          />
        ) : (
          <div style={{ padding: 48 }}>
            <Empty description={emptyText} />
          </div>
        )}
      </Card>
    );
  }

  // ── Mobile: Cards ──
  return (
    <div>
      {data.length === 0 ? (
        <Card>
          <Empty description={emptyText} />
        </Card>
      ) : (
        <Row gutter={[12, 12]}>
          {data.map((item) => (
            <Col key={item.id} xs={24}>
              <Card
                size="small"
                styles={{ body: { padding: 12 } }}
              >
                {renderCard(item, { isMobile: true })}
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}

export default ResponsiveCardList;
