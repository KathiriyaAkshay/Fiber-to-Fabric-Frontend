import { api } from "../../..";


export function getYarnSentListRequest({ params }) {
    return api.get(`/job/sent/yarn/list`, { params });
}

export function updateYarnSentRequest({ id, data, params }) {
    return api.patch(`/job/sent/yarn/update/${id}`, data, { params });
}


export function addYarnSentRequest({ data, params }) {
    return api.post(`/job/sent/yarn/create`, data, { params });
}

export function getYarnSentByIdRequest({ id, params }) {
    return api.get(`/job/sent/yarn/get/${id}`, { params });
}

export function deleteYarnSentRequest({ id, params }) {
    return api.delete(`/job/sent/yarn/delete/${id}`, { params });
}

export function getYarnSentLastChallanNoRequest({ params }) {
    return api.get(`/job/sent/yarn/last-challan-no/`, { params });
}