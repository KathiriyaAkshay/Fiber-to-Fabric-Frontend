import { Button, Space, Spin, Table } from "antd";
import {
  EditOutlined,
  FilePdfOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useCurrentUser } from "../../../../api/hooks/auth";
import {
  downloadUserPdf,
  getPDFTitleContent,
} from "../../../../lib/pdf/userPdf";
import ViewDetailModal from "../../../../components/common/modal/ViewDetailModal";
import { usePagination } from "../../../../hooks/usePagination";
import { useContext } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { getEmployeeAttendanceReportListRequest } from "../../../../api/requests/reports/employeeAttendance";
import DeleteEmployeeAttendanceReportButton from "../../../../components/tasks/employeeAttendance/DeleteEmployeeAttendanceReportButton";

function EmployeeAttendanceReportList() {
  const { company, companyId } = useContext(GlobalContext);
  const navigate = useNavigate();
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const { data: user } = useCurrentUser();

  const { data: reportListRes, isLoading: isLoadingReportList } = useQuery({
    queryKey: [
      "reports/employee-attandance-report/list",
      { company_id: companyId, page, pageSize },
    ],
    queryFn: async () => {
      const res = await getEmployeeAttendanceReportListRequest({
        companyId,
        params: { company_id: companyId, page, pageSize },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  function navigateToAdd() {
    navigate("/tasks/daily-task-report/employees-attendance-report/add");
  }

  function navigateToUpdate(id) {
    navigate(
      `/tasks/daily-task-report/employees-attendance-report/update/${id}`
    );
  }

  function downloadPdf() {
    const { leftContent, rightContent } = getPDFTitleContent({ user, company });

    const body = reportListRes?.rows?.map((report) => {
      const { id, report_date, notes } = report;
      return [
        id,
        dayjs(report_date).format("DD-MM-YYYY"),
        dayjs(report_date).format("h:mm:ss A"),
        notes,
      ];
    });

    downloadUserPdf({
      body,
      head: [["ID", "Date", "Time", "Notes"]],
      leftContent,
      rightContent,
      title: "Employee Attendance Report List",
    });
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Date",
      key: "report_date",
      render: ({ report_date }) => {
        return dayjs(report_date).format("DD-MM-YYYY");
      },
    },
    {
      title: "Time",
      key: "report_time",
      render: ({ report_date }) => {
        return dayjs(report_date).format("h:mm:ss A");
      },
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
    },
    {
      title: "Action",
      render: (reportDetails) => {
        const { report_date, notes } = reportDetails;
        return (
          <Space>
            <ViewDetailModal
              title="Machine List"
              details={[
                {
                  title: "Date",
                  value: dayjs(report_date).format("DD-MM-YYYY"),
                },
                {
                  title: "Time",
                  value: dayjs(report_date).format("h:mm:ss A"),
                },
                { title: "Notes", value: notes },
              ]}
            />
            <Button
              onClick={() => {
                navigateToUpdate(reportDetails.id);
              }}
            >
              <EditOutlined />
            </Button>
            <DeleteEmployeeAttendanceReportButton details={reportDetails} />
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
          <h3 className="m-0 text-primary">Employees Attendance Report</h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>
        <Button
          icon={<FilePdfOutlined />}
          type="primary"
          disabled={!reportListRes?.rows?.length}
          onClick={downloadPdf}
        />
      </div>
      {renderTable()}
    </div>
  );
}

export default EmployeeAttendanceReportList;
