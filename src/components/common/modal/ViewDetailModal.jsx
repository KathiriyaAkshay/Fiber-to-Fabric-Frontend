import { useState } from "react";
import { Button, Flex, Modal, Table, Typography } from "antd";
import { CloseOutlined, EyeOutlined } from "@ant-design/icons";

const ViewDetailModal = ({ title = "-", isScroll = false, details = [] }) => {
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
        width={"50%"}
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
            dataSource={details}
            pagination={false}
          />
          {/* {details?.map(({ title = "", value }, index) => {
            return (
              <Row
                gutter={12}
                className="flex-grow"
                style={{ marginTop: "0.40rem" }}
                key={title}
              >
                <Col span={10} className="font-medium">
                  {title}
                </Col>
                <Col span={14}>{value ?? "-"}</Col>
              </Row>
            );
          })} */}
        </Flex>
      </Modal>
    </>
  );
};
export default ViewDetailModal;
