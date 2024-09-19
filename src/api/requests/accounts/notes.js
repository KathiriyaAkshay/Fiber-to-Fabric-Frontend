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