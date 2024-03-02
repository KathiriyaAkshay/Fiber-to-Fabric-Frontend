import { Avatar, Button, Dropdown } from "antd";
import { api } from "../../../api";
import { Link as RotuerLink, useNavigate } from "react-router-dom";
import profilePlaceholder from "../../../assets/png/profile-placeholder.png";
import ProfileDetailModal from "../modal/ProfileDetailModal";

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
      label: <ProfileDetailModal />,
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
      label: <RotuerLink to="/profile/user-activity">User Activity</RotuerLink>,
      key: "User Activity",
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
        trigger={["click"]}
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
