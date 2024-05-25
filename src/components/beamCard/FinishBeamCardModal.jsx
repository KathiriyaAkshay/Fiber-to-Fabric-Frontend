import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Divider,
  Flex,
  Modal,
  Radio,
  Row,
  Typography,
} from "antd";
import { useState } from "react";

const FinishBeamCardModal = ({ details = [] }) => {
  console.log({ details });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [finishValue, setFinishValue] = useState("bhidan(finish)");

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button onClick={showModal}>
        <PlusOutlined />
      </Button>
      <Modal
        closeIcon={<CloseOutlined className="text-white" />}
        title={
          <Typography.Text className="text-xl font-medium text-white">
            Are you sure you want to Finish this beam?
          </Typography.Text>
        }
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
        centered={true}
        className="view-in-house-quality-model"
        classNames={{
          header: "text-center",
        }}
        styles={{
          content: {
            padding: 0,
            width: "600px",
            margin: "auto",
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
        <Row>
          <Col span={6}> Beam No </Col>
          <Col span={6}>BN 347</Col>
        </Row>

        <Row>
          <Col span={6}> Machine No </Col>
          <Col span={6}>1</Col>
        </Row>

        <Divider />
        <Radio.Group
          name="finish"
          value={finishValue}
          onChange={(e) => setFinishValue(e.target.value)}
        >
          <Radio value={"bhidan(finish)"}>Bhidan (Finish)</Radio>
          <Radio value={"cut"}>Cut</Radio>
        </Radio.Group>

        <Flex gap={10} justify="flex-end">
          <Button htmlType="button" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit">
            Confirm
          </Button>
        </Flex>
      </Modal>
    </>
  );
};

export default FinishBeamCardModal;
