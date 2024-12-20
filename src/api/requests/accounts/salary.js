// Credit notes services---------------------------------------------------

import { api } from "../..";

// Employee salary report services.

export function createWorkBasisSalaryRequest({ data, params }) {
  return api.post(`/account/salary-report/work-basis/create`, data, { params });
}

export function getWorkBasisSalaryListRequest({ params }) {
  return api.get(`/account/salary/report/generate`, { params });
}

export function createSalaryReportComponentsRequest({ data, params }) {
  return api.post(`/account/salary/report/component/create`, data, { params });
}

export function createPaidSalarySaveRequest({ data, params }) {
  return api.post(`/account/salary/report/paid/create`, data, { params });
}

// Advance salary services.
export function getAdvanceSalaryListRequest({ params }) {
  return api.get(`/account/salary/advanced/list`, { params });
}

export function createAdvanceSalaryRequest({ data, params }) {
  return api.post(`/account/salary/advanced/create`, data, { params });
}

export function deleteAdvanceSalaryRequest({ id, params }) {
  return api.delete(`/account/salary/advanced/delete/${id}`, {
    params,
  });
}

// Average salary report services.
export function getAverageSalaryReportListRequest({ params }) {
  return api.get(`/account/salary/report/work-basis/list`, { params });
}
