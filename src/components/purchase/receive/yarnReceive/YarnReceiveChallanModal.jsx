import { useContext, useEffect, useState } from "react";
import {
  Button,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  Modal,
  Radio,
  Row,
  Select,
  Typography,
  message,
} from "antd";
import { CloseOutlined, FileTextOutlined } from "@ant-design/icons";
import { Controller, useForm } from "react-hook-form";
import dayjs from "dayjs";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ToWords } from "to-words";
import { createYarnReceiveBillRequest } from "../../../../api/requests/purchase/yarnReceive";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { useCompanyList } from "../../../../api/hooks/company";
import { getYarnOrderListRequest } from "../../../../api/requests/orderMaster";
import { getDropdownSupplierListRequest } from "../../../../api/requests/users";
import { mutationOnErrorHandler } from "../../../../utils/mutationUtils";

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

const addYarnReceiveSchema = yup.object().shape({
  order_id: yup.string().required("Please select order no."),
  receive_quantity: yup.string().required("Please enter receive quantity"),
  supplier_company_id: yup.string().required("Please select supplier company"),
  invoice_no: yup.string().required("Please enter invoice no."),
  yarn_stock_company_id: yup
    .string()
    .required("Please enter yarn stock company"),
  bill_date: yup.string().required("Please enter bill date"),
  due_date: yup.string().required("Please enter due date"),
  yarn_challan_id: yup.string().required("Please enter yarn challan"),
  freight_value: yup.string().required("Please enter freight value"),
  freight_amount: yup.string().required("Please enter freight amount"),
  is_discount: yup.string().required("Please enter is discount"),
  discount_brokerage_value: yup
    .string()
    .required("Please enter discount brokerage value"),
  discount_brokerage_amount: yup
    .string()
    .required("Please enter discount brokerage amount"),
  SGST_value: yup.string().required("Please enter SGST value"),
  SGST_amount: yup.string().required("Please enter SGST amount"),
  CGST_value: yup.string().required("Please enter CGST value"),
  CGST_amount: yup.string().required("Please enter CGST amount"),
  TCS_value: yup.string().required("Please enter TCS value"),
  TCS_amount: yup.string().required("Please enter TCS amount"),
  IGST_value: yup.string().required("Please enter IGST value"),
  IGST_amount: yup.string().required("Please enter IGST amount"),
  // round_off_amount: yup.string().required("Please enter round off amount"),
  net_amount: yup.string().required("Please enter net amount"),
  TDS_amount: yup.string().required("Please enter TDS amount"),
  after_TDS_amount: yup.string().required("Please enter after TDS amount"),
  quantity_rate: yup.string().required("Please enter quantity rate"),
  quantity_amount: yup.string().required("Please enter quantity amount"),
});

