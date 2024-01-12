import { Button, Modal, Space, Table, Typography } from "antd";
import { getCompanyPartnerRequest } from "../../api/requests/company";
import { useQuery } from "@tanstack/react-query";
import AddPartnerForm from "./AddPartnerForm";
import DeleteCompanyPartner from "./partner/DeleteCompanyPartner";
import EditPartnerForm from "./partner/EditPartnerForm";
import { useState } from "react";
import { EditOutlined } from "@ant-design/icons";

const { Title } = Typography;

function AddPartnerModal({ open, onCancel, companyDetails }) {
  const [partnerTBE, setPartnerTBE] = useState();
  const { data: partnerListRes } = useQuery({
    queryKey: ["company", "partner", "get", { type: "PARTNER" }],
    queryFn: async () => {
      const res = await getCompanyPartnerRequest({
        companyId: companyDetails.id,
        config: { params: { type: "PARTNER" } },
      });
      return res.data?.data;
    },
  });

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
    return <AddPartnerForm companyDetails={companyDetails} />;
  }

  return (
    <>
      <Modal
        title={
          <Title level={4} style={{ margin: 0 }}>
            Add Parnter
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
          style={{ overflow: "auto" }}
        />
        {renderForm()}
      </Modal>
    </>
  );
}

export default AddPartnerModal;
