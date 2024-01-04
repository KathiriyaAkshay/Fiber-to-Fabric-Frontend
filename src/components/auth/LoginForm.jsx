import { useForm, Controller } from "react-hook-form";
import { Form, Input, Button, Row, Col, Space, message } from "antd";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import * as yup from "yup";
import { DevTool } from "@hookform/devtools";
import { Link, useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { loginRequest } from "../../api/requests/auth";
import ForwardRefInput from "../common/ForwardRefInput";

const loginSchemaResolver = yupResolver(
  yup.object().shape({
    password: yup.string().required("No password provided."),
    // .min(8, "Password is too short - should be 8 chars minimum."),
    mobile: yup
      .string()
      .required("Please enter Contact number")
      .test("Mobile Validation", "Please enter valid Contact Number", (value) =>
        value ? isValidPhoneNumber(value) : false
      ),
  })
);

const LoginForm = () => {
  const navigate = useNavigate();

  const { mutateAsync: login } = useMutation({
    mutationFn: async (data) => {
      const res = await loginRequest(data);
      return res.data;
    },
    onSuccess: (res) => {
      const authToken = res?.data?.token;
      if (authToken) {
        localStorage.setItem("authToken", authToken);
        const otpVerified = res?.data?.user?.otp_verified;
        if (otpVerified) {
          navigate("/", { replace: true });
        } else {
          navigate("/auth/verify-otp");
        }
      }
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
  } = useForm({
    resolver: loginSchemaResolver,
  });

  async function onSubmit(data) {
    console.log(data); // Handle form submission
    const res = await login(data);
    console.log("res----->", res);
  }

  return (
    <div className="flex flex-col">
      <h1 className="text-center">Login</h1>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Form.Item
          label="Phone Number"
          name="mobile"
          validateStatus={errors.mobile ? "error" : ""}
          help={errors.mobile && errors.mobile.message}
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

        <Form.Item
          label="Password"
          name="password"
          validateStatus={errors.password ? "error" : ""}
          help={errors.password && errors.password.message}
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

        <Form.Item style={{ margin: 0 }}>
          <Link to="/auth/forget-password">Forgot password</Link>
        </Form.Item>

        <Form.Item>
          <Row justify="center">
            <Col>
              <Space>
                <Button type="primary" htmlType="submit">
                  Login
                </Button>
                <p>Or</p>
                <Link to="/auth/register">Register</Link>
              </Space>
            </Col>
          </Row>
        </Form.Item>
      </Form>
      <DevTool control={control} />
    </div>
  );
};

export default LoginForm;
