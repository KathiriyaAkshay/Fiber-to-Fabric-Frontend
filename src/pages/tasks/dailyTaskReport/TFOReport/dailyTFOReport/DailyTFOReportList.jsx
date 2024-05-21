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
  const { company, companyId, financialYearEnd } = useContext(GlobalContext);
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
        end: financialYearEnd,
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
          end: financialYearEnd,
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

    const body = reportListRes?.rows?.map((report) => {
      const {
        id,
        motor_type,
        yarn_stock_company = {},
        tpm = 0,
        load_date,
      } = report;
      const {
        yarn_denier = 0,
        filament = 0,
        luster_type = "",
        yarn_color = "",
        yarn_Sub_type = "",
      } = yarn_stock_company;
      return [
        id,
        motor_type,
        `${yarn_denier}D/${filament}F (${yarn_Sub_type} ${luster_type} - ${yarn_color})`,
        tpm,
        dayjs(load_date).format("DD-MM-YYYY"),
        dayjs(load_date).format("h:mm A"),
      ];
    });

    downloadUserPdf({
      body,
      head: [
        ["ID", "Motor Type", "Denier", "T.P.M.", "Load Date", "Load Time"],
      ],
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
      render: (text, record, index) => ((page * pageSize) + index) + 1
    },
    {
      title: "TFO Number", 
      dataIndex: "tfo_number", 

    }, 
    {
      title: "Motor Type",
      dataIndex: "motor_type",
      key: "motor_type",
    },
    {
      title: "Denier",
      render: ({ yarn_stock_company = {} }) => {
        const {
          yarn_denier = 0,
          filament = 0,
          luster_type = "",
          yarn_color = "",
          yarn_Sub_type = "",
        } = yarn_stock_company;
        return `${yarn_denier}D/${filament}F (${yarn_Sub_type} ${luster_type} - ${yarn_color})`;
      },
      key: "denier",
    },
    {
      title: "T.P.M.",
      dataIndex: "tpm",
      key: "tpm",
    },
    {
      title: "Load Date",
      key: "load_date",
      render: ({ load_date }) => {
        return dayjs(load_date).format("DD-MM-YYYY");
      },
    },
    {
      title: "Load Time",
      key: "load_time",
      render: ({ load_date }) => {
        return dayjs(load_date).format("h:mm A");
      },
    },
    {
      title: "Drop Date",
      key: "load_time",
      render: ({ load_date }) => {
        return dayjs(load_date).format("h:mm A");
      },
    },
    {
      title: "Drop time",
      key: "load_time",
      render: ({ load_date }) => {
        return dayjs(load_date).format("h:mm A");
      },
    },
    {
      title: "is Unload Motor",
      key: "load_time",
      render: ({ load_date }) => {
        return(
          <>
            <Tag color="red">Pending</Tag>
          </>
        )
      },
    },
    {
      title: "Any Problem",
      key: "load_time",
      render: ({ load_date }) => {
        return dayjs(load_date).format("h:mm A");
      },
    },
    // {
    //   title: "Drop Date",
    //   key: "drop_date",
    //   render: ({ drop_date }) => {
    //     return dayjs(drop_date).format("DD-MM-YYYY");
    //   },
    // },
    // {
    //   title: "Drop Time",
    //   key: "drop_time",
    //   render: ({ drop_date }) => {
    //     return dayjs(drop_date).format("h:mm A");
    //   },
    // },
    {
      title: "Action",
      render: (reportDetails) => {
        const {
          machine_name = "",
          machine_no = 0,
          motor_type = "",
          yarn_stock_company = {},
          tpm = 0,
          load_date,
        } = reportDetails;
        const { yarn_denier = 0 } = yarn_stock_company || {};
        return (
          <Space>
            <ViewDetailModal
              title="Report Card"
              details={[
                { title: "MACHINE NAME", value: machine_name },
                { title: "T.F.O NO.", value: machine_no },
                { title: "MOTOR TYPE", value: motor_type },
                { title: "DENIER", value: yarn_denier },
                { title: "TPM", value: tpm },
                {
                  title: "Load Date",
                  value: dayjs(load_date).format("DD-MM-YYYY"),
                },
                {
                  title: "Load Time",
                  value: dayjs(load_date).format("h:mm:ss A"),
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
            className="flex-none"
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

export default DailyTFOReportList;
