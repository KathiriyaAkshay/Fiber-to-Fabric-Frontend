import { useMemo } from "react";
import AddSaleReturnType from "./AddSaleReturnType";
import AddClaimNoteType from "./AddClaimNoteType";
import AddDiscountNote from "./AddDiscountNote";
import AddOther from "./AddOther";
import AddLatePayment from "./AddLatePayment";

const AddCreditNotes = ({
  setIsAddModalOpen,
  isAddModalOpen,
  creditNoteTypes,
  creditNoteData,
}) => {
  const renderForm = useMemo(() => {
    if (creditNoteTypes === "sale_return") {
      return (
        <AddSaleReturnType
          setIsAddModalOpen={setIsAddModalOpen}
          isAddModalOpen={isAddModalOpen}
          creditNoteData={creditNoteData}
        />
      );
    } else if (creditNoteTypes === "late") {
      return (
        <AddLatePayment
          setIsAddModalOpen={setIsAddModalOpen}
          creditNoteData={creditNoteData}
          isAddModalOpen={isAddModalOpen}
        />
      );
    } else if (creditNoteTypes === "claim") {
      return (
        <AddClaimNoteType
          setIsAddModalOpen={setIsAddModalOpen}
          isAddModalOpen={isAddModalOpen}
        />
      );
    } else if (creditNoteTypes === "discount") {
      return (
        <AddDiscountNote
          setIsAddModalOpen={setIsAddModalOpen}
          isAddModalOpen={isAddModalOpen}
        />
      );
    } else if (creditNoteTypes === "other") {
      return (
        <AddOther
          setIsAddModalOpen={setIsAddModalOpen}
          isAddModalOpen={isAddModalOpen}
        />
      );
    }
  }, [creditNoteTypes, isAddModalOpen, setIsAddModalOpen]);

  return renderForm;
};
export default AddCreditNotes;
