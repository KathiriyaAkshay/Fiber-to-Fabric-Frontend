import { api } from "..";

export function getMonthlyProductionChartRequest({ params }) {
  return api.get(`/dashboard/production/month-chart`, { params });
}

export function getDailyProductionChartRequest({ params }) {
  return api.get(`/dashboard/production/day-chart`, { params });
}