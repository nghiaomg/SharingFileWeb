export interface Notification {
  id: string;
  userId?: string;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, string>;
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
}

export interface UnreadCount {
  count: number;
}
