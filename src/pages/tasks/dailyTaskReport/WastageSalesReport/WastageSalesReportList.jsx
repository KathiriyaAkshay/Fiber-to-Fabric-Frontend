import {
  Button,
  DatePicker,
  Flex,
  Input,
  message,
  Popconfirm,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import { FilePdfOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { usePagination } from "../../../../hooks/usePagination";
import { useContext, useState } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import useDebounce from "../../../../hooks/useDebounce";
import {
  getWastageSaleReportListRequest,
  updateWastageSaleReportRequest,
} from "../../../../api/requests/reports/wastageSaleReport";
import GoBackButton from "../../../../components/common/buttons/GoBackButton";
import moment from "moment";

function WastageSalesReportList() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [toDate, setToDate] = useState();
  const debouncedToDate = useDebounce(
    toDate && dayjs(toDate).format("YYYY-MM-DD"),
    500
  );
  const [fromDate, setFromDate] = useState();
  const debouncedFromDate = useDebounce(
    fromDate && dayjs(fromDate).format("YYYY-MM-DD"),
    500
  );
  const { companyId } = useContext(GlobalContext);
  const navigate = useNavigate();
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  // const { data: user } = useCurrentUser();

  const { data: reportListRes, isLoading: isLoadingReportList } = useQuery({
    queryKey: [
      "reports/wastage-sale-report/list",
      {
        company_id: companyId,
        page,
        pageSize,
        search: debouncedSearch,
        toDate: debouncedToDate,
        fromDate: debouncedFromDate,
      },
    ],
    queryFn: async () => {
      const res = await getWastageSaleReportListRequest({
        companyId,
        params: {
          company_id: companyId,
          page,
          pageSize,
          search: debouncedSearch,
          toDate: debouncedToDate,
          fromDate: debouncedFromDate,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const {
    mutateAsync: updateWastageSalesReport,
    isPending: isWastageSalesUpdating,
  } = useMutation({
    mutationFn: async ({ data, id }) => {
      const res = await updateWastageSaleReportRequest({
        id,
        data,
        params: { company_id: companyId },
      });
      return res.data;
    },
    mutationKey: ["reports/wastage-sale-report/update"],
    onSuccess: (res) => {
      QueryClient.invalidateQueries(["reports", "list", companyId]);
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      navigate(-1);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(errorMessage);
    },
  });

  const onConfirmWastage = async (id) => {
    const data = {
      is_confirm: true,
    };

    await updateWastageSalesReport({ data, id });
  };

  function navigateToAdd() {
    navigate("/tasks/daily-task-report/wastage-sales-report/add");
  }

  function downloadPdf() {
    // const { leftContent, rightContent } = getPDFTitleContent({ user, company });

    let totalPis = 0;
    let totalRetPerPis = 0;
    let totalTotal = 0;

    const body = reportListRes?.row?.map((report) => {
      const {
        id,
        particular,
        particular_type,
        pis,
        rate_par_pis,
        total,
        notes,
        report_date,
      } = report;

      totalPis += pis;
      totalRetPerPis += rate_par_pis;
      totalTotal += total;

      return [
        id,
        dayjs(report_date).format("DD-MM-YYYY"),
        particular,
        particular_type,
        pis,
        rate_par_pis,
        total,
        notes,
      ];
    });

    const tableTitle = [
      "ID",
      "Date",
      "Particular",
      "Type",
      "Pis/KG",
      "Rate per Pis/KG/Meter",
      "Total",
      "Notes",
    ];
    const total = [
      "Total",
      "",
      "",
      "",
      totalPis,
      totalRetPerPis,
      totalTotal,
      "",
    ];

    // Set localstorage item information
    localStorage.setItem("print-array", JSON.stringify(body));
    localStorage.setItem("print-title", "Wastage Sales Report");
    localStorage.setItem("print-head", JSON.stringify(tableTitle));
    localStorage.setItem("total-count", "1");
    localStorage.setItem("total-data", JSON.stringify(total));

    // downloadUserPdf({
    //   body,
    //   head: [
    //     [
    //       "ID",
    //       "Date",
    //       "Particular",
    //       "Type",
    //       "Pis/KG",
    //       "Rate per Pis/KG/Meter",
    //       "Total",
    //       "Notes",
    //     ],
    //   ],
    //   leftContent,
    //   rightContent,
    //   title: "Wastage Sales Report",
    // });
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
      key: "report_date",
      render: ({ report_date }) => {
        return dayjs(report_date).format("DD-MM-YYYY");
      },
    },
    {
      title: "Particular",
      dataIndex: "particular",
      key: "particular",
    },
    {
      title: "Type",
      dataIndex: "particular_type",
      key: "particular_type",
    },
    {
      title: "Pis/KG",
      dataIndex: "pis",
      key: "pis",
    },
    {
      title: "Rate per Pis/KG/Meter",
      dataIndex: "rate_par_pis",
      key: "rate_par_pis",
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
    },
    {
      title: "Status",
      dataIndex: "is_confirm",
      key: "is_confirm",
      render: (text, record) =>
        text == false ? (
          <>
            <Popconfirm
              title="Wastage Sales Conformation"
              description="Are you sure you want to confirm this Entry ?"
              onConfirm={() => {
                onConfirmWastage(record?.id);
              }}
              okButtonProps={{
                loading: isWastageSalesUpdating,
              }}
            >
              <div>
                <Tag color="red">Pending</Tag>
              </div>
            </Popconfirm>
          </>
        ) : (
          <div>
            <Tag color="green">Confirmed</Tag>
          </div>
        ),
    },
  ];

  const disableFutureDates = (current) => {
    // Check if the current date is after (or equal to) the end of the current day
    return current && current > moment().endOf("day");
  };

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
        dataSource={reportListRes?.row || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          current: page + 1,
          pageSize: pageSize,
          total: reportListRes?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
        summary={() => {
          if (!reportListRes?.row?.length) return;

          const totalRatePerPis = reportListRes?.row?.reduce(
            (accumulator, { rate_par_pis = 0 }) => {
              return accumulator + rate_par_pis;
            },
            0
          );
          const finalTotal = reportListRes?.row?.reduce(
            (accumulator, { total = 0 }) => {
              return accumulator + total;
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
                <Table.Summary.Cell>
                  <Typography.Text>{totalRatePerPis}</Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <Typography.Text>{finalTotal}</Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell />
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
          <GoBackButton />
          <h3 className="m-0 text-primary">Wastage Sales report</h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>
        <Flex align="center" gap={10} wrap="wrap">
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              From
            </Typography.Text>
            <DatePicker
              allowClear={true}
              style={{
                width: "200px",
              }}
              format="YYYY-MM-DD"
              value={fromDate}
              onChange={setFromDate}
              disabledDate={disableFutureDates}
            />
          </Flex>

          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">To</Typography.Text>
            <DatePicker
              allowClear={true}
              style={{
                width: "200px",
              }}
              format="YYYY-MM-DD"
              value={toDate}
              onChange={setToDate}
              disabledDate={disableFutureDates}
            />
          </Flex>

          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "200px",
            }}
          />

          <Button
            icon={<FilePdfOutlined />}
            type="primary"
            disabled={!reportListRes?.row?.length}
            onClick={downloadPdf}
          />
        </Flex>
      </div>
      {renderTable()}
    </div>
  );
}

export default WastageSalesReportList;
