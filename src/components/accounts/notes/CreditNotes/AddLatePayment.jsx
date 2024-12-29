  import {
  Button,
  DatePicker,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Select,
  Typography,
  Tag,
} from "antd";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { useContext, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCreditNoteRequest,
  getLastCreditNoteNumberRequest,
  creditNoteDropDownRequest
} from "../../../../api/requests/accounts/notes";
import { Controller, useForm } from "react-hook-form";
import { getPartyListRequest } from "../../../../api/requests/users";
import TextArea from "antd/es/input/TextArea";
import "./_style.css";
import { getSaleBillListRequest } from "../../../../api/requests/sale/bill/saleBill";
import moment from "moment";
import { CloseOutlined } from "@ant-design/icons";
import { ToWords } from "to-words";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { getDropdownSupplierListRequest } from "../../../../api/requests/users";
import { CURRENT_YEAR_TAG_COLOR, JOB_TAG_COLOR, PREVIOUS_YEAR_TAG_COLOR, PURCHASE_TAG_COLOR } from "../../../../constants/tag";
import { getFinancialYearEnd } from "../../../../pages/accounts/reports/utils";
import { BEAM_RECEIVE_TAG_COLOR, SALE_TAG_COLOR, YARN_SALE_BILL_TAG_COLOR } from "../../../../constants/tag";

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
  party_id: yup.string().required("Please select party"),
  date: yup.string().required("Please enter date"),
  // particular: yup.string().required("Please enter particular"),
  // hsn_code: yup.string().required("Please enter hsn code"),
  amount: yup.string().required("Please enter amount"),
  extra_tex_name: yup.string().required("Please, Enter extra tex name information"),
  bill_id: yup
    .array()
    .min(1, "Please select bill.")
    .required("Please select bill."),
});

