import { Button, Flex, Modal, Typography } from "antd";
import { useRef } from "react";
import { CloseOutlined } from "@ant-design/icons";
import ReactToPrint from "react-to-print";

const MillgineStoreQrModal = ({ open, handleClose, details = [] }) => {
  const ComponentRef = useRef();

  // const adjustHeight = {};
  // if (true) {
  //   adjustHeight.height = "calc(100vh - 150px)";
  //   adjustHeight.overflowY = "scroll";
  // }

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
      <Modal
        closeIcon={<CloseOutlined className="text-white" />}
        title={
          <Typography.Text className="text-xl font-medium text-white">
            Taka
          </Typography.Text>
        }
        open={open}
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
        onCancel={handleClose}
        centered={true}
        classNames={{
          header: "text-center",
        }}
        width={"30%"}
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
          {details?.map((element, index) => {
            const qrData = `code=${element?.code}, description=${element?.description}`;

            return (
              <Flex key={index} style={{ marginBottom: "20px" }}>
                <div style={{ marginTop: "auto", marginBottom: "auto" }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?data=${qrData}&size=100x100`}
                    alt={`QR code for ${element?.code}`}
                    style={{ width: "100%", height: 140, marginTop: "auto" }}
                  />
                </div>
                <div style={{ marginLeft: 20 }}>
                  <p>
                    Code : <strong>{element?.code}</strong>
                  </p>
                  <p>
                    D: <strong>{element?.description}</strong>
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

export default MillgineStoreQrModal;
