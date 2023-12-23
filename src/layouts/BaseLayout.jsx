import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";

function BaseLayout() {
  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  );
}

export default BaseLayout;
