import {
  Button,
  DatePicker,
  Flex,
  Form,
  Input,
  message,
  Select,
  Typography,
  Tag
} from "antd";
import { useContext, useEffect, useMemo, useState } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createDebitNoteRequest,
  debitNoteDropDownRequest,
  getDebitNoteBillDropDownRequest,
  getLastDebitNoteNumberRequest,
} from "../../../../api/requests/accounts/notes";
import dayjs from "dayjs";
import { Controller, useForm } from "react-hook-form";
import { getGeneralPurchaseByIdRequest, getReceiveSizeBeamBillByIdRequest } from "../../../../api/requests/purchase/purchaseSizeBeam";
import { getJobTakaBillByIdRequest } from "../../../../api/requests/job/bill/jobBill";
import { getYarnReceiveBillByIdRequest } from "../../../../api/requests/purchase/yarnReceive";
import { getSupplierListRequest } from "../../../../api/requests/users";
import { ToWords } from "to-words";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { getFinancialYearEnd } from "../../../../pages/accounts/reports/utils";
import { JOB_TAG_COLOR, PURCHASE_TAG_COLOR } from "../../../../constants/tag";
import { SALE_TAG_COLOR, YARN_SALE_BILL_TAG_COLOR, BEAM_RECEIVE_TAG_COLOR } from "../../../../constants/tag";
import moment from "moment";
import { getPurchaseTakaBillByIdRequest } from "../../../../api/requests/purchase/bill";
import { getReworkChallanByIdRequest, getReworkChallanListRequest } from "../../../../api/requests/job/challan/reworkChallan";
import { GENERAL_PURCHASE_MODEL_NAME, GENRAL_PURCHASE_BILL_MODEL, JOB_REWORK_BILL_MODEL, JOB_REWORK_MODEL_NAME, JOB_TAKA_BILL_MODEL, JOB_TAKA_MODEL_NAME, PURCHASE_TAKA_BILL_MODEL, PURCHASE_TAKA_MODEL_NAME, RECEIVE_SIZE_BEAM_BILL_MODEL, RECEIVE_SIZE_BEAM_MODEL_NAME, YARN_RECEIVE_BILL_MODEL, YARN_RECEIVE_MODEL_NAME } from "../../../../constants/bill.model";
import SupplierInformationComp from "./supplierInformationComp";
import { extractSupplierInformation } from "../../../../utils/supplier.handler";

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
  company_id: yup.string().required("Please select company"),
  supplier_id: yup.string().required("Please select supplier"),
  date: yup.string().required("Please enter date"),
  bill_id: yup
    .array()
    .min(1, "Please select bill.")
    .required("Please select bill."),
});

