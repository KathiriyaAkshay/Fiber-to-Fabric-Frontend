import { Outlet } from "react-router-dom";
import Navbar from "../components/common/header/Navbar";

function BaseLayout() {
  return (
    <div className="flex flex-col w-full">
      <Navbar />
      <Outlet />
    </div>
  );
}

export default BaseLayout;
