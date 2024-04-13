import { api } from "../..";

export function createDailyTFOReportRequest({ data, params }) {
  return api.post(`/reports/daily-tfo-report/create`, data, {
    params,
  });
}

export function getDailyTFOReportByIdRequest({ id, params }) {
  return api.get(`/reports/daily-tfo-report/get/${id}`, { params });
}

export function getDailyTFOReportListRequest({ params }) {
  return api.get(`/reports/daily-tfo-report/list`, {
    params,
  });
}

export function updateDailyTFOReportRequest({ id, data, params }) {
  return api.patch(`/reports/daily-tfo-report/update/${id}`, data, {
    params,
  });
}

export function deleteDailyTFOReportRequest({ id, params }) {
  return api.delete(`/reports/daily-tfo-report/delete/${id}`, {
    params,
  });
}
