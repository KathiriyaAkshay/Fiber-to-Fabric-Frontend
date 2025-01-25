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
// import { getSaleBillListRequest } from "../../../../api/requests/sale/bill/saleBill";
import {
  createCreditNoteRequest,
  creditNoteDropDownRequest,
  getLastCreditNoteNumberRequest,
} from "../../../../api/requests/accounts/notes";
import { Controller, useForm } from "react-hook-form";
import { getPartyListRequest, getSupplierListRequest } from "../../../../api/requests/users";
import "./_style.css";
import { CloseOutlined } from "@ant-design/icons";
import { ToWords } from "to-words";
import moment from "moment";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { getDropdownSupplierListRequest } from "../../../../api/requests/users";
import { CURRENT_YEAR_TAG_COLOR, PREVIOUS_YEAR_TAG_COLOR } from "../../../../constants/tag";
import { JOB_TAG_COLOR, PURCHASE_TAG_COLOR } from "../../../../constants/tag";
import { getFinancialYearEnd } from "../../../../pages/accounts/reports/utils";
import { BEAM_RECEIVE_TAG_COLOR, SALE_TAG_COLOR, YARN_SALE_BILL_TAG_COLOR } from "../../../../constants/tag";
import { BEAM_SALE_BILL_MODEL, BEAM_SALE_MODEL_NAME, JOB_GREAY_BILL_MODEL_NAME, JOB_GREAY_SALE_BILL_MODEL, JOB_WORK_BILL_MODEL, JOB_WORK_MODEL_NAME, SALE_BILL_MODEL, SALE_BILL_MODEL_NAME, YARN_SALE_BILL_MODEL, YARN_SALE_BILL_MODEL_NAME } from "../../../../constants/bill.model";
import { getSaleBillListRequest } from "../../../../api/requests/sale/bill/saleBill";
import { getJobGraySaleBillListRequest } from "../../../../api/requests/sale/bill/jobGraySaleBill";
import { saleJobWorkChallanListRequest } from "../../../../api/requests/sale/challan/challan";
import { saleYarnChallanListRequest } from "../../../../api/requests/sale/challan/challan";
import { getBeamSaleChallanListRequest } from "../../../../api/requests/sale/challan/beamSale";
import { extractCreditNoteData } from "../../../../utils/supplier.handler";
import UserInformationComp from "./userinformationComp";
import { calculateFinalNetAmount } from "../../../../constants/taxHandler";

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
  bill_id: yup
    .array()
    .of(yup.string().required("Invalid bill ID"))
    .min(1, "Please select at least one bill.")
    .required("Please select bill.")
});

