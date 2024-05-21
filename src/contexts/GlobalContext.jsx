import { createContext, useEffect, useMemo, useState } from "react";
import { useCompanyList } from "../api/hooks/company";
import dayjs from "dayjs";
import { getFinancialYearEnd } from "../utils/dayjs";
export const GlobalContext = createContext();

const currentDate = dayjs();
const currentYearEnd = getFinancialYearEnd(currentDate);

const GlobalContextProvider = (props) => {
  const [companyId, setCompanyId] = useState();
  const [financialYearEnd, setFinancialYearEnd] = useState(currentYearEnd);

  const { data: companyListRes, isLoading: isLoadingCompanyList } =
    useCompanyList();

  const company = useMemo(() => {
    return companyListRes?.rows?.find((c) => c.id === companyId);
  }, [companyId, companyListRes?.rows]);

  useEffect(() => {
    const company_id = companyListRes?.rows?.[0]?.id;
    if (company_id) {
      setCompanyId(company_id);
    }
  }, [companyListRes]);

  return (
    <GlobalContext.Provider
      value={{
        company,
        companyId,
        setCompanyId,
        isLoadingCompanyList,
        companyListRes,
        financialYearEnd,
        setFinancialYearEnd,
      }}
    >
      {props.children}
    </GlobalContext.Provider>
  );
};
export default GlobalContextProvider;
