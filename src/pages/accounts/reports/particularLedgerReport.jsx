import {
  Button,
  Flex,
  Select,
  Typography,
  DatePicker,
  Checkbox,
  Spin,
  Tag,
} from "antd";
import { FilePdfOutlined, SearchOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { useContext, useEffect, useMemo, useState } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import dayjs from "dayjs";
import { getParticularLedgerReportService } from "../../../api/requests/accounts/reports";
import { getParticularListRequest } from "../../../api/requests/accounts/particular";
import { PARTICULAR_OPTIONS } from "../../../constants/account";
import { useLocation } from "react-router-dom";

const ENTRY_TYPE = [
  { label: "Cashbook / Passbook", value: "both" },
  { label: "Cashbook", value: "cashbook" },
  { label: "Passbook", value: "passbook" },
];

const ParticularLedgerReport = () => {
  const location = useLocation();
  const { isSuspenseAccount } = location.state || {}; // Safely access state
  const { companyId, companyListRes } = useContext(GlobalContext);

  const [isShowAll, setIsShowAll] = useState(false);
  const [entryType, setEntryType] = useState("both");
  const [company, setCompany] = useState(null);
  const [particular, setParticular] = useState(null);
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();
  const [particularOptions, setParticularOptions] = useState([]);

  const {
    data: particularLedgerReportData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["particular-ledger-report", "list"],
    queryFn: async () => {
      const params = {
        company_id: company,
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
    enabled: Boolean(company),
  });

  function downloadPdf() {
    const body = particularLedgerReportData?.ledgerReport?.map(
      (item, index) => {
        const debit = item.is_withdraw ? item.amount : 0.0;
        const credit = !item.is_withdraw ? item.amount : 0.0;
        const selectedCompany = companyListRes.rows.find(
          ({ id }) => id === item.company_id
        );
        const model = item.model === "passbook_audit" ? "Passbook" : "Cashbook";

        return [
          index + 1,
          dayjs(item.cheque_date).format("YYYY-MM-DD"),
          selectedCompany?.company_name,
          model,
          item.remarks,
          debit,
          credit,
          item.balance,
        ];
      }
    );

    const tableTitle = [
      "ID",
      "Date",
      "Company",
      "Passbook/Cashbook",
      "Remark/Bill No.",
      "Debit",
      "Credit",
      "Balance",
    ];

    let total = ["", "", "", "", "", TOTAL.totalDebit, TOTAL.totalCredit, ""];

    // Set localstorage item information
    localStorage.setItem("print-array", JSON.stringify(body));
    localStorage.setItem("print-title", "Particular Ledger Report");
    localStorage.setItem("print-head", JSON.stringify(tableTitle));
    localStorage.setItem("total-count", "1");
    localStorage.setItem("total-data", JSON.stringify(total));

    window.open("/print");
  }

  // get particular list API
  const { data: particularRes, isLoading: isLoadingParticular } = useQuery({
    queryKey: [
      "dropdown/passbook_particular_type/list",
      { company_id: company || companyId },
    ],
    queryFn: async () => {
      const res = await getParticularListRequest({
        params: { company_id: company || companyId },
      });
      return res.data?.data;
    },
    enabled: Boolean(company || companyId),
  });

  const TOTAL = useMemo(() => {
    let totalCredit = 0;
    let totalDebit = 0;
    if (
      particularLedgerReportData &&
      particularLedgerReportData?.ledgerReport?.length
    ) {
      particularLedgerReportData?.ledgerReport?.forEach((item) => {
        const debit = item.is_withdraw ? item.amount : 0.0;
        const credit = !item.is_withdraw ? item.amount : 0.0;

        totalCredit += credit;
        totalDebit += debit;
      });
    }
    return { totalCredit, totalDebit };
  }, [particularLedgerReportData]);

  const onClickFilterHandler = () => {
    if (entryType && company && particular && fromDate && toDate) {
      refetch();
    }
  };

  useEffect(() => {
    if (particularRes) {
      const data = particularRes.rows.map(({ particular_name, label }) => {
        return {
          label: label,
          value: particular_name,
        };
      });

      setParticularOptions([...PARTICULAR_OPTIONS, ...data]);

      if (isSuspenseAccount) {
        setParticular("suspense_account");
      }
    }
  }, [isSuspenseAccount, particularRes]);

  useEffect(() => {
    // Get the current date
    const today = dayjs();

    // Determine the start of the financial year
    const currentYear = today.year();
    const financialYearStart =
      today.month() < 3
        ? dayjs(`${currentYear - 1}-04-01`) // Previous year April 1st
        : dayjs(`${currentYear}-04-01`); // Current year April 1st

    // Set the initial state
    setFromDate(financialYearStart);
    setToDate(today);
  }, []);

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
        <Flex align="center" gap={10}>
          <Typography.Text className="whitespace-nowrap">
            Company
          </Typography.Text>
          <Select
            allowClear
            placeholder="Select Company"
            value={company}
            options={companyListRes?.rows?.map((company) => {
              return {
                label: company?.company_name,
                value: company?.id,
              };
            })}
            dropdownStyle={{
              textTransform: "capitalize",
            }}
            onChange={setCompany}
            style={{
              textTransform: "capitalize",
            }}
            className="min-w-40"
          />
        </Flex>
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
        <Flex align="center" gap={10}>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={onClickFilterHandler}
          />
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
        <div style={{ maxHeight: "calc(100vh - 200px)", overflowY: "scroll" }}>
          <table className="statement-passbook-table">
            <thead style={{ position: "sticky", top: 0, zIndex: 9 }}>
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
                particularLedgerReportData?.ledgerReport?.map((row, index) => {
                  const debit = row.is_withdraw ? row.amount : 0.0;
                  const credit = !row.is_withdraw ? row.amount : 0.0;
                  const selectedCompany = companyListRes.rows.find(
                    ({ id }) => id === row.company_id
                  );
                  const model =
                    row.model === "passbook_audit" ? "Passbook" : "Cashbook";

                  return (
                    <tr
                      key={index}
                      className={row.is_withdraw ? "red" : "green"}
                    >
                      <td>{index + 1}</td>
                      <td>{dayjs(row.cheque_date).format("DD-MM-YYYY")}</td>
                      <td>{selectedCompany?.company_name || "-"}</td>
                      <td>
                        <Tag color={row.is_withdraw ? "red" : "green"}>
                          {model}
                        </Tag>
                      </td>
                      <td>{row.remarks}</td>
                      <td>
                        <Typography style={{ color: "red" }}>
                          {debit}
                        </Typography>
                      </td>
                      <td>
                        <Typography style={{ color: "green" }}>
                          {credit}
                        </Typography>
                      </td>
                      <td>{row.balance}</td>
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
                <td>{TOTAL.totalDebit}</td>
                <td>{TOTAL.totalCredit}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ParticularLedgerReport;
