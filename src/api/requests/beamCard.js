import { api } from "..";

export function getLoadedMachineListRequest({ params }) {
    return api.get(`beam/loaded-machine/list`, {
        params: params,
    });
}

export function getPasarelaBeamListRequest({ params }) {
    return api.get(`/beam/stock/pasarela/list`, {
        params: params,
    });
}

export function getNonPasarelaBeamListRequest({ params }) {
    return api.get(`/beam/stock/non-pasarela/list`, {
        params: params,
    });
}

export function getNonPasarelaSecondaryBeamListRequest({ params }) {
    return api.get(`/beam//stock/non-pasarela/secondary-beam/list`, {
        params: params,
    });
}

export function createLoadNewBeamRequest({ data, params }) {
    return api.post("/beam/load/create", data, { params });
}

export function updateLoadNewBeamRequest({ id, data, params }) {
    return api.patch(`/beam/load/update/${id}`, data, { params });
}

export function getBeamCardByIdRequest({ id, params }) {
    return api.get(`/beam/load/get/${id}`, { params });
}


export function getBeamCardListRequest({ params }) {
    return api.get(`/beam/card/list`, {
        params: params,
    });
}


export function createNBNBeamRequest({ data, params }) {
    return api.post("/beam/nbn/load/create", data, { params });
}
