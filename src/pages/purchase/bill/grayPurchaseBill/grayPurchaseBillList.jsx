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
import useDebounce from "../../../../hooks/useDebounce";
import { getInHouseQualityListRequest } from "../../../../api/requests/qualityMaster";
import { getDropdownSupplierListRequest } from "../../../../api/requests/users";
import { getPurchaseTakaListRequest } from "../../../../api/requests/purchase/purchaseTaka";
import dayjs from "dayjs";
import PurchaseTakaChallanModal from "../../../../components/purchase/purchaseTaka/PurchaseTakaChallan";
import moment from "moment";
import ViewGrayPurchaseBill from "../../../../components/purchase/grayPurchaseBill/ViewGrayPurchaseBill";
import PartialPaymentInformation from "../../../../components/accounts/payment/partialPaymentInformation";
import { addDaysToDate } from "../../../accounts/reports/utils";
import { PURCHASE_SUPPLIER_TYPE } from "../../../../constants/supplier";
import { PURCHASE_QUALITY_TYPE } from "../../../../constants/supplier";
import { getDisplayQualityName } from "../../../../constants/nameHandler";

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

  // Quality list related dropdown ===========================================
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
          production_type: PURCHASE_QUALITY_TYPE
        },
      ],
      queryFn: async () => {
        const res = await getInHouseQualityListRequest({
          params: {
            company_id: companyId,
            page: 0,
            pageSize: 9999,
            is_active: 1,
            production_type: PURCHASE_QUALITY_TYPE
          },
        });
        return res.data?.data;
      },
      enabled: Boolean(companyId),
    });
  
  // Dropdown supplier related information =========================================
  const {
    data: dropdownSupplierListRes,
    isLoading: isLoadingDropdownSupplierList,
  } = useQuery({
    queryKey: ["dropdown/supplier/list", { company_id: companyId, supplier_type: PURCHASE_SUPPLIER_TYPE }],
    queryFn: async () => {
      const res = await getDropdownSupplierListRequest({
        params: { company_id: companyId, supplier_type: PURCHASE_SUPPLIER_TYPE },
      });
      return res.data?.data?.supplierList;
    },
    enabled: Boolean(companyId),
  });

  const { data: grayPurchaseBillList, isLoading } = useQuery({
    queryKey: [
      "grayPurchase",
      "bill",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
        bill_from: debouncedFromDate,
        bill_to: debouncedToDate,
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
          bill_from: dayjs(debouncedFromDate).format("YYYY-MM-DD"),
          bill_to: dayjs(debouncedToDate).format("YYYY-MM-DD"),
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
      render: (text, record) => {
        return(
          <div style={{fontWeight: 600}}>
            {text}
          </div>
        )
      }
    },
    {
      title: "Quality Name",
      render: (details) => {
        return(
          <div style={{
            fontSize:13
          }}>
            {getDisplayQualityName(details?.inhouse_quality)}
          </div>
        )
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
    {
      title: "Due Date",
      dataIndex: ["purchase_taka_bill", "due_date"],
      render: (text, record) => {
        return(
          <div>
            {moment(addDaysToDate(record?.purchase_taka_bill?.bill_date, 10)).format("DD-MM-YYYY")}
          </div>
        )
      },
    },
    {
      title: "Due Days",
      dataIndex: ["purchase_taka_bill", "due_days"],
      key: "due_days",
      render: (text, record) => {
        let due_date = record?.due_date;
        due_date = new Date(addDaysToDate(record?.purchase_taka_bill?.bill_date, 10));
      
        let today = new Date();
    
        // Correct the time difference calculation
        let timeDifference = today.getTime() - due_date.getTime();
        
        // Convert time difference to days
        let daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
      
        // If the due date is in the future, set the days difference to 0
        if (daysDifference < 0) {
          daysDifference = 0;
        }

        if (record?.purchase_taka_bill?.is_paid){
          return(
            <div>
              0
            </div>
          )
        }  else {
          return <div style={{
            color: daysDifference == 0?"#000":"red",
            fontWeight: 600
          }}>
            +{daysDifference}D
          </div>;
        }
      
      } ,
    },
    {
      title: "Status",
      dataIndex: "payment_status",
      render: (text, record) => {
        return(
          <div>
            {record?.purchase_taka_bill?.is_partial_payment?<>
              <PartialPaymentInformation
                bill_id={record?.purchase_taka_bill?.id}
                bill_model={"purchase_taka_bills"}
                paid_amount={record?.purchase_taka_bill?.paid_amount}
              />
            </>:<>
              <Tag color = {record?.purchase_taka_bill?.is_paid?"green":"red"}>
                {String(record?.purchase_taka_bill?.is_paid?"Paid":"Un-Paid").toUpperCase()}
              </Tag>
            </>}
          </div>
        )
      },
    },
    {
      title: "Action",
      render: (details) => {
        return (
          <Space>
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
          current: page + 1,
          pageSize: pageSize,
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
                  <Typography.Text>
                    {parseFloat(grayPurchaseBillList?.total_taka || 0).toFixed(
                      2
                    )}
                  </Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <Typography.Text>
                    {parseFloat(grayPurchaseBillList?.total_meter || 0).toFixed(
                      2
                    )}
                  </Typography.Text>
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
                  allowClear
                  className="min-w-40"
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
                      label:getDisplayQualityName(item),
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
