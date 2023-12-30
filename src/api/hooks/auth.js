import { useQuery } from "react-query";
import { getCurrentUser } from "../requests/auth";

export function useCurrentUser() {
  return useQuery(["auth", "current-user"], getCurrentUser);
}
