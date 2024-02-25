import { ArrowLeftOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { useNavigate } from "react-router-dom";
import { DevTool } from "@hookform/devtools";
import {
  addUserRequest,
  getBrokerListRequest,
} from "../../../api/requests/users";
import { USER_ROLES, supplierTypeEnum } from "../../../constants/userRole";
import PhoneInput from "react-phone-number-input";
import ForwardRefInput from "../../../components/common/ForwardRefInput";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { isValidPhoneNumber } from "react-phone-number-input";
import { AadharRegex } from "../../../constants/regex";
import { useCompanyList } from "../../../api/hooks/company";

const roleId = USER_ROLES.SUPPLIER.role_id;

const addSupplierSchemaResolver = yupResolver(
  yup.object().shape({
    first_name: yup.string(),
    last_name: yup.string(),
    password: yup
      .string()
      // .min(8, "Password is too short - should be 8 chars minimum.")
      .required("No password provided."),
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
    address: yup.string(),
    gst_no: yup.string().required("Please enter GST"),
    // .matches(GSTRegex, "Enter valid GST number"),
    pancard_no: yup.string(),
    // .required('Please enter pan number')
    // .matches(PANRegex, "Enter valid PAN number"),
    username: yup.string(),
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

function AddSupplier() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  function goBack() {
    navigate(-1);
  }

  const { data: companyListRes } = useCompanyList();

  const companyId = companyListRes?.rows?.[0]?.id;

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

  const { mutateAsync: addUser } = useMutation({
    mutationFn: async (data) => {
      const res = await addUserRequest({
        roleId,
        data,
        params: { company_id: companyId },
      });
      return res.data;
    },
    mutationKey: ["users", "add", roleId],
    onSuccess: (res) => {
      queryClient.invalidateQueries([
        "supplier",
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
    await addUser(data);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm({
    resolver: addSupplierSchemaResolver,
  });

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Add New Supplier</h3>
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
              label={<p className="m-0 whitespace-nowrap">First Name</p>}
              name="first_name"
              validateStatus={errors.first_name ? "error" : ""}
              help={errors.first_name && errors.first_name.message}
              className=""
              wrapperCol={{ sm: 24 }}
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
              label={<p className="m-0 whitespace-nowrap">Phone Number</p>}
              name="mobile"
              validateStatus={errors.mobile ? "error" : ""}
              help={errors.mobile && errors.mobile.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="mobile"
                render={({ field }) => (
                  <PhoneInput
                    {...field}
                    placeholder="Enter phone number"
                    defaultCountry="IN"
                    international
                    inputComponent={ForwardRefInput}
                  />
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
              label="Password"
              name="password"
              validateStatus={errors.password ? "error" : ""}
              help={errors.password && errors.password.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="password"
                render={({ field }) => (
                  <Input.Password
                    {...field}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
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
              wrapperCol={{ sm: 24 }}
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
              label="Username"
              name="username"
              validateStatus={errors.username ? "error" : ""}
              help={errors.username && errors.username.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="username"
                render={({ field }) => (
                  <Input {...field} placeholder="Username" />
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
            >
              <Controller
                control={control}
                name="supplier_name"
                render={({ field }) => (
                  <Input {...field} placeholder="Supplier Name" />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="supplier Company"
              name="supplier_company"
              validateStatus={errors.supplier_company ? "error" : ""}
              help={errors.supplier_company && errors.supplier_company.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="supplier_company"
                render={({ field }) => (
                  <Input {...field} placeholder="supplier Company" />
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
                        label: broker.first_name + " " + broker.last_name,
                        value: broker.id,
                      })
                    )}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Supplier Type"
              name="supplier_types"
              validateStatus={errors.supplier_types ? "error" : ""}
              help={errors.supplier_types && errors.supplier_types.message}
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

export default AddSupplier;
