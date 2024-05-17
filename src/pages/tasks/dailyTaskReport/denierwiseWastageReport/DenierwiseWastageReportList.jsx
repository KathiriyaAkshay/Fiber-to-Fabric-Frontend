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
import { EditOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import ViewDetailModal from "../../../../components/common/modal/ViewDetailModal";
import { usePagination } from "../../../../hooks/usePagination";
import { useContext, useState } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import useDebounce from "../../../../hooks/useDebounce";
import { getDenierwiseWastageReportListRequest } from "../../../../api/requests/reports/denierwiseWastageReport";
import DeleteDenierwiseWastageReportButton from "../../../../components/tasks/denierwiseWastageReport/DeleteDenierwiseWastageReportButton";
import GoBackButton from "../../../../components/common/buttons/GoBackButton";

function DenierwiseWastageReportList() {
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

  const { data: reportListRes, isLoading: isLoadingReportList } = useQuery({
    queryKey: [
      "reports/denierwise-wastage-report/list",
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
      const res = await getDenierwiseWastageReportListRequest({
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
    navigate("/tasks/daily-task-report/denierwise-wastage-report/add");
  }

  function navigateToUpdate(id) {
    navigate(`/tasks/daily-task-report/denierwise-wastage-report/update/${id}`);
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => ((page * pageSize) + index )+ 1,
    },
    {
      title: "Date",
      key: "report_date",
      render: ({ report_date }) => {
        return dayjs(report_date).format("DD-MM-YYYY");
      },
    },
    {
      title: "Denier/Filament",
      key: "denier",
      render: ({ yarn_stock_company = {} }) => {
        const { filament = 0, yarn_denier = 0 } = yarn_stock_company;
        return `${yarn_denier}/${filament}`;
      },
    },
    {
      title: "Machine",
      dataIndex: ["machine", "machine_name"],
      key: "machine.machine_name",
    },
    {
      title: "Wastage(KG)",
      dataIndex: "wastage",
      key: "wastage",
      render: (text) => <div className="red-option-text">{text}</div>,
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
    },
    {
      title: "Action",
      render: (reportDetails) => {
        const {
          machine = {},
          wastage,
          report_date,
          notes,
          yarn_stock_company = {},
        } = reportDetails;

        const { filament = 0, yarn_denier = 0 } = yarn_stock_company;
        const { machine_name } = machine;
        return (
          <Space>
            <ViewDetailModal
              title="Denierwise wastage report"
              details={[
                {
                  title: "Date",
                  value: dayjs(report_date).format("DD-MM-YYYY"),
                },
                {
                  title: "Machines",
                  value: machine_name,
                },
                {
                  title: "Denier/Filament",
                  value: `${yarn_denier}/${filament}`,
                },
                {
                  title: "Wastage",
                  value: wastage,
                },
                {
                  title: "Notes",
                  value: notes,
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
            <DeleteDenierwiseWastageReportButton details={reportDetails} />
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
          <GoBackButton />
          <h3 className="m-0 text-primary">Dennier Wastage Report</h3>
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
        </Flex>
      </div>
      {renderTable()}
    </div>
  );
}

export default DenierwiseWastageReportList;
