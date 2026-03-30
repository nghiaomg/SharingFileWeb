import { axiosInstance } from '@/shared/api/axios.instance';
import type { SubscriptionUpgradeResponse } from '../types/subscription.types';
import type { StandardResponse } from '@/shared/api/api.types';

export const subscriptionApi = {
  upgradePlan: async (): Promise<SubscriptionUpgradeResponse> => {
    const response = await axiosInstance.post<StandardResponse<SubscriptionUpgradeResponse>>('/api/subscription/upgrade');
    return response.data.data;
  },
};
