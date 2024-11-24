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
import {
  EditOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  PlusCircleOutlined,
  RedoOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usePagination } from "../../../../hooks/usePagination";
import { useContext, useState } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
// import {
//   downloadUserPdf,
//   getPDFTitleContent,
// } from "../../../../lib/pdf/userPdf";
// import { useCurrentUser } from "../../../../api/hooks/auth";
import { getJobTakaListRequest } from "../../../../api/requests/job/jobTaka";
import useDebounce from "../../../../hooks/useDebounce";
import { getInHouseQualityListRequest } from "../../../../api/requests/qualityMaster";
import { getDropdownSupplierListRequest } from "../../../../api/requests/users";
import JobTakaChallanModal from "../../../../components/job/jobTaka/JobTakaChallan";
import dayjs from "dayjs";
import DeleteJobTaka from "../../../../components/job/jobTaka/DeleteJobTaka";
import ViewJobTakaInfo from "../../../../components/job/jobTaka/viewJobTakaInfo";
import moment from "moment";

const JobChallanList = () => {
  const { companyId } = useContext(GlobalContext);
  // const { data: user } = useCurrentUser();
  const navigate = useNavigate();

  //   const [state, setState] = useState("current");
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();
  //   const [type, setType] = useState();
  const [quality, setQuality] = useState();
  const [orderNo, setOrderNo] = useState("");
  const [challanNo, setChallanNo] = useState("");
  const [supplier, setSupplier] = useState();
  //   const [supplierCompany, setSupplierCompany] = useState();

  const debouncedFromDate = useDebounce(fromDate, 500);
  const debouncedToDate = useDebounce(toDate, 500);
  //   const debouncedType = useDebounce(type, 500);
  const debouncedQuality = useDebounce(quality, 500);
  //   const debouncedState = useDebounce(state, 500);
  const debouncedOrderNo = useDebounce(orderNo, 500);
  const debouncedChallanNo = useDebounce(challanNo, 500);
  const debouncedSupplier = useDebounce(supplier, 500);
  //   const debouncedSupplierCompany = useDebounce(supplierCompany, 500);

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

  //   const dropDownSupplierCompanyOption = useMemo(() => {
  //     if (
  //       debouncedSupplier &&
  //       dropdownSupplierListRes &&
  //       dropdownSupplierListRes.length
  //     ) {
  //       const obj = dropdownSupplierListRes.filter((item) => {
  //         return item.supplier_name === debouncedSupplier;
  //       })[0];

  //       return obj?.supplier_company?.map((item) => {
  //         return { label: item.supplier_company, value: item.supplier_id };
  //       });
  //     } else {
  //       return [];
  //     }
  //   }, [debouncedSupplier, dropdownSupplierListRes]);

  const { data: jobChallanList, isLoading } = useQuery({
    queryKey: [
      "job",
      "challan",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
        from: debouncedFromDate,
        to: debouncedToDate,
        quality_id: debouncedQuality,
        challan_no: debouncedChallanNo,
        order_no: debouncedOrderNo,
        supplier_name: debouncedSupplier,
      },
    ],
    queryFn: async () => {
      const res = await getJobTakaListRequest({
        params: {
          company_id: companyId,
          page,
          pageSize,
          from: debouncedFromDate,
          to: debouncedToDate,
          quality_id: debouncedQuality,
          challan_no: debouncedChallanNo,
          order_no: debouncedOrderNo,
          supplier_name: debouncedSupplier,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  function navigateToAdd() {
    navigate("/job/job-taka/add");
  }

  function navigateToUpdate(id) {
    navigate(`/job/job-taka/update/${id}`);
  }

  function downloadPdf() {
    // const { leftContent, rightContent } = getPDFTitleContent({ user, company });
    const body = jobChallanList?.rows?.map((item, index) => {
      const {
        challan_no,
        gray_order,
        createdAt,
        supplier,
        inhouse_quality,
        total_meter,
        total_taka,
        bill_status,
      } = item;
      return [
        index + 1,
        challan_no,
        challan_no,
        gray_order.order_no,
        dayjs(createdAt).format("DD-MM-YYYY"),
        supplier.supplier_name,
        supplier.user.gst_no,
        `${inhouse_quality.quality_name} (${inhouse_quality.quality_weight}KG)`,
        total_taka,
        total_meter,
        bill_status === "received" ? "Received" : "Not Received",
      ];
    });

    const tableTitle = [
      "ID",
      "Bill No",
      "Challan NO",
      "Order No",
      "Challan Date",
      "Supplier Name",
      "Supplier Company GST",
      "Quality",
      "Total Taka",
      "Total Meter",
      "Bill Status",
    ];

    // Set localstorage item information
    localStorage.setItem("print-array", JSON.stringify(body));
    localStorage.setItem("print-title", "Job Challan List");
    localStorage.setItem("print-head", JSON.stringify(tableTitle));
    localStorage.setItem("total-count", "0");

    // downloadUserPdf({
    //   body,
    //   head: [
    //     [
    //       "ID",
    //       "Bill No",
    //       "Challan NO",
    //       "Order No",
    //       "Challan Date",
    //       "Supplier Name",
    //       "Supplier Company GST",
    //       "Quality",
    //       "Total Taka",
    //       "Total Meter",
    //       "Bill Status",
    //     ],
    //   ],
    //   leftContent,
    //   rightContent,
    //   title: "Job Challan Lis",
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
      title: "Challan Date",
      render: (details) => {
        return dayjs(details.createdAt).format("DD-MM-YYYY");
      },
    },
    {
      title: "Quality Name",
      render: (details) => {
        return `${details.inhouse_quality.quality_name} (${details.inhouse_quality.quality_weight}KG)`;
      },
    },
    {
      title: "Challan No",
      render: (details) => {
        return details.challan_no;
      },
    },
    {
      title: "Order No",
      render: (details) => {
        return details.gray_order_id;
      },
    },
    {
      title: "Supplier Name",
      dataIndex: ["supplier", "supplier_name"],
    },
    {
      title: "Taka No",
      dataIndex: "total_taka",
      key: "total_taka",
    },
    {
      title: "Meter",
      dataIndex: "total_meter",
      key: "total_meter",
    },
    {
      title: "Weight",
      dataIndex: "total_weight",
      key: "total_weight",
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
                navigateToUpdate(details.id);
              }}
            >
              <EditOutlined />
            </Button>
            <DeleteJobTaka details={details} />
            <Button
              onClick={() => {
                let MODE;
                if (details.payment_status === "paid") {
                  MODE = "VIEW";
                } else if (details.payment_status === "not_paid") {
                  MODE = "ADD";
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
            <Button
              onClick={() => {
                localStorage.setItem(
                  "SALE_CHALLAN_ADD",
                  JSON.stringify({ model: "job", id: details.id })
                );
                navigate("/sales/challan/sale-challan/add");
              }}
            >
              <RedoOutlined />
            </Button>
          </Space>
        );
      },
    },
  ];

  function disabledFutureDate(current) {
    // Disable dates after today
    return current && current > moment().endOf("day");
  }

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
        dataSource={jobChallanList?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          total: jobChallanList?.rows?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
        summary={(pageData) => {
          let totalMeter = 0;
          let totalTaka = 0;
          pageData.forEach(({ total_meter, total_taka }) => {
            totalMeter += +total_meter;
            totalTaka += +total_taka;
          });

          return (
            <>
              <Table.Summary.Row className="font-semibold">
                <Table.Summary.Cell>Total</Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell>
                  <Typography.Text>{totalTaka}</Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <Typography.Text>{totalMeter}</Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
              </Table.Summary.Row>
              <Table.Summary.Row className="font-semibold">
                <Table.Summary.Cell>
                  Grand <br />
                  Total
                </Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell>
                  <Typography.Text>
                    {jobChallanList?.total_taka}
                  </Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <Typography.Text>
                    {jobChallanList?.total_meter}
                  </Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell />
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
    <>
      <div className="flex flex-col p-4">
        <div className="flex items-center justify-between gap-5 mx-3 mb-3">
          <div className="flex items-center gap-2">
            <h3 className="m-0 text-primary">Job Challan List</h3>
            <Button
              onClick={navigateToAdd}
              icon={<PlusCircleOutlined />}
              type="text"
            />
          </div>
          <Flex align="center" gap={10}>
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
                  allowClear
                />
              </Flex>
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
                  disabledDate={disabledFutureDate}
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
                  disabledDate={disabledFutureDate}
                />
              </Flex>
            </Flex>
            <Button
              icon={<FilePdfOutlined />}
              type="primary"
              disabled={!jobChallanList?.rows?.length}
              onClick={downloadPdf}
              className="flex-none"
            />
          </Flex>
        </div>

        <div className="flex items-center justify-end gap-5 mx-3 mb-3 mt-2">
          <Flex align="center" gap={10}>
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
                Challan No
              </Typography.Text>
              <Input
                placeholder="Challan NO"
                value={challanNo}
                onChange={(e) => setChallanNo(e.target.value)}
                style={{ width: "200px" }}
              />
            </Flex>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                Order No
              </Typography.Text>
              <Input
                placeholder="Order No"
                value={orderNo}
                onChange={(e) => setOrderNo(e.target.value)}
                style={{ width: "200px" }}
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

export default JobChallanList;
