import { Form, Input, Button, message } from "antd";
import { Controller, useForm } from "react-hook-form";
import { resendOtpRequest, verifyOtpRequest } from "../../api/requests/auth";
import { useMutation } from "@tanstack/react-query";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link, useNavigate } from "react-router-dom";
import AuthRight from "../../components/auth/AuthRight";
import AuthTitle from "../../components/auth/AuthTitle";

const otpSchemaResolver = yupResolver(
  yup.object().shape({
    otp: yup
      .string()
      .required("Please enter OTP")
      .length(4, "OTP must be four Digit"),
  })
);

const OtpVerificationPage = () => {
  const navigate = useNavigate();
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
      message.success("OTP verified successfully!");
      navigate("/", { replace: true });
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "Failed to verify OTP";
      message.error(errorMessage);
    },
  });

  // Mutation for resending OTP
  const { mutate: resendOtp, isLoading: isResending } = useMutation({
    mutationFn: async (data) => {
      const res = await resendOtpRequest(data);
      return res.data;
    },
    onSuccess: (res) => {
      // Handle successful resend
      message.success(res?.message || "OTP resent successfully!");
    },
    onError: (error) => {
      // Handle resend error
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "Failed to resend OTP";
      message.error(errorMessage);
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
      <div
        className="flex flex-grow"
        style={{
          background: "rgba(25, 74, 109, 0.10)",
        }}
      >
        <div className="flex flex-col w-1/2 bg-[#E7F5FF]">
          <AuthTitle />

          <div className="flex flex-col justify-center flex-grow  mx-20">
            <h2 className="">OTP Verification</h2>
            <Form onFinish={handleSubmit(onSubmit)} layout="vertical">
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
              <div className="flex gap-3">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isVerifying}
                  className="flex-grow"
                >
                  Verify OTP
                </Button>
                <Button
                  onClick={handleResend}
                  loading={isResending}
                  className="flex-grow"
                >
                  Resend OTP
                </Button>
              </div>

              <div className="flex items-center gap-1.5 mt-3">
                <p className="m-0">Back to</p>
                <Link to="/auth">Log in !</Link>
              </div>
            </Form>
          </div>
        </div>
        <AuthRight
          title="Welcome Back to Fiber to Fabric!"
          subTitle="Please login to your account to access all of your information."
        />
      </div>
    </>
  );
};

export default OtpVerificationPage;
