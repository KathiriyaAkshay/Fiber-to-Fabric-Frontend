import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Divider, Flex, Radio } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BillForm from "./BillForm";
import { PAYMENT_OPTIONS } from "../../../constants/account";
import ContraForm from "./ContraForm";
import PassBookForm from "./PassBookForm";
import CashBookForm from "./CashBookForm";
import JournalForm from "./JournalForm";
import OpeningCurrentForm from "./OpeningCurrentForm";
import { localStorageHandler } from "../../../utils/mutationUtils";
import { PAYMENT_TYPE } from "../../../constants/localStorage";

const paymentOptions = [
  { label: "Bill", value: "bill" },
  { label: "Contra", value: "contra" },
  { label: "Passbook Update", value: "passbook_update" },
  { label: "Cashbook Update", value: "cashbook_update" },
  { label: "Opening/Current Update", value: "opening_current_update" },
  { label: "Journal", value: "journal" },
];

const NewPaymentVoucher = () => {
  const navigate = useNavigate();

  const paymentType = localStorageHandler("GET", PAYMENT_TYPE);
  const [selectedPayment, setSelectedPayment] = useState(paymentType || "bill");

  function goBack() {
    navigate(-1);
  }

  const renderForm = useMemo(() => {
    switch (selectedPayment) {
      case PAYMENT_OPTIONS.bill:
        return <BillForm />;

      case PAYMENT_OPTIONS.contra:
        return <ContraForm />;

      case PAYMENT_OPTIONS.passbook_update:
        return <PassBookForm />;

      case PAYMENT_OPTIONS.cashbook_update:
        return <CashBookForm />;

      case PAYMENT_OPTIONS.opening_current_update:
        return <OpeningCurrentForm />;

      case PAYMENT_OPTIONS.journal:
        return <JournalForm />;

      default:
        break;
    }
  }, [selectedPayment]);

  useEffect(() => {
    return () => {
      localStorageHandler("REMOVE", PAYMENT_TYPE);
    };
  }, []);

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Create New Payment Voucher</h3>

        <Flex style={{ marginLeft: "auto" }} gap={10}>
          <Radio.Group
            value={selectedPayment}
            onChange={(e) => setSelectedPayment(e.target.value)}
            className="payment-options"
          >
            {paymentOptions.map(({ label, value }, index) => {
              return (
                <Radio key={index + "_payment_option"} value={value}>
                  {label}
                </Radio>
              );
            })}
          </Radio.Group>
        </Flex>
      </div>

      <Divider />

      {renderForm}
    </div>
  );
};

export default NewPaymentVoucher;
