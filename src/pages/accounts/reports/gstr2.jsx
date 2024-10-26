import { PrinterOutlined } from "@ant-design/icons";
import {
  Button,
  DatePicker,
  Drawer,
  Flex,
  Select,
  Spin,
  Table,
  Typography,
} from "antd";
import React, { useContext, useEffect, useMemo, useState } from "react";
import "./_style.css";
import { gstr2_dialog_columns, gstr2_dialog_data } from "./utils";
import { GlobalContext } from "../../../contexts/GlobalContext";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { getGstr2ReportService } from "../../../api/requests/accounts/reports";

const Gstr2 = () => {
  const { companyListRes } = useContext(GlobalContext);

  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [company, setCompany] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const [isParticularOpen, setIsParticularOpen] = React.useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submitHandler = () => {
    if (company && companyListRes) {
      const companyData = companyListRes?.rows?.find(
        ({ id }) => id === company
      );
      console.log({ companyData });
      setSelectedCompany(companyData);
    }
    setIsSubmitted(true);
  };

  const columns = [
    { title: "Sl No.", dataIndex: "key", key: "key" },
    {
      title: "Particulars",
      dataIndex: "particulars",
      key: "particulars",
      // render: (text) => <a onClick={() => setIsParticularOpen(text)}>{text}</a>,
      render: (text, record) => (
        <a onClick={() => printHandler(record)}>{text}</a>
      ),
    },
    {
      title: "Voucher Count",
      dataIndex: "voucher_count",
      key: "voucher_count",
      render: (text) => text || 0,
    },
    {
      title: "Taxable Amount",
      dataIndex: "taxable_amount",
      key: "taxable_amount",
      render: (text) => text || 0,
    },
    {
      title: "Tax Amount",
      dataIndex: "tax_amount",
      key: "tax_amount",
      render: (text) => text || 0,
    },
  ];

  const { data: gstr2Data, isFetching: isLoadingGstr2 } = useQuery({
    queryKey: ["gstr-1", "report", "data"],
    queryFn: async () => {
      const res = await getGstr2ReportService({
        params: {
          company_id: company,
          from: dayjs(fromDate).format("YYYY-MM-DD"),
          to: dayjs(toDate).format("YYYY-MM-DD"),
        },
      });
      setIsSubmitted(false);
      return res.data?.data;
    },
    enabled: isSubmitted,
  });
  console.log({ gstr2Data });

  const data = useMemo(() => {
    if (gstr2Data && Object.keys(gstr2Data).length) {
      //
      let payload = [];
      payload.push({
        key: 1,
        ...gstr2Data?.b2b_totals,
        particulars: "B2B Invoices - 3, 4A",
      });

      payload.push({
        key: 2,
        ...gstr2Data?.debit_credit_total,
        particulars: "Credit/Debit Notes(Registered)-9B",
      });

      payload.push({
        key: 3,
        voucher_count:
          (gstr2Data?.b2b_totals?.voucher_count || 0) -
          (gstr2Data?.debit_credit_totals?.voucher_count || 0),
        // central_tax:
        //   (gstr2Data?.b2b_totals?.central_tax || 0) -
        //   (gstr2Data?.debit_credit_totals?.central_tax || 0),
        // integrated_tax:
        //   (gstr2Data?.b2b_totals?.integrated_tax || 0) -
        //   (gstr2Data?.debit_credit_totals?.integrated_tax || 0),
        // invoice_amount:
        //   (gstr2Data?.b2b_totals?.invoice_amount || 0) -
        //   (gstr2Data?.debit_credit_totals?.invoice_amount || 0),
        // state_tax:
        //   (gstr2Data?.b2b_totals?.state_tax || 0) -
        //   (gstr2Data?.debit_credit_totals?.state_tax || 0),
        tax_amount:
          (gstr2Data?.b2b_totals?.tax_amount || 0) -
          (gstr2Data?.debit_credit_totals?.tax_amount || 0),
        taxable_amount:
          (gstr2Data?.b2b_totals?.taxable_amount || 0) -
          (gstr2Data?.debit_credit_totals?.taxable_amount || 0),
        particulars: "HSN-wise Summary of Inward Suppliers-12",
      });

      return payload;
    }
  }, [gstr2Data]);

  const totalVoucher = useMemo(() => {
    if (data && data.length) {
      let total = 0;
      total = (data[0]?.voucher_count || 0) + (data[1]?.voucher_count || 0);
      return total;
    } else {
      return 0;
    }
  }, [data]);

  // -------- Print functionality.....

  function printHandler(record) {
    localStorage.setItem("print-title", "Gstr-report-2");
    localStorage.setItem("gstr-report-data", JSON.stringify(gstr2Data));
    localStorage.setItem(
      "gstr-report-data-company",
      JSON.stringify(selectedCompany)
    );

    window.open(`gstr-report/print/${record.key}`);
  }

  useEffect(() => {
    const today = dayjs(); // Get today's date using dayjs

    // Get the first day of the current month
    const firstDayOfMonth = dayjs().startOf("month");

    // Set the default values
    setFromDate(firstDayOfMonth);
    setToDate(today);
  }, []);

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary">GSTR-2 Report</h3>
        </div>
        <div className="flex items-center justify-end gap-5 mx-3 mb-3 mt-2">
          <Flex align="center" gap={10}>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                Company
              </Typography.Text>
              <Select
                placeholder="Select Company"
                dropdownStyle={{
                  textTransform: "capitalize",
                }}
                style={{
                  textTransform: "capitalize",
                }}
                className="min-w-40"
                value={company}
                onChange={(value) => setCompany(value)}
                options={
                  companyListRes &&
                  companyListRes?.rows.map((company) => {
                    return {
                      label: company?.company_name,
                      value: company?.id,
                    };
                  })
                }
              />
            </Flex>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                From
              </Typography.Text>
              <DatePicker
                value={fromDate}
                onChange={(selectedDate) => setFromDate(selectedDate)}
              />
            </Flex>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                To
              </Typography.Text>
              <DatePicker
                value={toDate}
                onChange={(selectedDate) => setToDate(selectedDate)}
              />
            </Flex>

            <Button type="primary" onClick={submitHandler}>
              SUBMIT
            </Button>
            <Button type="primary">CONFIRM GST</Button>
            <Button type="primary">EXPORT</Button>
          </Flex>
        </div>
      </div>
      <div className="container mx-auto  gstr-table">
        {isLoadingGstr2 ? (
          <Flex justify="center" align="center" style={{ height: "200px" }}>
            <Spin />
          </Flex>
        ) : gstr2Data && Object.keys(gstr2Data).length ? (
          <div className="border p-4 rounded-lg shadow">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold">
                {selectedCompany?.company_name || ""}
              </h2>
              <p className="text-gray-400 w-80 m-auto text-center text-sm">
                {selectedCompany?.address_line_1 || ""}
              </p>
              <p className="text-gray-400 w-80 m-auto text-center text-sm">
                {selectedCompany?.address_line_2 || ""}
              </p>
              <p>GSTR-2</p>
              {fromDate && toDate ? (
                <p>
                  {fromDate && dayjs(fromDate).format("DD-MM-YYYY")} to{" "}
                  {toDate && dayjs(toDate).format("DD-MM-YYYY")}
                </p>
              ) : null}
            </div>
            <Flex justify="space-between">
              <div>
                <span className="font-semibold">GSTIN/UIN:</span>{" "}
                {selectedCompany?.gst_no || ""}
              </div>
              {fromDate && toDate ? (
                <div>
                  {fromDate && dayjs(fromDate).format("DD-MM-YYYY")} to{" "}
                  {toDate && dayjs(toDate).format("DD-MM-YYYY")}
                </div>
              ) : null}
            </Flex>
            <hr />
            {/* header */}
            <Flex justify="space-between" className="font-semibold text-base">
              <div>Particulars</div>
              <div>Vouchers Count</div>
            </Flex>
            <hr className="border-x-gray-100" />
            {/* content */}
            <Flex justify="space-between" className="text-sm">
              <div>Total Vouchers</div>
              <div style={{ marginRight: "1rem" }}>{totalVoucher}</div>
            </Flex>
            <Flex justify="space-between" className="text-sm">
              <div>Included in Return</div>
              <div style={{ marginRight: "1rem" }}>{totalVoucher}</div>
            </Flex>
            <hr className="border-x-gray-100" />

            <div className="my-4">
              <Table
                columns={columns}
                dataSource={data}
                pagination={false}
                summary={(pageData) => {
                  const totalData = pageData.find(({ key }) => key === 3);

                  return (
                    <Table.Summary fixed>
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={2}>
                          <strong>Total</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>
                          <strong>{totalVoucher || 0}</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={6}>
                          <strong>{totalData?.taxable_amount || 0}</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={6}>
                          <strong>{totalData?.tax_amount || 0}</strong>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    </Table.Summary>
                  );
                }}
              />
            </div>
            <div className="mt-4 text-red-500 text-sm">
              <p>
                * Challan number found as bill status is pending to be received
                which are as follows:
              </p>
            </div>
            <div className="text-sm">
              <div>
                {" "}
                <b>Grey purchase</b> : 1009, 1000, 162002, 670076, 2422, 67,
                10000, 12
              </div>
              <div>
                <b>Yarn purchase</b> : 56546, 121, 2134, 23432, 12321, 123214,
                1233, 101~1
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h2>No report available</h2>
          </div>
        )}
      </div>
      <Drawer
        title={isParticularOpen}
        onClose={() => setIsParticularOpen("")}
        open={isParticularOpen !== "" ? true : false}
        width={"1000"}
        className="gstr-table"
        extra={<Button icon={<PrinterOutlined />}>Print</Button>}
      >
        <Table
          columns={gstr2_dialog_columns}
          dataSource={gstr2_dialog_data}
          pagination={false}
        />
      </Drawer>
      {/* {renderTable()} */}
    </div>
  );
};

export default Gstr2;
