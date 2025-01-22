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
import {  getSupplierListRequest } from "../../../../api/requests/users";
import TextArea from "antd/es/input/TextArea";
import "./_style.css";
import { getSaleBillListRequest } from "../../../../api/requests/sale/bill/saleBill";
import moment from "moment";
import { CloseOutlined } from "@ant-design/icons";
import { ToWords } from "to-words";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { CURRENT_YEAR_TAG_COLOR, JOB_TAG_COLOR, PREVIOUS_YEAR_TAG_COLOR, PURCHASE_TAG_COLOR } from "../../../../constants/tag";
import { getFinancialYearEnd } from "../../../../pages/accounts/reports/utils";
import { BEAM_RECEIVE_TAG_COLOR, SALE_TAG_COLOR, YARN_SALE_BILL_TAG_COLOR } from "../../../../constants/tag";
import SupplierInformationComp from "../DebitNotes/supplierInformationComp";
import { GENERAL_PURCHASE_MODEL_NAME, GENRAL_PURCHASE_BILL_MODEL, JOB_REWORK_BILL_MODEL, JOB_REWORK_MODEL_NAME, JOB_TAKA_BILL_MODEL, JOB_TAKA_MODEL_NAME, PURCHASE_TAKA_BILL_MODEL, PURCHASE_TAKA_MODEL_NAME, RECEIVE_SIZE_BEAM_BILL_MODEL, RECEIVE_SIZE_BEAM_MODEL_NAME, YARN_RECEIVE_BILL_MODEL, YARN_RECEIVE_MODEL_NAME } from "../../../../constants/bill.model";
import { getYarnReceiveBillByIdRequest } from "../../../../api/requests/purchase/yarnReceive";
import { getJobTakaBillByIdRequest } from "../../../../api/requests/job/bill/jobBill";
import { getReceiveSizeBeamBillByIdRequest } from "../../../../api/requests/purchase/purchaseSizeBeam";
import { getGeneralPurchaseByIdRequest } from "../../../../api/requests/purchase/purchaseSizeBeam";
import { getPurchaseTakaBillByIdRequest } from "../../../../api/requests/purchase/bill";
import { getReworkChallanListRequest } from "../../../../api/requests/job/challan/reworkChallan";
import { extractSupplierInformation } from "../../../../utils/supplier.handler";

