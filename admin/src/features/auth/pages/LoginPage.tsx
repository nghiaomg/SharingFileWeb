import React from 'react';
import { Form, Input, Button, Typography, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { loginSchema } from '../types/auth.types';
import type { LoginRequest } from '../types/auth.types';
import { useLoginMutation } from '../hooks/useAuthMutation';
import styles from './LoginPage.module.css';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const { control, handleSubmit, formState: { errors } } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const loginMutation = useLoginMutation();

  const onSubmit = (data: LoginRequest) => {
    loginMutation.mutate(data);
  };

  return (
    <div className={styles.root}>
      {/* Background decorative elements */}
      <div className={styles.bgGrid} />
      <div className={styles.bgGlow} />

      <div className={styles.wrapper}>
        {/* Left panel — branding */}
        <div className={styles.brandPanel}>
          <div className={styles.brandInner}>
            <div className={styles.logoMark}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect x="4" y="4" width="40" height="40" rx="4" stroke="#fff" strokeWidth="1.5" />
                <path d="M14 34 L24 14 L34 34" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
                <path d="M17 27 L31 27" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <Title level={1} className={styles.brandTitle}>Admin Panel</Title>
            <Text className={styles.brandSubtitle}>
              Hệ thống quản trị nâng cao<br />
              Quản lý tệp tin &amp; người dùng
            </Text>
            <div className={styles.brandDivider} />
            <Text className={styles.brandQuote}>
              "Kiểm soát hoàn toàn — Thiết kế tinh tế"
            </Text>
          </div>
        </div>

        {/* Right panel — form */}
        <div className={styles.formPanel}>
          <div className={styles.formInner}>
            <div className={styles.formHeader}>
              <div className={styles.formLogoIcon}>
                <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
                  <rect x="4" y="4" width="40" height="40" rx="4" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M14 34 L24 14 L34 34" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
                  <path d="M17 27 L31 27" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <Title level={2} className={styles.formTitle}>Chào mừng trở lại</Title>
              <Text className={styles.formSubtitle}>Đăng nhập để truy cập bảng điều khiển</Text>
            </div>

            {loginMutation.isError && (
              <Alert
                className={styles.errorAlert}
                message={
                  <span>
                    {(loginMutation.error as { response?: { data?: { msg?: string, message?: string } } })?.response?.data?.msg ||
                     (loginMutation.error as { response?: { data?: { msg?: string, message?: string } } })?.response?.data?.message ||
                     'Đăng nhập thất bại'}
                  </span>
                }
                type="error"
                showIcon
              />
            )}

            <Form
              layout="vertical"
              className={styles.form}
              onFinish={handleSubmit((data) => {
                onSubmit(data);
              })}
            >
              <Form.Item
                validateStatus={errors.username ? 'error' : ''}
                help={errors.username?.message}
                className={styles.formItem}
              >
                <label className={styles.inputLabel}>Tên đăng nhập</label>
                <Controller
                  name="username"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      size="large"
                      prefix={<UserOutlined className={styles.inputPrefix} />}
                      placeholder="Nhập tên đăng nhập"
                      className={styles.input}
                      autoComplete="username"
                    />
                  )}
                />
              </Form.Item>

              <Form.Item
                validateStatus={errors.password ? 'error' : ''}
                help={errors.password?.message}
                className={styles.formItem}
              >
                <label className={styles.inputLabel}>Mật khẩu</label>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <Input.Password
                      {...field}
                      size="large"
                      prefix={<LockOutlined className={styles.inputPrefix} />}
                      placeholder="Nhập mật khẩu"
                      className={styles.input}
                      autoComplete="current-password"
                    />
                  )}
                />
              </Form.Item>

              <Form.Item className={styles.formItemSubmit}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={loginMutation.isPending}
                  className={styles.submitBtn}
                >
                  <span>Đăng nhập</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={styles.btnArrow}>
                    <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Button>
              </Form.Item>
            </Form>

            <div className={styles.formFooter}>
              <div className={styles.footerLine} />
              <Text className={styles.footerText}>SharingFileWeb Admin &copy; {new Date().getFullYear()}</Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