const AddDiscountNote = ({ setIsAddModalOpen, isAddModalOpen }) => {
  const queryClient = useQueryClient();
  const { companyId, companyListRes } = useContext(GlobalContext);
  const [userInformation, setUserInformation] = useState({}) ; 

  const [numOfBill, setNumOfBill] = useState([]);

  const { mutateAsync: addCreditClaimNOte, isPending } = useMutation({
    mutationFn: async ({ data, companyId }) => {
      const res = await createCreditNoteRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["add", "credit", "discount-note"],
    onSuccess: (res) => {
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
        temp_total_meter = +temp_total_meter + +data[`total_meter_${index}`] ||0  ; 
        temp_total_taka  = +temp_total_taka + data[`total_taka_${index}`] || 0; 
      })

      numOfBill?.map((id, index) => {
        temp_credit_notes_data.push({
          bill_id: data[`bill_id_${index}`], 
          model: data[`model_${index}`], 
          per: 1.0, 
          invoice_no: data[`bill_number_${index}`], 
          bill_no: data[`bill_number_${index}`], 
          particular_name: "Discount On Sales", 
          amount: +data[`amount_${index}`], 
          quality_id: +data[`quality_id_${index}`], 
          yarn_company_id: data[`yarn_company_id_${index}`]
        })
      })
      const payload = {
        credit_note_number: creditNoteLastNumber?.debitNoteNumber || "",
        credit_note_type: "discount",
        party_id: null,
        SGST_value: +data.SGST_value,
        SGST_amount: +data.SGST_amount,
        CGST_value: +data.CGST_value,
        CGST_amount: +data.CGST_amount,
        IGST_value: +data.IGST_value,
        IGST_amount: +data.IGST_amount,
        round_off_amount: +data.round_off_amount,
        net_amount: +data.net_amount,
        createdAt: dayjs(data.date).format("YYYY-MM-DD"),
        total_meter: temp_total_meter, 
        total_taka: temp_total_taka , 
        credit_note_details: temp_credit_notes_data,
      };
      if (!userInformation?.is_supplier){
        payload["party_id"] = userInformation?.user_id
      } else {
        payload["supplier_id"] = userInformation?.user_id
      }
      await addCreditClaimNOte({ data: payload, companyId: data.company_id });
    }
  };

  const {
    control,
    handleSubmit,
    watch,
    resetField,
    setValue,
    formState: { errors },
    getValues,
    reset,
    setError
  } = useForm({
    defaultValues: {
      company_id: null,
      date: dayjs(),
      bill_id: null,
      supplier_id: null,
      sale_challan_id: "",
      quality_id: "",
      SGST_value: 2.5,
      SGST_amount: 0,
      CGST_value: 2.5,
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
    SGST_amount,
    CGST_amount,
    IGST_amount,
    net_amount,
    party_id,
    round_off_amount
  } = currentValue;

  useEffect(() => {
    if (party_id) {
      resetField("bill_id");
      setNumOfBill([]);
    }
  }, [resetField, party_id]);

  // Load Bill number related dropdown request
  const { data: saleBillList, isLoadingSaleBillList } = useQuery({
    queryKey: [
      "saleBill",
      "list",
      {
        company_id: company_id,
        party_id: party_id,
        end: getFinancialYearEnd("current"),
      },
    ],
    queryFn: async () => {
      let is_party = party_id?.includes("party") ? true : false;
      let party_id_value = String(party_id).split("***")[1];

      const params = {
        company_id: company_id,
        page: 0,
        pageSize: 99999,
        end: getFinancialYearEnd("current"),
        type: "discount_note",
      };

      if (is_party) {
        params["party_id"] = party_id_value;
      } else {
        params["supplier_id"] = party_id_value;
      }

      const res = await creditNoteDropDownRequest ({ params });
      return res.data?.data;
    },
    enabled: Boolean(company_id && party_id),
  });

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

  // Load Partylist dropdown related api =========================================================
  const { data: partyUserListRes, isLoading: isLoadingPartyList } = useQuery({
    queryKey: ["party", "list", { company_id: company_id }],
    queryFn: async () => {
      const res = await getPartyListRequest({
        params: { company_id: company_id },
      });
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

  // Load Supplier list related dropdown api =======================================================
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


  // Total tax amount calculation related flow
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
    
    let taxData = calculateFinalNetAmount(
      +totalAmount, 
      SGSTValue,
      CGSTValue, 
      IGSTValue, 
      0, 
      0 || 0
    )

    setValue("net_amount", taxData.finalNetAmount);
    setValue("round_off_amount", taxData?.roundOffValue) ; 
  };

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
        title="Credit Note - Discount Note"
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
              <tr>
                <td colSpan={8} className="text-center">
                  <div className="year-toggle">
                    <Typography.Text style={{ fontSize: 20 }}>
                      Discount Note No.
                    </Typography.Text>
                    <div style={{ color: "red" }}>
                      {creditNoteLastNumber?.debitNoteNumber || ""}
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td colSpan={2} width={"25%"}>
                  <div className="year-toggle">
                    <label style={{ textAlign: "left" }}>Date:</label>
                    <Controller
                      control={control}
                      name="date"
                      render={({ field }) => (
                        <DatePicker
                          {...field}
                          className="width-100"
                          disabledDate={disabledFutureDate}
                        />
                      )}
                    />
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
                            {partyUserListRes?.partyList?.rows?.map((party) => {
                              return(
                                <Select.Option
                                  key={`party-${party?.party?.user_id}`}
                                  value={`party***${party?.party?.user_id}`}
                                  className = {"credit-note-user-selection-dropdown"}
                                >
                                  <Tag color={PURCHASE_TAG_COLOR}>PARTY</Tag>
                                  <span>
                                    {`${party?.first_name} ${party?.last_name} | `.toUpperCase()}
                                    <strong>{party?.party?.company_name}</strong>
                                  </span>
                                </Select.Option>
                              )
                            })}

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
                            placeholder="Select Bill"
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
                              {saleBillList?.bills?.map((item) => (
                                <Select.Option key={item.bill_no} value={`${item?.model}****${item?.bill_id}`}>
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <span style={{
                                      fontWeight: 600
                                    }}>{item.bill_no}</span>
                                    <Tag color={
                                      item?.model ==  SALE_BILL_MODEL?SALE_TAG_COLOR:
                                      item?.model == YARN_SALE_BILL_MODEL?YARN_SALE_BILL_TAG_COLOR:
                                      item?.model == JOB_GREAY_SALE_BILL_MODEL?JOB_TAG_COLOR:
                                      item?.model == BEAM_SALE_BILL_MODEL?BEAM_RECEIVE_TAG_COLOR:
                                      item?.model == JOB_WORK_BILL_MODEL?JOB_TAG_COLOR:"default"
                                    } style={{ marginLeft: "8px" }}>
                                      { item?.model == SALE_BILL_MODEL?SALE_BILL_MODEL_NAME: 
                                        item?.model == YARN_SALE_BILL_MODEL?YARN_SALE_BILL_MODEL_NAME:
                                        item?.model == JOB_GREAY_SALE_BILL_MODEL?JOB_GREAY_BILL_MODEL_NAME:
                                        item?.model == BEAM_SALE_BILL_MODEL?BEAM_SALE_MODEL_NAME:
                                        item?.model == JOB_WORK_BILL_MODEL?JOB_WORK_MODEL_NAME:"" 
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
                    <span>State Name:</span> {selectedCompany?.state || ""}
                  </div>
                  <div className="credit-note-info-title">
                    <span>PinCode: </span> {selectedCompany?.pincode || ""}
                  </div>
                  <div className="credit-note-info-title">
                    <span>Contact:</span>{" "}
                    {selectedCompany?.company_contact || ""}
                  </div>
                  <div className="credit-note-info-title">
                    <span>Email:</span> {selectedCompany?.company_email || ""}
                  </div>
                </td>
                <td colSpan={4} style={{verticalAlign: "top"}}>
                  <UserInformationComp
                    user={userInformation}
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
                <td style={{ width: "80px" }}>Rate</td>
                <td style={{ width: "100px" }}>Per</td>
                <td style={{ width: "150px", fontWeight: 600 }}>Amount</td>
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
                        userInformation = {userInformation}
                        setUserInformation = {setUserInformation}
                        calculateTaxAmount = {calculateTaxAmount}
                        getValues = {getValues}
                      />
                    );
                  })
                : null}
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
                  <div>{round_off_amount}</div>
                </td>
              </tr>
              <tr>
                <td></td>
                <td style={{ fontWeight: 600 }} colSpan={3}>
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
        </div>
      </Modal>
    </>
  );
};

export default AddDiscountNote;

const SingleBillRender = ({
  billId,
  index,
  control,
  company_id,
  billList,
  setValue,
  userInformation, 
  setUserInformation, 
  calculateTaxAmount, 
  getValues
}) => {
  const temp_bill_id = String(billId).split("****")[1] ; 
  const temp_bill_model = String(billId).split("****")[0] ;
  const [billInformation, setBillInformation] = useState({}) ; 

  // Get Particular bill information ================================= = 
  const { data: billData } = useQuery({
    queryKey: [
      "get",
      "selected-bill",
      "data",
      {
        company_id: company_id,
        bill_id: temp_bill_id,
      },
    ],
    queryFn: async () => {
      let response;
      let params = {
        company_id: company_id,
        bill_id: temp_bill_id,
        page: 0,
        pageSize: 10
      }

      switch (temp_bill_model) {
        case SALE_BILL_MODEL:
          response = await getSaleBillListRequest({ params });
          if (response?.data?.success) {
            return {
              ...response?.data?.data?.SaleBill[0],
              model: SALE_BILL_MODEL
            }
          }
        case JOB_GREAY_SALE_BILL_MODEL:
          response = await getJobGraySaleBillListRequest({ params });
          if (response?.data?.success) {
            return {
              ...response?.data?.data?.jobGraySaleBill[0],
              model: JOB_GREAY_SALE_BILL_MODEL
            }
          }
        case JOB_WORK_BILL_MODEL:
          response = await saleJobWorkChallanListRequest({ params });
          return {
            ...response?.data?.data?.list[0],
            model: JOB_WORK_BILL_MODEL
          }
        case YARN_SALE_BILL_MODEL: 
          response = await saleYarnChallanListRequest({params}) ; 
          return {
            ...response?.data?.data?.list[0], 
            model: YARN_SALE_BILL_MODEL
          }
        case BEAM_SALE_BILL_MODEL:
          response = await getBeamSaleChallanListRequest({params}) ; 
          return {
            ...response?.data?.data?.rows[0], 
            model: BEAM_SALE_BILL_MODEL
          }
        default:
          return {}
      }
    }
  })

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
    if (billData && Object.keys(billData).length) {
      let data = extractCreditNoteData(billData, billData?.model) ; 

      if (userInformation?.username == undefined){
        setUserInformation(data?.user) ; 
      }

      // Set Bill information 
      let billInfo = data?.bill ; 
      setBillInformation(billInfo)

      setValue(`quantity_${index}`, billInfo?.total_meter) ; 
      setValue(`rate_${index}`, billInfo?.rate) ; 
      setValue(`bill_id_${index}`, billInfo?.bill_id) ; 
      setValue(`model_${index}`, temp_bill_model) ; 
      setValue(`bill_number_${index}`, billInfo?.bill_number) ; 
      setValue(`quality_id_${index}`, billInfo?.quality_id) ; 
      setValue(`yarn_company_id_${index}`, billInfo?.yarn_company_id) ;
      setValue(`total_meter_${index}`, billInfo?.total_meter) ; 
      setValue(`total_taka_${index}`, billInfo?.total_taka) ;  

    }
  }, [billData, billId, index, setValue]);

  return (
    <tr>
      <td style={{ textAlign: "center" }}>{index + 1}.</td>
      <td colSpan={3}>Discount On Sales</td>
      <td>
        <Controller
          control={control}
          name={`quantity_${index}`}
          render={({ field }) => (
            <Input
              {...field}
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
            <Input {...field} placeholder="3" className="remove-input-box" type="number" readOnly = {+getValues(`rate_${index}`) == 0?false:true} />
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
          render={({ field }) => <Input {...field} placeholder="3" 
            type="number" 
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
            }}
          />}
        />
      </td>
    </tr>
  );
};
