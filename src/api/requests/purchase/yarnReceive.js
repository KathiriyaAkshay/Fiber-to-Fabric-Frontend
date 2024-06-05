import { api } from "../..";

export function createYarnReceiveRequest({ data, params }) {
  return api.post(`/yarn-stock/yarn-receive-challan/create`, data, {
    params,
  });
}

export function getYarnReceiveByIdRequest({ id, params }) {
  return api.get(`/yarn-stock/yarn-receive-challan/get/${id}`, { params });
}

export function getYarnReceiveListRequest({ params }) {
  return api.get(`/yarn-stock/yarn-receive-challan/list`, {
    params,
  });
}

export function updateYarnReceiveRequest({ id, data, params }) {
  return api.put(`/yarn-stock/yarn-receive-challan/update/${id}`, data, {
    params,
  });
}

export function deleteYarnReceiveRequest({ id, params }) {
  return api.delete(`/yarn-stock/yarn-receive-challan/delete/${id}`, {
    params,
  });
}

export function deleteReceiveSizeBeamOrderRequest({id, params}) {
  return api.delete(`/order-master/recive-size-beam/delete/${id}`, {
    params
  })
}

export function getReceiveSizeBeamOrderRequest({id, params}) {
  return api.get(`order-master/recive-size-beam/get/${id}`, {
    params
  })
}

export function createYarnReceiveBillRequest({ data, params }) {
  return api.post(`/yarn-stock/yarn-receive-challan/bill/create`, data, {
    params,
  });
}

export function getYarnReceiveBillByIdRequest({ id, params }) {
  return api.get(`/yarn-stock/yarn-receive-challan/bill/get/${id}`, { params });
}

export function getYarnReceiveBillListRequest({ params }) {
  return api.get(`/yarn-stock/yarn-receive-challan/bill/list`, {
    params,
  });
}

export function updateYarnReceiveBillRequest({ id, data, params }) {
  return api.put(`/yarn-stock/yarn-receive-challan/bill/update/${id}`, data, {
    params,
  });
}

export function deleteYarnReceiveBillRequest({ id, params }) {
  return api.delete(`/yarn-stock/yarn-receive-challan/bill/delete/${id}`, {
    params,
  });
}
