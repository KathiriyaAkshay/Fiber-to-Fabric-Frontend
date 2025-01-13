import {
  Button,
  Flex,
  Select,
  Typography,
  DatePicker,
  Spin,
  Tag,
  message,
} from "antd";
import { FilePdfOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { useContext, useEffect, useMemo, useState } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { getLedgerReportService } from "../../../api/requests/accounts/reports";
import { getParticularListRequest } from "../../../api/requests/accounts/particular";
import { PARTICULAR_OPTIONS } from "../../../constants/account";
import { JOB_TAG_COLOR, PURCHASE_TAG_COLOR } from "../../../constants/tag";
import { formatString } from "../../../utils/mutationUtils";
import dayjs from "dayjs";
import _ from "lodash";
import { useNavigate } from "react-router-dom";

const BILL_TYPE = [
  { label: "GST", value: "gst" },
  { label: "Cash", value: "cash" },
  { label: "GST & Cash", value: "gst_cash" },
];

const LedgerReport = () => {
  const navigate = useNavigate();
  const { companyId, companyListRes } = useContext(GlobalContext);

  const [selectedCompany, setSelectedCompany] = useState(companyId);
  const [selectedCompanyData, setSelectedCompanyData] = useState(null);
  const [particular, setParticular] = useState(null);
  //   const [partySupplier, setPartySupplier] = useState(null);
  const [billType, setBillType] = useState(null);
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();
  const [isSubmitted, setIsSubmitted] = useState(false);
  //   const [particularOptions, setParticularOptions] = useState([]);

  const isValidateData = () => {
    if (selectedCompany && particular && billType && fromDate && toDate) {
      return true;
    }
    return false;
  };

  const onClickSubmitHandler = () => {
    if (!isValidateData()) {
      message.error("Please provide all data to generate ledger report.");
      return;
    }
    if (selectedCompany && companyListRes) {
      const companyData = companyListRes?.rows?.find(
        ({ id }) => id === selectedCompany
      );
      setSelectedCompanyData(companyData);
    }
    setIsSubmitted(true);

    setTimeout(refetch, 100);
  };

  const {
    data: ledgerReportData,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["ledger-report", "list"],
    queryFn: async () => {
      if (isSubmitted) {
        const params = {
          company_id: selectedCompany,
          bill_type: billType,
        };
        if (particular) {
          const data = particular.split("-");
          if (data[0] === "particular") {
            params.particular_type = data[1];
          } else if (data[0] === "party" || data[0] === "supplier") {
            params.id = +data[1];
            params.particular_type = data[0];
          }
        }
        if (fromDate && toDate) {
          params.from_date = dayjs(fromDate).format("YYYY-MM-DD");
          params.to_date = dayjs(toDate).format("YYYY-MM-DD");
        }
        const res = await getLedgerReportService({
          params,
        });
        setIsSubmitted(false);
        return res.data?.data?.groupedResults;
      }
    },
  });

  useEffect(() => {
    if (isError) {
      setIsSubmitted(false);
    }
  }, [isError]);

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

  function downloadPdf() {
    // const { leftContent, rightContent } = getPDFTitleContent({ user, company });

    const body = ledgerReportData?.groupedResults?.map((order, index) => {
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

  // get particular list API
  const { data: particularRes, isLoading: isLoadingParticular } = useQuery({
    queryKey: [
      "dropdown/passbook_particular_type/list",
      { company_id: selectedCompany },
    ],
    queryFn: async () => {
      const res = await getParticularListRequest({
        params: { company_id: selectedCompany },
      });
      return res.data?.data;
    },
    enabled: Boolean(selectedCompany),
  });

  const formattedData = useMemo(() => {
    if (ledgerReportData && !_.isEmpty(ledgerReportData)) {
      return Object.keys(ledgerReportData);
    }
  }, [ledgerReportData]);

  const particularInformation = useMemo(() => {
    if (particular) {
      if (particular.includes("supplier")) {
        const userId = particular.split("-")[1];
        const supplier = particularRes?.supplier?.find(
          (supplier) => supplier.user_id === +userId
        );
        return (
          <>
            <h3 className="text-xl font-bold">
              {supplier.supplier_name || ""}
            </h3>
            <p className="text-gray-400 w-80 m-auto text-center text-sm">
              {supplier?.user?.address || ""}
            </p>
          </>
        );
      } else if (particular.includes("party")) {
        const userId = particular.split("-")[1];
        const party = particularRes?.parties?.find(
          (party) => party.user_id === +userId
        );
        return (
          <>
            <h3 className="text-xl font-bold">
              {party.user.first_name || ""} {party.user.last_name || ""}
            </h3>
            <p className="text-gray-400 w-80 m-auto text-center text-sm">
              {party?.user?.address || ""}
            </p>
          </>
        );
      } else if (particular.includes("particular")) {
        return "particular";
      }
    } else {
      return "";
    }
  }, [particular, particularRes?.parties, particularRes?.supplier]);

  let openingBalance = 0;
  const getSingleRowData = (data) => {
    const billData = [];

    data.forEach((bill) => {
      let particulars = "";
      let vchType = "";
      let vchNo = "";
      let credit = 0;
      let debit = 0;
      let cumulativeBalance = 0;

      const isCredit = [
        "purchase_taka_bills",
        "general_purchase_entries",
        "yarn_bills",
        "receive_size_beam_bill",
        "job_rework_bill",
        "job_work_bills",
        "credit_notes",
        "debit_notes",
      ].includes(bill.model);

      const isDebit = [
        "sale_bills",
        "job_gray_sale_bill",
        "beam_sale_bill",
        "yarn_sale_bills",
      ].includes(bill.model);

      credit = isCredit ? bill.amount : 0;
      debit = isDebit ? bill.amount : 0;
      cumulativeBalance = +openingBalance + +credit - +debit;
      openingBalance = +cumulativeBalance;

      particulars = (
        <Flex gap={12}>
          <p style={{ margin: 0, fontWeight: "500" }}>
            {isCredit ? "Cr." : isDebit ? "Dr" : ""}. {formatString(bill.model)}
          </p>
          <span
            style={{
              margin: 0,
              textAlign: "right",
              color: "blue",
              borderBottom: "1px solid blue",
              cursor: "pointer",
            }}
          >
            New Ref: {bill.bill_no}
          </span>
        </Flex>
      );
      vchType = formatString(bill.model);

      billData.push({
        particulars,
        vchType,
        vchNo,
        credit,
        debit,
        cumulativeBalance,
      });
    });

    return billData;
  };

  const closingBalance = useMemo(() => {
    let totalCredit = 0;
    let totalDebit = 0;

    if (formattedData && formattedData.length) {
      formattedData.forEach((date) => {
        const data = ledgerReportData[date];
        data.forEach((bill) => {
          const isCredit = [
            "purchase_taka_bills",
            "general_purchase_entries",
            "yarn_bills",
            "receive_size_beam_bill",
            "job_rework_bill",
            "job_work_bills",
            "credit_notes",
            "debit_notes",
          ].includes(bill.model);

          const isDebit = [
            "sale_bills",
            "job_gray_sale_bill",
            "beam_sale_bill",
            "yarn_sale_bills",
          ].includes(bill.model);

          const credit = isCredit ? bill.amount : 0;
          const debit = isDebit ? bill.amount : 0;

          totalCredit = isCredit ? +totalCredit + +credit : totalCredit;
          totalDebit = isDebit ? +totalDebit + +debit : totalDebit;
        });
      });
    }

    return { totalCredit, totalDebit };
  }, [formattedData, ledgerReportData]);

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary">Ledger Report</h3>
        </div>

        <Flex gap={12}>
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
              onChange={(_, selected) => {
                setSelectedCompany(selected.value);
                setParticular(null);
              }}
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
              allowClear
              showSearch
              placeholder="Select Particular"
              dropdownStyle={{
                textTransform: "capitalize",
              }}
              style={{
                textTransform: "capitalize",
                minWidth: "200px",
                maxWidth: "200px",
              }}
              loading={isLoadingParticular}
              value={particular}
              onChange={setParticular}
            >
              {particularRes &&
                [...PARTICULAR_OPTIONS].map((row) => (
                  <Select.Option
                    key={`particular-${row?.value}`}
                    value={`particular-${row?.value}`}
                  >
                    <span>{row?.label}</span>
                  </Select.Option>
                ))}

              {particularRes &&
                particularRes.rows.map((row) => (
                  <Select.Option
                    key={`particular-${row?.particular_name}`}
                    value={`particular-${row?.particular_name}`}
                  >
                    <span>{row?.particular_name}</span>
                  </Select.Option>
                ))}

              {particularRes?.parties?.map((party) => (
                <Select.Option
                  key={`party-${party?.user_id}`}
                  value={`party-${party?.user_id}`}
                >
                  <Tag color={PURCHASE_TAG_COLOR}>PARTY</Tag>
                  <span>
                    {`${party?.user?.first_name} ${party?.user?.last_name} | `.toUpperCase()}
                    <strong>{party?.company_name}</strong>
                  </span>
                </Select.Option>
              ))}

              {particularRes?.supplier?.map((supplier) => (
                <Select.Option
                  key={`supplier-${supplier?.user_id}`}
                  value={`supplier-${supplier?.user_id}`}
                >
                  <Tag color={JOB_TAG_COLOR}>SUPPLIER</Tag>
                  <span>
                    {`${supplier?.supplier_company} | `}
                    <strong>{`${supplier?.supplier_name}`}</strong>
                  </span>
                </Select.Option>
              ))}
            </Select>
          </Flex>
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Bill Type
            </Typography.Text>
            <Select
              placeholder="Select Bill Type"
              value={billType}
              onChange={setBillType}
              options={BILL_TYPE}
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
            <Typography.Text className="whitespace-nowrap">
              From
            </Typography.Text>
            <DatePicker value={fromDate} onChange={setFromDate} />
          </Flex>
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">To</Typography.Text>
            <DatePicker value={toDate} onChange={setToDate} />
          </Flex>
        </Flex>
      </div>

      <div className="flex items-center justify-end gap-3 mx-3 mb-3">
        <Typography
          style={{
            color: "blue",
            textDecoration: "underline",
            fontSize: "16px",
            cursor: "pointer",
          }}
          onClick={() => {
            // localStorage.setItem(
            //   "ledger-report-suspense",
            //   JSON.stringify({ is: true })
            // );
            navigate("/account/reports/particular-ledger-report", {
              state: { isSuspenseAccount: true },
            });
            // window.open(`${window.location.origin}`, "_blank");
          }}
        >
          Suspense Account
        </Typography>
        <Button type="primary" onClick={onClickSubmitHandler}>
          Submit
        </Button>
        <Button
          icon={<FilePdfOutlined />}
          type="primary"
          disabled={!ledgerReportData?.groupedResults?.length}
          onClick={downloadPdf}
          className="flex-none"
        />
      </div>

      <div style={{ padding: "28px", border: "4px dashed #194A6D" }}>
        {isFetching ? (
          <Flex
            justify="center"
            align="center"
            style={{ height: "200px", width: "100%" }}
          >
            <Spin />
          </Flex>
        ) : (
          <>
            {formattedData && formattedData.length ? (
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold">
                  {selectedCompanyData?.company_name || ""}
                </h2>
                <p className="text-gray-400 w-80 m-auto text-center text-sm">
                  {selectedCompanyData?.address_line_1 || ""}
                </p>
                <p className="text-gray-400 w-80 m-auto text-center text-sm">
                  {selectedCompanyData?.address_line_2 || ""}
                </p>

                {particularInformation || null}

                {fromDate && toDate ? (
                  <p
                    style={{
                      fontWeight: 600,
                    }}
                  >
                    {fromDate && dayjs(fromDate).format("DD-MM-YYYY")} to{" "}
                    {toDate && dayjs(toDate).format("DD-MM-YYYY")}
                  </p>
                ) : null}
                <hr className="border-dashed" />
              </div>
            ) : null}

            <table
              className="custom-table"
              border={1}
              style={{
                border: "1px solid #ccc",
                borderCollapse: "collapse",
                borderStyle: "dashed",
                width: "100%",
                textAlign: "center",
              }}
            >
              <thead>
                <tr>
                  <td>Date</td>
                  <td style={{ width: "300px" }}>Particulars</td>
                  <td>Vch Type</td>
                  <td>Vch No.</td>
                  <td>Debit</td>
                  <td>Credit</td>
                  <td>Cumulative Balance</td>
                </tr>
              </thead>
              <tbody>
                <tr
                  style={{
                    border: "0px solid #ccc",
                  }}
                >
                  {formattedData && formattedData.length ? (
                    <td style={{ textAlign: "center" }}>
                      {dayjs(fromDate).format("DD-MM-YYYY")}
                    </td>
                  ) : null}
                  <td
                    colSpan={formattedData && formattedData.length ? 3 : 4}
                    style={{ border: "0px solid #ccc", textAlign: "center" }}
                  >
                    <b>Opening Balance</b>
                  </td>
                  <td
                    style={{
                      border: "0px solid #ccc",
                      borderBottom: "1px solid #ccc",
                      textAlign: "center",
                    }}
                  >
                    0
                  </td>
                  <td
                    style={{
                      border: "0px solid #ccc",
                      borderBottom: "1px solid #ccc",
                      textAlign: "center",
                    }}
                  >
                    0
                  </td>
                  <td
                    style={{
                      border: "0px solid #ccc",
                      borderBottom: "1px solid #ccc",
                      textAlign: "center",
                    }}
                  >
                    0
                  </td>
                </tr>
                {formattedData && formattedData.length
                  ? formattedData?.map((date, index) => {
                      const data = ledgerReportData[date];
                      const billData = getSingleRowData(data);

                      return (
                        <>
                          <tr key={index}>
                            <td style={{ textAlign: "center" }}>{date}</td>
                            <td>{}</td>
                            <td>{}</td>
                            <td>{}</td>
                            <td>{}</td>
                            <td>{}</td>
                            <td>{}</td>
                          </tr>
                          {billData.map((row, index) => {
                            return (
                              <tr key={index + "sub_row"}>
                                <td style={{ border: "0px" }}></td>
                                <td style={{ border: "0px" }}>
                                  {row.particulars}
                                </td>
                                <td style={{ border: "0px" }}>{row.vchType}</td>
                                <td style={{ border: "0px" }}>{row.vchNo}</td>
                                <td
                                  style={{ textAlign: "center", border: "0px" }}
                                >
                                  {row.debit}
                                </td>
                                <td
                                  style={{ textAlign: "center", border: "0px" }}
                                >
                                  {row.credit}
                                </td>
                                <td
                                  style={{ textAlign: "center", border: "0px" }}
                                >
                                  {row.cumulativeBalance.toFixed(2)}
                                </td>
                              </tr>
                            );
                          })}
                        </>
                      );
                    })
                  : // <tr>
                    //   <td colSpan={7} style={{ textAlign: "center" }}>
                    //     No records found
                    //   </td>
                    // </tr>
                    null}
                {/* <tr
                  style={{
                    border: "0px solid #ccc",
                  }}
                >
                  <td
                    colSpan={4}
                    style={{ border: "0px solid #ccc", textAlign: "center" }}
                  >
                    Opening Balance
                  </td>
                  <td
                    style={{
                      border: "0px solid #ccc",
                      borderBottom: "1px solid #ccc",
                      textAlign: "center",
                    }}
                  >
                    0
                  </td>
                  <td
                    style={{
                      border: "0px solid #ccc",
                      borderBottom: "1px solid #ccc",
                      textAlign: "center",
                    }}
                  >
                    0
                  </td>
                  <td
                    style={{
                      border: "0px solid #ccc",
                      borderBottom: "1px solid #ccc",
                      textAlign: "center",
                    }}
                  ></td>
                </tr> */}
                <tr
                  style={{
                    border: "0px solid #ccc",
                  }}
                >
                  <td
                    colSpan={4}
                    style={{ border: "0px solid #ccc", textAlign: "center" }}
                  ></td>
                  <td
                    style={{
                      border: "0px solid #ccc",
                      borderBottom: "1px solid #ccc",
                      textAlign: "center",
                    }}
                  >
                    {closingBalance.totalDebit}
                  </td>
                  <td
                    style={{
                      border: "0px solid #ccc",
                      borderBottom: "1px solid #ccc",
                      textAlign: "center",
                    }}
                  >
                    {closingBalance.totalCredit}
                  </td>
                  <td
                    style={{
                      border: "0px solid #ccc",
                      borderBottom: "1px solid #ccc",
                      textAlign: "center",
                    }}
                  ></td>
                </tr>
                <tr style={{ border: "0px solid #ccc" }}>
                  <td
                    colSpan={4}
                    style={{
                      border: "0px solid #ccc",
                      textAlign: "center",
                    }}
                  >
                    <b>Closing Balance</b>
                  </td>
                  <td
                    style={{
                      border: "0px solid #ccc",
                      textAlign: "center",
                      borderBottom: "1px solid #ccc",
                    }}
                  ></td>
                  <td
                    style={{
                      border: "0px solid #ccc",
                      textAlign: "center",
                      borderBottom: "1px solid #ccc",
                    }}
                  >
                    {closingBalance.totalCredit - closingBalance.totalDebit}
                  </td>
                  <td
                    style={{
                      border: "0px solid #ccc",
                      textAlign: "center",
                      borderBottom: "1px solid #ccc",
                    }}
                  ></td>
                </tr>
                <tr style={{ border: "0px solid #ccc" }}>
                  <td
                    colSpan={4}
                    style={{ border: "0px solid #ccc", textAlign: "center" }}
                  ></td>
                  <td style={{ border: "0px solid #ccc", textAlign: "center" }}>
                    0
                  </td>
                  <td style={{ border: "0px solid #ccc", textAlign: "center" }}>
                    0
                  </td>
                  <td
                    style={{ border: "0px solid #ccc", textAlign: "center" }}
                  ></td>
                </tr>
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default LedgerReport;
