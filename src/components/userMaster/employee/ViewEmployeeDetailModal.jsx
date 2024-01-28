import { useState } from "react";
import { Button, Col, Modal, Row, Typography } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const ViewEmployeeDetailModal = ({ userDetails }) => {
  const { first_name, last_name, mobile, username, employer } = userDetails;
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
            Employee Details
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
                Username :
              </Title>
              {username}
            </Text>
          </Col>

          <Col span={12}>
            <Text>
              <Title level={5} style={{ margin: 0 }}>
                TDS :
              </Title>
              {employer?.tds}
            </Text>
          </Col>

          <Col span={12}>
            <Text>
              <Title level={5} style={{ margin: 0 }}>
                Employee Type :
              </Title>
              {employer?.employee_type?.employee_type}
            </Text>
          </Col>

          <Col span={12}>
            <Text>
              <Title level={5} style={{ margin: 0 }}>
                Salary Type :
              </Title>
              {employer?.salary_type}
            </Text>
          </Col>

          <Col span={12}>
            <Text>
              <Title level={5} style={{ margin: 0 }}>
                Joining Date :
              </Title>
              {dayjs(employer?.joining_date).format("DD/MM/YYYY")}
            </Text>
          </Col>

          <Col span={12}>
            <Text>
              <Title level={5} style={{ margin: 0 }}>
                Company :
              </Title>
              {employer?.company?.company_name}
            </Text>
          </Col>
        </Row>
      </Modal>
    </>
  );
};
export default ViewEmployeeDetailModal;
