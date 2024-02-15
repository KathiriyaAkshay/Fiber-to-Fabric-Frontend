import { useState } from "react";
import { Button, Col, Modal, Row, Typography } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const ViewTaskDetailModal = ({ details }) => {
  const { task_detail, assign_time, achievement, reason, status, createdAt } =
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
            Task Report
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
                Date :
              </Title>
              {dayjs(createdAt).format("DD/MM/YYYY")}
            </Text>
          </Col>

          <Col span={12}>
            <Text>
              <Title level={5} style={{ margin: 0 }}>
                Assigned Time :
              </Title>
              {assign_time}
            </Text>
          </Col>

          <Col span={12}>
            <Text>
              <Title level={5} style={{ margin: 0 }}>
                Task :
              </Title>
              {task_detail}
            </Text>
          </Col>

          <Col span={12}>
            <Text>
              <Title level={5} style={{ margin: 0 }}>
                Achievement :
              </Title>
              {achievement || "-"}
            </Text>
          </Col>

          <Col span={12}>
            <Text>
              <Title level={5} style={{ margin: 0 }}>
                Reason :
              </Title>
              {reason || "-"}
            </Text>
          </Col>

          <Col span={12}>
            <Text>
              <Title level={5} style={{ margin: 0 }}>
                Status :
              </Title>
              {status}
            </Text>
          </Col>
        </Row>
      </Modal>
    </>
  );
};
export default ViewTaskDetailModal;
