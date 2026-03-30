export interface SubscriptionPlan {
  plan: string;
  maxStorage: number;
  maxFileSize: number;
  price: number;
  features: string[];
}

export interface SubscriptionUpgradeResponse {
  success: boolean;
  message: string;
}
