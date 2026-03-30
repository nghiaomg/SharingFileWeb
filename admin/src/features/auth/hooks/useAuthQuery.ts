import { useQuery } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';

export const useMeQuery = () => {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    throwOnError: false,
    refetchOnWindowFocus: false,
  });
};
