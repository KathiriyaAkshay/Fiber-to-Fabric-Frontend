import { Button, Link as MUILink, Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";

function MenubarItem({ title, path, children, index, parentPath = "" }) {
  const concatedPath = parentPath ? `${parentPath}/${path}` : path;
  const [anchorEl, setAnchorEl] = useState(null);
  const isOpenSubMenu = Boolean(anchorEl);

  const openSubMenu = (event) => {
    // Do not render menu if have only one item that is index page
    if (children.length === 1 && children[0]?.index) return;
    setAnchorEl(event.currentTarget);
    if (anchorEl !== event.currentTarget) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleCloseSubMenu = () => {
    setAnchorEl(null);
  };

  console.log(children);

  if (index) return null;

  if (children && children.length) {
    return (
      <div>
        <Button
          aria-haspopup="true"
          onClick={openSubMenu}
          onMouseOver={openSubMenu}
          // onMouseEnter={openSubMenu}
          // onMouseLeave={handleCloseSubMenu}
          sx={{
            padding: 0,
            justifyContent: "flex-start",
          }}
        >
          <MUILink
            as={RouterLink}
            to={concatedPath}
            key={path}
            sx={{ textDecoration: "none" }}
          >
            {title}
          </MUILink>
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={isOpenSubMenu}
          onClose={handleCloseSubMenu}
          MenuListProps={{
            onMouseLeave: handleCloseSubMenu,
          }}
        >
          {children.map((data) => {
            if (data.index) return null;
            return (
              <MenuItem onClick={handleCloseSubMenu} key={data.path}>
                <MenubarItem {...data} parentPath={concatedPath} />
              </MenuItem>
            );
          })}
        </Menu>
      </div>
    );
  }

  return (
    <Button>
      <MUILink
        as={RouterLink}
        to={concatedPath}
        key={path}
        sx={{ textDecoration: "none" }}
      >
        {title}
      </MUILink>
    </Button>
  );
}

export default MenubarItem;
