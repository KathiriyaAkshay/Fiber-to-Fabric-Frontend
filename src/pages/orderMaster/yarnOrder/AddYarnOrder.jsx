import { ArrowLeftOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Col, Flex, Form, Input, Row, Select, message } from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { DevTool } from "@hookform/devtools";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { isValidPhoneNumber } from "react-phone-number-input";
import { AadharRegex } from "../../../constants/regex";
import { getYSCDropdownList } from "../../../api/requests/reports/yarnStockReport";
import { createYarnOrderRequest } from "../../../api/requests/orderMaster";
import { getSupplierListRequest } from "../../../api/requests/users";
import { YARN_GRADE_LIST } from "../../../constants/orderMaster";
import { useContext } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";

const addYarnOrderSchemaResolver = yupResolver(
  yup.object().shape({
    order_type: yup.string().required("Please select order type"),
    last_name: yup.string().required("Please provide last name"),
    password: yup.string().required("No password provided."),
    mobile: yup
      .string()
      .required("Please enter Contact number")
      .test("Mobile Validation", "Please enter valid Contact Number", (value) =>
        value ? isValidPhoneNumber(value) : false
      ),
    email: yup
      .string()
      .required("Please enter email address")
      .email("Please enter valid email address"),
    address: yup.string().required("Please provide address"),
    gst_no: yup.string(),
    pancard_no: yup.string(),
    adhar_no: yup.string().matches(AadharRegex, "Enter valid Aadhar number"),
    rateType: yup.string().required("Please select rate type"),
    pricePerRate: yup.string().required("Please provide price "),
  })
);

