import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/common/header/Navbar";
import { getCurrentUser } from "../api/requests/auth";
import { useQuery } from "@tanstack/react-query";
import ErrorBoundary from "../components/common/ErrorBoundary";
import { useEffect } from "react";
import { Spin } from "antd";

function BaseLayout() {
  const navigate = useNavigate();
  const location = useLocation();

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

  useEffect(() => {
    const data = localStorage.getItem("SALE_CHALLAN_ADD");
    if (data) {
      if (location.pathname !== "/sales/challan/sale-challan/add") {
        console.log("Clearing localStorage...");
        localStorage.removeItem("SALE_CHALLAN_ADD"); // Replace "someKey" with your key
      }
    }
  }, [location.pathname]);

  if (isLoading) {
    return (
      <Spin tip="Loading" size="large">
        <div className="p-14" />
      </Spin>
    );
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
