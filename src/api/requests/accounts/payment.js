import { api } from "../..";

// Passbook services------------------------------------------------------------------------
export function getPassbookListRequest({ params }) {
  return api.get(`/account/statement/passbook/list`, { params });
}

export function updatePassbookRequest({ id, data, params }) {
  return api.patch(`/account/statement/passbook/update/${id}`, data, { params });
}

export function addPassbookRequest({ data, params }) {
  return api.post(`/account/statement/passbook/create`, data, { params });
}
