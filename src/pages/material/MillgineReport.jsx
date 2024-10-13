import { DatePicker, Flex, Input, Space, Spin, Table, Typography } from "antd";
import { useContext, useMemo, useState } from "react";
import useDebounce from "../../hooks/useDebounce";
import { getMillgineReportListRequest } from "../../api/requests/material";
import { GlobalContext } from "../../contexts/GlobalContext";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import DeleteMillgineReportModal from "../../components/material/DeleteMillgineReport";

const MillgineReport = () => {
  const { companyId } = useContext(GlobalContext);

  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const debounceSearch = useDebounce(search, 500);
  const debounceFromDate = useDebounce(fromDate, 500);
  const debounceToDate = useDebounce(toDate, 500);

  const { data: millgineReportData, isLoading } = useQuery({
    queryKey: [
      "get",
      "millgine-report",
      "list",
      {
        company_id: companyId,
        search: debounceSearch,
        from: debounceFromDate,
        to: debounceToDate,
      },
    ],
    queryFn: async () => {
      const res = await getMillgineReportListRequest({
        params: {
          company_id: companyId,
          search: debounceSearch,
          from: dayjs(debounceFromDate).format("YYYY-MM-DD"),
          to: dayjs(debounceToDate).format("YYYY-MM-DD"),
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const data = useMemo(() => {
    if (millgineReportData && Object.keys(millgineReportData).length) {
      return [...millgineReportData.allAudit];
    } else {
      return [];
    }
  }, [millgineReportData]);

  const columns = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => text || "-",
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => dayjs(text).format("DD-MM-YYYY"),
    },
    {
      title: "Type",
      dataIndex: "code",
      key: "code",
      render: (text) => text || "-",
    },
    {
      title: "Machine No",
      dataIndex: "machine_no",
      key: "machine_no",
      render: (text) => text || "-",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (text) => text || "-",
    },
    {
      title: "Quantity Amount",
      dataIndex: "quantity_amount",
      key: "quantity_amount",
      render: (text) => text || 0,
    },
    {
      title: "Pcs",
      dataIndex: "pcs",
      key: "pcs",
      render: (text) => text || "-",
    },
    {
      title: "Pcs Amount",
      dataIndex: "amount",
      key: "amount",
      render: (text) => text || "-",
    },
    {
      title: "Total Amount",
      dataIndex: "amount",
      key: "amount",
      render: (text) => text || "-",
    },
    {
      title: "User Name",
      dataIndex: ["user", "username"],
      key: "username",
      render: (text) => text || "-",
    },
    {
      title: "Remark",
      dataIndex: "remark",
      key: "remark",
      render: (text) => text || "-",
    },
    {
      title: "Action",
      key: "action",
      render: (details) => (
        <Space>
          <DeleteMillgineReportModal
            key={"delete_millgine_report_modal"}
            details={details}
          />
        </Space>
      ),
    },
  ];

  function renderTable() {
    if (isLoading) {
      return (
        <Spin tip="Loading" size="large">
          <div className="p-14" />
        </Spin>
      );
    }

    return (
      <Table
        dataSource={data || []}
        columns={columns}
        rowKey={"id"}
        scroll={{ y: 330 }}
        pagination={false}
        summary={(pageData) => {
          let totalAmountTotal = 0;
          let totalQuantity = 0;
          let totalPcs = 0;
          let totalPcsAmount = 0;

          pageData.forEach((item) => {
            totalQuantity += +item.quantity || 0;
            totalPcs += +item.pcs || 0;
            totalPcsAmount += +item.amount || 0;
            totalAmountTotal += +item.amount || 0;
          });

          return (
            <Table.Summary.Row>
              <Table.Summary.Cell colSpan={5}>Grand Total</Table.Summary.Cell>
              <Table.Summary.Cell>{totalQuantity}</Table.Summary.Cell>
              <Table.Summary.Cell>0</Table.Summary.Cell>
              <Table.Summary.Cell>{totalPcs}</Table.Summary.Cell>
              <Table.Summary.Cell>{totalPcsAmount}</Table.Summary.Cell>
              <Table.Summary.Cell>{totalAmountTotal}</Table.Summary.Cell>
              <Table.Summary.Cell colSpan={3}></Table.Summary.Cell>
            </Table.Summary.Row>
          );
        }}
      />
    );
  }

  return (
    <>
      <div className="flex items-center justify-end gap-5 mx-3 mb-3">
        <Flex align="center" gap={10}>
          <Typography.Text className="whitespace-nowrap">Date</Typography.Text>
          <DatePicker value={fromDate} onChange={(date) => setFromDate(date)} />
        </Flex>
        <Flex align="center" gap={10}>
          <Typography.Text className="whitespace-nowrap">To</Typography.Text>
          <DatePicker value={toDate} onChange={(date) => setToDate(date)} />
        </Flex>
        <Flex align="center" gap={10}>
          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
        </Flex>
      </div>

      {renderTable()}
    </>
  );
};

export default MillgineReport;
