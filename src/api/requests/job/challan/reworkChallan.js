import { api } from "../../..";

export function getReworkChallanListRequest({ params }) {
    return api.get(`/job/challan/rework/list`, { params });
}

export function addReworkChallanRequest({ data, params }) {
    return api.post(`/job/challan/rework/create`, data, { params });
}