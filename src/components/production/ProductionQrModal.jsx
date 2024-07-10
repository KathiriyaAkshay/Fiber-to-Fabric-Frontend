import { BarcodeOutlined } from "@ant-design/icons";
import { Button, Descriptions, Flex, Modal } from "antd";
import { useState } from "react";

const ProductionQrModal = () => {
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const showQrModal = () => {
    setIsQrModalOpen(true);
  };
  const handleQrOk = () => {
    setIsQrModalOpen(false);
  };
  const handleQrCancel = () => {
    setIsQrModalOpen(false);
  };

  return (
    <>
      <Button onClick={showQrModal}>
        <BarcodeOutlined />
      </Button>
      <Modal
        title=""
        open={isQrModalOpen}
        onOk={handleQrOk}
        onCancel={handleQrCancel}
        width="50%"
      >
        <Flex>
          <img
            width={200}
            src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
          />
          <div className="ms-2">
            <Descriptions title="">
              <Descriptions.Item label="Taka" span={3}>
                Zhou Maomao
              </Descriptions.Item>
              <Descriptions.Item label="Meter" span={3}>
                Zhou Maomao
              </Descriptions.Item>
              <Descriptions.Item label="M.N." span={3}>
                Zhou Maomao
              </Descriptions.Item>
              <Descriptions.Item label="Q" span={3}>
                Zhou Maomao
              </Descriptions.Item>
            </Descriptions>
            <Button type="primary">Print</Button>
          </div>
        </Flex>
      </Modal>
    </>
  );
};

export default ProductionQrModal;
