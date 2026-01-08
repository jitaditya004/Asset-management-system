import API from "../api/api";

export const requestAsset = (assetId, reason) =>
  API.post(`/requests/${assetId}`, { reason });

export const getMyRequests = () =>
  API.get("/requests/my");

export const getAllRequests = () =>
  API.get("/requests/admin/all");

export const reviewRequest = (requestId, action, comment) =>
  API.post(`/requests/admin/${requestId}/decision`, {
    action,
    comment
  });

export const deleteRequest = (id) =>
  API.delete(`/requests/${id}`);


export const getMyAllRequests = () =>
  API.get("/requests/my/all");