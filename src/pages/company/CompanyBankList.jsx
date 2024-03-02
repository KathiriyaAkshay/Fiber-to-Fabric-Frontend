import { Button, Space, Switch, Table, message } from "antd";
import { EditOutlined } from "@ant-design/icons";
import ViewDetailModal from "../../components/common/modal/ViewDetailModal";
import DeleteCompanyBank from "../../components/company/DeleteCompanyBank";
import { updateCompanyBankRequest } from "../../api/requests/company";
import { useMutation } from "@tanstack/react-query";

function CompanyBankList({ company, query }) {
  const { id: companyId } = company;
  const { data: bankList } = query;

  const {
    mutateAsync: updateCompanyBank,
    isPending: updatingCompanyBank,
    variables,
  } = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await updateCompanyBankRequest({
        id,
        data,
        params: { company_id: companyId },
      });
      return res.data;
    },
    mutationKey: ["company", "bank-detail", "update"],
    onSuccess: (res) => {
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message;
      if (errorMessage && typeof errorMessage === "string") {
        message.error(errorMessage);
      }
    },
  });

  const columns = [
    {
      title: "Bank Name",
      dataIndex: "bank_name",
      key: "bank_name",
    },
    {
      title: "Action",
      render: (companyBankDetails) => {
        const {
          bank_name,
          account_number,
          ifsc_code,
          account_type,
          id,
          is_active,
        } = companyBankDetails;

        return (
          <Space>
            <ViewDetailModal
              title="Bank Details"
              details={[
                { title: "Bank Name", value: bank_name },
                { title: "Account Number", value: account_number },
                { title: "IFSC Code", value: ifsc_code },
                { title: "Account Type", value: account_type },
              ]}
            />
            <Button
            // onClick={() => {
            //   navigateToUpdateCompany(companyDetails.id);
            // }}
            >
              <EditOutlined />
            </Button>
            <DeleteCompanyBank
              companyBankDetails={companyBankDetails}
              company={company}
            />
            <Switch
              loading={updatingCompanyBank && variables?.id === id}
              defaultChecked={is_active}
              onChange={(is_active) => {
                updateCompanyBank({
                  id: id,
                  data: { is_active: is_active },
                });
              }}
            />
          </Space>
        );
      },
      key: "action",
    },
  ];

  return (
    <Table dataSource={bankList?.rows || []} columns={columns} rowKey={"id"} />
  );
}

export default CompanyBankList;
