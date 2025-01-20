import {
  Button,
  DatePicker,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Radio,
  Select,
  Typography,
  Tag
} from "antd";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import "./_style.css";
import { useContext, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import {
  createCreditNoteRequest,
  creditNoteDropDownRequest,
  getLastCreditNoteNumberRequest,
} from "../../../../api/requests/accounts/notes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSaleBillListRequest } from "../../../../api/requests/sale/bill/saleBill";
import { Controller, useForm } from "react-hook-form";
import { CloseOutlined } from "@ant-design/icons";
import { ToWords } from "to-words";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import moment from "moment";
import { getFinancialYearEnd } from "../../../../pages/accounts/reports/utils";
import { BEAM_RECEIVE_TAG_COLOR, JOB_TAG_COLOR, SALE_TAG_COLOR, YARN_SALE_BILL_TAG_COLOR } from "../../../../constants/tag";
import { CURRENT_YEAR_TAG_COLOR, PREVIOUS_YEAR_TAG_COLOR } from "../../../../constants/tag";
import { BEAM_SALE_BILL_MODEL, BEAM_SALE_MODEL_NAME, JOB_GREAY_BILL_MODEL_NAME, JOB_GREAY_SALE_BILL_MODEL, JOB_WORK_BILL_MODEL, JOB_WORK_MODEL_NAME, SALE_BILL_MODEL, SALE_BILL_MODEL_NAME, YARN_SALE_BILL_MODEL, YARN_SALE_BILL_MODEL_NAME } from "../../../../constants/bill.model";

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
  // party_id: yup.string().required("Please select party"),
  date: yup.string().required("Please enter date"),
  // particular: yup.string().required("Please enter particular"),
  // hsn_code: yup.string().required("Please enter hsn code"),
  amount: yup.string().required("Please enter amount"),
  bill_id: yup.string().required("Please select bill."),
});

