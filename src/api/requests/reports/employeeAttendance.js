import { api } from "../..";

export function createEmployeeAttendanceReportRequest({ data, params }) {
  return api.post(`/reports/employee-attandance-report/create`, data, {
    params,
  });
}

export function getEmployeeAttendanceReportByIdRequest({ id, params }) {
  return api.get(`/reports/employee-attandance-report/get/${id}`, { params });
}

export function getEmployeeAttendanceReportListRequest({ params }) {
  return api.get(`/reports/employee-attandance-report/list`, {
    params,
  });
}

export function updateEmployeeAttendanceReportRequest({ id, data, params }) {
  return api.patch(`/reports/employee-attandance-report/update/${id}`, data, {
    params,
  });
}

export function deleteEmployeeAttendanceReportRequest({ id, params }) {
  return api.delete(`/reports/employee-attandance-report/delete/${id}`, {
    params,
  });
}
