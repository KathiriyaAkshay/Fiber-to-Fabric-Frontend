import { ArrowLeftOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  Row,
  Select,
  message,
} from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { DevTool } from "@hookform/devtools";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { getYSCDropdownList } from "../../../api/requests/reports/yarnStockReport";
import { createYarnOrderRequest } from "../../../api/requests/orderMaster";
import { getSupplierListRequest } from "../../../api/requests/users";
import { YARN_GRADE_LIST } from "../../../constants/orderMaster";
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import dayjs from "dayjs";

const addYarnOrderSchemaResolver = yupResolver(
  yup.object().shape({
    order_type: yup.string(),
    yarn_company_name: yup
      .string()
      .required("Please select yarn stock company"),
    yarn_stock_company_id: yup.string().required("Please select denier"),
    supplier_id: yup.string().required("Please select supplier"),
    lot_no: yup.string().required("Please enter lot no"),
    rate: yup.string().required("Please enter rate"),
    freight: yup.string().required("Please enter freight"),
    credit_days: yup.string().required("Please enter credit days"),
    yarn_grade: yup.string().required("Please select yarn grade"),
    approx_amount: yup.string(),
    remark: yup.string(),
    quantity: yup.string(),
    delivered_quantity: yup.string(),
    pending_quantity: yup.string(),
    approx_cartoon: yup.string(),
    delivered_cartoon: yup.string(),
    pending_cartoon: yup.string(),
    pending_kg: yup.string(),
    order_date: yup.string().required("Please select order date"),
    //   "status": "Pending"
  })
);

function AddYarnOrder() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [denierOptions, setDenierOptions] = useState([]);

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
    enabled: Boolean(companyId),
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
      if (typeof errorMessage === "object") {
        const err = errorMessage?.details?.[0]?.message;
        message.error(err);
      }
      if (errorMessage && typeof errorMessage === "string") {
        message.error(errorMessage);
      }
    },
  });

  async function onSubmit(data) {
    // delete fields that are not allowed in API
    delete data?.yarn_company_name;
    await createYarnOrder(data);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: addYarnOrderSchemaResolver,
    defaultValues: {
      order_type: "Yarn",
      quantity: 0,
      pending_quantity: 0,
      delivered_quantity: 0,
      approx_cartoon: 0,
      pending_cartoon: 0,
      delivered_cartoon: 0,
      order_date: dayjs(),
    },
  });

  function goToAddYarnStockCompany() {
    navigate("/yarn-stock-company/company-list/add");
  }

  function goToAddSupplier() {
    navigate("/user-master/my-supplier/add");
  }

  const {
    yarn_company_name,
    quantity,
    delivered_quantity,
    approx_cartoon,
    delivered_cartoon,
    rate,
    credit_days,
    yarn_stock_company_id,
  } = watch();

  useEffect(() => {
    // set options for denier selection on yarn stock company select
    yscdListRes?.yarnCompanyList?.forEach((ysc) => {
      const { yarn_company_name: name = "", yarn_details = [] } = ysc;
      if (name === yarn_company_name) {
        const options = yarn_details?.map(
          ({
            yarn_company_id = 0,
            filament = 0,
            yarn_denier = 0,
            luster_type = "",
            yarn_color = "",
            // yarn_count,
            // current_stock,
            // avg_daily_stock,
            // pending_quantity,
          }) => {
            return {
              label: `${yarn_denier}D/${filament}F (${luster_type} - ${yarn_color})`,
              value: yarn_company_id,
            };
          }
        );
        if (options?.length) {
          setDenierOptions(options);
        }
      }
    });
  }, [yarn_company_name, yscdListRes?.yarnCompanyList]);

  useEffect(() => {
    // set pending_kg on change of denier (yarn_stock_company_id)
    yscdListRes?.yarnCompanyList?.forEach((ysc) => {
      const { yarn_company_name: name = "", yarn_details = [] } = ysc;
      if (name === yarn_company_name) {
        yarn_details?.forEach(({ pending_quantity, yarn_company_id }) => {
          if (yarn_stock_company_id === yarn_company_id) {
            setValue("pending_kg", pending_quantity);
          }
        });
      }
    });
  }, [
    setValue,
    yarn_company_name,
    yarn_stock_company_id,
    yscdListRes?.yarnCompanyList,
  ]);

  useEffect(() => {
    // set pending_quantity
    const pending_quantity = Number(quantity) - Number(delivered_quantity);
    setValue("pending_quantity", Math.max(0, pending_quantity));
  }, [delivered_quantity, quantity, setValue]);

  useEffect(() => {
    // set pending_cartoon
    const pending_cartoon = Number(approx_cartoon) - Number(delivered_cartoon);
    setValue("pending_cartoon", Math.max(0, pending_cartoon));
  }, [approx_cartoon, delivered_cartoon, setValue]);

  useEffect(() => {
    // set approx_amount
    const approx_amount = Number(quantity) * Number(rate);
    setValue("approx_amount", Math.max(0, approx_amount));
  }, [quantity, rate, setValue]);

  useEffect(() => {
    // set remark
    setValue(
      "remark",
      `payment due in ${Math.max(0, Math.floor(credit_days || 0))} days`
    );
  }, [credit_days, setValue]);

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
          <Col span={6}>
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

          <Col span={6} className="flex items-end gap-2">
            <Form.Item
              label="Yarn Stock Company Name"
              name="yarn_company_name"
              validateStatus={errors.yarn_company_name ? "error" : ""}
              help={
                errors.yarn_company_name && errors.yarn_company_name.message
              }
              wrapperCol={{ sm: 24 }}
              className="flex-grow"
            >
              <Controller
                control={control}
                name="yarn_company_name"
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
              className="mb-6"
              type="primary"
            />
          </Col>

          <Col span={6}>
            <Form.Item
              label="Denier"
              name="yarn_stock_company_id"
              validateStatus={errors.yarn_stock_company_id ? "error" : ""}
              help={
                errors.yarn_stock_company_id &&
                errors.yarn_stock_company_id.message
              }
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="yarn_stock_company_id"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select denier"
                    allowClear
                    loading={isLoadingYSCDList}
                    options={denierOptions}
                    style={{
                      textTransform: "capitalize",
                    }}
                    dropdownStyle={{
                      textTransform: "capitalize",
                    }}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6} className="flex items-end gap-2">
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

          <Col span={6}>
            <Form.Item
              label="Date"
              name="order_date"
              validateStatus={errors.order_date ? "error" : ""}
              help={errors.order_date && errors.order_date.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="order_date"
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    style={{
                      width: "100%",
                    }}
                    format="DD/MM/YYYY"
                  />
                )}
              />
            </Form.Item>
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
                  <Input
                    {...field}
                    placeholder="10.50"
                    type="number"
                    min={0}
                    step={0.01}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Approx Amount"
              name="approx_amount"
              validateStatus={errors.approx_amount ? "error" : ""}
              help={errors.approx_amount && errors.approx_amount.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="approx_amount"
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

          {/* for extra space */}
          <Col span={6}></Col>

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
