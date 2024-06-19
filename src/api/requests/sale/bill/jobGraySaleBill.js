import { api } from "../../..";

export function createJobGraySaleBillRequest({ data, params }) {
    return api.post(`/sale/job-gray-sale/bill/create`, data, {
        params
    });
}

export function getJobGraySaleBillByIdRequest({ id, params }) {
    return api.get(`/sale/job-gray-sale/bill/get/${id}`, { params });
}

export function getJobGraySaleBillListRequest({ params }) {
    return api.get(`/sale/job-gray-sale/bill/list`, { params })
}


export function deleteJobGraySaleBillRequest({ id, params }) {
    return api.delete(`/sale/job-gray-sale/bill/delete/${id}`, { params });
}