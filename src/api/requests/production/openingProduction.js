import { api } from "../..";

export function addOpeningProductionRequest({ data, params }) {
  return api.post(`/production/opning/create`, data, { params });
}

export function getLastOpeningProductionTakaRequest({ params }) {
  return api.get(`/production/opning/get-last-taka-order`, { params });
}

export function getOpeningProductionByIdRequest({ id, params }) {
  return api.get(`/production/opning/get/${id}`, { params });
}

//  opening production stock services ==========================

export function getOpeningProductionStockListRequest({ params }) {
  return api.get(`/production/opning/stock/list`, { params });
}

export function addOpeningProductionStockRequest({ data, params }) {
  return api.post(`/production/opning/stock/create`, data, { params });
}
