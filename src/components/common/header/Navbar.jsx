import { menubarOptionsList } from "../../../constants/menu";
import ProfileMenu from "./ProfileMenu";
import { Flex, Menu } from "antd";
import notificationBell from "../../../assets/svg/notification-bell.svg";
import CompanySelection from "./CompanySelection";
import topbarLogo from "../../../assets/svg/topbar-logo.svg";

function Navbar() {
  return (
    <Flex
      justify="space-between"
      align="center"
      className="px-4 py-2 bg-primary"
    >
      <Flex gap={"20px"} align="center">
        <img src={topbarLogo} alt="logo" className="h-8" />
        <Menu
          theme="dark"
          mode="horizontal"
          items={menubarOptionsList}
          className="max-w-5xl"
        />
      </Flex>
      <Flex gap={"12px"} align="center">
        <CompanySelection />
        <img src={notificationBell} alt="notifications" />
        <ProfileMenu />
      </Flex>
    </Flex>
  );
}

export default Navbar;
