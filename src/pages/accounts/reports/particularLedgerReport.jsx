import {
  Button,
  Flex,
  Select,
  Spin,
  Table,
  Typography,
  DatePicker,
  Checkbox,
} from "antd";
import { FilePdfOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { usePagination } from "../../../hooks/usePagination";
import { useContext, useState } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { getMyOrderListRequest } from "../../../api/requests/orderMaster";
import dayjs from "dayjs";

const ENTRY_TYPE = [
  { label: "Cashbook", value: "cashbook" },
  { label: "Passbook", value: "passbook" },
];

const ParticularLedgerReport = () => {
  const { companyId, companyListRes } = useContext(GlobalContext);

  const [entryType, setEntryType] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(companyId);
  const [particular, setParticular] = useState(null);
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();

  //   const debouncedMachine = useDebounce(machine, 500);
  //   const debouncedStatus = useDebounce(status, 500);
  //   const debouncedOrderType = useDebounce(orderType, 500);
  //   const debouncedBroker = useDebounce(broker, 500);
  //   const debouncedQuality = useDebounce(quality, 500);
  //   const debouncedParty = useDebounce(party, 500);

  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const { data: myOrderList, isLoading } = useQuery({
    queryKey: [
      "myOrder",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
      },
    ],
    queryFn: async () => {
      const res = await getMyOrderListRequest({
        params: {
          company_id: companyId,
          page,
          pageSize,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  function downloadPdf() {
    // const { leftContent, rightContent } = getPDFTitleContent({ user, company });

    const body = myOrderList?.row?.map((order, index) => {
      const companyName =
        order.order_type === "job"
          ? order.party.party.company_name
          : order.party.party.company_name; // supplier company should be here in else part.
      return [
        index + 1,
        order.order_no,
        dayjs(order.order_date).format("DD-MM-YYYY"),
        companyName,
        `${order.inhouse_quality.quality_name} (${order.inhouse_quality.quality_weight}KG)`,
        order.pending_taka,
        order.delivered_taka,
        order.pending_meter,
        order.delivered_meter,
        order.status,
      ];
    });

    const tableTitle = [
      "ID",
      "Order No",
      "Order Date",
      "Company Name",
      "Quality",
      "Pending Taka",
      "Deliver Taka",
      "Pending Meter",
      "Deliver Meter",
      "Status",
    ];

    // Set localstorage item information
    localStorage.setItem("print-array", JSON.stringify(body));
    localStorage.setItem("print-title", "Order List");
    localStorage.setItem("print-head", JSON.stringify(tableTitle));
    localStorage.setItem("total-count", "0");

    window.open("/print");
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => page * pageSize + index + 1,
    },
    {
      title: "Date",
      width: 150,
      render: (details) => {
        return dayjs(details.createdAt).format("DD-MM-YYYY");
      },
    },
    {
      title: "Company",
      dataIndex: "company_name",
      key: "company_name",
    },
    {
      title: "Passbook / Cashbook",
      render: (details) => {
        if (details.party) {
          return `${details.party.first_name} ${details.party.last_name}`;
        } else {
          return `${details.supplier_name}`;
        }
      },
    },
    {
      title: "Remark/Bill No.",
      dataIndex: "machine_name",
      key: "machine_name",
    },
    {
      title: "Debit",
      dataIndex: "debit",
      key: "debit",
    },
    {
      title: "Credit",
      dataIndex: "credit",
      key: "credit",
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
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
        dataSource={[]}
        columns={columns}
        rowKey={"id"}
        pagination={{
          current: page + 1,
          pageSize: pageSize,
          total: myOrderList?.row?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
        summary={() => {
          return (
            <Table.Summary.Row>
              <Table.Summary.Cell index={1}>
                <b>Total</b>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2}></Table.Summary.Cell>
              <Table.Summary.Cell index={3}></Table.Summary.Cell>
              <Table.Summary.Cell index={4}></Table.Summary.Cell>
              <Table.Summary.Cell index={5}></Table.Summary.Cell>
              <Table.Summary.Cell index={6}>0</Table.Summary.Cell>
              <Table.Summary.Cell index={7}>0</Table.Summary.Cell>
              <Table.Summary.Cell index={8}></Table.Summary.Cell>
            </Table.Summary.Row>
          );
        }}
      />
    );
  }
  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary">Particular Ledger Report</h3>
        </div>

        <Flex align="center" gap={10}>
          <Flex align="center">
            <Checkbox>Show All Entry</Checkbox>
          </Flex>
          <Button
            icon={<FilePdfOutlined />}
            type="primary"
            disabled={!myOrderList?.row?.length}
            onClick={downloadPdf}
            className="flex-none"
          />
        </Flex>
      </div>

      <div className="flex items-center justify-end gap-5 mx-3 mb-3">
        <Flex align="center" gap={10}>
          <Typography.Text className="whitespace-nowrap">
            Entry Type
          </Typography.Text>
          <Select
            placeholder="Select entry type"
            value={entryType}
            options={ENTRY_TYPE}
            dropdownStyle={{
              textTransform: "capitalize",
            }}
            onChange={setEntryType}
            style={{
              textTransform: "capitalize",
            }}
            className="min-w-40"
          />
        </Flex>
        <Flex align="center" gap={10}>
          <Typography.Text className="whitespace-nowrap">
            Company
          </Typography.Text>
          <Select
            placeholder="Select Company"
            value={selectedCompany}
            options={companyListRes?.rows?.map((company) => {
              return {
                label: company?.company_name,
                value: company?.id,
              };
            })}
            dropdownStyle={{
              textTransform: "capitalize",
            }}
            onChange={setSelectedCompany}
            style={{
              textTransform: "capitalize",
            }}
            className="min-w-40"
            allowClear
          />
        </Flex>
        <Flex align="center" gap={10}>
          <Typography.Text className="whitespace-nowrap">
            Particular
          </Typography.Text>
          <Select
            placeholder="Select particular"
            value={particular}
            onChange={setParticular}
            options={[]}
            dropdownStyle={{
              textTransform: "capitalize",
            }}
            style={{
              textTransform: "capitalize",
            }}
            className="min-w-40"
          />
        </Flex>
        <Flex align="center" gap={10}>
          <Typography.Text className="whitespace-nowrap">From</Typography.Text>
          <DatePicker value={fromDate} onChange={setFromDate} />
        </Flex>
        <Flex align="center" gap={10}>
          <Typography.Text className="whitespace-nowrap">To</Typography.Text>
          <DatePicker value={toDate} onChange={setToDate} />
        </Flex>
      </div>
      {/* {renderTable()} */}

      <table className="statement-passbook-table">
        <thead>
          <tr>
            <td>ID</td>
            <td>Date</td>
            <td>Company</td>
            <td>Passbook / Cashbook</td>
            <td>Remark/Bill No.</td>
            <td>Debit</td>
            <td>Credit</td>
            <td>Balance</td>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, index) => {
            return (
              <tr key={index} className={index % 2 ? "red" : "green"}>
                <td>{index + 1}</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
              </tr>
            );
          })}
          <tr>
            <td>Total</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ParticularLedgerReport;
