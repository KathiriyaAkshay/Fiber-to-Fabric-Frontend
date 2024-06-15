import { api } from "../../..";

export function getJobBeamReceiveListRequest({ params }) {
    return api.get(`/job/receive/beam/list`, { params });
}


export function updateJobBeamReceiveRequest({ id, data, params }) {
    return api.patch(`/job/receive/beam/update/${id}`, data, { params });
}

export function addJobBeamReceiveRequest({ data, params }) {
    return api.post(`/job/receive/beam/create`, data, { params });
}

export function getJobBeamReceiveByIdRequest({ id, params }) {
    return api.get(`/job/receive/beam/get/${id}`, { params });
}