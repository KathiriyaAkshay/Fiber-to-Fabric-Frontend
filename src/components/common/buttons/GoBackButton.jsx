import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { Link } from "react-router-dom";

function GoBackButton() {
  return (
    <Link to={-1}>
      <Button icon={<ArrowLeftOutlined />} />
    </Link>
  );
}

export default GoBackButton;
