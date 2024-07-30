import { api } from "../../..";

export function addReworkChallanBillRequest({ data, params }) {
  return api.post(`/job/challan/rework/bill/create`, data, { params });
}