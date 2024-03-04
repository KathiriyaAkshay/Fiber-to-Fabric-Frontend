import { api } from "..";

export function addUserRequest({ roleId, data, params }) {
  return api.post(`/users/add/${roleId}`, data, { params });
}

export function updateUserRequest({ roleId, userId, data, params }) {
  return api.post(`/users/update/${roleId}/${userId}`, data, { params });
}

// supervisor
export function getSupervisorByIdRequest({ id, params }) {
  return api.get(`/supervisor/get/${id}`, { params });
}

export function getSupervisorListRequest({ params }) {
  return api.get(`/supervisor/list`, { params });
}

// Broker
export function getBrokerByIdRequest({ id, params }) {
  return api.get(`/broker/get/${id}`, { params });
}

export function getBrokerListRequest({ params }) {
  return api.get(`/broker/list`, { params });
}

// Party
export function getPartyByIdRequest({ id, params }) {
  return api.get(`/party/get/${id}`, { params });
}

export function getPartyListRequest({ params }) {
  return api.get(`/party/list`, { params });
}

// supplier
export function getSupplierByIdRequest({ id, params }) {
  return api.get(`/supplier/get/${id}`, { params });
}

export function getSupplierListRequest({ params }) {
  return api.get(`/supplier/list`, { params });
}

// employee
export function getEmployeeByIdRequest({ id, params }) {
  return api.get(`/employee/get/${id}`, { params });
}

export function getEmployeeListRequest({ params }) {
  return api.get(`/employee/list`, { params });
}

export function getEmployeeTypeListRequest({ params }) {
  return api.get(`/dropdown/employee_type/list`, { params });
}

export function addEmployeeTypeRequest({ data }) {
  return api.post(`dropdown/employee_type/add`, data);
}

// collection_user
export function getCollectionUserByIdRequest({ id, params }) {
  return api.get(`/users/collection_user/get/${id}`, { params });
}

export function getCollectionUserListRequest({ params }) {
  return api.get(`/users/collection_user/list`, { params });
}

// accountant_user
export function getAccountantUserByIdRequest({ id, params }) {
  return api.get(`/users/accountant/get/${id}`, { params });
}

export function getAccountantUserListRequest({ params }) {
  return api.get(`/users/accountant/list`, { params });
}

// vehicle-user
export function getVehicleUserByIdRequest({ id, params }) {
  return api.get(`/vehicle/get/${id}`, { params });
}

export function getVehicleUserListRequest({ params }) {
  return api.get(`/vehicle/list`, { params });
}
