import { useState } from "react";
import { Button, Col, Modal, Row, Typography } from "antd";
import { EyeOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const ViewSupplierDetailModal = ({ userDetails }) => {
  const { gst_no, address, mobile, supplier, supplier_types } = userDetails;
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
            Supplier Details
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
                Broker Name :
              </Title>
              {supplier?.broker?.first_name} {supplier?.broker?.last_name}
            </Text>
          </Col>

          <Col span={12}>
            <Text>
              <Title level={5} style={{ margin: 0 }}>
                Supplier Name :
              </Title>
              {supplier?.supplier_name}
            </Text>
          </Col>

          <Col span={12}>
            <Text>
              <Title level={5} style={{ margin: 0 }}>
                Supplier Address :
              </Title>
              {address}
            </Text>
          </Col>

          <Col span={12}>
            <Text>
              <Title level={5} style={{ margin: 0 }}>
                Supplier GST No :
              </Title>
              {gst_no}
            </Text>
          </Col>

          <Col span={12}>
            <Text>
              <Title level={5} style={{ margin: 0 }}>
                Supplier Company Name :
              </Title>
              {supplier?.supplier_company}
            </Text>
          </Col>

          <Col span={12}>
            <Text>
              <Title level={5} style={{ margin: 0 }}>
                Supplier Mobile No :
              </Title>
              {mobile}
            </Text>
          </Col>

          <Col span={12}>
            <Text>
              <Title level={5} style={{ margin: 0 }}>
                Supplier HSN Code :
              </Title>
              {supplier?.hsn_code}
            </Text>
          </Col>

          <Col span={12}>
            <Text
              style={{
                textTransform: "capitalize",
              }}
            >
              <Title level={5} style={{ margin: 0 }}>
                Supplier Type :
              </Title>
              {supplier_types?.map((s) => s?.type)?.join(", ")}
            </Text>
          </Col>
        </Row>
      </Modal>
    </>
  );
};
export default ViewSupplierDetailModal;
