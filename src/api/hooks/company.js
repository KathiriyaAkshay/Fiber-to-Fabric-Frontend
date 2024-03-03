import { useQueries, useQuery } from "@tanstack/react-query";
import {
  getCompanyBankListRequest,
  getCompanyListRequest,
} from "../requests/company";

export function useCompanyList({ params } = {}) {
  return useQuery({
    queryKey: ["company", "list"],
    queryFn: async () => {
      const res = await getCompanyListRequest({ params });
      return res.data?.data;
    },
  });
}

export function useCompanyBankList() {
  const { data: companyListRes } = useCompanyList();
  return useQueries({
    queries: companyListRes?.rows?.map(({ id }) => {
      return {
        queryKey: ["company", "bank-detail", "list", { company_id: id }],
        queryFn: async () => {
          const res = await getCompanyBankListRequest({
            params: { company_id: id },
          });
          return res.data?.data;
        },
      };
    }),
    combine: (results) => {
      const formatedResult = {};
      results.forEach((result, index) => {
        const companyId = companyListRes?.rows?.[index]?.id;
        formatedResult[companyId] = result;
      });
      return formatedResult;
    },
  });
}
