import { useState } from "react";
import {
  Button,
  Flex,
  Space,
  Spin,
  Table,
  Typography,
  Select,
  Input,
  Radio,
  DatePicker,
  Tag,
} from "antd";
import {
  EditOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useContext } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { usePagination } from "../../../../hooks/usePagination";
import SaleBillComp from "../../../../components/sale/bill/saleBillComp";
// import {
//   downloadUserPdf,
//   getPDFTitleContent,
// } from "../../../../lib/pdf/userPdf";
import { useQuery } from "@tanstack/react-query";
import { getPartyListRequest } from "../../../../api/requests/users";
import { getInHouseQualityListRequest } from "../../../../api/requests/qualityMaster";
import useDebounce from "../../../../hooks/useDebounce";
// import { useCurrentUser } from "../../../../api/hooks/auth";
import { useNavigate } from "react-router-dom";
import { ORDER_TYPE } from "../../../../constants/orderMaster";
import { getSaleBillListRequest } from "../../../../api/requests/sale/bill/saleBill";
import dayjs from "dayjs";
import DeleteSaleBill from "../../../../components/sale/bill/DeleteSaleBill";
import moment from "moment";

const SaleBillList = () => {
  const { companyId, companyListRes } = useContext(GlobalContext);
  // const { data: user } = useCurrentUser();
  const navigate = useNavigate();

  const [saleBillChallanModel, setSaleBillChallanModel] = useState({
    isModalOpen: false,
    details: null,
    mode: "",
  });

  const handleCloseModal = () => {
    setSaleBillChallanModel((prev) => ({
      ...prev,
      isModalOpen: false,
      mode: "",
    }));
  };

  const [state, setState] = useState("current");
  const [type, setType] = useState();
  const [companyValue, setCompanyValue] = useState();
  const [party, setParty] = useState();
  const [isGrayValue, setIsGrayValue] = useState("cash");
  const [invoiceFilter, setInvoiceFilter] = useState();
  const [quality, setQuality] = useState();
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();
  const [payment, setPayment] = useState();
  const [fromBill, setFromBill] = useState("");
  const [toBill, setToBill] = useState("");
  const [orderNo, setOrderNo] = useState("");

  const debouncedFromDate = useDebounce(fromDate, 500);
  const debouncedToDate = useDebounce(toDate, 500);
  const debouncedQuality = useDebounce(quality, 500);
  const debouncePayment = useDebounce(payment, 500);

  
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();
  const { data: partyUserListRes, isLoading: isLoadingPartyList } = useQuery({
    queryKey: ["party", "list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getPartyListRequest({
        params: { company_id: companyId },
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

  const { data: SaleBillList, isLoading } = useQuery({
    queryKey: [
      "saleBill",
      "list",

      {
        company_id: companyId,
        page,
        pageSize,
        fromBill: debouncedFromDate,
        toBill: debouncedToDate,
        quality_id: debouncedQuality,
        is_paid: debouncePayment,
      },
    ],
    queryFn: async () => {
      const res = await getSaleBillListRequest({
        params: {
          company_id: companyId,
          page,
          pageSize,
          fromBill: debouncedFromDate,
          toBill: debouncedToDate,
          quality_id: debouncedQuality,
          is_paid: debouncePayment,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  function navigateToAdd() {
    navigate("/sales/bill/sales-bill-list/add");
  }

  function downloadPdf() {
    // const { leftContent, rightContent } = getPDFTitleContent({ user, company });
    const body = SaleBillList?.SaleBill?.map((item, index) => {
      const {
        createdAt,
        invoice_no,
        party,
        inhouse_quality,
        due_days,
        total_meter,
        total_taka,
        rate,
        amount,
        net_amount,
        is_paid,
        discount_amount,
      } = item;

      let dueDate = new Date(createdAt);
      dueDate.setDate(dueDate.getDate() + due_days);

      return [
        index + 1,
        dayjs(createdAt).format("DD-MM-YYYY"),
        invoice_no,
        "***",
        `${party.first_name} ${party.last_name}`,
        `${inhouse_quality.quality_name} (${inhouse_quality.quality_weight})KG`,
        "hsn no",
        total_taka,
        total_meter,
        rate,
        amount,
        discount_amount,
        amount - discount_amount,
        net_amount,
        dayjs(dueDate).format("DD-MM-YYYY"),
        is_paid ? "Paid" : "Un-Paid",
      ];
    });

    const tableTitle = [
      "ID",
      "Date",
      "Bill No",
      "Order No",
      "Party Name",
      "Quality",
      "HSN No",
      "Total Taka",
      "Total Meter",
      "Rate",
      "Amount",
      "Discount",
      "After Dis Amt",
      "Net Amount",
      "Due Date",
      "Status",
    ];

    // Set localstorage item information
    localStorage.setItem("print-array", JSON.stringify(body));
    localStorage.setItem("print-title", "Bill Invoice List");
    localStorage.setItem("print-head", JSON.stringify(tableTitle));
    localStorage.setItem("total-count", "0");

    // downloadUserPdf({
    //   body,
    //   head: [
    //     [
    //       "ID",
    //       "Date",
    //       "Bill No",
    //       "Order No",
    //       "Party Name",
    //       "Quality",
    //       "HSN No",
    //       "Total Taka",
    //       "Total Meter",
    //       "Rate",
    //       "Amount",
    //       "Discount",
    //       "After Dis Amt",
    //       "Net Amount",
    //       "Due Date",
    //       "Status",
    //     ],
    //   ],
    //   leftContent,
    //   rightContent,
    //   title: "Bill Invoice List",
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
      dataIndex: "createdAt",
      render: (text) => dayjs(text).format("DD-MM-YYYY"),
    },
    {
      title: "Challan/Bill",
      dataIndex: "invoice_no",
      key: "invoice_no",
    },
    {
      title: "Order No",
    },
    {
      title: "Party Name",
      render: (details) =>
        `${details.party.first_name} ${details.party.last_name}`,
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
      dataIndex: "rate",
      key: "rate",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Net Amount",
      dataIndex: "net_amount",
      key: "net_amount",
    },
    {
      title: "Due Date",
      render: (text, record) => {
        let result = new Date(record?.createdAt);
        result.setDate(result.getDate() + record?.due_days);
        return <div>{dayjs(result).format("DD-MM-YYYY")}</div>;
      },
    },
    {
      title: "Due Days",
      dataIndex: "due_days",
      key: "due_days",
    },
    {
      title: "Status",
      render: (details) => {
        return details.is_paid ? (
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
            <Button
              onClick={() => {
                setSaleBillChallanModel((prev) => {
                  return {
                    ...prev,
                    isModalOpen: true,
                    details: details,
                    mode: "UPDATE",
                  };
                });
              }}
            >
              <EditOutlined />
            </Button>

            <DeleteSaleBill details={details} />
            <Button
              onClick={() => {
                setSaleBillChallanModel((prev) => {
                  return {
                    ...prev,
                    isModalOpen: true,
                    details: details,
                    mode: "VIEW",
                  };
                });
              }}
            >
              <FileTextOutlined />
            </Button>
          </Space>
        );
      },
    },
  ];

  
  function disabledFutureDate(current) {
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
        dataSource={SaleBillList?.SaleBill || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          total: SaleBillList?.SaleBill?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
        summary={(pageData) => {
          
          if (SaleBillList){
            let totalAmount = 0;
            let totalNetAmount = 0;
            let totalRate = 0;
            let totalMeter = 0;
  
            pageData.forEach(({ total_meter, amount, net_amount, rate }) => {
              totalMeter += +total_meter;
              totalAmount += +amount;
              totalNetAmount += +net_amount;
              totalRate += +rate;
            });
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}>
                  <b>Total</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}></Table.Summary.Cell>
                <Table.Summary.Cell index={2}></Table.Summary.Cell>
                <Table.Summary.Cell index={3}></Table.Summary.Cell>
                <Table.Summary.Cell index={4}></Table.Summary.Cell>
                <Table.Summary.Cell index={5}></Table.Summary.Cell>
                <Table.Summary.Cell index={6}>
                  <b>{SaleBillList.total_takas || 0}</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={7}>
                  <b>{SaleBillList?.total_meters || 0}</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={8}>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={9}>
                  <b>{SaleBillList?.total_amounts || 0}</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={10}>
                  <b>{SaleBillList?.total_net_amounts || 0}</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={11}></Table.Summary.Cell>
                <Table.Summary.Cell index={12}></Table.Summary.Cell>
                <Table.Summary.Cell index={13}></Table.Summary.Cell>
                <Table.Summary.Cell index={14}></Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }
        }}
      />
    );
  }
  return (
    <>
      <div className="flex flex-col p-4">
        {/* <div className="flex items-center justify-end gap-5 mx-3 mb-3">
          <Select
            allowClear
            placeholder="Select Invoice FIlter"
            options={[
              { label: "E invoice pending", value: "E-invoice-pending" },
              { label: "E way bill pending", value: "E-way-bill-pending" },
              { label: "E invoice cancelled", value: "E-invoice-cancelled" },
            ]}
            dropdownStyle={{
              textTransform: "capitalize",
            }}
            value={invoiceFilter}
            onChange={setInvoiceFilter}
            style={{
              textTransform: "capitalize",
            }}
            className="min-w-40"
          />
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
            <h3 className="m-0 text-primary">Sale Bill List</h3>
            <Button
              onClick={navigateToAdd}
              icon={<PlusCircleOutlined />}
              type="text"
            />
          </div>
          <Flex align="center" gap={10}>
            <Flex align="center" gap={10}>
              <Radio.Group
                name="filter"
                value={isGrayValue}
                onChange={(e) => setIsGrayValue(e.target.value)}
              >
                <Flex align="center" gap={10}>
                  <Radio value={"cash"}> Cash</Radio>
                  <Radio value={"grey"}> Grey </Radio>
                </Flex>
              </Radio.Group>

              <Flex align="center" gap={10}>
                <Typography.Text className="whitespace-nowrap">
                  Company
                </Typography.Text>
                <Select
                  placeholder="Select Company"
                  value={companyValue}
                  onChange={setCompanyValue}
                  options={companyListRes?.rows?.map(
                    ({ company_name = "", id = "" }) => ({
                      label: company_name,
                      value: id,
                    })
                  )}
                  style={{
                    width: "100%",
                  }}
                />
              </Flex>
              <Flex align="center" gap={10}>
                <Typography.Text className="whitespace-nowrap">
                  Type
                </Typography.Text>
                <Select
                  allowClear
                  placeholder="Select Type"
                  value={type}
                  options={ORDER_TYPE}
                  dropdownStyle={{
                    textTransform: "capitalize",
                  }}
                  onChange={setType}
                  style={{
                    textTransform: "capitalize",
                  }}
                  className="min-w-40"
                />
              </Flex>
              <Flex align="center" gap={10}>
                <Typography.Text className="whitespace-nowrap">
                  Party
                </Typography.Text>
                <Select
                  loading={isLoadingPartyList}
                  placeholder="Select Party"
                  options={partyUserListRes?.partyList?.rows?.map((party) => ({
                    label:
                      party.first_name +
                      " " +
                      party.last_name +
                      " " +
                      `| ( ${party?.username})`,
                    value: party.id,
                  }))}
                  value={party}
                  onChange={setParty}
                  style={{
                    textTransform: "capitalize",
                    width: "150px",
                  }}
                  dropdownStyle={{
                    textTransform: "capitalize",
                  }}
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
            </Flex>
            <Button
              icon={<FilePdfOutlined />}
              type="primary"
              disabled={!SaleBillList?.SaleBill?.length}
              onClick={downloadPdf}
              className="flex-none"
            />
          </Flex>
        </div>

        <div className="flex items-center justify-end gap-5 mx-3 mb-3 mt-2">
          <Flex align="center" gap={10}>
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
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                Payment
              </Typography.Text>
              <Select
                allowClear
                placeholder="Select Payment"
                value={payment}
                options={[
                  { label: "Un-Paid", value: "0" },
                  { label: "Received", value: "1" },
                ]}
                dropdownStyle={{
                  textTransform: "capitalize",
                }}
                onChange={setPayment}
                style={{
                  textTransform: "capitalize",
                }}
                className="min-w-40"
              />
            </Flex>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                From Bill
              </Typography.Text>
              <Input
                placeholder="From Bill"
                value={fromBill}
                onChange={(e) => setFromBill(e.target.value)}
                style={{ width: "200px" }}
              />
            </Flex>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                To Bill
              </Typography.Text>
              <Input
                placeholder="To Bill"
                value={toBill}
                onChange={(e) => setToBill(e.target.value)}
                style={{ width: "200px" }}
              />
            </Flex>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                Order No
              </Typography.Text>
              <Input
                value={orderNo}
                onChange={(e) => setOrderNo(e.target.value)}
                style={{ width: "200px" }}
              />
            </Flex>
          </Flex>
        </div>
        {renderTable()}
      </div>

      {saleBillChallanModel.isModalOpen && (
        <SaleBillComp
          isModelOpen={saleBillChallanModel.isModalOpen}
          handleCloseModal={handleCloseModal}
          details={saleBillChallanModel.details}
          MODE={saleBillChallanModel.mode}
        />
      )}
    </>
  );
};

export default SaleBillList;
