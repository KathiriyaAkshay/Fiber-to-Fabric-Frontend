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
