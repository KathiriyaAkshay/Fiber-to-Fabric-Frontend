import { api } from "../..";

export function getPurchaseTakaListRequest({ params }) {
    return api.get(`/purchase/taka/list`, { params });
}

export function getPurchaseTakaDetailListRequest({ params }) {
    return api.get(`/purchase/taka/detail/list`, { params });
}

export function updatePurchaseTakaRequest({ id, data, params }) {
    return api.patch(`/purchase/taka/update/${id}`, data, { params });
}

export function addPurchaseTakaRequest({ data, params }) {
    return api.post(`/purchase/taka/create`, data, { params });
}

export function getPurchaseTakaByIdRequest({ id, params }) {
    return api.get(`/purchase/taka/get/${id}`, { params });
}

export function deletePurchaseTakaRequest({ id, params }) {
    return api.delete(`/purchase/taka/delete/${id}`, { params });
}

export function getYarnBillListRequest({params}) {
    return api.get(`/yarn-stock/yarn-receive-challan/bill/list`, {params}) ; 
}

export function getYarnBillById({id, params}){
    return api.get(`/yarn-stock/yarn-receive-challan/bill/get/${id}`, {params}) ; 
}