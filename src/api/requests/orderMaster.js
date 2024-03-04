import { api } from "..";

// yarn order
export function createYarnOrderRequest({ data, params }) {
  return api.post(`/order-master/yarn-order/create`, data, { params });
}

export function getYarnOrderByIdRequest({ id, params }) {
  return api.get(`/order-master/yarn-order/get/${id}`, { params });
}

export function getYarnOrderListRequest({ params }) {
  return api.get(`/order-master/yarn-order/list`, { params });
}

export function updateYarnOrderRequest({ id, data, params }) {
  return api.patch(`/order-master/yarn-order/update/${id}`, data, { params });
}

export function deleteYarnOrderRequest({ id, params }) {
  return api.delete(`/order-master/yarn-order/delete/${id}`, { params });
}

// yarn order advance
export function createYarnOrderAdvanceRequest({ id, data, params }) {
  return api.post(`/order-master/yarn-order/advances/create/${id}`, data, {
    params,
  });
}

export function getYarnOrderAdvanceListRequest({ id, params }) {
  return api.get(`/order-master/yarn-order/advances/list/${id}`, { params });
}

// size beam order
export function createSizeBeamOrderRequest({ data, params }) {
  return api.post(`/order-master/size-beam-order/create`, data, { params });
}

export function getSizeBeamOrderByIdRequest({ id, params }) {
  return api.get(`/order-master/size-beam-order/get/${id}`, { params });
}

export function getSizeBeamOrderListRequest({ params }) {
  return api.get(`/order-master/size-beam-order/list`, { params });
}

export function updateSizeBeamOrderRequest({ id, data, params }) {
  return api.patch(`/order-master/size-beam-order/update/${id}`, data, {
    params,
  });
}

export function deleteSizeBeamOrderRequest({ id, params }) {
  return api.delete(`/order-master/size-beam-order/delete/${id}`, { params });
}
