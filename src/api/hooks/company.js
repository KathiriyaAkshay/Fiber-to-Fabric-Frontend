import { useQuery } from "@tanstack/react-query";
import { getCompanyListRequest } from "../requests/company";

export function useCompanyList({ params } = {}) {
  return useQuery({
    queryKey: ["company", "list"],
    queryFn: async () => {
      const res = await getCompanyListRequest({ params });
      return res.data?.data;
    },
  });
}

export function useCompanyId() {
  const { data: companyListRes } = useCompanyList();
  const companyId = companyListRes?.rows?.[0]?.id;
  return { companyId };
}
