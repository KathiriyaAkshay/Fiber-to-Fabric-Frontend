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
