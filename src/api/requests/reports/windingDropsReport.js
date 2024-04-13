import { api } from "../..";

export function createWindingDropsReportRequest({ data, params }) {
  return api.post(`/reports/winding-drops-report/create`, data, {
    params,
  });
}

export function getWindingDropsReportByIdRequest({ id, params }) {
  return api.get(`/reports/winding-drops-report/get/${id}`, { params });
}

export function getWindingDropsReportListRequest({ params }) {
  return api.get(`/reports/winding-drops-report/list`, {
    params,
  });
}

export function updateWindingDropsReportRequest({ id, data, params }) {
  return api.patch(`/reports/winding-drops-report/update/${id}`, data, {
    params,
  });
}

export function deleteWindingDropsReportRequest({ id, params }) {
  return api.delete(`/reports/winding-drops-report/delete/${id}`, {
    params,
  });
}
