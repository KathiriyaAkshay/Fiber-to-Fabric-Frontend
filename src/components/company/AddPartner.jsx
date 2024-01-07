import { useState } from "react";
import { Button, Modal, Select, Typography } from "antd";
import { UsergroupAddOutlined } from "@ant-design/icons";
import AddPartnerModal from "./AddPartnerModal";
import AddProprietorModal from "./AddProprietorModal";

const { Title } = Typography;

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
        title={
          <Title level={4} style={{ margin: 0 }}>
            Select Type
          </Title>
        }
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
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
