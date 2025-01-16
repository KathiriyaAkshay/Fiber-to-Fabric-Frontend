import {
  Button,
  DatePicker,
  Flex,
  Input,
  Space,
  Spin,
  Table,
  Typography,
} from "antd";
import {
  EditOutlined,
  PlusCircleOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import ViewDetailModal from "../../../../components/common/modal/ViewDetailModal";
import { usePagination } from "../../../../hooks/usePagination";
import { useContext, useState } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import useDebounce from "../../../../hooks/useDebounce";
// import { useCurrentUser } from "../../../../api/hooks/auth";
import GoBackButton from "../../../../components/common/buttons/GoBackButton";
import { getCheckTakaReportListRequest } from "../../../../api/requests/reports/checkTakaReport";
import DeleteCheckTakaReportButton from "../../../../components/tasks/checkTakaReport/DeleteCheckTakaReportButton";
import { formatDate } from "../../../../constants/time";
import moment from "moment";
import { getDisplayQualityName } from "../../../../constants/nameHandler";

function CheckTakaReportList() {
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
  // const { data: user } = useCurrentUser();
  const { companyId } = useContext(GlobalContext);
  const navigate = useNavigate();
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  function disabledFutureDate(current) {
    // Disable dates after today
    return current && current > moment().endOf("day");
  }

  const { data: reportListRes, isLoading: isLoadingReportList } = useQuery({
    queryKey: [
      "reports/check-taka-report/list",
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
      const res = await getCheckTakaReportListRequest({
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
    navigate("/tasks/daily-task-report/check-taka-and-report/add");
  }

  function navigateToUpdate(id) {
    navigate(`/tasks/daily-task-report/check-taka-and-report/update/${id}`);
  }

  function downloadPdf() {
    // const { leftContent, rightContent } = getPDFTitleContent({ user, company });
    const body = reportListRes?.rows?.map((report, index) => {
      const {
        report_date,
        employee_name = "",
        machine_name = "",
        machine_no = 0,
        taka_no = 0,
      } = report;
      return [
        page * pageSize + index + 1,
        formatDate(report_date),
        employee_name,
        machine_name,
        machine_no,
        taka_no,
      ];
    });

    const tableTitle = [
      "ID",
      "Date",
      "Employee",
      "Machine",
      "Machine No",
      "Taka No",
    ];

    // Set localstorage item information
    localStorage.setItem("print-array", JSON.stringify(body));
    localStorage.setItem("print-title", "Taka Report List");
    localStorage.setItem("print-head", JSON.stringify(tableTitle));
    localStorage.setItem("total-count", "0");

    // downloadUserPdf({
    //   body,
    //   head: [["ID", "Date", "Employee", "Machine", "Machine No", "Taka No"]],
    //   leftContent,
    //   rightContent,
    //   title: "Taka Report List",
    // });
    window.open("/print");
  }

  const columns = [
    {
      key: "id",
      render: (text, record, index) => page * pageSize + index + 1,
      title: "ID",
    },
    {
      title: "Date",
      key: "report_date",
      render: ({ report_date }) => formatDate(report_date),
    },
    {
      title: "Employee",
      dataIndex: "employee_name",
      key: "employee_name",
      render: (text, record) =>
        `${record?.employee?.first_name} ${record?.employee?.first_name} | ( ${record?.employee?.username} )`,
    },
    {
      title: "Machine",
      dataIndex: "machine_name",
      key: "machine_name",
    },
    {
      title: "Machine No",
      dataIndex: "machine_no",
      key: "machine_no",
    },
    {
      title: "Taka No",
      dataIndex: "taka_no",
      key: "taka_no",
    },
    {
      title: "Quality",
      dataIndex: "quality",
      key: "quality",
      render: (text, record) => {
        return <div>{getDisplayQualityName(record?.inhouse_quality)}</div>;
      },
    },
    {
      title: "Problem",
      dataIndex: "problem",
      key: "problem",
    },
    {
      title: "Fault",
      dataIndex: "fault",
      key: "fault",
    },
    {
      title: "Action",
      render: (reportDetails) => {
        const {
          report_date,
          employee_name = "",
          machine_name = "",
          machine_no = 0,
          taka_no = 0,
          inhouse_quality = {},
          fault,
          problem,
        } = reportDetails;

        return (
          <Space>
            <ViewDetailModal
              title="Taka Report"
              className="capitalize"
              details={[
                { title: "Date", value: formatDate(report_date) },
                { title: "Employee", value: employee_name },
                { title: "Machine", value: machine_name },
                { title: "Machine No", value: machine_no },
                { title: "Taka No", value: taka_no },
                { title: "Quality", value: inhouse_quality?.quality_name },
                { title: "Problem", value: problem },
                { title: "Fault", value: fault },
              ]}
            />
            <Button
              onClick={() => {
                navigateToUpdate(reportDetails.id);
              }}
            >
              <EditOutlined />
            </Button>
            <DeleteCheckTakaReportButton details={reportDetails} />
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
          current: page + 1,
          pageSize: pageSize,
          total: reportListRes?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
        className="overflow-auto"
      />
    );
  }

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <GoBackButton />
          <h3 className="m-0 text-primary">Taka Report</h3>
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
            icon={<FilePdfOutlined />}
            type="primary"
            disabled={!reportListRes?.rows?.length}
            onClick={downloadPdf}
          />
        </Flex>
      </div>
      {renderTable()}
    </div>
  );
}

export default CheckTakaReportList;
