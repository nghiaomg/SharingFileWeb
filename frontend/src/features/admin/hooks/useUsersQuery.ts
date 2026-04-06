import { useQuery } from "@tanstack/react-query";
import { getAllUsers, getUserById, adminUsersKeys } from "../api/users.api";

export function useAdminUsers(page: number = 0, size: number = 15) {
  return useQuery({
    queryKey: [...adminUsersKeys.lists(), page, size],
    queryFn: () => getAllUsers(page, size),
  });
}

export function useAdminUserDetail(id: string) {
  return useQuery({
    queryKey: adminUsersKeys.detail(id),
    queryFn: () => getUserById(id),
    enabled: !!id,
  });
}
