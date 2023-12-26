import { Menu } from "antd";
import { menubarOptionsList } from "../../../constants/menu";

function Menubar() {
  const onClick = (e) => {
    console.log("click", e);
  };

  return (
    <Menu onClick={onClick} mode="horizontal" items={menubarOptionsList} />
  );
}

export default Menubar;
