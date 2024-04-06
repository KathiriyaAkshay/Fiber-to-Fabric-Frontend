import { api } from "../..";

export function createWastageReportTaskRequest({ data, params }) {
  return api.post(`/reports/wastage-report-task/create`, data, {
    params,
  });
}

export function getWastageReportTaskByIdRequest({ id, params }) {
  return api.get(`/reports/wastage-report-task/get/${id}`, { params });
}

export function getWastageReportTaskListRequest({ params }) {
  return api.get(`/reports/wastage-report-task/list`, {
    params,
  });
}

export function updateWastageReportTaskRequest({ id, data, params }) {
  return api.patch(`/reports/wastage-report-task/update/${id}`, data, {
    params,
  });
}

export function deleteWastageReportTaskRequest({ id, params }) {
  return api.delete(`/reports/wastage-report-task/delete/${id}`, {
    params,
  });
}
