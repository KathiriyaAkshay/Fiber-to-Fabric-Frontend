import {
  Button,
  Col,
  Flex,
  Form,
  Input,
  Modal,
  Row,
  Typography,
  message,
} from "antd";
import { useEffect, useRef, useState, useContext } from "react";
const { Text, Title } = Typography;
import * as yup from "yup";
import { CloseOutlined } from "@ant-design/icons";
import { Controller, useForm } from "react-hook-form";
import dayjs from "dayjs";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { ToWords } from "to-words";
import { createSaleChallanBillRequest } from "../../../../api/requests/sale/challan/challan";
import ReactToPrint from "react-to-print";

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

const addSaleBillSchema = yup.object().shape({
  discount_value: yup.string().required("Please enter is discount"),
  discount_amount: yup.string().required("Please enter is discount"),

  SGST_value: yup.string().required("Please enter SGST value"),
  SGST_amount: yup.string().required("Please enter SGST amount"),

  CGST_value: yup.string().required("Please enter CGST value"),
  CGST_amount: yup.string().required("Please enter CGST amount"),

  IGST_value: yup.string().required("Please enter IGST value"),
  IGST_amount: yup.string().required("Please enter IGST amount"),

  TCS_value: yup.string().required("Please enter TCS value"),
  TCS_amount: yup.string().required("Please enter TCS amount"),

  net_amount: yup.string().required("Please enter net amount"),
  round_off: yup.string().required("Please enter round off"),

  rate: yup.string().required("Please enter rate"),
  amount: yup.string().required("Please enter amount"),

  e_way_bill_no: yup.string().required("Please, Enter bill number")
});

