import { api } from "../../..";

export function getReworkChallanListRequest({ params }) {
    return api.get(`/job/challan/rework/list`, { params });
}

export function addReworkChallanRequest({ data, params }) {
    return api.post(`/job/challan/rework/create`, data, { params });
}

export function deleteReworkChallanRequest({ id, params }) {
    return api.delete(`/job/challan/rework/delete/${id}`, { params });
}

export function getReworkChallanByIdRequest({ id, params }) {
    return api.get(`/job/challan/rework/get/${id}`, { params });
}

export function updateReworkChallanRequest({ id, data, params }) {
    return api.patch(`/job/challan/rework/update/${id}`, data, { params });
}

// Rework options list

export function getReworkOptionsListRequest({ params }) {
    return api.get(`/dropdown/job/challan/rework/options/list`, { params });
}