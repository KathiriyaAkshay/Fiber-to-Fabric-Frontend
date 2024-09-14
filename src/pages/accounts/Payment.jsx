import { PlusCircleOutlined } from "@ant-design/icons";
import { Button, Radio, Flex } from "antd";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BillList from "./PaymentVoucherList/BillList";
import PassBookList from "./PaymentVoucherList/PassBookList";
import CashBookList from "./PaymentVoucherList/CashBookList";
import JournalList from "./PaymentVoucherList/JournalList";

const paymentOptions = [
  { label: "Bill", value: "bill" },
  { label: "Passbook Update", value: "passbook_update" },
  { label: "Cashbook Update", value: "cashbook_update" },
  { label: "Journal", value: "journal" },
];

const Payment = () => {
  const navigate = useNavigate();
  const [paymentFilter, setPaymentFilter] = useState("bill");

  const changePaymentFilterHandler = ({ target: { value } }) => {
    setPaymentFilter(value);
  };

  const navigateToAdd = () => {
    navigate("add");
  };

  const renderList = useMemo(() => {
    if (paymentFilter === "bill") {
      return <BillList />;
    } else if (paymentFilter === "passbook_update") {
      return <PassBookList />;
    } else if (paymentFilter === "cashbook_update") {
      return <CashBookList />;
    } else if (paymentFilter === "journal") {
      return <JournalList />;
    }
  }, [paymentFilter]);

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary">Payment Voucher List</h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>
        <Flex style={{ marginLeft: "auto" }} gap={10}>
          <Radio.Group
            value={paymentFilter}
            onChange={changePaymentFilterHandler}
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
      {renderList}
    </div>
  );
};

export default Payment;
