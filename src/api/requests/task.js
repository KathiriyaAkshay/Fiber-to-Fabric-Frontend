import { api } from "..";

export function createTaskRequest({ data, params }) {
  return api.post(`/task-assignment/create`, data, { params });
}

export function getTaskByIdRequest({ id, params }) {
  return api.get(`/task-assignment/get/${id}`, { params });
}

export function getTaskListRequest({ companyId, params }) {
  return api.get(`/task-assignment/list/${companyId}`, { params });
}

export function updateTaskRequest({ id, data, params }) {
  return api.patch(`/task-assignment/update/${id}`, data, { params });
}

export function deleteTaskRequest({ id, params }) {
  return api.delete(`/task-assignment/delete/${id}`, { params });
}