const YarnReceiveChallanModal = ({ details = {} }) => {
  const {
    id: yarn_challan_id = 0,
    challan_no = "",
    yarn_stock_company = {},
    receive_cartoon_pallet = 0,
    receive_quantity = 0,
    yarn_stock_company_id = 0,
  } = details;
  const {
    yarn_count = 0,
    filament = 0,
    yarn_type = "",
    yarn_Sub_type = "",
    luster_type = "",
    yarn_color = "",
    hsn_no = "",
    yarn_company_name = "",
  } = yarn_stock_company;
  const { companyId } = useContext(GlobalContext);
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplierName, setSupplierName] = useState();
  const { data: companyListRes, isLoading: isLoadingCompanyList } =
    useCompanyList();

  const { data: yarnOrderListRes, isLoading: isLoadingYarnOrderList } =
    useQuery({
      queryKey: ["order-master/yarn-order/list", { company_id: companyId }],
      queryFn: async () => {
        const res = await getYarnOrderListRequest({
          params: { company_id: companyId },
        });
        return res.data?.data?.yarnOrderList;
      },
      enabled: Boolean(companyId),
    });

  // fixed Value yarn for supplier_type
  const {
    data: dropdownSupplierListRes,
    isLoading: isLoadingDropdownSupplierList,
  } = useQuery({
    queryKey: [
      "dropdown/supplier/list",
      {
        company_id: companyId,
        supplier_name: supplierName,
        supplier_type: "yarn",
      },
    ],
    queryFn: async () => {
      const res = await getDropdownSupplierListRequest({
        params: {
          company_id: companyId,
          supplier_name: supplierName,
          supplier_type: "yarn",
        },
      });
      return res.data?.data?.supplierList;
    },
    enabled: Boolean(companyId && supplierName),
  });

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const { mutateAsync: createYarnReceive } = useMutation({
    mutationFn: async (data) => {
      const res = await createYarnReceiveBillRequest({
        data,
        params: { company_id: companyId },
      });
      return res.data;
    },
    mutationKey: ["yarn-stock/yarn-receive-challan/create"],
    onSuccess: (res) => {
      queryClient.invalidateQueries([
        "yarn-stock/yarn-receive-challan/list",
        { company_id: companyId },
      ]);
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      handleCancel();
    },
    onError: (error) => {
      mutationOnErrorHandler({ error, message });
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(addYarnReceiveSchema),
    defaultValues: {
      bill_date: dayjs(),
      due_date: dayjs(),
      is_discount: false,
      receive_quantity: receive_quantity,
      yarn_challan_id: yarn_challan_id,
      yarn_stock_company_id: yarn_stock_company_id,
    },
  });

  console.log("errors----->", errors);

  async function onSubmit(data) {
    delete data.yarn_company_name;
    delete data.company_id;
    // data.net_amount = Math.ceil(data?.net_amount);
    await createYarnReceive(data);
  }

  const {
    order_id = 0,
    discount_brokerage_amount = 0,
    quantity_amount = 0,
    freight_amount = 0,
    discount_brokerage_value = 0,
    is_discount = false,
    CGST_amount = 0,
    CGST_value = 0,
    IGST_amount = 0,
    IGST_value = 0,
    SGST_amount = 0,
    SGST_value = 0,
    TCS_value = 0,
    TCS_amount = 0,
    net_amount = 0,
    after_TDS_amount = 0,
    // round_off_amount = 0,
  } = watch();

  useEffect(() => {
    yarnOrderListRes?.rows?.forEach((yOrder) => {
      if (yOrder?.id === order_id) {
        const { rate = 0, freight = 0, user = {} } = yOrder;

        // set total amount on rate change
        setValue("quantity_rate", parseFloat(rate).toFixed(2));
        const quantity_amount = Number(rate) * Number(receive_quantity);
        setValue("quantity_amount", parseFloat(quantity_amount).toFixed(2));

        // set freight value
        setValue("freight_value", parseFloat(freight).toFixed(2));
        const freight_amount = Number(freight) * Number(receive_quantity);
        setValue("freight_amount", parseFloat(freight_amount).toFixed(2));

        const { supplier = {} } = user;
        const { supplier_name = "" } = supplier;
        setSupplierName(supplier_name);
      }
    });
  }, [order_id, receive_quantity, setValue, yarnOrderListRes?.rows]);

  useEffect(() => {
    let qAmount = quantity_amount;
    if (is_discount) {
      // the discount amount
      const discountAmount =
        (Number(quantity_amount) * Number(discount_brokerage_value)) / 100;

      // the price after discount
      const priceAfterDiscount = quantity_amount - discountAmount;
      qAmount = is_discount ? priceAfterDiscount : quantity_amount;
    }
    const discount_brokerage_amount =
      Number(qAmount) +
      Number(freight_amount) -
      (Number(discount_brokerage_value) * Number(receive_quantity) || 0);
    setValue(
      "discount_brokerage_amount",
      parseFloat(discount_brokerage_amount).toFixed(2)
    );
  }, [
    discount_brokerage_value,
    freight_amount,
    is_discount,
    quantity_amount,
    receive_quantity,
    setValue,
  ]);

  useEffect(() => {
    const SGST_amount =
      (Number(discount_brokerage_amount) * Number(SGST_value)) / 100;
    setValue("SGST_amount", parseFloat(SGST_amount).toFixed(2));

    const CGST_amount =
      (Number(discount_brokerage_amount) * Number(CGST_value)) / 100;
    setValue("CGST_amount", parseFloat(CGST_amount).toFixed(2));

    const IGST_amount =
      (Number(discount_brokerage_amount) * Number(IGST_value)) / 100;
    setValue("IGST_amount", parseFloat(IGST_amount).toFixed(2));

    const amountWithTax =
      Number(discount_brokerage_amount) +
      Number(SGST_amount) +
      Number(CGST_amount) +
      Number(IGST_amount);
    const TCS_amount = (Number(amountWithTax) * Number(TCS_value)) / 100;
    setValue("TCS_amount", parseFloat(TCS_amount).toFixed(2));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discount_brokerage_amount, setValue]);

  useEffect(() => {
    const net_amount =
      Number(discount_brokerage_amount) +
      Number(SGST_amount) +
      Number(CGST_amount) +
      Number(IGST_amount) +
      Number(TCS_amount);
    setValue("net_amount", parseFloat(net_amount).toFixed(2));
    // setValue(
    //   "round_off_amount",
    //   parseFloat(Math.ceil(net_amount) - net_amount).toFixed(2)
    // );
  }, [
    CGST_amount,
    IGST_amount,
    SGST_amount,
    TCS_amount,
    discount_brokerage_amount,
    setValue,
  ]);

  return (
    <>
      <Button onClick={showModal}>
        <FileTextOutlined />
      </Button>
      <Modal
        closeIcon={<CloseOutlined className="text-white" />}
        title={
          <Typography.Text className="text-xl font-medium text-white">
            Yarn Receive Challan
          </Typography.Text>
        }
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
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
        width={"80vw"}
      >
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Flex className="flex-col border border-b-0 border-solid">
            <Row className="p-2 border-0 border-b border-solid">
              <Col
                span={24}
                className="flex items-center justify-center border"
              >
                <Typography.Text className="font-semibold text-center">
                  :: SHREE GANESHAY NAMAH ::
                </Typography.Text>
              </Col>
            </Row>

            <Row
              className="px-2 pt-4 border-0 border-b border-solid !m-0"
              gutter={12}
            >
              <Col span={6}>
                <Form.Item
                  label="Order No."
                  name="order_id"
                  validateStatus={errors.order_id ? "error" : ""}
                  help={errors.order_id && errors.order_id.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                // className="mb-0"
                >
                  <Controller
                    control={control}
                    name="order_id"
                    render={({ field }) => (
                      <Select
                        {...field}
                        placeholder="Select order"
                        loading={isLoadingYarnOrderList}
                        options={yarnOrderListRes?.rows?.map(
                          ({ id = "", order_no = 0 }) => ({
                            label: order_no,
                            value: id,
                          })
                        )}
                        style={{
                          width: "100%",
                        }}
                      />
                    )}
                  />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  label="Supplier Company"
                  name="supplier_company_id"
                  validateStatus={errors.supplier_company_id ? "error" : ""}
                  help={
                    errors.supplier_company_id &&
                    errors.supplier_company_id.message
                  }
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name="supplier_company_id"
                    render={({ field }) => (
                      <Select
                        {...field}
                        placeholder="Select supplier Company"
                        loading={isLoadingDropdownSupplierList}
                        options={dropdownSupplierListRes?.[0]?.supplier_company?.map(
                          ({ supplier_company = "", supplier_id = "" }) => {
                            return {
                              label: supplier_company,
                              value: supplier_id,
                            };
                          }
                        )}
                      />
                    )}
                  />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  label="To Company"
                  name="company_id"
                  validateStatus={errors.company_id ? "error" : ""}
                  help={errors.company_id && errors.company_id.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                // className="mb-0"
                >
                  <Controller
                    control={control}
                    name="company_id"
                    render={({ field }) => (
                      <Select
                        {...field}
                        placeholder="Select Company"
                        loading={isLoadingCompanyList}
                        options={companyListRes?.rows?.map(
                          ({ company_name = "", id = "" }) => ({
                            label: company_name,
                            value: id,
                          })
                        )}
                        style={{
                          width: "100%",
                        }}
                      />
                    )}
                  />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  label="Invoice No."
                  name="invoice_no"
                  validateStatus={errors.invoice_no ? "error" : ""}
                  help={errors.invoice_no && errors.invoice_no.message}
                  required={true}
                // className="mb-0"
                >
                  <Controller
                    control={control}
                    name="invoice_no"
                    render={({ field }) => (
                      <Input {...field} placeholder="Invoice No." />
                    )}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row
              className="px-2 pt-4 border-0 border-b border-solid !m-0"
              gutter={12}
            >
              <Col span={12} className="flex flex-col self-center mb-6">
                <Row gutter={12} className="flex-grow w-full">
                  <Col span={8} className="font-medium">
                    Supplier Name
                  </Col>
                  <Col span={16}>{supplierName}</Col>
                </Row>
                <Row gutter={12} className="flex-grow w-full">
                  <Col span={8} className="font-medium">
                    Company Name
                  </Col>
                  <Col span={16}>{yarn_company_name}</Col>
                </Row>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="BILL Date"
                  name="bill_date"
                  validateStatus={errors.bill_date ? "error" : ""}
                  help={errors.bill_date && errors.bill_date.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                // className="mb-0"
                >
                  <Controller
                    control={control}
                    name="bill_date"
                    render={({ field }) => (
                      <DatePicker
                        {...field}
                        style={{
                          width: "100%",
                        }}
                        format="DD-MM-YYYY"
                      />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="DUE Date"
                  name="due_date"
                  validateStatus={errors.due_date ? "error" : ""}
                  help={errors.due_date && errors.due_date.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                // className="mb-0"
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
                        format="DD-MM-YYYY"
                      />
                    )}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row className="border-0 border-b border-solid !m-0">
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                Challan
              </Col>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                Denier
              </Col>
              <Col
                span={2}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                HSN No
              </Col>
              <Col
                span={2}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                Quantity
              </Col>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                Cartoon
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

            <Row>
              <Col span={4} className="p-2 border-0 border-r border-solid">
                {challan_no}
              </Col>
              <Col span={4} className="p-2 border-0 border-r border-solid">
                {`${yarn_count}C/${filament}F (${yarn_type}(${yarn_Sub_type}) - ${luster_type} - ${yarn_color})`}
              </Col>
              <Col span={2} className="p-2 border-0 border-r border-solid">
                {hsn_no}
              </Col>
              <Col span={2} className="p-2 border-0 border-r border-solid">
                {receive_quantity}
              </Col>
              <Col span={4} className="p-2 border-0 border-r border-solid">
                {receive_cartoon_pallet}
              </Col>
              <Col span={4} className="p-2 border-0 border-r border-solid">
                <Form.Item
                  name="quantity_rate"
                  validateStatus={errors.quantity_rate ? "error" : ""}
                  help={errors.quantity_rate && errors.quantity_rate.message}
                  required={true}
                // className="mb-0"
                >
                  <Controller
                    control={control}
                    name="quantity_rate"
                    render={({ field }) => (
                      <Input
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          const currentQRate = e.target.value;
                          if (currentQRate) {
                            // set amount on rate change
                            const quantity_amount =
                              Number(currentQRate) * Number(receive_quantity);
                            setValue(
                              "quantity_amount",
                              parseFloat(quantity_amount).toFixed(2)
                            );
                          }
                        }}
                        placeholder="0"
                        type="number"
                        min={0}
                        step={0.01}
                      />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={4} className="p-2">
                <Form.Item
                  name="quantity_amount"
                  validateStatus={errors.quantity_amount ? "error" : "success"}
                  help={
                    is_discount ? (
                      <Typography.Text type="success">{`Disc: ${parseFloat(
                        (Number(quantity_amount) *
                          Number(discount_brokerage_value)) /
                        100
                      ).toFixed(2)}`}</Typography.Text>
                    ) : (
                      errors.quantity_amount && errors.quantity_amount.message
                    )
                  }
                  required={true}
                // className="mb-0"
                >
                  <Controller
                    control={control}
                    name="quantity_amount"
                    render={({ field }) => (
                      <Input
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          const currentQAmount = e.target.value;
                          if (currentQAmount && receive_quantity) {
                            // set rate on amount change
                            const quantity_rate =
                              Number(currentQAmount) / Number(receive_quantity);
                            setValue(
                              "quantity_rate",
                              parseFloat(quantity_rate).toFixed(2)
                            );
                          }
                        }}
                        placeholder="0"
                        type="number"
                        min={0}
                        step={0.01}
                      />
                    )}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col span={4} className="p-2 border-0 border-r border-solid" />
              <Col span={4} className="p-2 border-0 border-r border-solid" />
              <Col span={2} className="p-2 border-0 border-r border-solid" />
              <Col span={2} className="p-2 border-0 border-r border-solid" />
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                FREIGHT
              </Col>
              <Col span={4} className="p-2 border-0 border-r border-solid">
                <Form.Item
                  name="freight_value"
                  validateStatus={errors.freight_value ? "error" : ""}
                  help={errors.freight_value && errors.freight_value.message}
                  required={true}
                // className="mb-0"
                >
                  <Controller
                    control={control}
                    name="freight_value"
                    render={({ field }) => (
                      <Input
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          const currentFValue = e.target.value;
                          if (currentFValue) {
                            // set amount on rate change
                            const freight_amount =
                              Number(currentFValue) * Number(receive_quantity);
                            setValue(
                              "freight_amount",
                              parseFloat(freight_amount).toFixed(2)
                            );
                          }
                        }}
                        placeholder="0"
                        type="number"
                        min={0}
                        step={0.01}
                      />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={4} className="p-2">
                <Form.Item
                  name="freight_amount"
                  validateStatus={errors.freight_amount ? "error" : ""}
                  help={errors.freight_amount && errors.freight_amount.message}
                  required={true}
                // className="mb-0"
                >
                  <Controller
                    control={control}
                    name="freight_amount"
                    render={({ field }) => (
                      <Input
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          const currentFAmount = e.target.value;
                          if (currentFAmount && receive_quantity) {
                            // set rate on amount change
                            const freight_value =
                              Number(currentFAmount) / Number(receive_quantity);
                            setValue(
                              "freight_value",
                              parseFloat(freight_value).toFixed(2)
                            );
                          }
                        }}
                        placeholder="0"
                        type="number"
                        min={0}
                        step={0.01}
                      />
                    )}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col span={4} className="p-2 border-0 border-r border-solid" />
              <Col span={4} className="p-2 border-0 border-r border-solid" />
              <Col span={2} className="p-2 border-0 border-r border-solid" />
              <Col span={2} className="p-2 border-0 border-r border-solid" />
              <Col
                span={4}
                className="p-2 font-semibold border-0 border-r border-solid"
              >
                <Form.Item
                  name="is_discount"
                  validateStatus={errors.is_discount ? "error" : ""}
                  help={errors.is_discount && errors.is_discount.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name="is_discount"
                    render={({ field }) => (
                      <Radio.Group {...field} className="flex flex-wrap">
                        <Radio value={true}>DIS(%)</Radio>
                        <Radio value={false}>BrKg(%)</Radio>
                      </Radio.Group>
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={4} className="p-2 border-0 border-r border-solid">
                <Form.Item
                  name="discount_brokerage_value"
                  validateStatus={
                    errors.discount_brokerage_value ? "error" : ""
                  }
                  help={
                    errors.discount_brokerage_value &&
                    errors.discount_brokerage_value.message
                  }
                  required={true}
                // className="mb-0"
                >
                  <Controller
                    control={control}
                    name="discount_brokerage_value"
                    render={({ field }) => (
                      <Input
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                        placeholder="0"
                        type="number"
                        min={0}
                        step={0.01}
                      />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={4} className="p-2">
                <div className="flex items-center justify-center p-1 mb-6">
                  {discount_brokerage_amount}
                </div>
              </Col>
            </Row>

            <Row>
              <Col span={4} className="p-2 border-0 border-r border-solid" />
              <Col span={4} className="p-2 border-0 border-r border-solid" />
              <Col span={2} className="p-2 border-0 border-r border-solid" />
              <Col span={2} className="p-2 border-0 border-r border-solid" />
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                SGST(%)
              </Col>
              <Col span={4} className="p-2 border-0 border-r border-solid">
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
                        onChange={(e) => {
                          field.onChange(e);
                          const currentFValue = e.target.value;
                          const SGST_amount =
                            (Number(discount_brokerage_amount) *
                              Number(currentFValue)) /
                            100;
                          setValue(
                            "SGST_amount",
                            parseFloat(SGST_amount).toFixed(2)
                          );
                        }}
                        placeholder="0"
                        type="number"
                        min={0}
                        step={0.01}
                      />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={4} className="p-2">
                <Form.Item
                  name="SGST_amount"
                  validateStatus={errors.SGST_amount ? "error" : ""}
                  help={errors.SGST_amount && errors.SGST_amount.message}
                  required={true}
                // className="mb-0"
                >
                  <Controller
                    control={control}
                    name="SGST_amount"
                    render={({ field }) => (
                      <Input
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          const amount = e.target.value;
                          if (amount && discount_brokerage_amount) {
                            // set rate on amount change
                            const SGST_value =
                              (Number(amount) /
                                Number(discount_brokerage_amount)) *
                              100;
                            setValue(
                              "SGST_value",
                              parseFloat(SGST_value).toFixed(2)
                            );
                          }
                        }}
                        placeholder="0"
                        type="number"
                        min={0}
                        step={0.01}
                      />
                    )}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col span={4} className="p-2 border-0 border-r border-solid" />
              <Col span={4} className="p-2 border-0 border-r border-solid" />
              <Col span={2} className="p-2 border-0 border-r border-solid" />
              <Col span={2} className="p-2 border-0 border-r border-solid" />
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                CGST(%)
              </Col>
              <Col span={4} className="p-2 border-0 border-r border-solid">
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
                        onChange={(e) => {
                          field.onChange(e);
                          const currentFValue = e.target.value;
                          const CGST_amount =
                            (Number(discount_brokerage_amount) *
                              Number(currentFValue)) /
                            100;
                          setValue(
                            "CGST_amount",
                            parseFloat(CGST_amount).toFixed(2)
                          );
                        }}
                        placeholder="0"
                        type="number"
                        min={0}
                        step={0.01}
                      />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={4} className="p-2">
                <Form.Item
                  name="CGST_amount"
                  validateStatus={errors.CGST_amount ? "error" : ""}
                  help={errors.CGST_amount && errors.CGST_amount.message}
                  required={true}
                // className="mb-0"
                >
                  <Controller
                    control={control}
                    name="CGST_amount"
                    render={({ field }) => (
                      <Input
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          const amount = e.target.value;
                          if (amount && discount_brokerage_amount) {
                            // set rate on amount change
                            const CGST_value =
                              (Number(amount) /
                                Number(discount_brokerage_amount)) *
                              100;
                            setValue(
                              "CGST_value",
                              parseFloat(CGST_value).toFixed(2)
                            );
                          }
                        }}
                        placeholder="0"
                        type="number"
                        min={0}
                        step={0.01}
                      />
                    )}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col span={4} className="p-2 border-0 border-r border-solid" />
              <Col span={4} className="p-2 border-0 border-r border-solid" />
              <Col span={2} className="p-2 border-0 border-r border-solid" />
              <Col span={2} className="p-2 border-0 border-r border-solid" />
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                IGST(%)
              </Col>
              <Col span={4} className="p-2 border-0 border-r border-solid">
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
                        onChange={(e) => {
                          field.onChange(e);
                          const currentFValue = e.target.value;
                          const IGST_amount =
                            (Number(discount_brokerage_amount) *
                              Number(currentFValue)) /
                            100;
                          setValue(
                            "IGST_amount",
                            parseFloat(IGST_amount).toFixed(2)
                          );
                        }}
                        placeholder="0"
                        type="number"
                        min={0}
                        step={0.01}
                      />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={4} className="p-2">
                <Form.Item
                  name="IGST_amount"
                  validateStatus={errors.IGST_amount ? "error" : ""}
                  help={errors.IGST_amount && errors.IGST_amount.message}
                  required={true}
                // className="mb-0"
                >
                  <Controller
                    control={control}
                    name="IGST_amount"
                    render={({ field }) => (
                      <Input
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          const amount = e.target.value;
                          if (amount && discount_brokerage_amount) {
                            // set rate on amount change
                            const IGST_value =
                              (Number(amount) /
                                Number(discount_brokerage_amount)) *
                              100;
                            setValue(
                              "IGST_value",
                              parseFloat(IGST_value).toFixed(2)
                            );
                          }
                        }}
                        placeholder="0"
                        type="number"
                        min={0}
                        step={0.01}
                      />
                    )}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row className="border-0 border-b border-solid">
              <Col span={4} className="p-2 border-0 border-r border-solid" />
              <Col span={4} className="p-2 border-0 border-r border-solid" />
              <Col span={2} className="p-2 border-0 border-r border-solid" />
              <Col span={2} className="p-2 border-0 border-r border-solid" />
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                TCS(%)
              </Col>
              <Col span={4} className="p-2 border-0 border-r border-solid">
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
                        onChange={(e) => {
                          field.onChange(e);
                          const currentFValue = e.target.value;
                          const amountWithTax =
                            Number(discount_brokerage_amount) +
                            Number(SGST_amount) +
                            Number(CGST_amount) +
                            Number(IGST_amount);
                          const TCS_amount =
                            (Number(amountWithTax) * Number(currentFValue)) /
                            100;
                          setValue(
                            "TCS_amount",
                            parseFloat(TCS_amount).toFixed(2)
                          );
                        }}
                        placeholder="0"
                        type="number"
                        min={0}
                        step={0.01}
                      />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={4} className="p-2">
                <Form.Item
                  name="TCS_amount"
                  validateStatus={errors.TCS_amount ? "error" : ""}
                  help={errors.TCS_amount && errors.TCS_amount.message}
                  required={true}
                // className="mb-0"
                >
                  <Controller
                    control={control}
                    name="TCS_amount"
                    render={({ field }) => (
                      <Input
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          const amount = e.target.value;
                          const amountWithTax =
                            Number(discount_brokerage_amount) +
                            Number(SGST_amount) +
                            Number(CGST_amount) +
                            Number(IGST_amount);
                          if (amount && amountWithTax) {
                            // set rate on amount change
                            const TCS_value =
                              (Number(amount) / Number(amountWithTax)) * 100;
                            setValue(
                              "TCS_value",
                              parseFloat(TCS_value).toFixed(2)
                            );
                          }
                        }}
                        placeholder="0"
                        type="number"
                        min={0}
                        step={0.01}
                      />
                    )}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* <Row className="border-0 border-b border-solid !m-0">
              <Col span={4} className="p-2 border-0 border-r border-solid" />
              <Col span={4} className="p-2 border-0 border-r border-solid" />
              <Col span={2} className="p-2 border-0 border-r border-solid" />
              <Col span={2} className="p-2 border-0 border-r border-solid" />
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                Round Off
              </Col>
              <Col span={4} className="p-2 border-0 border-r border-solid" />
              <Col span={4} className="p-2">
                <div className="flex items-center justify-center p-1">
                  {round_off_amount}
                </div>
              </Col>
            </Row> */}

            <Row className="border-0 border-b border-solid !m-0">
              <Col
                span={16}
                className="p-2 font-semibold border-0 border-r border-solid"
              >
                NO DYEING GUARANTEE
              </Col>
              <Col
                span={4}
                className="p-2 font-semibold border-0 border-r border-solid"
              >
                NET AMOUNT
              </Col>
              <Col span={4} className="p-2">
                <div className="flex items-center justify-center p-1">
                  {/* {Math.ceil(net_amount)} */}
                  {net_amount}
                </div>
              </Col>
            </Row>
            <Row className="border-0 border-b border-solid !m-0">
              <Col span={4} className="p-2 font-semibold">
                Rs.(IN WORDS):
              </Col>
              <Col span={20} className="p-2 font-semibold">
                {Number(net_amount)
                  ? // ? toWords.convert(Math.ceil(net_amount))
                  toWords.convert(net_amount)
                  : ""}
              </Col>
            </Row>
          </Flex>

          <Row className="mt-5">
            <Col span={2} className="p-2 font-medium">
              TDS :
            </Col>
            <Col span={4} className="p-2">
              <Form.Item
                name="TDS_amount"
                validateStatus={errors.TDS_amount ? "error" : ""}
                help={errors.TDS_amount && errors.TDS_amount.message}
                required={true}
              // className="mb-0"
              >
                <Controller
                  control={control}
                  name="TDS_amount"
                  render={({ field }) => (
                    <Input
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        const currentTDSAmount = e.target.value;
                        const after_TDS_amount =
                          // Math.ceil(Number(net_amount)) - Number(currentTDSAmount);
                          Number(net_amount) - Number(currentTDSAmount);
                        setValue(
                          "after_TDS_amount",
                          parseFloat(after_TDS_amount).toFixed(2)
                        );
                      }}
                      placeholder="0"
                      type="number"
                      min={0}
                      step={0.01}
                    />
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={2} className="p-2" />
            <Col span={4} className="p-2 font-semibold">
              After TDS AMOUNT:
            </Col>
            <Col span={4} className="p-2 font-semibold">
              {after_TDS_amount}
            </Col>
          </Row>

          <Flex gap={10} justify="flex-end" className="mt-3">
            <Button htmlType="button" onClick={() => reset()}>
              Reset
            </Button>
            <Button type="primary" htmlType="submit">
              Receive Bill
            </Button>
          </Flex>
        </Form>
      </Modal>
    </>
  );
};
export default YarnReceiveChallanModal;
