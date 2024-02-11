import { api } from "..";

export function addUserRequest({ roleId, data }) {
  return api.post(`/users/add/${roleId}`, data);
}

export function updateUserRequest({ roleId, userId, data }) {
  return api.post(`/users/update/${roleId}/${userId}`, data);
}

// supervisor
export function getSupervisorByIdRequest({ id, config }) {
  return api.get(`/supervisor/get/${id}`, config);
}

export function getSupervisorListRequest(config) {
  return api.get(`/supervisor/list`, config);
}

// Broker
export function getBrokerByIdRequest({ id, config }) {
  return api.get(`/broker/get/${id}`, config);
}

export function getBrokerListRequest(config) {
  return api.get(`/broker/list`, config);
}

// Party
export function getPartyByIdRequest({ id, config }) {
  return api.get(`/party/get/${id}`, config);
}

export function getPartyListRequest(config) {
  return api.get(`/party/list`, config);
}

// supplier
export function getSupplierByIdRequest({ id, config }) {
  return api.get(`/supplier/get/${id}`, config);
}

export function getSupplierListRequest(config) {
  return api.get(`/supplier/list`, config);
}

// employee
export function getEmployeeByIdRequest({ id, config }) {
  return api.get(`/employee/get/${id}`, config);
}

export function getEmployeeListRequest(config) {
  return api.get(`/employee/list`, config);
}

export function getEmployeeTypeListRequest(config) {
  return api.get(`/dropdown/employee_type/list`, config);
}

export function addEmployeeTypeRequest({ data }) {
  return api.post(`dropdown/employee_type/add`, data);
}

// collection_user
export function getCollectionUserByIdRequest({ id, config }) {
  return api.get(`/users/collection_user/get/${id}`, config);
}

export function getCollectionUserListRequest(config) {
  return api.get(`/users/collection_user/list`, config);
}

// accountant_user
export function getAccountantUserByIdRequest({ id, config }) {
  return api.get(`/users/accountant/get/${id}`, config);
}

export function getAccountantUserListRequest(config) {
  return api.get(`/users/accountant/list`, config);
}

// vehicle-user
export function getVehicleUserByIdRequest({ id, config }) {
  return api.get(`/vehicle/get/${id}`, config);
}

export function getVehicleUserListRequest(config) {
  return api.get(`/vehicle/list`, config);
}
