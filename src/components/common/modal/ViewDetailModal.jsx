import { useState } from "react";
import { Button, Col, Flex, Modal, Row, Typography } from "antd";
import { CloseOutlined, EyeOutlined } from "@ant-design/icons";

const ViewDetailModal = ({ title = "-", details = [] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

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
        <Flex className="flex-col gap-1">
          {details?.map(({ title = "", value }) => {
            return (
              <Row gutter={12} className="flex-grow" key={title}>
                <Col span={10} className="font-medium">
                  {title}
                </Col>
                <Col span={14}>{value ?? "-"}</Col>
              </Row>
            );
          })}
        </Flex>
      </Modal>
    </>
  );
};
export default ViewDetailModal;
