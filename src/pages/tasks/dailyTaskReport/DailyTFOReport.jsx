import { Link, Outlet, useLocation } from "react-router-dom";
import { Menu, Flex, Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import GoBackButton from "../../../components/common/buttons/GoBackButton";

const items = [
  {
    label: <Link to="daily-tfo">Daily T.F.O</Link>,
    key: "daily-tfo",
  },
  {
    label: <Link to="winding-report">Winding Report</Link>,
    key: "winding-report",
  },
  {
    label: <Link to="roll-stock-report">Roll Stock Report</Link>,
    key: "roll-stock-report",
  },
  {
    label: <Link to="assign-roll-yarn">Assign Roll/Yarn</Link>,
    key: "assign-roll-yarn",
  },
];

function DailyTFOReport() {
  const location = useLocation();

  const selectedKeys = items
    .filter((item) =>
      location.pathname.includes(`/daily-tfo-report/${item.key}`)
    )
    .map((item) => item.key);

  return (
    <>
      <Flex align="center" gap={10} className="mx-2">
        <GoBackButton />
        <Menu selectedKeys={selectedKeys} mode="horizontal" items={items} />
      </Flex>
      <Outlet />
    </>
  );
}

export default DailyTFOReport;
