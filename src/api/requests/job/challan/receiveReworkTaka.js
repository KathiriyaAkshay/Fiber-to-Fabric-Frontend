import { api } from "../../..";

export function getReceiveReworkTakaListRequest({ params }) {
  return api.get(`/job/challan/receive/rework-taka/list`, { params });
}

export function addReceiveReworkTakaRequest({ data, params }) {
  return api.post(`/job/challan/receive/rework-taka/create`, data, { params });
}

export function deleteReceiveReworkTakaRequest({ id, params }) {
  return api.delete(`/job/challan/receive/rework-taka/delete/${id}`, { params });
}

export function getReceiveReworkTakaByIdRequest({ id, params }) {
  return api.get(`/job/challan/receive/rework-taka/get/${id}`, { params });
}

export function updateReceiveReworkTakaRequest({ id, data, params }) {
  return api.patch(`/job/challan/receive/rework-taka/update/${id}`, data, { params });
}
