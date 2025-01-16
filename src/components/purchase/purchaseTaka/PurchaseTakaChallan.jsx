import { useContext, useEffect, useState } from "react";
import {
  Button,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  Modal,
  Row,
  Typography,
  message,
} from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { Controller, useForm } from "react-hook-form";
import dayjs from "dayjs";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GlobalContext } from "../../../contexts/GlobalContext";
const { Text } = Typography;
import moment from "moment";
import {
  addPurchaseTakaBillRequest,
  getPurchaseTakaBillByIdRequest,
} from "../../../api/requests/purchase/bill";
import { ToWords } from "to-words";
import { getDisplayQualityName } from "../../../constants/nameHandler";

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

const addSizeBeamReceive = yup.object().shape({
  invoice_no: yup.string().required("Please enter invoice no."),
  bill_date: yup.string().required("Please enter bill date"),
  //   due_date: yup.string().required("Please enter due date"),
  freight_value: yup.string().required("Please enter freight value"),
  freight_amount: yup.string().required("Please enter freight amount"),
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

  TDS_value: yup.string().required("Please enter TDS value"),
  after_TDS_amount: yup.string().required("Please enter after TDS amount"),

  rate: yup.string().required("Please enter rate"),
  amount: yup.string().required("Please enter amount"),
});

