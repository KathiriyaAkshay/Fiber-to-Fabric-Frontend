import { ArrowLeftOutlined } from "@ant-design/icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Checkbox,
  Col,
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
import { DevTool } from "@hookform/devtools";
import { useContext, useEffect } from "react";
import {
  getBrokerListRequest,
  getDropdownSupplierNameListRequest,
  getSupplierByIdRequest,
  updateUserRequest,
} from "../../../api/requests/users";
import { USER_ROLES, supplierTypeEnum } from "../../../constants/userRole";
import { AadharRegex } from "../../../constants/regex";
import { GlobalContext } from "../../../contexts/GlobalContext";

const updateSupplierSchemaResolver = yupResolver(
  yup.object().shape({
    first_name: yup.string(),
    last_name: yup.string(),
    email: yup
      .string()
      .required("Please enter email address")
      .email("Please enter valid email address"),
    address: yup.string(),
    gst_no: yup.string().required("Please enter GST"),
    // .matches(GSTRegex, "Enter valid GST number"),
    pancard_no: yup.string().required("Please enter pan number"),
    // .matches(PANRegex, "Enter valid PAN number"),
    username: yup.string().required(),
    supplier_company: yup.string().required(),
    broker_id: yup.string().required(),
    adhar_no: yup
      .string()
      // .required("Please enter Aadhar number")
      .matches(AadharRegex, "Enter valid Aadhar number"),
    supplier_types: yup
      .array()
      .required("Supplier type is required.")
      .of(
        yup
          .string()
          .oneOf(
            supplierTypeEnum,
            "Invalid supplier type. Must be one of: purchase/trading, job, yarn, other, re-work"
          )
      ),
  })
);

const roleId = USER_ROLES.SUPPLIER.role_id;

