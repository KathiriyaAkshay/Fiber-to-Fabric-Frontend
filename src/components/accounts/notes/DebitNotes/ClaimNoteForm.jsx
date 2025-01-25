import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  DatePicker,
  Flex,
  Form,
  Input,
  message,
  Radio,
  Select,
  Typography,
  Tag
} from "antd";
import { Controller, useForm } from "react-hook-form";
import {
  createDebitNoteRequest,
  getDebitNoteBillDropDownRequest,
  getLastDebitNoteNumberRequest,
  debitNoteDropDownRequest
} from "../../../../api/requests/accounts/notes";
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import dayjs from "dayjs";
import { getYarnReceiveBillByIdRequest } from "../../../../api/requests/purchase/yarnReceive";
import { getJobTakaBillByIdRequest } from "../../../../api/requests/job/bill/jobBill";
import {
  getGeneralPurchaseByIdRequest,
  getReceiveSizeBeamBillByIdRequest,
} from "../../../../api/requests/purchase/purchaseSizeBeam";
import { getPurchaseTakaBillByIdRequest } from "../../../../api/requests/purchase/bill";
import { getReworkChallanByIdRequest, getReworkChallanListRequest } from "../../../../api/requests/job/challan/reworkChallan";
import { ToWords } from "to-words";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { CURRENT_YEAR_TAG_COLOR, PREVIOUS_YEAR_TAG_COLOR} from "../../../../constants/tag";
import { getFinancialYearEnd } from "../../../../pages/accounts/reports/utils";
import { JOB_TAG_COLOR, PURCHASE_TAG_COLOR } from "../../../../constants/tag";
import { SALE_TAG_COLOR, YARN_SALE_BILL_TAG_COLOR, BEAM_RECEIVE_TAG_COLOR } from "../../../../constants/tag";
import moment from "moment";
import { GENERAL_PURCHASE_MODEL_NAME, GENRAL_PURCHASE_BILL_MODEL, JOB_REWORK_BILL_MODEL, JOB_REWORK_MODEL_NAME, JOB_TAKA_BILL_MODEL, JOB_TAKA_MODEL_NAME, PURCHASE_TAKA_BILL_MODEL, PURCHASE_TAKA_MODEL_NAME, RECEIVE_SIZE_BEAM_BILL_MODEL, RECEIVE_SIZE_BEAM_MODEL_NAME, YARN_RECEIVE_BILL_MODEL, YARN_RECEIVE_MODEL_NAME } from "../../../../constants/bill.model";
import { extractSupplierInformation } from "../../../../utils/supplier.handler";
import SupplierInformationComp from "./supplierInformationComp";
import { calculateFinalNetAmount } from "../../../../constants/taxHandler";

const toWords = new ToWords({
  localeCode: "en-IN",
  converterOptions: {
    currency: true,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
    doNotAddOnly: false,
    currencyOptions: {
      // can be used to override defaults for the selected locale
      name: "Rupee",
      plural: "Rupees",
      symbol: "₹",
      fractionalUnit: {
        name: "Paisa",
        plural: "Paise",
        symbol: "",
      },
    },
  },
});

const validationSchema = yup.object().shape({
  date: yup.string().required("Please enter date"),
  amount: yup.string().required("Please enter amount"),
  bill_id: yup.string().required("Please select bill"),
});

