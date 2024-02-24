import { Select } from "antd";
import { useCompanyList } from "../../../api/hooks/company";

function CompanySelection() {
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
    />
  );
}

export default CompanySelection;
