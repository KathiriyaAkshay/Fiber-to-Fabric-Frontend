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
} from "antd";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { useContext, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCreditNoteRequest,
  getLastCreditNoteNumberRequest,
} from "../../../../api/requests/accounts/notes";
import { Controller, useForm } from "react-hook-form";
import { getPartyListRequest } from "../../../../api/requests/users";
import TextArea from "antd/es/input/TextArea";
import "./_style.css";
import { ToWords } from "to-words";
import { CloseOutlined } from "@ant-design/icons";
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
  company_id: yup.string().required("Please select company"),
  credit_note_no: yup.string().required("Please enter credit note number"),
  invoice_number: yup.string().required("Please enter invoice number"),
  party_id: yup.string().required("Please select party"),
  date: yup.string().required("Please enter date"),
  // particular: yup.string().required("Please enter particular"),
  // hsn_code: yup.string().required("Please enter hsn code"),
  amount: yup.string().required("Please enter amount"),
  bill_id: yup.string().required("Please select bill."),
});

const AddOther = ({ setIsAddModalOpen, isAddModalOpen }) => {
  const queryClient = useQueryClient();
  const { companyId, companyListRes } = useContext(GlobalContext);

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

  // ----------------------------------------------------------------------------------------------------------------------

  const { mutateAsync: addCreditNote, isPending } = useMutation({
    mutationFn: async ({ data, companyId }) => {
      const res = await createCreditNoteRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["add", "credit", "other-note"],
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
    const payload = {
      party_id: data?.party_id,
      // supplier_id: billData?.supplier_id,
      // model: selectedBillData?.model,
      credit_note_number: data?.credit_note_no || "",
      credit_note_type: "other",
      // sale_challan_id: 456,
      // quality_id: data?.quality_id,
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
      hsn_no: data.hsn_no,
      // net_rate: 6.67,
      // tcs_value: 0.75,
      // tcs_amount: 11.25,
      extra_tex_name: data.extra_tex_name,
      extra_tex_value: +data.extra_tex_value,
      extra_tex_amount: +data.extra_tex_amount,
      createdAt: dayjs(data.date).format("YYYY-MM-DD"),
      credit_note_details: [
        {
          // bill_id: data.bill_id,
          // model: selectedBillData?.model,
          // rate: +data.rate,
          per: 1.0,
          invoice_no: data?.invoice_number,
          particular_name: data?.particular,
          // quality: billData?.inhouse_quality?.quality_weight,
          amount: +data.amount,
        },
      ],
    };
    await addCreditNote({ data: payload, companyId: data.company_id });
  };

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    resetField,
    formState: { errors },
  } = useForm({
    defaultValues: {
      credit_note_no: "",
      company_id: null,

      is_current: 1,
      date: dayjs(),
      bill_id: null,
      amount: "",
      party_id: null,

      //
      // supplier_id: "",
      // sale_challan_id: "",
      // quality_id: "",

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
      // total_taka: "",
      // total_meter: "",
      // discount_value: "",
      // discount_amount: "",
      extra_tex_value: 0,
      extra_tex_name: "",
      extra_tex_amount: 0,
    },
    resolver: yupResolver(validationSchema),
  });

  const {
    company_id,
    party_id,
    SGST_value,
    SGST_amount,
    CGST_value,
    CGST_amount,
    IGST_value,
    IGST_amount,
    round_off_amount,
    extra_tex_value,
    extra_tex_amount,
    amount,
    net_amount,
  } = watch();

  useEffect(() => {
    if (company_id) {
      resetField("party_id");
    }
  }, [company_id, resetField]);

  useEffect(() => {
    if (amount) {
      const SGSTAmount = (amount * SGST_value) / 100;
      setValue("SGST_amount", SGSTAmount.toFixed(2));

      const CGSTAmount = (amount * CGST_value) / 100;
      setValue("CGST_amount", CGSTAmount.toFixed(2));

      const IGSTAmount = (amount * IGST_value) / 100;
      setValue("IGST_amount", IGSTAmount.toFixed(2));

      const extraTexAmount = (amount * extra_tex_value) / 100;
      setValue("extra_tex_amount", extraTexAmount.toFixed(2));

      const netAmount =
        +amount +
        +SGSTAmount +
        +CGSTAmount +
        +IGSTAmount +
        +round_off_amount -
        +extraTexAmount;

      setValue("net_amount", netAmount.toFixed(2));
    }
  }, [
    CGST_value,
    IGST_value,
    SGST_value,
    amount,
    extra_tex_value,
    round_off_amount,
    setValue,
  ]);

  const { data: partyUserListRes, isLoading: isLoadingPartyList } = useQuery({
    queryKey: ["party", "list", { company_id: company_id }],
    queryFn: async () => {
      const res = await getPartyListRequest({
        params: { company_id: company_id },
      });
      return res.data?.data;
    },
    enabled: Boolean(company_id),
  });

  const selectedCompany = useMemo(() => {
    if (company_id) {
      return companyListRes?.rows?.find(({ id }) => id === company_id);
    }
  }, [company_id, companyListRes]);

  const selectedPartyCompany = useMemo(() => {
    if (party_id) {
      return partyUserListRes?.partyList?.rows?.find(
        ({ id }) => id === party_id
      );
    }
  }, [partyUserListRes?.partyList?.rows, party_id]);

  return (
    <>
      <Modal
        open={isAddModalOpen}
        width={"75%"}
        onCancel={() => {
          setIsAddModalOpen(false);
        }}
        footer={false}
        closeIcon={<CloseOutlined className="text-white" />}
        title="Credit Note - Other"
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
          {/* <h2>Credit Note</h2>
          <Flex
            gap={12}
            style={{
              marginBottom: "12px",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span>Credit Note No.</span>
            <Input style={{ width: "100px" }} />
          </Flex>

          <table className="credit-note-table">
            <tbody>
              <tr>
                <td colSpan={2} width={"25%"}>
                  <div className="year-toggle" style={{ textAlign: "left" }}>
                    <label>Date:</label>
                    <DatePicker
                      value={date}
                      onChange={(selectedDate) => setDate(selectedDate)}
                      className="width-100"
                    />
                  </div>
                </td>
                <td colSpan={2} width={"25%"}>
                  <div className="year-toggle" style={{ textAlign: "left" }}>
                    <label>Company:</label>
                    <Select
                      className="width-100 mt-2"
                      placeholder="Select company"
                      style={{
                        textTransform: "capitalize",
                      }}
                      dropdownStyle={{
                        textTransform: "capitalize",
                      }}
                      options={companyListRes?.rows.map(
                        ({ id, company_name }) => {
                          return { label: company_name, value: id };
                        }
                      )}
                    />
                  </div>
                </td>
                <td colSpan={2} width={"25%"}>
                  <div className="year-toggle" style={{ textAlign: "left" }}>
                    <label>Party Company:</label>
                    <Select
                      className="width-100 mt-2"
                      placeholder="Select party company"
                      style={{
                        textTransform: "capitalize",
                      }}
                      dropdownStyle={{
                        textTransform: "capitalize",
                      }}
                    />
                  </div>
                </td>
                <td colSpan={2} width={"25%"}>
                  <div className="year-toggle" style={{ textAlign: "left" }}>
                    <Radio.Group
                    // value={yearValue}
                    // onChange={(e) => setYearValue(e.target.value)}
                    >
                      <Flex>
                        <Radio style={{ fontSize: "12px" }} value={"current"}>
                          Current Year
                        </Radio>
                        <Radio style={{ fontSize: "12px" }} value={"previous"}>
                          Previous Year
                        </Radio>
                      </Flex>
                    </Radio.Group>
                    <Input
                      className="width-100 mt-2"
                      placeholder="Invoice number"
                    />
                  </div>
                </td>
              </tr>
              <tr width="50%">
                <td colSpan={4}>
                  <div>GSTIN/UIN:</div>
                  <div>State Name:</div>
                  <div>Code:</div>
                  <div>Contact:</div>
                  <div>Email:</div>
                </td>
                <td colSpan={4}>
                  <div>Party:</div>
                  <div>GSTIN/UIN :</div>
                  <div>PAN/IT No:</div>
                  <div>State Name:</div>
                </td>
              </tr>
              <tr>
                <td style={{ width: "100px" }}>SL No.</td>
                <td colSpan={2}>Particulars</td>
                <td>Quantity</td>
                <td>Rate</td>
                <td>Per</td>
                <td>Amount</td>
              </tr>
              <tr style={{ height: "50px" }}>
                <td style={{ width: "100px" }}></td>
                <td colSpan={2}></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td colSpan={2}>Discount On Purchase</td>
                <td></td>
                <td></td>
                <td></td>
                <td>
                  <Input />
                </td>
              </tr>
              <tr>
                <td></td>
                <td colSpan={2}>
                  <div>SGST @ 0 %</div>
                  <div>CGST @ 0 %</div>
                  <div>CGST @ 0%</div>
                  <div>Round Off</div>
                </td>
                <td></td>
                <td></td>
                <td></td>
                <td>
                  <div>0</div>
                  <div>0</div>
                  <div>0</div>
                  <div>0</div>
                </td>
              </tr>
              <tr>
                <td></td>
                <td colSpan={2}>Total</td>
                <td></td>
                <td></td>
                <td></td>
                <td>00.00</td>
              </tr>
              <tr>
                <td colSpan={8}>
                  <Flex
                    justify="space-between"
                    style={{ width: "100%" }}
                    className="mt-3"
                  >
                    <div>
                      <div>Amount Chargable(in words)</div>
                      <div>Xero Only</div>
                      <div>Remarks:</div>
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
          </table> */}
          <table className="credit-note-table">
            <tbody>
              <tr>
                <td colSpan={8} className="text-center">
                  <div className="year-toggle">
                    <label style={{ textAlign: "left", margin: 0 }}>
                      Credit Note No:
                    </label>
                    <Form.Item
                      label=""
                      name="credit_note_no"
                      validateStatus={errors.credit_note_no ? "error" : ""}
                      help={
                        errors.credit_note_no && errors.credit_note_no.message
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                      style={{ margin: 0 }}
                    >
                      <Controller
                        control={control}
                        name="credit_note_no"
                        render={({ field }) => (
                          <Input {...field} style={{ width: "100px" }} />
                        )}
                      />
                    </Form.Item>
                  </div>
                  <span
                    style={{
                      color: "green",
                      fontWeight: "600",
                      marginTop: "-5px",
                    }}
                  >
                    {creditNoteLastNumber?.debitNoteNumber}
                  </span>
                </td>
              </tr>
              <tr>
                <td colSpan={2} width={"20%"}>
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
                <td colSpan={2} width={"25%"}>
                  <div className="year-toggle">
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
                  </div>
                </td>
                <td colSpan={2} width={"25%"}>
                  <div className="year-toggle">
                    <label style={{ textAlign: "left" }}>Party Company:</label>
                    <Form.Item
                      label=""
                      name="party_id"
                      validateStatus={errors.party_id ? "error" : ""}
                      help={errors.party_id && errors.party_id.message}
                      required={true}
                      wrapperCol={{ sm: 24 }}
                    >
                      <Controller
                        control={control}
                        name="party_id"
                        render={({ field }) => (
                          <Select
                            {...field}
                            className="width-100"
                            placeholder="Select Party Company"
                            style={{
                              textTransform: "capitalize",
                            }}
                            dropdownStyle={{
                              textTransform: "capitalize",
                            }}
                            loading={isLoadingPartyList}
                            options={partyUserListRes?.partyList?.rows?.map(
                              (party) => ({
                                label:
                                  party.first_name +
                                  " " +
                                  party.last_name +
                                  " " +
                                  `| ( ${party?.username})`,
                                value: party.id,
                              })
                            )}
                          />
                        )}
                      />
                    </Form.Item>
                  </div>
                </td>
                <td colSpan={2} width={"30%"}>
                  <div className="year-toggle">
                    <Form.Item label="" name="is_current">
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
                      name="invoice_number"
                      validateStatus={errors.invoice_number ? "error" : ""}
                      help={
                        errors.invoice_number && errors.invoice_number.message
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                    >
                      <Controller
                        control={control}
                        name="invoice_number"
                        render={({ field }) => (
                          <Input {...field} placeholder="Invoice Number" />
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
                    <span>PinCode:</span> {selectedCompany?.pincode || ""}
                  </div>
                  <div className="credit-note-info-title">
                    <span>Contact:</span>{" "}
                    {selectedCompany?.company_contact || ""}
                  </div>
                  <div className="credit-note-info-title">
                    <span>Email:</span> {selectedCompany?.company_email || ""}
                  </div>
                </td>
                <td colSpan={4}>
                  <div className="credit-note-info-title">
                    <span>Party:</span>
                    {selectedPartyCompany
                      ? `${selectedPartyCompany?.first_name} ${selectedPartyCompany?.last_name} (${selectedPartyCompany?.party?.company_name})`
                      : ""}
                  </div>
                  <div>
                    {selectedPartyCompany?.party?.delivery_address || ""}
                  </div>
                  <div className="credit-note-info-title">
                    <span>GSTIN/UIN: </span>
                    {selectedPartyCompany?.gst_no || ""}
                  </div>
                  <div className="credit-note-info-title">
                    <span>State Name: </span>{" "}
                    {selectedPartyCompany?.state || ""}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <table className="credit-note-table">
            <thead style={{ fontWeight: 600 }}>
              <tr>
                <td>SL No.</td>
                <td colSpan={3}>Particulars</td>
                <td>HSN Code</td>
                <td style={{ width: "50px" }}>Rate</td>
                <td style={{ width: "50px" }}>Per</td>
                <td style={{ width: "120px" }}>Amount</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td></td>
                <td colSpan={3}>
                  <Form.Item
                    label=""
                    name="particular"
                    validateStatus={errors.particular ? "error" : ""}
                    help={errors.particular && errors.particular.message}
                    required={true}
                    wrapperCol={{ sm: 24 }}
                  >
                    <Controller
                      control={control}
                      name="particular"
                      render={({ field }) => (
                        <TextArea {...field} placeholder="Debit note" />
                      )}
                    />
                  </Form.Item>
                </td>
                <td>
                  <Form.Item
                    label=""
                    name="hsn_no"
                    validateStatus={errors.hsn_no ? "error" : ""}
                    help={errors.hsn_no && errors.hsn_no.message}
                    required={true}
                    wrapperCol={{ sm: 24 }}
                  >
                    <Controller
                      control={control}
                      name="hsn_no"
                      render={({ field }) => (
                        <Input {...field} placeholder="234512" />
                      )}
                    />
                  </Form.Item>
                </td>
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
                  >
                    <Controller
                      control={control}
                      name="amount"
                      render={({ field }) => (
                        <Input {...field} placeholder="300" type="number" />
                      )}
                    />
                  </Form.Item>
                </td>
              </tr>
              <tr>
                <td></td>
                <td colSpan={3} style={{ textAlign: "right" }}>
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
                          type="number"
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
                          type="number"
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
                          type="number"
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
                  <div style={{ marginBottom: "6px" }}>{SGST_amount}</div>
                  <div style={{ marginBottom: "6px" }}>{CGST_amount}</div>
                  <div style={{ marginBottom: "6px" }}>{IGST_amount}</div>
                  <div style={{ marginBottom: "6px" }}>{round_off_amount}</div>
                </td>
              </tr>
              <tr>
                <td></td>
                <td colSpan={3}>
                  <div>
                    <Controller
                      control={control}
                      name="extra_tex_name"
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Tax name"
                          style={{ width: "65%" }}
                        />
                      )}
                    />
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <Controller
                      control={control}
                      name="extra_tex_value"
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="3"
                          style={{ width: "20%" }}
                          type="number"
                        />
                      )}
                    />
                    %
                  </div>
                </td>
                <td></td>
                <td></td>
                <td></td>
                <td>{extra_tex_amount}</td>
              </tr>
              <tr>
                <td></td>
                <td colSpan={3}>Total</td>
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
                      <span style={{ fontWeight: "500" }}>
                        Amount Chargable(in words):
                      </span>{" "}
                      {toWords.convert(net_amount || 0)}
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
            <Button>Close</Button>
          </Flex>
        </div>
      </Modal>
    </>
  );
};

export default AddOther;
