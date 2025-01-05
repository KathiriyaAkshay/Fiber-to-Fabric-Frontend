import {
  Button,
  Flex,
  Select,
  Typography,
  DatePicker,
  Checkbox,
  Spin,
} from "antd";
import { FilePdfOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import dayjs from "dayjs";
import { getParticularLedgerReportService } from "../../../api/requests/accounts/reports";
import { getParticularListRequest } from "../../../api/requests/accounts/particular";
import { PARTICULAR_OPTIONS } from "../../../constants/account";

const ENTRY_TYPE = [
  { label: "Cashbook", value: "cashbook" },
  { label: "Passbook", value: "passbook" },
];

const ParticularLedgerReport = () => {
  const { companyId } = useContext(GlobalContext);

  const [isShowAll, setIsShowAll] = useState(false);
  const [entryType, setEntryType] = useState(null);
  // const [selectedCompany, setSelectedCompany] = useState(companyId);
  const [particular, setParticular] = useState(null);
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();
  const [particularOptions, setParticularOptions] = useState([]);

  const { data: particularLedgerReportData, isLoading } = useQuery({
    queryKey: [
      "myOrder",
      "list",
      {
        company_id: companyId,
        from_date: dayjs(fromDate).format("YYYY-MM-DD"),
        to_date: dayjs(toDate).format("YYYY-MM-DD"),
        entry_type: entryType,
        particular_type: particular,
        show_all: isShowAll ? 1 : 0,
      },
    ],
    queryFn: async () => {
      const params = {
        company_id: companyId,
        entry_type: entryType,
        particular_type: particular,
        show_all: isShowAll ? 1 : 0,
      };
      if (fromDate && toDate) {
        params.from_date = dayjs(fromDate).format("YYYY-MM-DD");
        params.to_date = dayjs(toDate).format("YYYY-MM-DD");
      }
      const res = await getParticularLedgerReportService({
        params,
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });
  console.log({ particularLedgerReportData });

  function downloadPdf() {
    // const { leftContent, rightContent } = getPDFTitleContent({ user, company });

    const body = particularLedgerReportData?.ledgerReport?.map(
      (order, index) => {
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
      }
    );

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

  // get particular list API
  const { data: particularRes, isLoading: isLoadingParticular } = useQuery({
    queryKey: [
      "dropdown/passbook_particular_type/list",
      { company_id: companyId },
    ],
    queryFn: async () => {
      const res = await getParticularListRequest({
        params: { company_id: companyId },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  useEffect(() => {
    if (particularRes) {
      const data = particularRes.rows.map(({ particular_name }) => {
        return {
          label: particular_name,
          value: particular_name,
        };
      });

      setParticularOptions([...PARTICULAR_OPTIONS, ...data]);
    }
  }, [particularRes]);

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary">Particular Ledger Report</h3>
        </div>

        <Flex align="center" gap={10}>
          <Flex align="center">
            <Checkbox
              checked={isShowAll}
              onChange={(e) => setIsShowAll(e.target.checked)}
            >
              Show All Entry
            </Checkbox>
          </Flex>
          <Button
            icon={<FilePdfOutlined />}
            type="primary"
            disabled={!particularLedgerReportData?.ledgerReport?.length}
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
        {/* <Flex align="center" gap={10}>
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
        </Flex> */}
        {/* Particular selection  */}
        <Flex align="center" gap={10}>
          <Typography.Text className="whitespace-nowrap">
            Particular
          </Typography.Text>
          <Select
            allowClear
            showSearch
            placeholder="Select Particular"
            dropdownStyle={{
              textTransform: "capitalize",
            }}
            style={{
              textTransform: "capitalize",
              minWidth: "200px",
            }}
            loading={isLoadingParticular}
            options={particularOptions}
            value={particular}
            onChange={setParticular}
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

      {isLoading ? (
        <Flex
          justify="center"
          align="center"
          style={{ height: "200px", width: "100%" }}
        >
          <Spin />
        </Flex>
      ) : (
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
            {particularLedgerReportData &&
            particularLedgerReportData?.ledgerReport.length ? (
              particularLedgerReportData?.ledgerReport?.map((_, index) => {
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
              })
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: "center" }}>
                  No records found
                </td>
              </tr>
            )}
            <tr>
              <td>Total</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td>0</td>
              <td>0</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ParticularLedgerReport;
