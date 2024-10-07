import { api } from "../..";


export function getPassbookCashbookReport({ params }) {
    return api.get(`/account/report/passbook-cashbook/report`, { params });
  }
