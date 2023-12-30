import { Avatar, Button, Menu } from "antd";
import { api } from "../../../api";
import { useNavigate } from "react-router-dom";

function ProfileMenu() {
  const navigate = useNavigate();
  const onClick = (e) => {
    console.log("click", e);
  };

  function handleLogout() {
    // remove authentication token from local storage
    localStorage.removeItem("authToken");

    // remove Authorization from api axios instance
    delete api.defaults.headers.common["Authorization"];

    navigate("/auth", { replace: true });
  }

  return (
    <Menu
      style={{
        padding: 0,
      }}
      onClick={onClick}
      triggerSubMenuAction="click"
      mode="vertical"
      expandIcon={null}
      items={[
        {
          label: (
            <Avatar
              alt="Profile Avatar"
              src="/assets/svg/logo.svg"
              className="p-1 border"
            />
          ),
          key: "profile-menu",
          popupOffset: [-80, 50],
          children: [
            {
              label: "My Profile",
              key: "My Profile",
            },
            {
              label: "Change Password",
              key: "Change Password",
            },
            {
              label: "Create User",
              key: "Create User",
            },
            {
              label: "User Role",
              key: "User Role",
            },
            {
              label: <Button onClick={handleLogout}>Logout</Button>,
              key: "Logout",
            },
          ],
        },
      ]}
    />
  );
}

export default ProfileMenu;
