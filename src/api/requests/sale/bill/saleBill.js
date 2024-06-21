import { api } from "../../..";

export function createSaleBillRequest({ data, params }) {
    return api.post(`/sale/bill/create`, data, {
        params
    });
}

export function getSaleBillByIdRequest({ id, params }) {
    return api.get(`/sale/bill/get/${id}`, { params });
}

export function getSaleBillListRequest({ params }) {
    return api.get(`/sale/bill/list`, { params })
}


export function deleteSaleBillRequest({ id, params }) {
    return api.delete(`/sale/bill/delete/${id}`, { params });
}