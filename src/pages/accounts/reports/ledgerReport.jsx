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
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import dayjs from "dayjs";
import { getLedgerReportService } from "../../../api/requests/accounts/reports";
import { getParticularListRequest } from "../../../api/requests/accounts/particular";
import { PARTICULAR_OPTIONS } from "../../../constants/account";
import { JOB_TAG_COLOR, PURCHASE_TAG_COLOR } from "../../../constants/tag";

const BILL_TYPE = [
  { label: "GST", value: "gst" },
  { label: "Cash", value: "cash" },
  { label: "GST & Cash", value: "gst_cash" },
];

const LedgerReport = () => {
  const { companyListRes } = useContext(GlobalContext);

  const [selectedCompany, setSelectedCompany] = useState(null);
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
  };

  const {
    data: ledgerReportData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "ledger-report",
      "list",
      {
        isSubmitted,
      },
    ],
    queryFn: async () => {
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
      return res.data?.data;
    },
    enabled: Boolean(isSubmitted),
  });

  useEffect(() => {
    if (isError) {
      setIsSubmitted(false);
    }
  }, [isError]);

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
                maxWidth: "200px",
              }}
              loading={isLoadingParticular}
              value={particular}
              //   onChange={(_, value) => setParticular(value)}
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
                  key={`party-${party?.id}`}
                  value={`party-${party?.id}`}
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
                  key={`supplier-${supplier?.id}`}
                  value={`supplier-${supplier?.id}`}
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
        {isLoading ? (
          <Flex
            justify="center"
            align="center"
            style={{ height: "200px", width: "100%" }}
          >
            <Spin />
          </Flex>
        ) : (
          <>
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
                  <td>Particulars</td>
                  <td>Vch Type</td>
                  <td>Vch No.</td>
                  <td>Debit</td>
                  <td>Credit</td>
                  <td>Cumulative Balance</td>
                </tr>
              </thead>
              <tbody>
                {ledgerReportData && ledgerReportData?.groupedResults.length ? (
                  ledgerReportData?.groupedResults?.map((_, index) => {
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
                    <td colSpan={7} style={{ textAlign: "center" }}>
                      No records found
                    </td>
                  </tr>
                )}
                <tr
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
                </tr>
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
                </tr>
                <tr style={{ border: "0px solid #ccc" }}>
                  <td
                    colSpan={4}
                    style={{ border: "0px solid #ccc", textAlign: "center" }}
                  >
                    Closing Balance
                  </td>
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
