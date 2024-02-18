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

function YarnStockReportList() {
  const navigate = useNavigate();

  const { data: user } = useCurrentUser();
  const { data: companyListRes } = useCompanyList();

  const companyId = companyListRes?.rows?.[0]?.id;

  const { data: reportListRes, isLoading: isLoadingReportList } = useQuery({
    queryKey: ["yarn-stock", "yarn-report", "list", companyId],
    queryFn: async () => {
      const res = await getYarnStockReportListRequest({
        companyId,
        params: { company_id: companyId },
      });
      return res.data?.data?.reportList;
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
      />
    );
  }

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h2 className="m-0">Yarn Stock Company Report</h2>
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
