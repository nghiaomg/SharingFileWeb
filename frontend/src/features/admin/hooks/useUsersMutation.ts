import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUser, deleteUser, adminUsersKeys } from "../api/users.api";

export function useUpdateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateUser>[1] }) =>
            updateUser(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: adminUsersKeys.lists() });
            queryClient.invalidateQueries({ queryKey: adminUsersKeys.detail(variables.id) });
        },
    });
}

export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminUsersKeys.lists() });
        },
    });
}