const AddLatePayment = ({
  setIsAddModalOpen,
  isAddModalOpen,
  creditNoteData,
}) => {
  const isEditMode = !_.isNull(creditNoteData);
  const queryClient = useQueryClient();
  const { companyId, companyListRes } = useContext(GlobalContext);

  const [numOfBill, setNumOfBill] = useState([]);

  function disabledFutureDate(current) {
    return current && current > moment().endOf("day");
  }

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
    mutationKey: ["add", "credit", "late-payment"],
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
    const temp_credit_notes_data = [] ; 
    bill_id?.map((id) => {
      let bill_model = String(id).split("****")[0]; 
      let bill_model_id = String(id).split("****")[1] ; 
      const billData = saleBillList?.bills?.find((item) => item.bill_id === +bill_model_id && item?.model ==  bill_model);
      temp_credit_notes_data.push({
        bill_id: billData?.bill_id, 
        model: billData?.model, 
        per: 1.0, 
        invoice_no: billData?.bill_no || data?.invoice_no, 
        particular_name: data?.particular, 
        amount: +billData?.amount || 0  
      })
    })
    
    const payload = {
      // party_id: data?.party_id,
      // supplier_id: billData?.supplier_id,
      // model: selectedBillData?.model,
      credit_note_number: creditNoteLastNumber?.debitNoteNumber || "",
      credit_note_type: "late",
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
      // net_rate: 6.67,
      // tcs_value: 0.75,
      // tcs_amount: 11.25,
      extra_tex_name: data.extra_tex_name,
      extra_tex_value: +data.extra_tex_value,
      extra_tex_amount: +data.extra_tex_amount,
      createdAt: dayjs(data.date).format("YYYY-MM-DD"),
      credit_note_details: temp_credit_notes_data,
    };

    if (selectedPartyCompany?.party !== null && selectedPartyCompany?.party  !== undefined){
      payload["party_id"] = selectedPartyCompany?.party?.id
    } else {
      payload["supplier_id"] = selectedPartyCompany?.supplier_id
    }
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
    getValues,
  } = useForm({
    defaultValues: {
      // particular: "Late Payment",
      // credit_note_no: "",
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
      // total_taka: "",
      // total_meter: "",
      // discount_value: "",
      // discount_amount: "",
      extra_tex_value: 0,
      extra_tex_name: "TDS",
      extra_tex_amount: 0,
    },
    resolver: yupResolver(validationSchema),
  });

  const {
    company_id,
    party_id,
    // SGST_value,
    SGST_amount,
    // CGST_value,
    CGST_amount,
    // IGST_value,
    IGST_amount,
    round_off_amount,
    extra_tex_amount,
    net_amount,
    // bill_id,
  } = watch();

  useEffect(() => {
    if (company_id) {
      resetField("party_id");
    }
  }, [company_id, resetField]);

  // useEffect(() => {
  //   if (amount) {
  //     const SGSTAmount = (amount * SGST_value) / 100;
  //     setValue("SGST_amount", SGSTAmount.toFixed(2));

  //     const CGSTAmount = (amount * CGST_value) / 100;
  //     setValue("CGST_amount", CGSTAmount.toFixed(2));

  //     const IGSTAmount = (amount * IGST_value) / 100;
  //     setValue("IGST_amount", IGSTAmount.toFixed(2));

  //     const extraTexAmount = (amount * extra_tex_value) / 100;
  //     setValue("extra_tex_amount", extraTexAmount.toFixed(2));

  //     const netAmount =
  //       +amount +
  //       +SGSTAmount +
  //       +CGSTAmount +
  //       +IGSTAmount +
  //       +round_off_amount -
  //       +extraTexAmount;

  //     setValue("net_amount", netAmount.toFixed(2));
  //   }
  // }, [
  //   CGST_value,
  //   IGST_value,
  //   SGST_value,
  //   amount,
  //   extra_tex_value,
  //   round_off_amount,
  //   setValue,
  // ]);

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

  // ----------------------------------------------------------------------------------------------------------------------
  const { data: saleBillList, isLoadingSaleBillList } = useQuery({
    queryKey: [
      "saleBill",
      "list",
      {
        company_id: company_id,
        party_id: party_id,
        end: getFinancialYearEnd("current")
      },
    ],
    queryFn: async () => {
      let is_party = party_id?.includes("party") ? true : false
      let party_id_value = String(party_id).split("***")[1];

      const params = {
        company_id: company_id,
        page: 0,
        pageSize: 99999,
        end: getFinancialYearEnd("current"),
        type: "late_payment"
      };
      if (is_party) {
        params["party_id"] = party_id_value
      } else {
        params["supplier_id"] = party_id_value
      }

      const res = await creditNoteDropDownRequest({ params });
      return res.data?.data;
    },
    enabled: Boolean(company_id && party_id),
  });

  // Load PartyList dropdown =========================================
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

  // Load Supplier list dropdown =====================================
  const {
    data: dropdownSupplierListRes,
    isLoading: isLoadingDropdownSupplierList,
  } = useQuery({
    queryKey: ["dropdown/supplier/list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getDropdownSupplierListRequest({
        params: { company_id: companyId },
      });
      return res.data?.data?.supplierList;
    },
    enabled: Boolean(companyId),
  });

  const selectedCompany = useMemo(() => {
    if (company_id) {
      return companyListRes?.rows?.find(({ id }) => id === company_id);
    }
  }, [company_id, companyListRes]);

  // Handle selected company related information based on party and supplier selection
  const selectedPartyCompany = useMemo(() => {
    if (party_id) {
      if (party_id?.includes("party")) {
        let temp_party_id = party_id.split("-")[1];
        return partyUserListRes?.partyList?.rows?.find(
          ({ id }) => id === +temp_party_id
        );
      } else {
        let temp_supplier_id = party_id.split("-")[1];
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
        return supplierInfo;
      }
    }
  }, [partyUserListRes?.partyList?.rows, party_id]);

  const selectedUser = useMemo(() => {
    if (party_id) {
      if (party_id?.includes("party")) {
        return "party";
      } else {
        return "supplier";
      }
    }
  }, [party_id]);

  useEffect(() => {
    if (
      bill_id &&
      bill_id?.length &&
      saleBillList &&
      saleBillList?.bills?.length
    ) {
      let totalAmount = 0;
      
      bill_id.forEach((id) => {
        
        let bill_model = String(id).split("****")[0]; 
        let bill_model_id = String(id).split("****")[1] ; 
        const data = saleBillList?.bills?.find((item) => item.bill_id === +bill_model_id && item?.model ==  bill_model);
        totalAmount += +data.amount;
      });
      setValue("amount", totalAmount);
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

    const extraTexValue = +getValues("extra_tex_value");
    if (extraTexValue) {
      const extraTexAmount = (totalAmount * extraTexValue) / 100;
      console.log(extraTexAmount);
      setValue("extra_tex_amount", extraTexAmount.toFixed(2));
      totalNetAmount -= +extraTexAmount;
    }

    totalNetAmount += totalAmount;
    setValue("net_amount", totalNetAmount.toFixed(2));
  },[]);

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
        title={`Credit Note - Late Payment`}
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
          <table className="credit-note-table">
            <tbody>
              {/* <tr>
                <td colSpan={8} className="text-center">
                  <h2>Credit Note (Late Payment)</h2>
                </td>
              </tr> */}
              <tr>
                <td colSpan={2} width={"35%"}>
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
                  <div className="year-toggle">
                    <Typography.Text style={{ fontSize: 20 }}>
                      Credit Note No.
                    </Typography.Text>
                    <div>{creditNoteLastNumber?.debitNoteNumber || ""}</div>
                  </div>
                </td>
                <td colSpan={2} width={"35%"}>
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
                        rules={{ required: "Party selection is required" }}
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
                            loading={
                              isLoadingPartyList ||
                              isLoadingDropdownSupplierList
                            }
                          >
                            {/* Party Options */}
                            {partyUserListRes?.partyList?.rows?.map((party) => (
                              <Select.Option
                                key={`party-${party?.id}`}
                                value={`party-${party?.id}`}
                              >
                                <Tag color={PURCHASE_TAG_COLOR}>PARTY</Tag>
                                <span>
                                  {`${party?.first_name} ${party?.last_name} | `.toUpperCase()}
                                  <strong>{party?.party?.company_name}</strong>
                                </span>
                              </Select.Option>
                            ))}

                            {/* Supplier Options */}
                            {dropdownSupplierListRes?.flatMap((element) =>
                              element?.supplier_company?.map((supplier) => (
                                <Select.Option
                                  key={`supplier-${supplier?.supplier_id}`}
                                  value={`supplier-${supplier?.supplier_id}`}
                                >
                                  <Tag color={JOB_TAG_COLOR}>SUPPLIER</Tag>
                                  <span>
                                    {`${supplier?.supplier_company} | `}
                                    <strong>{`${element?.supplier_name}`}</strong>
                                  </span>
                                </Select.Option>
                              ))
                            )}
                          </Select>
                        )}
                      />
                    </Form.Item>
                  </div>
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
                <td colSpan={2} width={"30%"}>
                  <div className="year-toggle">
                    <label style={{ textAlign: "left" }}>Bill No:</label>
                    <Form.Item
                      label=""
                      name="bill_id"
                      validateStatus={errors?.bill_id ? "error" : ""}
                      help={errors?.bill_id && errors?.bill_id?.message}
                      required={true}
                      wrapperCol={{ sm: 24 }}
                    >
                      <Controller
                        control={control}
                        name="bill_id"
                        render={({ field }) => (
                          <Select
                            {...field}
                            placeholder="Select Bill"
                            mode="multiple"
                            loading={isLoadingSaleBillList}
                            // options={saleBillList?.SaleBill?.map((item) => {
                            //   return {
                            //     label: item.e_way_bill_no,
                            //     value: item.id,
                            //   };
                            // })}
                            style={{
                              textTransform: "capitalize",
                            }}
                            dropdownStyle={{
                              textTransform: "capitalize",
                            }}
                          >
                            {saleBillList?.bills?.map((item) => (
                              <Select.Option key={`${item?.model}****${item?.bill_id}`} value={`${item?.model}****${item?.bill_id}`}>
                                <div style={{ display: "flex", alignItems: "center"}}>
                                  <span style={{
                                    fontWeight: 600
                                  }}>{item.bill_no}</span>
                                  <Tag color={
                                    item?.model == "purchase_taka_bills"?PURCHASE_TAG_COLOR:
                                    item?.model == "job_taka_bills"?JOB_TAG_COLOR:
                                    item?.model == "yarn_bills"?YARN_SALE_BILL_TAG_COLOR:
                                    item?.model == "beam_sale_bill"?SALE_TAG_COLOR:
                                    item?.model == "receive_size_beam_bill"?BEAM_RECEIVE_TAG_COLOR:""
                                  } style={{ marginLeft: "8px" }}>
                                    { item?.model == "purchase_taka_bills"?"PURCHASE TAKA": 
                                      item?.model == "job_taka_bills"?"JOB TAKA":
                                      item?.model == "yarn_bills"?"YARN BILL":
                                      item?.model == "beam_sale_bill"?"BEAM SALE":
                                      item?.model == "receive_size_beam_bill"?"BEAM RECEIVE":""
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
                  <b>{selectedCompany?.company_name || ""}</b>
                  <div>
                    {selectedCompany?.address_line_1 || ""}
                    {selectedCompany?.address_line_2 || ""}
                  </div>
                  <div className="credit-note-info-title">
                    <span>GSTIN/UIN:</span> {selectedCompany?.gst_no || ""}
                  </div>
                  <div className="credit-note-info-title">
                    <span>State Name: </span> {selectedCompany?.state || ""}
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
                      <div className="credit-note-info-title">
                        <span>Supplier:</span>
                        {selectedPartyCompany
                          ? `${selectedPartyCompany?.users?.first_name} ${selectedPartyCompany?.users?.last_name} (${selectedPartyCompany?.supplier_company})`
                          : ""}
                      </div>
                      <div>{selectedPartyCompany?.users?.address}</div>
                      <div className="credit-note-info-title">
                        <span>GSTIN/UIN: </span>
                        {selectedPartyCompany?.users?.gst_no || ""}
                      </div>
                      <div className="credit-note-info-title">
                        <span>Mobile: </span>{" "}
                        {selectedPartyCompany?.users?.mobile || ""}
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
                <td style={{ width: "150px" }}>Quantity</td>
                <td style={{ width: "50px" }}>Rate</td>
                <td style={{ width: "50px" }}>Per</td>
                <td style={{ width: "120px" }}>Amount</td>
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
                        billList={saleBillList || []}
                        setValue={setValue}
                      />
                    );
                  })
                : null}
              {/* <tr>
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
              </tr> */}
              <tr>
                <td></td>
                <td colSpan={3} style={{ textAlign: "right" }}>
                  <div style={{ marginBottom: "6px", fontWeight: 600 }}>
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
                          readOnly = {true}
                        />
                      )}
                    />{" "}
                    %
                  </div>
                  <div style={{ marginBottom: "6px", fontWeight: 600 }}>
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
                          readOnly = {true}
                        />
                      )}
                    />{" "}
                    %
                  </div>
                  <div style={{ marginBottom: "6px", fontWeight: 600 }}>
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
                          readOnly = {true}
                        />
                      )}
                    />{" "}
                    %
                  </div>
                  <div style={{
                    fontWeight: 600,
                    fontSize: 14
                  }}>Round Off</div>
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
                            setValue("extra_tex_value", +e.target.value);
                            calculateTaxAmount();
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
                        <span style={{ fontWeight: "500" }}>
                          Amount Chargable(in words):
                        </span>{" "}
                        {toWords.convert(net_amount || 0)}
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
            <Button>Close</Button>
          </Flex>
        </div>
      </Modal>
    </>
  );
};

