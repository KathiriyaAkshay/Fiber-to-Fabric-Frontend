import { useForm, Controller } from "react-hook-form";
import { Form, Input, Button, message } from "antd";
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
    <div className="flex flex-col justify-center flex-grow max-w-md mx-20">
      <h2 className="">Login</h2>
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

        <div className="flex justify-end">
          <Link to="/auth/forget-password">Forgot Password?</Link>
        </div>

        <Button
          type="primary"
          htmlType="submit"
          className="flex items-center justify-center w-full mt-5 text-2xl font-bold"
          size="large"
        >
          Log In
        </Button>

        {/* <div className="flex items-center gap-1.5 mt-3">
          <p className="m-0">Not registered Yet?</p>
          <Link to="/auth/register">Create account</Link>
        </div> */}
      </Form>
      <DevTool control={control} />
    </div>
  );
};

export default LoginForm;
