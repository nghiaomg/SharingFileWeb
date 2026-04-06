import apiClient from "@/lib/api-client";
import { AdminPaginatedSharesResponse } from "../types/shares.types";

export const adminSharesKeys = {
    all: ["admin-shares"] as const,
    lists: () => [...adminSharesKeys.all, "list"] as const,
};

export async function getAllShareLinks(
    page: number = 0,
    size: number = 15,
): Promise<AdminPaginatedSharesResponse> {
    const response = await apiClient.get(`/share/links?page=${page}&size=${size}`);
    return response.data as AdminPaginatedSharesResponse;
}

export async function deleteShareLink(id: string): Promise<void> {
    await apiClient.delete(`/share/links/${id}`);
}
