import { api } from "../../..";

export function createBeamSaleChallanRequest({ data, params }) {
    return api.post(`/sale/challan/beam-sale/create`, data, {
        params
    });
}

export function getBeamSaleChallanByIdRequest({ id, params }) {
    return api.get(`/sale/challan/beam-sale/get/${id}`, { params });
}

export function getBeamSaleChallanListRequest({ params }) {
    return api.get(`/sale/challan/beam-sale/list`, { params })
}

export function updateBeamSaleChallanRequest({ id, data, params }) {
    return api.patch(`/sale/challan/beam-sale/update/${id}`, data, { params });
}

export function deleteBeamSaleChallanRequest({ id, params }) {
    return api.delete(`/sale/challan/beam-sale/delete/${id}`, { params });
}

// Bill APi services---------------------------------------------------------------------


export function createBeamSaleChallanBillRequest({ data, params }) {
    return api.post(`/sale/challan/beam-sale/bill/create`, data, {
        params
    });
}

export function getBeamSaleChallanBillByIdRequest({ id, params }) {
    return api.get(`/sale/challan/beam-sale/bill/get/${id}`, { params });
}

export function getBeamSaleChallanBillListRequest({ params }) {
    return api.get(`/sale/challan/beam-sale/bill/list`, { params })
}
