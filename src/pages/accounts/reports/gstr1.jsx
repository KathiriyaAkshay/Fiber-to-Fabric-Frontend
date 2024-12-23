import { useContext, useEffect, useMemo, useState } from "react";
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
import "./_style.css";
import { gstr1_dialog_columns, gstr1_dialog_data } from "./utils";
import { GlobalContext } from "../../../contexts/GlobalContext";
import dayjs from "dayjs";
import { getGstr1ReportService } from "../../../api/requests/accounts/reports";
import { useQuery } from "@tanstack/react-query";
import ConfirmGstModal from "./confirmGstModal";
import moment from "moment";

const Gstr1 = () => {
  const { companyListRes } = useContext(GlobalContext);

  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [company, setCompany] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const [isParticularOpen, setIsParticularOpen] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  function disabledFutureDate(current) {
    return current && current > moment().endOf("day");
  }

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
      render: (text, record) => (
        <a onClick={() => printHandler(record)} style={{
          fontWeight: 600
        }}>{text}</a>
      ),
    },
    {
      title: "Voucher Count",
      dataIndex: "voucher_count",
      key: "voucher_count",
    },
    {
      title: "Taxable Amount",
      dataIndex: "taxable_amount",
      key: "taxable_amount",
    },
    { 
      title: "Central Tax", 
      dataIndex: "central_tax", 
      key: "central_tax", 
      render: (text, record) => {
        return(
          <div>{parseFloat(text).toFixed(2)}</div>
        )
      }
    },
    { 
      title: "State Tax", 
      dataIndex: "state_tax", 
      key: "state_tax" , 
      render: (text, record) => {
        return(
          <div>{parseFloat(text).toFixed(2)}</div>
        )
      }
    },
    {
      title: "Integrated Tax",
      dataIndex: "integrated_tax",
      key: "integrated_tax",
      render: (text, record) => {
        return(
          <div>{parseFloat(text).toFixed(2)}</div>
        )
      }
    },
    { 
      title: "Tax Amount", 
      dataIndex: "tax_amount", 
      key: "tax_amount" , 
      render: (text, record) => {
        return(
          <div>{parseFloat(text).toFixed(2)}</div>
        )
      }
    },
    {
      title: "Invoice Amount",
      dataIndex: "invoice_amount",
      key: "invoice_amount",
      render: (text, record) => {
        return(
          <div>{parseFloat(text).toFixed(2)}</div>
        )
      }
    },
  ];

  const { data: gstr1Data, isFetching: isLoadingGstr1 } = useQuery({
    queryKey: ["gstr-1", "report", "data"],
    queryFn: async () => {
      const res = await getGstr1ReportService({
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

  const data = useMemo(() => {
    if (gstr1Data && Object.keys(gstr1Data).length) {
      let payload = [];
      payload.push({
        key: 1,
        ...gstr1Data?.b2b_totals,
        particulars: "B2B Invoices - 4A,4B,4C,6B,6C",
      });

      payload.push({
        key: 2,
        ...gstr1Data?.debit_credit_totals,
        particulars: "Credit/Debit Notes(Registered)-9B",
      });

      payload.push({
        key: 3,
        voucher_count:
          (gstr1Data?.b2b_totals?.voucher_count || 0) -
          (gstr1Data?.debit_credit_totals?.voucher_count || 0),
        central_tax:
          (gstr1Data?.b2b_totals?.central_tax || 0) -
          (gstr1Data?.debit_credit_totals?.central_tax || 0),
        integrated_tax:
          (gstr1Data?.b2b_totals?.integrated_tax || 0) -
          (gstr1Data?.debit_credit_totals?.integrated_tax || 0),
        invoice_amount:
          (gstr1Data?.b2b_totals?.invoice_amount || 0) -
          (gstr1Data?.debit_credit_totals?.invoice_amount || 0),
        state_tax:
          (gstr1Data?.b2b_totals?.state_tax || 0) -
          (gstr1Data?.debit_credit_totals?.state_tax || 0),
        tax_amount:
          (gstr1Data?.b2b_totals?.tax_amount || 0) -
          (gstr1Data?.debit_credit_totals?.tax_amount || 0),
        taxable_amount:
          (gstr1Data?.b2b_totals?.taxable_amount || 0) -
          (gstr1Data?.debit_credit_totals?.taxable_amount || 0),
        particulars: "HSN-wise Summary of Outward Suppliers-12",
      });

      return payload;
    }
  }, [gstr1Data]);

  const totalVoucher = useMemo(() => {
    if (data && data.length) {
      let total = 0;
      total = (data[0]?.voucher_count || 0) + (data[1]?.voucher_count || 0);
      return total;
    } else {
      return 0;
    }
  }, [data]);

  useEffect(() => {
    const today = dayjs(); // Get today's date using dayjs

    // Get the first day of the current month
    const firstDayOfMonth = dayjs().startOf("month");

    // Set the default values
    setFromDate(firstDayOfMonth);
    setToDate(today);
  }, []);

  // -------- Print functionality.....

  function printHandler(record) {
    localStorage.setItem("print-title", "Gstr-report-1");
    localStorage.setItem("gstr-report-data", JSON.stringify(gstr1Data));
    localStorage.setItem(
      "gstr-report-data-company",
      JSON.stringify(selectedCompany)
    );

    window.open(`gstr-report/print/${record.key}`);
  }

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary">GSTR-1 Report</h3>
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
                disabledDate={disabledFutureDate}
              />
            </Flex>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                To
              </Typography.Text>
              <DatePicker
                value={toDate}
                onChange={(selectedDate) => setToDate(selectedDate)}
                disabledDate={disabledFutureDate}
              />
            </Flex>

            <Button onClick={submitHandler} color="green" >
              SUBMIT
            </Button>
            <ConfirmGstModal />
            <Button type="primary">EXPORT</Button>
          </Flex>
        </div>
      </div>
      <div className="container mx-auto  gstr-table">
        {isLoadingGstr1 ? (
          <Flex justify="center" align="center" style={{ height: "200px" }}>
            <Spin />
          </Flex>
        ) : gstr1Data && Object.keys(gstr1Data).length ? (
          <div className="border p-4 rounded-lg shadow">

            {/* GSTR1 Report information  */}
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
              <p>GSTR-1</p>
              {fromDate && toDate ? (
                <p style={{
                  fontWeight: 600
                }}>
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
                <div style={{
                  fontWeight: 600
                }}>
                  {fromDate && dayjs(fromDate).format("DD-MM-YYYY")} to{" "}
                  {toDate && dayjs(toDate).format("DD-MM-YYYY")}
                </div>
              ) : null}
            </Flex>
            <hr />

            {/* Particular Header */}
            <Flex justify="space-between" className="font-semibold text-base">
              <div>Particulars</div>
              <div>Vouchers Count</div>
            </Flex>
            <hr className="border-x-gray-100" />
            
            <Flex justify="space-between" className="text-sm">
              <div>Total Vouchers</div>
              <div style={{ marginRight: "1rem" }}>{totalVoucher}</div>
            </Flex>
            
            {/* <Flex justify="space-between" className="text-sm">
              <div>Included in Return</div>
              <div style={{ marginRight: "1rem" }}>{totalVoucher}</div>
            </Flex> */}
            
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
                          <strong>{totalVoucher}</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={2}>
                          <strong>{totalData?.taxable_amount || 0}</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={3}>
                          <strong>{totalData?.central_tax || 0}</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={4}>
                          <strong>{totalData?.state_tax || 0}</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={5}>
                          <strong>{totalData?.integrated_tax || 0}</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={6}>
                          <strong>{totalData?.tax_amount || 0}</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={6}>
                          <strong>{totalData?.invoice_amount || 0}</strong>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    </Table.Summary>
                  );
                }}
              />
            </div>
            <div className="mt-4 text-red-500 text-sm">
              <p>
                * Zero tax rate invoice are found and removed in this report
                such as J-23, J-68, J-23432... invoice numbers.
              </p>
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
          columns={gstr1_dialog_columns}
          dataSource={gstr1_dialog_data}
          pagination={false}
        />
      </Drawer>
    </div>
  );
};

export default Gstr1;
