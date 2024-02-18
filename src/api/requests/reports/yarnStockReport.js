import { api } from "../..";

export function createYarnStockReportRequest({ data, params }) {
  return api.post(`/yarn-stock/yarn-report/create`, data, { params });
}

export function getYarnStockReportByIdRequest({ id, params }) {
  return api.get(`/yarn-stock/yarn-report/get/${id}`, { params });
}

export function getYarnStockReportListRequest({ companyId, params }) {
  return api.get(`/yarn-stock/yarn-report/list/${companyId}`, { params });
}

export function updateYarnStockReportRequest({ id, data, params }) {
  return api.patch(`/yarn-stock/yarn-report/update/${id}`, data, { params });
}

export function deleteYarnStockReportRequest({ id, params }) {
  return api.delete(`/yarn-stock/yarn-report/delete/${id}`, { params });
}
