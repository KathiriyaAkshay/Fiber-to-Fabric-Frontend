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
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { useContext, useEffect } from "react";
import { AadharRegex } from "../../../constants/regex";
import {
  getYarnOrderByIdRequest,
  updateYarnOrderRequest,
} from "../../../api/requests/orderMaster";
import { GlobalContext } from "../../../contexts/GlobalContext";

const addYarnOrderSchemaResolver = yupResolver(
  yup.object().shape({
    first_name: yup.string(),
    last_name: yup.string(),
    email: yup
      .string()
      .required("Please enter email address")
      .email("Please enter valid email address"),
    address: yup.string(),
    pancard_no: yup.string(),
    adhar_no: yup
      .string()
      // .required("Please enter Aadhar number")
      .matches(AadharRegex, "Enter valid Aadhar number"),
    gst_no: yup.string(),
    rateType: yup.string().required("Please select rate type"),
    pricePerRate: yup.string().required("Please provide price "),
  })
);

function UpdateYarnOrder() {
  const { companyId } = useContext(GlobalContext);
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;

  function goBack() {
    navigate(-1);
  }

  const { companyId } = useContext(GlobalContext);

  const {data: yarnOrderData} = useQuery({
    queryFn: async () => {
      const res = await getYarnOrderByIdRequest({
        id: id, 
        params: {company_id: companyId}
      })
      return res?.data?.data ; 
    }, 
    enabled: Boolean(companyId)
  })

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

  const { mutateAsync: updateYarnOrder } = useMutation({
    mutationFn: async (data) => {
      const res = await updateYarnOrderRequest({ id, data });
      return res.data;
    },
    mutationKey: ["order-master", "yarn-order", "update", id],
    onSuccess: (res) => {
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      navigate(-1);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message;
      if (errorMessage && typeof errorMessage === "string") {
        message.error(errorMessage);
      }
    },
  });

  const { data: yarnOrderDetails } = useQuery({
    queryKey: ["order-master", "yarn-order", "get", id],
    queryFn: async () => {
      const res = await getYarnOrderByIdRequest({
        id,
        params: { company_id: companyId },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  async function onSubmit(data) {
    await updateYarnOrder(data);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: updateYarnOrderSchemaResolver,
  });

  useEffect(() => {
    if (yarnOrderDetails) {
      reset({
        ...yarnOrderDetails,
        // remove unnecessary fields
        id: undefined,
        deletedAt: undefined,
        createdAt: undefined,
        updatedAt: undefined,
        salary: undefined,
      });
    }
  }, [yarnOrderDetails, reset]);

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Update Yarn Order</h3>
      </div>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Row
          gutter={18}
          style={{
            padding: "12px",
          }}
        >
          <Col span={12}>
            <Form.Item
              label="Denier"
              name="yarn_stock_company_id"
              validateStatus={errors.yarn_stock_company_id ? "error" : ""}
              help={
                errors.yarn_stock_company_id &&
                errors.yarn_stock_company_id.message
              }
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="first_name"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="First Name"
                    className="w-full"
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label={<p className="m-0 whitespace-nowrap">Last Name</p>}
              name="last_name"
              validateStatus={errors.last_name ? "error" : ""}
              help={errors.last_name && errors.last_name.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="last_name"
                render={({ field }) => (
                  <Input {...field} placeholder="Last Name" />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Date"
              name="order_date"
              validateStatus={errors.order_date ? "error" : ""}
              help={errors.order_date && errors.order_date.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <Input {...field} placeholder="Email" type="email" />
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
              required={true}
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
              required={true}
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
              required={true}
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
                    step={0.01}
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
              required={true}
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
                    step={0.01}
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
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="credit_days"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="30"
                    type="number"
                    min={0}
                    step={0.01}
                  />
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
                  <Input
                    {...field}
                    placeholder="1000"
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
                    step={0.01}
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
                  <Input
                    {...field}
                    placeholder="100"
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
                    step={0.01}
                  />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Flex gap={10} justify="flex-end">
          <Button type="primary" htmlType="submit">
            Update
          </Button>
        </Flex>
      </Form>
    </div>
  );
}

export default UpdateYarnOrder;
