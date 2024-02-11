import { Button, Space, Spin, Table } from "antd";
import { EditOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getYarnStockCompanyListRequest } from "../../../api/requests/yarnStock";
import DeleteYarnStockCompany from "../../../components/yarnStock/yarnStockCompany/DeleteYarnStockCompany";
import { useCompanyId } from "../../../api/hooks/company";

function YarnStockCompanyList() {
  const navigate = useNavigate();
  const { companyId } = useCompanyId();

  const { data: ysCompanyListRes, isLoading: isLoadingYSCompanyList } =
    useQuery({
      queryKey: ["yarn-stock", "company", "list", companyId],
      queryFn: async () => {
        const res = await getYarnStockCompanyListRequest({
          companyId,
          params: {},
        });
        return res.data?.data;
      },
      enabled: Boolean(companyId),
    });

  function navigateToAdd() {
    navigate("/yarn-stock-company/company-list/add");
  }

  function navigateToUpdate(id) {
    navigate(`/yarn-stock-company/company-list/update/${id}`);
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "No of Employee",
      dataIndex: "no_of_employees",
      key: "no_of_employees",
    },
    {
      title: "Action",
      render: (yscDetails) => {
        return (
          <Space>
            <Button
              onClick={() => {
                navigateToUpdate(yscDetails.id);
              }}
            >
              <EditOutlined />
            </Button>
            <DeleteYarnStockCompany details={yscDetails} />
          </Space>
        );
      },
      key: "action",
    },
  ];

  function renderTable() {
    if (isLoadingYSCompanyList) {
      return (
        <Spin tip="Loading" size="large">
          <div className="p-14" />
        </Spin>
      );
    }

    return (
      <Table
        dataSource={ysCompanyListRes?.yarnComanyList?.rows || []}
        columns={columns}
        rowKey={"id"}
      />
    );
  }

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <h2 className="m-0">Yarn Companies List</h2>
        <Button onClick={navigateToAdd}>
          <PlusCircleOutlined />
        </Button>
      </div>
      {renderTable()}
    </div>
  );
}

export default YarnStockCompanyList;
