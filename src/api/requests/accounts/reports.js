import { api } from "../..";


export function getPassbookCashbookReportService({ params }) {
  return api.get(`/account/report/passbook-cashbook/report`, { params });
}

export function getMonthlyTransactionReportService({ params }) {
  return api.get(`/account/report/monthly-transaction/report`, { params });
}

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