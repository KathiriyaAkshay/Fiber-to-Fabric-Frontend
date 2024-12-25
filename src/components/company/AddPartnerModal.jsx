import { Button, Modal, Space, Table, Typography } from "antd";
import { getCompanyPartnerRequest } from "../../api/requests/company";
import { useQuery } from "@tanstack/react-query";
import AddPartnerForm from "./AddPartnerForm";
import DeleteCompanyPartner from "./partner/DeleteCompanyPartner";
import EditPartnerForm from "./partner/EditPartnerForm";
import { useState } from "react";
import { CloseOutlined, EditOutlined } from "@ant-design/icons";
import { usePagination } from "../../hooks/usePagination";

function AddPartnerModal({ open, onCancel, companyDetails }) {
  const [partnerTBE, setPartnerTBE] = useState();
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const { data: partnerListRes } = useQuery({
    queryKey: ["company", "partner", "get", { type: "PARTNER" }],
    queryFn: async () => {
      const { id } = companyDetails;
      const res = await getCompanyPartnerRequest({
        companyId: id,
        params: { type: "PARTNER", page, pageSize, company_id: id },
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
          <Typography.Text className="text-xl font-medium text-white">
            Add Parnter
          </Typography.Text>
        }
        open={open}
        footer={null}
        onCancel={onCancel}
        centered={true}
        closeIcon={<CloseOutlined className="text-white" />}
        classNames={{
          header: "text-center",
        }}
        styles={{
          content: {
            padding: 0,
          },
          header: {
            padding: "16px",
            margin: 0,
          },
          body: {
            padding: "10px 16px",
          },
        }}
        width={"80vw"}
      >
        <Table
          dataSource={partnerListRes?.rows || []}
          columns={columns}
          rowKey="id"
          style={{ overflow: "auto" }}
          pagination={{
            current: page + 1,
            pageSize: pageSize,
            total: partnerListRes?.count || 0,
            showSizeChanger: true,
            onShowSizeChange: onShowSizeChange,
            onChange: onPageChange,
          }}
        />
        {renderForm()}
      </Modal>
    </>
  );
}

export default AddPartnerModal;
