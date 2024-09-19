import { api } from "../..";

export function calculateEmiRequest({ params }) {
  return api.get(`/account/emi/calculator`, { params });
}

export function getCalculateEmiListRequest({ params }) {
  return api.get(`/account/emi/calculator/list`, { params });
}

export function deleteEmiRequest({ id, params }) {
  return api.delete(`/account/emi/calculator/delete/${id}`, { params });
}