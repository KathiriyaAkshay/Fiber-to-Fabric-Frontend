import { api } from "../..";


export function getPassbookCashbookReportService({ params }) {
  return api.get(`/account/report/passbook-cashbook/report`, { params });
}

export function getMonthlyTransactionReportService({ params }) {
  return api.get(`/account/report/monthly-transaction/report`, { params });
}

// Company wise turn over report information
export function getTurnoverReportService({ params }) {
  return api.get(`/account/report/turnover/report`, { params });
}

// GSTR 1 Report API services

export function getGstr1ReportService({ params }) {
  return api.get(`/account/report/gstr-1/report`, { params });
}

export function getGstr2ReportService({ params }) {
  return api.get(`/account/report/gstr-2/report`, { params });
}

// LIVE STOCK REPORT---------------------------

// Opening Stock
export function getOpeningStockReportService({ params }) {
  return api.get(`/account/report/live-stock/opening/report/get`, { params });
}

export function createOpeningStockRequest({ data, params }) {
  return api.post(`/account/report/live-stock/opening/report/create`, data, { params });
}

export function getCurrentStockReportService({ params }) {
  return api.get(`/account/report/live-stock/current/report/get`, { params });
}

export function createCurrentStockRequest({ data, params }) {
  return api.post(`/account/report/live-stock/current/report/create`, data, { params });
}

// PURCHASE REPORT---------------------------

export function getAccountPurchaseReportService({ params }) {
  return api.get(`/account/reports/purchase/report`, { params });
}

// SALES REPORT---------------------------

export function getAccountSalesReportService({ params }) {
  return api.get(`/account/reports/sale/report`, { params });
}