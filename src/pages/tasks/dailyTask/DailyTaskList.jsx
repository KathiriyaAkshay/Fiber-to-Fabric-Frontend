import { Button, Space, Spin, Table } from "antd";
import {
  EditOutlined,
  FilePdfOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getTaskListRequest } from "../../../api/requests/task";
import DeleteTaskButton from "../../../components/tasks/DeleteTaskButton";
// import { useCurrentUser } from "../../../api/hooks/auth";
import dayjs from "dayjs";
// import { downloadUserPdf, getPDFTitleContent } from "../../../lib/pdf/userPdf";
import ViewDetailModal from "../../../components/common/modal/ViewDetailModal";
import { usePagination } from "../../../hooks/usePagination";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { useContext } from "react";
// import { getSupervisorListRequest } from "../../../api/requests/users";

function DailyTaskList() {
  const navigate = useNavigate();
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  // const { data: user } = useCurrentUser();
  const { companyId, financialYearEnd } = useContext(GlobalContext);

  // const { data: supervisorListRes, isLoading: isLoadingSupervisorList } =
  //   useQuery({
  //     queryKey: ["supervisor", "list", { company_id: companyId }],
  //     queryFn: async () => {
  //       const res = await getSupervisorListRequest({
  //         params: { company_id: companyId },
  //       });
  //       return res.data?.data;
  //     },
  //     enabled: Boolean(companyId),
  //   });

  const { data: taskListRes, isLoading: isLoadingTaskList } = useQuery({
    queryKey: [
      "task-assignment",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
        end: financialYearEnd,
      },
    ],
    queryFn: async () => {
      const res = await getTaskListRequest({
        companyId,
        params: {
          company_id: companyId,
          page,
          pageSize,
          end: financialYearEnd,
        },
      });
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

  function downloadPdf() {
    // const { leftContent, rightContent } = getPDFTitleContent({ user, company });
    const body = taskListRes?.taskList?.rows?.map((task) => {
      const { id, task_detail, assign_time, achievement, reason, status } =
        task;
      return [id, task_detail, assign_time, achievement, reason, status];
    });

    const tableTitle = [
      "ID",
      "Task Detail",
      "Assigned Time",
      "Achievement",
      "Reason",
      "Status",
    ];

    // Set localstorage item information
    localStorage.setItem("print-array", JSON.stringify(body));
    localStorage.setItem("print-title", "Assign Task List");
    localStorage.setItem("print-head", JSON.stringify(tableTitle));
    localStorage.setItem("total-count", "0");

    // downloadUserPdf({
    //   body,
    //   head: [
    //     [
    //       "ID",
    //       "Task Detail",
    //       "Assigned Time",
    //       "Achievement",
    //       "Reason",
    //       "Status",
    //     ],
    //   ],
    //   leftContent,
    //   rightContent,
    //   title: "Assign Task List",
    // });

    window.open("/print");
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => page * pageSize + index + 1,
    },
    {
      title: "Task Detail",
      dataIndex: "task_detail",
      key: "task_detail",
    },
    {
      title: "Assigned Time",
      dataIndex: "assign_time",
      key: "assign_time",
    },
    {
      title: "Achievement",
      dataIndex: "achievement",
      key: "achievement",
      render: (text) => (text == null ? "-" : text),
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      render: (text) => (text == null ? "-" : text),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Action",
      render: (taskDetails) => {
        const {
          createdAt,
          assign_time,
          task_detail,
          achievement,
          reason,
          status,
        } = taskDetails;
        return (
          <Space>
            <ViewDetailModal
              title="Task Report"
              details={[
                { title: "Date", value: dayjs(createdAt).format("DD/MM/YYYY") },
                { title: "Assigned Time", value: assign_time },
                { title: "Task", value: task_detail },
                { title: "Achievement", value: achievement },
                { title: "Reason", value: reason },
                { title: "Status", value: status },
              ]}
            />
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
        pagination={{
          total: taskListRes?.taskList?.count || 0,
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
          <h3 className="m-0 text-primary">Task List</h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>
        <Button
          icon={<FilePdfOutlined />}
          type="primary"
          disabled={!taskListRes?.taskList?.rows?.length}
          onClick={downloadPdf}
        />
      </div>
      {renderTable()}
    </div>
  );
}

export default DailyTaskList;
