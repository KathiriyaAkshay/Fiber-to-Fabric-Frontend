import { Button, Flex, Input, Space, Spin, Table } from "antd";
import {
  EditOutlined,
  FilePdfOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
// import { useCurrentUser } from "../../../../api/hooks/auth";
import { getOtherReportListRequest } from "../../../../api/requests/reports/otherReport";
import DeleteOtherReportButton from "../../../../components/tasks/otherReport/DeleteOtherReportButton";
import ViewDetailModal from "../../../../components/common/modal/ViewDetailModal";
import { usePagination } from "../../../../hooks/usePagination";
import { useContext } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import GoBackButton from "../../../../components/common/buttons/GoBackButton";
import useDebounce from "../../../../hooks/useDebounce";
import { useState } from "react";

function OtherReportList() {
  const { companyId } = useContext(GlobalContext);
  const navigate = useNavigate();
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();
  // const { data: user } = useCurrentUser();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { data: reportListRes, isLoading: isLoadingReportList } = useQuery({
    queryKey: [
      "reports",
      "other-report",
      "list",
      { company_id: companyId, page, pageSize, search: debouncedSearch },
    ],
    queryFn: async () => {
      const res = await getOtherReportListRequest({
        companyId,
        params: {
          company_id: companyId,
          page,
          pageSize,
          search: debouncedSearch,
        },
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
    // const { leftContent, rightContent } = getPDFTitleContent({ user, company });

    const body = reportListRes?.rows?.map((report) => {
      const { id, report_date, notes } = report;
      return [
        id,
        dayjs(report_date).format("DD-MM-YYYY"),
        dayjs(report_date).format("h:mm:ss A"),
        notes,
      ];
    });

    const tableTitle = ["ID", "Date", "Time", "Notes"];

    // Set localstorage item information
    localStorage.setItem("print-array", JSON.stringify(body));
    localStorage.setItem("print-title", "Other Report List");
    localStorage.setItem("print-head", JSON.stringify(tableTitle));
    localStorage.setItem("total-count", "0");

    // downloadUserPdf({
    //   body,
    //   head: [["ID", "Date", "Time", "Notes"]],
    //   leftContent,
    //   rightContent,
    //   title: "Other Report List",
    // });
    window.open("/print");
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 90,
      key: "id",
      render: (text, record, index) => page * pageSize + index + 1,
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
      width: 200,
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
    // <div className="flex flex-col p-4">
    //   <div className="flex items-center justify-between gap-5 mx-3 mb-3">
    //     <div className="flex items-center gap-2">
    //       <GoBackButton/>
    //       <h3 className="m-0 text-primary">Other Report</h3>
    //       <Button
    //         onClick={navigateToAdd}
    //         icon={<PlusCircleOutlined />}
    //         type="text"
    //       />
    //     </div>
    //     <Flex align="center" gap={10}>
    //       <Input
    //         placeholder="Search"
    //         value={search}
    //         onChange={(e) =>{setSearch(e.target.value)} }
    //       />
    //       <Button
    //         icon={<FilePdfOutlined />}
    //         type="primary"
    //         disabled={!reportListRes?.rows?.length}
    //         onClick={downloadPdf}
    //       />
    //     </Flex>
    //   </div>
    //   {renderTable()}
    // </div>
    <div className="flex flex-col p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <GoBackButton />
          <h3 className="m-0 text-primary">Other Report</h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>
        <Flex align="center" gap={10} wrap="wrap">
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

export default OtherReportList;
