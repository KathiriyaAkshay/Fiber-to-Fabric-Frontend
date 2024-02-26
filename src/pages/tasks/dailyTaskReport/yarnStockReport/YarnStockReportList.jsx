import { Button, Space, Spin, Table } from "antd";
import { FilePdfOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useCompanyList } from "../../../../api/hooks/company";
import { useCurrentUser } from "../../../../api/hooks/auth";
import { downloadUserPdf } from "../../../../lib/pdf/userPdf";
import { getYarnStockReportListRequest } from "../../../../api/requests/reports/yarnStockReport";
import DeleteYarnStockReportButton from "../../../../components/tasks/yarnStockReport/DeleteYarnStockReportButton";
import { usePagination } from "../../../../hooks/usePagination";

function YarnStockReportList() {
  const navigate = useNavigate();
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const { data: user } = useCurrentUser();
  const { data: companyListRes } = useCompanyList();

  const companyId = companyListRes?.rows?.[0]?.id;

  const { data: reportListRes, isLoading: isLoadingReportList } = useQuery({
    queryKey: [
      "yarn-stock",
      "yarn-report",
      "list",
      { company_id: companyId, page, pageSize },
    ],
    queryFn: async () => {
      const res = await getYarnStockReportListRequest({
        companyId,
        params: { company_id: companyId, page, pageSize },
      });
      return res.data?.data?.yarnStockReportList;
    },
    enabled: Boolean(companyId),
  });

  function navigateToAdd() {
    navigate("/tasks/daily-task-report/yarn-stock-report/add");
  }

  // function navigateToUpdate(id) {
  //   navigate(`/tasks/daily-task-report/yarn-stock-report/update/${id}`);
  // }

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

    const body = reportListRes?.rows?.map((report) => {
      const {
        id,
        report_date,
        yarn_stock_company,
        cartoon,
        current_stock,
        require_stock,
      } = report;
      const {
        yarn_company_name = "",
        yarn_denier = 0,
        filament = 0,
        luster_type = "",
        yarn_color = "",
        yarn_Sub_type = "",
        avg_daily_stock = 0,
      } = yarn_stock_company;
      return [
        id,
        dayjs(report_date).format("DD-MM-YYYY"),
        dayjs(report_date).format("hh:mm:ss A"),
        yarn_company_name,
        `${yarn_denier}D/${filament}F (${yarn_Sub_type} ${luster_type} - ${yarn_color})`,
        avg_daily_stock,
        cartoon,
        current_stock,
        require_stock,
      ];
    });

    downloadUserPdf({
      body,
      head: [
        [
          "ID",
          "Date",
          "Time",
          "Company Name",
          "Denier/Count",
          "Avg Stock(Kg)",
          "Cartoon",
          "Current Stock(Kg)",
          "Require kg",
        ],
      ],
      leftContent,
      rightContent,
      title: "Yarn Stock Report List",
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
        return dayjs(report_date).format("hh:mm:ss A");
      },
    },
    {
      title: "Company Name",
      render: ({ yarn_stock_company }) => {
        const { yarn_company_name } = yarn_stock_company;
        return yarn_company_name;
      },
      key: "yarn_company_name",
    },
    {
      title: "Denier/Count",
      render: ({ yarn_stock_company }) => {
        const {
          yarn_denier = 0,
          filament = 0,
          luster_type = "",
          yarn_color = "",
          yarn_Sub_type = "",
        } = yarn_stock_company;
        return `${yarn_denier}D/${filament}F (${yarn_Sub_type} ${luster_type} - ${yarn_color})`;
      },
      key: "yarn_denier",
    },
    {
      title: "Avg Stock(Kg)",
      render: ({ yarn_stock_company }) => {
        const { avg_daily_stock } = yarn_stock_company;
        return avg_daily_stock;
      },
      key: "avg_daily_stock",
    },
    {
      title: "Cartoon",
      dataIndex: "cartoon",
      key: "cartoon",
    },
    {
      title: "Current Stock(Kg)",
      dataIndex: "current_stock",
      key: "current_stock",
    },
    {
      title: "Require kg",
      dataIndex: "require_stock",
      key: "require_stock",
    },
    {
      title: "Action",
      render: (reportDetails) => {
        return (
          <Space>
            <DeleteYarnStockReportButton details={reportDetails} />
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
          <h3 className="m-0 text-primary">Yarn Stock Company Report</h3>
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

export default YarnStockReportList;
