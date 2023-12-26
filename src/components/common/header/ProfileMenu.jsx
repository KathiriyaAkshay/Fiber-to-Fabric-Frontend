import { Avatar, Menu } from "antd";

function ProfileMenu() {
  const onClick = (e) => {
    console.log("click", e);
  };

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
              label: "Logout",
              key: "Logout",
            },
          ],
        },
      ]}
    />
  );
}

export default ProfileMenu;
