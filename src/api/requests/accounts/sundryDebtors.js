import { api } from "../..";

export function getSundryDebtorsService({ params }) {
  return api.get(`/account/group-wise-outstanding/debiter/sundry`, { params });
}

export function paidInterestRequest({data, params}){
  return api.post(`account/group-wise-outstanding/debiter/sundry/interest/create`, data, {params}) ;
}