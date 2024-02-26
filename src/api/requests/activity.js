import { api } from "..";

export function getUserActivityRequest({ params }) {
  return api.get(`/user_activity/list`, { params });
}
