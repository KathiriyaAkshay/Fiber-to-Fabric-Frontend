import { Breadcrumb } from "antd";
import { Link } from "react-router-dom";
import { useState } from "react";
import OtpVerificationForm from "../../components/auth/ForgetPassword/OtpVerificationForm";
import ForgetPasswordForm from "../../components/auth/ForgetPassword/ForgetPasswordForm";

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
      <div className="flex px-10 py-4">
        <Breadcrumb
          items={[
            {
              title: <Link to="/">Home</Link>,
            },
          ]}
        />
      </div>
      {renderForm()}
    </>
  );
};

export default ForgetPasswordPage;
