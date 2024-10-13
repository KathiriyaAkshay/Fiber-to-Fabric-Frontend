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
