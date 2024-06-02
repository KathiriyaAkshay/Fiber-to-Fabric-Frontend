import { api } from "../../..";

export function createSaleYarnChallanRequest({data, params}){
    return api.post(`/sale/challan/yarn-sale/create`, data, {
        params
    }); 
}

export function saleYarnChallanListRequest({params}){
    return api.get(`/sale/challan/yarn-sale/list`, {
        params
    })
}

export function deleteSaleYarnChallanRequest({id, params}){
    return api.delete(`/sale/challan/yarn-sale/delete/${id}`, {params}) ; 
}

export function getYarnSaleChallanByIdRequest({id, params}){
    return api.get(`/sale/challan/yarn-sale/get/${id}`, {params}) ; 
}

export function updateYarnSalerChallanRequest({id, data, params}){
    return api.patch(`sale/challan/yarn-sale/update/${id}`, data, {params}) ; 
}