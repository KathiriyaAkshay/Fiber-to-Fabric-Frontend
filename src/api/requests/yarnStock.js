// yarn company
import { api } from "..";

export function addYarnStockCompanyRequest({ data, params }) {
  return api.post(`/yarn-stock/company/add`, data, { params });
}

export function updateYarnStockCompanyRequest({ id, data }) {
  return api.post(`/yarn-stock/company/update/${id}`, data);
}

export function getYarnStockCompanyListRequest({ companyId, params }) {
  return api.get(`/yarn-stock/company/list/${companyId}`, {
    params: {
      company_id: companyId,
      ...params,
    },
  });
}

export function getYarnStockCompanyByIdRequest({ id, params }) {
  return api.get(`/yarn-stock/company/get/${id}`, { params });
}

export function getYarnSubTypeListRequest({ params }) {
  return api.get(`/dropdown/yarn_sub_type/list`, { params });
}

export function getYarnColorListRequest({ params }) {
  return api.get(`/dropdown/yarn_color/list`, { params });
}

// yarn stock report

export function createYarnStockReportRequest({ data }) {
  return api.post(`/yarn-stock/yarn-report/create`, data);
}

export function getYarnCompanyReportRequest({ id, params }) {
  return api.get(`/yarn-stock/yarn-report/get/${id}`, { params });
}

export function getYarnReportListRequest({ id, params }) {
  return api.get(`/yarn-stock/yarn-report/list/${id}`, { params });
}
