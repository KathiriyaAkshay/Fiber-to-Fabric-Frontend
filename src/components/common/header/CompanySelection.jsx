import { useContext } from "react";
import { Select } from "antd";
import { useCompanyList } from "../../../api/hooks/company";
import { GlobalContext } from "../../../contexts/GlobalContext";

function CompanySelection() {
  const { companyId, setCompanyId } = useContext(GlobalContext);

  const { data: companyListRes, isLoading: isLoadingCompanyList } =
    useCompanyList();

  return (
    <Select
      placeholder="Company"
      loading={isLoadingCompanyList}
      options={companyListRes?.rows?.map(({ company_name = "", id = "" }) => ({
        label: company_name,
        value: id,
      }))}
      className="w-40 text-primary"
      value={companyId}
      onChange={setCompanyId}
    />
  );
}

export default CompanySelection;
