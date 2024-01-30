import { useState } from "react";
import { Button, Col, Modal, Row, Typography } from "antd";
import { EyeOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const ViewMachineDetailModal = ({ details }) => {
  const { machine_type, machine_name, no_of_machines, no_of_employees } =
    details;
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
        title={
          <Title level={4} style={{ margin: 0 }}>
            Machine Details
          </Title>
        }
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
      >
        <Row gutter={[12, 12]}>
          <Col span={12}>
            <Text>
              <Title level={5} style={{ margin: 0 }}>
                Machine Name :
              </Title>
              {machine_name}
            </Text>
          </Col>

          <Col span={12}>
            <Text>
              <Title level={5} style={{ margin: 0 }}>
                Machine No :
              </Title>
              {no_of_machines}
            </Text>
          </Col>

          <Col span={12}>
            <Text>
              <Title level={5} style={{ margin: 0 }}>
                No of Employee :
              </Title>
              {no_of_employees}
            </Text>
          </Col>

          <Col span={12}>
            <Text>
              <Title level={5} style={{ margin: 0 }}>
                Machine Type :
              </Title>
              {machine_type}
            </Text>
          </Col>
        </Row>
      </Modal>
    </>
  );
};
export default ViewMachineDetailModal;
