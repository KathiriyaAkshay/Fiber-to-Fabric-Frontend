import { api } from "../index";

export function createCompanyRequest(data) {
  return api.post("/company/create", data);
}

export function createOpeningBalanceRequest({ data, params }) {
  return api.post("/company/opening/balance", data, { params });
}


export function updateCompanyRequest({ companyId, data, params }) {
  return api.put(`/company/update/${companyId}`, data, { params });
}

export function getCompanyRequest({ companyId, params }) {
  return api.get(`/company/get/${companyId}`, {
    params: {
      company_id: companyId,
      ...params,
    },
  });
}

export function deleteCompanyRequest({ companyId, params }) {
  return api.delete(`/company/delete/${companyId}`, { params });
}

export function getCompanyListRequest({ params }) {
  return api.get(`/company/list`, { params });
}

export function getCompanyPartnerRequest({ companyId, params }) {
  return api.get(`/company/partner/get/${companyId}`, { params });
}

export function addPartnerToCompanyRequest(data) {
  return api.post(`/company/partner/add`, data);
}

export function updateCompanyPartnerRequest({ partnerId, data }) {
  return api.post(`/company/partner/update/${partnerId}`, data);
}

export function deleteCompanyPartnerRequest({ partnerId, params }) {
  return api.delete(`/company/partner/delete/${partnerId}`, { params });
}

export function createCompanyBankRequest({ data, params }) {
  return api.post("/company/bank-detail/create", data, { params });
}

export function updateCompanyBankRequest({ id, data, params }) {
  return api.patch(`/company/bank-detail/update/${id}`, data, { params });
}

export function getCompanyBankRequest({ id, params }) {
  return api.get(`/company/bank-detail/get/${id}`, {
    params,
  });
}

export function deleteCompanyBankRequest({ id, params }) {
  return api.delete(`/company/bank-detail/delete/${id}`, { params });
}

export function getCompanyBankListRequest({ params }) {
  return api.get(`/company/bank-detail/list`, { params });
}
