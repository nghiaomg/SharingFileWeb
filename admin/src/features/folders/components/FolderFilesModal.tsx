import React from 'react';
import { Modal, Row, Col, Card, Empty, Spin } from 'antd';
import {
  FilePdfOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  FileTextOutlined,
  FileUnknownOutlined
} from '@ant-design/icons';
import { useFolderFilesQuery } from '../hooks/useFoldersHooks';
import type { FolderFile } from '../types/folder.types';
import dayjs from 'dayjs';

interface FolderFilesModalProps {
  folderId: string | null;
  folderName: string;
  onClose: () => void;
  onFileClick: (file: FolderFile) => void;
}

const getFileIcon = (type: string) => {
  if (type.includes('pdf')) return <FilePdfOutlined style={{ fontSize: 48, color: '#f5222d' }} />;
  if (type.includes('spreadsheet') || type.includes('excel')) return <FileExcelOutlined style={{ fontSize: 48, color: '#52c41a' }} />;
  if (type.includes('image')) return <FileImageOutlined style={{ fontSize: 48, color: '#1677ff' }} />;
  if (type.includes('text')) return <FileTextOutlined style={{ fontSize: 48, color: '#595959' }} />;
  return <FileUnknownOutlined style={{ fontSize: 48, color: '#8c8c8c' }} />;
};

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const FolderFilesModal: React.FC<FolderFilesModalProps> = ({ folderId, folderName, onClose, onFileClick }) => {
  const { data: files, isLoading } = useFolderFilesQuery(folderId);

  return (
    <Modal
      title={`Tệp trong thư mục: ${folderName}`}
      open={!!folderId}
      onCancel={onClose}
      footer={null}
      width={1000}
      centered
      style={{ top: 20 }}
      styles={{ body: { minHeight: '400px', maxHeight: '70vh', overflowY: 'auto' } }}
    >
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>
      ) : !files || files.length === 0 ? (
        <Empty description="Thư mục trống" style={{ padding: '100px 0' }} />
      ) : (
        <Row gutter={[16, 16]}>
          {files.map(file => (
            <Col xs={24} sm={12} md={8} lg={6} key={file.id}>
              <Card
                hoverable
                style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                styles={{ body: { padding: 16, display: 'flex', flexDirection: 'column', height: '100%', flex: 1 } }}
                onClick={() => onFileClick(file)}
              >
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  {getFileIcon(file.type)}
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={file.name}>
                    {file.name}
                  </h4>
                  <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#888' }}>
                    Kích thước: {formatSize(file.size)}
                  </p>
                  <p style={{ margin: '0 0 0px', fontSize: '12px', color: '#888' }}>
                    Ngày tạo: {dayjs(file.createdAt).format('DD/MM/YYYY')}
                  </p>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Modal>
  );
};
