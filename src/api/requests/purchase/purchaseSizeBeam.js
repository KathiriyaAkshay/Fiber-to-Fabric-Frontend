import { api } from "../..";

export function createReceiveSizeBeamRequest({ data, params }) {
  return api.post(`/order-master/recive-size-beam/create`, data, {
    params,
  });
}

export function getReceiveSizeBeamByIdRequest({ id, params }) {
  return api.get(`/order-master/recive-size-beam/get/${id}`, { params });
}

export function getReceiveSizeBeamListRequest({ params }) {
  return api.get(`/order-master/recive-size-beam/list`, {
    params,
  });
}

export function updateReceiveSizeBeamRequest({ id, data, params }) {
  return api.patch(`/order-master/recive-size-beam/update/${id}`, data, {
    params,
  });
}

export function deleteReceiveSizeBeamRequest({ id, params }) {
  return api.delete(`/order-master/recive-size-beam/delete/${id}`, {
    params,
  });
}

export function createReceiveSizeBeamBillRequest({ data, params }) {
  return api.post(`/order-master/recive-size-beam/bill/create`, data, {
    params,
  });
}

export function getReceiveSizeBeamBillListRequest({ params }) {
  return api.get(`/order-master/recive-size-beam/bill/list`, {
    params,
  });
}


export function createGeneralPurchaseEntryRequest({ data, params }) {
  return api.post(`/purchase/general/entry/create`, data, {
    params,
  });
}

export function getGeneralPurchaseListRequest({ params }) {
  return api.get(`/purchase/general/entry/list`, {
    params,
  });
}

export function deleteGeneralPurchaseRequest({ id, params }) {
  return api.delete(`/purchase/general/entry/delete/${id}`, {
    params,
  });
}