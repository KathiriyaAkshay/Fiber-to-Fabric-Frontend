import { useState } from "react";
import { Button, Col, Modal, Row, Typography } from "antd";
import { EyeOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const ViewVehicleUserDetailModal = ({ userDetails }) => {
  const { address, first_name, last_name, mobile, email, username, vehicle } =
    userDetails;
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
            Vehicle User Details
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
                Name :
              </Title>
              {first_name} {last_name}
            </Text>
          </Col>

          <Col span={12}>
            <Text>
              <Title level={5} style={{ margin: 0 }}>
                Contact Number :
              </Title>
              {mobile}
            </Text>
          </Col>

          <Col span={12}>
            <Text>
              <Title level={5} style={{ margin: 0 }}>
                Email :
              </Title>
              {email}
            </Text>
          </Col>

          <Col span={12}>
            <Text>
              <Title level={5} style={{ margin: 0 }}>
                Username :
              </Title>
              {username}
            </Text>
          </Col>

          <Col span={12}>
            <Text>
              <Title level={5} style={{ margin: 0 }}>
                Address :
              </Title>
              {address}
            </Text>
          </Col>

          <Col span={12}>
            <Text>
              <Title level={5} style={{ margin: 0 }}>
                Vehicle Name :
              </Title>
              {vehicle?.vehicleName}
            </Text>
          </Col>

          <Col span={12}>
            <Text>
              <Title level={5} style={{ margin: 0 }}>
                Vehicle No :
              </Title>
              {vehicle?.vehicleNo}
            </Text>
          </Col>
        </Row>
      </Modal>
    </>
  );
};
export default ViewVehicleUserDetailModal;
