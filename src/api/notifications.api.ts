import { api } from './index';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export const notificationsApi = {
  getMyNotifications: () => api.get<Notification[]>('/notifications/my'),
  getBadgeCount: () => api.get<{ count: number }>('/notifications/badge'),
};