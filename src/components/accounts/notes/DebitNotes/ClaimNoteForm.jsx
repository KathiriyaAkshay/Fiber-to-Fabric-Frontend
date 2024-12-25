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
} from "antd";
import { Controller, useForm } from "react-hook-form";
import {
  createDebitNoteRequest,
  getDebitNoteBillDropDownRequest,
  getLastDebitNoteNumberRequest,
} from "../../../../api/requests/accounts/notes";
import { useContext, useEffect } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import dayjs from "dayjs";
import { getYarnReceiveBillByIdRequest } from "../../../../api/requests/purchase/yarnReceive";
import { getJobTakaBillByIdRequest } from "../../../../api/requests/job/bill/jobBill";
import {
  getGeneralPurchaseByIdRequest,
  getReceiveSizeBeamBillByIdRequest,
} from "../../../../api/requests/purchase/purchaseSizeBeam";
import { getPurchaseTakaBillByIdRequest } from "../../../../api/requests/purchase/bill";
import { getReworkChallanByIdRequest } from "../../../../api/requests/job/challan/reworkChallan";
import { ToWords } from "to-words";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

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
  // company_id: yup.string().required("Please select company"),
  // debit_note_no: yup.string().required("Please enter debit note number"),
  // invoice_number: yup.string().required("Please enter invoice number"),
  supplier_id: yup.string().required("Please select supplier"),
  date: yup.string().required("Please enter date"),
  // particular: yup.string().required("Please enter particular"),
  // hsn_code: yup.string().required("Please enter hsn code"),
  amount: yup.string().required("Please enter amount"),
  bill_id: yup.string().required("Please select bill"),
  // bill_id: yup
  //   .array()
  //   .min(1, "Please select bill.")
  //   .required("Please select bill."),
});

