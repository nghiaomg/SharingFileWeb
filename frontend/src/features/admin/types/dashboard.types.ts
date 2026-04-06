export interface AdminOverview {
  totalUsers: number;
  totalFiles: number;
  totalStorageBytes: number;
  totalRevenue: number;
}

export interface StorageCategoryDTO {
  name: string;
  count: number;
  size: number;
}

export interface DashboardChartDTO {
  date: string;
  visits: number;
  uploadedFiles: number;
  uploadedSize: number;
  newUsers: number;
}

export interface PieChartDataDTO {
  name: string;
  value: number;
  fill: string;
}

export interface ActionLogDTO {
  id: string;
  type: string;
  description: string;
  url: string;
  createdAt: string;
}
