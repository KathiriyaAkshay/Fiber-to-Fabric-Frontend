import { api } from "..";

export function getMonthlyProductionChartRequest({ params }) {
  return api.get(`/dashboard/production/month-chart`, { params });
}

export function getDailyProductionChartRequest({ params }) {
  return api.get(`/dashboard/production/day-chart`, { params });
}

export const getCompanyBankBalanceRequest = ({ params }) => {
  return api.get(`/dashboard/company/banks`, { params });
}

export const getCompanyUserAnalyticsRequest = ({ params }) => {
  return api.get(`/dashboard/company/users`, { params });
}