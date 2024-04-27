import { useContext, useState } from "react";
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

const YarnReceiveChallanModal = () => {
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
                  label="Challan Date"
                  name="challan_date"
                  validateStatus={errors.challan_date ? "error" : ""}
                  help={errors.challan_date && errors.challan_date.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                  // className="mb-0"
                >
                  <Controller
                    control={control}
                    name="challan_date"
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
                  label="Challan Date"
                  name="challan_date"
                  validateStatus={errors.challan_date ? "error" : ""}
                  help={errors.challan_date && errors.challan_date.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                  // className="mb-0"
                >
                  <Controller
                    control={control}
                    name="challan_date"
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
                className="px-1 font-medium border-0 border-r border-solid"
              >
                Challan
              </Col>
              <Col
                span={4}
                className="px-1 font-medium border-0 border-r border-solid"
              >
                Denier
              </Col>
              <Col
                span={2}
                className="px-1 font-medium border-0 border-r border-solid"
              >
                HSN No
              </Col>
              <Col
                span={2}
                className="px-1 font-medium border-0 border-r border-solid"
              >
                Quantity
              </Col>
              <Col
                span={4}
                className="px-1 font-medium border-0 border-r border-solid"
              >
                Cartoon
              </Col>
              <Col
                span={4}
                className="px-1 font-medium border-0 border-r border-solid"
              >
                RATE
              </Col>
              <Col span={4} className="px-1 font-medium">
                AMOUNT
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
