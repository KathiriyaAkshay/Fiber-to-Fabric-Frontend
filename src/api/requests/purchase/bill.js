import { api } from "../..";

export function getPurchaseTakaBillListRequest({ params }) {
    return api.get(`/purchase/taka/bill/list`, { params });
}

export function addPurchaseTakaBillRequest({ data, params }) {
    return api.post(`/purchase/taka/bill/create`, data, { params });
}

export function getPurchaseTakaBillByIdRequest({ params }) {
    return api.get(`/purchase/taka/bill/get`, { params });
}