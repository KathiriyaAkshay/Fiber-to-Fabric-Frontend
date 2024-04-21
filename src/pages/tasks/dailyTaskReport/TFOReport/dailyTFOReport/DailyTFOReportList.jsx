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
import { FilePdfOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useContext, useState } from "react";
import useDebounce from "../../../../../hooks/useDebounce";
import { GlobalContext } from "../../../../../contexts/GlobalContext";
import { usePagination } from "../../../../../hooks/usePagination";
import { useCurrentUser } from "../../../../../api/hooks/auth";
import { getDailyTFOReportListRequest } from "../../../../../api/requests/reports/dailyTFOReport";
import {
  downloadUserPdf,
  getPDFTitleContent,
} from "../../../../../lib/pdf/userPdf";
import ViewDetailModal from "../../../../../components/common/modal/ViewDetailModal";

function DailyTFOReportList() {
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
  const { company, companyId } = useContext(GlobalContext);
  const navigate = useNavigate();
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const { data: user } = useCurrentUser();

  const { data: reportListRes, isLoading: isLoadingReportList } = useQuery({
    queryKey: [
      "reports/daily-tfo-report/list",
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
      const res = await getDailyTFOReportListRequest({
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
    navigate("/tasks/daily-task-report/daily-tfo-report/daily-tfo/add");
  }

  function downloadPdf() {
    const { leftContent, rightContent } = getPDFTitleContent({ user, company });

    const body = reportListRes?.row?.map((report) => {
      const { id, createdAt, machine = {} } = report;
      const { machine_name, no_of_machines } = machine;
      return [
        id,
        dayjs(createdAt).format("DD-MM-YYYY"),
        machine_name,
        no_of_machines,
      ];
    });

    downloadUserPdf({
      body,
      head: [["ID", "Date", "Machine Name", "No. of machine"]],
      leftContent,
      rightContent,
      title: "Daily TFO List",
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
      title: "Shift Type",
      dataIndex: "shift",
      key: "shift",
    },
    {
      title: "Action",
      render: (reportDetails) => {
        const { machine = {}, createdAt } = reportDetails;
        const { machine_name, no_of_machines } = machine;
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
                {
                  title: "Date",
                  value: dayjs(createdAt).format("DD-MM-YYYY"),
                },
                {
                  title: "Time",
                  value: dayjs(createdAt).format("h:mm:ss A"),
                },
              ]}
            />
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
          <h3 className="m-0 text-primary">T.F.O Drop Report List</h3>
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

export default DailyTFOReportList;