const DiscountNoteForm = ({ type, handleClose }) => {
  const { companyListRes } = useContext(GlobalContext);
  const [numOfBill, setNumOfBill] = useState([]);
  const [supplierInformation, setSupplierInformation] = useState({}) ; 

  // Debit note creation related handler ================================
  const { mutateAsync: addDebitClaimNOte, isPending } = useMutation({
    mutationFn: async ({ data, companyId }) => {
      const res = await createDebitNoteRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["add", "debit", "discount-note"],
    onSuccess: (res) => {
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


  const {
    control,
    handleSubmit,
    watch,
    resetField,
    setValue,
    formState: { errors },
    getValues,
    reset,
  } = useForm({
    defaultValues: {
      company_id: null,
      date: dayjs(),
      bill_id: null,
      supplier_id: null,
      sale_challan_id: "",
      quality_id: "",
      SGST_value: 6,
      SGST_amount: 0,
      CGST_value: 6,
      CGST_amount: 0,
      IGST_value: 0,
      IGST_amount: 0,
      round_off_amount: "",
      net_amount: "",
      invoice_number: "",
    },
    resolver: yupResolver(validationSchema),
  });

  const currentValue = watch();
  const {
    company_id,
    supplier_id,
    SGST_amount,
    CGST_amount,
    IGST_amount,
    net_amount,
    round_off_amount
  } = currentValue;

  useEffect(() => {
    if (supplier_id) {
      resetField("bill_id");
      setNumOfBill([]);
    }
  }, [resetField, supplier_id]);


  // Get Last debit note information related api ===================
  const { data: debitNoteLastNumber } = useQuery({
    queryKey: [
      "get",
      "debit-notes",
      "last-number",
      {
        company_id: company_id,
      },
    ],
    queryFn: async () => {
      const params = {
        company_id: company_id,
      };
      const response = await getLastDebitNoteNumberRequest({ params });
      return response.data.data;
    },
    enabled: Boolean(company_id),
  });

  // Get Supplier dropdown related api  ===========================
  const { data: supplierListRes, isLoading: isLoadingSupplierList } = useQuery({
    queryKey: ["supplier", "list", { company_id }],
    queryFn: async () => {
      const res = await getSupplierListRequest({
        params: { company_id },
      });
      return res.data?.data?.supplierList;
    },
    enabled: Boolean(company_id),
  });

  // Get bill number selecion related api
  const { data: saleBillList, isLoadingSaleBillList } = useQuery({
    queryKey: [
      "saleBill",
      "list",
      {
        company_id: company_id,
        supplier_id: supplier_id,
        end: getFinancialYearEnd("current")
      },
    ],
    queryFn: async () => {
      const params = {
        company_id: company_id,
        page: 0,
        pageSize: 99999,
        end: getFinancialYearEnd("current"),
        type: "discount_note",
        supplier_id: supplier_id
      };
      const res = await debitNoteDropDownRequest({ params });
      return res.data?.data;
    },
    enabled: Boolean(company_id && supplier_id),
  });

  // Supplier selection related handler 
  const selectedCompany = useMemo(() => {
    if (company_id) {
      return companyListRes?.rows?.find(({ id }) => id === company_id);
    }
  }, [company_id, companyListRes]);

  const selectedSupplierCompany = useMemo(() => {
    if (supplier_id) {
      return supplierListRes?.rows?.find(({ id }) => id === supplier_id);
      
    }
  }, [supplierListRes, supplier_id]);

  const calculateTaxAmount = () => {
    let totalAmount = 0;
    let totalNetAmount = 0;
    numOfBill.forEach((_, index) => {
      const amount = getValues(`amount_${index}`);
      totalAmount += +amount;
    });

    const SGSTValue = +getValues("SGST_value");
    if (SGSTValue) {
      const SGSTAmount = (+totalAmount * +SGSTValue) / 100;
      setValue("SGST_amount", SGSTAmount.toFixed(2));
      totalNetAmount += +SGSTAmount;
    }

    const CGSTValue = +getValues("CGST_value");
    if (CGSTValue) {
      const CGSTAmount = (+totalAmount * +CGSTValue) / 100;
      setValue("CGST_amount", CGSTAmount.toFixed(2));
      totalNetAmount += +CGSTAmount;
    }

    const IGSTValue = +getValues("IGST_value");
    if (IGSTValue) {
      const IGSTAmount = (+totalAmount * +IGSTValue) / 100;
      setValue("IGST_amount", IGSTAmount.toFixed(2));
      totalNetAmount += +IGSTAmount;
    }

    totalNetAmount += totalAmount;
    let final_net_amount = Math.round(totalNetAmount) ; 
    let round_off_value = +final_net_amount - +totalNetAmount ;  
    setValue("net_amount", final_net_amount.toFixed(2));
    setValue("round_off_amount", round_off_value.toFixed(2)) ; 
  };


  function disabledFutureDate(current) {
    return current && current > moment().endOf("day");
  }

  const onSubmit = async (data) => {
    let temp_debit_note_number = String(debitNoteLastNumber?.debitNoteNumber || "DNP-0").split("-")[1] ; 
    temp_debit_note_number = `DNP-${+temp_debit_note_number + 1}` ; 
    let hasError = false ; 

    numOfBill.map((_, index) => {
      if (data[`per_${index}`] == "" || data[`per_${index}`] == undefined){
        message.warning("Per amount is required") ; 
        hasError = true; 
        return ; 
      }

      if (data[`amount_${index}`] == "" || data[`amount_${index}`] == undefined){
        message.warning("Bill amount is required") ; 
        hasError = true ; 
        return ; 
      }
    })

    if (!hasError){
      let temp_total_meter = 0 ; 
      let temp_total_taka = 0 ; 

      numOfBill.map((_, index) => {
        temp_total_meter = +temp_total_meter + +data[`total_meter_${index}`] ; 
        temp_total_taka  = +temp_total_taka + data[`total_taka_${index}`] ; 
      })

      const payload = {
        debit_note_number: temp_debit_note_number || "",
        debit_note_type: type,
        supplier_id: data?.supplier_id,
        SGST_value: +data.SGST_value,
        SGST_amount: +data.SGST_amount,
        CGST_value: +data.CGST_value,
        CGST_amount: +data.CGST_amount,
        IGST_value: +data.IGST_value,
        IGST_amount: +data.IGST_amount,
        round_off_amount: +data.round_off_amount,
        net_amount: +data.net_amount,
        createdAt: dayjs(data.date).format("YYYY-MM-DD"),
        total_taka: temp_total_taka, 
        total_meter: temp_total_meter ,
        debit_note_details: numOfBill.map((_, index) => {
          return {
            bill_id: data[`bill_id_${index}`],
            model: data[`model_${index}`],
            rate: +data[`rate_${index}`],
            per: +data[`per_${index}`],
            invoice_no: data[`bill_number_${index}`],
            particular_name: "Discount On Purchase",
            quantity: +data[`quantity_${index}`],
            amount: +data[`amount_${index}`],
            quality_id: +data[`quality_id_${index}`]
          };
        }),
      };
      await addDebitClaimNOte({ data: payload, companyId: data.company_id });
    }
  };


  return (
    <>
      <table className="credit-note-table">
        <tbody>
          <tr>
            <td colSpan={8} className="text-center">
              {/* <h2>Discount Note</h2> */}
              <div className="year-toggle">
                <Typography.Text style={{ fontSize: 20 }}>
                  Discount Note No.
                </Typography.Text>
                <div style={{
                  color: "red"
                }}>{debitNoteLastNumber?.debitNoteNumber || ""}</div>
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={2} width={"25%"}>
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
                      <DatePicker {...field} disabledDate={disabledFutureDate} className="width-100" />
                    )}
                  />
                </Form.Item>
              </div>
            </td>
            <td colSpan={2} width={"25%"}>
              <div className="year-toggle">
                <label style={{ textAlign: "left" }}>Company:</label>
                <Form.Item
                  label=""
                  name="company_id"
                  validateStatus={errors.company_id ? "error" : ""}
                  help={errors.company_id && errors.company_id.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name="company_id"
                    render={({ field }) => (
                      <Select
                        {...field}
                        className="width-100"
                        placeholder="Select Company"
                        style={{
                          textTransform: "capitalize",
                        }}
                        dropdownStyle={{
                          textTransform: "capitalize",
                        }}
                        options={companyListRes.rows.map((company) => {
                          return {
                            label: company?.company_name,
                            value: company?.id,
                          };
                        })}
                      />
                    )}
                  />
                </Form.Item>
              </div>
            </td>
            <td colSpan={2} width={"25%"}>
              <div className="year-toggle">
                <label style={{ textAlign: "left" }}>Supplier Company:</label>
                <Form.Item
                  label=""
                  name="supplier_id"
                  validateStatus={errors.supplier_id ? "error" : ""}
                  help={errors.supplier_id && errors.supplier_id.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name="supplier_id"
                    render={({ field }) => (
                      <Select
                        {...field}
                        className="width-100"
                        placeholder="Select Company"
                        loading={isLoadingSupplierList}
                        style={{
                          textTransform: "capitalize",
                        }}
                        dropdownStyle={{
                          textTransform: "capitalize",
                        }}
                        options={supplierListRes?.rows?.map((item) => {
                          return {
                            label: item?.supplier?.supplier_company,
                            value: item?.id,
                          };
                        })}
                      />
                    )}
                  />
                </Form.Item>
              </div>
            </td>
            <td colSpan={2} width={"25%"}>
              <div className="year-toggle">
                <label style={{ textAlign: "left" }}>Bill:</label>
                <Form.Item
                  label=""
                  name="bill_id"
                  validateStatus={errors.bill_id ? "error" : ""}
                  help={errors.bill_id && errors.bill_id.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name="bill_id"
                    render={({ field }) => (
                      <Select
                        {...field}
                        className="width-100"
                        placeholder="Select Company"
                        mode="multiple"
                        style={{
                          textTransform: "capitalize",
                        }}
                        dropdownStyle={{
                          textTransform: "capitalize",
                        }}
                        loading = {isLoadingSaleBillList}
                        onChange={(selectedValue) => {
                          const selectedModels = selectedValue.map((value) => value.split("***")[0].slice(1)); // Extract model from value
                          const isValidSelection = selectedModels.every((model) => model === selectedModels[0]);

                          if (isValidSelection) {
                            setValue("bill_id", selectedValue);
                            setNumOfBill(selectedValue.map((item) => item));
                          } else {
                            message.warning("You can only select items of the same type.")
                          }
                        }}
                      >
                        {saleBillList?.result?.map((item) => (
                          <Select.Option key={`${item?.model}***${item?.bill_id}`} value={`${item?.model}***${item?.bill_id}`}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
              <b >{selectedCompany?.company_name || ""}</b>
              <div>
                {selectedCompany?.address_line_1 || ""}
                {selectedCompany?.address_line_2 || ""}
              </div>
              <div className="credit-note-info-title">
                <span>GSTIN/UIN:</span> {selectedCompany?.gst_no || ""}
              </div>
              <div className="credit-note-info-title">
                <span>State Name:</span> {selectedCompany?.state || ""}
              </div>
              <div className="credit-note-info-title">
                <span>PinCode: </span>
                {selectedCompany?.pincode || ""}
              </div>
              <div className="credit-note-info-title">
                <span>Contact: </span>
                {selectedCompany?.company_contact || ""}
              </div>
              <div className="credit-note-info-title">
                <span>Email: </span>
                {selectedCompany?.company_email || ""}
              </div>
            </td>
            <td colSpan={4}>
              <SupplierInformationComp
                supplier={supplierInformation}
              />
            </td>
          </tr>
        </tbody>
      </table>
      <table className="credit-note-table">
        <thead style={{ fontWeight: 600 }}>
          <tr>
            <td>SL No.</td>
            <td colSpan={3} style={{ minWidth: "400px" }}>
              Particulars
            </td>
            <td>Quantity</td>
            <td>Rate</td>
            <td style={{ width: "100px" }}>Per</td>
            <td style={{ width: "150px" }}>Amount</td>
          </tr>
        </thead>
        <tbody>
          {numOfBill && numOfBill.length
            ? numOfBill.map((id, index) => {
              return (
                <SingleBillRender
                  key={index}
                  index={index}
                  billId={id}
                  control={control}
                  company_id={company_id}
                  billList={saleBillList?.result}
                  setValue={setValue}
                  calculateTaxAmount = {calculateTaxAmount}
                  setSupplierInformation = {setSupplierInformation}
                  supplierInformation = {supplierInformation}
                  getValues = {getValues}
                />
              );
            })
            : null}
          <tr>
            <td></td>
            <td colSpan={3}>
              <div style={{ marginBottom: "6px" }}>
                <span style={{fontWeight: 600}}>SGST @{" "}</span>
                <Controller
                  control={control}
                  name="SGST_value"
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="3"
                      style={{ width: "100px" }}
                      onChange={(e) => {
                        setValue("SGST_value", +e.target.value);
                        calculateTaxAmount();
                      }}
                    />
                  )}
                />{" "}
                %
              </div>
              <div style={{ marginBottom: "6px" }}>
                <span style={{fontWeight: 600}}>CGST @{" "}</span>
                <Controller
                  control={control}
                  name="CGST_value"
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="3"
                      style={{ width: "100px" }}
                      onChange={(e) => {
                        setValue("CGST_value", +e.target.value);
                        calculateTaxAmount();
                      }}
                    />
                  )}
                />{" "}
                %
              </div>
              <div style={{ marginBottom: "6px" }}>
                <span style={{fontWeight: 600}}>IGST @{" "}</span>
                <Controller
                  control={control}
                  name="IGST_value"
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="3"
                      style={{ width: "100px" }}
                      onChange={(e) => {
                        setValue("IGST_value", +e.target.value);
                        calculateTaxAmount();
                      }}
                    />
                  )}
                />{" "}
                %
              </div>
              <div>Round Off</div>
            </td>
            <td></td>
            <td></td>
            <td></td>
            <td>
              <div>{SGST_amount}</div>
              <div>{CGST_amount}</div>
              <div>{IGST_amount}</div>
              <div>{round_off_amount || "0"}</div>
            </td>
          </tr>
          <tr>
            <td></td>
            <td colSpan={3} style={{
              fontWeight: 600
            }}>Total</td>
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
    </>
  );
};

export default DiscountNoteForm;

const SingleBillRender = ({
  billId,
  index,
  control,
  company_id,
  billList,
  setValue,
  calculateTaxAmount, 
  setSupplierInformation, 
  supplierInformation, 
  getValues
}) => {

  const [billInformation, setBillInformation] = useState({}) ; 

  // Receive paricular bill information //
  const { data: billData } = useQuery({
    queryKey: [
      "get",
      "selected-bill",
      "data",
      {
        company_id: company_id,
        bill_id: billId,
      },
    ],
    queryFn: async () => {
      let response;
      let temp_model_name = String(billId).split("***")[0];
      let temp_model_id = String(billId).split("***")[1];
      const selectedBillData = {
        model: temp_model_name,
        bill_id: temp_model_id
      }
      switch (selectedBillData.model) {
        case YARN_RECEIVE_BILL_MODEL:
          response = await getYarnReceiveBillByIdRequest({
            id: selectedBillData.bill_id,
            params: { company_id: company_id },
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
              company_id: company_id,
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
              company_id: company_id,
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
            params: { company_id: company_id },
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
              company_id: company_id,
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
    enabled: Boolean(company_id && billId),
  });

  const calculateAmount = (per) => {
    try {
      let rateValue = +getValues(`rate_${index}`) ; 
      if (rateValue !== undefined && rateValue !== null && rateValue != ""){
        const amount =
          ((billInformation?.total_meter || 0) * (rateValue || 0) * per) / 100;
        setValue(`amount_${index}`, amount.toFixed(2));
        calculateTaxAmount() ; 
      }
    } catch (error) {
      
    }
  };

  useEffect(() => {
    if (
      billData &&
      Object.keys(billData).length &&
      billList &&
      billList?.length
    ) {
      let temp_model_name = String(billId).split("***")[0];
      let temp_model_id = String(billId).split("***")[1];
      const selectedBillData = {
        model: temp_model_name,
        bill_id: temp_model_id
      }
      setValue(`bill_id_${index}`, selectedBillData?.bill_id);
      setValue(`model_${index}`, selectedBillData.model);

      // Reterive supplier information and Bill data information 
      let data = extractSupplierInformation(billData, billData?.model) ; 
      
      if (supplierInformation?.supplier_id == undefined){
        setSupplierInformation(data?.supplier) ; 
      }

      // Set quantity, rate and bill number information 
      setValue(`quantity_${index}`, data?.bill?.total_meter) ; 
      setValue(`rate_${index}`, data?.bill?.rate) ; 
      setValue(`bill_number_${index}`, data?.bill?.bill_no) ; 
      setBillInformation(data?.bill) ; 
      setValue(`quality_id_${index}`, data?.bill?.quality_id ) ; 
      setValue(`total_meter_${index}`, data?.bill?.total_meter) ; 
      setValue(`total_taka_${index}`, data?.bill?.total_taka) ; 

      // setValue(`quantity_${index}`, billData?.quantity || 0);
      // setValue(`rate_${index}`, billData?.rate || 0);
      // setValue(`bill_number_${index}`, billData?.receive?.bill_number || "0") ;

      // // Set SGST, CGST, IGST amount 
      // console.log(billData);
      

    }
  }, [billData, billId, billList, index, setValue]);

  return (
    <tr>
      <td style={{ textAlign: "center" }}>{index + 1}.</td>
      <td colSpan={3}>Discount On Purchase</td>
      <td>
        <Controller
          control={control}
          name={`quantity_${index}`}
          render={({ field }) => (
            <Input
              {...field}
              placeholder="3"
              className="remove-input-box"
              readOnly
              type="number"
            />
          )}
        />
        <Controller
          control={control}
          name={`bill_id_${index}`}
          render={({ field }) => (
            <Input
              {...field}
              // value={billData?.receive_quantity || 0}
              type="hidden"
              placeholder="3"
            />
          )}
        />
        <Controller
          control={control}
          name={`model_${index}`}
          render={({ field }) => (
            <Input
              {...field}
              // value={billData?.receive_quantity || 0}
              type="hidden"
              placeholder="3"
            />
          )}
        />
      </td>
      <td>
        <Controller
          control={control}
          name={`rate_${index}`}
          render={({ field }) => (
            <Input
              {...field}
              // value={billData?.quantity_rate || 0}
              placeholder="3"
              className="remove-input-box"
              type="number"
              readOnly = {+getValues(`rate_${index}`) == 0?false:true}
            />
          )}
        />
      </td>
      <td>
        <Controller
          control={control}
          name={`per_${index}`}
          render={({ field }) => (
            <Input
              {...field}
              placeholder="3"
              type="number"
              onChange={(e) => {
                setValue(`per_${index}`, e.target.value);
                calculateAmount(e.target.value);
              }}
            />
          )}
        />
      </td>
      <td>
        <Controller
          control={control}
          name={`amount_${index}`}
          rules={{required: "Amount is required"}}
          render={({ field, fieldState: { error } }) => (
            <>
              <Input {...field} placeholder="3" type="number"
                onChange={(e) => {
                  let amount = e.target.value ; 
                  let rateValue = +getValues(`rate_${index}`) ; 

                  if (amount !== undefined && amount !== null && amount !== ""){
                    if (rateValue !== undefined && rateValue !== null && rateValue !== ""){
                      setValue(`amount_${index}`, e.target.value) ; 
                      let per = (+amount * 100) / ((billInformation?.total_meter || 0) * (rateValue || 0)) ; 
                      setValue(`per_${index}`, parseFloat(per).toFixed(2)) ;
                      calculateTaxAmount() ;
                    }
                  }
                }} />
              {error && <span style={{ color: "red" }}>{error.message}</span>}
            </>
          )}
        />
      </td>
    </tr>
  );
};
