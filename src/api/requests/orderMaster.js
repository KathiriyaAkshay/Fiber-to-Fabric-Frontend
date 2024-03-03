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
