export interface AdminNotification {
  id: string;
  recipientEmail: string;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, string>;
  isRead: boolean;
  createdAt: string;
}

export interface AdminPaginatedNotificationsResponse {
  content: AdminNotification[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
}

export interface BroadcastPayload {
  title: string;
  message: string;
  targetEmail: string; // "ALL" or specific email
  type: string;
}
