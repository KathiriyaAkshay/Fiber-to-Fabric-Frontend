import { api } from "..";

export function addGatePassRequest({ data, params }) {
    return api.post(`/more/gate-pass/create`, data, { params });
}