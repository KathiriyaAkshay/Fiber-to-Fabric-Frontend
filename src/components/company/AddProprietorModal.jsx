import { Button, Modal, Space, Spin, Table, Typography } from "antd";
import { getCompanyPartnerRequest } from "../../api/requests/company";
import { useQuery } from "@tanstack/react-query";
import ErrorBoundary from "../common/ErrorBoundary";
import AddProprietorForm from "./AddProprietorForm";
import { useState } from "react";
import EditPartnerForm from "./partner/EditPartnerForm";
import { CloseOutlined, EditOutlined } from "@ant-design/icons";
import DeleteCompanyPartner from "./partner/DeleteCompanyPartner";
import { usePagination } from "../../hooks/usePagination";

function AddProprietorModal({ open, onCancel, companyDetails }) {
  const [partnerTBE, setPartnerTBE] = useState();
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const {
    data: partnerListRes,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "company",
      "partner",
      "get",
      { type: "PROPRIETOR", page, pageSize },
    ],
    queryFn: async () => {
      const { id } = companyDetails;
      const res = await getCompanyPartnerRequest({
        companyId: id,
        params: { type: "PROPRIETOR", company_id: id, page, pageSize },
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
          <Typography.Text className="text-xl font-medium text-white">
            Add Proprietor
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

export default AddProprietorModal;