function UpdateSupplier() {
  const { companyId } = useContext(GlobalContext);
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;

  function goBack() {
    navigate(-1);
  }

  const { mutateAsync: updateUser } = useMutation({
    mutationFn: async (data) => {
      const res = await updateUserRequest({
        roleId,
        userId: id,
        data,
        params: { company_id: companyId },
      });
      return res.data;
    },
    mutationKey: ["users", "update", roleId, id],
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

  const { data: userDetails } = useQuery({
    queryKey: ["supplier", "get", id],
    queryFn: async () => {
      const res = await getSupplierByIdRequest({
        id,
        params: { company_id: companyId },
      });
      return res.data?.data?.user;
    },
    enabled: Boolean(companyId),
  });

  async function onSubmit(data) {
    await updateUser(data);
  }

  const { data: brokerUserListRes, isLoading: isLoadingBrokerList } = useQuery({
    queryKey: ["broker", "list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getBrokerListRequest({
        params: { company_id: companyId },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const { data: supplierNameList, isLoading: isLoadingSupplierNameList } =
    useQuery({
      queryKey: ["dropdown/supplier_names/list", { company_id: companyId }],
      queryFn: async () => {
        const res = await getDropdownSupplierNameListRequest({
          params: { company_id: companyId },
        });
        return res.data?.data?.supplierList || [];
      },
      enabled: Boolean(companyId),
    });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm({
    resolver: updateSupplierSchemaResolver,
  });

  useEffect(() => {
    if (userDetails) {
      reset({
        ...userDetails,
        supplier_name: userDetails?.supplier?.supplier_name,
        supplier_company: userDetails?.supplier?.supplier_company,
        hsn_code: userDetails?.supplier?.hsn_code,
        broker_id: userDetails?.supplier?.broker_id,
        supplier_types: userDetails?.supplier_types?.map((st) => st?.type),

        // remove unnecessary fields
        id: undefined,
        deletedAt: undefined,
        createdAt: undefined,
        updatedAt: undefined,
      });
    }
  }, [userDetails, reset]);

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Update User</h3>
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
              label="Supplier Type"
              name="supplier_types"
              validateStatus={errors.supplier_types ? "error" : ""}
              help={errors.supplier_types && errors.supplier_types.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="supplier_types"
                render={({ field }) => (
                  <Checkbox.Group
                    options={[
                      {
                        value: "purchase/trading",
                        label: "Purchase/Trading",
                        disabled:
                          (getValues("supplier_types")?.includes("yarn") ||
                            getValues("supplier_types")?.includes("other") ||
                            getValues("supplier_types")?.includes("re-work")) &&
                          !getValues("supplier_types")?.includes(
                            "purchase/trading"
                          ),
                      },
                      {
                        value: "job",
                        label: "Job",
                        disabled:
                          (getValues("supplier_types")?.includes("yarn") ||
                            getValues("supplier_types")?.includes("other") ||
                            getValues("supplier_types")?.includes("re-work")) &&
                          !getValues("supplier_types")?.includes("job"),
                      },
                      {
                        value: "yarn",
                        label: "Yarn",
                        disabled:
                          getValues("supplier_types")?.length &&
                          !getValues("supplier_types")?.includes("yarn"),
                      },
                      {
                        value: "other",
                        label: "Other",
                        disabled:
                          getValues("supplier_types")?.length &&
                          !getValues("supplier_types")?.includes("other"),
                      },
                      {
                        value: "re-work",
                        label: "Re-Work",
                        disabled:
                          getValues("supplier_types")?.length &&
                          !getValues("supplier_types")?.includes("re-work"),
                      },
                    ]}
                    {...field}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Supplier Name"
              name="supplier_name"
              validateStatus={errors.supplier_name ? "error" : ""}
              help={errors.supplier_name && errors.supplier_name.message}
              wrapperCol={{ sm: 24 }}
              required = {true}
            >
              <Controller
                control={control}
                name="supplier_name"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Supplier Name"
                    allowClear
                    loading={isLoadingSupplierNameList}
                    options={supplierNameList?.map((supplierName) => ({
                      label: supplierName?.supplier_name,
                      value: supplierName?.supplier_name,
                    }))}
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
            <Form.Item name="supplier_name" wrapperCol={{ sm: 24 }}>
              <Controller
                control={control}
                name="supplier_name"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="other"
                    style={{
                      textTransform: "capitalize",
                    }}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={<p className="m-0 whitespace-nowrap">First Name</p>}
              name="first_name"
              validateStatus={errors.first_name ? "error" : ""}
              help={errors.first_name && errors.first_name.message}
              className=""
              wrapperCol={{ sm: 24 }}
              required = {true}
            >
              <Controller
                control={control}
                name="first_name"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="First Name"
                    className="w-full"
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={<p className="m-0 whitespace-nowrap">Last Name</p>}
              name="last_name"
              validateStatus={errors.last_name ? "error" : ""}
              help={errors.last_name && errors.last_name.message}
              wrapperCol={{ sm: 24 }}
              required = {true}
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
              label="Email"
              name="email"
              validateStatus={errors.email ? "error" : ""}
              help={errors.email && errors.email.message}
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

          <Col span={12}>
            <Form.Item
              label="Address"
              name="address"
              validateStatus={errors.address ? "error" : ""}
              help={errors.address && errors.address.message}
              wrapperCol={{ sm: 24 }}
              required = {true}
            >
              <Controller
                control={control}
                name="address"
                render={({ field }) => (
                  <Input {...field} placeholder="Address" />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="GST No"
              name="gst_no"
              validateStatus={errors.gst_no ? "error" : ""}
              help={errors.gst_no && errors.gst_no.message}
              wrapperCol={{ szm: 24 }}
            >
              <Controller
                control={control}
                name="gst_no"
                render={({ field }) => (
                  <Input {...field} placeholder="GST No" />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Aadhar No"
              name="adhar_no"
              validateStatus={errors.adhar_no ? "error" : ""}
              help={errors.adhar_no && errors.adhar_no.message}
              wrapperCol={{ sm: 24 }}
              required = {true}
            >
              <Controller
                control={control}
                name="adhar_no"
                render={({ field }) => (
                  <Input {...field} placeholder="Aadhar No" />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="PAN No"
              name="pancard_no"
              validateStatus={errors.pancard_no ? "error" : ""}
              help={errors.pancard_no && errors.pancard_no.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="pancard_no"
                render={({ field }) => (
                  <Input {...field} placeholder="PAN No" />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Supplier Company"
              name="supplier_company"
              validateStatus={errors.supplier_company ? "error" : ""}
              help={errors.supplier_company && errors.supplier_company.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="supplier_company"
                render={({ field }) => (
                  <Input {...field} placeholder="Supplier Company" />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="HSN Code"
              name="hsn_code"
              validateStatus={errors.hsn_code ? "error" : ""}
              help={errors.hsn_code && errors.hsn_code.message}
              wrapperCol={{ sm: 24 }}
              required = {true}
            >
              <Controller
                control={control}
                name="hsn_code"
                render={({ field }) => (
                  <Input {...field} placeholder="HSN Code" />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Broker"
              name="broker_id"
              validateStatus={errors.broker_id ? "error" : ""}
              help={errors.broker_id && errors.broker_id.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="broker_id"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select Broker"
                    allowClear
                    loading={isLoadingBrokerList}
                    options={brokerUserListRes?.brokerList?.rows?.map(
                      (broker) => ({
                        label: broker.first_name + " " + broker.last_name + " " + `| (${broker?.username})`,
                        value: broker.id,
                      })
                    )}
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

      <DevTool control={control} />
    </div>
  );
}

export default UpdateSupplier;
