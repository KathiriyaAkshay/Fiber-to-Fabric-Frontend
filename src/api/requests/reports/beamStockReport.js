import { api } from "../..";

export function getLastBeamNumberRequest({ params }) {
    return api.get(`/beam/stock/last-beam`, { params });
}

export function createBeamStockReportRequest({ data, params }) {
    return api.post(`/beam/stock/create`, data, {
        params,
    });
}


export function getNonPasarelaBeamRequest({ params }) {
    return api.get(`/beam/stock/non-pasarela/list`, { params });
}

export function getSecondaryBeamRequest({ params }) {
    return api.get(`/beam//stock/non-pasarela/secondary-beam/list`, { params });
}


export function createBeamStockPasarelaRequest({ data, params }) {
    return api.post(`/beam/stock/pasarela/create`, data, {
        params,
    });
}