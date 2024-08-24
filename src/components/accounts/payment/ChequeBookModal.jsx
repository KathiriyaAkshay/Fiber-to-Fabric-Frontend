import { CreditCardOutlined } from "@ant-design/icons";
import { Button, Flex, Modal } from "antd";
import { useState } from "react";

const ChequeBookModal = ({ details }) => {
  // console.log("ChequeBookModal", details);

  const [ChequeBookModal, setChequeBookModalOpen] = useState(false);
  const showChequeBookModal = () => {
    setChequeBookModalOpen(true);
  };
  const handleChequeBookOk = () => {
    setChequeBookModalOpen(false);
  };
  const handleChequeBookCancel = () => {
    setChequeBookModalOpen(false);
  };

  return (
    <>
      <Button onClick={() => showChequeBookModal()}>
        <CreditCardOutlined />
      </Button>
      <Modal
        open={ChequeBookModal}
        onOk={handleChequeBookOk}
        onCancel={handleChequeBookCancel}
        width={"70%"}
        footer={[]}
      >
        <div className="font-semibold text-lg mb-3">Cheque</div>

        <img src={"https://placehold.co/1000x400"} />

        <Flex justify="flex-end" className="gap-1">
          <Button>Print</Button>
          <Button danger onClick={handleChequeBookCancel}>
            Close
          </Button>
        </Flex>
      </Modal>
    </>
  );
};

export default ChequeBookModal;
