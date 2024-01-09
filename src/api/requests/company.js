import { api } from "../index";

export function createCompanyRequest(data) {
  return api.post("/company/create", data);
}

export function updateCompanyRequest({ companyId, data }) {
  return api.put(`/company/${companyId}`, data);
}

export function getCompanyRequest({ companyId, config }) {
  return api.get(`/company/${companyId}`, config);
}

export function deleteCompanyRequest({ companyId, config }) {
  return api.delete(`/company/${companyId}`, config);
}

export function getCompanyListRequest({ config }) {
  return api.get(`/company/list`, config);
}

export function getCompanyPartnerRequest({ companyId, config }) {
  return api.get(`/company/partner/get/${companyId}`, config);
}

export function addPartnerToCompanyRequest(data) {
  return api.post(`/company/partner/add`, data);
}

export function updateCompanyPartnerRequest({ partnerId, data }) {
  return api.post(`/company/partner/update/${partnerId}`, data);
}

export function deleteCompanyPartnerRequest({ partnerId, config }) {
  return api.delete(`/company/partner/delete/${partnerId}`, config);
}