const ClaimNoteForm = ({ type, handleClose }) => {
  const queryClient = useQueryClient();
  const { companyId, company } = useContext(GlobalContext);

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
    const selectedBillData = billList?.result?.find(
      (item) => item.bill_id + "_" + item.model === data?.bill_id
    );

    const payload = {
      supplier_id: billData?.supplier_id,
      model: selectedBillData?.model,
      debit_note_number: debitNoteLastNumber?.debitNoteNumber || "",
      debit_note_type: type,
      // sale_challan_id: 456,
      quality_id: data?.quality_id,
      // gray_order_id: 321,
      // party_id: 654,
      // return_id: 987,
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
      // net_rate: 6.67,
      // tcs_value: 0.75,
      // tcs_amount: 11.25,
      // extra_tex_value: 1.0,
      // extra_tex_amount: 15.0,
      createdAt: dayjs(data.date).format("YYYY-MM-DD"),
      debit_note_details: [
        {
          bill_id: selectedBillData.bill_id,
          model: selectedBillData?.model,
          rate: +data.rate,
          per: 1.0,
          invoice_no: data?.invoice_number,
          particular_name: "Claim On Purchase",
          quality: billData?.inhouse_quality?.quality_weight,
          amount: +data.amount,
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

      //
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

      const netAmount =
        +amount + +SGSTAmount + +CGSTAmount + +IGSTAmount + +round_off_amount;

      setValue("net_amount", netAmount.toFixed(2));
    }
  }, [CGST_value, IGST_value, SGST_value, amount, round_off_amount, setValue]);

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
        supplier_id: 0,
        is_current,
      };
      const response = await getDebitNoteBillDropDownRequest({ params });
      return response?.data?.data || [];
    },
    enabled: Boolean(companyId),
  });

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
      const selectedBillData = billList?.result?.find(
        (item) => item.bill_id + "_" + item.model === bill_id
      );

      switch (selectedBillData.model) {
        case "yarn_bills":
          response = await getYarnReceiveBillByIdRequest({
            id: selectedBillData.bill_id,
            params: { company_id: companyId },
          });
          response = {
            ...response?.data?.data,
            ...response?.data?.data?.yarnReciveBill,
          };
          delete response.yarnReciveBill;
          return response;

        case "job_taka_bills":
          response = await getJobTakaBillByIdRequest({
            params: {
              company_id: companyId,
              bill_id: selectedBillData.bill_id,
            },
          });
          response = {
            ...response?.data?.data,
            ...response?.data?.data?.jobBill,
          };
          delete response.jobBill;
          return response;

        case "receive_size_beam_bill":
          response = await getReceiveSizeBeamBillByIdRequest({
            id: selectedBillData.bill_id,
            params: {
              company_id: companyId,
            },
          });
          response = {
            ...response?.data?.data,
            ...response?.data?.data?.receive,
          };
          delete response.receive;
          return response;

        case "general_purchase_entries":
          response = await getGeneralPurchaseByIdRequest({
            id: selectedBillData.bill_id,
            params: { company_id: companyId },
          });
          response = {
            ...response?.data?.data,
            ...response?.data?.data?.generalPurchaseEntry,
          };
          delete response.generalPurchaseEntry;
          return response;

        case "purchase_taka_bills":
          response = await getPurchaseTakaBillByIdRequest({
            params: {
              company_id: companyId,
              challan_id: selectedBillData.bill_id,
            },
          });
          response = {
            ...response?.data?.data,
            ...response?.data?.data?.purchaseBill,
          };
          delete response.purchaseBill;
          return response;

        case "job_rework_bill":
          response = await getReworkChallanByIdRequest({
            id: selectedBillData.bill_id,
            params: {
              company_id: companyId,
            },
          });
          return response?.data?.data;

        default:
          return response;
      }
    },
    enabled: Boolean(companyId && bill_id),
  });

  useEffect(() => {
    if (billData && Object.keys(billData)) {
      setValue("supplier_id", billData?.supplier_id);
      // setValue("sale_challan_id", billData?.supplier_id);
      setValue("quality_id", billData?.inhouse_quality_id);

      setValue("SGST_value", billData?.SGST_value);
      // setValue("SGST_amount", billData?.SGST_amount);
      setValue("CGST_value", billData?.CGST_value);
      // setValue("CGST_amount", billData?.CGST_amount);
      setValue("IGST_value", billData?.IGST_value);
      // setValue("IGST_amount", billData?.IGST_amount);
      setValue("round_off_amount", billData?.round_off);
      setValue("net_amount", billData?.net_amount);
      setValue("rate", billData?.rate);
      setValue("invoice_number", billData?.invoice_number);

      setValue("total_taka", billData?.total_taka);
      setValue("total_meter", billData?.total_meter);
      setValue("discount_value", billData?.discount_value);
      setValue("discount_amount", billData?.discount_amount);
    }
  }, [billData, setValue]);

  return (
    <Form>
      <table className="credit-note-table">
        <tbody>
          {/* <tr>
            <td colSpan={8} className="text-center">
              <h2>Claim Note</h2>
            </td>
          </tr> */}
          <tr>
            <td colSpan={3} width={"33.33%"}>
              {/* <div className="p-2">
                
                <div>{debitNoteLastNumber?.debitNoteNumber || "-"}</div>
              </div> */}
              <div className="year-toggle">
                <Typography.Text style={{ fontSize: 20 }}>
                  Debit Note No.
                </Typography.Text>
                <div>{debitNoteLastNumber?.debitNoteNumber || ""}</div>
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
                        <Radio value={1}>Current Year</Radio>
                        <Radio value={0}>Previous Year</Radio>
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
                        options={
                          billList && billList.result.length
                            ? billList?.result?.map((item) => {
                                return {
                                  label: item?.bill_no,
                                  value: item.bill_id + "_" + item.model,
                                };
                              })
                            : []
                        }
                        style={{
                          textTransform: "capitalize",
                        }}
                        dropdownStyle={{
                          textTransform: "capitalize",
                        }}
                      />
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
              <div className="credit-note-info-title">
                <span>Party:</span> {billData?.supplier?.supplier_name || ""}
              </div>
              <div className="credit-note-info-title">
                <span>GSTIN/UIN:</span> {billData?.supplier?.user?.gst_no || ""}
              </div>
              <div className="credit-note-info-title">
                <span>PAN/IT No:</span> {billData?.supplier?.user?.pancard_no}
              </div>
              <div className="credit-note-info-title">
                <span>State Name:</span>{" "}
              </div>
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
            <td></td>
            <td colSpan={2}>Claim On Purchase</td>
            <td></td>
            <td></td>
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
              <div>SGST @ {SGST_value} %</div>
              <div>CGST @ {CGST_value} %</div>
              <div>IGST @ {IGST_value}%</div>
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
            <td>{net_amount}</td>
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
                    <span style={{ fontWeight: "500" }}>
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
