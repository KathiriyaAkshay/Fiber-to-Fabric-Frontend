import { useContext, useState } from "react";
import { Button, Modal, Table, Typography } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { getYarnOrderAdvanceListRequest } from "../../../api/requests/orderMaster";
import { useQuery } from "@tanstack/react-query";
import { GlobalContext } from "../../../contexts/GlobalContext";
import YarnOrderAdvanceForm from "./YarnOrderAdvanceForm";
import dayjs from "dayjs";

const YarnOrderAdvanceModal = ({ yarnOrder = {} }) => {
  const { id: yarnOrderId } = yarnOrder;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { companyId } = useContext(GlobalContext);

  const { data: yarnOrderAdvanceListRes } = useQuery({
    queryKey: [
      "order-master",
      "yarn-order",
      "advances",
      "list",
      yarnOrderId,
      { company_id: companyId },
    ],
    queryFn: async () => {
      const res = await getYarnOrderAdvanceListRequest({
        id: yarnOrderId,
        params: { company_id: companyId },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    {
      title: "Date",
      render: ({ createdAt }) => {
        return dayjs(createdAt).format("DD-MM-YYYY");
      },
      key: "createdAt",
    },
    {
      title: "Company",
      dataIndex: "Company",
      key: "Company",
    },
    {
      title: "Supplier Company",
      dataIndex: "Supplier",
      key: "Supplier",
    },
    {
      title: "Amount",
      dataIndex: "advance_amount",
      key: "advance_amount",
    },
    {
      title: "Remaining Amount",
      dataIndex: "remaining_amount",
      key: "remaining_amount",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
  ];

  return (
    <>
      <Button onClick={showModal}>₹</Button>
      <Modal
        closeIcon={<CloseOutlined className="text-white" />}
        title={
          <Typography.Text className="text-xl font-medium text-white">
            Yarn Order Advance
          </Typography.Text>
        }
        width={"80vw"}
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
        centered={true}
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
      >
        <YarnOrderAdvanceForm yarnOrder={yarnOrder} />
        <Typography.Text className="text-xl font-medium text-primary">
          {`Advance List (Order: ${yarnOrder.order_no})`}
        </Typography.Text>
        <Table
          dataSource={yarnOrderAdvanceListRes?.yarnOrderAdvances?.rows || []}
          columns={columns}
          rowKey="id"
          style={{ overflow: "auto" }}
          pagination={false}
          summary={() => {
            if (!yarnOrderAdvanceListRes) return;
            const { total_amount, remaining_amount } = yarnOrderAdvanceListRes;
            return (
              <>
                <Table.Summary.Row className="font-semibold">
                  <Table.Summary.Cell>Total</Table.Summary.Cell>
                  <Table.Summary.Cell />
                  <Table.Summary.Cell />
                  <Table.Summary.Cell />
                  <Table.Summary.Cell>
                    <Typography.Text>{total_amount}</Typography.Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell>
                    <Typography.Text>{remaining_amount}</Typography.Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </>
            );
          }}
        />
      </Modal>
    </>
  );
};
export default YarnOrderAdvanceModal;
