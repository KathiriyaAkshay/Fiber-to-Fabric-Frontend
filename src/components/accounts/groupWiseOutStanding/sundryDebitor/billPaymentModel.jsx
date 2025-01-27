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
import { sundaryDebitorHandler } from "../../../../constants/sundary.handler";

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
          let paid_amount =  +value ; 
          let bill_net_amount = element?.amount ; 
          let bill_remaing_amount = +bill_net_amount - +paid_amount ; 

          if (bill_remaing_amount < 0 ){
            message.warning("Please, Enter proper amount as part payment") ; 
            return {...element}
          } else {
            return {
              ...element,
              partPayment: paid_amount,
              remainingAmount: +bill_remaing_amount,
            };
          }
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
      key: "bill_amount",
    },
    {
      title: "Sale return/Claim/Discount",
      dataIndex: "salesReturn",
      key: "salesReturn",
      render: (text, record) => {
        return(
          <Flex style={{cursor: "pointer"}}>
            <Tooltip title = {`Sale Return : ${+record?.total_return_amount}`}>
              <div style={{color: "red"}}>{parseFloat(record?.total_return_amount).toFixed(2)}</div>
            </Tooltip>/
            <Tooltip title = {`Claim Amount: ${+record?.total_claim_amount}`}>
              <div style={{color: "orange"}}>{parseFloat(+record?.total_claim_amount).toFixed(2)}</div>
            </Tooltip>/
            <Tooltip title = {`Discount Amount: ${+record?.total_discount_amount}`}>
              <div style={{color: "green"}}>{parseFloat(+record?.total_discount_amount).toFixed(2)}</div>
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
      dataIndex: "bill_amount",
      key: "bill_amount",
    },
    {
      title: "Sale return/Claim/Discount",
      dataIndex: "salesReturn",
      key: "salesReturn",
      render: (text, record) => {
        return(
          <Flex style={{cursor: "pointer"}}>
            <Tooltip title = {`Sale Return : ${+record?.total_return_amount}`}>
              <div style={{color: "red"}}>{parseFloat(record?.total_return_amount).toFixed(2)}</div>
            </Tooltip>/
            <Tooltip title = {`Claim Amount: ${+record?.total_claim_amount}`}>
              <div style={{color: "orange"}}>{parseFloat(+record?.total_claim_amount).toFixed(2)}</div>
            </Tooltip>/
            <Tooltip title = {`Discount Amount: ${+record?.total_discount_amount}`}>
              <div style={{color: "green"}}>{parseFloat(+record?.total_discount_amount).toFixed(2)}</div>
            </Tooltip>
          </Flex>
        )
      }
    },
    {
      title: "Total Amount",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Part Amount",
      dataIndex: "partPayment",
      key: "partPayment",
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) => handlePartAmountChange(e.target.value, index)}
          disabled={record.paymentType === "full"}
        />
      ),
    },
    {
      title: "Payable Amount",
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
        let sundary = sundaryDebitorHandler(bill) ; 
        let returnAmount = +sundary?.total_return_amount + +sundary?.total_claim_amount + +sundary?.total_discount_amount ; 
        if (paymentOption == "fullPayment") {
          temp.push({
            no: index + 1,
            billNo: bill?.bill_no,
            amount: sundary?.bill_net_amount,
            salesReturn: parseFloat(bill?.credit_note_amount || 0).toFixed(2),
            remainingAmount: sundary?.bill_net_amount,
            total_return_amount: sundary?.total_return_amount, 
            total_claim_amount: sundary?.total_claim_amount, 
            total_discount_amount: sundary?.total_discount_amount, 
            bill_id: bill?.bill_id, 
            model: bill?.model, 
            bill_amount_without_gst: sundary?.bill_amount_without_gst, 
            dueDate: sundary?.dueDate, 
            supplier_id: bill?.supplier_id, 
            party_id: bill?.party_id, 
            billDate: sundary?.billDate, 
            bill_amount: sundary?.bill_amount
          });

          totalAmount += +parseFloat(sundary?.bill_net_amount || 0);
          totalSaleReturnAmount += parseFloat(returnAmount || 0);
          finalNetAmount += +sundary?.bill_net_amount;
        } else {
          temp.push({
            no: index + 1,
            billNo: bill?.bill_no,
            bill_amount: sundary?.bill_amount,
            amount: sundary?.bill_net_amount,
            salesReturn: parseFloat(bill?.credit_note_amount || 0).toFixed(2),
            total_return_amount: sundary?.total_return_amount, 
            total_claim_amount: sundary?.total_claim_amount, 
            total_discount_amount: sundary?.total_discount_amount, 
            bill_id: bill?.bill_id, 
            model: bill?.model, 
            bill_amount_without_gst: sundary?.bill_amount_without_gst, 
            dueDate: sundary?.dueDate, 
            supplier_id: bill?.supplier_id, 
            party_id: bill?.party_id, 
            billDate: sundary?.billDate, 
            partPayment: 0,
            remainingAmount: sundary?.bill_net_amount
          });
          totalAmount += +parseFloat(sundary?.bill_amount || 0);
          totalSaleReturnAmount += parseFloat(returnAmount || 0);
          finalNetAmount += +sundary?.bill_net_amount;
        }

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
        queryClient.invalidateQueries(["account", "group-wise-outstanding", "debiter", "sundry"]);
        const successMessage = res?.message;
        if (successMessage) {
          message.success('Bill payment received successfully');
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
      
      // Vocher number information 
      let temp_vocher_number = lastVoucherNo || "V-0";
      temp_vocher_number = String(temp_vocher_number).split("-")[1];
      let vocher_details = `V-${+temp_vocher_number + 1}`;
      let bill_details = [];

      let haseError = false ; 

      data?.map((element) => {
        if (paymentOption == "fullPayment"){
          bill_details.push({
            bill_id: element?.bill_id,
            bill_no: element?.billNo,
            model: element?.model,
            amount: +element?.bill_amount_without_gst,
            net_amount: +element?.amount,
            paid_amount: +element?.amount,
            bill_date: element?.billDate,
            due_date: element?.dueDate,
            part_payment: 0,
            tds: null,
            less_percentage: null,
            plus_percentage: null,
            is_paid: false,
          });
        } else {
          if (
            element?.partPayment === null ||
            element?.partPayment === undefined ||
            element?.partPayment === "" ||
            isNaN(element?.partPayment)
          ) {
            message.warning("Part payment is invalid. Please check the data.") ; 
            haseError = true; 
            return ; 
          }

          bill_details.push({
            bill_id: element?.bill_id,
            bill_no: element?.billNo,
            model: element?.model,
            amount: +element?.bill_amount_without_gst,
            net_amount: +element?.amount,
            paid_amount: +element?.remainingAmount,
            bill_date: element?.billDate,
            due_date: element?.dueDate,
            part_payment: element?.partPayment,
            tds: null,
            less_percentage: null,
            plus_percentage: null,
            is_paid: false,
          });
        }
      });
      let requestPayload = {
        supplier_id: data[0]?.supplier_id,
        bank_id: bankValue,
        cheque_no: chequeNumber,
        cheque_date: moment(chequeDate).format("YYYY-MM-DD"),
        total_amount: +parseFloat(payableAmount).toFixed(2),
        voucher_no: vocher_details,
        remark: bill_details?.map((element) => element?.bill_no).join(", "),
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

      if (!haseError){
        await addBillEntry({ data: requestPayload });
      }
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
