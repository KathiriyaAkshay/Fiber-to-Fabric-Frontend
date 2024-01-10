function AuthRight({
  title = "Welcome Back to Fiber to Fabric!",
  subTitle = "Please login to your account to access all of your information.",
}) {
  return (
    <div
      className="relative flex flex-col items-center justify-center w-1/2 gap-10 shrink-0"
      style={{
        background: "linear-gradient(180deg, #194A6D 0%, #032136 100%)",
      }}
    >
      <div className="z-10 flex flex-col items-start justify-center gap-10 mx-20 font-semibold text-center text-white">
        <p className="m-0 text-6xl">{title}</p>
        <p className="m-0 text-2xl">{subTitle}</p>
      </div>
      <div className="absolute bottom-0 left-0 w-1/2 rotate-180 bg-cover h-1/2 bg-auth-mask-group"></div>
      <div className="absolute top-0 right-0 w-1/2 bg-cover h-1/2 bg-auth-mask-group"></div>
    </div>
  );
}

export default AuthRight;
