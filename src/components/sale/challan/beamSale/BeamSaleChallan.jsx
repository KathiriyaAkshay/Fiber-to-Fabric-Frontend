import { useContext, useEffect } from "react";
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
const { Text, Title } = Typography;
import * as yup from "yup";
import { CloseOutlined } from "@ant-design/icons";
import { Controller, useForm } from "react-hook-form";
import dayjs from "dayjs";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import {
  createBeamSaleChallanBillRequest,
  getBeamSaleChallanBillByIdRequest,
} from "../../../../api/requests/sale/challan/beamSale";

const addSizeBeamReceive = yup.object().shape({
  E_way_bill_no: yup.string().required("Please enter invoice no."),
  bill_date: yup.string().required("Please enter bill date"),
  due_date: yup.string().required("Please enter due date"),
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

  net_amount: yup.string().required("Please enter net amount"),
});

const BeamSaleChallanModel = ({
  beamDetails = {},
  isModelOpen,
  handleCloseModal,
  MODE,
}) => {
  const details = { ...beamDetails, enter_weight: 10 };
  const queryClient = useQueryClient();
  const { companyId } = useContext(GlobalContext);
  const disablePastDates = (current) => {
    return current && current < new Date().setHours(0, 0, 0, 0);
  };

  const disableFutureDates = (current) => {
    return current && current > new Date().setHours(0, 0, 0, 0);
  };

  const { data: yarnSalesBillDetail = null } = useQuery({
    queryKey: ["/sale/challan/beam-sale/bill/get", MODE, { id: details.id }],
    queryFn: async () => {
      if (MODE === "VIEW" || MODE === "UPDATE") {
        const res = await getBeamSaleChallanBillByIdRequest({
          id: details.id,
          params: { company_id: companyId },
        });
        return res?.data?.data;
      }
    },
    enabled: Boolean(companyId),
  });

  const { mutateAsync: generateBeamSaleBill, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await createBeamSaleChallanBillRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["create", "sale", "beamSale", "bill"],
    onSuccess: (res) => {
      queryClient.invalidateQueries(["beamSale", "list", companyId]);
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
      beam_sale_id: details.id,
      E_way_bill_no: data.E_way_bill_no,
      invoice_no: data.E_way_bill_no,
      bill_date: dayjs(data.bill_date).format("YYYY-MM-DD"),
      due_date: dayjs(data.due_date).format("YYYY-MM-DD"),
      discount_value: +data.discount_value,
      discount_amount: +data.discount_amount,
      SGST_value: +data.SGST_value,
      SGST_amount: +data.SGST_amount,
      CGST_value: +data.CGST_value,
      CGST_amount: +data.CGST_amount,
      IGST_value: +data.IGST_value, // Assuming no IGST for this example
      IGST_amount: +data.IGST_amount, // Assuming no IGST for this example
      round_off_amount: +data.round_off,
      net_amount: +data.net_amount,
      net_rate: +data.net_rate,
      amount: +data.amount,
      rate: +data.rate,
    };
    await generateBeamSaleBill(newData);
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
    reset,
  } = useForm({
    resolver: yupResolver(addSizeBeamReceive),
    defaultValues: {
      E_way_bill_no: "",
      bill_date: dayjs(),
      due_date: dayjs(),

      rate: 0,
      amount: 0,

      discount_amount: 0,
      discount_value: 0,

      freight_value: 0,
      freight_amount: 0,
      net_amount: 0,
      net_rate: 0,

      IGST_amount: 0,
      IGST_value: 0,

      SGST_amount: 0,
      SGST_value: 0,

      CGST_amount: 0,
      CGST_value: 0,

      round_off: 0,
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

  function calculateAmount(rate, weight) {
    setValue("amount", (+rate * weight).toFixed(2));
    calculateDiscount(currentValues.discount_value);
  }
  function calculateRate(amount, weight) {
    setValue("rate", (+amount / weight).toFixed(2));
    calculateDiscount(currentValues.discount_value);
  }

  function calculatePercent(value, setName) {
    // return (amount * percentage) / 100;
    const finalValue = parseFloat(
      (+getValues("discount_amount") * +value) / 100
    ).toFixed(2);
    setValue(setName, finalValue);
  }

  useEffect(() => {
    const finalNetAmount = parseFloat(
      +currentValues.discount_amount +
        +currentValues.SGST_amount +
        +currentValues.CGST_amount +
        +currentValues.IGST_amount
    ).toFixed(2);
    const roundedNetAmount = Math.round(finalNetAmount);
    const roundOffValue = (roundedNetAmount - finalNetAmount).toFixed(2);

    setValue("net_amount", roundedNetAmount);

    // calculate net rate
    setValue(
      "net_rate",
      +(+roundedNetAmount / details.enter_weight).toFixed(2)
    );

    // calculate round off amount
    // setValue("round_off", (Math.round(+finalAmount) - +finalAmount).toFixed(2));
    setValue("round_off", roundOffValue);
  }, [
    currentValues.discount_amount,
    currentValues.SGST_amount,
    currentValues.CGST_amount,
    currentValues.IGST_amount,
    setValue,
    details.enter_weight,
  ]);

  //  CALCULATION END------------------------------------------------

  useEffect(() => {
    if (yarnSalesBillDetail) {
      setValue("E_way_bill_no", yarnSalesBillDetail.E_way_bill_no);
      setValue("rate", yarnSalesBillDetail.rate);
      setValue("amount", yarnSalesBillDetail.amount);

      setValue("net_amount", yarnSalesBillDetail.net_amount);
      setValue("net_rate", yarnSalesBillDetail.net_rate);
      setValue("round_off", yarnSalesBillDetail.round_off_amount);
      setValue("bill_date", dayjs(yarnSalesBillDetail.bill_date));
      setValue("due_date", dayjs(yarnSalesBillDetail.due_date));

      setValue("discount_amount", yarnSalesBillDetail.discount_amount);
      setValue("discount_value", yarnSalesBillDetail.discount_value);
      setValue("IGST_amount", yarnSalesBillDetail.IGST_amount);
      setValue("IGST_value", yarnSalesBillDetail.IGST_value);
      setValue("CGST_amount", yarnSalesBillDetail.CGST_amount);
      setValue("CGST_value", yarnSalesBillDetail.CGST_value);
      setValue("SGST_amount", yarnSalesBillDetail.SGST_amount);
      setValue("SGST_value", yarnSalesBillDetail.SGST_value);
    }
  }, [yarnSalesBillDetail, setValue]);

  return (
    <>
      <Modal
        closeIcon={<CloseOutlined className="text-white" />}
        title={
          <Typography.Text className="text-xl font-medium text-white">
            Receive Size Beam Challan
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
            <Row className="p-2 border-0 border-b border-solid">
              <Col
                span={24}
                className="flex items-center justify-center border"
              >
                <Typography.Text
                  className="font-semibold text-center"
                  style={{ fontSize: 24 }}
                >
                  :: SHREE GANESHAY NAMAH ::
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
              <Col span={8} className="flex items-center justify-center border">
                <Typography.Text className="font-semibold text-center">
                  GST IN: GST number information
                </Typography.Text>
              </Col>
              <Col span={8} className="flex items-center justify-center border">
                <Typography.Text className="font-semibold text-center">
                  PAN NO : ABHPP6021C
                </Typography.Text>
              </Col>
              <Col span={4} className="flex items-center justify-center border">
                <Typography.Text className="font-semibold text-center">
                  Bill date
                </Typography.Text>
              </Col>

              <Col span={4} className="flex items-center justify-center border">
                <Form.Item
                  // label="BILL Date"
                  name="bill_date"
                  validateStatus={errors.bill_date ? "error" : ""}
                  help={errors.bill_date && errors.bill_date.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                  style={{ margin: 0 }}
                  // className="mb-0"
                >
                  <Controller
                    control={control}
                    name="bill_date"
                    render={({ field }) => (
                      <DatePicker
                        {...field}
                        disabledDate={disableFutureDates}
                        style={{
                          width: "100%",
                        }}
                        format="DD-MM-YYYY"
                        disabled={MODE === "VIEW" || MODE === "UPDATE"}
                      />
                    )}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row className="p-2 border-0 border-b">
              <Col span={4} className="flex items-right justify-center border">
                <Typography.Text className="font-semibold text-center">
                  M/s.
                </Typography.Text>
              </Col>
              <Col span={8} className="flex items-right justify-center border">
                <Typography.Text className="font-semibold text-center">
                  SUPPLIER_2 ADDRESS OF SUPPLIER OF SUPPLIER NAME 123
                </Typography.Text>
              </Col>
              <Col span={4} className="flex items-right justify-center border">
                <Typography.Text className="font-semibold text-center">
                  INVOICE NO
                </Typography.Text>
              </Col>
              <Col span={8} className="flex items-right justify-left border">
                <Typography.Text className="font-semibold text-center text-left">
                  {details.challan_no}
                </Typography.Text>
              </Col>
            </Row>
            <Row className="p-2 border-0 border-b">
              <Col span={4} className="flex items-right justify-center border">
                <Typography.Text className="font-semibold text-center">
                  GST IN
                </Typography.Text>
              </Col>
              <Col span={8} className="flex items-right justify-left border">
                <Typography.Text className="font-semibold text-center">
                  24ABHPP6021C1Z4
                </Typography.Text>
              </Col>
              <Col span={4} className="flex items-right justify-center border">
                <Typography.Text
                  className="font-semibold text-center"
                  style={{ marginBottom: 0 }}
                >
                  CHALLAN NO.
                </Typography.Text>
              </Col>
              <Col span={8} className="flex items-right justify-left border">
                <Typography.Text className="font-semibold text-center">
                  {details.challan_no}
                </Typography.Text>
              </Col>
            </Row>
            <Row className="p-3 border-0 border-b border-solid mt-4">
              <Col span={4} className="flex items-right justify-center border">
                <Typography.Text className="font-semibold text-center">
                  E-WAY BILL NO
                </Typography.Text>
              </Col>
              <Col span={8} className="flex items-right justify-left borde">
                <Form.Item
                  // label="Invoice No."
                  name="E_way_bill_no"
                  validateStatus={errors.E_way_bill_no ? "error" : ""}
                  help={errors.E_way_bill_no && errors.E_way_bill_no.message}
                  required={true}
                  className="mb-0"
                >
                  <Controller
                    control={control}
                    name="E_way_bill_no"
                    render={({ field }) => (
                      <Input
                        type="number"
                        {...field}
                        placeholder="Invoice No."
                        disabled={MODE === "VIEW" || MODE === "UPDATE"}
                      />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={4} className="flex items-right justify-center border">
                <Typography.Text className="font-semibold text-center">
                  VEHICLE NO
                </Typography.Text>
              </Col>
              <Col span={8} className="flex items-right justify-left border">
                <Typography.Text className="font-semibold text-center">
                  {details.vehicle.vehicle.vehicleNo}
                </Typography.Text>
              </Col>
            </Row>

            <Row className="border-0 border-b border-solid !m-0">
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                QUALITY
              </Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                HSN NO
              </Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                TOTAL BEAM
              </Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                TOTAL METER
              </Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                TOTAL WEIGHT
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
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                {`${details?.inhouse_quality?.quality_name} (${details?.inhouse_quality?.quality_weight}KG)`}
              </Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                HSN
              </Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                {details.beam_sale_details?.length}
              </Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                {details.total_meter}
              </Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                {details.enter_weight}
              </Col>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                <Form.Item
                  // label="Invoice No."
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
                        onChange={(e) => {
                          setValue("rate", e.target.value);
                          calculateAmount(e.target.value, details.enter_weight);
                        }}
                        disabled={MODE === "VIEW"}
                      />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={4} className="p-2 font-medium">
                {/* {currentValues?.amount} */}
                <Form.Item
                  // label="Invoice No."
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
                          calculateRate(e.target.value, details.enter_weight);
                        }}
                      />
                    )}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row className="border-0 border-b !m-0">
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={3}
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
                Discount
              </Col>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                <Form.Item
                  // label="Invoice No."
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
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={3}
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
                SGST(%)
              </Col>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                <Form.Item
                  // label="Invoice No."
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
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={3}
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
                CGST(%)
              </Col>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                <Form.Item
                  // label="Invoice No."
                  name="CGST_value"
                  validateStatus={errors.SGST_value ? "error" : ""}
                  help={errors.SGST_value && errors.SGST_value.message}
                  required={true}
                  // className="mb-0"
                >
                  <Controller
                    control={control}
                    name="CGST_value"
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="CGST"
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
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={3}
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
                IGST(%)
              </Col>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                <Form.Item
                  // label="Invoice No."
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
                        placeholder="SGST"
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
            <Row className="border-0 border-b border-solid !m-0">
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={3}
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
                Round Off
              </Col>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col span={4} className="p-2 font-medium">
                {currentValues.round_off}
              </Col>
            </Row>
            <Row className="border-0 border-b border-solid !m-0">
              <Col span={7} className="p-2 font-medium border-0 border-r ">
                NO DYEING GUARANTEE
              </Col>
              <Col
                span={8}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                <Form.Item
                  // label="BILL Date"
                  name="due_date"
                  validateStatus={errors.due_date ? "error" : ""}
                  help={errors.bill_date && errors.due_date.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                  style={{ marginBottom: 0 }}
                >
                  <Controller
                    control={control}
                    name="due_date"
                    render={({ field }) => (
                      <DatePicker
                        {...field}
                        style={{
                          width: "100%",
                        }}
                        disabled={MODE === "VIEW" || MODE === "UPDATE"}
                        format="DD-MM-YYYY"
                        disabledDate={disablePastDates}
                      />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                NET AMOUNT
              </Col>
              <Col span={4} className="p-2 font-medium">
                {currentValues?.net_amount}
              </Col>
            </Row>
            <Row className="border-0 border-b border-solid !m-0">
              <Col span={24} className="p-2 font-medium border-0 border-r ">
                NET RATE: {currentValues.net_rate}Rs/Kg
              </Col>
            </Row>
            <Row className="border-0 border-b !m-0 p-4">
              <Col span={16} className="p-2">
                <Title level={5} className="m-0">
                  ➤ TERMS OF SALES :-
                </Title>
                <Text className="block">
                  1. Interest at 2% per month will be charged remaining unpaid
                  from the date bill.
                </Text>
                <Text className="block">
                  2. Complaint if any regarding this invoice must be settled
                  within 24 hours.
                </Text>
                <Text className="block">
                  3. Disputes shall be settled in SURAT court only.
                </Text>
                <Text className="block">
                  4. We are not responsible for processed goods & width.
                </Text>
                <Text className="block">5. Subject to SURAT Jurisdiction.</Text>
                <Text className="block mt-2"></Text>
              </Col>
              <Col span={8} className="p-2 text-right">
                <Text strong>For, SONU TEXTILES</Text>
              </Col>
            </Row>
            <Row
              className="border-0 border-b border-solid !m-0 p-4"
              style={{ paddingTop: 0 }}
            >
              <Col span={16} className="p-2">
                <Text strong>Bank Details:</Text> MESHANA URBAN
                <br />
                <Text strong>A/C No:</Text> 0021101005190
                <br />
                <Text strong>IFSC Code:</Text> MSNU0000021
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
              <Col
                span={6}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                {"PARTY'S BANK"}
              </Col>
            </Row>
            <Row className="border-0 border-b border-solid !m-0">
              <Col
                span={6}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={6}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={6}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={6}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
            </Row>
          </Flex>
          {MODE === "ADD" ? (
            <Flex gap={10} justify="flex-end" className="mt-3">
              <Button htmlType="button" onClick={() => reset()}>
                Reset
              </Button>
              <Button type="primary" htmlType="submit" loading={isPending}>
                Generate Bill
              </Button>
            </Flex>
          ) : MODE === "UPDATE" ? (
            <Flex gap={10} justify="flex-end" className="mt-3">
              <Button htmlType="button" onClick={handleCloseModal}>
                Close
              </Button>
              <Button type="primary" htmlType="submit" loading={isPending}>
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
        </Form>
      </Modal>
    </>
  );
};

export default BeamSaleChallanModel;
