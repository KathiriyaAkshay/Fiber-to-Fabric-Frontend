import { api } from "../../..";

export function getJobYarnStockReportListRequest({ params }) {
    return api.get(`/job/report/yarn_stock_report/list`, { params });
}

export function addJobYarnStockReportRequest({ data, params }) {
    return api.post(`/job/report/yarn_stock_report/create`, data, { params });
}