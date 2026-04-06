import { useQuery } from "@tanstack/react-query";
import { getAllUsers, getUserById, adminUsersKeys } from "../api/users.api";

export function useAdminUsers() {
    return useQuery({
        queryKey: adminUsersKeys.lists(),
        queryFn: getAllUsers,
    });
}

export function useAdminUserDetail(id: string) {
    return useQuery({
        queryKey: adminUsersKeys.detail(id),
        queryFn: () => getUserById(id),
        enabled: !!id,
    });
}
