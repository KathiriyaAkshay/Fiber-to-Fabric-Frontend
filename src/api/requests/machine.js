import { api } from "..";

export function addMachineRequest({ data }) {
  return api.post(`/machine/add/`, data);
}

export function getMachineDropdownListRequest({ params }) {
  return api.get(`dropdown/machine_name/list`, {
    params: params,
  });
}

export function addMachineNameWithTypeRequest({ data }) {
  return api.post(`/dropdown/machine_name/add`, data);
}

export function getMachineByIdRequest({ id, config }) {
  return api.get(`/machine/get/${id}`, config);
}

export function getCompanyMachineListRequest({ companyId, config }) {
  return api.get(`/machine/list/${companyId}`, config);
}

export function updateMachineRequest({ id, data }) {
  return api.patch(`/machine/update/${id}`, data);
}

export function deleteMachineRequest({ id, config }) {
  return api.delete(`/machine/delete/${id}`, config);
}
