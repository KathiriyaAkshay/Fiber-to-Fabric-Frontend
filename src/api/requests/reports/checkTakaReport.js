import { api } from "../..";

export function createCheckTakaReportRequest({ data, params }) {
  return api.post(`/reports/check-taka-report/create`, data, {
    params,
  });
}

export function getCheckTakaReportByIdRequest({ id, params }) {
  return api.get(`/reports/check-taka-report/get/${id}`, { params });
}

export function getCheckTakaReportListRequest({ params }) {
  return api.get(`/reports/check-taka-report/list`, {
    params,
  });
}

export function updateCheckTakaReportRequest({ id, data, params }) {
  return api.patch(`/reports/check-taka-report/update/${id}`, data, {
    params,
  });
}

export function deleteCheckTakaReportRequest({ id, params }) {
  return api.delete(`/reports/check-taka-report/delete/${id}`, {
    params,
  });
}
