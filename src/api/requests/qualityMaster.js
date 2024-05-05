import { api } from "..";

export function getInHouseQualityListRequest({ params }) {
    return api.get(`/quality-master/inhouse-quality/list`, { params });
}

export function updateInHouseQualityRequest({ id, data, params }) {
    return api.patch(`/quality-master/inhouse-quality/update/${id}`, data, { params });
}


export function addInHouseQualityRequest({ data, params }) {
    return api.post(`/quality-master/inhouse-quality/create`, data, { params });
}

export function getDesignNoDropDownRequest({ params }) {
    return api.get(`/dropdown/quality/design/list`, { params });
}

export function getInHouseQualityByIdRequest({ id, params }) {
    return api.get(`/quality-master/inhouse-quality/get/${id}`, { params });
}

// ********************************************************************************************************

export function getTradingQualityListRequest({ params }) {
    return api.get(`/quality-master/trading_quality/list`, { params });
}

export function getQualityNameDropDownRequest({ params }) {
    return api.get(`/dropdown/quality_name/list`, { params });
}

export function updateTradingQualityRequest({ id, data, params }) {
    return api.patch(`/quality-master/trading_quality/update/${id}`, data, { params });
}

export function addTradingQualityRequest({ data, params }) {
    return api.post(`/quality-master/trading_quality/create`, data, { params });
}

export function getTradingQualityByIdRequest({ id, params }) {
    return api.get(`/quality-master/trading_quality/get/${id}`, { params });
}