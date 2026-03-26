import React, { useState, useEffect } from 'react';
import { Modal, Spin, Button, Result, Table, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { Document, Page, pdfjs } from 'react-pdf';
import * as XLSX from 'xlsx';
import type { FolderFile } from '../types/folder.types';
import { axiosInstance } from '@/shared/api/axios.instance';

// Setup react-pdf worker string (CDN fallback that shouldn't crash if network is blocked)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface FilePreviewModalProps {
  file: FolderFile | null;
  onClose: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ file, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [excelData, setExcelData] = useState<Record<string, string | number>[]>([]);
  const [excelCols, setExcelCols] = useState<{ title: string; dataIndex: number; key: number; }[]>([]);

  // PDF state
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);

  useEffect(() => {
    if (!file) return;

    let objectUrl: string = '';

    const loadFile = async () => {
      setLoading(true);
      try {
        const isExcel = file.type.includes('spreadsheet') || file.type.includes('excel');
        
        const response = await axiosInstance.get(`/api/files/download/${file.id}`, {
          responseType: isExcel ? 'arraybuffer' : 'blob'
        });

        if (isExcel) {
          const workbook = XLSX.read(response.data, { type: 'buffer' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];
          
          if (data && data.length > 0) {
            const cols = data[0].map((c: unknown, i: number) => ({
              title: String(c || `Col ${i}`),
              dataIndex: i,
              key: i,
            }));
            setExcelCols(cols);
            
            const rows = data.slice(1).map((row: unknown[], i) => {
              const rowData: Record<string, string | number> = { key: i };
              row.forEach((cell, idx) => {
                rowData[idx] = String(cell || '');
              });
              return rowData;
            });
            setExcelData(rows);
          }
        } else {
          objectUrl = URL.createObjectURL(new Blob([response.data], { type: file.type }));
          setFileUrl(objectUrl);
        }
      } catch {
        message.error('Không thể tải tệp preview, lỗi mạng hoặc lỗi CORS');
      } finally {
        setLoading(false);
      }
    };

    loadFile();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setFileUrl(null);
      setExcelData([]);
      setExcelCols([]);
      setNumPages(undefined);
      setPageNumber(1);
    };
  }, [file]);

  const handleDownload = () => {
    if (fileUrl) {
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = file?.name || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (file) {
      // fallback
      window.open(`/api/files/download/${file.id}`);
    }
  };

  const renderContent = () => {
    if (!file) return null;
    if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" tip="Đang tải dữ liệu tệp..." /></div>;

    const isImage = file.type.includes('image');
    const isPdf = file.type.includes('pdf');
    const isExcel = file.type.includes('spreadsheet') || file.type.includes('excel');

    if (isImage && fileUrl) {
      return (
        <div style={{ textAlign: 'center' }}>
          <img src={fileUrl} alt={file.name} style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain' }} />
        </div>
      );
    }

    if (isPdf && fileUrl) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f0f2f5', padding: '20px' }}>
          <Document
            file={fileUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={<Spin tip="Đang parse PDF..." />}
          >
            <Page pageNumber={pageNumber} renderTextLayer={false} renderAnnotationLayer={false} width={600} />
          </Document>
          {numPages && (
             <div style={{ marginTop: 16 }}>
               <Button disabled={pageNumber <= 1} onClick={() => setPageNumber(p => p - 1)}>Trước</Button>
               <span style={{ margin: '0 10px' }}>Trang {pageNumber} / {numPages}</span>
               <Button disabled={pageNumber >= numPages} onClick={() => setPageNumber(p => p + 1)}>Sau</Button>
             </div>
          )}
        </div>
      );
    }

    if (isExcel && excelCols.length > 0) {
      return (
        <Table
          dataSource={excelData}
          columns={excelCols}
          scroll={{ x: 'max-content', y: 400 }}
          pagination={false}
          size="small"
        />
      );
    }

    return (
      <Result
        title="Không thể preview dạng file này"
        subTitle={`Định dạng: ${file.type}`}
        extra={
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownload}>
            Tải xuống để xem nội dung
          </Button>
        }
      />
    );
  };

  return (
    <Modal
      title={file?.name}
      open={!!file}
      onCancel={onClose}
      footer={[
        <Button key="download" type="primary" icon={<DownloadOutlined />} onClick={handleDownload}>
          Tải xuống
        </Button>,
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
      ]}
      width={1000}
      centered
      style={{ top: 20 }}
      styles={{ body: { minHeight: '400px', maxHeight: '70vh', overflowY: 'auto', padding: 24 } }}
    >
      {renderContent()}
    </Modal>
  );
};
