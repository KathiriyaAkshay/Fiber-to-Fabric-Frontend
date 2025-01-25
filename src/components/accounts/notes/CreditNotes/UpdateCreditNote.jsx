import { Button, DatePicker, Flex, Form, Input, message, Modal } from "antd";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { useContext, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCreditNoteRequest } from "../../../../api/requests/accounts/notes";
import { Controller, useForm } from "react-hook-form";
import "./_style.css";
import moment from "moment";
import { CloseOutlined } from "@ant-design/icons";
import { ToWords } from "to-words";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import _ from "lodash";
import { mutationOnErrorHandler } from "../../../../utils/mutationUtils";
import { calculateFinalNetAmount } from "../../../../constants/taxHandler";
import { CREDIT_NOTE_SALE_RETURN } from "../../../../constants/tag";
import { CREDIT_NOTE_BEAM_SALE_RETURN, CREDIT_NOTE_YARN_SALE_RETURN } from "../../../../constants/bill.model";

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
});

const UpdateCreditNote = ({
  details,
  isModalOpen,
  setIsModalOpen,
  creditNoteTypes,
}) => {
  function disabledFutureDate(current) {
    return current && current > moment().endOf("day");
  }
  const queryClient = useQueryClient();
  const { companyListRes } = useContext(GlobalContext);
  const [numOfBill, setNumOfBill] = useState([]);
  const [buyerRef, setBuyerRef] = useState(undefined) ; 
  const [descriptionGoods, setDescriptionGoods] = useState(undefined) ; 

  useEffect(() => {
    if (details){
      let ref_number = details?.credit_note_details?.map((element) => element?.bill_no || element?.invoice_no).join(",") ; 
      setBuyerRef(ref_number) ; 
      
      if (details?.credit_note_details?.length == 1){
        setDescriptionGoods(details?.credit_note_details[0]?.particular_name) ; 
      } else {

      }
    }
  }, [details]) ; 

  function disabledFutureDate(current) {
    return current && current > moment().endOf("day");
  }

  const { mutateAsync: updateCreditNote, isPending } = useMutation({
    mutationFn: async ({ data, companyId }) => {
      const res = await updateCreditNoteRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["update", "credit", "note"],
    onSuccess: (res) => {
      queryClient.invalidateQueries(["get", "credit-notes", "list"]);
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      reset();
      setIsModalOpen(false);
    },
    onError: (error) => {
      mutationOnErrorHandler({ error });
    },
  });

  const onSubmit = async (data) => {
    const payload = {
      id: details.id,
      credit_note_type: creditNoteTypes,
      credit_note_number: details?.credit_note_number,
      party_id: details?.party_id,
      hsn_no: details.hsn_no || "HSN0036",
      total_taka: +details.total_taka,
      total_meter: +details.total_meter,
      discount_value: +data.discount_value,
      discount_amount: +data.discount_amount,
      SGST_value: +data.SGST_value,
      SGST_amount: +data.SGST_value,
      CGST_value: +data.SGST_value,
      CGST_amount: +data.SGST_value,
      IGST_value: +data.SGST_value,
      IGST_amount: +data.SGST_value,
      round_off_amount: +data.round_off_value,
      net_amount: +data.net_amount,
      rate: data.rate || 0,
      tcs_value: +data.TCS_value,
      tcs_amount: +data.TCS_amount,
      createdAt: dayjs(data.date).format("YYYY-MM-DD"),
      extra_tex_value: +data?.TDS_value, 
      extra_tex_amount: +data?.TDS_amount, 
      supplier_id: details?.supplier_id
    };
    
    let hasError = false ; 
    
    // Validation for SGST_amount, CGST_amount, IGST_amount, and other amounts
    const amountsToValidate = [
      { label: "SGST Amount", value: data.SGST_value },
      { label: "CGST Amount", value: data.CGST_value },
      { label: "IGST Amount", value: data.IGST_value },
      { label: "TDS Amount", value: data.TDS_value },
    ];
  
    const invalidAmount = amountsToValidate.find(
      (amount) => amount.value === undefined || amount.value === null || amount.value === ""
    );
  
    if (invalidAmount) {
      message.warning(`${invalidAmount.label} cannot be empty.`);
      return; // Stop execution if validation fails
    }

    if (
      creditNoteTypes === "late" ||
      creditNoteTypes === "discount" ||
      creditNoteTypes === "claim" ||
      creditNoteTypes === "other"
    ) {

      // Validate bill amount for each bill
      numOfBill.map((_, index) => {
        const amount = data[`amount_${index}`] || undefined;
        if (amount === undefined){
          hasError = true ; 
        }
      });
      
      if (hasError) { // If invalidBill is found, show warning
        message.warning("Bill Amount cannot be empty or invalid for all bills.");
        return; // Stop execution if validation fails
      } 

      payload.credit_note_details = numOfBill.map((_, index) => {
        let credit_note_data =  {
          ...details?.credit_note_details[index],
          amount: +data[`amount_${index}`],
        }; 
        return {
          id: credit_note_data["id"], 
          bill_id :credit_note_data["bill_id"], 
          bill_no: credit_note_data["bill_no"], 
          model: credit_note_data["model"], 
          rate: credit_note_data["rate"], 
          per: credit_note_data["per"], 
          invoice_no: credit_note_data["invoice_no"], 
          particular_name: credit_note_data["particular_name"], 
          quantity: credit_note_data["quantity"], 
          amount: credit_note_data["amount"]
        }
      });
    } else{
      let amount = data[`amount_${0}`] ; 

      if (amount == undefined || amount == null || amount == ""){
        message.warning("Please, Enter amount") ; 
        hasError = true; 
        return; 
      } else {
        payload.amount = amount ; 
        payload.credit_note_details = [] ; 
      }
    }

    if (!hasError){
      await updateCreditNote({ data: payload, companyId: data.company_id });
    }
  };

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      round_off_value: 0
    },
    resolver: yupResolver(validationSchema),
  });

  const {
    company_id,
    total_meter,
    rate,
    SGST_amount,
    CGST_amount,
    IGST_amount,
    TCS_amount,
    TDS_amount,
    discount_amount,
    total_amount,
    net_amount,
    round_off_value, 
    discount_value
  } = watch();

  const calculateTaxAmount = () => {
    let amountSum = 0;
    // let totalNetAmount = 0;

    let SGSTAmount = 0;
    let CGSTAmount = 0;
    let IGSTAmount = 0;

    numOfBill.forEach((_, index) => {
      const amount = getValues(`amount_${index}`);
      amountSum += +amount;
    });

    const discountValue = +getValues("discount_value");
    const discountAmount = (amountSum * +discountValue) / 100;
    setValue("discount_amount", discountAmount.toFixed(2));

    const totalAmount = +amountSum - +discountAmount;
    setValue("total_amount", totalAmount.toFixed(2));

    const SGSTValue = +getValues("SGST_value");
    if (SGSTValue) {
      SGSTAmount = (+totalAmount * +SGSTValue) / 100;
      setValue("SGST_amount", SGSTAmount.toFixed(2));
    }

    const CGSTValue = +getValues("CGST_value");
    if (CGSTValue) {
      CGSTAmount = (+totalAmount * +CGSTValue) / 100;
      setValue("CGST_amount", CGSTAmount.toFixed(2));
    }

    const IGSTValue = +getValues("IGST_value");
    if (IGSTValue) {
      IGSTAmount = (+totalAmount * +IGSTValue) / 100;
      setValue("IGST_amount", IGSTAmount.toFixed(2));
    }

    const TCS_value = +getValues("TCS_value");
    const TDS_value = +getValues("TDS_value");

    let taxData = calculateFinalNetAmount(
      totalAmount, 
      SGSTValue, 
      CGSTValue, 
      IGSTValue, 
      TCS_value, 
      TDS_value
    )

    setValue("TCS_amount", taxData?.tcsAmount);
    setValue("TDS_amount", taxData?.tdsAmount);
    setValue("net_amount", taxData?.roundedNetAmount);
    setValue("round_off_value", taxData?.roundOffValue)

  };


  useEffect(() => {
    if (creditNoteTypes === "sale_return") {
      setNumOfBill([1]);
    } else if (creditNoteTypes === "late" || creditNoteTypes === "discount") {
      setNumOfBill(() =>
        Array.from({ length: details.credit_note_details.length })
      );
    } else if (creditNoteTypes === "claim" || creditNoteTypes === "other") {
      setNumOfBill(() =>
        Array.from({ length: details.credit_note_details.length })
      );
    }
  }, [creditNoteTypes, details]);

  // ----------------------------------------------------------------------------------------------------------------------

  const selectedCompany = useMemo(() => {
    if (company_id) {
      return companyListRes?.rows?.find(({ id }) => id === company_id);
    }
  }, [company_id, companyListRes]);


  useEffect(() => {
    if (details) {
      const {
        company_id,
        createdAt,
        total_meter,
        total_taka,
        rate,
        // amount,
        CGST_amount,
        CGST_value,
        IGST_amount,
        IGST_value,
        SGST_amount,
        SGST_value,
        discount_amount,
        discount_value,
        tcs_amount,
        tcs_value,
        tds,
        tds_amount,
        round_off_amount,
        net_amount,
        extra_tex_value, 
        extra_tex_amount
      } = details;

      reset({
        company_id,
        date: dayjs(createdAt),
        total_meter,
        total_taka,
        rate,
        // amount,
        CGST_amount: +CGST_amount || 0,
        CGST_value: +CGST_value || 0,
        IGST_amount: +IGST_amount || 0,
        IGST_value: +IGST_value || 0,
        SGST_amount: +SGST_amount || 0,
        SGST_value: +SGST_value || 0,
        discount_amount: +discount_amount || 0,
        discount_value: +discount_value || 0,
        TCS_amount: +tcs_amount || 0,
        TCS_value: +tcs_value || 0,
        TDS_value: +extra_tex_value || 0,
        TDS_amount: +extra_tex_amount || 0,
        round_off_value: +round_off_amount || 0,
        net_amount: +net_amount || 0,
      });
    }
  }, [details, reset]);

  const renderCell = (type, value) => {
    if (creditNoteTypes === "other") return <td></td>;
  
    switch (type) {
      case "discount":
      case "claim":
      case "late":
        return <td></td>;
      default:
        return <td>{value || 0}</td>;
    }
  };

  return (
    <>
      <Modal
        open={isModalOpen}
        width={"75%"}
        onCancel={() => {
          setIsModalOpen(false);
        }}
        footer={false}
        closeIcon={<CloseOutlined className="text-white" />}
        title="Credit Note"
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
                <td rowSpan={2}>
                  <div className="credit-note-info-title">
                    <span>Company Name: </span>
                    {selectedCompany?.company_name || ""}
                  </div>
                  <div className="credit-note-info-title">
                    <span>Address: </span>
                    {selectedCompany?.address_line_1 || ""}
                    {selectedCompany?.address_line_2 || ""}
                  </div>
                  <div className="credit-note-info-title">
                    <span>GSTIN/UIN:</span> {selectedCompany?.gst_no || ""}
                  </div>
                </td>
                <td width={"25%"}>
                  <div className="credit-note-info-title">
                    <span>Credit Note No: </span>
                    {details?.credit_note_number || "-"}
                  </div>
                </td>
                <td width={"25%"}>
                  <div>
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
              </tr>
              <tr>
                <td>
                  <div className="credit-note-info-title">
                    <span>{"Buyer's Ref.:"}</span>
                    {buyerRef}
                  </div>
                  <div className="credit-note-info-title">
                    <span>Date : </span>
                    {dayjs(details?.createdAt).format("DD-MM-YYYY")}
                  </div>
                </td>
                <td>
                  <div className="credit-note-info-title">
                    <span>{"Buyer's Order No. :"}</span>
                    {"---"}
                  </div>
                </td>
              </tr>
              <tr>
                <td rowSpan={2}>
                  
                  {/* ========= Party information ===========  */}
                  {details?.party !== null  && (
                    <>
                      <div className="credit-note-info-title">
                        <span>Party: </span>
                        {details?.party?.company_name || ""}
                      </div>
                      <div className="credit-note-info-title">
                        <span>Address: </span>
                        {details?.party?.address_line_1 || ""}
                        {details?.party?.address_line_2 || ""}
                      </div>
                      <div className="credit-note-info-title">
                        <span>GSTIN/UIN:</span>{" "}
                        {details?.party?.company_gst_number || ""}
                      </div>
                    </>
                  )}

                  {/* ========== Supplier information ==============  */}
                  {details?.supplier !== null && (
                    <>
                      <span style={{
                        fontSize: 15, 
                        fontWeight: 600
                      }}>
                        {String(details?.supplier?.supplier_company).toUpperCase()}
                      </span>
                      <div className="credit-note-info-title">
                        <span>Supplier: </span>
                        {details?.supplier?.supplier_name || ""}
                      </div>
                      <div className="credit-note-info-title">
                        <span>Address: </span>
                        {details?.user?.address || ""}
                      </div>
                      <div className="credit-note-info-title">
                        <span>GSTIN/UIN:</span>{" "}
                        {details?.user?.gst_no   || ""}
                      </div>
                    </>
                  )}
                </td>
                <td colSpan={2} width={"25%"}>
                  <div className="credit-note-info-title">
                    <span>DESCRIPTION OF GOODS : </span>
                      {descriptionGoods}
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="credit-note-info-title">
                    <span>HSN :</span>
                    {details?.hsn_no || "-"}
                  </div>
                </td>
                <td>
                  <div className="credit-note-info-title">
                    <span>PAN NO:</span>
                    {selectedCompany?.pancard_no || "-"}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <br />
          <table className="credit-note-table">
            <thead style={{ fontWeight: 600 }}>
              <tr>
                <td>SL No.</td>
                <td>Total Taka</td>
                <td>Total Meter</td>
                <td>Rate</td>
                <td>Amount</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                
                <td>
                  {creditNoteTypes === "other"
                    ? details?.credit_note_details[0]?.particular_name
                    : null}
                </td>
                {renderCell("", total_meter)}
                {renderCell("", rate)}
                <td>
                  {numOfBill && numOfBill.length
                    ? numOfBill.map((_, index) => {
                        return (
                          <SingleBillRender
                            key={index}
                            index={index}
                            control={control}
                            details={details}
                            setValue={setValue}
                            creditNoteTypes={creditNoteTypes}
                            calculateTaxAmount={calculateTaxAmount}
                          />
                        );
                      })
                    : null}
                </td>
              </tr>

              {/* <tr style={{ height: "180px" }}>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr> */}

              <tr>
                <td></td>
                <td></td>
                <td>(-) Discount</td>
                <td>
                  <Controller
                    control={control}
                    name="discount_value"
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="3"
                        style={{ width: "100px" }}
                        type="number"
                        onChange={(e) => {
                          setValue("discount_value", +e.target.value);
                          calculateTaxAmount();
                        }}
                      />
                    )}
                  />
                </td>
                <td>{discount_amount}</td>
              </tr>

              <tr>
                <td></td>
                <td></td>
                <td>(-) Total Amount</td>
                <td></td>
                <td>{total_amount}</td>
              </tr>

              <tr>
                <td></td>
                <td></td>
                <td>SGST(%)</td>
                <td>
                  <Controller
                    control={control}
                    name="SGST_value"
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="3"
                        style={{ width: "100px" }}
                        type="number"
                        onChange={(e) => {
                          setValue("SGST_value", +e.target.value);
                          calculateTaxAmount();
                        }}
                      />
                    )}
                  />{" "}
                  %
                </td>
                <td>{SGST_amount}</td>
              </tr>

              <tr>
                <td></td>
                <td></td>
                <td>CGST(%)</td>
                <td>
                  <Controller
                    control={control}
                    name="CGST_value"
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="3"
                        style={{ width: "100px" }}
                        type="number"
                        onChange={(e) => {
                          setValue("CGST_value", +e.target.value);
                          calculateTaxAmount();
                        }}
                      />
                    )}
                  />{" "}
                  %
                </td>
                <td>{CGST_amount}</td>
              </tr>

              <tr>
                <td></td>
                <td></td>
                <td>IGST(%)</td>
                <td>
                  <Controller
                    control={control}
                    name="IGST_value"
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="3"
                        style={{ width: "100px" }}
                        type="number"
                        onChange={(e) => {
                          setValue("IGST_value", +e.target.value);
                          calculateTaxAmount();
                        }}
                      />
                    )}
                  />{" "}
                  %
                </td>
                <td>{IGST_amount}</td>
              </tr>

              <tr>
                <td></td>
                <td></td>
                <td>TCS(%)</td>
                <td>
                  <Controller
                    control={control}
                    name="TCS_value"
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="3"
                        style={{ width: "100px" }}
                        type="number"
                        // onChange={(e) => {
                        //   setValue("TCS_value", e.target.value);
                        //   //   calculatePercent(e.target.value, "TCS_amount");
                        //   // calculateTCSAmount(e.target.value);
                        // }}
                        onChange={(e) => {
                          setValue("TCS_value", +e.target.value);
                          calculateTaxAmount();
                        }}
                      />
                    )}
                  />{" "}
                  %
                </td>
                <td>{TCS_amount}</td>
              </tr>

              <tr>
                <td></td>
                <td></td>
                <td style={{fontWeight: 500, color: "blue"}}>TDS(%)</td>
                <td>
                  <Controller
                    control={control}
                    name="TDS_value"
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="3"
                        style={{ width: "100px" }}
                        type="number"
                        onChange={(e) => {
                          setValue("TDS_value", +e.target.value);
                          calculateTaxAmount();
                        }}
                      />
                    )}
                  />{" "}
                  %
                </td>
                <td>{TDS_amount}</td>
              </tr>

              <tr>
                <td></td>
                <td></td>
                <td>Round Off</td>
                <td>
                  {round_off_value}
                </td>
                <td></td>
              </tr>

              <tr>
                <td></td>
                <td style={{
                  fontWeight: 600, 
                  color: "black"
                }}>Total</td>
                <td></td>
                <td></td>
                <td style={{
                  fontWeight: 600, 
                  color: "black"
                }}>{net_amount || 0}</td>
              </tr>
              <tr>
                <td colSpan={5}>
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
                        {net_amount ? toWords.convert(net_amount || 0) : "0"}
                      </div>
                      {/* <div>
                        <span style={{ fontWeight: "500" }}>Remarks:</span>{" "}
                      </div> */}
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
              Update
            </Button>
            <Button>Close</Button>
          </Flex>
        </div>
      </Modal>
    </>
  );
};

