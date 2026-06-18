import httpClient from "../api/httpClient";

const NOTIFICATION_BASE = "/notification";

export const NotificationService = {
  getPaginatedNotifications(params?: any) {
    return httpClient.get(`${NOTIFICATION_BASE}`, { params });
  },

  filterNotifications(params?: any) {
    return httpClient.get(`${NOTIFICATION_BASE}/filter`, { params });
  },

  getUnreadCount() {
    return httpClient.get(`${NOTIFICATION_BASE}/unread-count`);
  },

  markAsRead(id: number) {
    return httpClient.patch(`${NOTIFICATION_BASE}/${id}/read`);
  },

  markAllAsRead() {
    return httpClient.patch(`${NOTIFICATION_BASE}/read-all`);
  },

  processScheduledNotifications() {
    return httpClient.post(`${NOTIFICATION_BASE}/process-scheduled`);
  },
};

export default NotificationService;
