import { useState } from "react";
import { Button, Modal, Select, Typography } from "antd";
import { CloseOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import AddPartnerModal from "./AddPartnerModal";
import AddProprietorModal from "./AddProprietorModal";

const AddPartner = ({ companyDetails }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [partnerType, setPartnerType] = useState("");
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setPartnerType("");
  };

  function renderModal() {
    if (partnerType === "PARTNER") {
      return (
        <AddPartnerModal
          open={isModalOpen && partnerType === "PARTNER"}
          onCancel={handleCancel}
          companyDetails={companyDetails}
        />
      );
    }
    if (partnerType === "PROPRIETOR") {
      return (
        <AddProprietorModal
          open={isModalOpen && partnerType === "PROPRIETOR"}
          onCancel={handleCancel}
          companyDetails={companyDetails}
        />
      );
    }
    return (
      <Modal
        closeIcon={<CloseOutlined className="text-white" />}
        title={
          <Typography.Text className="text-xl font-medium text-white">
            Select Type
          </Typography.Text>
        }
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
        centered={true}
        classNames={{
          header: "text-center",
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
          },
        }}
      >
        <Select
          defaultValue=""
          style={{
            width: "100%",
          }}
          onChange={setPartnerType}
          options={[
            {
              value: "",
              label: "Select Type",
            },
            {
              value: "PARTNER",
              label: "PARTNER",
            },
            {
              value: "PROPRIETOR",
              label: "PROPRIETOR",
            },
          ]}
        />
      </Modal>
    );
  }

  return (
    <>
      <Button type="primary" onClick={showModal}>
        <UsergroupAddOutlined />
      </Button>
      {renderModal()}
    </>
  );
};
export default AddPartner;
