import apiClient from "@/lib/api-client";
import {
    AdminSubscriptionPlan,
    PaginationResponse,
} from "../types/subscriptions.types";

export const adminSubscriptionsKeys = {
    all: ["admin-subscriptions"] as const,
    lists: () => [...adminSubscriptionsKeys.all, "list"] as const,
};

export async function getAllPlans(): Promise<
    PaginationResponse<AdminSubscriptionPlan>
> {
    const response = await apiClient.get<unknown>(
        "/subscription/admin/plans?size=100",
    );
    return response.data as PaginationResponse<AdminSubscriptionPlan>;
}

export async function createPlan(
    data: Partial<AdminSubscriptionPlan>,
): Promise<AdminSubscriptionPlan> {
    const response = await apiClient.post("/subscription/admin/plans", data);
    return response.data as AdminSubscriptionPlan;
}

export async function updatePlan(
    id: string,
    data: Partial<AdminSubscriptionPlan>,
): Promise<AdminSubscriptionPlan> {
    const response = await apiClient.put(`/subscription/admin/plans/${id}`, data);
    return response.data as AdminSubscriptionPlan;
}

export async function deletePlan(id: string): Promise<void> {
    await apiClient.delete(`/subscription/admin/plans/${id}`);
}

export async function initDefaultPlans(): Promise<void> {
    await apiClient.post("/subscription/admin/plans/init");
}
