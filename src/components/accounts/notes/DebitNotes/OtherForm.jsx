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
import dayjs from "dayjs";
import { useContext, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import TextArea from "antd/es/input/TextArea";
import { createDebitNoteRequest } from "../../../../api/requests/accounts/notes";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { ToWords } from "to-words";
import { getDropdownSupplierListRequest } from "../../../../api/requests/users";
import { JOB_TAG_COLOR } from "../../../../constants/tag";
import { PREVIOUS_YEAR_TAG_COLOR, CURRENT_YEAR_TAG_COLOR } from "../../../../constants/tag";
import { getLastDebitNoteNumberRequest } from "../../../../api/requests/accounts/notes";

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
  company_id: yup.string().required("Please enter company"),
  debit_note_no: yup.string().required("Please enter debit note number"),
  invoice_number: yup.string().required("Please enter invoice number"),
  party_id: yup.string().required("Please enter party"),
  date: yup.string().required("Please enter date"),
  particular: yup.string().required("Please enter particular"),
  hsn_code: yup.string().required("Please enter hsn code"),
  amount: yup.string().required("Please enter amount"),
  extra_tex_name: yup.string().required("Please, Enter tax name information")
});

const OtherForm = ({ type, handleClose }) => {
  const queryClient = useQueryClient();
  const { companyListRes } = useContext(GlobalContext);

  const { mutateAsync: addDebitOtherNOte, isPending } = useMutation({
    mutationFn: async ({ data, companyId }) => {
      const res = await createDebitNoteRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["add", "debit", "other-note"],
    onSuccess: (res) => {
      queryClient.invalidateQueries(["get", "debit-notes", "last-number"]);
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
    let is_party = data?.party_id?.includes("party")?true:false
    let party_id = String(data?.party_id).split("***")[1] ; 
    const payload = {
      party_id: is_party? +party_id:null,
      supplier_id: !is_party?+party_id:null,
      debit_note_number: `DNS-${data?.debit_note_no}` || "",
      debit_note_type: type,
      SGST_value: +data.SGST_value,
      SGST_amount: +data.SGST_amount,
      CGST_value: +data.CGST_value,
      CGST_amount: +data.CGST_amount,
      IGST_value: +data.IGST_value,
      IGST_amount: +data.IGST_amount,
      round_off_amount: +data.round_off_amount,
      net_amount: +data.net_amount,
      extra_tex_name: data.extra_tex_name,
      extra_tex_value: +data.extra_tex_value,
      extra_tex_amount: +data.extra_tex_amount,
      createdAt: dayjs(data.date).format("YYYY-MM-DD"),
      debit_note_details: [
        {
          invoice_no: data?.invoice_number,
          particular_name: data?.particular,
          amount: +data.amount,
        },
      ],
    };
    await addDebitOtherNOte({ data: payload, companyId: data.company_id });
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
      debit_note_no: "",
      company_id: null,
      is_current: 1,
      date: dayjs(),
      bill_id: null,
      amount: "",
      party_id: null,
      SGST_value: 6,
      SGST_amount: 0,
      CGST_value: 6,
      CGST_amount: 0,
      IGST_value: 0,
      IGST_amount: 0,
      round_off_amount: 0,
      net_amount: "",
      rate: "",
      invoice_number: "",
      extra_tex_value: 0,
      extra_tex_name: "TDS",
      extra_tex_amount: 0,
      particular: "Debit note"
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

  // Load Partylist Dropdown =======================================================
  // const { data: partyUserListRes, isLoading: isLoadingPartyList } = useQuery({
  //   queryKey: ["party", "list", { company_id: company_id }],
  //   queryFn: async () => {
  //     const res = await getPartyListRequest({
  //       params: { company_id: company_id },
  //     });
  //     return res.data?.data;
  //   },
  //   enabled: Boolean(company_id),
  // });

  // Load Supplier list DropDown ====================================================
  const {
    data: dropdownSupplierListRes,
    isLoading: isLoadingDropdownSupplierList,
  } = useQuery({
    queryKey: ["dropdown/supplier/list", { company_id: company_id }],
    queryFn: async () => {
      const res = await getDropdownSupplierListRequest({
        params: { company_id: company_id },
      });
      return res.data?.data?.supplierList;
    },
    enabled: Boolean(company_id),
  });

  const selectedCompany = useMemo(() => {
    if (company_id) {
      return companyListRes?.rows?.find(({ id }) => id === company_id);
    }
  }, [company_id, companyListRes]);


  // Last debit note number information request =================
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

  // Handle selected company related information based on party and supplier selection
  const selectedPartyCompany = useMemo(() => {
    if (party_id) {
      let temp_supplier_id = party_id.split("***")[1];
      let supplierInfo = null;
      dropdownSupplierListRes?.some((element) =>
        element?.supplier_company?.some((supplier) => {
          if (supplier?.supplier_id === +temp_supplier_id) {
            supplierInfo = supplier;
            return true; // Stop searching once the supplier is found
          }
          return false;
        })
      );
      return supplierInfo ; 
    }
  }, [dropdownSupplierListRes,  party_id]);

  const selectedUser = useMemo(() => {
    if (party_id) {
      if (party_id?.includes("party")) {
        return "party";
      } else {
        return "supplier";
      }
    }
  }, [party_id])


  return (
    <>
      <table className="credit-note-table">
        <tbody>
          <tr>
            <td colSpan={8} className="text-center">
              {/* <h2>Debit Note</h2> */}
              <div className="year-toggle">
                <Typography.Text style={{ fontSize: 20 }}>
                  Debit Note No:
                </Typography.Text>
                <div>
                  <Form.Item
                    label=""
                    name="party_id"
                    validateStatus={errors.debit_note_no ? "error" : ""}
                    help={errors.debit_note_no && errors.debit_note_no.message}
                    required={true}
                    wrapperCol={{ sm: 24 }}
                  >
                    <Controller
                      control={control}
                      name="debit_note_no"
                      render={({ field }) => (
                        <Input
                          {...field}
                          style={{ width: "100px", marginLeft: "10px" }}
                        />
                      )}
                    />
                  </Form.Item>
                </div>

                {debitNoteLastNumber?.debitNoteNumber && (
                  <div style={{marginTop: -10}}>
                    <Typography.Text >
                      Last Debit Note: <span style={{color: "red"}}>{debitNoteLastNumber?.debitNoteNumber?debitNoteLastNumber?.debitNoteNumber:""}</span>
                    </Typography.Text>
                  </div>
                )}
              </div>
            </td>
          </tr>
          <tr style={{
            marginTop: -25
          }}>
            <td colSpan={2} width={"20%"}>
              <div className="year-toggle">
                <label style={{ textAlign: "left" }}>Date:</label>
                <Form.Item
                  label=""
                  name="party_id"
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
                <label style={{ textAlign: "left" }}>Supplier Company:</label>
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
                        placeholder="Select Supplier Company"
                        style={{
                          textTransform: "capitalize",
                        }}
                        dropdownStyle={{
                          textTransform: "capitalize",
                        }}
                        loading={isLoadingDropdownSupplierList}
                      >
                        {/* Supplier Options */}
                        {dropdownSupplierListRes?.flatMap((element) =>
                          element?.supplier_company?.map((supplier) => (
                            <Select.Option key={`supplier-${supplier?.supplier_id}`} value={`supplier***${supplier?.supplier_id}`}>
                              {/* <Tag color={JOB_TAG_COLOR}>SUPPLIER</Tag> */}
                              <span>
                                {`${supplier?.supplier_company} | `}<strong>{`${element?.supplier_name}`}</strong>
                              </span>
                            </Select.Option>
                          ))
                        )}
                      </Select>
                    )}
                  />
                </Form.Item>
              </div>
            </td>
            <td colSpan={2} width={"30%"}>
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
                        <Flex>
                          <Radio value={1}>
                            <Tag color={PREVIOUS_YEAR_TAG_COLOR}>
                              Previous Year
                            </Tag>
                          </Radio>
                          <Radio value={0}>
                            <Tag color={CURRENT_YEAR_TAG_COLOR}>
                              Current Year
                            </Tag>
                          </Radio>
                        </Flex>
                      </Radio.Group>
                    )}
                  />
                </Form.Item>
                <Form.Item
                  label=""
                  name="invoice_number"
                  validateStatus={errors.invoice_number ? "error" : ""}
                  help={errors.invoice_number && errors.invoice_number.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                  style={{ marginBottom: 5 }}
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
              <b style={{color: "blue"}}>{selectedCompany?.company_name || ""}</b>
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
                <span>Contact:</span> {selectedCompany?.company_contact || ""}
              </div>
              <div className="credit-note-info-title">
                <span>Email:</span> {selectedCompany?.company_email || ""}
              </div>
            </td>
            <td colSpan={4} style={{verticalAlign: "top"}}>
              {selectedUser == "party" && (
                <>
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
                </>
              )}
              {selectedUser == "supplier" && (
                <>
                  <div style={{verticalAlign: "top"}}>
                    <span style={{
                      fontWeight: 600,
                      fontSize: 16
                    }}>{String(selectedPartyCompany?.supplier_company).toUpperCase()}</span>
                    <div className="credit-note-info-title">
                      <span>Supplier:</span>
                      {selectedPartyCompany
                        ? `${selectedPartyCompany?.users?.first_name} ${selectedPartyCompany?.users?.last_name}`
                        : ""}
                    </div>
                    <div>
                      <div style={{fontWeight: 600}}>
                        Address:
                      </div>
                      {selectedPartyCompany?.users?.address}
                    </div>
                    <div className="credit-note-info-title">
                      <span>GSTIN/UIN: </span>
                      {selectedPartyCompany?.users?.gst_no || ""}
                    </div>
                    <div className="credit-note-info-title">
                      <span>Mobile: </span>{" "}
                      {selectedPartyCompany?.users?.mobile || ""}
                    </div>
                  </div>
                </>
              )}
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
            <td>Rate</td>
            <td>Per</td>
            <td>Amount</td>
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
                // help={errors.particular && errors.particular.message}
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
                name="hsn_code"
                validateStatus={errors.hsn_code ? "error" : ""}
                // help={errors.hsn_code && errors.hsn_code.message}
                required={true}
                wrapperCol={{ sm: 24 }}
              >
                <Controller
                  control={control}
                  name="hsn_code"
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
                  render={({ field }) => <Input {...field} placeholder="300" />}
                />
              </Form.Item>
            </td>
          </tr>
          <tr>
            <td></td>
            <td colSpan={3} style={{ textAlign: "right" }}>
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
                      type="number"
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
                      type="number"
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
                      onChange={(e) => {
                        let value = e.target.value ;
                        if (value > 100){
                          message.warning("Please enter proper extra tax value")
                        } else {
                          setValue(`extra_tex_value`, value) ; 
                        }
                      }}
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
                  <div>
                    {" "}
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
    </>
  );
};

export default OtherForm;
