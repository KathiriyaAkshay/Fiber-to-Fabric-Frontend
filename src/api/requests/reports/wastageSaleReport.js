import { api } from "../..";

export function createWastageSaleReportRequest({ data, params }) {
  return api.post(`/reports/wastage-sale-report/create`, data, {
    params,
  });
}

export function updateWastageSaleReportRequest({ id, data, params }) {
  return api.patch(`/reports/wastage-sale-report/update/${id}`, data, {
    params,
  });
}

export function getWastageSaleReportByIdRequest({ id, params }) {
  return api.get(`/reports/wastage-sale-report/get/${id}`, { params });
}

export function getWastageSaleReportListRequest({ params }) {
  return api.get(`/reports/wastage-sale-report/list`, {
    params,
  });
}

export function getDropdownParticularWastageListRequest({ params }) {
  return api.get(`/dropdown/particular_wastage/list`, { params });
}
