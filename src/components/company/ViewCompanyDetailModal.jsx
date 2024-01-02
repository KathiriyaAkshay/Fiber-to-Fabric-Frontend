import { useState } from "react";
import { Button, Modal } from "antd";
import { EyeOutlined } from "@ant-design/icons";

const ViewCompanyDetailModal = ({ companyDetails }) => {
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
        title="Company Details"
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
      >
        {JSON.stringify(companyDetails)}
      </Modal>
    </>
  );
};
export default ViewCompanyDetailModal;
