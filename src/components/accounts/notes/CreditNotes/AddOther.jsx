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
  Tag,
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
import { getPartyListRequest, getSupplierListRequest } from "../../../../api/requests/users";
import TextArea from "antd/es/input/TextArea";
import "./_style.css";
import { ToWords } from "to-words";
import { CloseOutlined } from "@ant-design/icons";
import moment from "moment";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  CURRENT_YEAR_TAG_COLOR,
  JOB_TAG_COLOR,
  PREVIOUS_YEAR_TAG_COLOR,
  PURCHASE_TAG_COLOR,
} from "../../../../constants/tag";
import { getDropdownSupplierListRequest } from "../../../../api/requests/users";
import { CREDIT_NOTE_OTHER_TYPE } from "../../../../constants/bill.model";

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
  amount: yup.string().required("Please enter amount"),
  particular: yup.string().required("Please,Provide credit note information"),
  hsn_no: yup
    .string()
    .matches(/^\d{6}$/, "HSN number must be a 6-digit code")
    .required("Please provide a 6-digit HSN number"),
  extra_tex_name: yup.string().required("Please, Provide tax name"),
});

const AddOther = ({ setIsAddModalOpen, isAddModalOpen }) => {
  const queryClient = useQueryClient();
  const { companyId, companyListRes } = useContext(GlobalContext);


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
    let is_party = data?.party_id?.includes("party") ? true : false;
    let party_id = String(data?.party_id).split("***")[1];
    const payload = {
      party_id: is_party ? +party_id : null,
      supplier_id: !is_party ? +party_id : null,
      credit_note_number: `CNS-${data?.credit_note_no}` || "",
      credit_note_type: CREDIT_NOTE_OTHER_TYPE,
      SGST_value: +data.SGST_value,
      SGST_amount: +data.SGST_amount,
      CGST_value: +data.CGST_value,
      CGST_amount: +data.CGST_amount,
      IGST_value: +data.IGST_value,
      IGST_amount: +data.IGST_amount,
      round_off_amount: +data.round_off_amount,
      net_amount: +data.net_amount,
      hsn_no: data.hsn_no,
      extra_tex_name: data.extra_tex_name,
      extra_tex_value: +data.extra_tex_value,
      extra_tex_amount: +data.extra_tex_amount,
      createdAt: dayjs(data.date).format("YYYY-MM-DD"),
      credit_note_details: [
        {
          per: 1.0,
          invoice_no: data?.invoice_number,
          particular_name: data?.particular,
          amount: +data.amount,
          bill_no: data?.invoice_number
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
      particular: "Credit note",
      is_current: "current",
      date: dayjs(),
      bill_id: null,
      amount: "",
      party_id: null,
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
      extra_tex_value: 0,
      extra_tex_name: "TDS",
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
        +IGSTAmount -
        +extraTexAmount;

      const final_net_amount = Math.round(netAmount) ; 
      
      let round_off_value = +final_net_amount - +netAmount ; 
      setValue("net_amount", final_net_amount.toFixed(2));
      setValue("round_off_amount", parseFloat(round_off_value).toFixed(2))
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

  // Load PartyList Dropdown =======================================
  const { data: partyUserListRes, isLoading: isLoadingPartyList } = useQuery({
    queryKey: ["party", "list", { company_id: company_id }],
    queryFn: async () => {
      const res = await getPartyListRequest({
        params: { company_id: company_id },
      });
      let temp = {
        "partyList": {
          "rows": []
        }
      } ; 

      res?.data?.data?.partyList?.rows?.map((element) => {
        temp["partyList"]['rows'].push(element) ; 
        element?.sub_parties?.map((subParty) => {
          temp["partyList"]['rows'].push(subParty) ; 
        })
      })
      return temp ; 
    },
    enabled: Boolean(company_id),
  });

  // Load Supplier list Dropdown ===================================
  const {
    data: dropdownSupplierListRes,
    isLoading: isLoadingDropdownSupplierList,
  } = useQuery({
    queryKey: ["dropdown/supplier/list", { company_id: company_id }],
    queryFn: async () => {
      const res = await getSupplierListRequest({
        params: { company_id: company_id },
      });
      return res.data?.data?.supplierList;
    },
    enabled: Boolean(company_id),
  });

  // Company changes related request handler
  const selectedCompany = useMemo(() => {
    if (company_id) {
      return companyListRes?.rows?.find(({ id }) => id === company_id);
    }
  }, [company_id, companyListRes]);

  // Handle selected company related information based on party and supplier selection
  const selectedPartyCompany = useMemo(() => {
    if (party_id) {
      if (party_id?.includes("party")) {
        let temp_party_id = party_id.split("***")[1];
        return partyUserListRes?.partyList?.rows?.find(
          (party) => party?.party?.user_id === +temp_party_id
        );
      } else {
        let temp_supplier_id = party_id.split("***")[1];
        let supplierInfo = null;
        dropdownSupplierListRes?.rows?.map((element) =>{
          if (+element?.id === +temp_supplier_id){
            supplierInfo = element ;
          }
        });
        return supplierInfo;
      }
    }
  }, [partyUserListRes?.partyList?.rows, party_id, dropdownSupplierListRes?.rows]);

  const selectedUser = useMemo(() => {
    if (party_id) {
      if (party_id?.includes("party")) {
        return "party";
      } else {
        return "supplier";
      }
    }
  }, [party_id]);

  // Get Last credit number related information
  const { data: creditNoteLastNumber } = useQuery({
    queryKey: [
      "get",
      "credit-notes",
      "last-number",
      {
        company_id: company_id,
      },
    ],
    queryFn: async () => {
      const params = {
        company_id: company_id,
      };
      const response = await getLastCreditNoteNumberRequest({ params });
      return response.data.data;
    },
    enabled: Boolean(company_id),
  });

  function disabledFutureDate(current) {
    return current && current > moment().endOf("day");
  }

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
          <Form>
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
                          rules={{ required: "Credit Note number is required" }}
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
                          rules={{ required: "Date is required" }}
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
                            rules={{ required: "Company selection required" }}
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
                      <label style={{ textAlign: "left" }}>
                        Party Company:
                      </label>
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
                          rules={{ required: "Party selection is required" }}
                          render={({ field }) => (
                            <Select
                              {...field}
                              className="width-100"
                              placeholder="Select Party Company"
                              style={{
                                textTransform: "capitalize",
                                minWidth: "200px",
                                maxWidth: "250px",
                              }}
                              dropdownStyle={{
                                textTransform: "capitalize",
                              }}
                              loading={
                                isLoadingPartyList ||
                                isLoadingDropdownSupplierList
                              }
                            >
                              {/* Party Options */}
                              {partyUserListRes?.partyList?.rows?.map(
                                (party) => (
                                  <Select.Option
                                    key={`party-${party?.party?.user_id}`}
                                    value={`party***${party?.party?.user_id}`}
                                    className = {"credit-note-user-selection-dropdown"}
                                  >
                                    <Tag color={PURCHASE_TAG_COLOR}>PARTY</Tag>
                                    <span>
                                      {`${party?.first_name} ${party?.last_name} | `.toUpperCase()}
                                      <strong>
                                        {party?.party?.company_name}
                                      </strong>
                                    </span>
                                  </Select.Option>
                                )
                              )}

                              {/* Supplier Options */}
                              {dropdownSupplierListRes?.rows?.flatMap((element) => (
                                <Select.Option
                                  key={`supplier-${element?.id}`}
                                  value={`supplier***${element?.id}`}
                                  className = {"credit-note-user-selection-dropdown"}
                                >
                                  <Tag color={JOB_TAG_COLOR}>SUPPLIER</Tag>
                                  <span>
                                    {`${element?.supplier?.supplier_company} | `}
                                    <strong>{`${element?.supplier?.supplier_name}`}</strong>
                                  </span>
                                </Select.Option>
                              ))}
                            </Select>
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
                              <Flex>
                                <Radio
                                  style={{ fontSize: "12px" }}
                                  value={"previous"}
                                >
                                  <Tag color={PREVIOUS_YEAR_TAG_COLOR}>
                                    Previous Year
                                  </Tag>
                                </Radio>
                                <Radio
                                  style={{ fontSize: "12px" }}
                                  value={"current"}
                                >
                                  <Tag color={CURRENT_YEAR_TAG_COLOR}>
                                    Current Year
                                  </Tag>
                                </Radio>
                              </Flex>
                            </Radio.Group>
                          )}
                        />
                      </Form.Item>
                      <div
                        style={{
                          marginTop: -10,
                        }}
                      >
                        <Form.Item
                          label=""
                          name="invoice_number"
                          validateStatus={errors.invoice_number ? "error" : ""}
                          help={
                            errors.invoice_number &&
                            errors.invoice_number.message
                          }
                          required={true}
                          wrapperCol={{ sm: 24 }}
                        >
                          <Controller
                            control={control}
                            rules={{ required: "Invoice number is required" }}
                            name="invoice_number"
                            render={({ field }) => (
                              <Input {...field} placeholder="Invoice Number" />
                            )}
                          />
                        </Form.Item>
                      </div>
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

                    {/* Party company information  */}
                    {selectedUser == "party" && (
                      <>
                        <div style={{
                          fontWeight: 600, 
                          fontSize: 16
                        }}>
                          {String(selectedPartyCompany?.party?.company_name).toUpperCase()}
                        </div>
                        <div className="credit-note-info-title">
                          <span>Party:</span>
                          {selectedPartyCompany
                            ? `${selectedPartyCompany?.first_name} ${selectedPartyCompany?.last_name}`
                            : ""}
                        </div>
                        <div>
                          <div style={{fontWeight: 600}}>
                            Address:
                          </div>
                          {selectedPartyCompany?.party?.delivery_address || ""}
                        </div>
                        <div className="credit-note-info-title">
                          <span>GSTIN/UIN: </span>
                          {selectedPartyCompany?.gst_no || ""}
                        </div>
                        <div className="credit-note-info-title">
                          <span>Email: </span>{" "}
                          {selectedPartyCompany?.email || ""}
                        </div>
                      </>
                    )}

                    {/* Supplier information  */}
                    {selectedUser == "supplier" && (
                      <>
                        <div className="credit-note-info-title">
                          <div style={{
                            fontWeight: 600,
                            fontSize: 16
                          }}>
                            {String(selectedPartyCompany?.supplier?.supplier_company).toUpperCase()}
                          </div>
                          <span>Supplier:</span>
                          {selectedPartyCompany?.supplier?.supplier_name}
                        </div>
                        <div>
                          <div style={{
                            fontWeight: 600
                          }}>
                            Address:
                          </div>
                          {selectedPartyCompany?.address}
                        </div>
                        <div>{selectedPartyCompany?.users?.address}</div>
                        <div className="credit-note-info-title">
                          <span>GSTIN/UIN: </span>
                          {selectedPartyCompany?.gst_no || ""}
                        </div>
                        <div className="credit-note-info-title">
                          <span>Email: </span>{" "}
                          {selectedPartyCompany?.email || ""}
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
                        rules={{ required: "Debit note is required" }}
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
                        rules={{ required: "HSN code is required" }}
                        name="hsn_no"
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            placeholder="234512"
                          />
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
                        rules={{ required: "Amount is required" }}
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
                    <div style={{ marginBottom: "6px" }}>
                      {round_off_amount}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td></td>
                  <td colSpan={3}>
                    <div>
                      <Controller
                        control={control}
                        name="extra_tex_name"
                        rules={{ required: "Tax name is required" }}
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
                      &nbsp;%
                    </div>
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td>{extra_tex_amount}</td>
                </tr>
                <tr>
                  <td></td>
                  <td colSpan={3} style={{ fontWeight: 600 }}>
                    Total
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td style={{ fontWeight: 600 }}>{net_amount}</td>
                </tr>
                <tr>
                  <td colSpan={8}>
                    <Flex
                      justify="space-between"
                      style={{ width: "100%" }}
                      className="mt-3"
                    >
                      <div>
                        <span style={{ fontWeight: 600 }}>
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
          </Form>
        </div>
      </Modal>
    </>
  );
};

export default AddOther;
