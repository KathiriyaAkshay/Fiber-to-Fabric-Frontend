import { Button, Space, Spin, Table } from "antd";
import {
  BankOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import DeleteCompany from "../../components/company/DeleteCompany";
import AddPartner from "../../components/company/AddPartner";
import { useCompanyBankList, useCompanyList } from "../../api/hooks/company";
import ViewDetailModal from "../../components/common/modal/ViewDetailModal";
import { usePagination } from "../../hooks/usePagination";
import CompanyBankList from "./CompanyBankList";
import BankDetailModal from "./BankDetailModal";
import { useState } from "react";

const initialBankDetailModal = {
  open: false,
  company: undefined,
  companyBank: undefined,
  edit: false,
};
function CompanyList() {
  const navigate = useNavigate();
  const [bankDetailModal, setBankDetailModal] = useState(
    initialBankDetailModal
  );
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const { data: companyListRes, isLoading } = useCompanyList({
    params: { page, pageSize },
  });

  const companyBankDetails = useCompanyBankList();

  function navigateToAddCompany() {
    navigate("/company/add");
  }

  function navigateToUpdateCompany(companyId) {
    navigate(`/company/update/${companyId}`);
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Company Name",
      dataIndex: "company_name",
      key: "company_name",
    },
    {
      title: "Address",
      dataIndex: "address_line_1",
      key: "address_line_1",
    },
    {
      title: "Owner Mobile",
      dataIndex: "owner_mobile",
      key: "owner_mobile",
    },
    {
      title: "GST No",
      dataIndex: "gst_no",
      key: "gst_no",
    },
    {
      title: "Company Type",
      dataIndex: "company_type",
      key: "company_type",
    },
    {
      title: "Action",
      render: (companyDetails) => {
        const {
          gst_no = "-",
          owner_name = "-",
          company_name = "-",
          owner_mobile = "-",
          pancard_no = "-",
          adhar_no = "-",
          company_email = "-",
          company_contact = "-",
          address_line_1 = "-",
          address_line_2 = "-",
          city = "-",
          pincode = "-",
          bill_title = "-",
          bank_name = "-",
          account_number = "-",
          ifsc_code = "-",
          company_type = "-",
        } = companyDetails;

        return (
          <Space>
            <ViewDetailModal
              title="Company Details"
              details={[
                { title: "Company Name", value: company_name },
                { title: "GST No", value: gst_no },
                { title: "Owner Name", value: owner_name },
                { title: "Owner Mobile", value: owner_mobile },
                { title: "PAN No", value: pancard_no },
                { title: "Adhaar No", value: adhar_no },
                { title: "Address Line 1", value: address_line_1 },
                { title: "Address Line 2", value: address_line_2 },
                { title: "City", value: city },
                { title: "Pincode", value: pincode },
                { title: "Bill Title", value: bill_title },
                { title: "Bank Name", value: bank_name },
                { title: "Account Number", value: account_number },
                { title: "IFSC Code", value: ifsc_code },
                { title: "Company Email", value: company_email },
                { title: "Company Contact", value: company_contact },
                { title: "Company Type", value: company_type },
              ]}
            />
            <Button
              onClick={() => {
                navigateToUpdateCompany(companyDetails.id);
              }}
            >
              <EditOutlined />
            </Button>
            <DeleteCompany companyDetails={companyDetails} />
            <Button
              onClick={() => {
                setBankDetailModal({
                  open: true,
                  company: companyDetails,
                  companyBank: undefined,
                  edit: false,
                });
              }}
            >
              <BankOutlined />
            </Button>
            <AddPartner companyDetails={companyDetails} />
          </Space>
        );
      },
      key: "action",
    },
  ];

  if (isLoading) {
    return (
      <Spin tip="Loading" size="large">
        <div className="p-14" />
      </Spin>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center gap-5">
        <h3 className="m-0 text-primary">Company List</h3>
        <Button onClick={navigateToAddCompany} icon={<PlusCircleOutlined />} />
      </div>
      <Table
        dataSource={companyListRes?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          total: companyListRes?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
        expandable={{
          expandedRowRender: (companyDetails) => {
            const { id: companyId } = companyDetails;
            return (
              <CompanyBankList
                company={companyDetails}
                query={companyBankDetails[companyId]}
                setBankDetailModal={setBankDetailModal}
              />
            );
          },
          rowExpandable: () => true,
        }}
        style={{
          overflow: "auto",
        }}
      />
      <BankDetailModal
        onCancel={() => setBankDetailModal(initialBankDetailModal)}
        bankDetailModal={bankDetailModal}
      />
    </div>
  );
}

export default CompanyList;
