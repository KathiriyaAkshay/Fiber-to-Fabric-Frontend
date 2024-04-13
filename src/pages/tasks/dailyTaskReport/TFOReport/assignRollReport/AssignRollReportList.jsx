import { Button, Flex, Input, Space, Spin, Table } from "antd";
import { EditOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useContext, useState } from "react";
import useDebounce from "../../../../../hooks/useDebounce";
import { GlobalContext } from "../../../../../contexts/GlobalContext";
import { usePagination } from "../../../../../hooks/usePagination";
import { getAssignRollReportListRequest } from "../../../../../api/requests/reports/assignRollReport";
import DeleteAssignRollReportButton from "../../../../../components/tasks/assignRollReport/DeleteAssignRollReportButton";

function AssignRollReportList() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const { companyId } = useContext(GlobalContext);
  const navigate = useNavigate();
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const { data: reportListRes, isLoading: isLoadingReportList } = useQuery({
    queryKey: [
      "reports/assign-roll-reports/list",
      {
        company_id: companyId,
        page,
        pageSize,
        search: debouncedSearch,
      },
    ],
    queryFn: async () => {
      const res = await getAssignRollReportListRequest({
        companyId,
        params: {
          company_id: companyId,
          page,
          pageSize,
          search: debouncedSearch,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  function navigateToAdd() {
    navigate("/tasks/daily-task-report/daily-tfo-report/assign-roll-yarn/add");
  }

  function navigateToUpdate(id) {
    navigate(
      `/tasks/daily-task-report/daily-tfo-report/assign-roll-yarn/update/${id}`
    );
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Employee Name",
      dataIndex: ["employee", "first_name"],
      key: "employee.first_name",
    },
    {
      title: "T.P.M",
      dataIndex: "tpm",
      key: "tpm",
    },
    {
      title: "Denier",
      render: ({ yarn_stock_company }) => {
        const {
          yarn_denier = 0,
          filament = 0,
          luster_type = "",
          yarn_color = "",
          yarn_Sub_type = "",
        } = yarn_stock_company;
        return `${yarn_denier}D/${filament}F (${yarn_Sub_type} ${luster_type} - ${yarn_color})`;
      },
      key: "denier",
    },
    {
      title: "Yarn Company",
      dataIndex: ["yarn_stock_company", "yarn_company_name"],
      key: "yarn_stock_company.yarn_company_name",
    },
    {
      title: "Rolls/Cartoon",
      dataIndex: "rolls",
      key: "rolls",
    },
    {
      title: "Weight/KG",
      dataIndex: "weight",
      key: "weight",
    },
    {
      title: "Action",
      render: (reportDetails) => {
        return (
          <Space>
            <Button
              onClick={() => {
                navigateToUpdate(reportDetails.id);
              }}
              icon={<EditOutlined />}
            />
            <DeleteAssignRollReportButton details={reportDetails} />
          </Space>
        );
      },
      key: "action",
    },
  ];

  function renderTable() {
    if (isLoadingReportList) {
      return (
        <Spin tip="Loading" size="large">
          <div className="p-14" />
        </Spin>
      );
    }

    return (
      <Table
        dataSource={reportListRes?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          total: reportListRes?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
      />
    );
  }

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary">Assign Roll List</h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>
        <Flex align="center" gap={10} wrap="wrap">
          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "200px",
            }}
          />
        </Flex>
      </div>
      {renderTable()}
    </div>
  );
}

export default AssignRollReportList;
