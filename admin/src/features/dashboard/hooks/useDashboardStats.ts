import { useMemo } from 'react';
import { useUsersQuery } from '@/features/users/hooks/useUsersHooks';
import { useFilesQuery } from '@/features/files/hooks/useFilesHooks';
import { useFoldersQuery } from '@/features/folders/hooks/useFoldersHooks';
import { useShareLinksQuery } from '@/features/shareLinks/hooks/useShareLinksHooks';
import { useDashboardCategoriesQuery } from './useDashboardQuery';
import dayjs from 'dayjs';

export interface DashboardStats {
  // Counts
  totalUsers: number;
  totalFiles: number;
  totalFolders: number;
  totalStorage: number;
  // Links
  activeLinks: number;
  expiredLinks: number;
  linksWithPassword: number;
  // Files by access mode
  publicFiles: number;
  restrictedFiles: number;
  privateFiles: number;
  // Users by plan
  proUsers: number;
  freeUsers: number;
  // Loading
  isLoading: boolean;
}

export const useDashboardStats = (): DashboardStats => {
  const { data: users, isLoading: loadingUsers } = useUsersQuery();
  const { data: files, isLoading: loadingFiles } = useFilesQuery();
  const { data: folders } = useFoldersQuery();
  const { data: shareLinks } = useShareLinksQuery();
  const { data: categories } = useDashboardCategoriesQuery();

  return useMemo(() => ({
    totalUsers: users?.length ?? 0,
    totalFiles: files?.length ?? 0,
    totalFolders: folders?.length ?? 0,
    totalStorage: categories?.reduce((acc, c) => acc + c.size, 0) ?? 0,
    activeLinks: shareLinks?.filter(l => !l.isRevoked).length ?? 0,
    expiredLinks: shareLinks?.filter(l => l.expiresAt && dayjs(l.expiresAt).isBefore(dayjs())).length ?? 0,
    linksWithPassword: shareLinks?.filter(l => l.hasPassword).length ?? 0,
    publicFiles: files?.filter(f => f.accessMode === 'PUBLIC').length ?? 0,
    restrictedFiles: files?.filter(f => f.accessMode === 'RESTRICTED').length ?? 0,
    privateFiles: files?.filter(f => f.accessMode === 'PRIVATE').length ?? 0,
    proUsers: users?.filter(u => u.subscriptionPlan === 'PRO').length ?? 0,
    freeUsers: users?.filter(u => u.subscriptionPlan === 'FREE').length ?? 0,
    isLoading: loadingUsers || loadingFiles,
  }), [users, files, folders, shareLinks, categories, loadingUsers, loadingFiles]);
};
