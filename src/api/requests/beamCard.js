import { api } from "..";

export function getLoadedMachineListRequest({ params }) {
  return api.get(`beam/loaded-machine/list`, {
    params: params,
  });
}

export function getPasarelaBeamListRequest({ params }) {
  return api.get(`/beam/stock/pasarela/list`, {
    params: params,
  });
}

export function getNonPasarelaBeamListRequest({ params }) {
  return api.get(`/beam/stock/non-pasarela/list`, {
    params: params,
  });
}

export function getNonPasarelaSecondaryBeamListRequest({ params }) {
  return api.get(`/beam//stock/non-pasarela/secondary-beam/list`, {
    params: params,
  });
}

export function createLoadNewBeamRequest({ data, params }) {
  return api.post("/beam/load/create", data, { params });
}

export function updateLoadNewBeamRequest({ id, data, params }) {
  return api.post(`/beam/load/update/${id}`, data, { params });
}

export function finishRunningBeamRequest({ data, params }) {
  return api.post(`/beam/finish-loaded-beam`, data, { params });
}

export function moveCutToNonPasarelaRequest({ data, params }) {
  return api.post(`/beam/cut-to-non-pasarela-beam`, data, { params });
}

export function reloadBeamRequest({ data, params }) {
  return api.post(`/beam/reload-beam`, data, { params });
}

export function getBeamCardByIdRequest({ id, params }) {
  return api.get(`/beam/load/get/${id}`, { params });
}

export function getBeamCardListRequest({ params }) {
  return api.get(`/beam/card/list`, {
    params: params,
  });
}

export const getLoadedBeamFromMachineRequest = ({ id, params }) => {
  return api.get(`/beam/running/${id}`, { params });
};

export function createNBNBeamRequest({ data, params }) {
  return api.post("/beam/nbn/load/create", data, { params });
}

export function deleteBeamCardRequest({ id, params }) {
  return api.delete(`/beam/delete/${id}`, { params });
}
