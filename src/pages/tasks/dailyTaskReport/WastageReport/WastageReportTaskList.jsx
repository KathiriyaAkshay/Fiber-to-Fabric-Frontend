import {
  Button,
  DatePicker,
  Flex,
  Input,
  Space,
  Spin,
  Table,
  Tag,
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
import { getWastageReportTaskListRequest } from "../../../../api/requests/reports/wastageReportTask";
import DeleteWastageReportTaskButton from "../../../../components/tasks/WastageReport/DeleteWastageReportTaskButton";
import GoBackButton from "../../../../components/common/buttons/GoBackButton";

function WastageReportTaskList() {
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

  const { data: reportListRes, isLoading: isLoadingReportList } = useQuery({
    queryKey: [
      "reports/wastage-report-task/list",
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
      const res = await getWastageReportTaskListRequest({
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
    navigate("/tasks/daily-task-report/wastage-report/add");
  }

  function navigateToUpdate(id) {
    navigate(`/tasks/daily-task-report/wastage-report/update/${id}`);
  }

  function downloadPdf() {
    // const { leftContent, rightContent } = getPDFTitleContent({ user, company });
    const body = reportListRes?.rows?.map((report) => {
      const {
        id,
        createdAt,
        assign_time,
        machine_type,
        floor,
        wastage,
        notes,
        comment,
        status,
      } = report;
      return [
        id,
        dayjs(createdAt).format("DD-MM-YYYY"),
        dayjs(assign_time).format("HH:mm:ss"),
        machine_type,
        floor,
        wastage,
        notes,
        comment,
        status,
      ];
    });

    const tableTitle = [
      "ID",
      "Date",
      "Assigned Time",
      "Machine Type",
      "Floor",
      "wastage(in kgs)",
      "Note",
      "Comment",
      "Status",
    ];

    // Set localstorage item information
    localStorage.setItem("print-array", JSON.stringify(body));
    localStorage.setItem("print-title", "Wastage Report List");
    localStorage.setItem("print-head", JSON.stringify(tableTitle));
    localStorage.setItem("total-count", "0");

    // downloadUserPdf({
    //   body,
    //   head: [
    //     [
    //       "ID",
    //       "Date",
    //       "Assigned Time",
    //       "Machine Type",
    //       "Floor",
    //       "wastage(in kgs)",
    //       "Note",
    //       "Comment",
    //       "Status",
    //     ],
    //   ],
    //   leftContent,
    //   rightContent,
    //   title: "Wastage Report List",
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
      title: "Assigned Time",
      key: "assign_time",
      render: ({ assign_time }) => {
        return dayjs(assign_time).format("HH:mm:ss");
      },
    },
    {
      title: "Machine Type",
      dataIndex: "machine_type",
      key: "machine_type",
    },
    {
      title: "Floor",
      dataIndex: "floor",
      key: "floor",
    },
    {
      title: "Machine",
      dataIndex: "machine_name",
      key: "machine_name",
    },
    {
      title: "Machine From",
      dataIndex: "machine_from",
      key: "machine_from",
    },
    {
      title: "Machine To",
      dataIndex: "machine_to",
      key: "machine_to",
    },
    {
      title: "wastage(in kgs)",
      dataIndex: "wastage",
      key: "wastage",
    },
    {
      title: "Wastage (%)",
      dataIndex: "wastage_percent",
      key: "wastage_percent",
    },
    {
      title: "Note",
      dataIndex: "notes",
      key: "notes",
    },
    {
      title: "Reported Date",
      key: "report_date",
      render: ({ report_date }) => {
        return report_date ? dayjs(report_date).format("DD-MM-YYYY") : null;
      },
    },
    {
      title: "Comment",
      dataIndex: "comment",
      key: "comment",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text) =>
        text == "pending" ? <Tag color="red">{text}</Tag> : null,
    },
    {
      title: "Action",
      render: (reportDetails) => {
        const {
          createdAt,
          user = {},
          assign_time,
          machine_type,
          floor,
          notes,
          machine_from,
          machine_to,
          machine_name,
        } = reportDetails;
        const daysOfWeek = [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ];
        let weekly = [];
        daysOfWeek.forEach((day) => {
          if (reportDetails[day] === true) {
            // capitalize
            weekly.push(day.charAt(0).toUpperCase() + day.slice(1));
          }
        });
        return (
          <Space>
            <ViewDetailModal
              title="Wastage Report"
              className="capitalize"
              details={[
                {
                  title: "Assign Supervisor",
                  value: `${user?.first_name} ${user?.last_name} | ( ${user?.username} )`,
                },
                {
                  title: "Date",
                  value: dayjs(createdAt).format("DD-MM-YYYY"),
                },
                {
                  title: "Assign time",
                  value: dayjs(assign_time).format("HH:mm:ss"),
                },
                { title: "Machine Type", value: machine_type },
                { title: "Machine Name", value: machine_name },
                { title: "Machine From", value: machine_from },
                { title: "Machine To", value: machine_to },
                { title: "Floor", value: floor },
                {
                  title: "Weekly",
                  value: weekly.join(", "),
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
            <DeleteWastageReportTaskButton details={reportDetails} />
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
        summary={() => {
          return (
            <>
              <Table.Summary.Row className="font-semibold">
                <Table.Summary.Cell>Total</Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell>
                  <Typography.Text>{100}</Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <Typography.Text>{100}</Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
              </Table.Summary.Row>
            </>
          );
        }}
      />
    );
  }

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <GoBackButton />
          <h3 className="m-0 text-primary">Wastage Report List</h3>
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

export default WastageReportTaskList;
