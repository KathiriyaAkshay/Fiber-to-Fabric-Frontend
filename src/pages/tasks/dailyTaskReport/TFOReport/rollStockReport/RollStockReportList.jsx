import { Button, Flex, Input, Spin, Table, Typography } from "antd";
import { FilePdfOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useContext, useState } from "react";
import useDebounce from "../../../../../hooks/useDebounce";
import { GlobalContext } from "../../../../../contexts/GlobalContext";
import { usePagination } from "../../../../../hooks/usePagination";
import { useCurrentUser } from "../../../../../api/hooks/auth";
import { getRollStockReportListRequest } from "../../../../../api/requests/reports/rollStockReport";
import {
  downloadUserPdf,
  getPDFTitleContent,
} from "../../../../../lib/pdf/userPdf";

function RollStockReportList() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const { company, companyId } = useContext(GlobalContext);
  const navigate = useNavigate();
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const { data: user } = useCurrentUser();

  const { data: reportListRes, isLoading: isLoadingReportList } = useQuery({
    queryKey: [
      "reports/roll-stock-report/list",
      {
        company_id: companyId,
        page,
        pageSize,
        search: debouncedSearch,
      },
    ],
    queryFn: async () => {
      const res = await getRollStockReportListRequest({
        companyId,
        params: {
          company_id: companyId,
          page,
          pageSize,
          search: debouncedSearch,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  function navigateToAdd() {
    navigate("/tasks/daily-task-report/daily-tfo-report/roll-stock-report/add");
  }

  function downloadPdf() {
    const { leftContent, rightContent } = getPDFTitleContent({ user, company });

    const body = reportListRes?.rows?.map((report) => {
      const {
        id,
        yarn_stock_company = {},
        yarn_type,
        roll_stock,
        weight_stock,
      } = report;
      const { yarn_company_name = "" } = yarn_stock_company;
      return [id, yarn_company_name, yarn_type, roll_stock, weight_stock];
    });

    downloadUserPdf({
      body,
      head: [["ID", "Company Name", "Yarn Type", "Roll Stock", "Weight Stock"]],
      leftContent,
      rightContent,
      title: "Roll Stock Report List",
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
      title: "Yarn Company",
      dataIndex: ["yarn_stock_company", "yarn_company_name"],
      key: "yarn_stock_company.yarn_company_name",
    },
    {
      title: "Denier",
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
      key: "denier",
    },
    {
      title: "Yarn Type",
      dataIndex: "yarn_type",
      key: "yarn_type",
    },
    {
      title: "Roll Stock",
      dataIndex: "roll_stock",
      key: "roll_stock",
    },
    {
      title: "Weight Stock",
      dataIndex: "weight_stock",
      key: "weight_stock",
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
        summary={() => {
          if (!reportListRes) return;
          const totalRollStock = reportListRes?.rows?.reduce(
            (accumulator, { roll_stock = 0 }) => {
              return accumulator + roll_stock;
            },
            0
          );
          const totalWeightStock = reportListRes?.rows?.reduce(
            (accumulator, { weight_stock = 0 }) => {
              return accumulator + Number(weight_stock);
            },
            0
          );

          return (
            <>
              <Table.Summary.Row className="font-semibold">
                <Table.Summary.Cell>Total</Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell>
                  <Typography.Text>{totalRollStock}</Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <Typography.Text>{totalWeightStock}</Typography.Text>
                </Table.Summary.Cell>
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
          <h3 className="m-0 text-primary">Roll Stock Report List</h3>
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

export default RollStockReportList;
