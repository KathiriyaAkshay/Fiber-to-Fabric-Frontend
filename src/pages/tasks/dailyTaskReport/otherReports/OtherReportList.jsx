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
import ViewOtherReportDetailModal from "../../../../components/tasks/otherReport/ViewOtherReportDetailModal";
import DeleteOtherReportButton from "../../../../components/tasks/otherReport/DeleteOtherReportButton";

function OtherReportList() {
  const navigate = useNavigate();

  const { data: user } = useCurrentUser();
  const { data: companyListRes } = useCompanyList();

  const companyId = companyListRes?.rows?.[0]?.id;

  const { data: reportListRes, isLoading: isLoadingReportList } = useQuery({
    queryKey: ["reports", "other-report", "list", companyId],
    queryFn: async () => {
      const res = await getOtherReportListRequest({
        companyId,
        params: { company_id: companyId },
      });
      return res.data?.data;
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

    const body = reportListRes?.reportList?.rows?.map((report) => {
      const { id, assign_time, achievement, reason, status } = report;
      return [id, assign_time, achievement, reason, status];
    });

    downloadUserPdf({
      body,
      head: [["ID", "Assigned Time", "Achievement", "Reason", "Status"]],
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
      title: "Assigned Time",
      dataIndex: "assign_time",
      key: "assign_time",
    },
    {
      title: "Achievement",
      dataIndex: "achievement",
      key: "achievement",
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "Status",
      dataIndex: "Status",
      key: "status",
    },
    {
      title: "Action",
      render: (reportDetails) => {
        return (
          <Space>
            <ViewOtherReportDetailModal details={reportDetails} />
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
        dataSource={reportListRes?.reportList?.rows || []}
        columns={columns}
        rowKey={"id"}
      />
    );
  }

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h2 className="m-0">Other Report</h2>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>
        <Button
          icon={<FilePdfOutlined />}
          type="primary"
          disabled={!reportListRes?.reportList?.rows?.length}
          onClick={downloadPdf}
        />
      </div>
      {renderTable()}
    </div>
  );
}

export default OtherReportList;
