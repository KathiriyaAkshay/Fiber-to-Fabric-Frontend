import { api } from "../../..";

export function createSaleYarnChallanBillRequest({ data, params }) {
    return api.post(`/sale/challan/yarn-sale/bill/create`, data, {
        params,
    });
}
export function getSaleYarnChallanBillByIdRequest({ id, params }) {
    return api.get(`/sale/challan/yarn-sale/bill/get/${id}`, { params });
}

export function getSaleYarnChallanBillListRequest({ params }) {
    return api.get("/sale/challan/yarn-sale/bill/list", { params });
}

// ----------------------------------------------------------------
export function getYarnSaleChallanBillByIdRequest({ id, params }) {
    return api.get(`/sale/challan/yarn-sale/get/${id}`, { params });
}

export function createSaleYarnChallanRequest({ data, params }) {
    return api.post(`/sale/challan/yarn-sale/create`, data, {
        params,
    });
}

export function saleYarnChallanListRequest({ params }) {
    return api.get(`/sale/challan/yarn-sale/list`, {
        params,
    });
}

export function returnYarnSaleChallanRequest({ data, params}){
    return api.post(`/sale/challan/yarn-sale/return/create`, data,  {
        params
    })
}

export function deleteSaleYarnChallanRequest({ id, params }) {
    return api.delete(`/sale/challan/yarn-sale/delete/${id}`, { params });
}

export function getYarnSaleChallanByIdRequest({ id, params }) {
    return api.get(`/sale/challan/yarn-sale/get/${id}`, { params });
}

export function updateYarnSalerChallanRequest({ id, data, params }) {
    return api.patch(`sale/challan/yarn-sale/update/${id}`, data, { params });
}

export function createSaleJobWorkChallanRequest({ data, params }) {
    return api.post(`/sale/challan/job-work/create`, data, {
        params,
    });
}

export function getSaleJobWorkLastChallanRequest({ params }) {
    return api.get(`/sale/challan/job-work/last-challan-no`, { params });
}

export function saleJobWorkChallanListRequest({ params }) {
    return api.get(`/sale/challan/job-work/list`, {
        params,
    });
}

export function deleteSaleJobWorkChallanRequest({ id, params }) {
    return api.delete(`/sale/challan/job-work/delete/${id}`, { params });
}

export function getSaleJobworkChllanByIdRequest({ id, params }) {
    return api.get(`/sale/challan/job-work/get/${id}`, { params });
}

export function updateJobWorkSaleChallanRequest({ id, data, params }) {
    return api.patch(`sale/challan/job-work/update/${id}`, data, { params });
}

// Sale -> challan -> job work -> bill

export function createSaleJobWorkChallanBillRequest({ data, params }) {
    return api.post(`/sale/challan/job-work/bill/create`, data, {
        params,
    });
}

export function getSaleJobWorkChallanBillByIdRequest({ id, params }) {
    return api.get(`/sale/challan/job-work/bill/get/${id}`, { params });
}

export function getSaleJobWorkBillListRequest({ params }) {
    return api.get(`/sale/challan/job-work/bill/list`, { params });
}

// ----------------------------------------------------------------

// sale -> challan -> sale challan

export function getSaleChallanListRequest({ params }) {
    return api.get(`/sale/challan/list`, {
        params,
    });
}

export function getSaleChallanByIdRequest({ id, params }) {
    return api.get(`/sale/challan/get/${id}`, { params });
}

export function createSaleChallanRequest({ data, params }) {
    return api.post(`/sale/challan/create`, data, {
        params,
    });
}

export function getSaleLastChallanNumberRequest({params}){
    return api.get(`sale/challan/last-invoice-no`, {params}) ;
}

export function updateSaleChallanRequest({ id, data, params }) {
    return api.patch(`/sale/challan/update/${id}`, data, { params });
}

export function deleteSaleChallanRequest({ id, params }) {
    return api.delete(`/sale/challan/delete/${id}`, { params });
}

export function createSaleChallanTakaDetailRequest({ data, params }) {
    return api.post(`/sale/challan/taka-detail`, data, {
        params,
    });
}

export function createSaleChallanBillRequest({ data, params }) {
    return api.post(`/sale/bill/create`, data, {
        params,
    });
}

// ----------------------------------------------------------------

// sale -> challan -> sale challan return

export function getSaleChallanReturnListRequest({ params }) {
    return api.get(`/sale/challan/return/list`, {
        params,
    });
}

export function getSaleChallanReturnByIdRequest({ id, params }) {
    return api.get(`/sale/challan/return/get/${id}`, { params });
}

export function createSaleChallanReturnRequest({ data, params }) {
    return api.post(`/sale/challan/return/create`, data, {
        params,
    });
}