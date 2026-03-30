import React, { useEffect } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useChangePasswordMutation } from '../hooks/useAuthMutation';
import type { ChangePasswordRequest } from '../types/auth.types';

interface Props {
  open: boolean;
  onCancel: () => void;
}

export const ChangePasswordModal: React.FC<Props> = ({ open, onCancel }) => {
  const [form] = Form.useForm<ChangePasswordRequest>();
  const mutation = useChangePasswordMutation(() => {
    form.resetFields();
    onCancel();
  });

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  const onFinish = (values: ChangePasswordRequest) => {
    mutation.mutate({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
  };

  return (
    <Modal
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LockOutlined /> Đổi mật khẩu
        </span>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        style={{ marginTop: 24 }}
      >
        <Form.Item
          label="Mật khẩu hiện tại"
          name="currentPassword"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
        >
          <Input.Password placeholder="Nhập mật khẩu hiện tại" size="large" />
        </Form.Item>

        <Form.Item
          label="Mật khẩu mới"
          name="newPassword"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
          ]}
        >
          <Input.Password placeholder="Nhập mật khẩu mới" size="large" />
        </Form.Item>

        <Form.Item
          label="Xác nhận mật khẩu mới"
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
              },
            }),
          ]}
        >
          <Input.Password placeholder="Nhập lại mật khẩu mới" size="large" />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: 32 }}>
          <Button onClick={onCancel} style={{ marginRight: 8 }} size="large">
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={mutation.isPending} size="large">
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