const toWords = new ToWords({
  localeCode: "en-IN",
  converterOptions: {
    currency: true,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
    doNotAddOnly: false,
    currencyOptions: {
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
  party_id: yup.string().required("Please select party"),
  date: yup.string().required("Please enter date"),
  extra_tex_name: yup.string().required("Please, Enter extra tex name"),
  extra_tex_value: yup.string().required("Please, Enter extra tax value"),
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
  // const isEditMode = !_.isNull(creditNoteData);
  const queryClient = useQueryClient();
  const { companyId, companyListRes } = useContext(GlobalContext);
  const [numOfBill, setNumOfBill] = useState([]);
  const [userInformation, setUserInformation] = useState({});

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

    let SGST_value = data.SGST_value ; 
    let CGST_value = data.CGST_value ; 
    let IGST_value = data.IGST_value ;
    if (SGST_value === "" || SGST_value == undefined){
      message.warning("Please, Enter SGST amount") ; 
    } else if (CGST_value === "" || CGST_value == undefined){
      message.warning("Please, Enter CGST amount") ; 
    } else if (IGST_value === "" || IGST_value == undefined){
      message.warning("Please, Enter IGST amount") ; 
    } else {

      let hasError = false; 
      bill_id?.map((element, index) => {
        let bill_amount = getValues(`amount_${index}`) ;
        let bill_number = getValues(`bill_number_${index}`) ; 
        let particular_name = getValues(`particular_${index}`) ;  

        if (bill_amount === "" || bill_amount == undefined || bill_amount == null){
          message.warning(`Please, Enter bill amount for bill : ${bill_number}`) ; 
          hasError = true ; 
          return ; 
        } 

        if (particular_name === "" || particular_name == undefined || particular_name == null){
          message.warning(`Please, Enter bill related information for bill: ${bill_number}`) ; 
          hasError = true; 
          return ; 
        }
      })

      if (!hasError){
        const temp_credit_notes_data = [];
        bill_id?.map((id, index) => {
          temp_credit_notes_data.push({
            bill_id: +data[`bill_id_${index}`],
            model: data[`model_${index}`],
            per: 1.0,
            invoice_no: data[`bill_number_${index}`],
            bill_no: data[`bill_number_${index}`],
            particular_name: data[`particular_${index}`],
            amount: data[`amount_${index}`], 
            quality_id: +data[`quality_id_${index}`], 
            yarn_company_id: data[`yarn_company_id_${index}`]
          })
        })
    
        const payload = {
          credit_note_number: creditNoteLastNumber?.debitNoteNumber || "",
          credit_note_type: "late",
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
          supplier_id: userInformation?.supplier_id,
          credit_note_details: temp_credit_notes_data,
          total_meter: 0, 
          total_taka: 0 
        };

        await addCreditNote({ data: payload, companyId: data.company_id });
      }
  
    }

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
    },
    resolver: yupResolver(validationSchema),
  });

  const {
    company_id,
    party_id,
    SGST_amount,
    CGST_amount,
    IGST_amount,
    round_off_amount,
    extra_tex_amount,
    net_amount,
    bill_id
  } = watch();

  useEffect(() => {
    if (company_id) {
      resetField("party_id");
      setNumOfBill([]);
    }
  }, [company_id, resetField]);


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

  // Load Supplier list dropdown =====================================
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

  const selectedCompany = useMemo(() => {
    if (company_id) {
      return companyListRes?.rows?.find(({ id }) => id === company_id);
    }
  }, [company_id, companyListRes]);

  useEffect(() => {
    console.log("Bill id", bill_id);

    if (bill_id !== undefined && numOfBill?.length == 0 && bill_id !== null) {
      setNumOfBill([0]);
      setValue(`particular_0`, "Late Payment income")
    }
  }, [bill_id])

  useEffect(() => {

    let totalAmount = 0;
    let totalNetAmount = 0;
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
      setValue("extra_tex_amount", extraTexAmount.toFixed(2));
      totalNetAmount -= +extraTexAmount;
    }

    totalNetAmount += totalAmount;
    setValue("net_amount", totalNetAmount.toFixed(2));
  }, []);

  useEffect(() => {
    console.log("Bill id related information");
    console.log(bill_id);
    
  }, [bill_id])

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
                        rules={{ required: "Supplier company selection required" }}
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

                            {/* Suplier dropdown option  */}
                            {dropdownSupplierListRes?.rows?.flatMap((element) => (
                              <Select.Option
                                key={`supplier-${element?.id}`}
                                value={`supplier***${element?.id}`}
                                className={"credit-note-user-selection-dropdown"}
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
                            {saleBillList?.bills?.map((item) => (
                              <Select.Option key={`${item?.model}****${item?.bill_id}`} value={`${item?.model}****${item?.bill_id}`}>
                                <div style={{ display: "flex", alignItems: "center" }}>
                                  <span style={{
                                    fontWeight: 600
                                  }}>{item.bill_no}</span>
                                  <Tag color={
                                    item?.model == PURCHASE_TAKA_BILL_MODEL ? PURCHASE_TAG_COLOR :
                                      item?.model == JOB_TAKA_BILL_MODEL ? JOB_TAG_COLOR :
                                        item?.model == YARN_RECEIVE_BILL_MODEL ? YARN_SALE_BILL_TAG_COLOR :
                                          item?.model == JOB_REWORK_BILL_MODEL ? JOB_TAG_COLOR :
                                            item?.model == RECEIVE_SIZE_BEAM_BILL_MODEL ? BEAM_RECEIVE_TAG_COLOR :
                                              item?.model == GENRAL_PURCHASE_BILL_MODEL ? PURCHASE_TAG_COLOR : ""
                                  } style={{ marginLeft: "8px" }}>
                                    {item?.model == PURCHASE_TAKA_BILL_MODEL ? PURCHASE_TAKA_MODEL_NAME :
                                      item?.model == JOB_TAKA_BILL_MODEL ? JOB_TAKA_MODEL_NAME :
                                        item?.model == YARN_RECEIVE_BILL_MODEL ? YARN_RECEIVE_MODEL_NAME :
                                          item?.model == RECEIVE_SIZE_BEAM_BILL_MODEL ? RECEIVE_SIZE_BEAM_MODEL_NAME :
                                            item?.model == JOB_REWORK_BILL_MODEL ? JOB_REWORK_MODEL_NAME :
                                              item?.model == GENRAL_PURCHASE_BILL_MODEL ? GENERAL_PURCHASE_MODEL_NAME : ""
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
                  <SupplierInformationComp
                    supplier={userInformation}
                  />
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
              {bill_id && bill_id.length
                ? bill_id.map((id, index) => {
                  return (
                    <SingleBillRender
                      key={index}
                      index={index}
                      billId={id}
                      control={control}
                      company_id={company_id}
                      billList={saleBillList || []}
                      setValue={setValue}
                      getValues={getValues}
                      userInformation={userInformation}
                      setUserInformation={setUserInformation}
                    />
                  );
                })
                : null}
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
                <td colSpan={3} style={{
                  fontWeight: 600
                }}>Total</td>
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
  company_id,
  billList,
  setValue,
  getValues,
  userInformation,
  setUserInformation
}) => {
  const [billInformation, setBillInforamtion] = useState({}) ; 
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
      let temp_bill_type = String(billId).split("****")[0];
      let temp_bill_id = String(billId).split("****")[1];

      switch (temp_bill_type) {
        case YARN_RECEIVE_BILL_MODEL:
          response = await getYarnReceiveBillByIdRequest({
            id: temp_bill_id,
            params: { company_id: company_id },
          });
          response = {
            ...response?.data?.data,
            ...response?.data?.data?.yarnReciveBill,
            model: YARN_RECEIVE_BILL_MODEL
          };
          delete response.yarnReciveBill;
          return response;
        case JOB_TAKA_BILL_MODEL:
          response = await getJobTakaBillByIdRequest({
            params: {
              company_id: company_id,
              bill_id: temp_bill_id,
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
            id: temp_bill_id,
            params: {
              company_id: company_id,
            },
          });
          response = {
            ...response?.data?.data,
            ...response?.data?.data?.receive,
            model: RECEIVE_SIZE_BEAM_BILL_MODEL
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
              page: 0,
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
    const amount =
      ((billData?.total_meter || 0) * (billData?.rate || 0) * per) / 100;
    setValue(`amount_${index}`, amount.toFixed(2));
  };

  useEffect(() => {
    if (billData && Object.keys(billData).length) {
      let data = extractSupplierInformation(billData, billData?.model) ; 
      if (userInformation?.supplier_id == undefined){
        setUserInformation(data?.supplier) ; 
      }
      setValue(`particular_${index}`, "Late Payment");

      // Set Bill information 
      let billInfo = data?.bill ; 
      setBillInforamtion(billInfo) ;
      let temp_bill_type = String(billId).split("***")[0];
      let temp_bill_id = String(billId).split("***")[1];
      setValue(`quantity_${index}`, +billInfo?.total_meter || 0);
      setValue(`rate_${index}`, +billInfo?.rate || 0);
      setValue(`bill_id_${index}`, temp_bill_id);
      setValue(`model_${index}`, temp_bill_type);
      setValue(`bill_amount_${index}`, billInfo?.bill_amount) ; 
      setValue(`bill_net_amount_${index}`, billInfo?.bill_net_amount) ; 
      setValue(`bill_number_${index}`, billInfo?.bill_no) ; 
      setValue(`quality_id_${index}`, billInfo?.quality_id) ; 
      setValue(`yarn_company_id_${index}`, billInfo?.yarn_company_id) ; 

      let amount = getValues(`amount_${index}`) || 0 ; 
      amount = +amount + +billInfo?.interest_amount ; 
      setValue(`amount_${index}`, parseFloat(amount).toFixed(2))      

    }
  }, [billData, billId, index, setValue]);
  return (
    <tr>
      <td style={{ textAlign: "center" }}>{index + 1}.</td>
      <td colSpan={3}>
        <div>
          <span style={{
            fontWeight: 600
          }}>Bill : {getValues(`bill_number_${index}`)}</span>
        </div>
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
      </td>
      <td>
        {/* <Controller
          control={control}
          name={`quantity_${index}`}
          render={({ field }) => (
            <Input
              {...field}
              placeholder="3"
              className="remove-input-box"
            />
          )}
        /> */}
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
        {/* <Controller
          control={control}
          name={`rate_${index}`}
          render={({ field }) => (
            <Input {...field} placeholder="3" className="remove-input-box" />
          )}
        /> */}
        <div>
          <div>
            <span style={{fontWeight: 600}}>Rate :</span> {getValues(`rate_${index}`) || 0}
          </div>
          <div>
            <span style={{fontWeight: 600}}>Bill Amount (Exl. GST)</span> {billInformation?.bill_amount}
          </div>
          <div>
            <span style={{fontWeight: 600, color: "blue"}}>Bill Amount (With. GST)</span> {billInformation?.bill_net_amount}
          </div>
        </div>
      </td>
      <td>
        {/* <Controller
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
        /> */}
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