function AddYarnOrder() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  function goBack() {
    navigate(-1);
  }

  const { companyId } = useContext(GlobalContext);

  const { data: yscdListRes, isLoading: isLoadingYSCDList } = useQuery({
    queryKey: ["dropdown", "yarn_company", "list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getYSCDropdownList({
        params: { company_id: companyId },
      });
      return res.data?.data;
    },
  });

  const { data: supplierListRes, isLoading: isLoadingSupplierList } = useQuery({
    queryKey: ["supplier", "list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getSupplierListRequest({
        params: { company_id: companyId },
      });
      return res.data?.data?.supplierList;
    },
    enabled: Boolean(companyId),
  });

  const { mutateAsync: createYarnOrder } = useMutation({
    mutationFn: async (data) => {
      const res = await createYarnOrderRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["order-master", "yarn-order", "create"],
    onSuccess: (res) => {
      queryClient.invalidateQueries([
        "order-master",
        "yarn-order",
        "list",
        { company_id: companyId },
      ]);
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      navigate(-1);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(errorMessage);
    },
  });

  async function onSubmit(data) {
    await createYarnOrder(data);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: addYarnOrderSchemaResolver,
    defaultValues: {
      rateType: "perTaka",
      order_type: "Yarn",
    },
  });

  function goToAddYarnStockCompany() {
    navigate("/yarn-stock-company/company-list/add");
  }

  function goToAddSupplier() {
    navigate("/user-master/my-supplier/add");
  }

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Place New Yarn Order</h3>
      </div>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Row
          gutter={18}
          style={{
            padding: "12px",
          }}
        >
          <Col span={8}>
            <Form.Item
              label="Order Type"
              name="order_type"
              validateStatus={errors.order_type ? "error" : ""}
              help={errors.order_type && errors.order_type.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="order_type"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select Yarn Stock Company"
                    options={[
                      {
                        label: "Yarn",
                        value: "Yarn",
                      },
                    ]}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={8} className="flex items-end gap-2">
            <Form.Item
              label="Yarn Stock Company Name"
              name="yarn_stock_company_id"
              validateStatus={errors.yarn_stock_company_id ? "error" : ""}
              help={
                errors.yarn_stock_company_id &&
                errors.yarn_stock_company_id.message
              }
              wrapperCol={{ sm: 24 }}
              className="flex-grow"
            >
              <Controller
                control={control}
                name="yarn_stock_company_id"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select Yarn Stock Company"
                    loading={isLoadingYSCDList}
                    options={yscdListRes?.yarnCompanyList?.map(
                      ({ yarn_company_name = "" }) => {
                        return {
                          label: yarn_company_name,
                          value: yarn_company_name,
                        };
                      }
                    )}
                  />
                )}
              />
            </Form.Item>
            <Button
              icon={<PlusCircleOutlined />}
              onClick={goToAddYarnStockCompany}
              className="flex-none mb-6"
              type="primary"
            />
          </Col>

          <Col span={8} className="flex items-end gap-2">
            <Form.Item
              label="Supplier"
              name="supplier_id"
              validateStatus={errors.supplier_id ? "error" : ""}
              help={errors.supplier_id && errors.supplier_id.message}
              wrapperCol={{ sm: 24 }}
              className="flex-grow"
            >
              <Controller
                control={control}
                name="supplier_id"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select supplier"
                    loading={isLoadingSupplierList}
                    options={supplierListRes?.rows?.map((supervisor) => ({
                      label: supervisor?.first_name,
                      value: supervisor?.id,
                    }))}
                  />
                )}
              />
            </Form.Item>
            <Button
              icon={<PlusCircleOutlined />}
              onClick={goToAddSupplier}
              className="flex-none mb-6"
              type="primary"
            />
          </Col>

          <Col span={24}>
            <p className="text-lg font-medium text-primary">Order Data</p>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Lot No."
              name="lot_no"
              validateStatus={errors.lot_no ? "error" : ""}
              help={errors.lot_no && errors.lot_no.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="lot_no"
                render={({ field }) => <Input {...field} placeholder="10" />}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Yarn Grade"
              name="yarn_grade"
              validateStatus={errors.yarn_grade ? "error" : ""}
              help={errors.yarn_grade && errors.yarn_grade.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="yarn_grade"
                render={({ field }) => (
                  <Select
                    allowClear
                    placeholder="Yarn Grade"
                    {...field}
                    options={YARN_GRADE_LIST}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Rate"
              name="rate"
              validateStatus={errors.rate ? "error" : ""}
              help={errors.rate && errors.rate.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="rate"
                render={({ field }) => (
                  <Input {...field} placeholder="10.50" type="number" min={0} />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Approx Amount"
              name="rate"
              validateStatus={errors.rate ? "error" : ""}
              help={errors.rate && errors.rate.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="rate"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="0.00"
                    type="number"
                    min={0}
                    disabled={true}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Freight"
              name="freight"
              validateStatus={errors.freight ? "error" : ""}
              help={errors.freight && errors.freight.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="freight"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Rate per KG"
                    type="number"
                    min={0}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Remarks"
              name="remark"
              validateStatus={errors.remark ? "error" : ""}
              help={errors.remark && errors.remark.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="remark"
                render={({ field }) => (
                  <Input.TextArea
                    {...field}
                    placeholder="Payment due in 30 days"
                    autoSize={true}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Credit Days"
              name="credit_days"
              validateStatus={errors.credit_days ? "error" : ""}
              help={errors.credit_days && errors.credit_days.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="credit_days"
                render={({ field }) => (
                  <Input {...field} placeholder="30" type="number" min={0} />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <p className="text-lg font-medium text-primary">Current Status</p>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Quantity"
              name="quantity"
              validateStatus={errors.quantity ? "error" : ""}
              help={errors.quantity && errors.quantity.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="quantity"
                render={({ field }) => (
                  <Input {...field} placeholder="1000" type="number" min={0} />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Approx cartoon"
              name="approx_cartoon"
              validateStatus={errors.approx_cartoon ? "error" : ""}
              help={errors.approx_cartoon && errors.approx_cartoon.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="approx_cartoon"
                render={({ field }) => (
                  <Input {...field} placeholder="100" type="number" min={0} />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Delivered Quantity"
              name="delivered_quantity"
              validateStatus={errors.delivered_quantity ? "error" : ""}
              help={
                errors.delivered_quantity && errors.delivered_quantity.message
              }
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="delivered_quantity"
                render={({ field }) => (
                  <Input {...field} placeholder="0" type="number" min={0} />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Delivered Cartoon"
              name="delivered_cartoon"
              validateStatus={errors.delivered_cartoon ? "error" : ""}
              help={
                errors.delivered_cartoon && errors.delivered_cartoon.message
              }
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="delivered_cartoon"
                render={({ field }) => (
                  <Input {...field} placeholder="0" type="number" min={0} />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Pending Quantity"
              name="pending_quantity"
              validateStatus={errors.pending_quantity ? "error" : ""}
              help={errors.pending_quantity && errors.pending_quantity.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="pending_quantity"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="50"
                    type="number"
                    min={0}
                    disabled={true}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Pending Cartoon"
              name="pending_cartoon"
              validateStatus={errors.pending_cartoon ? "error" : ""}
              help={errors.pending_cartoon && errors.pending_cartoon.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="pending_cartoon"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="100"
                    type="number"
                    min={0}
                    disabled={true}
                  />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Flex gap={10} justify="flex-end">
          <Button htmlType="button" onClick={() => reset()}>
            Reset
          </Button>
          <Button type="primary" htmlType="submit">
            Create
          </Button>
        </Flex>
      </Form>

      <DevTool control={control} />
    </div>
  );
}

export default AddYarnOrder;
