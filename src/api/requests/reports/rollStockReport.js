import { api } from "../..";

export function createRollStockReportRequest({ data, params }) {
  return api.post(`/reports/roll-stock-report/create`, data, {
    params,
  });
}

// export function getRollStockReportByIdRequest({ id, params }) {
//   return api.get(`/reports/roll-stock-report/get/${id}`, { params });
// }

export function getRollStockReportListRequest({ params }) {
  return api.get(`/reports/roll-stock-report/list`, {
    params,
  });
}

// export function updateRollStockReportRequest({ id, data, params }) {
//   return api.patch(`/reports/roll-stock-report/update/${id}`, data, {
//     params,
//   });
// }

// export function deleteRollStockReportRequest({ id, params }) {
//   return api.delete(`/reports/roll-stock-report/delete/${id}`, {
//     params,
//   });
// }
