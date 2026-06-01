import { notificationClient } from './client';

export interface NotificationRecord {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  createdAt: string;
}

export const notificationApi = {
  getNotifications: (page = 1, limit = 20) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    return notificationClient.get<{ items: NotificationRecord[]; total: number }>(
      `/notifications?${params}`
    );
  },

  getUnreadCount: () =>
    notificationClient.get<{ count: number }>('/notifications/unread-count'),

  markAsRead: (id: number) =>
    notificationClient.patch(`/notifications/${id}/read`, {}),

  markAllAsRead: () =>
    notificationClient.patch('/notifications/read-all', {}),

  deleteNotification: (id: number) =>
    notificationClient.delete(`/notifications/${id}`),

  sendNotification: (data: { userId: number; title: string; message: string; type?: string }) =>
    notificationClient.post('/notifications/send', data),

  sendBulkNotification: (data: { userIds: number[]; title: string; message: string; type?: string }) =>
    notificationClient.post('/notifications/send-bulk', data),
};
