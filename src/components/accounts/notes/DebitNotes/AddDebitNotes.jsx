import { useCallback, useMemo, useState } from "react";
import { Flex, Modal, Radio } from "antd";
import PurchaseReturnForm from "./PurchaseReturnForm";
import DiscountNoteForm from "./DiscountNoteForm";
import ClaimNoteForm from "./ClaimNoteForm";
import OtherForm from "./OtherForm";
import "./_style.css";
import { CloseOutlined } from "@ant-design/icons";

const AddDebitNotes = ({
  isAddModalOpen,
  setIsAddModalOpen,
  defaultDebitNoteType,
}) => {
  const [selectedOption, setSelectedOptions] = useState(defaultDebitNoteType);

  const handleClose = useCallback(() => {
    setIsAddModalOpen(false);
  }, [setIsAddModalOpen]);

  const renderForm = useMemo(() => {
    if (selectedOption === "purchase_return") {
      return (
        <PurchaseReturnForm type={selectedOption} handleClose={handleClose} />
      );
    } else if (selectedOption === "discount_note") {
      return (
        <DiscountNoteForm type={selectedOption} handleClose={handleClose} />
      );
    } else if (selectedOption === "claim_note") {
      return <ClaimNoteForm type={selectedOption} handleClose={handleClose} />;
    } else if (selectedOption === "other") {
      return <OtherForm type={selectedOption} handleClose={handleClose} />;
    }
  }, [handleClose, selectedOption]);

  const title = useMemo(() => {
    if (selectedOption === "purchase_return") {
      return "Purchase Return";
    } else if (selectedOption === "discount_note") {
      return "Discount Note";
    } else if (selectedOption === "claim_note") {
      return "Claim Note";
    } else if (selectedOption === "other") {
      return "Other";
    }
  }, [selectedOption]);

  return (
    <>
      <Modal
        open={isAddModalOpen}
        onCancel={handleClose}
        width={"75%"}
        footer={false}
        closeIcon={<CloseOutlined className="text-white" />}
        title={`Debit Note - ${title}`}
        centered
        className={{
          header: "text-center",
        }}
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
            padding: "16px 32px",
          },
        }}
      >
        <div className="credit-note-container">
          <Flex className="mb-2" justify="center">
            <Radio.Group
              value={selectedOption}
              name="production_filter"
              onChange={(e) => {
                setSelectedOptions(e.target.value);
              }}
            >
              <Radio value={"purchase_return"}>Purchase Return</Radio>
              <Radio value={"discount_note"}>Discount Note</Radio>
              <Radio value={"claim_note"}>Claim Note</Radio>
              <Radio value={"other"}>other</Radio>
            </Radio.Group>
          </Flex>

          {renderForm}
        </div>
      </Modal>
    </>
  );
};
export default AddDebitNotes;
