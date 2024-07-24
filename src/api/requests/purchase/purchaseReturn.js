import { api } from "../..";

export function getPruchaseReturnListRequest({ params }) {
  return api.get(`/purchase/taka/retrun/list`, { params });
}

export function addPurchaseReturnRequest({ data, params }) {
  return api.post(`/purchase/taka/retrun/create`, data, { params });
}

export function getReworkChallanByIdRequest({ id, params }) {
  return api.get(`/purchase/taka/retrun/get/${id}`, { params });
}