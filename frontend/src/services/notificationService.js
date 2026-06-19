import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true,
});

export const createNotification = (data) => api.post("/notifications/create", data);
export const getUserNotifications = () => api.get("/notifications/user");
export const getAllNotifications = () => api.get("/notifications/all");
export const markNotificationRead = (id) => api.put(`/notifications/read/${id}`);
export const deleteNotification = (id) => api.delete(`/notifications/delete/${id}`);

export default api;
