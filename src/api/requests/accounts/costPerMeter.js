import { api } from "../..";

export function getCostPerMeterReportService({ params }) {
  return api.get(`/account/report/cost-per-meter/report/generate`, { params });
}

export function confirmCostPerMeterRequest({ data, params }) {
  return api.post(`/account/report/cost-per-meter/report/confirm`, data, {
    params,
  });
}
