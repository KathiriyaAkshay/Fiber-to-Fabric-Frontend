import { ArrowLeftOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Col,
  Flex,
  Form,
  Input,
  Radio,
  Row,
  Select,
  message,
} from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { DevTool } from "@hookform/devtools";
import { addUserRequest } from "../../../api/requests/users";
import { USER_ROLES } from "../../../constants/userRole";
import PhoneInput from "react-phone-number-input";
import ForwardRefInput from "../../../components/common/ForwardRefInput";
import { getCompanyListRequest } from "../../../api/requests/company";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { isValidPhoneNumber } from "react-phone-number-input";
import { AadharRegex } from "../../../constants/regex";

const roleId = USER_ROLES.SUPERVISOR.role_id;

const registerSchemaResolver = yupResolver(
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
    registration_step: yup.number(),
    role_id: yup.number(),
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

function AddSupervisor() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  function goBack() {
    navigate(-1);
  }

  const { data: companyListRes } = useQuery({
    queryKey: ["company", "list"],
    queryFn: async () => {
      const res = await getCompanyListRequest({});
      return res.data?.data;
    },
  });

  const { mutateAsync: addUser } = useMutation({
    mutationFn: async (data) => {
      const res = await addUserRequest({
        roleId,
        data,
      });
      return res.data;
    },
    mutationKey: ["users", "add", roleId],
    onSuccess: (res) => {
      queryClient.invalidateQueries(["supervisor", "list"]);
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
    resolver: registerSchemaResolver,
  });

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h2 className="m-0">Add New Supervisor</h2>
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
              label="Supervisor Type"
              name="supervisor_type"
              validateStatus={errors.supervisor_type ? "error" : ""}
              help={errors.supervisor_type && errors.supervisor_type.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="supervisor_type"
                render={({ field }) => (
                  <Radio.Group {...field}>
                    <Radio value={"senior"}>Senior</Radio>
                    <Radio value={"super_senior"}>Semi-Senior</Radio>
                  </Radio.Group>
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Supervisor Type"
              name="company_ids"
              validateStatus={errors.company_ids ? "error" : ""}
              help={errors.company_ids && errors.company_ids.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="company_ids"
                render={({ field }) => (
                  <Select
                    mode="multiple"
                    allowClear
                    // style={{
                    //   width: "100%",
                    // }}
                    placeholder="Please select companies"
                    {...field}
                    options={companyListRes?.rows?.map((company) => ({
                      label: company.company_name,
                      value: company.id,
                    }))}
                  />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Flex gap={10} justify="flex-end">
          <Button htmlType="button" onClick={reset}>
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

export default AddSupervisor;
