// Shared plan configurations - single source of truth

export interface Plan {
  id: string;
  name: string;
  price: number;
  priceDisplay: string;
  storage: string;
  storageBytes: number;
  recommended: boolean;
  features: string[];
  badge?: string;
}

export const PLANS: Plan[] = [
  {
    id: "FREE",
    name: "Gói Cơ Bản",
    price: 0,
    priceDisplay: "Miễn phí",
    storage: "5 GB",
    storageBytes: 5 * 1024 * 1024 * 1024,
    recommended: false,
    features: [
      "Dung lượng lưu trữ 5 GB",
      "Upload tối đa 100 MB / tệp",
      "Sử dụng tính năng cơ bản",
      "Hỗ trợ qua email",
    ],
  },
  {
    id: "MONTHLY",
    name: "FileFlow Pro",
    price: 99000,
    priceDisplay: "99.000đ",
    storage: "2.0 TB",
    storageBytes: 2 * 1024 * 1024 * 1024 * 1024,
    recommended: true,
    badge: "PHỔ BIẾN NHẤT",
    features: [
      "Lưu trữ không giới hạn 2.0 TB",
      "Upload không giới hạn kích thước tệp",
      "Băng thông tải không giới hạn",
      "Mã hóa bảo vệ tệp cao cấp (AES-256)",
      "Hỗ trợ ưu tiên 24/7",
      "Khôi phục tệp đã xóa trong 30 ngày",
    ],
  },
];

// Map subscriptionPlan from user to plan id
export function getPlanIdFromSubscription(subscriptionPlan?: string): string {
  if (!subscriptionPlan) return "FREE";
  const upper = subscriptionPlan.toUpperCase();
  if (upper === "FREE") return "FREE";
  if (upper === "PRO" || upper === "MONTHLY") return "MONTHLY";
  if (upper === "ENTERPRISE" || upper === "YEARLY") return "YEARLY";
  return "FREE";
}

// Get plan by id
export function getPlanById(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

// Get current active plan from user
export function getCurrentPlan(subscriptionPlan?: string): Plan {
  const planId = getPlanIdFromSubscription(subscriptionPlan);
  return getPlanById(planId) ?? PLANS[0];
}
