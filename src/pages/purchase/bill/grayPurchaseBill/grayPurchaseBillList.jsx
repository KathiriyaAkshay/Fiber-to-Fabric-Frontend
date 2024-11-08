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
import { usePagination } from "../../../../hooks/usePagination";
import { useContext, useState } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
// import { useCurrentUser } from "../../../../api/hooks/auth";
import useDebounce from "../../../../hooks/useDebounce";
import { getInHouseQualityListRequest } from "../../../../api/requests/qualityMaster";
import { getDropdownSupplierListRequest } from "../../../../api/requests/users";
import { getPurchaseTakaListRequest } from "../../../../api/requests/purchase/purchaseTaka";
import dayjs from "dayjs";
// import DeletePurchaseTaka from "../../../../components/purchase/purchaseTaka/DeletePurchaseTaka";
import PurchaseTakaChallanModal from "../../../../components/purchase/purchaseTaka/PurchaseTakaChallan";
import moment from "moment";
import ViewGrayPurchaseBill from "../../../../components/purchase/grayPurchaseBill/ViewGrayPurchaseBill";

const GrayPurchaseBillList = () => {
  const { companyId } = useContext(GlobalContext);
  // const { data: user } = useCurrentUser();
  // const navigate = useNavigate();

  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();
  const [quality, setQuality] = useState();
  const [payment, setPayment] = useState();
  const [orderNo, setOrderNo] = useState("");
  const [billNo, setBillNo] = useState("");
  const [supplier, setSupplier] = useState();

  const debouncedFromDate = useDebounce(fromDate, 500);
  const debouncedToDate = useDebounce(toDate, 500);
  const debouncedPayment = useDebounce(payment, 500);
  const debouncedQuality = useDebounce(quality, 500);
  const debouncedOrderNo = useDebounce(orderNo, 500);
  const debouncedBillNo = useDebounce(billNo, 500);
  const debouncedSupplier = useDebounce(supplier, 500);
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const [puchaseTakaChallanModal, setPurchaseTakaChallanModal] = useState({
    isModalOpen: false,
    details: null,
    mode: "",
  });
  const handleCloseModal = () => {
    setPurchaseTakaChallanModal((prev) => ({
      ...prev,
      isModalOpen: false,
      mode: "",
    }));
  };

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

  const { data: grayPurchaseBillList, isLoading } = useQuery({
    queryKey: [
      "grayPurchase",
      "bill",
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
        supplier_name: debouncedSupplier,
        payment_status: debouncedPayment,
        // in_stock: debouncedType === "in_stock" ? true : false,
      },
    ],
    queryFn: async () => {
      const res = await getPurchaseTakaListRequest({
        params: {
          company_id: companyId,
          page,
          pageSize,
          from: debouncedFromDate,
          to: debouncedToDate,
          quality_id: debouncedQuality,
          bill_no: debouncedBillNo,
          order_no: debouncedOrderNo,
          supplier_name: debouncedSupplier,
          payment_status: debouncedPayment,
          bill_status: "received",
          //   in_stock: debouncedType === "in_stock" ? true : false,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  // function navigateToUpdate(id) {
  //   navigate(`/purchase/purchased-taka/update/${id}`);
  // }

  function downloadPdf() {
    // const { leftContent, rightContent } = getPDFTitleContent({ user, company });
    const body = grayPurchaseBillList?.rows?.map((item, index) => {
      const {
        purchase_taka_bill,
        supplier,
        gray_order,
        inhouse_quality,
        total_taka,
        total_meter,
      } = item;
      return [
        index + 1,
        purchase_taka_bill?.invoice_no,
        supplier?.supplier_name,
        dayjs(purchase_taka_bill?.bill_date).format("DD-MM-YYYY"),
        gray_order?.order_no,
        `${inhouse_quality.quality_name} (${inhouse_quality.quality_weight}KG)`,
        total_taka,
        total_meter,
        purchase_taka_bill?.rate,
        purchase_taka_bill?.amount,
        purchase_taka_bill?.net_amount,
      ];
    });

    const tableTitle = [
      "ID",
      "Bill NO",
      "Supplier Name",
      "Bill Date",
      "Order No",
      "Quality",
      "Total Taka",
      "Total Meter",
      "Rate",
      "Amount",
      "Net Amount",
    ];

    // Set localstorage item information
    localStorage.setItem("print-array", JSON.stringify(body));
    localStorage.setItem("print-title", "Purchase Bill List");
    localStorage.setItem("print-head", JSON.stringify(tableTitle));
    localStorage.setItem("total-count", "0");

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
      dataIndex: ["purchase_taka_bill", "bill_date"],
      render: (text) => {
        return dayjs(text).format("DD-MM-YYYY");
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
      dataIndex: ["purchase_taka_bill", "invoice_no"],
      key: "bill_no",
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
      dataIndex: ["purchase_taka_bill", "rate"],
      key: "rate",
      render: (text) => (text == null ? <div>-</div> : <div>{text}</div>),
    },
    {
      title: "Amount",
      dataIndex: ["purchase_taka_bill", "amount"],
      key: "amount",
    },
    {
      title: "Net Amount",
      dataIndex: ["purchase_taka_bill", "net_amount"],
      key: "net_amount",
    },
    // {
    //   title: "Due Date",
    //   dataIndex: ["purchase_taka_bill", "due_date"],
    //   render: (text) => text || "-",
    // },
    // {
    //   title: "Due Days",
    //   dataIndex: ["purchase_taka_bill", "due_days"],
    //   key: "due_days",
    //   render: (text) => text || "-",
    // },
    {
      title: "Bill Status",
      dataIndex: "bill_status",
      render: (text) => {
        return text.toLowerCase() === "received" ? (
          <Tag color="green">Received</Tag>
        ) : (
          <Tag color="red">Not Received</Tag>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "payment_status",
      render: (text) => {
        return text.toLowerCase() === "paid" ? (
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
            {/* <DeletePurchaseTaka details={details} /> */}
            <ViewGrayPurchaseBill details={details} />
            <Button
              onClick={() => {
                let MODE;
                if (details.payment_status === "paid") {
                  MODE = "VIEW";
                } else if (details.payment_status === "not_paid") {
                  MODE = "UPDATE";
                }
                setPurchaseTakaChallanModal((prev) => {
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
          </Space>
        );
      },
    },
  ];

  const disableFutureDates = (current) => {
    return current && current > moment().endOf("day");
  };

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
        dataSource={grayPurchaseBillList?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          total: grayPurchaseBillList?.rows?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
        summary={(pageData) => {
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
                  <Typography.Text>{parseFloat(grayPurchaseBillList?.total_taka || 0).toFixed(2)}</Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <Typography.Text>{parseFloat(grayPurchaseBillList?.total_meter || 0).toFixed(2)}</Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell>
                  <Typography.Text>{}</Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <Typography.Text>{}</Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell />
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
            <h3 className="m-0 text-primary">Gray Purchase Bills</h3>
          </div>
          <Flex align="center" gap={10}>
            <Flex align="center" gap={10}>
              {/* <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                Type
              </Typography.Text>
              <Select
                allowClear
                placeholder="Select Type"
                value={type}
                options={[
                  { label: "In Stock", value: "in_stock" },
                  { label: "Sold", value: "sold" },
                ]}
                dropdownStyle={{
                  textTransform: "capitalize",
                }}
                onChange={setType}
                style={{
                  textTransform: "capitalize",
                }}
                className="min-w-40"
              />
            </Flex> */}
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
                  disabledDate={disableFutureDates}
                />
              </Flex>
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
                disabledDate={disableFutureDates}
              />
            </Flex>
            <Button
              icon={<FilePdfOutlined />}
              type="primary"
              disabled={!grayPurchaseBillList?.rows?.length}
              onClick={downloadPdf}
              className="flex-none"
            />
          </Flex>
        </div>

        <div className="flex items-center justify-end gap-5 mx-3 mb-3 mt-2">
          <Flex align="center" gap={10}>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                Payment
              </Typography.Text>
              <Select
                allowClear
                placeholder="Select Payment"
                value={payment}
                options={[
                  { label: "Paid", value: "paid" },
                  { label: "Un-Paid", value: "not_paid" },
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
                Bill No
              </Typography.Text>
              <Input
                placeholder="Challan NO"
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
      {puchaseTakaChallanModal.isModalOpen && (
        <PurchaseTakaChallanModal
          details={puchaseTakaChallanModal.details}
          isModelOpen={puchaseTakaChallanModal.isModalOpen}
          handleCloseModal={handleCloseModal}
          MODE={puchaseTakaChallanModal.mode}
        />
      )}
    </>
  );
};

export default GrayPurchaseBillList;
