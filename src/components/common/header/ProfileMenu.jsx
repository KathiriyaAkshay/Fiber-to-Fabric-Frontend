import { Avatar, Button, Dropdown } from "antd";
import { api } from "../../../api";
import { Link as RotuerLink, useNavigate } from "react-router-dom";
import profilePlaceholder from "../../../assets/png/profile-placeholder.png";

function ProfileMenu() {
  const navigate = useNavigate();
  function handleLogout() {
    // remove authentication token from local storage
    localStorage.removeItem("authToken");

    // remove Authorization from api axios instance
    delete api.defaults.headers.common["Authorization"];

    navigate("/auth", { replace: true });
  }

  const items = [
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
      label: <RotuerLink to="/profile/user-roles">User Roles</RotuerLink>,
      key: "User Roles",
    },
    {
      label: <Button onClick={handleLogout}>Logout</Button>,
      key: "Logout",
    },
  ];

  return (
    <>
      <Dropdown
        menu={{
          items,
        }}
      >
        <Avatar
          alt="Profile Avatar"
          src={profilePlaceholder}
          className="cursor-pointer"
        />
      </Dropdown>
    </>
  );
}

export default ProfileMenu;
