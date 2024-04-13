import { api } from "../..";

export function createAssignRollReportRequest({ data, params }) {
  return api.post(`/reports/assign-roll-reports/create`, data, {
    params,
  });
}

export function getAssignRollReportByIdRequest({ id, params }) {
  return api.get(`/reports/assign-roll-reports/get/${id}`, { params });
}

export function getAssignRollReportListRequest({ params }) {
  return api.get(`/reports/assign-roll-reports/list`, {
    params,
  });
}

export function updateAssignRollReportRequest({ id, data, params }) {
  return api.patch(`/reports/assign-roll-reports/update/${id}`, data, {
    params,
  });
}

export function deleteAssignRollReportRequest({ id, params }) {
  return api.delete(`/reports/assign-roll-reports/delete/${id}`, {
    params,
  });
}
