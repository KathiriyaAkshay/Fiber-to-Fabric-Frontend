import { useState } from "react";
import { Button, Flex, Modal, Table, Typography } from "antd";
import { CloseOutlined, EyeOutlined } from "@ant-design/icons";

const ViewPartyDetailsModel = ({
  title = "-",
  isScroll = false,
  details = [],
  companyListRes,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const adjustHeight = {};
  if (isScroll) {
    adjustHeight.height = "calc(100vh - 150px)";
    adjustHeight.overflowY = "scroll";
  }

  return (
    <>
      <Button type="primary" onClick={showModal}>
        <EyeOutlined />
      </Button>
      <Modal
        closeIcon={<CloseOutlined className="text-white" />}
        title={
          <Typography.Text className="text-xl font-medium text-white">
            {title}
          </Typography.Text>
        }
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
        centered={true}
        classNames={{
          header: "text-center",
        }}
        width={"70%"}
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
            ...adjustHeight,
          },
        }}
      >
        <Flex className="flex-col gap-1">
          <Table
            className="view-information-table"
            columns={[
              {
                title: "Title",
                dataIndex: "title",
              },
              {
                title: "Value",
                dataIndex: "value",
              },
            ]}
            dataSource={details?.data || []}
            pagination={false}
          />

          <br />
          <Table
            className="view-information-table"
            columns={[
              {
                title: "Party Company",
                dataIndex: ["party", "company_name"],
              },
              {
                title: "Company Name",
                dataIndex: "company_id",
                key: "company_id",
                render: (text) => {
                  const data = companyListRes?.rows?.find(
                    (item) => item.id === text
                  );
                  return data?.company_name;
                },
              },
              {
                title: "Meter",
                dataIndex: "meter",
                key: "meter",
              },
              {
                title: "Amount (Excl. Gst)",
                dataIndex: "amount",
                key: "amount",
              },
              {
                title: "Avg Rate (Excl. Gst)",
                dataIndex: "avg_rate",
                key: "avg_rate",
              },
              {
                title: "Auto TCS ",
                dataIndex: "auto_tcs",
                key: "auto_tcs",
              },
            ]}
            dataSource={details?.subParties || []}
            pagination={false}
          />
        </Flex>
      </Modal>
    </>
  );
};
export default ViewPartyDetailsModel;
