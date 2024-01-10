import { Link } from "react-router-dom";

function AuthTitle() {
  return (
    <div className="flex items-center gap-2.5 px-12 pt-12">
      <Link to="/auth" className="flex items-center justify-center">
        <img src="/assets/svg/logo.svg" alt="logo" height={30} />
      </Link>
      <p className="m-0 text-4xl font-semibold">Fiber to Fabric</p>
    </div>
  );
}

export default AuthTitle;
