import React, { useState } from 'react';
import { Card, Typography, Segmented } from 'antd';
import { AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { FolderTable } from '../components/FolderTable';
import { FolderGrid } from '../components/FolderGrid';
import { FolderFilesModal } from '../components/FolderFilesModal';
import { FilePreviewModal } from '../components/FilePreviewModal';
import type { FolderFile } from '../types/folder.types';

const { Title } = Typography;

const FoldersPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  
  // Modal states
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedFolderName, setSelectedFolderName] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<FolderFile | null>(null);

  const handleFolderClick = (folderId: string, folderName: string) => {
    setSelectedFolderId(folderId);
    setSelectedFolderName(folderName);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Quản lý thư mục</Title>
        <Segmented
          options={[
            { label: 'Dạng lưới', value: 'grid', icon: <AppstoreOutlined /> },
            { label: 'Dạng bảng', value: 'table', icon: <UnorderedListOutlined /> },
          ]}
          value={viewMode}
          onChange={(value) => setViewMode(value as 'table' | 'grid')}
        />
      </div>
      
      {viewMode === 'table' ? (
        <Card>
          <FolderTable />
        </Card>
      ) : (
        <FolderGrid onFolderClick={handleFolderClick} />
      )}

      <FolderFilesModal
        folderId={selectedFolderId}
        folderName={selectedFolderName}
        onClose={() => setSelectedFolderId(null)}
        onFileClick={(file) => setSelectedFile(file)}
      />
      
      <FilePreviewModal
        file={selectedFile}
        onClose={() => setSelectedFile(null)}
      />
    </div>
  );
};

export default FoldersPage;
