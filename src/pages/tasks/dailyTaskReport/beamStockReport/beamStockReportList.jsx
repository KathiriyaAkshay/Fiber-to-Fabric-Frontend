import { Button, Flex, Input, Spin, Table, Typography } from "antd";
import { FilePdfOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getTaskListRequest } from "../../../../api/requests/task";
import { useCurrentUser } from "../../../../api/hooks/auth";
import {
  downloadUserPdf,
  getPDFTitleContent,
} from "../../../../lib/pdf/userPdf";
import { usePagination } from "../../../../hooks/usePagination";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { useContext, useState } from "react";
import useDebounce from "../../../../hooks/useDebounce";
// import { getSupervisorListRequest } from "../../../api/requests/users";

function BeamStockReportList() {
  const navigate = useNavigate();
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const { data: user } = useCurrentUser();
  const { company, companyId, financialYearEnd } = useContext(GlobalContext);
  const [search, setSearch] = useState("");
  const [bhidan, setBhidan] = useState("");

  const debouncedSearch = useDebounce(search, 500);
  const debouncedBhidan = useDebounce(bhidan, 500);
  console.log({ debouncedSearch, debouncedBhidan });

  const { data: taskListRes, isLoading: isLoadingTaskList } = useQuery({
    queryKey: [
      "task-assignment",
      "list",
      { company_id: companyId, page, pageSize, end: financialYearEnd },
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
    navigate("/tasks/daily-task-report/beam-stock-report/add");
  }

  //   function navigateToUpdate(id) {
  //     navigate(`/tasks/daily-task/update/${id}`);
  //   }

  function downloadPdf() {
    const { leftContent, rightContent } = getPDFTitleContent({ user, company });
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
      render: (text, record, index) => page * pageSize + index + 1,
    },
    {
      title: "Quality Name",
    },
    {
      title: "Req. eve. non pasarela beam",
    },
    {
      title: "T.N. pasarela beam",
    },
    {
      title: "T.N. pasarela short beam",
    },
    {
      title: "Req. Eve. pasarela beam",
    },
    {
      title: "Today's pasarela beam",
    },
    {
      title: "Today's pasarela short beam",
    },
    {
      title: "Bhidan of month",
    },
    {
      title: "N.pasarela secondary beam",
    },
    // {
    //   title: "Action",
    //   render: (taskDetails) => {
    //     const {
    //       createdAt,
    //       assign_time,
    //       task_detail,
    //       achievement,
    //       reason,
    //       status,
    //     } = taskDetails;
    //     return (
    //       <Space>
    //         <ViewDetailModal
    //           title="Task Report"
    //           details={[
    //             { title: "Date", value: dayjs(createdAt).format("DD/MM/YYYY") },
    //             { title: "Assigned Time", value: assign_time },
    //             { title: "Task", value: task_detail },
    //             { title: "Achievement", value: achievement },
    //             { title: "Reason", value: reason },
    //             { title: "Status", value: status },
    //           ]}
    //         />
    //         <Button
    //           onClick={() => {
    //             navigateToUpdate(taskDetails.id);
    //           }}
    //         >
    //           <EditOutlined />
    //         </Button>
    //         <DeleteTaskButton details={taskDetails} />
    //       </Space>
    //     );
    //   },
    //   key: "action",
    // },
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
          <h3 className="m-0 text-primary">Beam Stock Report</h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>
        <Flex align="center" gap={10}>
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Bhidan of month
            </Typography.Text>
            <Input
              value={bhidan}
              onChange={setBhidan}
              placeholder="Bhidan of month"
              style={{ width: "200px" }}
            />
          </Flex>
          <Input
            value={search}
            onChange={setSearch}
            placeholder="search"
            style={{ width: "200px" }}
          />
          <Button
            icon={<FilePdfOutlined />}
            type="primary"
            disabled={!taskListRes?.taskList?.rows?.length}
            onClick={downloadPdf}
          />
        </Flex>
      </div>
      {renderTable()}
    </div>
  );
}

export default BeamStockReportList;
