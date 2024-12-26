import { api } from "../..";

// Get Last Voucher No------------------------------------------------------------------------
export function getLastVoucherNoRequest({ params }) {
  return api.get(`/account/statement/last/voucher`, { params });
}

// Bill services------------------------------------------------------------------------

// Contract services------------------------------------------------------------------------

export function addContractRequest({ data, params }) {
  return api.post(`/account/statement/contract/create`, data, { params });
}

// PASSBOOK SERVICES------------------------------------------------------------------------
export function getPassbookListRequest({ params }) {
  return api.get(`/account/statement/passbook/list`, { params });
}

export function updatePassbookRequest({ id, data, params }) {
  return api.patch(`/account/statement/passbook/update/${id}`, data, { params });
}

export function addPassbookRequest({ data, params }) {
  return api.post(`/account/statement/passbook/create`, data, { params });
}

export function deleteRevertPassbookRequest({ id, params }) {
  return api.patch(`/account/statement/passbook/revert/${id}`, null, { params });
}

// Cashbook services------------------------------------------------------------------------
export function getCashbookListRequest({ params }) {
  return api.get(`/account/statement/cashbook/list`, { params });
}

export function updateCashbookRequest({data, params }) {
  return api.patch(`/account/statement/cashbook/update`, data, { params });
}

export function addCashbookRequest({ data, params }) {
  return api.post(`/account/statement/cashbook/create`, data, { params });
}

export function deleteRevertCashbookRequest({id, params}){
  return api.patch(`/account/statement/cashbook/revert/${id}`, null, {params}) ; 
}

// Journal services------------------------------------------------------------------------
export function getJournalListRequest({ params }) {
  return api.get(`/account/statement/journal/voucher/list`, { params });
}

export function deleteJournalRequest({ id, params }) {
  return api.delete(`/account/statement/journal/voucher/delete/${id}`, { params });
}

export function addJournalRequest({ data, params }) {
  return api.post(`/account/statement/journal/voucher/create`, data, { params });
}

// Bill services------------------------------------------------------------------------
export function getPaymentBillListRequest({ params }) {
  return api.get(`/account/bill/statements/list`, { params });
}

export function getUnPaidPaymentBillListRequest({ params }) {
  return api.get(`/account/bill/list`, { params });
}

export function addPaymentBillRequest({ data, params }) {
  return api.post(`/account/bill/create`, data, { params });
}

// Particular bill related information 

export function particularBillPartPaymentRequest({id, params}){
  return api.get(`account/bill/payments/list/${id}`, {params}) ; 
}