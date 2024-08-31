import { api } from "../..";

export function getPartnerListRequest({ id, params }) {
  return api.get(`/company/partner/get/${id}`, { params });
}

export function updatePartnerRequest({ id, data, params }) {
  return api.patch(`/company/partner/update/${id}`, data, { params });
}

export function addPartnerRequest({ data, params }) {
  return api.post(`/company/partner/add`, data, { params });
}

export function deletePartnerRequest({ id, params }) {
  return api.delete(`/company/partner/delete/${id}`, { params });
}
