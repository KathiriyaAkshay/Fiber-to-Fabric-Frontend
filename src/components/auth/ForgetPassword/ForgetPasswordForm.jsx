import { Form, Input, Button, message } from "antd";
import { Controller, useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { DevTool } from "@hookform/devtools";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link, useNavigate } from "react-router-dom";
import { resetPasswrordRequest } from "../../../api/requests/auth";

const forgetPasswordSchemaResolver = yupResolver(
  yup.object().shape({
    password: yup
      .string()
      // .min(8, "Password is too short - should be 8 chars minimum.")
      .required("Please enter new password"),
    oldPassword: yup
      .string()
      // .min(8, "Password is too short - should be 8 chars minimum.")
      .required("Please enter old password"),
    confirm_password: yup
      .string()
      .oneOf([yup.ref("password"), null], "Passwords don't match")
      .required("Confirm password is required."),
  })
);

const ForgetPasswordForm = () => {
  const navigate = useNavigate();
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: forgetPasswordSchemaResolver,
  });

  // Mutation for reseting password
  const { mutateAsync: resetPassword, isLoading: isReseting } = useMutation({
    mutationFn: async (data) => {
      const res = await resetPasswrordRequest(data);
      return res?.data;
    },
    onSuccess: (res) => {
      console.log("res----->", res);
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      navigate("/", { replace: true });
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(errorMessage);
    },
  });

  const onSubmit = (data) => {
    delete data.confirm_password;
    resetPassword(data);
  };

  return (
    <>
      <div className="flex flex-col justify-center flex-grow  mx-20">
        <h2 className="">Forget Password</h2>
        <Form onFinish={handleSubmit(onSubmit)} layout="vertical">
          <Form.Item
            label="Old Password"
            name="oldPassword"
            validateStatus={errors.oldPassword ? "error" : ""}
            help={errors.oldPassword && errors.oldPassword.message}
          >
            <Controller
              control={control}
              name="oldPassword"
              render={({ field }) => (
                <Input.Password
                  {...field}
                  placeholder="Enter your old password"
                  autoComplete="old-password"
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="New Password"
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
                  placeholder="Enter your new password"
                  autoComplete="new-password"
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
                  placeholder="Enter your new password again"
                  autoComplete="repeat-password"
                />
              )}
            />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isReseting}
            className="w-full"
          >
            Reset
          </Button>

          <div className="flex items-center gap-1.5 mt-3">
            <p className="m-0">Back to</p>
            <Link to="/auth">Log in !</Link>
          </div>
        </Form>
      </div>
      <DevTool control={control} />
    </>
  );
};

export default ForgetPasswordForm;
