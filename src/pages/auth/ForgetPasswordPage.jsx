import { useState } from "react";
import OtpVerificationForm from "../../components/auth/ForgetPassword/OtpVerificationForm";
import ForgetPasswordForm from "../../components/auth/ForgetPassword/ForgetPasswordForm";
import AuthRight from "../../components/auth/AuthRight";
import AuthTitle from "../../components/auth/AuthTitle";

const ForgetPasswordPage = () => {
  const [otpVerified, setOtpVerified] = useState(false);

  function renderForm() {
    if (otpVerified) {
      return <ForgetPasswordForm />;
    } else {
      return <OtpVerificationForm setOtpVerified={setOtpVerified} />;
    }
  }
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
          {renderForm()}
        </div>
        <AuthRight
          title="Welcome Back to Fiber to Fabric!"
          subTitle="Please login to your account to access all of your information."
        />
      </div>
    </>
  );
};

export default ForgetPasswordPage;
