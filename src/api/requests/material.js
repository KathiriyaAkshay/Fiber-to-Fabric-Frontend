import { api } from "..";

// export function addMachineRequest({ data, params }) {
//   return api.post(`/machine/add/`, data, { params });
// }

// export function getMachineDropdownListRequest({ params }) {
//   return api.get(`dropdown/machine_name/list`, {
//     params: params,
//   });
// }

// export function addMachineNameWithTypeRequest({ data, params }) {
//   return api.post(`/dropdown/machine_name/add`, data, { params });
// }

// export function getMachineByIdRequest({ id, params }) {
//   return api.get(`/machine/get/${id}`, { params });
// }

export function getMillgineListRequest({ params }) {
  return api.get(`/more/material/millgine/list`, { params });
}

export function getMillgineReportListRequest({ params }) {
  return api.get(`/more/millgine/get/report`, { params });
}

export function getMaterialStoreListRequest({ params }) {
  return api.get(`/more/material/store/list`, { params });
}

export function updateMaterialStoreRequest({ data, params }) {
  return api.patch(`/more/material/store/update`, data, { params });
}

// export function deleteMachineRequest({ id, params }) {
//   return api.delete(`/machine/delete/${id}`, { params });
// }
