import { useMutation } from '@tanstack/react-query';
import { subscriptionApi } from '../api/subscription.api';
import { message } from 'antd';

export const useUpgradePlanMutation = () => {
  return useMutation({
    mutationFn: subscriptionApi.upgradePlan,
    onSuccess: () => {
      message.success('Nâng cấp gói cước thành công!');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Lỗi nâng cấp gói cước');
    },
  });
};
