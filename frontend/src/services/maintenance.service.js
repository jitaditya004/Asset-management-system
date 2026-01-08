import API from "../api/api";

export const reportIssue = (data) =>
  API.post("/maintenance", data);

export const getMaintenanceQueue = () =>
  API.get("/maintenance");

export const updateMaintenance = (id, data) =>
  API.patch(`/maintenance/${id}`, data);

export const cancelMaintenance = (id) =>
  API.delete(`/maintenance/${id}/cancel`);

export const rejectMaintenance = (id,reason) =>
  API.patch(`/maintenance/${id}/reject`, {reason});

export const getMyAllRequests = () =>
  API.get("/maintenance/my/all");