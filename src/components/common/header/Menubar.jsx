import { menubarOptionsList } from "../../../constants/menu";
import MenubarItem from "./MenubarItem";

function Menubar() {
  return (
    <div className="flex gap-3 p-2 shadow">
      {menubarOptionsList.map((data) => {
        return <MenubarItem {...data} key={data.path} />;
      })}
    </div>
  );
}

export default Menubar;
