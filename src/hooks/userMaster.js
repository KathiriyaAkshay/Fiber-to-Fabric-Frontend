import { useQuery } from "@tanstack/react-query";
import { getBrokerListRequest } from "../api/requests/users";

export async function useBrokerList(company_id) {
  return useQuery({
    queryKey: ["broker", "list", { company_id }],
    queryFn: async () => {
      const res = await getBrokerListRequest({
        params: { company_id },
      });
      return res.data?.data;
    },
    enabled: Boolean(company_id),
  });
}
