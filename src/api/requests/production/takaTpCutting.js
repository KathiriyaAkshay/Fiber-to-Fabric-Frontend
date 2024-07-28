import { api } from "../..";

export function getTakaCuttingListRequest({ params }) {
    return api.get(`/production/taka-cutting/list`, { params });
}

export function deleteTakaCuttingRequest({ id, params }) {
    return api.delete(`/production/taka-cutting/delete/${id}`, { params });
}


export function addTakaTpCuttingRequest({ data, params }) {
    return api.post(`/production/taka-cutting/create`, data, { params });
}

export function getTakaCuttingSrNoRequest({ params }) {
    return api.get(`/production/taka-cutting/sr_no`, { params });
}