export default UpdateCreditNote;

const SingleBillRender = ({
  index,
  control,
  // company_id,
  details,
  setValue,
  creditNoteTypes,
  calculateTaxAmount,
}) => {
  useEffect(() => {
    if (details) {
      setValue(`credit_note_details_id_${index}`, details?.credit_note_details[index]?.id) ; 
      setValue(`bill_no_${index}`, details?.credit_note_details[index]?.bill_no) ; 
      setValue(`invoice_no_${index}`, details?.credit_note_details[index]?.invoice_no) ; 

      if (creditNoteTypes === "sale_return") {
        setValue(`amount_${index}`, +details.amount);
        setValue(`quantity_${index}`, details.quantity);
      } else if (creditNoteTypes === "late" || creditNoteTypes === "discount") {
        setValue(`amount_${index}`, +details.credit_note_details[index].amount);
        setValue(
          `quantity_${index}`,
          details.credit_note_details[index].quantity
        );
        setValue(
          `bill_id_${index}`,
          +details.credit_note_details[index].bill_id
        );
        setValue(`model_${index}`, details.credit_note_details[index].model);
      } else if (creditNoteTypes === "claim" || creditNoteTypes === "other") {
        setValue(`amount_${index}`, +details.credit_note_details[index].amount);
        setValue(
          `quantity_${index}`,
          details.credit_note_details[index].quantity
        );

        setValue(
          `bill_id_${index}`,
          +details.credit_note_details[index].bill_id
        );
        setValue(`model_${index}`, details.credit_note_details[index].model);
      }

      calculateTaxAmount()  ; 
    }
  }, [creditNoteTypes, details, index, setValue]);

  return (
    <>
      <div style={{
        marginTop: 0.1
      }}>
        <Controller
          control={control}
          name={`amount_${index}`}
          render={({ field }) => (
            <Input
              {...field}
              placeholder="300"
              type="number"
              style={{ maxWidth: "200px" }}
              onChange={(e) => {
                field.onChange(e);
                calculateTaxAmount();
              }}
            />
          )}
        />
      </div>
      <br />

      <Controller
        control={control}
        name={`quantity_${index}`}
        render={({ field }) => (
          <Input
            {...field}
            // value={billData?.receive_quantity || 0}
            placeholder="3"
            type="hidden"
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
    </>
  );
};
