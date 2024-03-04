import { ArrowLeftOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Col, Flex, Form, Input, Row, Select, message } from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { DevTool } from "@hookform/devtools";
import {
  addUserRequest,
  getBrokerListRequest,
} from "../../../api/requests/users";
import { USER_ROLES } from "../../../constants/userRole";
import PhoneInput from "react-phone-number-input";
import ForwardRefInput from "../../../components/common/ForwardRefInput";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { isValidPhoneNumber } from "react-phone-number-input";
import { AadharRegex } from "../../../constants/regex";
import { useContext } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";

const roleId = USER_ROLES.PARTY.role_id;

const addPartySchemaResolver = yupResolver(
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
  })
);

function AddParty() {
  const { companyId } = useContext(GlobalContext);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  function goBack() {
    navigate(-1);
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
        "party",
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
  } = useForm({
    resolver: addPartySchemaResolver,
  });

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Add New Party</h3>
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
              label="Checker Name"
              name="checker_name"
              validateStatus={errors.checker_name ? "error" : ""}
              help={errors.checker_name && errors.checker_name.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="checker_name"
                render={({ field }) => (
                  <Input {...field} placeholder="Checker Name" />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Checker Number"
              name="checker_number"
              validateStatus={errors.checker_number ? "error" : ""}
              help={errors.checker_number && errors.checker_number.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="checker_number"
                render={({ field }) => (
                  <Input {...field} placeholder="Checker Number" />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Delivery Address"
              name="delivery_address"
              validateStatus={errors.delivery_address ? "error" : ""}
              help={errors.delivery_address && errors.delivery_address.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="delivery_address"
                render={({ field }) => (
                  <Input {...field} placeholder="Delivery Address" />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Overdue Day Limit"
              name="overdue_day_limit"
              validateStatus={errors.overdue_day_limit ? "error" : ""}
              help={
                errors.overdue_day_limit && errors.overdue_day_limit.message
              }
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="overdue_day_limit"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="7"
                    type="number"
                    min={0}
                    step={0.01}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Credit Limit"
              name="credit_limit"
              validateStatus={errors.credit_limit ? "error" : ""}
              help={errors.credit_limit && errors.credit_limit.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="credit_limit"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="1500.50"
                    type="number"
                    min={0}
                    step={0.01}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Company Name"
              name="company_name"
              validateStatus={errors.company_name ? "error" : ""}
              help={errors.company_name && errors.company_name.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="company_name"
                render={({ field }) => (
                  <Input {...field} placeholder="Company Name" />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Company GST Number"
              name="company_gst_number"
              validateStatus={errors.company_gst_number ? "error" : ""}
              help={
                errors.company_gst_number && errors.company_gst_number.message
              }
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="company_gst_number"
                render={({ field }) => (
                  <Input {...field} placeholder="Company GST Number" />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Brokers"
              name="broker_ids"
              validateStatus={errors.broker_ids ? "error" : ""}
              help={errors.broker_ids && errors.broker_ids.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="broker_ids"
                render={({ field }) => (
                  <Select
                    mode="multiple"
                    allowClear
                    placeholder="Please select brokers"
                    loading={isLoadingBrokerList}
                    {...field}
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

export default AddParty;
