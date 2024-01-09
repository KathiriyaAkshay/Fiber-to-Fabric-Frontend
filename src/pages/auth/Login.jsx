import LoginForm from "../../components/auth/LoginForm";

function Login() {
  return (
    <div
      className="flex flex-grow"
      style={{
        background: "rgba(25, 74, 109, 0.10)",
      }}
    >
      <div className="flex flex-col w-1/2 bg-[#E7F5FF]">
        <div className="flex items-center gap-2.5 px-12 pt-12">
          <div className="flex items-center justify-center">
            <img src="/assets/svg/logo.svg" alt="logo" height={30} />
          </div>
          <p className="m-0 text-4xl font-semibold">Fiber to Fabric</p>
        </div>
        <LoginForm />
      </div>
      <div
        className="relative flex flex-col items-center justify-center w-1/2 gap-10 shrink-0"
        style={{
          background: "linear-gradient(180deg, #194A6D 0%, #032136 100%)",
        }}
      >
        <div className="z-10 flex flex-col items-start justify-center gap-10 mx-20 font-semibold text-center text-white">
          <p className="m-0 text-6xl">Welcome Back to Fiber to Fabric!</p>
          <p className="m-0 text-2xl">
            Please login to your account to access all of your information.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 w-1/2 rotate-180 bg-cover h-1/2 bg-auth-mask-group"></div>
        <div className="absolute top-0 right-0 w-1/2 bg-cover h-1/2 bg-auth-mask-group"></div>
      </div>
    </div>
  );
}

export default Login;