const PurchaseTakaChallanModal = ({
  details = {},
  isModelOpen,
  handleCloseModal,
  MODE,
}) => {
  const queryClient = useQueryClient();
  const { companyId, companyListRes } = useContext(GlobalContext);
  const [companyInfo, setCompanyInfo] = useState({});
  console.log("MODE", MODE);
  

  const { data: purchaseTakasBillDetail = null } = useQuery({
    queryKey: ["/purchase/taka/bill/get", MODE, { id: details.id }],
    queryFn: async () => {
      if (MODE === "VIEW" || MODE === "UPDATE") {
        const res = await getPurchaseTakaBillByIdRequest({
          params: {
            company_id: companyId,
            challan_id: details.id,
          },
        });
        return res?.data?.data;
      }
    },
    enabled: Boolean(companyId),
  });

  const { mutateAsync: addPurchaseTakaBill, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await addPurchaseTakaBillRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["job", "taka", "bill"],
    onSuccess: (res) => {
      queryClient.invalidateQueries([
        "purchaseTaka",
        "challan",
        "list",
        companyId,
      ]);
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
    const newData = {
      gray_order_id: details.gray_order_id,
      taka_challan_id: details.id,
      invoice_no: data.invoice_no,
      bill_date: dayjs(data.bill_date).format("YYYY-MM-DD"),
      //   due_date: dayjs(data.due_date).format("YYYY-MM-DD"),
      discount_value: +data.discount_value,
      discount_amount: +data.discount_amount,
      SGST_value: +data.SGST_value,
      SGST_amount: +data.SGST_amount,
      CGST_value: +data.CGST_value,
      CGST_amount: +data.CGST_amount,
      IGST_value: +data.IGST_value,
      IGST_amount: +data.IGST_amount,
      TCS_value: +data.TCS_value,
      TCS_amount: +data.TCS_amount,
      round_off_amount: +data.round_off,
      net_amount: +data.net_amount,
      //   net_rate: +data.net_rate,
      amount: +data.amount,
      rate: +data.rate,

      TDS_value: +data.TDS_value,
      after_TDS_amount: +(+data.after_TDS_amount).toFixed(2),
    };
    await addPurchaseTakaBill(newData);
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    getValues,
  } = useForm({
    resolver: yupResolver(addSizeBeamReceive),
    defaultValues: {
      bill_date: dayjs(),
      invoice_no: "",
      //   due_date: dayjs(),

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

      TDS_value: 0,
      after_TDS_amount: 0,
    },
  });

  const currentValues = watch();

  //  CALCULATION START----------------------------------------------

  function calculateDiscount(value = 0) {
    const discountValue = (+getValues("amount") * +value) / 100;
    setValue(
      "discount_amount",
      parseFloat(+getValues("amount") - discountValue).toFixed(2)
    );

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
      (+getValues("discount_amount") * +value) / 100
    ).toFixed(2);
    setValue(setName, finalValue);
  }

  const calculateTCSAmount = (TCS_value) => {
    const beforeTCS =
      +getValues("discount_amount") +
      +getValues("SGST_amount") +
      +getValues("CGST_amount") +
      +getValues("IGST_amount");
    // const TCS_Amount = +((+beforeTCS * +TCS_value) / 100).toFixed(2);
    const TCS_Amount = ((+beforeTCS * +TCS_value) / 100).toFixed(2);
    setValue("TCS_amount", TCS_Amount);
  };

  const calculateAfterTDSAmount = (TDSValue) => {
    const TDS_amount = (+getValues("discount_amount") * +TDSValue) / 100;
    const afterTDS = +Math.abs(+getValues("net_amount") - TDS_amount).toFixed(
      0
    );
    setValue("after_TDS_amount", afterTDS);
  };

  useEffect(() => {
    if (currentValues?.TDS_value !== undefined && currentValues?.TDS_value !== ""){
      calculateAfterTDSAmount(currentValues?.TDS_value)
    }
  }, [currentValues?.net_amount, setValue, currentValues?.TDS_value])

  useEffect(() => {
    const finalNetAmount = parseFloat(
      +currentValues.discount_amount +
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
    currentValues.discount_amount,
    currentValues.SGST_amount,
    currentValues.CGST_amount,
    currentValues.IGST_amount,
    currentValues.TCS_amount,
    setValue,
    details.kg,
  ]);

  //  CALCULATION END------------------------------------------------

  useEffect(() => {
    if (purchaseTakasBillDetail?.purchaseBill !== null && purchaseTakasBillDetail?.purchaseBill !== undefined) {
      setValue("invoice_no", purchaseTakasBillDetail.purchaseBill.invoice_no);
      setValue("rate", purchaseTakasBillDetail.purchaseBill.rate);
      setValue("amount", purchaseTakasBillDetail.purchaseBill.amount);

      setValue("net_amount", purchaseTakasBillDetail.purchaseBill.net_amount);
      setValue("net_rate", purchaseTakasBillDetail.purchaseBill.net_rate);
      setValue(
        "round_off",
        purchaseTakasBillDetail.purchaseBill.round_off_amount
      );
      setValue(
        "bill_date",
        dayjs(purchaseTakasBillDetail.purchaseBill.bill_date)
      );
      setValue(
        "due_date",
        dayjs(purchaseTakasBillDetail.purchaseBill.due_date)
      );

      setValue(
        "discount_amount",
        purchaseTakasBillDetail.purchaseBill.discount_amount
      );
      setValue(
        "discount_value",
        purchaseTakasBillDetail.purchaseBill.discount_value
      );
      setValue("IGST_amount", purchaseTakasBillDetail.purchaseBill.IGST_amount);
      setValue("IGST_value", purchaseTakasBillDetail.purchaseBill.IGST_value);
      setValue("CGST_amount", purchaseTakasBillDetail.purchaseBill.CGST_amount);
      setValue("CGST_value", purchaseTakasBillDetail.purchaseBill.CGST_value);
      setValue("SGST_amount", purchaseTakasBillDetail.purchaseBill.SGST_amount);
      setValue("SGST_value", purchaseTakasBillDetail.purchaseBill.SGST_value);
      setValue("TCS_value", purchaseTakasBillDetail.purchaseBill.TCS_value);
      setValue("TCS_amount", purchaseTakasBillDetail.purchaseBill.TCS_amount);

      setValue("TDS_value", purchaseTakasBillDetail.purchaseBill.TDS_value);
      setValue(
        "after_TDS_amount",
        purchaseTakasBillDetail.purchaseBill.after_TDS_amount
      );
    } else {
      setValue("SGST_value", "2.5");
      setValue("CGST_value", "2.5");
    }
  }, [purchaseTakasBillDetail, setValue]);

  useEffect(() => {
    companyListRes?.rows?.map((element) => {
      if (element?.id == details?.company_id) {
        setCompanyInfo(element);
      }
    });
  }, [details, companyListRes]);

  function disabledFutureDate(current) {
    return current && current > moment().endOf("day");
  }


  return (
    <>
      {/* <Button
        onClick={() => {
          setIsModalOpen(true);
        }}
      >
        <FileTextOutlined />
      </Button> */}
      <Modal
        closeIcon={<CloseOutlined className="text-white" />}
        title={
          <Typography.Text className="text-xl font-medium text-white">
            Received Purchase Bill
          </Typography.Text>
        }
        open={isModelOpen}
        footer={null}
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
        }}
        width={"70vw"}
      >
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Flex className="flex-col border border-b-0 border-solid">
            <Row className="border-0 border-b border-solid">
              <Col span={12} className="p-3 border-right">
                <Row>
                  <Col span={24}>
                    <Text strong>To,</Text>
                  </Col>
                  <Col span={24}>
                    <Text>
                      <div style={{fontWeight: 600}}>
                        {String(details?.supplier?.supplier_name).toUpperCase()}
                      </div>
                      ({details?.supplier?.supplier_company})
                    </Text>
                  </Col>
                  <Col span={24} className="mt-1">
                    <Text strong>Gst In</Text>
                  </Col>
                  <Col span={24}>
                    <Text>{details?.supplier?.user?.gst_no}</Text>
                  </Col>
                  <Col span={24} className="mt-2">
                    <Text strong>Invoice No</Text>
                    <Form.Item
                      name="invoice_no"
                      validateStatus={errors.invoice_no ? "error" : ""}
                      help={errors.invoice_no && errors.invoice_no.message}
                      required={true}
                      className="mb-0"
                    >
                      <Controller
                        control={control}
                        name="invoice_no"
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="Invoice No."
                            style={{ width: "150px" }}
                            disabled={MODE === "VIEW"?true:false}
                          />
                        )}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
              <Col span={12} className="p-3">
                <Row>
                  <Col span={24}>
                    <Text strong>From,</Text>
                  </Col>
                  <Col span={24}>
                    <Text>{companyInfo?.company_name || ""}</Text>
                  </Col>
                  <Col span={24} className="mt-1">
                    <Text strong>Gst In</Text>
                  </Col>
                  <Col span={24}>
                    <Text>{companyInfo?.gst_no}</Text>
                  </Col>
                  <Col span={24} className="mt-2">
                    <Text strong>Bill Date</Text>
                    <Form.Item
                      name="bill_date"
                      validateStatus={errors.bill_date ? "error" : ""}
                      help={errors.bill_date && errors.bill_date.message}
                      required={true}
                      wrapperCol={{ sm: 24 }}
                      className="mb-0"
                    >
                      <Controller
                        control={control}
                        name="bill_date"
                        render={({ field }) => (
                          <DatePicker
                            {...field}
                            defaultValue={moment(new Date()).format("DD-MM-YYYY")}
                            format="DD-MM-YYYY"
                            readOnly
                            disabled={MODE === "VIEW" || MODE === "UPDATE"}
                            disabledDate={disabledFutureDate}
                          />
                        )}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
            </Row>

            <Row className="border-0 border-b border-solid">
              <Col
                span={6}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                <Text strong>QUALITY NAME</Text>
              </Col>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                <Text strong>CHALLAN NO</Text>
              </Col>
              <Col
                span={2}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                <Text strong>TAKA</Text>
              </Col>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                <Text strong>METER</Text>
              </Col>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                <Text strong>RATE</Text>
              </Col>
              <Col span={4} className="p-2 font-medium border-0 border-r">
                <Text strong>AMOUNT</Text>
              </Col>
            </Row>
            <Row className="border-0 border-b">
              <Col
                span={6}
                className="p-2 font-medium border-0 border-r border-solid"
              > 
                {getDisplayQualityName(details?.inhouse_quality)}
              </Col>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                {details.challan_no}
              </Col>
              <Col
                span={2}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                {details.total_taka}
              </Col>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                {details.total_meter}
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
              <Col span={4} className="p-2 font-medium border-0 border-r">
                {/* {currentValues?.amount} */}
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
            <Row className="border-0 border-b">
              <Col
                span={6}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={2}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                Discount(%)
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
              <Col span={4} className="p-2 font-medium border-0 border-r">
                {currentValues?.discount_amount}
              </Col>
            </Row>
            <Row className="border-0 border-b">
              <Col
                span={6}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={2}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                SGST(%)
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
              <Col span={4} className="p-2 font-medium border-0 border-r">
                {currentValues?.SGST_amount}
              </Col>
            </Row>
            <Row className="border-0 border-b">
              <Col
                span={6}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={2}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                CGST(%)
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
              <Col span={4} className="p-2 font-medium border-0 border-r">
                {currentValues?.CGST_amount}
              </Col>
            </Row>
            <Row className="border-0 border-b">
              <Col
                span={6}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={2}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                IGST(%)
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
              <Col span={4} className="p-2 font-medium border-0 border-r">
                {currentValues?.IGST_amount}
              </Col>
            </Row>
            <Row className="border-0 border-b">
              <Col
                span={6}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={2}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                TCS(%)
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
              <Col span={4} className="p-2 font-medium border-0 border-r">
                {currentValues?.TCS_amount}
              </Col>
            </Row>
            <Row className="border-0 border-b border-solid">
              <Col
                span={6}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={2}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                Round Off
              </Col>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col span={4} className="p-2 font-medium border-0 border-r">
                {currentValues?.round_off}
              </Col>
            </Row>
            <Row className="border-0 border-b border-solid">
              <Col
                span={16}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                NO DYEING GUARANTEE
              </Col>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                NET AMOUNT
              </Col>
              <Col span={4} className="p-2 font-medium border-0 border-r">
                {currentValues?.net_amount}
              </Col>
            </Row>
            <Row className="border-0 border-b border-solid">
              <Col span={24} className="p-2 font-medium border-0 border-r">
                RS. (IN WORDS){" "}
                {currentValues?.net_amount !== ""
                  ? toWords.convert(currentValues?.net_amount)
                  : ""}
              </Col>
            </Row>
          </Flex>

          <Flex style={{ marginTop: 20 }} className="flex-col">
            <Row className="border-0 border-b ">
              <Col span={12} className="p-2 font-medium border-0 border-r ">
                <Flex gap={10} justify="flex-start" className="mt-3">
                  <Typography style={{
                    marginTop: "auto", 
                    marginBottom: "auto"
                  }}>TDS (%)</Typography>
                  <Form.Item
                    name="TDS_value"
                    validateStatus={errors.TDS_value ? "error" : ""}
                    help={errors.TDS_value && errors.TDS_value.message}
                    required={true}
                    wrapperCol={{ sm: 24 }}
                    style={{ marginBottom: 0 }}
                  >
                    <Controller
                      control={control}
                      name="TDS_value"
                      render={({ field }) => (
                        <Input
                          {...field}
                          name="TDS_value"
                          placeholder="TDS value"
                          disabled={MODE === "VIEW"}
                          style={{
                            color: "blue",
                            fontWeight: 600
                          }}
                          onChange={(e) => {
                            setValue("TDS_value", e.target.value);
                            calculateAfterTDSAmount(e.target.value);
                          }}
                        />
                      )}
                    />
                  </Form.Item>
                  <Typography style={{
                    marginTop: "auto", 
                    marginBottom: "auto"
                  }}>
                    After TDS amount: <span style={{
                      fontWeight: 600, 
                      color: "blue"
                    }}>{currentValues.after_TDS_amount}</span>
                  </Typography>
                </Flex>
              </Col>
              {/* <Col span={3} className="p-2 font-medium border-0 border-r ">
              </Col> */}
              <Col span={12} className="p-2 font-medium border-0 border-r ">
                {MODE === "ADD" ? (
                  <Flex gap={10} justify="flex-end" className="mt-3">
                    <Button htmlType="button" onClick={() => reset()}>
                      Reset
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isPending}
                    >
                      Receive Bill
                    </Button>
                  </Flex>
                ) : MODE === "UPDATE" ? (
                  <Flex gap={10} justify="flex-end" className="mt-3">
                    <Button htmlType="button" onClick={handleCloseModal}>
                      Close
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isPending}
                    >
                      Update
                    </Button>
                  </Flex>
                ) : (
                  <Flex gap={10} justify="flex-end" className="mt-3">
                    <Button htmlType="button" onClick={handleCloseModal}>
                      Close
                    </Button>
                  </Flex>
                )}
              </Col>
            </Row>
          </Flex>
        </Form>
      </Modal>
    </>
  );
};

export default PurchaseTakaChallanModal;
