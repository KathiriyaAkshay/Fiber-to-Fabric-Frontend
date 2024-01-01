import { Button } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

function CompanyList() {
  const navigate = useNavigate();

  function navigateToAddCompany() {
    navigate("/company/add");
  }

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <h2 className="m-0">Company List</h2>
        <Button onClick={navigateToAddCompany}>
          <PlusCircleOutlined />
        </Button>
      </div>
    </div>
  );
}

export default CompanyList;
