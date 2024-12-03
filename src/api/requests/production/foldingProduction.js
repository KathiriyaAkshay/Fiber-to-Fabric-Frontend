import { api } from "../..";

export function addFoldingProductionRequest({ data, params }) {
  return api.post(`/production/folding/create`, data, { params });
}
