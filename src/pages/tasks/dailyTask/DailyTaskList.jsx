import { Button, Space, Spin, Table } from "antd";
import {
  EditOutlined,
  FilePdfOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useCompanyList } from "../../../api/hooks/company";
import { getTaskListRequest } from "../../../api/requests/task";
import ViewTaskDetailModal from "../../../components/tasks/ViewTaskDetailModal";
import DeleteTaskButton from "../../../components/tasks/DeleteTaskButton";
import { useCurrentUser } from "../../../api/hooks/auth";
import dayjs from "dayjs";
import { downloadUserPdf } from "../../../lib/pdf/userPdf";
// import { getSupervisorListRequest } from "../../../api/requests/users";

function DailyTaskList() {
  const navigate = useNavigate();

  const { data: user } = useCurrentUser();
  const { data: companyListRes } = useCompanyList();

  const companyId = companyListRes?.rows?.[0]?.id;

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
    queryKey: ["task-assignment", "list", companyId],
    queryFn: async () => {
      const res = await getTaskListRequest({
        companyId,
        params: { company_id: companyId },
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
    if (!user) return;
    const companyName = companyListRes?.rows?.[0]?.company_name;
    const {
      first_name = "YASH",
      last_name = "PATEL",
      address = "SURAT",
      mobile = "+918980626669",
      gst_no = "GST123456789000",
    } = user;
    const leftContent = `
    Name:- ${first_name} ${last_name}
    Address:- ${address}
    Created Date:- ${dayjs().format("DD-MM-YYYY")}
    `;

    const rightContent = `
    Company Name:- ${companyName}
    Company Contact:- ${mobile}
    GST No.:- ${gst_no}
    `;

    const body = taskListRes?.taskList?.rows?.map((task) => {
      const { id, task_detail, assign_time, achievement, reason, status } =
        task;
      return [id, task_detail, assign_time, achievement, reason, status];
    });

    downloadUserPdf({
      body,
      head: [
        [
          "ID",
          "Task Detail",
          "Assigned Time",
          "Achievement",
          "Reason",
          "Status",
        ],
      ],
      leftContent,
      rightContent,
      title: "Assign Task List",
    });
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
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
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "Status",
      dataIndex: "Status",
      key: "status",
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
