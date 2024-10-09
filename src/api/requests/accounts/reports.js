import { api } from "../..";


export function getPassbookCashbookReportService({ params }) {
  return api.get(`/account/report/passbook-cashbook/report`, { params });
}
