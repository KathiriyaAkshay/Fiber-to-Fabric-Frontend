import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { Button, Form, Input } from "antd";
import { Controller, useForm } from "react-hook-form";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";
import { signupRequest } from "../../api/requests/auth";
import { DevTool } from "@hookform/devtools";
import { GSTRegex, PANRegex } from "../../constants/regex";

const registerSchemaResolver = yupResolver(
  yup.object().shape({
    first_name: yup.string(),
    last_name: yup.string(),
    password: yup
      .string()
      // .min(8, "Password is too short - should be 8 chars minimum.")
      .required("No password provided."),
    confirm_password: yup
      .string()
      .oneOf([yup.ref("password"), null], "Passwords don't match")
      .required("This value is required."),
    mobile: yup
      .string()
      .required("Please enter Contact number")
      .test("Mobile Validation", "Please enter valid Contact Number", (value) =>
        value ? isValidPhoneNumber(value) : false
      ),
    email: yup.string().email("Please enter valid email address"),
    address: yup.string(),
    registration_step: yup.number(),
    role_id: yup.number(),
    gst_no: yup
      .string()
      // .required('Please enter GST')
      .matches(GSTRegex, "Enter valid GST number"),
    adhar_no: yup.string(),
    pancard_no: yup
      .string()
      // .required('Please enter pan number')
      .matches(PANRegex, "Enter valid PAN number"),
    username: yup.string(),
  })
);

const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 8,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 16,
    },
  },
};

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};

const RegistrationForm = () => {
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      registration_step: 1,
      role_id: 1,
    },
    resolver: registerSchemaResolver,
  });

  const { mutateAsync: signup } = useMutation({
    mutationFn: async (data) => {
      const res = await signupRequest(data);
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
  });

  async function onSubmit(data) {
    // remove extra fields
    delete data.confirm_password;
    console.log(data); // Handle form submission

    const res = await signup(data);
    console.log("res----->", res);
  }

  return (
    <div className="flex flex-col">
      <h1 className="text-center">Register</h1>
      <Form
        {...formItemLayout}
        name="register"
        onFinish={handleSubmit(onSubmit)}
        scrollToFirstError
        style={{
          width: 500,
        }}
      >
        <Form.Item
          label="Email"
          name="email"
          validateStatus={errors.email ? "error" : ""}
          help={errors.email && errors.email.message}
        >
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <Input {...field} placeholder="Email" type="email" />
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

        <Form.Item
          label="Confirm Password"
          name="confirm_password"
          validateStatus={errors.confirm_password ? "error" : ""}
          help={errors.confirm_password && errors.confirm_password.message}
        >
          <Controller
            control={control}
            name="confirm_password"
            render={({ field }) => (
              <Input.Password
                {...field}
                placeholder="Enter your password again"
                autoComplete="repeat-password"
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Username"
          name="username"
          validateStatus={errors.username ? "error" : ""}
          help={errors.username && errors.username.message}
        >
          <Controller
            control={control}
            name="username"
            render={({ field }) => <Input {...field} placeholder="Username" />}
          />
        </Form.Item>

        <Form.Item
          label="First Name"
          name="first_name"
          validateStatus={errors.first_name ? "error" : ""}
          help={errors.first_name && errors.first_name.message}
        >
          <Controller
            control={control}
            name="first_name"
            render={({ field }) => (
              <Input {...field} placeholder="First Name" />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Last Name"
          name="last_name"
          validateStatus={errors.last_name ? "error" : ""}
          help={errors.last_name && errors.last_name.message}
        >
          <Controller
            control={control}
            name="last_name"
            render={({ field }) => <Input {...field} placeholder="Last Name" />}
          />
        </Form.Item>

        <Form.Item
          label="Address"
          name="address"
          validateStatus={errors.address ? "error" : ""}
          help={errors.address && errors.address.message}
        >
          <Controller
            control={control}
            name="address"
            render={({ field }) => <Input {...field} placeholder="Address" />}
          />
        </Form.Item>

        <Form.Item
          label="GST No"
          name="gst_no"
          validateStatus={errors.gst_no ? "error" : ""}
          help={errors.gst_no && errors.gst_no.message}
        >
          <Controller
            control={control}
            name="gst_no"
            render={({ field }) => <Input {...field} placeholder="GST No" />}
          />
        </Form.Item>

        <Form.Item
          label="Aadhar No"
          name="adhar_no"
          validateStatus={errors.adhar_no ? "error" : ""}
          help={errors.adhar_no && errors.adhar_no.message}
        >
          <Controller
            control={control}
            name="adhar_no"
            render={({ field }) => <Input {...field} placeholder="Aadhar No" />}
          />
        </Form.Item>

        <Form.Item
          label="PAN No"
          name="pancard_no"
          validateStatus={errors.pancard_no ? "error" : ""}
          help={errors.pancard_no && errors.pancard_no.message}
        >
          <Controller
            control={control}
            name="pancard_no"
            render={({ field }) => <Input {...field} placeholder="PAN No" />}
          />
        </Form.Item>

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
              />
            )}
          />
        </Form.Item>

        <Form.Item {...tailFormItemLayout}>
          <Button
            type="primary"
            htmlType="submit"
            //   style={{ marginRight: "12px" }}
          >
            Register
          </Button>
          {" Or "}
          <Link to="/auth/login">Login</Link>
        </Form.Item>
      </Form>
      <DevTool control={control} />
    </div>
  );
};
export default RegistrationForm;
