import API from "../api/api";

export const getLocations = () => API.get("/locations");

export const createLocation = (data) =>
  API.post("/locations", data);

export const updateLocation = (id, data) =>
  API.patch(`/locations/${id}`, data);

export const deleteLocation = (id) =>
  API.delete(`/locations/${id}`);
