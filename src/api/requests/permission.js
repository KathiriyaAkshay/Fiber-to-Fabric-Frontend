import { api } from "..";

export function getPermissionModulesRequest({ params }) {
  return api.get(`permission/modules/get`, {
    params: params,
  });
}

export function getModulePermissionsRequest({ companyId, userId, params }) {
  return api.get(`permission/get/${companyId}/${userId}`, {
    params: params,
  });
}

export function updateUserPermissionRequest({ companyId, userId, data, params }) {
  return api.patch(`permission/update/${companyId}/${userId}`, data, {
    params: params,
  });
}

export function getPermissionUsersRequest({ params }) {
  return api.get(`dropdown/permission-user`, {
    params: params,
  });
}
