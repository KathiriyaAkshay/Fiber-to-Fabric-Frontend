import { api } from "../..";


export function addProductionRequest({ data, params }) {
    return api.post(`/production/create`, data, { params });
}

export function getLastProductionTakaRequest({ params }) {
    return api.get(`/production/last-taka`, { params });
}

export function getProductionListRequest({ params }) {
    return api.get(`/production/list`, { params });
}

// export function updateGatePassRequest({ id, data, params }) {
//     return api.patch(`/more/gate-pass/update/${id}`, data, { params });
// }

// export function getGatePassByIdRequest({ id, params }) {
//     return api.get(`/more/gate-pass/get/${id}`, { params });
// }

export function deleteProductionRequest({ id, params }) {
    return api.delete(`/production/delete/${id}`, { params });
}