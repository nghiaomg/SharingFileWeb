import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber } from 'antd';
import type { User, UpdateUserRequest } from '../types/user.types';
import { useUpdateUserMutation } from '../hooks/useUsersHooks';

interface UserFormModalProps {
  visible: boolean;
  onCancel: () => void;
  initialData?: User | null;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({ visible, onCancel, initialData }) => {
  const [form] = Form.useForm<UpdateUserRequest>();
  const updateMutation = useUpdateUserMutation();

  useEffect(() => {
    if (visible && initialData) {
      form.setFieldsValue({
        roles: initialData.roles.map((r) => r.name),
        subscriptionPlan: initialData.subscriptionPlan,
        maxStorage: initialData.maxStorage,
        maxFileSize: initialData.maxFileSize,
      });
    } else {
      form.resetFields();
    }
  }, [visible, initialData, form]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      if (initialData) {
        updateMutation.mutate(
          { id: initialData.id, data: values },
          {
            onSuccess: () => {
              onCancel();
            },
          }
        );
      }
    });
  };

  return (
    <Modal
      title="Cập nhật người dùng"
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={updateMutation.isPending}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Username">
          <Input value={initialData?.username} disabled />
        </Form.Item>
        <Form.Item label="Email">
          <Input value={initialData?.email} disabled />
        </Form.Item>
        <Form.Item
          name="roles"
          label="Vai trò (Roles)"
          rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 role' }]}
        >
          <Select mode="multiple" placeholder="Chọn vai trò">
            <Select.Option value="ROLE_USER">USER</Select.Option>
            <Select.Option value="ROLE_MODERATOR">MODERATOR</Select.Option>
            <Select.Option value="ROLE_ADMIN">ADMIN</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="subscriptionPlan" label="Gói dịch vụ (Subscription)">
          <Select>
            <Select.Option value="BASIC">BASIC</Select.Option>
            <Select.Option value="PRO">PRO</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="maxStorage" label="Dung lượng tối đa (Bytes)">
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="maxFileSize" label="Kích thước tệp tối đa (Bytes)">
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
