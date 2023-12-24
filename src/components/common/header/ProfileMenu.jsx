import { Avatar, Button, Menu, MenuItem } from "@mui/material";
import { useState } from "react";

function ProfileMenu() {
  const [anchorEl, setAnchorEl] = useState(null);
  const isOpenProfileMenu = Boolean(anchorEl);

  const openProfileMenu = (event) => {
    // setAnchorEl(event.currentTarget);
    if (anchorEl !== event.currentTarget) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleCloseProfileMenu = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <div>
        <Button
          aria-haspopup="true"
          onClick={openProfileMenu}
          onMouseOver={openProfileMenu}
          sx={{
            padding: 0,
          }}
        >
          <Avatar
            alt="Remy Sharp"
            src="/assets/svg/logo.svg"
            className="p-1 border"
          />
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={isOpenProfileMenu}
          onClose={handleCloseProfileMenu}
          MenuListProps={{
            onMouseLeave: handleCloseProfileMenu,
          }}
        >
          <MenuItem onClick={handleCloseProfileMenu}>my profile</MenuItem>
          <MenuItem onClick={handleCloseProfileMenu}>change password</MenuItem>
          <MenuItem onClick={handleCloseProfileMenu}>create user</MenuItem>
          <MenuItem onClick={handleCloseProfileMenu}>user role</MenuItem>
          <MenuItem onClick={handleCloseProfileMenu}>logout</MenuItem>
        </Menu>
      </div>
    </div>
  );
}

export default ProfileMenu;
