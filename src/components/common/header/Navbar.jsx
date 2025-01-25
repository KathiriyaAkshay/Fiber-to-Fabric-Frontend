import { menubarOptionsList } from "../../../constants/menu";
import ProfileMenu from "./ProfileMenu";
import { Flex, Menu } from "antd";
import notificationBell from "../../../assets/svg/notification-bell.svg";
import CompanySelection from "./CompanySelection";
import topbarLogo from "../../../assets/svg/topbar-logo.svg";
import YearSelection from "./YearSelection";

const addPopupOffsetRecursively = (menuItems) => {
  return menuItems.map((item) => {
    const newItem = {
      ...item,
      popupOffset: [8, 8], // Adds vertical and horizontal spacing
    };

    // If the item has children, apply the function recursively
    if (item.children) {
      newItem.children = addPopupOffsetRecursively(item.children);
    }

    return newItem;
  });
};

function Navbar() {
  const updatedMenuOptions = addPopupOffsetRecursively(menubarOptionsList);

  return (
    <Flex
      justify="space-between"
      align="center"
      className="sticky z-10 top-0 px-4 py-2 bg-primary"
      // style={{ zIndex: 9991 }}
    >
      <Flex gap={"20px"} align="center" className="w-full">
        <img src={topbarLogo} alt="logo" className="h-8" />
        <Menu
          theme="dark"
          mode="horizontal"
          // items={menubarOptionsList}
          items={updatedMenuOptions}
          className="w-4/5"
          overflowedIndicator={"More"}
          onOpenChange={() => {
            const dropdowns = document.querySelectorAll(".ant-menu-sub");
            dropdowns.forEach((dropdown) => {
              dropdown.style.maxHeight = "400px"; // Adjust the height as per your requirement
              dropdown.style.overflowY = "auto";
            });
          }}
        />
      </Flex>
      <Flex gap={"12px"} align="center">
        <CompanySelection />
        <YearSelection />
        <img src={notificationBell} alt="notifications" />
        <ProfileMenu />
      </Flex>
    </Flex>
  );
}

export default Navbar;
