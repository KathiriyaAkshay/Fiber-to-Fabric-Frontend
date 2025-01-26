import { DatePicker, Flex, Select, Spin, Table, Typography } from "antd";
import dayjs from "dayjs";
import { useContext, useMemo, useState } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { useQuery } from "@tanstack/react-query";
import { getMonthlyTransactionReportService } from "../../../api/requests/accounts/reports";
import moment from "moment";

const MonthlyTransactionReport = () => {
  const { companyListRes } = useContext(GlobalContext);

  const [date, setDate] = useState(dayjs());
  const [selectedCompany, setSelectedCompany] = useState("all");

  const companyOptions = useMemo(() => {
    if (companyListRes && companyListRes?.rows?.length) {
      const data = companyListRes?.rows.map(({ company_name, id }) => {
        return { label: company_name, value: id };
      });
      data.push({ label: "All", value: "all" });
      return data;
    } else {
      return [];
    }
  }, [companyListRes]);

  const companies = useMemo(() => {
    if (companyListRes && companyListRes?.rows?.length && selectedCompany) {
      if (selectedCompany === "all") {
        return [...companyListRes.rows];
      } else {
        return companyListRes.rows.filter(
          (item) => selectedCompany === item.id
        );
      }
    }
  }, [companyListRes, selectedCompany]);

  function disabledFutureDate(current) {
    return current && current > moment().endOf("day");
  }

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary">Monthly Transaction Report</h3>
        </div>
        <Flex align="center" gap={10}>
          <Flex align="center" gap={10}>
            <DatePicker
              value={date}
              onChange={setDate}
              className="min-w-40"
              format={"MM-YYYY"}
              picker="month"
              allowClear={false}
              disabledDate={disabledFutureDate}
            />
          </Flex>

          <Flex align="center" gap={10}>
            <Select
              allowClear
              placeholder="Select Party"
              value={selectedCompany}
              onChange={setSelectedCompany}
              options={companyOptions || []}
              dropdownStyle={{
                textTransform: "capitalize",
              }}
              style={{
                textTransform: "capitalize",
              }}
              className="min-w-40"
            />
          </Flex>
        </Flex>
      </div>

      {companies && companies?.length ? (
        companies.map((company, index) => {
          return (
            <MonthReport
              key={index + "_monthly_report_company_wise"}
              company={company}
              companyId={company.id}
              date={date}
            />
          );
        })
      ) : (
        <Typography.Text>Please select company</Typography.Text>
      )}
    </div>
  );
};

export default MonthlyTransactionReport;

const MonthReport = ({ company, companyId, date }) => {
  const { data: monthlyTransactionData, isLoading } = useQuery({
    queryKey: [
      "get",
      "passbook-cashbook-report",
      { company_id: companyId, month: dayjs(date).format("MM-YYYY") },
    ],
    queryFn: async () => {
      const res = await getMonthlyTransactionReportService({
        params: {
          company_id: companyId,
          month: dayjs(date).format("MM-YYYY"),
        },
      });
      return res?.data?.data;
    },
    enabled: !!companyId,
  });

  const columns = [
    {
      title: "Particular",
      dataIndex: "particular_type",
      key: "particular_type",
      render: (text) => text || "-",
    },
    {
      title: "Withdrawals",
      dataIndex: "amount",
      key: "amount",
      render: (text, record) => {
        return record.is_withdraw ? text : "0";
      },
    },
    {
      title: "Deposit",
      dataIndex: "amount",
      key: "amount",
      render: (text, record) => {
        return !record.is_withdraw ? text : "0";
      },
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
        dataSource={
          monthlyTransactionData &&
          monthlyTransactionData["OPENING BALANCE"].length
            ? monthlyTransactionData["OPENING BALANCE"]
            : []
        }
        columns={columns}
        rowKey={"id"}
        scroll={{ y: 330 }}
        pagination={false}
        summary={(pageData) => {
          let totalWithdraw = 0;
          let totalDeposit = 0;

          pageData.forEach((item) => {
            const withdraw = item.is_withdraw ? item.amount : 0;
            const deposit = !item.is_withdraw ? item.amount : 0;

            totalWithdraw += +withdraw;
            totalDeposit += +deposit;
          });
          return (
            <Table.Summary>
              <Table.Summary.Row>
                <Table.Summary.Cell>Total</Table.Summary.Cell>
                <Table.Summary.Cell>{totalWithdraw}</Table.Summary.Cell>
                <Table.Summary.Cell>{totalDeposit}</Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          );
        }}
      />
    );
  }

  return (
    <>
      <div
        style={{
          textAlign: "center",
          backgroundColor: "var(--secondary-color)",
          color: "rgb(25 74 109)",
          fontWeight: "600",
          padding: "6px",
          borderRadius: "10px",
        }}
      >
        {company?.company_name || ""} ({dayjs(date).format("MMMM-YYYY")})
      </div>
      {renderTable()}
      <br />
    </>
  );
};
