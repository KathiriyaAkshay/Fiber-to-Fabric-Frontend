import { Modal, Spin, Table, Typography } from "antd";
import { getCompanyPartnerRequest } from "../../api/requests/company";
import { useQuery } from "@tanstack/react-query";
import ErrorBoundary from "../common/ErrorBoundary";
import AddPartnerForm from "./AddPartnerForm";
const { Title } = Typography;

function AddPartnerModal({ open, onCancel, companyDetails }) {
  const {
    data: partnerListRes,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["company", "partner", "get", { type: "PARTNER" }],
    queryFn: async () => {
      const res = await getCompanyPartnerRequest({
        companyId: companyDetails.id,
        config: { params: { type: "PARTNER" } },
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
  ];

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
        />
        <AddPartnerForm companyDetails={companyDetails} />
      </Modal>
    </>
  );
}

export default AddPartnerModal;