const SaleChallanBill = ({ isModelOpen, handleCloseModal, details, MODE }) => {
  console.log("Details information =============================");
  console.log(details);


  const queryClient = useQueryClient();
  const { companyId, companyListRes } = useContext(GlobalContext);
  const [companyInfo, setCompanyInfo] = useState({});
  const componentRef = useRef();

  const { mutateAsync: addSaleChallanBill, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await createSaleChallanBillRequest({
        data,
        params: {
          company_id: companyId,
          bill_id: details.id,
        },
      });
      return res.data;
    },
    mutationKey: ["saleChallan", "bill", "add"],
    onSuccess: (res) => {
      queryClient.invalidateQueries(["saleChallan", "list", companyId]);
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      handleCloseModal();
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(errorMessage);
    },
  });

  const onSubmit = async (data) => {
    const newData = [
      {
        e_way_bill_no: data.e_way_bill_no,
        sale_challan_id: details.id,
        order_id: null,
        party_id: details.party.id,
        broker_id: details.broker.id,
        invoice_no: details.challan_no,
        machine_name: details.gray_order.machine_name,
        quality_id: details.quality_id,
        total_taka: details.total_taka,
        total_meter: details.total_meter,

        rate: +data.rate,
        amount: +data.amount,
        net_amount: +data.net_amount,
        due_days: details.gray_order.credit_days,
        hsn_no: details.inhouse_quality.vat_hsn_no,
        discount_value: +data.discount_value,
        discount_amount: +data.discount_amount,
        SGST_value: +data.SGST_value,
        SGST_amount: +data.SGST_amount,
        CGST_value: +data.CGST_value,
        CGST_amount: +data.CGST_amount,
        IGST_value: +data.IGST_value,
        IGST_amount: +data.IGST_amount,
        round_off_amount: +data.round_off,
      },
    ];
    await addSaleChallanBill(newData);
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = useForm({
    defaultValues: {
      e_way_bill_no: "",
      bill_date: dayjs(),
      invoice_no: "",
      due_date: dayjs(),
      total_amount: 0,

      discount_amount: 0,
      discount_value: 0,

      freight_value: 0,
      freight_amount: 0,

      rate: 0,
      amount: 0,

      SGST_value: 0,
      SGST_amount: 0,

      CGST_value: 0,
      CGST_amount: 0,

      IGST_value: 0,
      IGST_amount: 0,

      TCS_value: 0,
      TCS_amount: 0,

      round_off: 0,
      net_amount: 0,

      // TDS_value: 0,
      // after_TDS_amount: 0,
    },
    resolver: yupResolver(addSaleBillSchema),
  });
  const currentValues = watch();

  //  CALCULATION START----------------------------------------------

  function calculateDiscount(value = 0) {
    const discountAmount = (+getValues("amount") * +value) / 100;
    setValue("discount_amount", discountAmount);

    const totalAmount = +getValues("amount") - +discountAmount;
    setValue("total_amount", totalAmount);

    if (getValues("SGST_value")) {
      calculatePercent(getValues("SGST_value"), "SGST_amount");
    }
    if (getValues("CGST_value")) {
      calculatePercent(getValues("CGST_value"), "CGST_amount");
    }
    if (getValues("IGST_value")) {
      calculatePercent(getValues("IGST_value"), "IGST_amount");
    }
  }

  function calculateAmount(rate, meter) {
    setValue("amount", (+rate * meter).toFixed(2));
    calculateDiscount(currentValues.discount_value);
  }
  function calculateRate(amount, meter) {
    setValue("rate", (+amount / meter).toFixed(2));
    calculateDiscount(currentValues.discount_value);
  }

  function calculatePercent(value, setName) {
    const finalValue = parseFloat(
      (+getValues("total_amount") * +value) / 100
    ).toFixed(2);
    setValue(setName, finalValue);
  }

  const calculateTCSAmount = (TCS_value) => {
    const beforeTCS =
      // +getValues("discount_amount") +
      +getValues("total_amount") +
      +getValues("SGST_amount") +
      +getValues("CGST_amount") +
      +getValues("IGST_amount");
    // const TCS_Amount = +((+beforeTCS * +TCS_value) / 100).toFixed(2);
    const TCS_Amount = ((+beforeTCS * +TCS_value) / 100).toFixed(2);
    setValue("TCS_amount", TCS_Amount);
  };

  useEffect(() => {
    const finalNetAmount = parseFloat(
      // +currentValues.discount_amount +
      +currentValues.total_amount +
      +currentValues.SGST_amount +
      +currentValues.CGST_amount +
      +currentValues.IGST_amount +
      +currentValues.TCS_amount
    ).toFixed(2);
    const roundedNetAmount = Math.round(finalNetAmount);
    const roundOffValue = (roundedNetAmount - finalNetAmount).toFixed(2);

    setValue("net_amount", roundedNetAmount);

    // calculate net rate
    setValue("net_rate", +(+roundedNetAmount / details.kg).toFixed(2));

    // calculate round off amount
    // setValue("round_off", (Math.round(+finalAmount) - +finalAmount).toFixed(2));
    setValue("round_off", roundOffValue);
  }, [
    currentValues.total_amount,
    currentValues.SGST_amount,
    currentValues.CGST_amount,
    currentValues.IGST_amount,
    currentValues.TCS_amount,
    setValue,
    details.kg,
  ]);

  //  CALCULATION END------------------------------------------------

  useEffect(() => {
    if (details) {
      setValue("rate", details.gray_order.rate);
      calculateAmount(details.gray_order.rate, details.total_meter);
      setValue("discount_value", details.gray_order.discount);
      calculateDiscount(details.gray_order.discount);

      const calculateDueDate = dayjs(details.gray_order.createdAt).add(
        details.gray_order.credit_days,
        "days"
      );

      setValue("due_date", dayjs(calculateDueDate));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [details, setValue]);

  const pageStyle = `
    @media print {
      .print-instructions {
        display: none;
    }
    .printable-content {
      padding: 20px; /* Add padding for print */
      width: 100%;
    }
  `;

  useEffect(() => {
    companyListRes?.rows?.map((element) => {
      if (element?.id == details?.company_id) {
        setCompanyInfo(element);
      }
    });
  }, [details, companyListRes]);

  const [averageAmount, setAverageAmount] = useState(0);

  useEffect(() => {
    let total_taka = details?.sale_challan_details?.length ; 
    let tempAverage = Number(currentValues?.net_amount) / total_taka;
    setAverageAmount(tempAverage.toFixed(2));
  }, [currentValues?.net_amount]);

  return (
    <>
      <Modal
        closeIcon={<CloseOutlined className="text-white" />}
        title={
          <Typography.Text className="text-xl font-medium text-white">
            Sale Challan
          </Typography.Text>
        }
        open={isModelOpen}
        // footer={null}
        onCancel={handleCloseModal}
        className={{
          header: "text-center",
        }}
        centered={true}
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
          footer: {
            paddingRight: "10px", 
            paddingBottom :"20px", 
            backgroundColor: "#efefef"
          }
        }}
        footer={() => {
          return (
            <>
              <ReactToPrint
                trigger={() => (
                  <Flex>
                    <Button
                      type="primary"
                      style={{ marginLeft: "auto", marginTop: 15 }}
                      onClick={handleSubmit(onSubmit)}
                      loading={isPending}
                    >
                      Create Bill
                    </Button>
                  </Flex>
                )}
                content={() => componentRef.current}
                pageStyle={pageStyle}
              />
            </>
          );
        }}
        width={"70vw"}
      >
        <Form>
          <Flex className="flex-col border border-b-0 border-solid">
            <Row className="p-2 border-0 border-b border-solid">
              <Col
                span={24}
                className="flex items-center justify-center border"
              >
                <div>:: SHREE GANESHAY NAMAH ::</div>
              </Col>
              <Col
                span={24}
                className="flex items-center justify-center border"
                style={{ marginTop: -20 }}
              >
                <Typography.Text className="font-semibold text-center">
                  <h3>{companyInfo?.company_name}</h3>
                </Typography.Text>
              </Col>
            </Row>

            <Row className="p-2 border-0 border-b border-solid">
              <Col
                span={24}
                className="flex items-center justify-center border"
              >
                <Typography.Text className="font-semibold text-center">
                  MFG OF FANCY & GREY CLOTH
                </Typography.Text>
              </Col>
            </Row>
            <Row className="p-2 border-0 border-b border-solid">
              <Col
                span={24}
                className="flex items-center justify-center border"
              >
                <Typography.Text className="font-semibold text-center">
                  {`${companyInfo?.address_line_1} ${companyInfo?.address_line_2 == null
                    ? ""
                    : companyInfo?.address_line_2
                    }, ${companyInfo?.city}, ${companyInfo?.state} - ${companyInfo?.pincode
                    }, ${companyInfo?.country}`}
                  <br />
                  MOBILE NO: {companyInfo?.company_contact}, PAYMENT:{" "}
                  {companyInfo?.account_number}
                </Typography.Text>
              </Col>
            </Row>

            <Row className="border-0 border-b border-solid !m-0 p-2">
              <Col span={12} className="border-r pr-4">
                <Typography.Text className="block font-semibold">
                  M/s.
                </Typography.Text>
                <Typography.Text>
                  <strong>{`${details?.party?.first_name} ${details?.party?.last_name}`}</strong>
                </Typography.Text>
                <Typography.Text className="block">
                  {details?.party?.address}
                </Typography.Text>
                <Typography.Text
                  className="block mt-2 font-semibold"
                  style={{ color: "black" }}
                >
                  GST IN
                </Typography.Text>
                <Typography.Text>{details?.party?.gst_no}</Typography.Text>
                <Typography.Text className="block mt-2">
                  E-WAY BILL NO.
                </Typography.Text>
                <Form.Item
                  name="e_way_bill_no"
                  validateStatus={errors.e_way_bill_no ? "error" : ""}
                  help={errors.e_way_bill_no && errors.e_way_bill_no.message}
                  required={true}
                >
                  <Controller
                    control={control}
                    name="e_way_bill_no"
                    render={({ field }) => (
                      <Input
                        {...field}
                        name="e_way_bill_no"
                        disabled={MODE === "VIEW"}
                        style={{ width: "50%" }}
                      />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={12} className="pl-4">
                <Row>
                  <Col span={12}>
                    <Typography.Text className="block font-semibold">
                      INVOICE NO.
                    </Typography.Text>
                    <Typography.Text>{details?.challan_no}</Typography.Text>
                  </Col>
                  <Col span={12}>
                    <Typography.Text className="block font-semibold">
                      ORDER NO.
                    </Typography.Text>
                    <Typography.Text>
                      {details?.gray_order?.order_no}
                    </Typography.Text>
                  </Col>
                </Row>
                <Row className="mt-2">
                  <Col span={12}>
                    <Typography.Text className="block font-semibold">
                      PARTY ORDER NO.
                    </Typography.Text>
                    <Typography.Text>-</Typography.Text>
                  </Col>
                  <Col span={12}>
                    <Typography.Text className="block font-semibold">
                      CHALLAN NO.
                    </Typography.Text>
                    <Typography.Text>{details?.challan_no}</Typography.Text>
                  </Col>
                </Row>
                <Row className="mt-2">
                  <Col span={12}>
                    <Typography.Text className="block font-semibold">
                      BROKER NAME
                    </Typography.Text>
                    <Typography.Text>
                      {details?.broker?.first_name} {details?.broker?.last_name}
                    </Typography.Text>
                  </Col>
                </Row>
              </Col>
            </Row>

            <Row className="border-0 border-b border-solid !m-0">
              <Col
                span={8}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                QUALITY
              </Col>
              <Col
                span={2}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                HSN NO
              </Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                TAKA
              </Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                METER
              </Col>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                RATE
              </Col>
              <Col span={4} className="p-2 font-medium">
                AMOUNT
              </Col>
            </Row>
            <Row className="border-0 border-b !m-0">
              <Col
                span={8}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                {details.inhouse_quality.quality_name}{" "}
                {`(${details.inhouse_quality.quality_weight}KG)`}
              </Col>
              <Col
                span={2}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                {details.hsn_no}
              </Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                {details.total_taka}
              </Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                {details?.total_meter}
              </Col>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                <Form.Item
                  name="rate"
                  validateStatus={errors.rate ? "error" : ""}
                  help={errors.rate && errors.rate.message}
                  required={true}
                  className="mb-0"
                >
                  <Controller
                    control={control}
                    name="rate"
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Rate"
                        type="number"
                        name="rate"
                        disabled={MODE === "VIEW"}
                        onChange={(e) => {
                          setValue("rate", e.target.value);
                          calculateAmount(e.target.value, details.total_meter);
                        }}
                      />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={4} className="p-2 font-medium">
                <Form.Item
                  name="amount"
                  validateStatus={errors.amount ? "error" : ""}
                  help={errors.amount && errors.amount.message}
                  required={true}
                  className="mb-0"
                >
                  <Controller
                    control={control}
                    name="amount"
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Amount"
                        type="number"
                        disabled={MODE === "VIEW"}
                        onChange={(e) => {
                          setValue("amount", e.target.value);
                          calculateRate(e.target.value, details.total_meter);
                        }}
                      />
                    )}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row className="border-0 border-b !m-0">
              <Col
                span={8}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={2}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                Discount ( % )
              </Col>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                <Form.Item
                  name="discount_value"
                  validateStatus={errors.discount_value ? "error" : ""}
                  help={errors.discount_value && errors.discount_value.message}
                  required={true}
                // className="mb-0"
                >
                  <Controller
                    control={control}
                    name="discount_value"
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Discount"
                        type="number"
                        name="discount_value"
                        disabled={MODE === "VIEW"}
                        onChange={(e) => {
                          setValue("discount_value", e.target.value);
                          calculateDiscount(e.target.value);
                        }}
                      />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={4} className="p-2 font-medium">
                {currentValues?.discount_amount}
              </Col>
            </Row>

            <Row className="border-0 border-b !m-0">
              <Col
                span={8}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={2}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                TOTAL AMOUNT
              </Col>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                {/* TOTAL AMOUNT */}
              </Col>
              <Col span={4} className="p-2 font-medium">
                {currentValues.total_amount}
              </Col>
            </Row>

            <Row className="border-0 border-b !m-0">
              <Col
                span={8}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={2}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                <div style={{ color: "gray" }}>SGST(%)</div>
              </Col>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                <Form.Item
                  name="SGST_value"
                  validateStatus={errors.SGST_value ? "error" : ""}
                  help={errors.SGST_value && errors.SGST_value.message}
                  required={true}
                // className="mb-0"
                >
                  <Controller
                    control={control}
                    name="SGST_value"
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="SGST"
                        type="number"
                        name="SGST_value"
                        disabled={MODE === "VIEW"}
                        onChange={(e) => {
                          setValue("SGST_value", e.target.value);
                          calculatePercent(e.target.value, "SGST_amount");
                        }}
                      />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={4} className="p-2 font-medium">
                {currentValues?.SGST_amount}
              </Col>
            </Row>

            <Row className="border-0 border-b !m-0">
              <Col
                span={8}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={2}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                <div style={{ color: "gray" }}>CGST(%)</div>
              </Col>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                <Form.Item
                  name="CGST_value"
                  validateStatus={errors.CGST_value ? "error" : ""}
                  help={errors.CGST_value && errors.CGST_value.message}
                  required={true}
                // className="mb-0"
                >
                  <Controller
                    control={control}
                    name="CGST_value"
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="SGST"
                        type="number"
                        disabled={MODE === "VIEW"}
                        onChange={(e) => {
                          setValue("CGST_value", e.target.value);
                          calculatePercent(e.target.value, "CGST_amount");
                        }}
                      />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={4} className="p-2 font-medium">
                {currentValues?.CGST_amount}
              </Col>
            </Row>

            <Row className="border-0 border-b !m-0">
              <Col
                span={8}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={2}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                <div style={{ color: "gray" }}>IGST(%)</div>
              </Col>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                <Form.Item
                  name="IGST_value"
                  validateStatus={errors.IGST_value ? "error" : ""}
                  help={errors.IGST_value && errors.IGST_value.message}
                  required={true}
                // className="mb-0"
                >
                  <Controller
                    control={control}
                    name="IGST_value"
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="IGST"
                        type="number"
                        disabled={MODE === "VIEW"}
                        onChange={(e) => {
                          setValue("IGST_value", e.target.value);
                          calculatePercent(e.target.value, "IGST_amount");
                        }}
                      />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={4} className="p-2 font-medium">
                {currentValues?.IGST_amount}
              </Col>
            </Row>

            <Row className="border-0 border-b !m-0">
              <Col
                span={8}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={2}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                <div style={{ color: "gray" }}>TCS(%)</div>
              </Col>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                <Form.Item
                  name="TCS_value"
                  validateStatus={errors.TCS_value ? "error" : ""}
                  help={errors.TCS_value && errors.TCS_value.message}
                  required={true}
                // className="mb-0"
                >
                  <Controller
                    control={control}
                    name="TCS_value"
                    render={({ field }) => (
                      <Input
                        {...field}
                        name="TCS_value"
                        placeholder="TCS"
                        type="number"
                        disabled={MODE === "VIEW"}
                        onChange={(e) => {
                          setValue("TCS_value", e.target.value);
                          //   calculatePercent(e.target.value, "TCS_amount");
                          calculateTCSAmount(e.target.value);
                        }}
                      />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={4} className="p-2 font-medium">
                {currentValues.TCS_amount}
              </Col>
            </Row>

            <Row className="border-0 border-b border-solid !m-0">
              <Col
                span={8}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                Avg Rate: {parseFloat(averageAmount).toFixed(2)}
              </Col>
              <Col
                span={2}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                <div style={{ color: "black" }}>Round off</div>
              </Col>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col span={4} className="p-2 font-medium">
                {currentValues?.round_off}
              </Col>
            </Row>

            <Row className="border-0 border-b border-solid !m-0 p-2">
              <Col span={18}>
                <Typography.Text className="block font-semibold">
                  ♦ DELIVERY AT:
                </Typography.Text>
                <Typography.Text className="block font-semibold mt-1">
                  <strong>{`${details?.party?.first_name} ${details?.party?.last_name}`}</strong>
                </Typography.Text>
                <Typography.Text className="block mt-1">
                  {details?.party?.address}
                </Typography.Text>
              </Col>
              <Col span={6} className="flex justify-end items-start"></Col>
            </Row>
            <Row className="border-0 border-b border-solid !m-0 ">
              <Col
                span={13}
                className="pt-2 pb-2 pl-2 border-0 border-r border-solid"
              >
                <Typography.Text className="font-semibold">
                  NO DYEING & BLOOMING GUARANTEE
                </Typography.Text>
              </Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                <div style={{ color: "black", fontWeight: 600 }}>
                  Due date:{" "}
                  {dayjs(currentValues?.due_date).format("DD-MM-YYYY")}
                </div>
              </Col>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
                style={{fontWeight: 600}}
              >
                NET AMOUNT
              </Col>
              <Col span={4} className="p-2 font-medium">
                {currentValues?.net_amount}
              </Col>
            </Row>
            <Row className="border-0 border-b border-solid !m-0 ">
              <Col span={24} className="pt-2 pb-2 pl-2 border-0">
                <Typography.Text className="font-semibold">
                  Tax Amount(IN WORDS):{" "}
                  {toWords.convert(currentValues?.net_amount)}
                </Typography.Text>
              </Col>
            </Row>

            <Row className="border-0 border-b !m-0 p-4">
              <Col span={16} className="p-2">
                <Title level={5} className="m-0">
                  ➤ TERMS OF SALES :-
                </Title>
                <Text
                  className="block"
                  style={{ color: "#000", fontWeight: 600 }}
                >
                  1. Interest at 2% per month will be charged remaining unpaid
                  from the date bill.
                </Text>
                <Text
                  className="block"
                  style={{ color: "#000", fontWeight: 600 }}
                >
                  2. Complaint if any regarding this invoice must be settled
                  within 24 hours.
                </Text>
                <Text
                  className="block"
                  style={{ color: "#000", fontWeight: 600 }}
                >
                  3. Disputes shall be settled in SURAT court only.
                </Text>
                <Text
                  className="block"
                  style={{ color: "#000", fontWeight: 600 }}
                >
                  4. We are not responsible for processed goods & width.
                </Text>
                <Text
                  className="block"
                  style={{ color: "#000", fontWeight: 600 }}
                >
                  5. Subject to SURAT Jurisdiction.
                </Text>
                <Text className="block mt-2"></Text>
              </Col>
              <Col span={8} className="p-2 text-right">
                <Text strong>For, {companyInfo?.company_name}</Text>
              </Col>
            </Row>

            <Row
              className="border-0 border-b border-solid !m-0 p-4"
              style={{ paddingTop: 0 }}
            >
              <Col span={16} className="p-2">
                <Text strong>Bank Details:</Text> {companyInfo?.bank_name}
                <br />
                <Text strong>A/C No:</Text> {companyInfo?.account_number}
                <br />
                <Text strong>IFSC Code:</Text> {companyInfo?.ifsc_code}
                <br />
                <Text>IRN: --</Text>
                <br />
                <Text>ACK NO: --</Text>
                <br />
                <Text>ACK DATE: --</Text>
              </Col>
              <Col span={8} className="p-2 text-right">
                <Text strong>Authorised Signatory</Text>
              </Col>
            </Row>

            <Row className="p-2 border-0 border-b border-solid">
              <Col
                span={24}
                className="flex items-center justify-center border"
              >
                <Typography.Text className="font-semibold text-center">
                  PAID DETAILS
                </Typography.Text>
              </Col>
            </Row>

            <Row className="border-0 border-b border-solid !m-0">
              <Col
                span={6}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                RECEIVED RS.
              </Col>
              <Col
                span={6}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                CHQ/DD NO.
              </Col>
              <Col
                span={6}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                DATE
              </Col>
              <Col span={6} className="p-2 font-medium border-0">
                {"PARTY'S BANK"}
              </Col>
            </Row>
          </Flex>
        </Form>
      </Modal>
    </>
  );
};

export default SaleChallanBill;
