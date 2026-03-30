import React from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Space,
  Typography,
} from 'antd';
import { FolderOutlined, HomeOutlined } from '@ant-design/icons';
import { useCreateFolderMutation } from '../hooks/useFoldersHooks';
import type { Folder } from '../types/folder.types';

const { Text, Paragraph } = Typography;

interface CreateFolderModalProps {
  visible: boolean;
  onClose: () => void;
  parentFolders: Folder[];
}

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  visible,
  onClose,
  parentFolders,
}) => {
  const [form] = Form.useForm();
  const createMutation = useCreateFolderMutation();

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      createMutation.mutate(values);
      handleClose();
    } catch {
      // Validation error
    }
  };

  const activeFolders = parentFolders.filter((f) => !f.isDeleted);

  return (
    <Modal
      title={
        <Space>
          <FolderOutlined />
          Tạo thư mục mới
        </Space>
      }
      open={visible}
      onCancel={handleClose}
      onOk={handleSubmit}
      okText="Tạo"
      cancelText="Hủy"
      confirmLoading={createMutation.isPending}
      width={480}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ parentId: null }}
      >
        <Form.Item
          name="name"
          label="Tên thư mục"
          rules={[
            { required: true, message: 'Vui lòng nhập tên thư mục!' },
            { min: 1, max: 255, message: 'Tên thư mục phải từ 1-255 ký tự!' },
          ]}
        >
          <Input placeholder="Nhập tên thư mục..." maxLength={255} />
        </Form.Item>

        <Form.Item
          name="parentId"
          label="Thư mục cha"
        >
          <Select
            placeholder="Chọn thư mục cha (để trống = thư mục gốc)"
            allowClear
            showSearch
            optionFilterProp="label"
          >
            <Select.Option key="root" value={null} label="Thư mục gốc">
              <Space>
                <HomeOutlined style={{ color: '#1677ff' }} />
                <Text>Thư mục gốc (Root)</Text>
              </Space>
            </Select.Option>
            {activeFolders.map((folder) => (
              <Select.Option
                key={folder.id}
                value={folder.id}
                label={folder.name}
              >
                <Space>
                  <FolderOutlined style={{ color: '#fa8c16' }} />
                  <Text>{folder.name}</Text>
                </Space>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Paragraph type="secondary" style={{ fontSize: 12 }}>
          Thư mục mới sẽ được tạo trong thư mục đã chọn. Nếu không chọn thư mục cha,
          thư mục sẽ được tạo ở cấp gốc.
        </Paragraph>
      </Form>
    </Modal>
  );
};
