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
  Tag
} from "antd";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { useContext, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCreditNoteRequest,
  creditNoteDropDownRequest,
  getLastCreditNoteNumberRequest,
} from "../../../../api/requests/accounts/notes";
import { Controller, useForm } from "react-hook-form";
import { getPartyListRequest } from "../../../../api/requests/users";
import "./_style.css";
import { CloseOutlined } from "@ant-design/icons";
import { ToWords } from "to-words";
import moment from "moment";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { getDropdownSupplierListRequest } from "../../../../api/requests/users";
import { CURRENT_YEAR_TAG_COLOR, PREVIOUS_YEAR_TAG_COLOR, PURCHASE_TAG_COLOR } from "../../../../constants/tag";
import { getFinancialYearEnd } from "../../../../pages/accounts/reports/utils";
import { BEAM_RECEIVE_TAG_COLOR, JOB_TAG_COLOR, SALE_TAG_COLOR, YARN_SALE_BILL_TAG_COLOR } from "../../../../constants/tag";


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
  // amount: yup.string().required("Please enter amount"),
  bill_id: yup
    .array()
    .of(yup.string().required("Invalid bill ID"))
    .min(1, "Please select at least one bill.")
    .required("Please select bill.")
});

const AddDiscountNote = ({ setIsAddModalOpen, isAddModalOpen }) => {
  const queryClient = useQueryClient();
  const { companyId, companyListRes } = useContext(GlobalContext);

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
    numOfBill?.map((id, index) => {
      temp_credit_notes_data.push({
        bill_id: data[`bill_id_${index}`], 
        model: data[`model_${index}`], 
        per: 1.0, 
        invoice_no: data[`bill_number_${index}`], 
        bill_no: data[`bill_number_${index}`], 
        particular_name: "Discount On Sales", 
        amount: +data[`amount_${index}`]
      })
    })
    const payload = {
      // supplier_id: billData?.supplier_id,
      // model: selectedBillData?.model,
      credit_note_number: creditNoteLastNumber?.debitNoteNumber || "",
      credit_note_type: "discount",
      // sale_challan_id: 456,
      // quality_id: data?.quality_id,
      party_id: null,
      // gray_order_id: 321,
      // sale_return_id: 5050,
      // hsn_no: "HSN456",
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
      credit_note_details: temp_credit_notes_data,
    };
    if (selectedPartyCompany?.party !== null && selectedPartyCompany?.party  !== undefined){
      payload["party_id"] = selectedPartyCompany?.party?.id
    } else {
      payload["supplier_id"] = selectedPartyCompany?.supplier_id
    }
    await addCreditClaimNOte({ data: payload, companyId: data.company_id });
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
    // supplier_id,
    SGST_amount,
    CGST_amount,
    IGST_amount,
    net_amount,
    party_id,
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
        end: getFinancialYearEnd("current")
      },
    ],
    queryFn: async () => {
      let is_party = party_id?.includes("party")?true:false
      let party_id_value = String(party_id).split("***")[1] ; 

      const params = {
        company_id: company_id,
        page: 0,
        pageSize: 99999,
        end: getFinancialYearEnd("current"), 
        type: "discount_note"
      };

      if (is_party){
        params["party_id"] = party_id_value
      } else {
        params["supplier_id"] = party_id_value
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

  // Load Partylist Dropdown ===========================================
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

  // Load SupplierList DropDown =====================================
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
        let temp_party_id = party_id.split("***")[1];
        return partyUserListRes?.partyList?.rows?.find(
          ({ id }) => id === +temp_party_id
        );
      } else {
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
        return supplierInfo
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
  }, [party_id])

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
                    <div style={{ color: "red" }}>{creditNoteLastNumber?.debitNoteNumber || ""}</div>
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
                        <DatePicker {...field} className="width-100" disabledDate={disabledFutureDate} />
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
                            loading={isLoadingPartyList}
                          >
                            {/* Party Options */}
                            {partyUserListRes?.partyList?.rows?.map((party) => (
                              <Select.Option key={`party-${party?.id}`} value={`party***${party?.id}`}>
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
                                <Select.Option key={`supplier-${supplier?.supplier_id}`} value={`supplier***${supplier?.supplier_id}`}>
                                  <Tag color={JOB_TAG_COLOR}>SUPPLIER</Tag>
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
                            // options={saleBillList?.SaleBill?.map((item) => {
                            //   return {
                            //     label: item.e_way_bill_no,
                            //     value: item.id,
                            //   };
                            // })}
                            onChange={(selectedValue) => {
                              setValue("bill_id", selectedValue);
                              setNumOfBill(selectedValue);
                            }}
                          >
                              {saleBillList?.bills?.map((item) => (
                                <Select.Option key={item.bill_no} value={`${item?.model}****${item?.bill_id}`}>
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <span style={{
                                      fontWeight: 600
                                    }}>{item.bill_no}</span>
                                    <Tag color={
                                      item?.model == "sale_biills"?SALE_TAG_COLOR:
                                      item?.model == "yarn_sale_bills"?YARN_SALE_BILL_TAG_COLOR:
                                      item?.model == "job_gray_sale_bill"?JOB_TAG_COLOR:
                                      item?.model == "beam_sale_bill"?BEAM_RECEIVE_TAG_COLOR:"default"
                                    } style={{ marginLeft: "8px" }}>
                                      { item?.model == "sale_biills"?"Sale Bill": 
                                        item?.model == "yarn_sale_bills"?"Yarn Sale":
                                        item?.model == "job_gray_sale_bill"?"Job Gray":
                                        item?.model == "beam_sale_bill"?"Beam Sale":item?.model 
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
                  <div>0</div>
                </td>
              </tr>
              <tr>
                <td></td>
                <td style={{ fontWeight: 600 }} colSpan={3}>Total</td>
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
  // company_id,
  billList,
  setValue,
}) => {
  const temp_bill_id = String(billId).split("****")[1] ; 
  const temp_bill_model = String(billId).split("****")[0] ;
  const billData = billList?.bills?.find((item) => item.bill_id === +temp_bill_id && item?.model == temp_bill_model);

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
      ((billData?.total_meter || +billData?.meter || 0) * (billData?.rate || 0) * per) / 100;
    setValue(`amount_${index}`, amount.toFixed(2));
  };

  

  useEffect(() => {
    if (billData && Object.keys(billData).length) {
      console.log(billData);
      
      setValue(`quantity_${index}`, +billData?.total_meter || +billData?.quantity || +billData?.meter);
      setValue(`rate_${index}`, +billData?.rate || 0);
      setValue(`bill_id_${index}`, temp_bill_id);
      setValue(`model_${index}`, temp_bill_model);
      setValue(`bill_number_${index}`, billData?.bill_no || billData?.invoice_no)
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
