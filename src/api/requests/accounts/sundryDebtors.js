import { api } from "../..";

export function getSundryDebtorsService({ params }) {
  return api.get(`/account/group-wise-outstanding/debiter/sundry`, { params });
}