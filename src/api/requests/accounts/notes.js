import { api } from "../..";

// Credit notes services---------------------------------------------------

export function getCreditNotesListRequest({ params }) {
  return api.get(`/account/credit-notes/list`, { params });
}

export function getCreditNotesByIdRequest({ id, params }) {
  return api.get(`/account/credit-notes/get/${id}`, { params });
}

export function getLastCreditNoteNumberRequest({ params }) {
  return api.get(`/account/credit-notes/last-number`, { params });
}

export function createCreditNoteRequest({ data, params }) {
  return api.post(`/account/credit-notes/create`, data, { params });
}

export function updateCreditNoteRequest({ data, params }) {
  return api.patch(`/account/credit-notes/update`, data, { params });
}

export function creditNoteDropDownRequest({ params }) {
  return api.get(`account/credit-notes/bill/get`, { params });
}

export function deleteCreditNoteRequest({ id, params }) {
  return api.delete(`/account/credit-notes/delete/${id}`, { params });
}

// Debit notes services---------------------------------------------------

export function getDebitNotesListRequest({ params }) {
  return api.get(`/account/debit-notes/list`, { params });
}

export function getDebitNoteBillDropDownRequest({ params }) {
  return api.get(`/account/debit-notes/bill/get`, { params });
}

export function getDebitNoteChallanNoDropDownRequest({ params }) {
  return api.get(`/account/debit-notes/challan-no/drop-down/get`, { params });
}

export function getLastDebitNoteNumberRequest({ params }) {
  return api.get(`/account/debit-notes/last-number`, { params });
}

export function createDebitNoteRequest({ data, params }) {
  return api.post(`/account/debit-notes/create`, data, { params });
}
