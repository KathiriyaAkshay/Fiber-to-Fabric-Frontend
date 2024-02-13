import { Button, Space, Spin, Table } from "antd";
import { EditOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useCompanyList } from "../../../api/hooks/company";
import { getTaskListRequest } from "../../../api/requests/task";
import ViewTaskDetailModal from "../../../components/tasks/ViewTaskDetailModal";
import DeleteTaskButton from "../../../components/tasks/DeleteTaskButton";

function DailyTaskList() {
  const navigate = useNavigate();

  const { data: companyListRes } = useCompanyList();

  const companyId = companyListRes?.rows?.[0]?.id;

  const { data: taskListRes, isLoading: isLoadingTaskList } = useQuery({
    queryKey: ["task-assignment", "List", companyId],
    queryFn: async () => {
      const res = await getTaskListRequest({ companyId });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  function navigateToAdd() {
    navigate("/tasks/daily-task/add");
  }

  function navigateToUpdate(id) {
    navigate(`/tasks/daily-task/update/${id}`);
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
      render: (taskDetails) => {
        return (
          <Space>
            <ViewTaskDetailModal details={taskDetails} />
            <Button
              onClick={() => {
                navigateToUpdate(taskDetails.id);
              }}
            >
              <EditOutlined />
            </Button>
            <DeleteTaskButton details={taskDetails} />
          </Space>
        );
      },
      key: "action",
    },
  ];

  function renderTable() {
    if (isLoadingTaskList) {
      return (
        <Spin tip="Loading" size="large">
          <div className="p-14" />
        </Spin>
      );
    }

    return (
      <Table
        dataSource={taskListRes?.taskList?.rows || []}
        columns={columns}
        rowKey={"id"}
      />
    );
  }

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <h2 className="m-0">Task List</h2>
        <Button onClick={navigateToAdd}>
          <PlusCircleOutlined />
        </Button>
      </div>
      {renderTable()}
    </div>
  );
}

export default DailyTaskList;
