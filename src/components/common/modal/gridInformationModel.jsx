import { useState } from "react";
import { Button, Col, Descriptions, Modal, Row, Typography } from "antd";
import { CloseOutlined, EyeOutlined } from "@ant-design/icons";

const GridInformationModel = ({ title = "", details = [] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        type="primary"
        onClick={() => {
          setIsModalOpen(true);
        }}
      >
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
        onCancel={() => {
          setIsModalOpen(false);
        }}
        centered={true}
        classNames={{
          header: "text-center",
        }}
        width={"60%"}
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
        <Row gutter={16} style={{ marginTop: 20, marginBottom: 20 }}>
          <Col span={details?.length > 15 ? 12 : 24}>
            <Descriptions
              column={1}
              bordered
              className="grid-information-model"
            >
              {details?.map((element, index) => {
                if (index <= 10) {
                  return (
                    <Descriptions.Item key={index} label={element?.label}>
                      {element.value}
                    </Descriptions.Item>
                  );
                }
                return null;
              })}
            </Descriptions>
          </Col>

          {details?.length > 10 && (
            <Col span={12}>
              <Descriptions
                column={1}
                bordered
                className="grid-information-model"
              >
                {details?.map((element, index) => {
                  if (index > 10) {
                    return (
                      <Descriptions.Item key={index} label={element?.label}>
                        {element.value}
                      </Descriptions.Item>
                    );
                  }
                  return null;
                })}
              </Descriptions>
            </Col>
          )}
        </Row>
      </Modal>
    </>
  );
};

export default GridInformationModel;
