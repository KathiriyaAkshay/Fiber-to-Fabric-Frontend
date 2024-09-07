import {
  Button,
  DatePicker,
  Flex,
  Input,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import { FilePdfOutlined, FileTextOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { usePagination } from "../../../hooks/usePagination";
import { useContext, useState } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
// import { downloadUserPdf, getPDFTitleContent } from "../../../lib/pdf/userPdf";
// import { useCurrentUser } from "../../../api/hooks/auth";
import useDebounce from "../../../hooks/useDebounce";
import { getInHouseQualityListRequest } from "../../../api/requests/qualityMaster";
import { getDropdownSupplierListRequest } from "../../../api/requests/users";
import JobTakaChallanModal from "../../../components/job/jobTaka/JobTakaChallan";
import { getJobTakaListRequest } from "../../../api/requests/job/jobTaka";
import dayjs from "dayjs";
import ViewJobTakaInfo from "../../../components/job/jobTaka/viewJobTakaInfo";

const JobBillList = () => {
  const { companyId } = useContext(GlobalContext);
  // const { data: user } = useCurrentUser();

  // const [state, setState] = useState("current");
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();
  const [isPaid, setIsPaid] = useState();
  const [quality, setQuality] = useState();
  //   const [companyFilter, setCompanyFilter] = useState();
  const [billNo, setBillNo] = useState("");
  const [orderNo, setOrderNo] = useState("");
  const [supplier, setSupplier] = useState();
  //   const [supplierCompany, setSupplierCompany] = useState();

  const debouncedFromDate = useDebounce(fromDate, 500);
  const debouncedToDate = useDebounce(toDate, 500);
  const debouncedIsPaid = useDebounce(isPaid, 500);
  const debouncedQuality = useDebounce(quality, 500);
  //   const debouncedCompanyFilter = useDebounce(companyFilter, 500);
  // const debouncedState = useDebounce(state, 500);
  const debouncedBillNo = useDebounce(billNo, 500);
  const debouncedOrderNo = useDebounce(orderNo, 500);
  const debouncedSupplier = useDebounce(supplier, 500);

  const [jobTakaChallanModal, setJobTakaChallanModal] = useState({
    isModalOpen: false,
    details: null,
    mode: "",
  });
  const handleCloseModal = () => {
    setJobTakaChallanModal((prev) => ({
      ...prev,
      isModalOpen: false,
      mode: "",
    }));
  };
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();
  const { data: jobTakaBillList, isLoading } = useQuery({
    queryKey: [
      "jobTaka",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
        from: debouncedFromDate,
        to: debouncedToDate,
        quality_id: debouncedQuality,
        bill_no: debouncedBillNo,
        order_no: debouncedOrderNo,
        is_paid: debouncedIsPaid,
        supplier_name: debouncedSupplier,
        bill_status: "received",
      },
    ],
    queryFn: async () => {
      const params = {
        company_id: companyId,
        page,
        pageSize,
        quality_id: debouncedQuality,
        bill_no: debouncedBillNo,
        order_no: debouncedOrderNo,
        is_paid: debouncedIsPaid,
        supplier_name: debouncedSupplier,
        bill_status: "received",
      };
      if (debouncedFromDate) {
        params.from = dayjs(debouncedFromDate).format("YYYY-MM-DD");
      }
      if (debouncedToDate) {
        params.to = dayjs(debouncedToDate).format("YYYY-MM-DD");
      }
      const res = await getJobTakaListRequest({
        params,
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const { data: dropDownQualityListRes, isLoading: dropDownQualityLoading } =
    useQuery({
      queryKey: [
        "dropDownQualityListRes",
        "list",
        {
          company_id: companyId,
          page: 0,
          pageSize: 9999,
          is_active: 1,
        },
      ],
      queryFn: async () => {
        const res = await getInHouseQualityListRequest({
          params: {
            company_id: companyId,
            page: 0,
            pageSize: 9999,
            is_active: 1,
          },
        });
        return res.data?.data;
      },
      enabled: Boolean(companyId),
    });

  const {
    data: dropdownSupplierListRes,
    isLoading: isLoadingDropdownSupplierList,
  } = useQuery({
    queryKey: ["dropdown/supplier/list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getDropdownSupplierListRequest({
        params: { company_id: companyId },
      });
      return res.data?.data?.supplierList;
    },
    enabled: Boolean(companyId),
  });

  function downloadPdf() {
    // const { leftContent, rightContent } = getPDFTitleContent({ user, company });
    const body = jobTakaBillList?.rows?.map((item, index) => {
      const {
        challan_no,
        supplier,
        gray_order,
        createdAt,
        inhouse_quality,
        job_taka_bill,
        total_taka,
        total_meter,
      } = item;
      return [
        index + 1,
        challan_no,
        supplier.supplier_name,
        gray_order.order_no,
        dayjs(createdAt).format("DD-MM-YYYY"),
        `${inhouse_quality.quality_name} (${inhouse_quality.quality_weight}KG)`,
        total_taka,
        total_meter,
        job_taka_bill.rate,
        job_taka_bill.amount,
        job_taka_bill.net_amount,
      ];
    });

    const tableTitle = [
      "ID",
      "Bill No",
      "Supplier Name",
      "Order No",
      "Bill Date",
      "Quality",
      "Total Taka",
      "Total Meter",
      "Rate",
      "Amount",
      "Net Amount",
    ];

    // Set localstorage item information
    localStorage.setItem("print-array", JSON.stringify(body));
    localStorage.setItem("print-title", "Job Bill List");
    localStorage.setItem("print-head", JSON.stringify(tableTitle));
    localStorage.setItem("total-count", "0");

    // downloadUserPdf({
    //   body,
    //   head: [["ID", "Challan NO"]],
    //   leftContent,
    //   rightContent,
    //   title: "Job Bill List",
    // });
    window.open("/print");
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Bill Date",
      render: (details) => {
        return dayjs(details.createdAt).format("DD-MM-YYY");
      },
    },
    {
      title: "Order No",
      dataIndex: ["gray_order", "order_no"],
      key: "order_no",
    },
    {
      title: "Supplier Name",
      dataIndex: ["supplier", "supplier_name"],
      key: "supplier_name",
    },
    {
      title: "Bill No",
      dataIndex: ["job_taka_bill", "invoice_no"],
    },
    {
      title: "Quality Name",
      render: (details) => {
        return `${details.inhouse_quality.quality_name} (${details.inhouse_quality.quality_weight}KG)`;
      },
    },
    {
      title: "Total Taka",
      dataIndex: "total_taka",
      key: "total_taka",
    },
    {
      title: "Total Meter",
      dataIndex: "total_meter",
      key: "total_meter",
    },
    {
      title: "Rate",
      dataIndex: ["job_taka_bill", "rate"],
      key: "rate",
    },
    {
      title: "Amount",
      dataIndex: ["job_taka_bill", "amount"],
      key: "amount",
    },
    {
      title: "Net Amount",
      dataIndex: ["job_taka_bill", "net_amount"],
      key: "net_amount",
    },
    {
      title: "Due Date",
      dataIndex: ["job_taka_bill", "due_date"],
      // render: (text) => dayjs(text).format("DD-MM-YYYY"),
      render: () => <div>-</div>,
    },
    {
      title: "Due Days",
      dataIndex: "amount",
      key: "amount",
      render: () => <div>-</div>,
    },
    {
      title: "Bill Status",
      render: (details) => {
        return details.bill_status === "received" ? (
          <Tag color="green">Received</Tag>
        ) : (
          <Tag color="red">Not Received</Tag>
        );
      },
    },
    {
      title: "Payment Status",
      render: (details) => {
        return details.payment_status === "paid" ? (
          <Tag color="green">Paid</Tag>
        ) : (
          <Tag color="red">Un-Paid</Tag>
        );
      },
    },
    {
      title: "Action",
      render: (details) => {
        return (
          <Space>
            <ViewJobTakaInfo details={details} />
            <Button
              onClick={() => {
                let MODE;
                if (details.payment_status === "paid") {
                  MODE = "VIEW";
                } else if (details.payment_status === "not_paid") {
                  MODE = "UPDATE";
                }
                setJobTakaChallanModal((prev) => {
                  return {
                    ...prev,
                    isModalOpen: true,
                    details: details,
                    mode: MODE,
                  };
                });
              }}
            >
              <FileTextOutlined />
            </Button>
            {/* <Button
              onClick={() => {
                navigateToUpdate(details.id);
              }}
            >
              <EditOutlined />
            </Button>
            <DeleteJobTaka details={details} /> */}
          </Space>
        );
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
        dataSource={jobTakaBillList?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          total: jobTakaBillList?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
      />
    );
  }
  return (
    <>
      <div className="flex flex-col p-4">
        {/* <div className="flex items-center justify-end gap-5 mx-3 mb-3">
          <Radio.Group
            name="filter"
            value={state}
            onChange={(e) => setState(e.target.value)}
          >
            <Flex align="center" gap={10}>
              <Radio value={"current"}> Current</Radio>
              <Radio value={"previous"}> Previous </Radio>
            </Flex>
          </Radio.Group>
        </div> */}

        <div className="flex items-center justify-between gap-5 mx-3 mb-3">
          <div className="flex items-center gap-2">
            <h3 className="m-0 text-primary">Job Bill List</h3>
            {/* <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          /> */}
          </div>
          <Flex align="center" gap={10}>
            <Flex align="center" gap={10}>
              {/* <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                Company
              </Typography.Text>
              <Select
                allowClear
                placeholder="Select Quality"
                value={companyFilter}
                options={companyListRes?.rows?.map(
                  ({ company_name = "", id = "" }) => ({
                    label: company_name,
                    value: id,
                  })
                )}
                dropdownStyle={{
                  textTransform: "capitalize",
                }}
                onChange={setCompanyFilter}
                style={{
                  textTransform: "capitalize",
                }}
                className="min-w-40"
              />
            </Flex> */}
              <Flex align="center" gap={10}>
                <Typography.Text className="whitespace-nowrap">
                  Quality
                </Typography.Text>
                <Select
                  allowClear
                  placeholder="Select Quality"
                  loading={dropDownQualityLoading}
                  value={quality}
                  options={
                    dropDownQualityListRes &&
                    dropDownQualityListRes?.rows?.map((item) => ({
                      value: item.id,
                      label: item.quality_name,
                    }))
                  }
                  dropdownStyle={{
                    textTransform: "capitalize",
                  }}
                  onChange={setQuality}
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
                <DatePicker
                  value={fromDate}
                  onChange={setFromDate}
                  className="min-w-40"
                  format={"DD-MM-YYYY"}
                />
              </Flex>

              <Flex align="center" gap={10}>
                <Typography.Text className="whitespace-nowrap">
                  To
                </Typography.Text>
                <DatePicker
                  value={toDate}
                  onChange={setToDate}
                  className="min-w-40"
                  format={"DD-MM-YYYY"}
                />
              </Flex>
            </Flex>
            <Button
              icon={<FilePdfOutlined />}
              type="primary"
              disabled={!jobTakaBillList?.rows?.length}
              onClick={downloadPdf}
              className="flex-none"
            />
          </Flex>
        </div>

        <div className="flex items-center justify-end gap-5 mx-3 mb-3 mt-2">
          <Flex align="center" gap={10}>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                Supplier
              </Typography.Text>
              <Select
                placeholder="Select supplier"
                loading={isLoadingDropdownSupplierList}
                options={dropdownSupplierListRes?.map((supervisor) => ({
                  label: supervisor?.supplier_name,
                  value: supervisor?.supplier_name,
                }))}
                dropdownStyle={{
                  textTransform: "capitalize",
                }}
                value={supplier}
                onChange={setSupplier}
                style={{
                  textTransform: "capitalize",
                }}
                className="min-w-40"
              />
            </Flex>
            {/* <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Supplier Company
            </Typography.Text>
            <Select
              placeholder="Select Company"
              options={dropDownSupplierCompanyOption}
              dropdownStyle={{
                textTransform: "capitalize",
              }}
              value={supplierCompany}
              onChange={setSupplierCompany}
              style={{
                textTransform: "capitalize",
              }}
              className="min-w-40"
            />
          </Flex> */}
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                Bill No
              </Typography.Text>
              <Input
                placeholder="Bill No"
                value={billNo}
                onChange={(e) => setBillNo(e.target.value)}
                style={{ width: "200px" }}
              />
            </Flex>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                Order No
              </Typography.Text>
              <Input
                placeholder="Order NO"
                value={orderNo}
                onChange={(e) => setOrderNo(e.target.value)}
                style={{ width: "200px" }}
              />
            </Flex>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                Payment
              </Typography.Text>
              <Select
                allowClear
                placeholder="Select Type"
                value={isPaid}
                options={[
                  { label: "Un-Paid", value: false },
                  { label: "Paid", value: true },
                ]}
                dropdownStyle={{
                  textTransform: "capitalize",
                }}
                onChange={setIsPaid}
                style={{
                  textTransform: "capitalize",
                }}
                className="min-w-40"
              />
            </Flex>
          </Flex>
        </div>
        {renderTable()}
      </div>
      {jobTakaChallanModal.isModalOpen && (
        <JobTakaChallanModal
          details={jobTakaChallanModal.details}
          isModelOpen={jobTakaChallanModal.isModalOpen}
          handleCloseModal={handleCloseModal}
          MODE={jobTakaChallanModal.mode}
        />
      )}
    </>
  );
};

export default JobBillList;
