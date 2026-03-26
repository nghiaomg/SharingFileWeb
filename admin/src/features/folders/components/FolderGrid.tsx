import React from 'react';
import { Row, Col, Card, Tag, Button, Popconfirm, Empty, Spin } from 'antd';
import { FolderOpenFilled, DeleteOutlined } from '@ant-design/icons';

import { useFoldersQuery, useDeleteFolderMutation } from '../hooks/useFoldersHooks';
import dayjs from 'dayjs';

interface FolderGridProps {
  onFolderClick: (folderId: string, folderName: string) => void;
}

export const FolderGrid: React.FC<FolderGridProps> = ({ onFolderClick }) => {
  const { data: folders, isLoading } = useFoldersQuery();
  const deleteMutation = useDeleteFolderMutation();

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
  }

  if (!folders || folders.length === 0) {
    return <Empty description="Không có thư mục nào" />;
  }

  return (
    <Row gutter={[16, 16]}>
      {folders.map(folder => (
        <Col xs={24} sm={12} md={8} lg={6} xl={4} key={folder.id}>
          <Card
            hoverable
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            bodyStyle={{ padding: 16, display: 'flex', flexDirection: 'column', height: '100%', flex: 1 }}
            onClick={() => onFolderClick(folder.id, folder.name)}
          >
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <FolderOpenFilled style={{ fontSize: 64, color: '#1677ff' }} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 8px', fontSize: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={folder.name}>
                {folder.name}
              </h3>
              <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#888' }}>
                ID Chủ sở hữu: {folder.ownerId}
              </p>
              <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#888' }}>
                Ngày tạo: {dayjs(folder.createdAt).format('DD/MM/YYYY')}
              </p>
              <div style={{ marginBottom: '8px' }}>
                <Tag color={folder.isDeleted ? 'red' : 'green'}>
                  {folder.isDeleted ? 'Trong thùng rác' : 'Bình thường'}
                </Tag>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '12px', marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
              <Popconfirm
                title="Xóa vĩnh viễn thư mục này?"
                description="Hành động này sẽ xóa cả các thư mục và file con bên trong nó."
                onConfirm={(e) => {
                  e?.stopPropagation();
                  deleteMutation.mutate(folder.id);
                }}
                onCancel={(e) => e?.stopPropagation()}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <Button 
                  type="text" 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={(e) => e.stopPropagation()} 
                  size="small"
                >
                  Xóa
                </Button>
              </Popconfirm>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};
