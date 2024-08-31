import { api } from "../..";

export function getParticularListRequest({ params }) {
  return api.get(`/dropdown/passbook_particular_type/list`, { params });
}

export function updateParticularRequest({ id, data, params }) {
  return api.patch(`/dropdown/passbook_particular_type/update`, data, { params });
}

export function createParticularRequest({ data, params }) {
  return api.post(`/dropdown/passbook_particular_type/create`, data, { params });
}