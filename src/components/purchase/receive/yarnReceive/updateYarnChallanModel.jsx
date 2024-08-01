import { useContext, useState, useEffect } from "react";
import {
  Button,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Typography,
  message
} from "antd";
import { CloseOutlined, EditOutlined } from "@ant-design/icons";
import { Controller, useForm } from "react-hook-form";
import dayjs from "dayjs";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { getDropdownSupplierListRequest } from "../../../../api/requests/users";
import { createYarnReceiveBillRequest } from "../../../../api/requests/purchase/yarnReceive";
import moment from "moment";
import { ToWords } from "to-words";
import { useMutation } from "@tanstack/react-query";
import { mutationOnErrorHandler } from "../../../../utils/mutationUtils";

const addYarnReceiveSchema = yup.object().shape({
  // order_id: yup.string().required("Please select order no."),
  // receive_quantity: yup.string().required("Please enter receive quantity"),
  supplier_company_id: yup.string().required("Please select supplier company"),
  invoice_no: yup.string().required("Please enter invoice no."),
  // yarn_stock_company_id: yup
  //     .string()
  //     .required("Please enter yarn stock company"),
  bill_date: yup.string().required("Please enter bill date"),
  // due_date: yup.string().required("Please enter due date"),
  // yarn_challan_id: yup.string().required("Please enter yarn challan"),
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
  // quantity_rate: yup.string().required("Please enter quantity rate"),
  // quantity_amount: yup.string().required("Please enter quantity amount"),
});

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

