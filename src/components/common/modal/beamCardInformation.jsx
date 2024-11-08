import { useRef, useState } from "react";
import { Button, Flex, Modal, Typography } from "antd";
import { BarcodeOutlined, CloseOutlined } from "@ant-design/icons";
import ReactToPrint from "react-to-print";

const BeamCardInformationModel = ({ data, title }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const ComponentRef = useRef();

  const pageStyle = `
        @media print {
             .print-instructions {
                display: none;
            }
            .printable-content {
                width: 100%;
            }
    `;
  return (
    <>
      <Button
        onClick={() => {
          setIsModalOpen(true);
        }}
      >
        <BarcodeOutlined />
      </Button>

      <Modal
        closeIcon={<CloseOutlined className="text-white" />}
        open={isModalOpen}
        title={
          <Typography.Text className="text-xl font-medium text-white">
            {title == undefined?"Beam card information":title}
          </Typography.Text>
        }
        centered={true}
        classNames={{
          header: "text-center",
        }}
        footer={() => {
          return (
            <>
              <ReactToPrint
                trigger={() => (
                  <Flex>
                    <Button
                      type="primary"
                      style={{ marginLeft: "auto", marginTop: 15 }}
                    >
                      PRINT
                    </Button>
                  </Flex>
                )}
                content={() => ComponentRef.current}
                pageStyle={pageStyle}
              />
            </>
          );
        }}
        width={"25%"}
        onCancel={() => {
          setIsModalOpen(false);
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
            maxHeight: "80vh",
            overflowY: "auto",
          },
          footer: {
            paddingBottom: 10,
            paddingRight: 10,
            backgroundColor: "#efefef",
          },
        }}
      >
        <div ref={ComponentRef}>
          {data?.map((element, index) => {
            return (
              <Flex key={index} style={{ marginBottom: "20px" }}>
                <div>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?data=${element?.beam_no}&size=100x100`}
                    alt={`QR code for ${element?.beam_no}`}
                    style={{ width: "100%", height: 112 }}
                  />
                </div>
                <div style={{ marginLeft: 20 }}>
                  <p>
                    <strong>{element?.beam_no}</strong>
                  </p>
                  <p>
                    Taka: <strong>{element?.taka}</strong>
                  </p>
                  <p>
                    Meter: <strong>{element?.meters}</strong>
                  </p>
                </div>
              </Flex>
            );
          })}
        </div>
      </Modal>
    </>
  );
};

export default BeamCardInformationModel;
