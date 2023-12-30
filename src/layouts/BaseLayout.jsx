import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "../components/common/header/Navbar";
import { getCurrentUser } from "../api/requests/auth";
import { useQuery } from "@tanstack/react-query";
import ErrorBoundary from "../components/common/ErrorBoundary";
import { useEffect } from "react";

function BaseLayout() {
  const navigate = useNavigate();
  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["auth", "current-user"],
    queryFn: async () => {
      const res = await getCurrentUser();
      return res.data?.data?.user;
    },
  });

  useEffect(() => {
    if (user && !user?.otp_verified) {
      navigate("/auth/verify-otp");
    }
  }, [navigate, user]);

  if (isLoading) {
    return "Loading";
  }

  if (isError) {
    console.error("----->", error);
    return <ErrorBoundary />;
  }

  return (
    <div className="flex flex-col w-full">
      <Navbar />
      <Outlet />
    </div>
  );
}

export default BaseLayout;
