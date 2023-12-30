import { Form, Input, Button, message } from "antd";
import { Controller, useForm } from "react-hook-form";
import { resendOtpRequest, verifyOtpRequest } from "../../api/requests/auth";
import { useMutation } from "@tanstack/react-query";
import { DevTool } from "@hookform/devtools";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

const otpSchemaResolver = yupResolver(
  yup.object().shape({
    otp: yup
      .string()
      .required("Please enter OTP")
      .length(4, "OTP must be four Digit"),
  })
);

const OtpVerificationPage = () => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: otpSchemaResolver,
  });

  // Mutation for OTP verification
  const { mutateAsync: verifyOtp, isLoading: isVerifying } = useMutation({
    mutationFn: async (data) => {
      return await verifyOtpRequest(data);
    },
    onSuccess: () => {
      // Handle successful verification, e.g., navigate to the next page
      message.success("OTP verified successfully!");
    },
    onError: (error) => {
      // Handle verification error
      message.error(error.message || "Failed to verify OTP");
    },
  });

  // Mutation for resending OTP
  const { mutate: resendOtp, isLoading: isResending } = useMutation({
    mutationFn: async (data) => {
      return await resendOtpRequest(data);
    },
    onSuccess: () => {
      // Handle successful resend
      message.success("OTP resent successfully!");
    },
    onError: (error) => {
      // Handle resend error
      message.error(error.message || "Failed to resend OTP");
    },
  });

  const onSubmit = (data) => {
    console.log("data----->", data);
    verifyOtp(data);
  };

  const handleResend = () => {
    // Call the resendOtp mutation
    resendOtp();
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-w-full">
        <h1>OTP Verification</h1>
        <Form onFinish={handleSubmit(onSubmit)}>
          <Form.Item
            label="Enter OTP"
            name="otp"
            validateStatus={errors.otp ? "error" : ""}
            help={errors.otp && errors.otp.message}
          >
            <Controller
              control={control}
              name="otp"
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Enter your OTP"
                  onInput={(e) =>
                    (e.target.value = e.target.value.replace(/\D/, ""))
                  }
                  maxLength={4}
                />
              )}
            />
          </Form.Item>
          <Form.Item>
            <div className="flex gap-3">
              <Button type="primary" htmlType="submit" loading={isVerifying}>
                Verify OTP
              </Button>
              <Button onClick={handleResend} loading={isResending}>
                Resend OTP
              </Button>
            </div>
          </Form.Item>
        </Form>
      </div>
      <DevTool control={control} />
    </>
  );
};

export default OtpVerificationPage;
