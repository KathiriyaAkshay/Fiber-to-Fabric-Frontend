import { api } from "../..";

export function getSundryCreditorService({ params }) {
  return api.get(`/account/group-wise-outstanding/crediter/sundry`, { params });
}