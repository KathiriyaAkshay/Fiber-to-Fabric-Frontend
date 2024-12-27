import { api } from "../..";

export function addProductionRequest({ data, params }) {
  return api.post(`/production/create`, data, { params });
}

export function getLastProductionTakaRequest({ params }) {
  return api.get(`/production/last-taka`, { params });
}

export function getProductionListRequest({ params }) {
  return api.get(`/production/list`, { params });
}

export function updateProductionRequest({ id, data, params }) {
  return api.patch(`/production/update/${id}`, data, { params });
}

export function getProductionByIdRequest({ id, params }) {
  return api.get(`/production/get/${id}`, { params });
}

export function deleteProductionRequest({ data, params }) {
  return api.post(`/production/delete`, data, { params });
}

export function getInHouseProductionByTakaNo({ takaNo, params }) {
  return api.get(`/production/get/taka-no/${takaNo}`, { params });
}

export function inhouseProductionDetailsRequest({params}) {
  return api.get(`/production/folding/list`, {params}) ; 
}