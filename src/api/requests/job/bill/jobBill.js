import { api } from "../../..";

export function getJobTakaBillListRequest({ params }) {
    return api.get(`/job/taka/bill/list`, { params });
}

export function addJobTakaBillRequest({ data, params }) {
    return api.post(`/job/taka/bill/create`, data, { params });
}

export function getJobTakaBillByIdRequest({ params }) {
    return api.get(`/job/taka/bill/get`, { params });
}