import { api } from "..";

// my order
export function createMyOrderRequest({ data, params }) {
  return api.post(`/order-master/gray-order/create`, data, { params });
}

export function getMyOrderByIdRequest({ id, params }) {
  return api.get(`/order-master/gray-order/get/${id}`, { params });
}

export function getMyOrderListRequest({ params }) {
  return api.get(`/order-master/gray-order/list`, { params });
}

export function updateMyOrderRequest({ id, data, params }) {
  return api.patch(`/order-master/gray-order/update/${id}`, data, { params });
}

export function deleteMyOrderRequest({ id, params }) {
  return api.delete(`/order-master/gray-order/delete/${id}`, { params });
}

export function getMyOrderQualityMeterRequest({ id, params }) {
  return api.get(`/order-master/gray-order/quality/meters/${id}`, { params });
}

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

export function getSizeBeamOrderNumberRequest({ params }) {
  return api.get(`/order-master/size-beam-order/last-order-no`, { params });
}

export function getSizeBeamOrderByIdRequest({ id, params }) {
  return api.get(`/order-master/size-beam-order/get/${id}`, { params });
}

export function getLastBeamNumberRequest({ params }) {
  return api.get(`/order-master/recive-size-beam/last-beam-no`, { params });
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

// schedule delivery

export function getScheduleDeliveryListRequest({ params }) {
  return api.get(`/order-master/schedule-delivery/list`, { params });
}

export function createScheduleDeliveryRequest({ data, params }) {
  return api.post(`/order-master/schedule-delivery/create`, data, { params });
}

export function getScheduleDeliveryByIdRequest({ params }) {
  return api.get(`/order-master/schedule-delivery/get`, { params });
}

export function deleteScheduleDeliveryRequest({ id, params }) {
  return api.delete(`/order-master/schedule-delivery/delete/${id}`, { params });
}

export function updateScheduleDeliveryRequest({ id, data, params }) {
  return api.patch(`/order-master/schedule-delivery/update/${id}`, data, {
    params,
  });
}
