import { Form, Input, Button, message } from "antd";
import { Controller, useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { DevTool } from "@hookform/devtools";
import {
  forgetPasswrordRequest,
  verifyOtpRequest,
} from "../../../api/requests/auth";
import { useState } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import ForwardRefInput from "../../common/ForwardRefInput";
import { Link } from "react-router-dom";

const OtpVerificationForm = ({ setOtpVerified }) => {
  const [isOtpSent, setIsOtpSent] = useState(false);
  const {
    control,
    getValues,
    formState: { errors },
  } = useForm({});

  const { mutateAsync: forgetPassword, isLoading: isLoadingForgetPassword } =
    useMutation({
      mutationFn: async (data) => {
        const res = await forgetPasswrordRequest(data);
        return res?.data;
      },
      onSuccess: (res) => {
        const authToken = res?.data?.token;
        if (authToken) {
          localStorage.setItem("authToken", authToken);
        }
        const successMessage = res?.message;
        if (successMessage) {
          message.success(successMessage);
        }
        setIsOtpSent(true);
      },
      onError: (error) => {
        const errorMessage = error?.response?.data?.message || error.message;
        message.error(errorMessage);
      },
    });

  // Mutation for OTP verification
  const { mutateAsync: verifyOtp, isLoading: isVerifying } = useMutation({
    mutationFn: async (data) => {
      const res = await verifyOtpRequest(data);
      return res?.data;
    },
    onSuccess: (res) => {
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      setOtpVerified && setOtpVerified(true);
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "Failed to verify OTP";
      message.error(errorMessage);
    },
  });

  async function handleForgetPassword() {
    const mobile = getValues("mobile");
    if (!mobile || !isValidPhoneNumber(mobile)) {
      return message.error("Please enter valid Mobile Number");
    }
    const data = await forgetPassword({ mobile });
    console.log("data----->", data);
  }

  async function handleForgetClick() {
    if (isOtpSent) {
      const otp = getValues("otp");
      if (!otp || otp.length !== 4) {
        return message.error("OTP must be four digit");
      }
      verifyOtp({ otp });
    } else {
      handleForgetPassword();
    }
  }

  return (
    <>
      <div className="flex flex-col justify-center flex-grow  mx-20">
        <h2 className="">OTP Verification</h2>
        <Form layout="vertical">
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
                  disabled={!isOtpSent}
                />
              )}
            />
          </Form.Item>
          <div className="flex justify-center gap-3">
            <Button
              type="primary"
              onClick={handleForgetClick}
              loading={isVerifying}
              className="flex-grow"
            >
              {isOtpSent ? "Verify OTP" : "Send OTP"}
            </Button>
            <Button
              onClick={handleForgetPassword}
              loading={isLoadingForgetPassword}
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
      <DevTool control={control} />
    </>
  );
};

export default OtpVerificationForm;