const AddClaimNoteType = ({ setIsAddModalOpen, isAddModalOpen }) => {
  const queryClient = useQueryClient();
  const { companyId, company, companyListRes } = useContext(GlobalContext);

  function disabledFutureDate(current) {
    return current && current > moment().endOf("day");
  }

  // Credit note create request handler ===================
  const { mutateAsync: addCreditNote, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await createCreditNoteRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["add", "credit", "claim-note"],
    onSuccess: (res) => {
      queryClient.invalidateQueries(["get", "credit-notes", "last-number"]);
      queryClient.invalidateQueries(["get", "credit-notes", "list"]);
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      reset();
      setIsAddModalOpen(false);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(errorMessage);
    },
  });

  const onSubmit = async (data) => {
    console.log(data);
    console.log(billData);
    
    
    const payload = {
      credit_note_number: creditNoteLastNumber?.debitNoteNumber || "",
      credit_note_type: "claim",
      sale_challan_id: null,
      quality_id: data?.quality_id  || null,
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
      credit_note_details: [
        {
          bill_id: billData?.bill_id,
          bill_no: billData?.invoice_no || billData?.bill_no,
          model: billData?.model,
          rate: +data.rate,
          per: 1.0,
          invoice_no: billData?.bill_no || billData?.invoice_no ,
          particular_name: "Claim On Sales",
          quantity: billData?.total_meter || billData?.meter || billData?.quantity,
          amount: +data.amount,
        },
      ],
    };

    if (billData?.party_id !== null) {
      payload["party_id"] = billData?.party_id
    } else {
      payload["supplier_id"] = billData?.supplier_id
    }
    await addCreditNote(payload);
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
      company_id: "",
      //
      supplier_id: "",
      sale_challan_id: "",
      quality_id: "",

      SGST_value: 2.5,
      SGST_amount: 0,
      CGST_value: 2.5,
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

  const { company_id } = watch();

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
        +amount + +SGSTAmount + +CGSTAmount + +IGSTAmount ;

      const final_net_amount = Math.round(netAmount) ; 
      const round_off_value = +final_net_amount - +netAmount

      setValue("net_amount", final_net_amount.toFixed(2));
      setValue("round_off_amount", parseFloat(round_off_value).toFixed(2))
    }
  }, [CGST_value, IGST_value, SGST_value, amount, round_off_amount, setValue]);

  const { data: creditNoteLastNumber } = useQuery({
    queryKey: [
      "get",
      "credit-notes",
      "last-number",
      {
        company_id: companyId,
      },
    ],
    queryFn: async () => {
      const params = {
        company_id: companyId,
      };
      const response = await getLastCreditNoteNumberRequest({ params });
      return response.data.data;
    },
    enabled: Boolean(companyId),
  });

  // ============== Bill dropdown ============================// 
  const { data: saleBillList, isLoadingSaleBillList } = useQuery({
    queryKey: [
      "saleBill",
      "list",
      {
        company_id: company_id,
        end: !is_current ? getFinancialYearEnd("previous") : getFinancialYearEnd("current"),
      },
    ],
    queryFn: async () => {
      const params = {
        company_id: company_id,
        end: !is_current ? getFinancialYearEnd("previous") : getFinancialYearEnd("current"),
        type: "claim_note"
      };
      const res = await creditNoteDropDownRequest({ params });
      return res.data?.data;
    },
    enabled: Boolean(company_id),
  });

  const billData = useMemo(() => {
    if (!bill_id) return null; // Handle case where bill_id is null/undefined
    const [parsedBillModel, parsedBillId] = String(bill_id).split("****");
    const selectedBillData = saleBillList?.bills?.find(
      (item) => item.bill_id === +parsedBillId && item?.model === parsedBillModel
    );
    return selectedBillData || null;
  }, [bill_id, saleBillList?.bills]);

  const selectedCompany = useMemo(() => {
    if (company_id) {
      return companyListRes?.rows?.find(({ id }) => id === company_id);
    }
  }, [company_id, companyListRes]);

  return (
    <Modal
      open={isAddModalOpen}
      width={"75%"}
      onCancel={() => {
        setIsAddModalOpen(false);
      }}
      footer={false}
      closeIcon={<CloseOutlined className="text-white" />}
      title="Credit Note - Claim Note"
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
        <Form>
          <table className="credit-note-table">
            <tbody>
              {/* <tr>
                <td colSpan={8} className="text-center">
                  <h2>Claim Note</h2>
                </td>
              </tr> */}
              <tr>
                <td colSpan={3} width={"25%"}>
                  {/* <div className="p-2">
                    Credit Note No.
                    <span
                      style={{
                        color: "green",
                        fontWeight: "600",
                        marginTop: "-5px",
                      }}
                    >
                      {creditNoteLastNumber?.debitNoteNumber || "-"}
                    </span>
                  </div> */}
                  <div className="year-toggle">
                    <Typography.Text style={{ fontSize: 20 }}>
                      Credit Note No.
                    </Typography.Text>
                    <div>{creditNoteLastNumber?.debitNoteNumber || ""}</div>
                  </div>
                </td>

                <td colSpan={3} width={"35.33%"}>
                  <Flex style={{
                    justifyContent: "center",
                    gap: 10,
                  }}>

                    {/* Company selection  */}
                    <div className="year-toggle" style={{
                      marginTop: "auto",
                      width: "45%"
                    }}>
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
                              options={companyListRes?.rows?.map((company) => {
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

                    {/* Date selection  */}
                    <div className="year-toggle" style={{
                      width: "45%"
                    }}>
                      <label style={{ textAlign: "left" }}>Date:</label>
                      <Form.Item
                        label=""
                        name="date"
                        validateStatus={errors?.date ? "error" : ""}
                        help={errors?.date && errors?.date?.message}
                        required={true}
                        wrapperCol={{ sm: 24 }}
                        style={{ marginBottom: 5 }}
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

                  </Flex>
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
                              <Tag color = {CURRENT_YEAR_TAG_COLOR}>
                                Current Year
                              </Tag>
                            </Radio>
                            <Radio value={0}>
                              <Tag color= {PREVIOUS_YEAR_TAG_COLOR}>
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
                      validateStatus={errors?.bill_id ? "error" : ""}
                      help={errors?.bill_id && errors?.bill_id?.message}
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
                            allowClear
                            loading={isLoadingSaleBillList}
                            style={{
                              textTransform: "capitalize",
                            }}
                            dropdownStyle={{
                              textTransform: "capitalize",
                            }}
                          >
                            {saleBillList?.bills?.map((item) => (
                              <Select.Option key={item.bill_no} value={`${item?.model}****${item?.bill_id}`}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                  <span style={{
                                    fontWeight: 600
                                  }}>{item.bill_no}</span>
                                  <Tag color={
                                    item?.model == SALE_BILL_MODEL ? SALE_TAG_COLOR :
                                      item?.model == YARN_SALE_BILL_MODEL ? YARN_SALE_BILL_TAG_COLOR :
                                        item?.model == JOB_GREAY_SALE_BILL_MODEL ? JOB_TAG_COLOR :
                                          item?.model == BEAM_SALE_BILL_MODEL ? BEAM_RECEIVE_TAG_COLOR :
                                          item?.model == JOB_WORK_BILL_MODEL?JOB_TAG_COLOR: "default"
                                  } style={{ marginLeft: "8px" }}>
                                    {item?.model == SALE_BILL_MODEL ? SALE_BILL_MODEL_NAME :
                                      item?.model == YARN_SALE_BILL_MODEL ? YARN_SALE_BILL_MODEL_NAME :
                                        item?.model == JOB_GREAY_SALE_BILL_MODEL ? JOB_GREAY_BILL_MODEL_NAME :
                                          item?.model == BEAM_SALE_BILL_MODEL ? BEAM_SALE_MODEL_NAME : 
                                            item?.model == JOB_WORK_BILL_MODEL?JOB_WORK_MODEL_NAME: item?.model
                                    }
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
                    <span>GSTIN/UIN:</span> {selectedCompany?.gst_no || ""}
                  </div>
                  <div className="credit-note-info-title">
                    <span>State Name:</span> {selectedCompany?.state || ""}
                  </div>
                  <div className="credit-note-info-title">
                    <span>PinCode:</span> {selectedCompany?.pincode || ""}
                  </div>
                  <div className="credit-note-info-title">
                    <span>Contact:</span> {selectedCompany?.company_contact || ""}
                  </div>
                  <div className="credit-note-info-title">
                    <span>Email:</span> {selectedCompany?.company_email || ""}
                  </div>
                </td>
                <td colSpan={4}>
                  {billData?.party !== null && (
                    <>
                      <strong>{String(billData?.supplier?.supplier?.supplier_company).toUpperCase()}</strong>
                      <div className="credit-note-info-title">
                        <span>Supplier:</span>{" "}
                        {`${billData?.supplier?.supplier?.supplier_name}` || ""}
                        {billData?.supplier?.address || ""}
                      </div>
                      <div className="credit-note-info-title">
                        <span>GSTIN/UIN: </span> {billData?.supplier?.gst_no || ""}
                      </div>
                      <div className="credit-note-info-title">
                        <span>PAN/IT No : </span> {billData?.supplier?.pancard_no}
                      </div>
                      <div className="credit-note-info-title">
                        <span>Email: {billData?.supplier?.email} </span>
                      </div>
                    </>
                  )}

                  {billData?.supplier !== null && (
                    <>
                    </>
                  )}
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
                <td colSpan={2}>Claim On Sales</td>
                <td></td>
                <td></td>
                <td></td>
                <td>
                  <Form.Item
                    label=""
                    name="amount"
                    validateStatus={errors?.amount ? "error" : ""}
                    // help={errors?.amount && errors?.amount?.message}
                    required={true}
                    wrapperCol={{ sm: 24 }}
                    style={{ marginBottom: 5 }}
                  >
                    <Controller
                      control={control}
                      name="amount"
                      render={({ field }) => (
                        <Input {...field} placeholder="12" />
                      )}
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
                        {toWords.convert(isNaN(net_amount) ? 0 : net_amount || 0)}{" "}
                      </div>
                      <div>
                        <span style={{ fontWeight: "500" }}>Remarks:</span>{" "}
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
                      <div>
                        .................................................
                      </div>
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
            <Button onClick={() => setIsAddModalOpen(false)}>Close</Button>
          </Flex>
        </Form>
      </div>
    </Modal>
  );
};

export default AddClaimNoteType;
