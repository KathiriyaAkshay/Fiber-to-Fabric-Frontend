import { api } from "../..";

export function createWastageReportRequest({ data, params }) {
  return api.post(`/reports/wastage-report/create`, data, {
    params,
  });
}

export function getWastageReportByIdRequest({ id, params }) {
  return api.get(`/reports/wastage-report/get/${id}`, { params });
}

export function getWastageReportListRequest({ params }) {
  return api.get(`/reports/wastage-report/list`, {
    params,
  });
}
