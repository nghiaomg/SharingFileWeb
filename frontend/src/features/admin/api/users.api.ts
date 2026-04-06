import apiClient from "@/lib/api-client";
import { AdminUser, UpdateAdminUser } from "../types/users.types";

export const adminUsersKeys = {
    all: ["admin-users"] as const,
    lists: () => [...adminUsersKeys.all, "list"] as const,
    detail: (id: string) => [...adminUsersKeys.all, "detail", id] as const,
};

export async function getAllUsers(): Promise<AdminUser[]> {
    const response = await apiClient.get("/users");
    return response.data as AdminUser[];
}

export async function getUserById(id: string): Promise<AdminUser> {
    const response = await apiClient.get(`/users/${id}`);
    return response.data as AdminUser;
}

export async function updateUser(id: string, data: UpdateAdminUser): Promise<AdminUser> {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data as AdminUser;
}

export async function deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
}