const UpdateYarnChallanModel = ({ details }) => {
  const queryClient = useQueryClient() ; 
  const { companyId } = useContext(GlobalContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplierName, setSupplierName] = useState("");

  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalCartoon, setTotalCartoon] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false) ; 

  // Get Supplier dropdown information 
  const {
    data: dropdownSupplierListRes,
    isLoading: isLoadingDropdownSupplierList,
  } = useQuery({
    queryKey: [
      "dropdown/supplier/list",
      {
        company_id: companyId,
        supplier_name: details?.supplier?.supplier?.supplier_name,
        // supplier_type: "yarn",
      },
    ],
    queryFn: async () => {
      const res = await getDropdownSupplierListRequest({
        params: {
          company_id: companyId,
          // supplier_type: "yarn",
          supplier_name: details?.supplier?.supplier?.supplier_name
        },
      });
      return res.data?.data?.supplierList;
    },
    enabled: Boolean(companyId && supplierName),
  });

  useEffect(() => {
    let tempQuantity = 0;
    let tempCartoon = 0;
    let tempTotalAmount = 0;

    setSupplierName(details?.supplier?.supplier?.supplier_name);

    details?.yarn_bill_details?.map((element) => {
      tempQuantity =
        tempQuantity + Number(element?.yarn_receive_challan?.receive_quantity);
      tempCartoon =
        tempCartoon +
        Number(element?.yarn_receive_challan?.receive_cartoon_pallet);
      tempTotalAmount = tempTotalAmount + Number(element?.quantity_amount);
    });
    setTotalCartoon(tempCartoon);
    setTotalQuantity(tempQuantity);
    setTotalAmount(tempTotalAmount.toFixed(2));
  }, [details]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(addYarnReceiveSchema),
    defaultValues: {
      bill_date: dayjs(details?.bill_date),
      due_date: dayjs(details?.due_date),
      // is_discount: false,
      invoice_no: details?.invoice_no,
      supplier_company_id: details?.supplier_company_id,
      quantity_rate: details?.yarn_bill_details[0]?.quantity_rate,
      freight_value: details?.freight_value,
      is_discount: details?.is_discount,
      discount_brokerage_value: details?.discount_brokerage_value,
      discount_brokerage_amount: details?.discount_brokerage_amount,
      TDS_amount: details?.TDS_amount,
      SGST_value: details?.SGST_value,
      CGST_value: details?.CGST_value,
      IGST_value: details?.IGST_value,
      TCS_value: details?.TCS_value,
      net_amount: details?.net_amount,
      SGST_amount: details?.SGST_amount,
      IGST_amount: details?.IGST_amount, 
      CGST_amount: details?.CGST_amount
    },
  });

  // Bill SGST, IGST calculation start ===============================================================

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
    quantity_rate,
    freight_value,
    TDS_amount,
  } = watch();

  const [discountValue, setDiscountValue] = useState(0);
  useEffect(() => {

    if (isModalOpen) {
      // Quantity rate 
      let rate = quantity_rate;
      rate = Number(rate);

      // Handle Quantity amount 
      let total_amount = Number(totalQuantity) * Number(rate);
      setValue("quantity_amount", total_amount.toFixed(2));

      // Handle freight amount 
      let temp_freight_amount;
      if (freight_value !== "" && freight_value !== undefined) {
        temp_freight_amount = Number(freight_value) * Number(totalQuantity);
        setValue("freight_amount", temp_freight_amount.toFixed(2));
      }

      // Handle discount amount 
      if (
        is_discount &&
        discount_brokerage_value !== "" &&
        discount_brokerage_value !== undefined
      ) {

        let discountAmount = Number(total_amount) * Number(discount_brokerage_value) / 100;
        setDiscountValue(discountAmount);
        discountAmount = (Number(total_amount) - Number(discountAmount)) + Number(temp_freight_amount);
        setValue("discount_brokerage_amount", discountAmount);

      } else {
        const discount_brokrage_amount =
          Number(total_amount) +
          Number(temp_freight_amount) -
          Number(discount_brokerage_value) * Number(totalQuantity);
        setValue(
          "discount_brokerage_amount",
          discount_brokrage_amount.toFixed(2)
        );
      }
      
    }
  }, [
    totalQuantity,
    quantity_rate,
    watch,
    setValue,
    details,
    freight_value,
    discount_brokerage_value,
    isModalOpen
  ]);
  
  useEffect(() => {

    if (SGST_value !== "" && SGST_value !== undefined) {
      const SGST_amount =
        (Number(discount_brokerage_amount) * Number(SGST_value)) / 100;
      setValue("SGST_amount", parseFloat(SGST_amount).toFixed(2));
    }

    if (CGST_value !== "" && CGST_value !== undefined) {
      const CGST_amount =
        (Number(discount_brokerage_amount) * Number(CGST_value)) / 100;
      setValue("CGST_amount", parseFloat(CGST_amount).toFixed(2));
    }

    if (IGST_value !== "" && IGST_amount !== undefined) {
      const IGST_amount =
        (Number(discount_brokerage_amount) * Number(IGST_value)) / 100;
      setValue("IGST_amount", parseFloat(IGST_amount).toFixed(2));
    }

  }, [
    discount_brokerage_amount, 
    SGST_value, 
    CGST_value, 
    IGST_value, 
    details, 
    setValue
  ])

  useEffect(() => {

    if (TCS_value !== "" && TCS_value !== undefined) {
      const amountWithTax =
        Number(discount_brokerage_amount) +
        Number(SGST_amount) +
        Number(CGST_amount) +
        Number(IGST_amount);
      const TCS_amount = (Number(amountWithTax) * Number(TCS_value)) / 100;
      setValue("TCS_amount", parseFloat(TCS_amount).toFixed(2));
    }

    const net_amount =
    Number(discount_brokerage_amount) +
    Number(SGST_amount) +
    Number(CGST_amount) +
    Number(IGST_amount) +
    Number(TCS_amount);

    let roundOffAmount = Math.round(net_amount) - Number(net_amount) ; 
    setValue("round_off_amount", roundOffAmount.toFixed(2)) ; 

    setValue("net_amount", Math.round(net_amount).toFixed(2));

  }, [
    CGST_amount,
    IGST_amount,
    SGST_amount,
    TCS_amount,
    discount_brokerage_amount,
    setValue,
  ]) ;
  
  useEffect(() => {
    const currentTDSAmount = TDS_amount;
    const after_TDS_amount = Number(net_amount) - Number(currentTDSAmount);
    setValue("after_TDS_amount", parseFloat(after_TDS_amount).toFixed(2));
  }, [net_amount, TDS_amount])



  const disablePastDates = (current) => {
    return current && current > new Date().setHours(0, 0, 0, 0);
  };

  const { mutateAsync: createYarnReceive } = useMutation({
    mutationFn: async (data) => {
      setLoading(true) ; 
      const res = await createYarnReceiveBillRequest({
        data,
        params: { company_id: companyId, bill_id: details?.id },
      });
      return res.data;
    },
    mutationKey: ["yarn-stock/yarn-receive-challan/create"],
    onSuccess: (res) => {
      setLoading(false) ; 
      queryClient.invalidateQueries([
        "yarn-stock/yarn-receive-challan/list",
        { company_id: companyId },
      ]);
      const successMessage = res?.message;
      if (successMessage) {
        message.success("Yarn bill updated successfully");
        setIsModalOpen(false) ; 
      }
    },
    onError: (error) => {
      setLoading(false) ; 
      mutationOnErrorHandler({ error, message });
    },
  });


  const onSubmit = async (data) => {
    delete data.yarn_company_name;
    delete data.company_id;

    console.log(details);

    // Total quantity 
    let totalQuantity = 0;
    let multiple_challans = [] ; 
    if (details) {
      details?.yarn_bill_details?.length > 0 && details?.yarn_bill_details.map((element, index) => {
        totalQuantity = totalQuantity + Number(element?.yarn_receive_challan?.receive_quantity);
        console.log(element);
        multiple_challans.push({
          "yarn_challan_id": element?.yarn_challan_id, 
          "quantity_rate": data?.quantity_rate, 
          "quantity_amount": data?.quantity_amount
        })
      })
    }

    let requestData = {
      "order_id": details?.order_id,
      "receive_quantity": totalQuantity,
      "supplier_company_id": data?.supplier_company_id,
      "invoice_no": data?.invoice_no,
      "bill_date": dayjs(data?.bill_date).format("YYYY-MM-DD"),
      "due_date": dayjs(data?.due_date).format("YYYY-MM-DD"),
      "freight_value": data?.freight_value,
      "freight_amount": data?.freight_amount,
      "is_discount": data?.is_discount,
      "discount_brokerage_value": data?.discount_brokerage_value,
      "discount_brokerage_amount": data?.discount_brokerage_amount,
      "SGST_value": data?.SGST_value,
      "SGST_amount": data?.SGST_amount,
      "CGST_value": data?.CGST_value,
      "CGST_amount": data?.CGST_amount,
      "TCS_value": data?.TCS_value,
      "TCS_amount": data?.TCS_amount,
      "IGST_value": data?.IGST_value,
      "IGST_amount": data?.IGST_amount,
      "round_off_amount": data?.round_off_amount,
      "net_amount": data?.net_amount,
      "TDS_amount": data?.TDS_amount,
      "after_TDS_amount": data?.after_TDS_amount,
      "multiple_challans": multiple_challans, 
    }; 

    await createYarnReceive(requestData) ; 
  };

  return (
    <>
      <Button
        onClick={() => {
          setIsModalOpen(true);
        }}
      >
        <EditOutlined />
      </Button>
      <Modal
        closeIcon={<CloseOutlined className="text-white" />}
        title={
          <Typography.Text className="text-xl font-medium text-white">
            Yarn Receive Bill
          </Typography.Text>
        }
        open={isModalOpen}
        footer={null}
        onCancel={() => {
          setIsModalOpen(false);
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
                  style={{ marginTop: "auto", marginBottom: "auto" }}
                >
                  :: SHREE GANESHAY NAMAH ::
                </Typography.Text>
              </Col>
            </Row>

            <Row
              gutter={24}
              className="border p-4  !m-0"
              style={{ borderTop: 0, borderLeft: 0, borderRight: 0 }}
            >
              <Col span={4}>Supplier name</Col>
              <Col span={8}>
                <Flex>
                  <Typography.Text
                    style={{ marginTop: "auto", marginBottom: "auto" }}
                  >
                    <strong>
                      {details?.supplier?.supplier?.supplier_name}
                    </strong>
                  </Typography.Text>
                  <Form.Item
                    name="supplier_company_id"
                    validateStatus={errors.supplier_company_id ? "error" : ""}
                    help={
                      errors.supplier_company_id &&
                      errors.supplier_company_id.message
                    }
                    required={true}
                    wrapperCol={{ sm: 24 }}
                    style={{ marginLeft: 10, marginBottom: 0 }}
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
                </Flex>
              </Col>

              <Col span={4}>Invoice No</Col>
              <Col span={8}>
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
                      <Input {...field} placeholder="Invoice No." />
                    )}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row
              gutter={24}
              className="border pl-4 pr-4 border-b border-solid !m-0"
              style={{
                borderTop: 0,
                borderLeft: 0,
                borderRight: 0,
                marginTop: -20,
              }}
            >
              <Col span={4}>Company Name</Col>
              <Col span={8}>
                {details?.yarn_stock_company?.yarn_company_name}
              </Col>

              <Col span={4}>Bill date</Col>
              <Col span={8}>
                <Form.Item
                  // label="Bill Date"
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
                        disabledDate={disablePastDates}
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
                Dennier
              </Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                HSN No
              </Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                Quantity
              </Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                Cartoon
              </Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                Rate
              </Col>
              <Col span={4} className="p-2 font-medium border-0">
                Amount
              </Col>
            </Row>

            <Row className="border-0 !m-0">
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                {details?.yarn_bill_details
                  ?.map((item) => item.yarn_receive_challan.challan_no)
                  .join(",")}
              </Col>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                {`${details?.yarn_stock_company?.yarn_count}C/${details?.yarn_stock_company?.filament}-(${details?.yarn_stock_company?.yarn_type}(${details?.yarn_stock_company?.yarn_Sub_type}-${details?.yarn_stock_company?.luster_type}-${details?.yarn_stock_company?.yarn_color}))`}
              </Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                {details?.yarn_stock_company?.hsn_no}
              </Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                {totalQuantity}
              </Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                {totalCartoon}
              </Col>

              <Col span={3} className="p-2 border-0 border-r border-solid">
                <Form.Item
                  name="quantity_rate"
                  validateStatus={errors.quantity_rate ? "error" : ""}
                  help={errors.quantity_rate && errors.quantity_rate.message}
                  required={true}
                >
                  <Controller
                    control={control}
                    name="quantity_rate"
                    render={({ field }) => (
                      <>
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
                      </>
                    )}
                  />
                </Form.Item>
              </Col>

              <Col span={4} className="p-2 font-medium border-0">
                {quantity_amount}
                <div
                  style={{ color: "green", textAlign: "center", marginTop: 4 }}
                >Dis - {discountValue}</div>
              </Col>
            </Row>

            <Row style={{ height: 100 }}>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={4}
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
              ></Col>
              <Col span={4} className="p-2 font-medium border-0"></Col>
            </Row>

            {/* FREIGHT amount information  */}
            <Row>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={4}
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
                FREIGHT
              </Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                <Form.Item
                  name="freight_value"
                  validateStatus={errors.freight_value ? "error" : ""}
                  help={errors.freight_value && errors.freight_value.message}
                  required={true}
                  className="mb-0"
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
              <Col span={4} className="p-2 font-medium border-0">
                {freight_amount}
              </Col>
            </Row>

            {/* Discount and Brokrage amount information  */}
            <Row>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={4}
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
                {details?.is_discount ? "Discount(%)" : "Brokrage(%)"}
              </Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              >
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
                  className="mb-0"
                >
                  <Controller
                    control={control}
                    name="discount_brokerage_value"
                    render={({ field }) => (
                      <Input
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          // const currentFValue = e.target.value;
                          // if (currentFValue) {
                          //     // set amount on rate change
                          //     const freight_amount =
                          //         Number(currentFValue) * Number(receive_quantity);
                          //     setValue(
                          //         "freight_amount",
                          //         parseFloat(freight_amount).toFixed(2)
                          //     );
                          // }
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
              <Col span={4} className="p-2 font-medium border-0">
                {discount_brokerage_amount}
              </Col>
            </Row>

            <Row>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={4}
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
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                <Form.Item
                  name="SGST_value"
                  validateStatus={errors.SGST_value ? "error" : ""}
                  help={errors.SGST_value && errors.SGST_value.message}
                  required={true}
                  className="mb-0"
                >
                  <Controller
                    control={control}
                    name="SGST_value"
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="0"
                        type="number"
                        min={0}
                        step={0.01}
                      />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={4} className="p-2 font-medium border-0">
                {SGST_amount}
              </Col>
            </Row>

            <Row>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={4}
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
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                <Form.Item
                  name="CGST_value"
                  validateStatus={errors.CGST_value ? "error" : ""}
                  help={errors.CGST_value && errors.CGST_value.message}
                  required={true}
                  className="mb-0"
                >
                  <Controller
                    control={control}
                    name="CGST_value"
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
              <Col span={4} className="p-2 font-medium border-0">
                {CGST_amount}
              </Col>
            </Row>

            <Row>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={4}
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
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                <Form.Item
                  name="IGST_value"
                  validateStatus={errors.IGST_value ? "error" : ""}
                  help={errors.IGST_value && errors.IGST_value.message}
                  required={true}
                  className="mb-0"
                >
                  <Controller
                    control={control}
                    name="IGST_value"
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
              <Col span={4} className="p-2 font-medium border-0">
                {IGST_amount}
              </Col>
            </Row>

            <Row>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={4}
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
                TCS(%)
              </Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                <Form.Item
                  name="TCS_value"
                  validateStatus={errors.TCS_value ? "error" : ""}
                  help={errors.TCS_value && errors.TCS_value.message}
                  required={true}
                  className="mb-0"
                >
                  <Controller
                    control={control}
                    name="TCS_value"
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
              <Col span={4} className="p-2 font-medium border-0">
                {TCS_amount}
              </Col>
            </Row>

            <Row>
              <Col
                span={4}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col
                span={4}
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
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              ></Col>
              <Col span={4} className="p-2 font-medium border-0"></Col>
            </Row>

            <Row
              className="border border-b border-solid !m-0"
              style={{ borderLeft: 0, borderRight: 0 }}
            >
              <Col span={6} className="p-2 font-semibold">
                NO DYEING GUARANTEE
              </Col>

              <Col
                span={11}
                className="p-2 font-semibold border-0 border-r border-solid"
              >
                <div style={{ textAlign: "right" }}>
                  <strong>Due Date</strong>:{" "}
                  {moment(details?.due_date).format("DD-MM-YYYY")}
                </div>
              </Col>
              <Col
                span={3}
                className="p-2 font-medium border-0 border-r border-solid"
              >
                NET Amount
              </Col>
              <Col span={4} className="p-2 font-medium">
                {net_amount}
              </Col>
            </Row>

            <Row
              className="border border-b border-solid !m-0"
              style={{ borderLeft: 0, borderRight: 0, borderTop: 0 }}
            >
              <Col span={4} className="p-2 font-semibold">
                Rs.(IN WORDS):
              </Col>
              <Col span={20} className="p-2 font-semibold">
                {Number(net_amount)
                  ? toWords.convert(net_amount)
                  : ""}
              </Col>
            </Row>

            <Row
              className="p-2 border border-b border-solid !m-0"
              style={{ borderLeft: 0, borderRight: 0, borderTop: 0 }}
            >
              <Col span={3} className="p-2 font-semibold">
                TDS
              </Col>
              <Col span={4}>
                <Form.Item
                  name="TDS_amount"
                  validateStatus={errors.TDS_amount ? "error" : ""}
                  help={errors.TDS_amount && errors.TDS_amount.message}
                  required={true}
                  className="mb-0"
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

              <Col span={5} className="p-2 pl-4 font-semibold">
                After TDS: {after_TDS_amount}
              </Col>
            </Row>
          </Flex>

          <Flex style={{ marginTop: 10 }}>
            <Button
              style={{ marginLeft: "auto" }}
              type="primary"
              htmlType="submit"
              loading = {loading}
            >
              Update
            </Button>
          </Flex>
        </Form>
      </Modal>
    </>
  );
};

export default UpdateYarnChallanModel;
