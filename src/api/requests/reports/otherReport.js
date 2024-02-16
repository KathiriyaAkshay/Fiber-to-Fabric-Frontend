import { api } from "../..";

export function createOtherReportRequest({ data, params }) {
  return api.post(`/reports/other-report/create`, data, { params });
}

export function getOtherReportByIdRequest({ id, params }) {
  return api.get(`/reports/other-report/get/${id}`, { params });
}

export function getOtherReportListRequest({ companyId, params }) {
  return api.get(`/reports/other-report/list/${companyId}`, { params });
}

export function updateOtherReportRequest({ id, data, params }) {
  return api.patch(`/reports/other-report/update/${id}`, data, { params });
}

export function deleteOtherReportRequest({ id, params }) {
  return api.delete(`/reports/other-report/delete/${id}`, { params });
}