const ClaimNoteForm = ({ type, handleClose }) => {
  const queryClient = useQueryClient();
  const { companyId, company } = useContext(GlobalContext);
  const [supplierInformation, setSuplierInformation] = useState({}) ; 
  const [ billInformation, setBillInformation] = useState({}) ; 

  const { mutateAsync: addDebitClaimNOte, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await createDebitNoteRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["add", "debit", "claim-note"],
    onSuccess: (res) => {
      queryClient.invalidateQueries([
        "get",
        "debit-notes",
        "last-number",
        {
          company_id: companyId,
        },
      ]);
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      reset();
      handleClose();
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(errorMessage);
    },
  });

  const onSubmit = async (data) => {
    const temp_bill_model = String(data?.bill_id).split("***")[0] ; 
    const temp_bill_id = String(data?.bill_id).split("***")[1] ; 
    let temp_debit_note_number = String(debitNoteLastNumber?.debitNoteNumber || "DNP-0").split("-")[1] ; 
    temp_debit_note_number = `DNP-${+temp_debit_note_number + 1}` ; 
    const payload = {
      supplier_id: billData?.supplier?.suplier?.user_id || billData?.supplier?.user_id,
      model: temp_bill_model,
      debit_note_number: temp_debit_note_number || "",
      debit_note_type: type,
      quality_id: data?.quality_id || null,
      total_taka: +data.total_taka,
      total_meter: +data.total_meter,
      discount_value: +data.discount_value,
      discount_amount: +data.discount_amount,
      SGST_value: +data.SGST_value,
      SGST_amount: +data.SGST_amount,
      CGST_value: +data.CGST_value,
      CGST_amount: +data.CGST_amount,
      IGST_value: +data.IGST_value,
      IGST_amount: +data.IGST_amount,
      round_off_amount: +data.round_off_amount,
      net_amount: +data.net_amount,
      createdAt: dayjs(data.date).format("YYYY-MM-DD"),
      debit_note_details: [
        {
          bill_id: temp_bill_id,
          model: temp_bill_model,
          rate: +data.rate || 1,
          per: 1.0,
          invoice_no: data?.invoice_number,
          particular_name: "Claim On Purchase",
          amount: +data.amount,
          quality_id: +data?.quality_id, 
          yarn_company_id: +data?.yarn_company_id        
        },
      ],
    };
    await addDebitClaimNOte(payload);
  };

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      is_current: 1,
      date: dayjs(),
      bill_id: null,
      amount: "",
      supplier_id: "",
      sale_challan_id: "",
      quality_id: "",
      SGST_value: 0,
      SGST_amount: 0,
      CGST_value: 0,
      CGST_amount: 0,
      IGST_value: 0,
      IGST_amount: 0,
      round_off_amount: 0,
      net_amount: "",
      rate: "",
      invoice_number: "",
      total_taka: "",
      total_meter: "",
      discount_value: "",
      discount_amount: "",
    },
    resolver: yupResolver(validationSchema),
  });

  const currentValue = watch();
  const {
    is_current,
    bill_id,
    SGST_value,
    SGST_amount,
    CGST_value,
    CGST_amount,
    IGST_value,
    IGST_amount,
    round_off_amount,
    amount,
    net_amount,
  } = currentValue;

  useEffect(() => {
    if (amount) {
      const SGSTAmount = (amount * SGST_value) / 100;
      setValue("SGST_amount", SGSTAmount.toFixed(2));

      const CGSTAmount = (amount * CGST_value) / 100;
      setValue("CGST_amount", CGSTAmount.toFixed(2));

      const IGSTAmount = (amount * IGST_value) / 100;
      setValue("IGST_amount", IGSTAmount.toFixed(2));

      let taxData = calculateFinalNetAmount(
        +amount, 
        SGST_value, 
        CGST_value, 
        IGST_value, 
        0, 
        0
      )
      setValue("net_amount", taxData?.roundedNetAmount);
      setValue("round_off_amount", taxData?.roundOffValue)
    }
  }, [CGST_value, IGST_value, SGST_value, amount, round_off_amount, setValue]);

  // Claim note bill selection api =======================================
  const { data: billList } = useQuery({
    queryKey: [
      "debit-note",
      "bill",
      "list",
      { company_id: companyId, type: "claim_note", is_current },
    ],
    queryFn: async () => {
      const params = {
        company_id: companyId,
        type: "claim_note",
        end: is_current
          ? getFinancialYearEnd("current")
          : getFinancialYearEnd("end"),
      };
      const response = await getDebitNoteBillDropDownRequest({ params });
      return response?.data?.data || [];
    },
    enabled: Boolean(companyId), // Ensures the query runs only when companyId exists
  });
  

  // Last debit note number information request =================
  const { data: debitNoteLastNumber } = useQuery({
    queryKey: [
      "get",
      "debit-notes",
      "last-number",
      {
        company_id: companyId,
      },
    ],
    queryFn: async () => {
      const params = {
        company_id: companyId,
      };
      const response = await getLastDebitNoteNumberRequest({ params });
      return response.data.data;
    },
    enabled: Boolean(companyId),
  });

  // Get  Particular bill data related information ===========================
  const { data: billData } = useQuery({
    queryKey: [
      "get",
      "selected-bill",
      "data",
      {
        company_id: companyId,
        bill_id: bill_id,
      },
    ],
    queryFn: async () => {
      let response;
      let temp_bill_type = String(bill_id).split("***")[0]; 
      let temp_bill_id = String(bill_id).split("***")[1] ; 
      
      const selectedBillData = billList?.result?.find(
        (item) => item.bill_id == +temp_bill_id && item?.model == temp_bill_type
      );
      switch (selectedBillData.model) {
        case YARN_RECEIVE_BILL_MODEL:
          response = await getYarnReceiveBillByIdRequest({
            id: selectedBillData.bill_id,
            params: { company_id: companyId },
          });
          response = {
            ...response?.data?.data,
            ...response?.data?.data?.yarnReciveBill,
            model : YARN_RECEIVE_BILL_MODEL
          };
          delete response.yarnReciveBill;
          return response;

        case JOB_TAKA_BILL_MODEL:
          response = await getJobTakaBillByIdRequest({
            params: {
              company_id: companyId,
              bill_id: selectedBillData.bill_id,
            },
          });
          response = {
            ...response?.data?.data,
            ...response?.data?.data?.jobBill,
            model: JOB_TAKA_BILL_MODEL
          };
          delete response.jobBill;
          return response;

        case RECEIVE_SIZE_BEAM_BILL_MODEL:
          response = await getReceiveSizeBeamBillByIdRequest({
            id: selectedBillData.bill_id,
            params: {
              company_id: companyId,
            },
          });
          response = {
            ...response?.data?.data,
            ...response?.data?.data?.receive,
            model : RECEIVE_SIZE_BEAM_BILL_MODEL
          };
          delete response.receive;
          return response;

        case GENRAL_PURCHASE_BILL_MODEL:
          response = await getGeneralPurchaseByIdRequest({
            id: selectedBillData.bill_id,
            params: { company_id: companyId },
          });
          response = {
            ...response?.data?.data,
            ...response?.data?.data?.generalPurchaseEntry,
            model: GENRAL_PURCHASE_BILL_MODEL
          };
          delete response.generalPurchaseEntry;
          return response;

        case PURCHASE_TAKA_BILL_MODEL:
          response = await getPurchaseTakaBillByIdRequest({
            params: {
              company_id: companyId,
              challan_id: selectedBillData.bill_id,
            },
          });
          response = {
            ...response?.data?.data,
            ...response?.data?.data?.purchaseBill,
            model: PURCHASE_TAKA_BILL_MODEL
          };
          delete response.purchaseBill;
          return response;

        case JOB_REWORK_BILL_MODEL:
          response = await getReworkChallanListRequest({
            id: selectedBillData.bill_id,
            params: {
              company_id: companyId,
              bill_id: selectedBillData.bill_id, 
              page: 0 ,
              pageSize: 10
            },
          });
          return {
            ...response?.data?.data?.rows[0], 
            model: JOB_REWORK_BILL_MODEL
          };

        default:
          return response;
      }
    },
    enabled: Boolean(companyId && bill_id),
  });

  useEffect(() => {
    if (billData && Object.keys(billData)) {
      let supplier = extractSupplierInformation(billData, billData?.model)  ; 
      setSuplierInformation(supplier?.supplier) ; 
      setBillInformation(supplier?.bill) ; 

      let billInfo = supplier?.bill ; 

      setValue("supplier_id", supplier?.supplier?.supplier_id);
      setValue("quality_id", billInfo?.quality_id);
      setValue("SGST_value", billInfo?.SGST_value);
      setValue("CGST_value", billInfo?.CGST_value);
      setValue("IGST_value", billInfo?.IGST_value);
      setValue("invoice_number", billInfo?.bill_no);
      setValue("total_taka", billInfo?.total_taka);
      setValue("total_meter", billInfo?.total_meter);
      setValue("rate", billInfo?.rate || 0) ; 
      setValue("yarn_company_id", billInfo?.yarn_company_id)
    }
  }, [billData, setValue]);

  function disabledFutureDate(current) {
    return current && current > moment().endOf("day");
  }

  useEffect(() => {
    console.log(billList);
    
  }, [billList]); 

  useEffect(() => {
    console.log("Bill data information");
    console.log(billData);
    
  }, [billData])

  return (
    <Form>
      <table className="credit-note-table">
        <tbody>
          <tr>
            <td colSpan={3} width={"33.33%"}>
              <div className="year-toggle">
                <Typography.Text style={{ fontSize: 20 }}>
                  Debit Note No.
                </Typography.Text>
                <div style={{
                  fontWeight: 600,
                  color: "red",
                  fontSize: 16
                }}>{debitNoteLastNumber?.debitNoteNumber || ""}</div>
              </div>
            </td>
            <td colSpan={3} width={"33.33%"}>
              <div className="year-toggle">
                <label style={{ textAlign: "left" }}>Date:</label>
                <Form.Item
                  label=""
                  name="date"
                  validateStatus={errors.date ? "error" : ""}
                  help={errors.date && errors.date.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name="date"
                    render={({ field }) => (
                      <DatePicker
                        {...field}
                        name="date"
                        className="width-100"
                        disabledDate={disabledFutureDate}
                      />
                    )}
                  />
                </Form.Item>
              </div>
            </td>
            <td colSpan={3} width={"33.33%"}>
              <div className="year-toggle">
                <Form.Item
                  label=""
                  name="is_current"
                  style={{ marginBottom: 5 }}
                >
                  <Controller
                    control={control}
                    name="is_current"
                    render={({ field }) => (
                      <Radio.Group {...field}>
                        <Radio value={1}>
                          <Tag color={CURRENT_YEAR_TAG_COLOR}>
                            Current Year
                          </Tag>
                        </Radio>
                        <Radio value={0}>
                          <Tag color={PREVIOUS_YEAR_TAG_COLOR}>
                            Previous Year
                          </Tag>
                        </Radio>
                      </Radio.Group>
                    )}
                  />
                </Form.Item>
                <Form.Item
                  label=""
                  name="bill_id"
                  validateStatus={errors.bill_id ? "error" : ""}
                  help={errors.bill_id && errors.bill_id.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                  style={{ marginBottom: 5 }}
                >
                  <Controller
                    control={control}
                    name="bill_id"
                    render={({ field }) => (
                      <Select
                        {...field}
                        placeholder="Select Bill"
                        style={{
                          textTransform: "capitalize",
                        }}
                        dropdownStyle={{
                          textTransform: "capitalize",
                        }}
                      >
                        {billList?.result?.map((item) => (
                          <Select.Option key={`${item?.model}***${item?.bill_id}`} value={`${item?.model}***${item?.bill_id}`}>
                            <div style={{ display: "flex", alignItems: "center"}}>
                              <span style={{ fontWeight: 600 }}>{item.bill_no}</span>
                              <Tag
                                color={{
                                  general_purchase_entries: SALE_TAG_COLOR,
                                  yarn_bills: YARN_SALE_BILL_TAG_COLOR,
                                  job_rework_bill: JOB_TAG_COLOR,
                                  receive_size_beam_bill: BEAM_RECEIVE_TAG_COLOR,
                                  purchase_taka_bills: PURCHASE_TAG_COLOR,
                                  job_taka_bills: JOB_TAG_COLOR,
                                }[item?.model] || "default"}
                                style={{ marginLeft: "8px" }}
                              >
                                {{
                                  general_purchase_entries: GENERAL_PURCHASE_MODEL_NAME,
                                  yarn_bills: YARN_RECEIVE_MODEL_NAME,
                                  job_rework_bill: JOB_REWORK_MODEL_NAME,
                                  receive_size_beam_bill: RECEIVE_SIZE_BEAM_MODEL_NAME,
                                  purchase_taka_bills: PURCHASE_TAKA_MODEL_NAME,
                                  job_taka_bills: JOB_TAKA_MODEL_NAME,
                                }[item?.model] || "Default"}
                              </Tag>
                            </div>
                          </Select.Option>
                        ))}
                      </Select>
                    )}
                  />
                </Form.Item>
              </div>
            </td>
          </tr>
          <tr width="50%">
            <td colSpan={4}>
              <div className="credit-note-info-title">
                <span>GSTIN/UIN:</span> {company?.gst_no || ""}
              </div>
              <div className="credit-note-info-title">
                <span>State Name:</span> {company?.state || ""}
              </div>
              <div className="credit-note-info-title">
                <span>PinCode: </span> {company?.pincode || ""}
              </div>
              <div className="credit-note-info-title">
                <span>Contact:</span> {company?.company_contact || ""}
              </div>
              <div className="credit-note-info-title">
                <span>Email:</span> {company?.company_email || ""}
              </div>
            </td>
            <td colSpan={4}>
              <SupplierInformationComp
                supplier={ supplierInformation}
              />
            </td>
          </tr>
        </tbody>
      </table>
      <table className="credit-note-table">
        <thead style={{ fontWeight: 600 }}>
          <tr>
            <td style={{ width: "50px" }}>SL No.</td>
            <td colSpan={2}>Particulars</td>
            <td>Quantity</td>
            <td>Rate</td>
            <td>Per</td>
            <td style={{ width: "100px" }}>Amount</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td colSpan={2}>Claim On Purchase</td>
            <td></td>
            <td style={{verticalAlign: "top"}}>
              <div>
                <div>
                  <span style={{fontWeight: 600}}>Rate :</span> {billInformation?.rate || 0}
                </div>
                <div>
                  <span style={{fontWeight: 600}}>Bill Amount (Exl. GST)</span> {billInformation?.bill_amount}
                </div>
                <div>
                  <span style={{fontWeight: 600, color: "blue"}}>Bill Amount (With. GST)</span> {billInformation?.bill_net_amount}
                </div>
              </div>
            </td>
            <td></td>

            <td>
              <Form.Item
                label=""
                name="amount"
                validateStatus={errors.amount ? "error" : ""}
                // help={errors.amount && errors.amount.message}
                required={true}
                wrapperCol={{ sm: 24 }}
                style={{ marginBottom: 5 }}
              >
                <Controller
                  control={control}
                  name="amount"
                  render={({ field }) => <Input {...field} placeholder="12" />}
                />
              </Form.Item>
            </td>
          </tr>
          <tr>
            <td></td>
            <td colSpan={2} style={{ textAlign: "right" }}>
              <div style={{fontWeight: 600}}>SGST @ {SGST_value} %</div>
              <div style={{fontWeight: 600}}>CGST @ {CGST_value} %</div>
              <div style={{fontWeight: 600}}>IGST @ {IGST_value}%</div>
              <div>Round Off</div>
            </td>
            <td></td>
            <td></td>
            <td></td>
            <td>
              <div>{SGST_amount}</div>
              <div>{CGST_amount}</div>
              <div>{IGST_amount}</div>
              <div>{round_off_amount}</div>
            </td>
          </tr>
          <tr>
            <td></td>
            <td colSpan={2}>
              <b>Total</b>
            </td>
            <td></td>
            <td></td>
            <td></td>
            <td style={{
              fontWeight: 600
            }}>{net_amount}</td>
          </tr>
          <tr>
            <td colSpan={8}>
              <Flex
                justify="space-between"
                style={{ width: "100%" }}
                className="mt-3"
              >
                <div>
                  <div>
                    <span style={{ fontWeight: 600 }}>
                      Amount Chargable(in words):
                    </span>{" "}
                    {toWords.convert(net_amount || 0)}
                  </div>
                  <div>
                    <span style={{ fontWeight: "500" }}>Remarks:</span>
                  </div>
                </div>
                <div>E & O.E</div>
              </Flex>
              <Flex
                justify="space-between"
                style={{ width: "100%" }}
                className="mt-3"
              >
                <div></div>
                <div>
                  <div>For,</div>
                  <div>.................................................</div>
                  <div>Authorized Signatory</div>
                </div>
              </Flex>
            </td>
          </tr>
        </tbody>
      </table>

      <Flex
        gap={12}
        justify="flex-end"
        style={{
          marginTop: "1rem",
          alignItems: "center",
          width: "100%",
          justifyContent: "flex-end",
          gap: "1rem",
          marginBottom: 10,
        }}
      >
        <Button
          type="primary"
          onClick={handleSubmit(onSubmit)}
          loading={isPending}
        >
          Generate
        </Button>
        <Button onClick={handleClose}>Close</Button>
      </Flex>
    </Form>
  );
};

export default ClaimNoteForm;
