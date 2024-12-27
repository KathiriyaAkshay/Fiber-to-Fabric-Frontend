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

export const getDashboardOutStandingInformation = ({params}) => {
  return api.get(`/dashboard/receivable-outstanding`, {params}) ; 
}

export const getDashboardPayableInformation = ({params}) => {
  return api.get(`/dashboard/payable-outstanding`, {params}) ; 
}

export const getDashboardEmployeeInformation = ({params}) => {
  return api.get(`/dashboard/company/users`, {params}) ; 
}