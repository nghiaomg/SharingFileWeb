import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../stores/auth.store';
import type { LoginRequest, LoginResponse, ChangePasswordRequest } from '../types/auth.types';
import { useNavigate } from 'react-router-dom';
import { notification } from 'antd';

export const useLoginMutation = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data: LoginResponse) => {
      if (!data.roles.includes('ROLE_ADMIN') && !data.roles.includes('ROLE_MODERATOR')) {
        notification.error({ message: 'Không có quyền truy cập', description: 'Bạn không có quyền truy cập trang quản trị!' });
        return;
      }
      
      const user = {
        id: data.id,
        username: data.username,
        email: data.email,
        roles: data.roles,
      };
      setAuth(user, data.accessToken);
      notification.success({ message: 'Đăng nhập thành công!' });
      navigate('/');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string, msg?: string } } };
      notification.error({ 
        message: 'Đăng nhập thất bại', 
        description: err.response?.data?.msg || err.response?.data?.message || 'Đăng nhập thất bại' 
      });
    },
  });
};

export const useLogoutMutation = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clearAuth();
      navigate('/login');
    },
  });
};

export const useChangePasswordMutation = (onSuccessCallback?: () => void) => {
  return useMutation({
    mutationFn: (data: Omit<ChangePasswordRequest, 'confirmPassword'>) => authApi.changePassword(data),
    onSuccess: () => {
      notification.success({ message: 'Đổi mật khẩu thành công!' });
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      notification.error({ message: 'Lỗi khi đổi mật khẩu', description: err.response?.data?.message || 'Lỗi khi đổi mật khẩu' });
    },
  });
};