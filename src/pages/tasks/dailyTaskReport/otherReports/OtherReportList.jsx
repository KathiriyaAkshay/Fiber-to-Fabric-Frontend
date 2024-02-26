import { Button, Space, Spin, Table } from "antd";
import {
  EditOutlined,
  FilePdfOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useCompanyList } from "../../../../api/hooks/company";
import { useCurrentUser } from "../../../../api/hooks/auth";
import { getOtherReportListRequest } from "../../../../api/requests/reports/otherReport";
import { downloadUserPdf } from "../../../../lib/pdf/userPdf";
import DeleteOtherReportButton from "../../../../components/tasks/otherReport/DeleteOtherReportButton";
import ViewDetailModal from "../../../../components/common/modal/ViewDetailModal";
import { usePagination } from "../../../../hooks/usePagination";

function OtherReportList() {
  const navigate = useNavigate();
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const { data: user } = useCurrentUser();
  const { data: companyListRes } = useCompanyList();

  const companyId = companyListRes?.rows?.[0]?.id;

  const { data: reportListRes, isLoading: isLoadingReportList } = useQuery({
    queryKey: [
      "reports",
      "other-report",
      "list",
      { company_id: companyId, page, pageSize },
    ],
    queryFn: async () => {
      const res = await getOtherReportListRequest({
        companyId,
        params: { company_id: companyId, page, pageSize },
      });
      return res.data?.data?.otherReportList;
    },
    enabled: Boolean(companyId),
  });

  function navigateToAdd() {
    navigate("/tasks/daily-task-report/other-reports/add");
  }

  function navigateToUpdate(id) {
    navigate(`/tasks/daily-task-report/other-reports/update/${id}`);
  }

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
      title: "Other Report List",
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
              title="Other Report"
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
            <DeleteOtherReportButton details={reportDetails} />
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
          <h3 className="m-0 text-primary">Other Report</h3>
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

export default OtherReportList;
