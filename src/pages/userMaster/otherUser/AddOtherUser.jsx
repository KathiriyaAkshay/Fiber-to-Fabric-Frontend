import { ArrowLeftOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Col,
  Flex,
  Form,
  Input,
  Radio,
  Row,
  Space,
  Typography,
  message,
} from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { addUserRequest } from "../../../api/requests/users";
import { USER_ROLES } from "../../../constants/userRole";
import PhoneInput from "react-phone-number-input";
import ForwardRefInput from "../../../components/common/ForwardRefInput";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { isValidPhoneNumber } from "react-phone-number-input";
import { useContext } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { mutationOnErrorHandler } from "../../../utils/mutationUtils";

const validationSchema = yupResolver(
  yup.object().shape({
    first_name: yup.string().required("Please enter first name"),
    last_name: yup.string().required("Please enter last name"),
    address: yup.string().required("Please enter address"),
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
    password: yup.string().required("Please enter password"),
    username: yup.string().required("Please enter username"),
    role_id: yup.string().required("Please select user type"),
  })
);

function AddOtherUser() {
  const {
    companyId,
    // companyListRes
  } = useContext(GlobalContext);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  function goBack() {
    navigate(-1);
  }

  const { mutateAsync: addUser, isPending } = useMutation({
    mutationFn: async ({ roleId, data }) => {
      const res = await addUserRequest({
        roleId,
        data,
        params: { company_id: companyId },
      });
      return res.data;
    },
    mutationKey: ["users", "add"],
    onSuccess: (res) => {
      queryClient.invalidateQueries([
        "other-user",
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
      mutationOnErrorHandler({ error, message });
    },
  });

  async function onSubmit(data) {
    const roleId = +data?.role_id;
    const payload = {
      ...data,
    };

    await addUser({ roleId, data: payload });
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: validationSchema,
  });

  const { role_id } = watch();

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Create New User</h3>
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
              label={<p className="m-0 whitespace-nowrap">First Name</p>}
              name="first_name"
              validateStatus={errors.first_name ? "error" : ""}
              help={errors.first_name && errors.first_name.message}
              className=""
              wrapperCol={{ sm: 24 }}
              required={true}
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

          <Col span={6}>
            <Form.Item
              label={<p className="m-0 whitespace-nowrap">Last Name</p>}
              name="last_name"
              validateStatus={errors.last_name ? "error" : ""}
              help={errors.last_name && errors.last_name.message}
              wrapperCol={{ sm: 24 }}
              required={true}
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
              label="Address"
              name="address"
              validateStatus={errors.address ? "error" : ""}
              help={errors.address && errors.address.message}
              wrapperCol={{ sm: 24 }}
              required={true}
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
              label={<p className="m-0 whitespace-nowrap">Mobile Number</p>}
              name="mobile"
              validateStatus={errors.mobile ? "error" : ""}
              help={errors.mobile && errors.mobile.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="mobile"
                render={({ field }) => (
                  <PhoneInput
                    {...field}
                    placeholder="Enter mobile number"
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
              label="Password"
              name="password"
              validateStatus={errors.password ? "error" : ""}
              help={errors.password && errors.password.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="password"
                render={({ field }) => (
                  <Input {...field} placeholder="Enter your password" />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="User Name"
              name="username"
              validateStatus={errors.username ? "error" : ""}
              help={errors.username && errors.username.message}
              wrapperCol={{ sm: 24 }}
              required={true}
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

          <Col span={8}>
            <Form.Item
              label={
                <Typography.Text>
                  Select User Type{" "}
                  <span style={{ color: "red" }}>[ Select Any Type ]</span>
                </Typography.Text>
              }
              name="role_id"
              validateStatus={errors.role_id ? "error" : ""}
              help={errors.role_id && errors.role_id.message}
              wrapperCol={{ sm: 24 }}
              required={true}
            >
              <Controller
                control={control}
                name="role_id"
                render={({ field }) => (
                  <Radio.Group {...field} className="payment-options">
                    <Radio value={USER_ROLES.NORMAL_USER.role_id}>Normal</Radio>
                    <Radio value={USER_ROLES.PARNTER_USER.role_id}>
                      Partner
                    </Radio>
                    <Radio value={USER_ROLES.MENDING_USER.role_id}>
                      Mending
                    </Radio>
                    <Radio value={USER_ROLES.FOLDING_USER.role_id}>
                      Folding
                    </Radio>
                  </Radio.Group>
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        {role_id === USER_ROLES.MENDING_USER.role_id ||
        role_id === USER_ROLES.FOLDING_USER.role_id ? (
          <Row
            gutter={18}
            style={{
              padding: "12px",
              backgroundColor: "var(--secondary-color)",
              border: "1px solid rgb(25 74 109)",
              borderRadius: "10px",
            }}
          >
            <Col span={12}>
              <Space>
                <Form.Item
                  label="Regular"
                  name="is_regular_per_taka"
                  validateStatus={errors.is_regular_per_taka ? "error" : ""}
                  help={
                    errors.is_regular_per_taka &&
                    errors.is_regular_per_taka.message
                  }
                  wrapperCol={{ sm: 24 }}
                  required={true}
                >
                  <Controller
                    control={control}
                    name="is_regular_per_taka"
                    render={({ field }) => (
                      <Radio.Group {...field}>
                        <Radio value={true}>Per Taka</Radio>
                        <Radio value={false}>Per Meter</Radio>
                      </Radio.Group>
                    )}
                  />
                </Form.Item>
                <Form.Item
                  label=" "
                  name="regular_rate"
                  validateStatus={errors.regular_rate ? "error" : ""}
                  help={errors.regular_rate && errors.regular_rate.message}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name="regular_rate"
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Regular rate"
                        type="number"
                        onChange={(e) => {
                          field.onChange(+e.target.value);
                        }}
                      />
                    )}
                  />
                </Form.Item>
              </Space>
            </Col>

            <Col span={12}>
              <Space>
                <Form.Item
                  label="Re-work"
                  name="is_rework_per_taka"
                  validateStatus={errors.is_rework_per_taka ? "error" : ""}
                  help={
                    errors.is_rework_per_taka &&
                    errors.is_rework_per_taka.message
                  }
                  wrapperCol={{ sm: 24 }}
                  required={true}
                >
                  <Controller
                    control={control}
                    name="is_rework_per_taka"
                    render={({ field }) => (
                      <Radio.Group {...field}>
                        <Radio value={true}>Per Taka</Radio>
                        <Radio value={false}>Per Meter</Radio>
                      </Radio.Group>
                    )}
                  />
                </Form.Item>
                <Form.Item
                  label=" "
                  name="rework_rate"
                  validateStatus={errors.rework_rate ? "error" : ""}
                  help={errors.rework_rate && errors.rework_rate.message}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name="rework_rate"
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Rework rate"
                        type="number"
                        onChange={(e) => {
                          field.onChange(+e.target.value);
                        }}
                      />
                    )}
                  />
                </Form.Item>
              </Space>
            </Col>

            {role_id === USER_ROLES.FOLDING_USER.role_id ? (
              <>
                <Col span={12}>
                  <Form.Item
                    label="From Taka Number"
                    name="from_taka_number"
                    validateStatus={errors.from_taka_number ? "error" : ""}
                    help={
                      errors.from_taka_number && errors.from_taka_number.message
                    }
                    wrapperCol={{ sm: 24 }}
                  >
                    <Controller
                      control={control}
                      name="from_taka_number"
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="2000"
                          type="number"
                          onChange={(e) => {
                            field.onChange(+e.target.value);
                          }}
                        />
                      )}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="To Taka Number"
                    name="to_taka_number"
                    validateStatus={errors.to_taka_number ? "error" : ""}
                    help={
                      errors.to_taka_number && errors.to_taka_number.message
                    }
                    wrapperCol={{ sm: 24 }}
                  >
                    <Controller
                      control={control}
                      name="to_taka_number"
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="2000"
                          type="number"
                          onChange={(e) => {
                            field.onChange(+e.target.value);
                          }}
                        />
                      )}
                    />
                  </Form.Item>
                </Col>
              </>
            ) : null}
          </Row>
        ) : null}

        <Flex gap={10} justify="flex-end" style={{ marginTop: "1rem" }}>
          <Button htmlType="button" onClick={() => reset()}>
            Reset
          </Button>
          <Button type="primary" htmlType="submit" loading={isPending}>
            Create
          </Button>
        </Flex>
      </Form>
    </div>
  );
}

export default AddOtherUser;
