import { useContext, useEffect, useMemo, useState } from "react";
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
import { disabledFutureDate, disabledPastDate } from "../../../../utils/date";

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
  // receive_quantity: yup.string().required("Please enter receive quantity"),
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
  // quantity_amount: yup.string().required("Please enter quantity amount"),
});

const YarnReceiveChallanModal = ({ details = [] }) => {
  const {
    id: yarn_challan_id = 0,
    yarn_stock_company = {},
    receive_quantity = 0,
    yarn_stock_company_id = 0,
  } = details;

  const { yarn_company_name = "" } = yarn_stock_company;

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
          params: { company_id: companyId, order_status : "PENDING" },
        });
        return res.data?.data?.yarnOrderList;
      },
      enabled: Boolean(companyId),
    });

  const {
    data: dropdownSupplierListRes,
    isLoading: isLoadingDropdownSupplierList,
  } = useQuery({
    queryKey: [
      "dropdown/supplier/list",
      {
        company_id: companyId,
        // supplier_name: supplierName,
        // supplier_type: "yarn",
      },
    ],
    queryFn: async () => {
      const res = await getDropdownSupplierListRequest({
        params: {
          company_id: companyId,
          // supplier_type: "yarn",
        },
      });
      return res.data?.data?.supplierList;
    },
    enabled: Boolean(companyId),
  });

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // Create challan bill handler start ======================================================

  const [loading, setLoading] = useState(false);
  const { mutateAsync: createYarnReceive } = useMutation({
    mutationFn: async (data) => {
      setLoading(true);
      const res = await createYarnReceiveBillRequest({
        data,
        params: { company_id: companyId },
      });
      return res.data;
    },
    mutationKey: ["yarn-stock/yarn-receive-challan/create"],
    onSuccess: (res) => {
      setLoading(false);
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
      setLoading(false);
      mutationOnErrorHandler({ error, message });
    },
  });

  // Create challan bill handler end ========================================================

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    getValues,
  } = useForm({
    resolver: yupResolver(addYarnReceiveSchema),
    defaultValues: {
      bill_date: dayjs(),
      due_date: dayjs(),
      is_discount: false,
      receive_quantity: receive_quantity,
      yarn_challan_id: yarn_challan_id,
      yarn_stock_company_id: yarn_stock_company_id,
      CGST_value: 6,
      IGST_value: 6,
      SGST_value: 6,
      TCS_value: 6,
      round_off_amount: 0,
    },
  });

  async function onSubmit(data) {
    delete data.yarn_company_name;
    delete data.company_id;

    // Total quantity
    let totalQuantity = 0;
    let multiple_challans = [];
    if (details) {
      details?.length > 0 &&
        details?.map((element, index) => {
          totalQuantity = totalQuantity + Number(element?.receive_quantity);
          multiple_challans.push({
            yarn_challan_id: element?.id,
            quantity_rate: data?.quantity_rate,
            quantity_amount: data[`quantity_amount_${index}`],
          });
        });
    }

    let requestData = {
      order_id: data?.order_id,
      receive_quantity: totalQuantity,
      supplier_company_id: data?.supplier_company_id,
      invoice_no: data?.invoice_no,
      yarn_stock_company_id: data?.yarn_stock_company_id,
      bill_date: dayjs(data?.bill_date).format("YYYY-MM-DD"),
      due_date: dayjs(data?.due_date).format("YYYY-MM-DD"),
      freight_value: data?.freight_value,
      freight_amount: data?.freight_amount,
      is_discount: data?.is_discount,
      discount_brokerage_value: data?.discount_brokerage_value,
      discount_brokerage_amount: data?.discount_brokerage_amount,
      SGST_value: data?.SGST_value,
      SGST_amount: data?.SGST_amount,
      CGST_value: data?.CGST_value,
      CGST_amount: data?.CGST_amount,
      TCS_value: data?.TCS_value,
      TCS_amount: data?.TCS_amount,
      IGST_value: data?.IGST_value,
      IGST_amount: data?.IGST_amount,
      round_off_amount: data?.round_off_amount,
      net_amount: data?.net_amount,
      TDS_amount: data?.TDS_amount,
      after_TDS_amount: data?.after_TDS_amount,
      multiple_challans: multiple_challans,
    };
    await createYarnReceive(requestData);
  }

  // Bill SGST, IGST calculation start ===============================================================

  const {
    order_id,
    discount_brokerage_amount = 0,
    quantity_amount = 0,
    freight_amount = 0,
    freight_value,
    discount_brokerage_value = 0,
    is_discount = false,
    CGST_amount = 0,
    CGST_value = 6,
    IGST_amount = 0,
    IGST_value = 6,
    SGST_amount = 0,
    SGST_value = 6,
    TCS_value = 6,
    TCS_amount = 0,
    net_amount = 0,
    after_TDS_amount = 0,
    quantity_rate,
    round_off_amount = 0,
  } = watch();

  // Set amount information product quantity wise =======================================================

  useEffect(() => {
    yarnOrderListRes?.rows?.forEach((yOrder) => {
      if (yOrder?.id === order_id) {
        const { rate = 0, freight = 0 /*user = {}*/ } = yOrder;
        setValue("quantity_rate", parseFloat(rate).toFixed(2));
        setValue("freight_value", parseFloat(freight).toFixed(2));

        let freight_amount = 0;

        details?.map((element, index) => {
          const quantity_amount =
            Number(rate) * Number(element?.receive_quantity);
          setValue(`quantity_amount_${index}`, quantity_amount);
          freight_amount =
            Number(freight_amount) +
            Number(freight_value) * Number(element?.receive_quantity);
        });
        setValue("freight_amount", parseFloat(freight_amount).toFixed(2));

        // const { supplier = {} } = user;
        // const { supplier_name = "" } = supplier;
        setSupplierName(yOrder?.supplier_name);
      }
    });
  }, [details, freight_value, order_id, setValue, yarnOrderListRes]);

  const supplierDropDownOptions = useMemo(() => {
    if (supplierName && dropdownSupplierListRes) {
      const selectedSupplier = dropdownSupplierListRes.find(
        ({ supplier_name }) => supplier_name === supplierName
      );

      if (selectedSupplier && Object.keys(selectedSupplier).length) {
        return selectedSupplier?.supplier_company?.map((item) => {
          return { label: item.supplier_company, value: item.supplier_id };
        });
      }
      return [];
    }
  }, [dropdownSupplierListRes, supplierName]);

  // Set Freight amount information =======================================================

  const [discountValue, setDiscountValue] = useState(0);
  useEffect(() => {
    // Total quantity
    let totalQuantity = 0;
    if (details) {
      details?.length > 0 &&
        details?.map((element, index) => {
          totalQuantity = totalQuantity + Number(element?.receive_quantity);
          let temp_quantity_amount = 0;
          temp_quantity_amount =
            Number(element?.receive_quantity) * Number(quantity_rate);
          setValue(`quantity_amount_${index}`, temp_quantity_amount);
        });
    }

    // Total amount
    let quantity_amount = 0;
    details?.length > 0 &&
      details?.map((element, index) => {
        if (
          getValues(`quantity_amount_${index}`) !== undefined &&
          getValues(`quantity_amount_${index}`) !== ""
        ) {
          quantity_amount =
            Number(quantity_amount) +
            Number(getValues(`quantity_amount_${index}`));
        }
      });

    // Calculate freight amount

    let temp_freight_amount = Number(totalQuantity) * Number(freight_value);
    setValue("freight_amount", temp_freight_amount);

    if (is_discount) {
      let discountAmount =
        (Number(quantity_amount) * Number(discount_brokerage_value)) / 100;
      setDiscountValue(discountAmount);
      discountAmount =
        Number(quantity_amount) -
        Number(discountAmount) +
        Number(temp_freight_amount);
      setValue("discount_brokerage_amount", discountAmount);
    } else {
      const discount_brokrage_amount =
        Number(quantity_amount) +
        Number(temp_freight_amount) -
        Number(discount_brokerage_value) * Number(totalQuantity);
      setValue(
        "discount_brokerage_amount",
        discount_brokrage_amount.toFixed(2)
      );
    }
  }, [
    details,
    discount_brokerage_value,
    freight_amount,
    is_discount,
    quantity_rate,
    freight_value,
    setValue,
  ]);

  // Handler for SGST, IGST, CGST, TCS amount ============================================================

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
  }, [discount_brokerage_amount, setValue]);

  // Net amount handler ==================================================================================

  useEffect(() => {
    let net_amount =
      Number(discount_brokerage_amount) +
      Number(SGST_amount) +
      Number(CGST_amount) +
      Number(IGST_amount) +
      Number(TCS_amount);
    let roundOffAmount = Math.round(net_amount) - Number(net_amount);
    setValue("round_off_amount", roundOffAmount.toFixed(2));

    setValue("net_amount", Math.round(net_amount).toFixed(2));
  }, [
    CGST_amount,
    IGST_amount,
    SGST_amount,
    TCS_amount,
    discount_brokerage_amount,
    setValue,
  ]);

  // Bill SGST, IGST calculation end ========================================================================

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
        width={"60vw"}
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
                        // options={dropdownSupplierListRes?.[0]?.supplier_company?.map(
                        //   ({ supplier_company = "", supplier_id = "" }) => {
                        //     return {
                        //       label: supplier_company,
                        //       value: supplier_id,
                        //     };
                        //   }
                        // )}
                        options={supplierDropDownOptions}
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
                  label="Bill Date"
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
                        disabledDate={disabledFutureDate}
                      />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="Due Date"
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
                        disabledDate={disabledPastDate}
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

            {details?.length > 0 &&
              details?.map((element, index) => (
                <Row key={index}>
                  <Col span={4} className="p-2 border-0 border-r border-solid">
                    {element?.challan_no}
                  </Col>

                  <Col span={4} className="p-2 border-0 border-r border-solid">
                    {`${element?.yarn_stock_company?.yarn_count}C/${element?.yarn_stock_company?.filament}F (${element?.yarn_stock_company?.yarn_type}(${element?.yarn_stock_company?.yarn_Sub_type}) - ${element?.yarn_stock_company?.luster_type} - ${element?.yarn_stock_company?.yarn_color})`}
                  </Col>

                  <Col span={2} className="p-2 border-0 border-r border-solid">
                    {element?.yarn_stock_company?.hsn_no}
                  </Col>

                  <Col span={2} className="p-2 border-0 border-r border-solid">
                    {element?.receive_quantity}
                  </Col>

                  <Col span={4} className="p-2 border-0 border-r border-solid">
                    {element?.receive_cartoon_pallet}
                  </Col>

                  <Col span={4} className="p-2 border-0 border-r border-solid">
                    <Form.Item
                      name="quantity_rate"
                      validateStatus={errors.quantity_rate ? "error" : ""}
                      help={
                        errors.quantity_rate && errors.quantity_rate.message
                      }
                      required={true}
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
                                  Number(currentQRate) *
                                  Number(receive_quantity);
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
                      name={`quantity_amount_${index}`}
                      validateStatus={
                        errors[`quantity_amount_${index}`] ? "error" : "success"
                      }
                      required={true}
                    >
                      <Controller
                        control={control}
                        name={`quantity_amount_${index}`}
                        render={({ field }) => (
                          <>
                            <Input
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                const currentQAmount = e.target.value;
                                if (currentQAmount && receive_quantity) {
                                  // set rate on amount change
                                  const quantity_rate =
                                    Number(currentQAmount) /
                                    Number(receive_quantity);
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
                            {is_discount && (
                              <div
                                style={{
                                  color: "green",
                                  textAlign: "center",
                                  marginTop: 4,
                                }}
                              >
                                Dis - {discountValue}
                              </div>
                            )}
                          </>
                        )}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              ))}

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

            <Row className="border-0 border-b border-solid !m-0">
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
            </Row>

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
            <Button type="primary" htmlType="submit" loading={loading}>
              Receive Bill
            </Button>
          </Flex>
        </Form>
      </Modal>
    </>
  );
};
export default YarnReceiveChallanModal;
