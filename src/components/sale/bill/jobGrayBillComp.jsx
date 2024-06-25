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
const { Text, Title } = Typography;
import * as yup from "yup";
import { CloseOutlined } from "@ant-design/icons";
import { Controller, useForm } from "react-hook-form";
import dayjs from "dayjs";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { useContext, useEffect } from "react";
import { createSaleBillRequest } from "../../../api/requests/sale/bill/saleBill";
import { getJobGraySaleBillByIdRequest } from "../../../api/requests/sale/bill/jobGraySaleBill";

const addSaleBillSchema = yup.object().shape({
  invoice_no: yup.string().required("Please enter invoice no."),
  // bill_date: yup.string().required("Please enter bill date"),
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

  // TDS_value: yup.string().required("Please enter TDS value"),
  // after_TDS_amount: yup.string().required("Please enter after TDS amount"),

  rate: yup.string().required("Please enter rate"),
  amount: yup.string().required("Please enter amount"),
});

const JobGrayBillComp = ({ isModelOpen, handleCloseModal, details, MODE }) => {
  const queryClient = useQueryClient();
  const { companyId } = useContext(GlobalContext);

  const { data: jobGrayBillDetail = null } = useQuery({
    queryKey: ["/sale/job-gray-sale/bill/get", MODE, { id: details.id }],
    queryFn: async () => {
      if (MODE === "VIEW" || MODE === "UPDATE") {
        const res = await getJobGraySaleBillByIdRequest({
          id: details.id,
          params: {
            company_id: companyId,
          },
        });
        return res?.data?.data.jobGraySaleBill;
      }
    },
    enabled: Boolean(companyId),
  });

  const { mutateAsync: addJobGrayBill, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await createSaleBillRequest({
        data,
        params: {
          company_id: companyId,
          bill_id: details.id,
        },
      });
      return res.data;
    },
    mutationKey: ["jobGray", "bill", "add"],
    onSuccess: (res) => {
      queryClient.invalidateQueries(["jobGrayBill", "list", companyId]);
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
        order_id: null,
        party_id: jobGrayBillDetail.party.id,
        broker_id: jobGrayBillDetail.broker.id,
        invoice_no: data.invoice_no,
        machine_name: jobGrayBillDetail.machine_name,
        quality_id: jobGrayBillDetail.quality_id,
        total_taka: jobGrayBillDetail.total_taka,
        total_meter: jobGrayBillDetail.total_meter,

        rate: +data.rate,
        net_amount: +data.net_amount,
        due_days: jobGrayBillDetail.due_days,
        hsn_no: jobGrayBillDetail.hsn_no,
        // bill_date: dayjs(data.bill_date).format("YYYY-MM-DD"),
        //   due_date: dayjs(data.due_date).format("YYYY-MM-DD"),
        discount_value: +data.discount_value,
        discount_amount: +data.discount_amount,
        SGST_value: +data.SGST_value,
        SGST_amount: +data.SGST_amount,
        CGST_value: +data.CGST_value,
        CGST_amount: +data.CGST_amount,
        IGST_value: +data.IGST_value,
        IGST_amount: +data.IGST_amount,
        // TCS_value: +data.TCS_value,
        // TCS_amount: +data.TCS_amount,
        round_off_amount: +data.round_off,
        amount: +data.amount,
      },
    ];
    await addJobGrayBill(newData);
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = useForm({
    // resolver: yupResolver(addSizeBeamReceive),
    defaultValues: {
      bill_date: dayjs(),
      invoice_no: "",
      //   due_date: dayjs(),
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
    // const discountAmount = parseFloat(
    //   +getValues("amount") - discountValue
    // ).toFixed(2);
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
    // const finalValue = parseFloat(
    //   (+getValues("discount_amount") * +value) / 100
    // ).toFixed(2);
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

  // const calculateAfterTDSAmount = (TDSValue) => {
  //   const TDS_amount = (+getValues("discount_amount") * +TDSValue) / 100;
  //   const afterTDS = +Math.abs(+getValues("net_amount") - TDS_amount).toFixed(
  //     0
  //   );
  //   setValue("after_TDS_amount", afterTDS);
  // };

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
    if (jobGrayBillDetail) {
      setValue("invoice_no", jobGrayBillDetail.invoice_no);
      setValue("rate", jobGrayBillDetail.rate);
      setValue("amount", jobGrayBillDetail.amount);

      setValue("net_amount", jobGrayBillDetail.net_amount);
      setValue("net_rate", jobGrayBillDetail.net_rate);
      setValue("round_off", jobGrayBillDetail.round_off_amount);
      setValue("bill_date", dayjs(jobGrayBillDetail.bill_date));
      setValue("due_date", dayjs(jobGrayBillDetail.due_date));

      setValue("discount_amount", jobGrayBillDetail.discount_amount);
      setValue("discount_value", jobGrayBillDetail.discount_value);
      setValue("IGST_amount", jobGrayBillDetail.IGST_amount);
      setValue("IGST_value", jobGrayBillDetail.IGST_value);
      setValue("CGST_amount", jobGrayBillDetail.CGST_amount);
      setValue("CGST_value", jobGrayBillDetail.CGST_value);
      setValue("SGST_amount", jobGrayBillDetail.SGST_amount);
      setValue("SGST_value", jobGrayBillDetail.SGST_value);
      setValue("TCS_value", jobGrayBillDetail.TCS_value || 0);
      setValue("TCS_amount", jobGrayBillDetail.TCS_amount || 0);

      // setValue("TDS_value", saleBillDetail.TDS_value);
      // setValue("after_TDS_amount", saleBillDetail.after_TDS_amount);
    }
  }, [jobGrayBillDetail, setValue]);

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
        <Form onFinish={handleSubmit(onSubmit)}>
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
              <Col
                span={24}
                className="flex items-center justify-center border"
              >
                <Typography.Text className="font-semibold text-center">
                  PLOT NO. 78,, JAYVEER INDU. ESTATE,, GUJARAT HOUSING BOARD
                  ROAD, PANDESARA,, SURAT, GUJARAT,394221, PANDESARA
                  <br />
                  394221
                  <br />
                  DIST: Surat
                  <br />
                  MOBILE NO: 6353207671, PAYMENT: 6353207671
                </Typography.Text>
              </Col>
            </Row>

            <Row className="border-0 border-b border-solid !m-0 p-2">
              <Col span={12} className="border-r pr-4">
                <Typography.Text className="block font-semibold">
                  M/s.
                </Typography.Text>
                <Typography.Text>
                  BABAJI SILK FABRIC / H M SILK FABRIC
                </Typography.Text>
                <Typography.Text className="block">
                  GALA NO 16, B PART, BHAWANI C. H. S. LTD, GARRAGE GALLI,
                  DADAR,
                </Typography.Text>
                <Typography.Text className="block">
                  Maharashtra, 400028
                </Typography.Text>
                <Typography.Text
                  className="block mt-2 font-semibold"
                  style={{ color: "black" }}
                >
                  GST IN
                </Typography.Text>
                <Typography.Text>27ANJPD1966G1ZZ</Typography.Text>
                <Typography.Text className="block mt-2">
                  E-WAY BILL NO.
                </Typography.Text>
              </Col>
              <Col span={12} className="pl-4">
                <Row>
                  <Col span={12}>
                    <Typography.Text className="block font-semibold">
                      INVOICE NO.
                    </Typography.Text>
                    <Typography.Text>
                      {jobGrayBillDetail?.invoice_no}
                    </Typography.Text>
                  </Col>
                  <Col span={12}>
                    <Typography.Text className="block font-semibold">
                      ORDER NO.
                    </Typography.Text>
                  </Col>
                </Row>
                <Row className="mt-2">
                  <Col span={12}>
                    <Typography.Text className="block font-semibold">
                      PARTY ORDER NO.
                    </Typography.Text>
                  </Col>
                  <Col span={12}>
                    <Typography.Text className="block font-semibold">
                      CHALLAN NO.
                    </Typography.Text>
                    <Typography.Text>21312</Typography.Text>
                  </Col>
                </Row>
                <Row className="mt-2">
                  <Col span={12}>
                    <Typography.Text className="block font-semibold">
                      BROKER NAME
                    </Typography.Text>
                    <Typography.Text>
                      {jobGrayBillDetail?.broker?.first_name}{" "}
                      {jobGrayBillDetail?.broker?.last_name}
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
                {jobGrayBillDetail?.total_meter}
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
                          calculateAmount(
                            e.target.value,
                            jobGrayBillDetail.total_meter
                          );
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
                          calculateRate(
                            e.target.value,
                            jobGrayBillDetail.total_meter
                          );
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
                Avg Rate: 123
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
                <div style={{ color: "gray" }}>Round off</div>
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
                  BABAJI SILK FABRIC / H M SILK FABRIC
                </Typography.Text>
                <Typography.Text className="block mt-1">
                  GALA NO 16, B PART, BHAWANI C. H. S. LTD, GARRAGE GALLI,
                  DADAR,
                </Typography.Text>
                <Typography.Text className="block">
                  Maharashtra, 400028
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
                <div style={{ color: "gray" }}>Due date: 18/05/2023</div>
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
            <Row className="border-0 border-b border-solid !m-0 ">
              <Col
                span={24}
                className="pt-2 pb-2 pl-2 border-0 border-r border-solid"
              >
                <Typography.Text className="font-semibold">
                  Tax Amount(IN WORDS):INR Fifteen Thousand One Hundred and
                  Twenty Nine only
                </Typography.Text>
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
          </Flex>
          <Row justify={"end"}>
            <Col span={12} className="p-2 font-medium border-0 border-r ">
              {MODE === "UPDATE" ? (
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
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default JobGrayBillComp;
