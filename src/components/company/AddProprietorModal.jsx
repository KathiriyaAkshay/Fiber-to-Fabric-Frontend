import { Button, Modal, Space, Spin, Table, Typography } from "antd";
import { getCompanyPartnerRequest } from "../../api/requests/company";
import { useQuery } from "@tanstack/react-query";
import ErrorBoundary from "../common/ErrorBoundary";
import AddProprietorForm from "./AddProprietorForm";
import { useState } from "react";
import EditPartnerForm from "./partner/EditPartnerForm";
import { EditOutlined } from "@ant-design/icons";
import DeleteCompanyPartner from "./partner/DeleteCompanyPartner";
const { Title } = Typography;

function AddProprietorModal({ open, onCancel, companyDetails }) {
  const [partnerTBE, setPartnerTBE] = useState();
  const {
    data: partnerListRes,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["company", "partner", "get", { type: "PROPRIETOR" }],
    queryFn: async () => {
      const res = await getCompanyPartnerRequest({
        companyId: companyDetails.id,
        config: { params: { type: "PROPRIETOR" } },
      });
      return res.data?.data;
    },
  });

  if (isLoading) {
    return (
      <Spin tip="Loading" size="large">
        <div className="p-14" />
      </Spin>
    );
  }

  if (isError) {
    console.error("----->", error);
    return <ErrorBoundary />;
  }

  const columns = [
    {
      title: "First Name",
      dataIndex: "first_name",
      key: "first_name",
    },
    {
      title: "Last Name",
      dataIndex: "last_name",
      key: "last_name",
    },
    {
      title: "Ratio",
      dataIndex: "ratio",
      key: "ratio",
    },
    {
      title: "Capital",
      dataIndex: "capital",
      key: "capital",
    },
    {
      title: "Action",
      render: (partnerDetails) => {
        return (
          <Space>
            <Button onClick={() => setPartnerTBE(partnerDetails)}>
              <EditOutlined />
            </Button>
            <DeleteCompanyPartner partnerDetails={partnerDetails} />
          </Space>
        );
      },
      key: "action",
    },
  ];

  function renderForm() {
    if (partnerTBE) {
      return (
        <EditPartnerForm
          partnerDetails={partnerTBE}
          setPartnerTBE={setPartnerTBE}
        />
      );
    }
    return <AddProprietorForm companyDetails={companyDetails} />;
  }

  return (
    <>
      <Modal
        title={
          <Title level={4} style={{ margin: 0 }}>
            Add Proprietor
          </Title>
        }
        open={open}
        footer={null}
        onCancel={onCancel}
        width={"50%"}
      >
        <Table
          dataSource={partnerListRes?.rows || []}
          columns={columns}
          rowKey="id"
        />
        {renderForm()}
      </Modal>
    </>
  );
}

export default AddProprietorModal;
