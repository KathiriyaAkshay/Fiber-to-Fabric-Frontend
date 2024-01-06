import { useState } from "react";
import { Button, Col, Modal, Row, Typography } from "antd";
import { EyeOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const ViewCompanyDetailModal = ({ companyDetails }) => {
  const {
    gst_no = null,
    owner_name = null,
    company_name = null,
    owner_mobile = "",
    pancard_no = null,
    adhar_no = null,
    company_email = null,
    company_contact = null,
    address_line_1 = null,
    address_line_2 = null,
    city = null,
    pincode = null,
    bill_title = null,
    bank_name = null,
    account_number = null,
    ifsc_code = null,
    company_type = null,
  } = companyDetails;
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
            Company Details
          </Title>
        }
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
      >
        <Row gutter={12}>
          <Col
            span={12}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <Text>
              <Title level={5} style={{ margin: 0 }}>
                Company Name :
              </Title>
              {company_name}
            </Text>

            <Text>
              <Title level={5} style={{ margin: 0 }}>
                GST No :
              </Title>
              {gst_no}
            </Text>

            <Text>
              <Title level={5} style={{ margin: 0 }}>
                Owner Name :
              </Title>
              {owner_name}
            </Text>

            <Text>
              <Title level={5} style={{ margin: 0 }}>
                Owner Mobile :
              </Title>
              {owner_mobile}
            </Text>

            <Text>
              <Title level={5} style={{ margin: 0 }}>
                PAN No :
              </Title>
              {pancard_no}
            </Text>

            <Text>
              <Title level={5} style={{ margin: 0 }}>
                Adhaar No :
              </Title>
              {adhar_no}
            </Text>

            <Text>
              <Title level={5} style={{ margin: 0 }}>
                Address Line 1 :
              </Title>
              {address_line_1}
            </Text>

            <Text>
              <Title level={5} style={{ margin: 0 }}>
                Address Line 2 :
              </Title>
              {address_line_2}
            </Text>

            <Text>
              <Title level={5} style={{ margin: 0 }}>
                City :
              </Title>
              {city}
            </Text>
          </Col>
          <Col
            span={12}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <Text>
              <Title level={5} style={{ margin: 0 }}>
                Pincode :
              </Title>
              {pincode}
            </Text>

            <Text>
              <Title level={5} style={{ margin: 0 }}>
                Bill Title :
              </Title>
              {bill_title}
            </Text>

            <Text>
              <Title level={5} style={{ margin: 0 }}>
                Bank Name :
              </Title>
              {bank_name}
            </Text>

            <Text>
              <Title level={5} style={{ margin: 0 }}>
                Account Number :
              </Title>
              {account_number}
            </Text>

            <Text>
              <Title level={5} style={{ margin: 0 }}>
                IFSC Code :
              </Title>
              {ifsc_code}
            </Text>

            <Text>
              <Title level={5} style={{ margin: 0 }}>
                Company Email :
              </Title>
              {company_email}
            </Text>

            <Text>
              <Title level={5} style={{ margin: 0 }}>
                Company Contact :
              </Title>
              {company_contact}
            </Text>

            <Text>
              <Title level={5} style={{ margin: 0 }}>
                Company Type :
              </Title>
              {company_type}
            </Text>
          </Col>
        </Row>
      </Modal>
    </>
  );
};
export default ViewCompanyDetailModal;
