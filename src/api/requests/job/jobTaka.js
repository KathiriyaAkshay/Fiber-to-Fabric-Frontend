import { api } from "../..";

export function getJobTakaListRequest({ params }) {
    return api.get(`/job/taka/list`, { params });
}

export function getJobTakaDetailListRequest({ params }) {
    return api.get(`/job/taka/detail/list`, { params });
}

export function getStockTakaListRequest({params}) {
    return api.get(`/job/taka/detail/list`, {params}) ; 
}

export function updateJobTakaRequest({ id, data, params }) {
    return api.patch(`/job/taka/update/${id}`, data, { params });
}

export function addJobTakaRequest({ data, params }) {
    return api.post(`/job/taka/create`, data, { params });
}

export function getJobTakaByIdRequest({ id, params }) {
    return api.get(`/job/taka/get/${id}`, { params });
}

export function deleteJobTakaRequest({ id, params }) {
    return api.delete(`/job/taka/delete/${id}`, { params });
}