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
import { getReworkChallanByIdRequest } from "../../../../api/requests/job/challan/reworkChallan";

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
  // debit_note_no: yup.string().required("Please enter debit note number"),
  // invoice_number: yup.string().required("Please enter invoice number"),
  supplier_id: yup.string().required("Please select supplier"),
  date: yup.string().required("Please enter date"),
  // particular: yup.string().required("Please enter particular"),
  // hsn_code: yup.string().required("Please enter hsn code"),
  bill_id: yup
    .array()
    .min(1, "Please select bill.")
    .required("Please select bill."),
});

const DiscountNoteForm = ({ type, handleClose }) => {
  // const queryClient = useQueryClient();
  const { companyListRes } = useContext(GlobalContext);
  const [numOfBill, setNumOfBill] = useState([]);

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

      SGST_value: 0,
      SGST_amount: 0,
      CGST_value: 0,
      CGST_amount: 0,
      IGST_value: 0,
      IGST_amount: 0,
      round_off_amount: "",
      net_amount: "",
      // rate: "",
      invoice_number: "",
      // total_taka: "",
      // total_meter: "",
      // discount_value: "",
      // discount_amount: "",
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
  } = currentValue;

  useEffect(() => {
    if (supplier_id) {
      resetField("bill_id");
      setNumOfBill([]);
    }
  }, [resetField, supplier_id]);

  // const { data: billList } = useQuery({
  //   queryKey: [
  //     "debit-note",
  //     "bill",
  //     "list",
  //     {
  //       company_id: company_id,
  //       supplier_id: supplier_id,
  //     },
  //   ],
  //   queryFn: async () => {
  //     const params = {
  //       company_id: company_id,
  //       type: "discount_note",
  //       supplier_id: supplier_id,
  //     };
  //     const response = await getDebitNoteBillDropDownRequest({ params });
  //     return response?.data?.data || [];
  //   },
  //   enabled: Boolean(company_id && supplier_id),
  // });

  // Get Last debit note information related api 
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

  // Get Supplier dropdown related api 
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
    setValue("net_amount", totalNetAmount.toFixed(2));
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
      const payload = {
        // supplier_id: billData?.supplier_id,
        // model: selectedBillData?.model,
        debit_note_number: temp_debit_note_number || "",
        debit_note_type: type,
        // sale_challan_id: 456,
        // quality_id: data?.quality_id,
        supplier_id: data?.supplier_id,
        // gray_order_id: 321,
        // party_id: 654,
        // return_id: 987,
        // total_taka: +data.total_taka,
        // total_meter: +data.total_meter,
        // discount_value: +data.discount_value,
        // discount_amount: +data.discount_amount,
        SGST_value: +data.SGST_value,
        SGST_amount: +data.SGST_amount,
        CGST_value: +data.CGST_value,
        CGST_amount: +data.CGST_amount,
        IGST_value: +data.IGST_value,
        IGST_amount: +data.IGST_amount,
        round_off_amount: +data.round_off_amount,
        net_amount: +data.net_amount,
        // net_rate: 6.67,
        // tcs_value: 0.75,
        // tcs_amount: 11.25,
        // extra_tex_value: 1.0,
        // extra_tex_amount: 15.0,
        createdAt: dayjs(data.date).format("YYYY-MM-DD"),
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
                          <Select.Option key={item?.bill_id} value={`${item?.model}***${item?.bill_id}`}>
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
                                  general_purchase_entries: "General Purchase",
                                  yarn_bills: "Yarn Bill",
                                  job_rework_bill: "Job Rework",
                                  receive_size_beam_bill: "Receive Size Beam",
                                  purchase_taka_bills: "Purchase Taka",
                                  job_taka_bills: "Job Taka",
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
              <b>{selectedCompany?.company_name || ""}</b>
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
              <div style={{
                fontWeight: 600,
                fontSize: 16
              }}>{String(selectedSupplierCompany?.supplier?.supplier_company).toUpperCase()}</div>
              <div className="credit-note-info-title">
                <span>Supplier:</span>
                {selectedSupplierCompany?.supplier?.supplier_name || "-"}
              </div>
              <div className="credit-note-info-title">
                <span>GSTIN/UIN:</span> {selectedSupplierCompany?.gst_no || "-"}
              </div>
              <div className="credit-note-info-title">
                <span>PAN/IT No:</span>{" "}
                {selectedSupplierCompany?.pancard_no || "-"}
              </div>
              <div className="credit-note-info-title">
                <span>Email:</span> {selectedSupplierCompany?.email || "-"}
              </div>
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
                />
              );
            })
            : null}
          <tr>
            <td></td>
            <td colSpan={3}>
              <div style={{ marginBottom: "6px" }}>
                SGST @{" "}
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
                CGST @{" "}
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
                IGST @{" "}
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
              <div>0</div>
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
  calculateTaxAmount
}) => {
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
        case "yarn_bills":
          response = await getYarnReceiveBillByIdRequest({
            id: selectedBillData.bill_id,
            params: { company_id: company_id },
          });
          return response?.data?.data;
        case "job_taka_bills":
          response = await getJobTakaBillByIdRequest({
            params: {
              company_id: company_id,
              bill_id: selectedBillData.bill_id,
            },
          });
          return response?.data?.data;
        case "receive_size_beam_bill":
          response = await getReceiveSizeBeamBillByIdRequest({
            id: selectedBillData.bill_id,
            params: {
              company_id: company_id,
            },
          });
          return response?.data?.data;
        case "general_purchase_entries" :
          response = await getGeneralPurchaseByIdRequest({
            id: selectedBillData?.bill_id,
            params: {company_id: company_id}
          })
          response = {
            ...response?.data?.data,
            ...response?.data?.data?.generalPurchaseEntry,
          };
          delete response.generalPurchaseEntry;
          return response;
        case "purchase_taka_bills":
          response = await getPurchaseTakaBillByIdRequest({
            params:{
              company_id: company_id, 
              challan_id: selectedBillData?.bill_id
            }
          })
          response = {
            ...response?.data?.data,
            ...response?.data?.data?.purchaseBill,
          };
          delete response.purchaseBill;
          return response;
        case "job_rework_bill":
          response = await getReworkChallanByIdRequest({
            id: selectedBillData?.bill_id,
            params: {
              company_id: company_id
            }
          })
          return response?.data?.data ; 

          default:
          return response;
      }
    },
    enabled: Boolean(company_id && billId),
  });

  const calculateAmount = (per) => {
    const amount =
      ((billData?.quantity || 0) * (billData?.rate || 0) * per) / 100;
    setValue(`amount_${index}`, amount.toFixed(2));
    calculateTaxAmount() ; 
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

      setValue(`quantity_${index}`, billData?.quantity || 0);
      setValue(`rate_${index}`, billData?.rate || 0);
      setValue(`bill_number_${index}`, billData?.receive?.bill_number || "0") ;

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
              // value={billData?.receive_quantity || 0}
              placeholder="3"
              className="remove-input-box"
              readOnly
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
              readOnly
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
              <Input {...field} placeholder="3" />
              {error && <span style={{ color: "red" }}>{error.message}</span>}
            </>
          )}
        />
      </td>
    </tr>
  );
};
