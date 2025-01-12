import { api } from "../../..";


export function getBeamSentListRequest({ params }) {
    return api.get(`/job/beam/sent/list`, { params });
}

export function updateBeamSentRequest({ id, data, params }) {
    return api.patch(`/job/beam/sent/update/${id}`, data, { params });
}


export function addBeamSentRequest({ data, params }) {
    return api.post(`/job/beam/sent/create`, data, { params });
}

export function getBeamSentByIdRequest({ id, params }) {
    return api.get(`/job/beam/sent/get/${id}`, { params });
}

export function deleteBeamSentRequest({ id, params }) {
    return api.delete(`/job/beam/sent/delete/${id}`, { params });
}

export function getLastBeamSentChallanRequest({params}){
    return api.get(`/job/beam/sent/last-challan-no`, {params}) ; 
}