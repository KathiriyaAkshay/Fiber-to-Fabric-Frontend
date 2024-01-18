import { useState } from "react";
import { Button, Col, Modal, Row, Typography } from "antd";
import { EyeOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const ViewPartyDetailModal = ({ userDetails }) => {
  const {
    gst_no,
    pancard_no,
    adhar_no,
    address,
    first_name,
    last_name,
    mobile,
    email,
    username,
  } = userDetails;
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
            Party Details
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
                GST No :
              </Title>
              {gst_no}
            </Text>
          </Col>
          <Col span={12}>
            <Text>
              <Title level={5} style={{ margin: 0 }}>
                PAN No :
              </Title>
              {pancard_no}
            </Text>
          </Col>
          <Col span={12}>
            <Text>
              <Title level={5} style={{ margin: 0 }}>
                Adhaar No :
              </Title>
              {adhar_no}
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
        </Row>
      </Modal>
    </>
  );
};
export default ViewPartyDetailModal;
