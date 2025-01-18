import { useContext, useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Button,
  Radio,
  Select,
  Table,
  Typography,
  Flex,
  message,
  Tooltip,
} from "antd";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import moment from "moment";
import dayjs from "dayjs";
const { Text } = Typography;
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addPaymentBillRequest } from "../../../../api/requests/accounts/payment";
import { getLastVoucherNoRequest } from "../../../../api/requests/accounts/payment";

const BillPaymentModel = ({
  visible,
  onClose,
  selectedBill,
  sundryDebtorData,
}) => {
  const queryClient = useQueryClient();
  const { companyListRes, companyId } = useContext(GlobalContext);
  const [bankOption, setBankOption] = useState([]);

  useEffect(() => {
    if (companyId && companyListRes) {
      const selectedCompany = companyListRes.rows.find(
        ({ id }) => id === companyId
      );

      if (selectedCompany && selectedCompany?.company_bank_details?.length) {
        const tempBankOption = selectedCompany?.company_bank_details?.map(
          ({ bank_name, id, balance }) => {
            return { label: bank_name, value: id, balance };
          }
        );
        setBankOption(tempBankOption);
      }
    }
  }, [companyId, companyListRes]);

  const [form] = Form.useForm();
  const [paymentOption, setPaymentOption] = useState("fullPayment");
  const [totalAmount, setTotalAmount] = useState({
    amount: 0,
    saleAmount: 0,
  });
  const [grandTotal, setGrandTotal] = useState(0);
  const [payableAmount, setPayableAmount] = useState(0);
  const [data, setData] = useState([
    {
      key: "1",
      no: "1",
      billNo: "21312",
      amount: 15129,
      salesReturn: 0,
    },
  ]);

  const [tdsAmount, setTdsAmount] = useState(0);
  const [roundOffAmount, setRoundOffAmount] = useState(0);
  const [chequeNumber, setChequeNumber] = useState(undefined);
  const [chequeDate, setChequeDate] = useState(new dayjs());
  const [partyBank, setPartyBank] = useState(undefined);
  const [bankValue, setBankValue] = useState(undefined);
  const [updateOption, setUpdateOption] = useState("passbookUpdate");

  const handlePartAmountChange = (value, index) => {
    setData((prevData) =>
      prevData.map((element, indexValue) => {
        if (indexValue === index) {
          const total_amount = element?.totalAmount || 0; // Bill total payment
          let credit_note_amount = parseFloat(+element?.credit_note_amount || 0).toFixed(2) || 0;
          let bill_deducation_amount = +total_amount - +credit_note_amount;
          let bill_remaing_amount = parseFloat(element?.part_payment == null ? bill_deducation_amount : +element?.part_payment).toFixed(2);
          // const partPayment = +value > +totalAmount ? 0 : +value; // Bil
          // const remainAmount = +totalAmount - +partPayment;
          return {
            ...element,
            partAmount: element?.part_payment,
            remainingAmount: bill_remaing_amount,
          };
        } else {
          return { ...element };
        }
      })
    );
  };

  // ===================== Payment related columns ================//
  const fullPaymentColumns = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
    },
    {
      title: "Bill No.",
      dataIndex: "billNo",
      key: "billNo",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Sale return/Claim/Discount",
      dataIndex: "salesReturn",
      key: "salesReturn",
      render: (text, record) => {
        return(
          <Flex style={{cursor: "pointer"}}>
            <Tooltip title = {`Sale Return : ${text}`}>
              <div style={{color: "red"}}>{parseFloat(text).toFixed(2)}</div>
            </Tooltip>/
            <Tooltip title = {`Claim Amount: ${parseFloat(0).toFixed(2)}`}>
              <div style={{color: "orange"}}>{parseFloat(0).toFixed(2)}</div>
            </Tooltip>/
            <Tooltip title = {`Discount Amount: ${parseFloat(0).toFixed(2)}`}>
              <div style={{color: "green"}}>{parseFloat(0).toFixed(2)}</div>
            </Tooltip>
          </Flex>
        )
      }
    },
  ];

  // ============ Partial payment related information columns ============ 
  const partialPaymentColumns = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
    },
    {
      title: "Bill No.",
      dataIndex: "billNo",
      key: "billNo",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Sale return/Claim/Discount",
      dataIndex: "salesReturn",
      key: "salesReturn",
      render: (text, record) => {
        return (
          <div>
            {parseFloat(record?.credit_note_amount || 0)}
          </div>
        )
      }
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
    },
    {
      title: "Part Amount",
      dataIndex: "partAmount",
      key: "partAmount",
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) => handlePartAmountChange(e.target.value, index)}
          disabled={record.paymentType === "full"}
        />
      ),
    },
    {
      title: "Remaining Payable Amount",
      dataIndex: "remainingAmount",
      key: "remainingAmount",
    },
  ];

  // Calculate bill amount information 
  useEffect(() => {
    if (selectedBill?.length > 0) {
      let temp = [];
      let totalAmount = 0;
      let totalSaleReturnAmount = 0;
      let finalNetAmount = 0;
      selectedBill?.map((bill, index) => {
        let total_amount = parseFloat(+bill?.amount || 0).toFixed(2) || 0;
        let credit_note_amount =
          parseFloat(+bill?.credit_note_amount || 0).toFixed(2) || 0;
        let paid_amount = parseFloat(+bill?.paid_amount || 0).toFixed(2) || 0;
        let finalAmount = total_amount - paid_amount - credit_note_amount;

        if (paymentOption == "fullPayment") {
          temp.push({
            no: index + 1,
            billNo: bill?.bill_no,
            amount: parseFloat(bill?.amount || 0).toFixed(2),
            salesReturn: parseFloat(bill?.credit_note_amount || 0).toFixed(2),
            remainingAmount: finalAmount,
            ...bill,
          });
        } else {
          temp.push({
            no: index + 1,
            billNo: bill?.bill_no,
            amount: parseFloat(bill?.amount || 0).toFixed(2),
            salesReturn: parseFloat(bill?.credit_note_amount).toFixed(2),
            totalAmount: finalAmount,
            partAmount: 0,
            remainingAmount: finalAmount,
            ...bill,
          });
        }

        totalAmount += +parseFloat(bill?.amount || 0);
        totalSaleReturnAmount += parseFloat(bill?.credit_note_amount || 0);

        finalNetAmount += +finalAmount;
      });

      setData(temp);
      setTotalAmount({
        amount: totalAmount,
        saleAmount: totalSaleReturnAmount,
      });
      setGrandTotal(finalNetAmount);
    }
  }, [selectedBill, paymentOption]);

  // ========= Calculate Payable amount ============== //
  useEffect(() => {
    if (data?.length > 0) {
      let totalAmount = 0;
      data?.map((element) => {
        totalAmount += +element?.remainingAmount;
      });
      setGrandTotal(totalAmount);

      if (tdsAmount > 0) {
        totalAmount -= +tdsAmount;
      }

      if (roundOffAmount > 0) {
        totalAmount += +roundOffAmount;
      }
      setPayableAmount(totalAmount);
    }
  }, [tdsAmount, roundOffAmount, data]);

  const { mutateAsync: addBillEntry, isPending: isPendingBillEntry } =
    useMutation({
      mutationFn: async ({ data }) => {
        const res = await addPaymentBillRequest({
          data,
          params: {
            company_id: companyId,
          },
        });
        return res.data;
      },
      mutationKey: ["account", "group-wise-outstanding", "debiter", "sundry"],
      onSuccess: (res) => {
        queryClient.invalidateQueries("account/statement/last/voucher", {
          company_id: companyId,
        });
        const successMessage = res?.message;
        if (successMessage) {
          message.success(successMessage);
        }
        onClose();
      },
      onError: (error) => {
        const errorMessage = error?.response?.data?.message || error.message;
        message.error(errorMessage);
      },
  });

  // Get last vocher number related information ================================
  const { data: lastVoucherNo } = useQuery({
    queryKey: ["account/statement/last/voucher", { companyId }],
    queryFn: async () => {
      const res = await getLastVoucherNoRequest({
        params: { company_id: companyId, is_credited: 1 },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const handleConfirm = async () => {
    if (chequeNumber == "" || chequeNumber == undefined) {
      message.warning("Please, Enter cheque number");
    } else if (partyBank == "" || partyBank == undefined) {
      message.warning("Please, Provide party bank information");
    } else if (bankValue == "" || bankValue == undefined) {
      message.warning("Please, Select bank");
    } else {
      let bill_details = [];
      let total_paid_amount = 0;
      let temp_vocher_number = lastVoucherNo || "V-0";
      temp_vocher_number = String(temp_vocher_number).split("-")[1];
      let vocher_details = `V-${+temp_vocher_number + 1}`;

      data?.map((element) => {
        
        let total_amount = parseFloat(+element?.amount || 0).toFixed(2) || 0;
        let credit_note_amount =
          parseFloat(+element?.credit_note_amount || 0).toFixed(2) || 0;
        let paid_amount =
          parseFloat(+element?.paid_amount || 0).toFixed(2) || 0;
        let finalAmount = total_amount - paid_amount - credit_note_amount;
        let partAmount = element?.partAmount;
        
        let new_paid_amount =
          paymentOption == "fullPayment"
            ? finalAmount
            : +finalAmount - +partAmount;
        total_paid_amount += +new_paid_amount;

        bill_details.push({
          bill_id: element?.bill_id,
          bill_no: element?.bill_no,
          model: element?.model,
          amount: +element?.amount,
          net_amount: +finalAmount,
          paid_amount: +new_paid_amount,
          bill_date: element?.createdAt,
          due_date: null,
          part_payment: partAmount == 0 ? null : partAmount,
          tds: null,
          less_percentage: null,
          plus_percentage: null,
          is_paid: false,
        });
      });
      let requestPayload = {
        supplier_id: data[0]?.supplier_id,
        bank_id: bankValue,
        cheque_no: chequeNumber,
        cheque_date: moment(chequeDate).format("YYYY-MM-DD"),
        total_amount: total_paid_amount,
        voucher_no: vocher_details,
        remark: "",
        createdAt: moment(new Date()).format("YYYY-MM-DD"),
        is_passbook_entry: updateOption == "passbookUpdate" ? true : false,
        party_id: data[0]?.party_id,
        party_bank: partyBank,
        is_full_payment: paymentOption == "fullPayment" ? true : false,
        tds: tdsAmount,
        round_off_amount: roundOffAmount,
        is_credited: true,
        bill_details: bill_details,
      };

      console.log("Request payload informatino ==================");
      
      console.log(requestPayload);
      
      // await addBillEntry({ data: requestPayload });
    }
  };

  function disabledFutureDate(current) {
    return current && current > moment().endOf("day");
  }

  return (
    <Modal
      open={visible}
      title="Collect Payment/Interest"
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="confirm"
          loading={isPendingBillEntry}
          type="primary"
          onClick={handleConfirm}
        >
          Confirm
        </Button>,
      ]}
      width={"fit-content"}
      className="view-in-house-quality-model"
      classNames={{
        header: "text-center",
      }}
      styles={{
        content: {
          padding: 0,
          width: "fit-content",
          margin: "auto",
          minWidth: "600px",
        },
        header: {
          padding: "16px",
          margin: 0,
        },
        body: {
          padding: "10px 16px",
        },
        footer: {
          paddingBottom: "10px",
          paddingRight: "10px",
        },
      }}
    >
      <div>
        <Form form={form} layout="vertical">
          <Radio.Group
            defaultValue="fullPayment"
            value={paymentOption}
            onChange={(event) => {
              setPaymentOption(event.target.value);
            }}
            style={{
              marginTop: "10px",
            }}
          >
            <Radio value="fullPayment">Full Payment</Radio>
            <Radio value="partPayment">Part Payment</Radio>
          </Radio.Group>

          <Table
            columns={
              paymentOption == "fullPayment"
                ? fullPaymentColumns
                : partialPaymentColumns
            }
            dataSource={data}
            pagination={false}
            style={{
              marginTop: "20px",
              marginBottom: "10px",
            }}
            summary={() => (
              <>
                <Table.Summary.Row key={"total"}>
                  <Table.Summary.Cell colSpan={2}>
                    <Text>Total</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell>
                    <Text>{totalAmount?.amount || 0}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell>
                    <Text>
                      <span style={{ color: "blue" }}>
                        {totalAmount?.saleAmount || 0}
                      </span>
                    </Text>
                  </Table.Summary.Cell>
                  {paymentOption !== "fullPayment" &&
                    Array(3)
                      .fill(null)
                      .map((_, index) => (
                        <Table.Summary.Cell key={`total-empty-${index}`} />
                      ))}
                </Table.Summary.Row>

                <Table.Summary.Row key={"grandTotal"}>
                  <Table.Summary.Cell colSpan={2}>
                    <Text>Grand Total</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell>
                    <Text>{grandTotal || 0}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell />
                  {paymentOption !== "fullPayment" &&
                    Array(3)
                      .fill(null)
                      .map((_, index) => (
                        <Table.Summary.Cell key={`grand-empty-${index}`} />
                      ))}
                </Table.Summary.Row>
              </>
            )}
          />

          <div
            style={{
              marginTop: "20px",
            }}
          >
            <Flex
              style={{
                gap: 10,
                textAlign: "center",
              }}
            >
              <div style={{ width: "48%" }}>
                <div className="sundary-bill-payment-label">TDS Amount</div>
                <Input
                  value={tdsAmount}
                  type="number"
                  placeholder="TDS Amount"
                  onChange={(event) => {
                    setTdsAmount(event.target.value);
                  }}
                />
              </div>
              <div style={{ width: "48%" }}>
                <div className="sundary-bill-payment-label">Round Off Amount</div>
                <Input
                  placeholder="Round Off Amount"
                  value={roundOffAmount}
                  type="number"
                  onChange={(event) => {
                    setRoundOffAmount(event.target.value);
                  }}
                />
              </div>
            </Flex>
          </div>

          <div>
            <div
              style={{
                fontWeight: 600,
                color: "blue",
                fontSize: 15,
                marginTop: 10,
              }}
            >
              Payable Amount: {payableAmount || 0}
            </div>
          </div>

          <div
            style={{
              marginTop: "10px",
            }}
          >
            <Flex
              style={{
                gap: 10,
                textAlign: "center",
              }}
            >
              <div style={{ width: "48%" }}>
                <div className="sundary-bill-payment-label">Cheque number</div>
                <Input
                  placeholder="Cheque number"
                  value={chequeNumber}
                  onChange={(event) => {
                    setChequeNumber(event.target.value);
                  }}
                />
              </div>

              <div style={{ width: "48%" }}>
                <div className="sundary-bill-payment-label">Cheque Date</div>
                <DatePicker
                  style={{
                    width: "100%",
                  }}
                  disabledDate={disabledFutureDate}
                  format="DD-MM-YYYY"
                  value={chequeDate}
                  onChange={(event) => {
                    setChequeDate(event.target.value);
                  }}
                />
              </div>
            </Flex>
          </div>

          <div
            style={{
              marginTop: "10px",
              gap: 5,
            }}
          >
            <Flex
              style={{
                gap: 5,
                textAlign: "center",
              }}
            >
              <div style={{ width: "48%" }}>
                <div className="sundary-bill-payment-label">Party Bank</div>
                <Input
                  placeholder="PARTY Bank"
                  value={partyBank}
                  onChange={(event) => {
                    setPartyBank(event.target.value);
                  }}
                />
              </div>
              <div style={{ width: "48%" }}>
                <div className="sundary-bill-payment-label">Bank</div>
                <Select
                  value={bankValue}
                  onChange={(event) => {
                    setBankValue(event);
                  }}
                  style={{
                    width: "100%",
                  }}
                  placeholder={"Bank Option"}
                  options={bankOption}
                ></Select>
              </div>
            </Flex>
          </div>

          <Radio.Group
            defaultValue="passbookUpdate"
            style={{
              marginTop: 20,
            }}
            value={updateOption}
            onChange={(event) => {
              setUpdateOption(event.target.value);
            }}
          >
            <Radio value="passbookUpdate">Passbook Update</Radio>
            <Radio value="cashbookUpdate">Cashbook Update</Radio>
          </Radio.Group>
        </Form>
      </div>

    </Modal>
  );
};

export default BillPaymentModel;
