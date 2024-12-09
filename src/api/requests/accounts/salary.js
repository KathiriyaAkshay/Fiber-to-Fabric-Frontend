// Credit notes services---------------------------------------------------

import { api } from "../..";

// Employee salary report services.

export function createWorkBasisSalaryRequest({ data, params }) {
  return api.post(`/account/salary-report/work-basis/create`, data, { params });
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
