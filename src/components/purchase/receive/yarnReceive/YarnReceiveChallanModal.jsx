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
import { createYarnReceiveBillRequest } from "../../../../api/requests/purchase/yarnReceive";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { useCompanyList } from "../../../../api/hooks/company";
import { getYarnOrderListRequest } from "../../../../api/requests/orderMaster";

const addYarnReceiveSchema = yup.object().shape({
  order_id: yup.string().required("Please select order no."),
  receive_quantity: yup.string().required("Please enter receive quantity"),
  supplier_company_id: yup.string().required("Please select supplier company"),
  invoice_no: yup.string().required("Please enter invoice no."),
  // yarn_stock_company_id: yup
  //   .string()
  //   .required("Please enter yarn stock company"),
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
  round_off_amount: yup.string().required("Please enter round off amount"),
  net_amount: yup.string().required("Please enter net amount"),
  TDS_amount: yup.string().required("Please enter TDS amount"),
  after_TDS_amount: yup.string().required("Please enter after TDS amount"),
  quantity_rate: yup.string().required("Please enter quantity rate"),
  quantity_amount: yup.string().required("Please enter quantity amount"),
});

const YarnReceiveChallanModal = ({ details = {} }) => {
  const {
    challan_no = "",
    yarn_stock_company = {},
    receive_cartoon_pallet = 0,
    receive_quantity = 0,
  } = details;
  const {
    yarn_count = 0,
    filament = 0,
    yarn_type = "",
    yarn_Sub_type = "",
    luster_type = "",
    yarn_color = "",
    hsn_no = "",
  } = yarn_stock_company;
  const { companyId } = useContext(GlobalContext);
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(true);
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
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(errorMessage);
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
    },
  });

  async function onSubmit(data) {
    delete data.yarn_company_name;
    await createYarnReceive(data);
  }

  const { order_id } = watch();

  useEffect(() => {
    yarnOrderListRes?.rows?.forEach((yOrder) => {
      if (yOrder?.id === order_id) {
        const { rate = 0, freight = 0 } = yOrder;

        // set total amount on rate change
        setValue("quantity_rate", parseFloat(rate).toFixed(2));
        const quantity_amount = Number(rate) * Number(receive_quantity);
        setValue("quantity_amount", parseFloat(quantity_amount).toFixed(2));

        // set freight value
        setValue("freight_value", parseFloat(freight).toFixed(2));
        const freight_amount = Number(freight) * Number(receive_quantity);
        setValue("freight_amount", parseFloat(freight_amount).toFixed(2));
      }
    });
  }, [order_id, receive_quantity, setValue, yarnOrderListRes?.rows]);

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
            padding: "10px 16px",
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
                <Typography.Text className="text-center">
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
                        options={yarnOrderListRes?.rows?.map(({ id = "" }) => ({
                          label: id,
                          value: id,
                        }))}
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
                  <Col span={10} className="font-medium">
                    Supplier Name
                  </Col>
                  <Col span={14}>{"MILLGINE ( SUPPLIER_2 )"}</Col>
                </Row>
                <Row gutter={12} className="flex-grow w-full">
                  <Col span={10} className="font-medium">
                    Company Name
                  </Col>
                  <Col span={14}>{"A.R. CORPORATION"}</Col>
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

            <Row className="border-0 border-solid !m-0">
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
                  validateStatus={errors.quantity_amount ? "error" : ""}
                  help={
                    errors.quantity_amount && errors.quantity_amount.message
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

            <Row className="border-0 border-b border-solid !m-0">
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
          </Flex>
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
