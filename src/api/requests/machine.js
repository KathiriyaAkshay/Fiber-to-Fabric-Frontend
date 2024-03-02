import { api } from "..";

export function addMachineRequest({ data, params }) {
  return api.post(`/machine/add/`, data, { params });
}

export function getMachineDropdownListRequest({ params }) {
  return api.get(`dropdown/machine_name/list`, {
    params: params,
  });
}

export function addMachineNameWithTypeRequest({ data, params }) {
  return api.post(`/dropdown/machine_name/add`, data, { params });
}

export function getMachineByIdRequest({ id, params }) {
  return api.get(`/machine/get/${id}`, { params });
}

export function getCompanyMachineListRequest({ companyId, params }) {
  return api.get(`/machine/list/${companyId}`, { params });
}

export function updateMachineRequest({ id, data, params }) {
  return api.patch(`/machine/update/${id}`, data, { params });
}

export function deleteMachineRequest({ id, params }) {
  return api.delete(`/machine/delete/${id}`, { params });
}
