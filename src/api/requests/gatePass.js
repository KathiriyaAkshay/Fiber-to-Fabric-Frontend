import { api } from "..";

export function addGatePassRequest({ data, params }) {
    return api.post(`/more/gate-pass/create`, data, { params });
}

export function getGatePassListRequest({ params }) {
    return api.get(`/more/gate-pass/list`, { params });
}

export function updateGatePassRequest({ id, data, params }) {
    return api.patch(`/more/gate-pass/update/${id}`, data, { params });
}