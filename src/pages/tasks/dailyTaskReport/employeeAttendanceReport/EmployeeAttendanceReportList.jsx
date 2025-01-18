import {
  Button,
  DatePicker,
  Flex,
  Input,
  message,
  Popconfirm,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  EditOutlined,
  FilePdfOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
// import { useCurrentUser } from "../../../../api/hooks/auth";
import ViewDetailModal from "../../../../components/common/modal/ViewDetailModal";
import { usePagination } from "../../../../hooks/usePagination";
import { useContext, useState } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import {
  getEmployeeAttendanceReportListRequest,
  updateEmployeeAttendanceReportRequest,
} from "../../../../api/requests/reports/employeeAttendance";
import DeleteEmployeeAttendanceReportButton from "../../../../components/tasks/employeeAttendance/DeleteEmployeeAttendanceReportButton";
import useDebounce from "../../../../hooks/useDebounce";
import GoBackButton from "../../../../components/common/buttons/GoBackButton";
import moment from "moment";

function disabledFutureDate(current) {
  return current && current > moment().endOf("day");
}

function EmployeeAttendanceReportList() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [toDate, setToDate] = useState();
  const debouncedToDate = useDebounce(
    toDate && dayjs(toDate).format("YYYY-MM-DD"),
    500
  );
  const [fromDate, setFromDate] = useState();
  const debouncedFromDate = useDebounce(
    fromDate && dayjs(fromDate).format("YYYY-MM-DD"),
    500
  );
  const { companyId } = useContext(GlobalContext);
  const navigate = useNavigate();
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  // const { data: user } = useCurrentUser();

  const { data: reportListRes, isLoading: isLoadingReportList } = useQuery({
    queryKey: [
      "reports/employee-attandance-report/list",
      {
        company_id: companyId,
        page,
        pageSize,
        search: debouncedSearch,
        toDate: debouncedToDate,
        fromDate: debouncedFromDate,
      },
    ],
    queryFn: async () => {
      const res = await getEmployeeAttendanceReportListRequest({
        companyId,
        params: {
          company_id: companyId,
          page,
          pageSize,
          search: debouncedSearch,
          toDate: debouncedToDate,
          fromDate: debouncedFromDate,
        },
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

  const {
    mutateAsync: updateEmployeeAttendanceReport,
    isPending: isLoadingUpdateEmployeeAttendance,
  } = useMutation({
    mutationFn: async ({ data, id }) => {
      const res = await updateEmployeeAttendanceReportRequest({
        id,
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["reports/employee-attandance-report/update"],
    onSuccess: (res) => {
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      navigate(-1);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message;
      if (errorMessage && typeof errorMessage === "string") {
        message.error(errorMessage);
      }
    },
  });

  const onConfirmWastage = async (id) => {
    const data = {
      is_confirm: true,
    };

    await updateEmployeeAttendanceReport({ data, id });
  };

  function downloadPdf() {
    // const { leftContent, rightContent } = getPDFTitleContent({ user, company });

    const body = reportListRes?.row?.map((report) => {
      const { id, createdAt, machine = {}, absent_employee_count } = report;
      const { machine_name, no_of_machines, no_of_employees } = machine;
      return [
        id,
        dayjs(createdAt).format("DD-MM-YYYY"),
        machine_name,
        no_of_machines,
        no_of_employees,
        absent_employee_count,
      ];
    });

    const tableTitle = [
      "ID",
      "Date",
      "Machine Name",
      "No. of machine",
      "No Of Emp.",
      "Absent Emp.",
    ];

    // Set localstorage item information
    localStorage.setItem("print-array", JSON.stringify(body));
    localStorage.setItem("print-title", "Employee Attendance Report List");
    localStorage.setItem("print-head", JSON.stringify(tableTitle));
    localStorage.setItem("total-count", "0");

    // downloadUserPdf({
    //   body,
    //   head: [
    //     [
    //       "ID",
    //       "Date",
    //       "Machine Name",
    //       "No. of machine",
    //       "No Of Emp.",
    //       "Absent Emp.",
    //     ],
    //   ],
    //   leftContent,
    //   rightContent,
    //   title: "Employee Attendance Report List",
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
      title: "Date",
      key: "createdAt",
      render: ({ createdAt }) => {
        return dayjs(createdAt).format("DD-MM-YYYY");
      },
    },
    {
      title: "Machine Name",
      key: "machine.machine_name",
      dataIndex: ["machine", "machine_name"],
    },
    {
      title: "No. of machine",
      dataIndex: ["machine", "no_of_machines"],
      key: "machine.no_of_machines",
    },
    {
      title: "No. of Emp.",
      dataIndex: ["machine", "no_of_employees"],
      key: "machine.no_of_employees",
    },
    {
      title: "Absent Emp.",
      dataIndex: "absent_employee_count",
      key: "absent_employee_count",
    },
    {
      title: "Shift Type",
      dataIndex: "shift",
      key: "shift",
    },
    {
      title: "Status",
      dataIndex: "is_confirm",
      key: "is_confirm",
      render: (text, record) =>
        text == false ? (
          <>
            <Popconfirm
              title="Employee Attendance Conformation"
              description="Are you sure you want to confirm this Entry ?"
              onConfirm={() => {
                onConfirmWastage(record?.id);
              }}
              okButtonProps={{
                loading: isLoadingUpdateEmployeeAttendance,
              }}
            >
              <div>
                <Tag color="red">Pending</Tag>
              </div>
            </Popconfirm>
          </>
        ) : (
          <div>
            <Tag color="green">Confirmed</Tag>
          </div>
        ),
    },
    {
      title: "Action",
      render: (reportDetails) => {
        const {
          machine = {},
          absent_employee_count,
          shift,
          createdAt,
          report_absentees,
        } = reportDetails;
        const { machine_name, no_of_machines, no_of_employees } = machine;
        const employeeNames = report_absentees?.map(
          (element) =>
            `${element?.user?.first_name} ${element?.user?.last_name} | (${element?.user?.username})`
        );
        const joinedEmployeeName = employeeNames.join(", ");
        return (
          <Space>
            <ViewDetailModal
              title="Machine List"
              details={[
                {
                  title: "Machine Name",
                  value: machine_name,
                },
                { title: "Machine No.", value: no_of_machines },
                { title: "No of Emp.", value: no_of_employees },
                { title: "Absent Employee", value: absent_employee_count },
                { title: "Attendance Type", value: shift },
                {
                  title: "Date",
                  value: dayjs(createdAt).format("DD-MM-YYYY"),
                },
                {
                  title: "Time",
                  value: dayjs(createdAt).format("h:mm:ss A"),
                },
                {
                  title: "Absent employee",
                  value: joinedEmployeeName,
                },
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
        dataSource={reportListRes?.row || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          current: page + 1,
          pageSize: pageSize,
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
          <GoBackButton />
          <h3 className="m-0 text-primary">Employees Attendance Report</h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>
        <Flex align="center" gap={10} wrap="wrap">
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              From
            </Typography.Text>
            <DatePicker
              allowClear={true}
              style={{
                width: "200px",
              }}
              format="YYYY-MM-DD"
              value={fromDate}
              onChange={setFromDate}
              disabledDate={disabledFutureDate}
            />
          </Flex>

          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">To</Typography.Text>
            <DatePicker
              allowClear={true}
              style={{
                width: "200px",
              }}
              format="YYYY-MM-DD"
              value={toDate}
              onChange={setToDate}
              disabledDate={disabledFutureDate}
            />
          </Flex>

          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "200px",
            }}
          />

          <Button
            className="flex-none"
            icon={<FilePdfOutlined />}
            type="primary"
            disabled={!reportListRes?.row?.length}
            onClick={downloadPdf}
          />
        </Flex>
      </div>
      {renderTable()}
    </div>
  );
}

export default EmployeeAttendanceReportList;
