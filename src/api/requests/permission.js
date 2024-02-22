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

export function updateUserPermissionRequest({
  companyId,
  UserId,
  data,
  params,
}) {
  return api.patch(`permission/update/${companyId}/${UserId}`, data, {
    params: params,
  });
}

export function getPermissionUsersRequest({ params }) {
  return api.get(`dropdown/permission-user`, {
    params: params,
  });
}
