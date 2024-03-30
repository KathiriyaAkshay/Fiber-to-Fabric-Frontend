import { api } from "../..";

export function createDenierwiseWastageReportRequest({ data, params }) {
  return api.post(`/reports/denierwise-wastage-report/create`, data, {
    params,
  });
}

export function getDenierwiseWastageReportByIdRequest({ id, params }) {
  return api.get(`/reports/denierwise-wastage-report/get/${id}`, { params });
}

export function getDenierwiseWastageReportListRequest({ params }) {
  return api.get(`/reports/denierwise-wastage-report/list`, {
    params,
  });
}

export function updateDenierwiseWastageReportRequest({ id, data, params }) {
  return api.patch(`/reports/denierwise-wastage-report/update/${id}`, data, {
    params,
  });
}

export function deleteDenierwiseWastageReportRequest({ id, params }) {
  return api.delete(`/reports/denierwise-wastage-report/delete/${id}`, {
    params,
  });
}
