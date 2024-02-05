import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../requests/auth";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "current-user"],
    queryFn: async () => {
      const res = await getCurrentUser();
      return res.data?.data?.user;
    },
  });
}
