import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true,
});

export const createIncident = (data) => api.post("/incidents/create", data);
export const getAllIncidents = () => api.get("/incidents/all");
export const getUserIncidents = () => api.get("/incidents/user");
export const assignIncident = (id, assignedTo) =>
  api.put(`/incidents/assign/${id}`, { assignedTo });
export const updateIncidentStatus = (id, status) =>
  api.put(`/incidents/status/${id}`, { status });
export const deleteIncident = (id) => api.delete(`/incidents/delete/${id}`);

export default api;
