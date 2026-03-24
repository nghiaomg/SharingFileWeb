import React from 'react';
import { Card, Typography, Button, Popconfirm, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { TrashTable } from '../components/TrashTable';
import { useEmptyTrashMutation } from '../hooks/useTrashHooks';

const { Title } = Typography;

const TrashPage: React.FC = () => {
  const emptyTrashMutation = useEmptyTrashMutation();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Thùng rác</Title>
        <Space>
          <Popconfirm
            title="Dọn sạch thùng rác?"
            description="Tất cả các mục trong thùng rác sẽ bị xóa vĩnh viễn."
            onConfirm={() => emptyTrashMutation.mutate()}
            okText="Dọn sạch"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="primary" danger icon={<DeleteOutlined />} loading={emptyTrashMutation.isPending}>
              Dọn sạch thùng rác
            </Button>
          </Popconfirm>
        </Space>
      </div>
      <Card>
        <TrashTable />
      </Card>
    </div>
  );
};

export default TrashPage;