export default AddLatePayment;

const SingleBillRender = ({
  billId,
  index,
  control,
  // company_id,
  billList,
  setValue,
}) => {
  const billData = billList?.SaleBill?.find((item) => item.id === billId);
  // const { data: billData } = useQuery({
  //   queryKey: [
  //     "get",
  //     "selected-bill",
  //     "data",
  //     {
  //       company_id: company_id,
  //       bill_id: billId,
  //     },
  //   ],
  //   queryFn: async () => {
  //     let response;
  //     const selectedBillData = billList?.SaleBill?.find(
  //       (item) => item.id === billId
  //     );

  //     switch (selectedBillData.model) {
  //       case "yarn_bills":
  //         response = await getYarnReceiveBillByIdRequest({
  //           id: selectedBillData.bill_id,
  //           params: { company_id: company_id },
  //         });
  //         return response?.data?.data;

  //       case "job_taka_bills":
  //         response = await getJobTakaBillByIdRequest({
  //           params: {
  //             company_id: company_id,
  //             bill_id: selectedBillData.bill_id,
  //           },
  //         });
  //         return response?.data?.data;

  //       case "receive_size_beam_bill":
  //         response = await getReceiveSizeBeamBillByIdRequest({
  //           id: selectedBillData.bill_id,
  //           params: {
  //             company_id: company_id,
  //           },
  //         });
  //         return response?.data?.data;

  //       default:
  //         return response;
  //     }
  //   },
  //   enabled: Boolean(company_id && billId),
  // });

  const calculateAmount = (per) => {
    const amount =
      ((billData?.total_meter || 0) * (billData?.rate || 0) * per) / 100;
    setValue(`amount_${index}`, amount.toFixed(2));
  };

  useEffect(() => {
    if (billData && Object.keys(billData).length) {
      // const selectedBillData = billList?.result?.find(
      //   (item) => item.bill_id === billId
      // );

      setValue(`quantity_${index}`, +billData?.total_meter || 0);
      setValue(`rate_${index}`, +billData?.rate || 0);

      setValue(`bill_id_${index}`, billId);
      setValue(`model_${index}`, "sale_bill");
      setValue(`particular_${index}`, "Late Payment");
    }
  }, [billData, billId, index, setValue]);

  return (
    <tr>
      <td style={{ textAlign: "center" }}>{index + 1}.</td>
      <td colSpan={3}>
        {/* <Form.Item
            label=""
            name={`particular_${index}`}
            // validateStatus={errors.particular ? "error" : ""}
            // help={errors.particular && errors.particular.message}
            required={true}
            wrapperCol={{ sm: 24 }}
          > */}
        <Controller
          control={control}
          name={`particular_${index}`}
          render={({ field }) => (
            <TextArea
              {...field}
              style={{ width: "100%" }}
              placeholder="Late Payment"
            />
          )}
        />
        {/* </Form.Item> */}
      </td>
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
            />
          )}
        />
        <Controller
          control={control}
          name={`bill_id_${index}`}
          render={({ field }) => (
            <Input {...field} type="hidden" placeholder="3" />
          )}
        />
        <Controller
          control={control}
          name={`model_${index}`}
          render={({ field }) => (
            <Input {...field} type="hidden" placeholder="3" />
          )}
        />
      </td>
      <td>
        <Controller
          control={control}
          name={`rate_${index}`}
          render={({ field }) => (
            <Input {...field} placeholder="3" className="remove-input-box" />
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
          render={({ field }) => <Input {...field} placeholder="3" />}
        />
      </td>
    </tr>
  );
};
