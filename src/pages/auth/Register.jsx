import AuthRight from "../../components/auth/AuthRight";
import AuthTitle from "../../components/auth/AuthTitle";
import RegistrationForm from "../../components/auth/RegistrationForm";

function Register() {
  return (
    <div
      className="flex flex-grow"
      style={{
        background: "rgba(25, 74, 109, 0.10)",
        height: "100vh",
      }}
    >
      <div className="flex flex-col w-1/2 bg-[#E7F5FF] h-full overflow-auto">
        <AuthTitle />
        <div className="flex justify-center">
          <RegistrationForm />
        </div>
      </div>
      <AuthRight
        title="Welcome Back to Fiber to Fabric!"
        subTitle="Please login to your account to access all of your information."
      />
    </div>
  );
}

export default Register;
