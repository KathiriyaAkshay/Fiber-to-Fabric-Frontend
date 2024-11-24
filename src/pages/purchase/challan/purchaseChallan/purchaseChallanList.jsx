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
// import useDebounce from "../../../hooks/useDebounce";
// import {
//   downloadUserPdf,
//   getPDFTitleContent,
// } from "../../../../lib/pdf/userPdf";
// import { useCurrentUser } from "../../../../api/hooks/auth";
import useDebounce from "../../../../hooks/useDebounce";
import { getInHouseQualityListRequest } from "../../../../api/requests/qualityMaster";
import { getDropdownSupplierListRequest } from "../../../../api/requests/users";
import { getPurchaseTakaListRequest } from "../../../../api/requests/purchase/purchaseTaka";
import dayjs from "dayjs";
import DeletePurchaseTaka from "../../../../components/purchase/purchaseTaka/DeletePurchaseTaka";
import PurchaseTakaChallanModal from "../../../../components/purchase/purchaseTaka/PurchaseTakaChallan";
import ViewPurchaseChallanInfo from "../../../../components/purchase/purchaseChallan/ViewPurchaseChallanInfo";
import ReturnPurchaseChallan from "../../../../components/purchase/purchaseChallan/ReturnPurchaseChallan";

const PurchaseChallanList = () => {
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
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const [purchaseTakaChallanModal, setPurchaseTakaChallanModal] = useState({
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

  const { data: purchaseChallanList, isLoading } = useQuery({
    queryKey: [
      "purchaseTaka",
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
          challan_no: debouncedChallanNo,
          order_no: debouncedOrderNo,
          supplier_name: debouncedSupplier,
          //   in_stock: debouncedType === "in_stock" ? true : false,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  function navigateToAdd() {
    navigate("/purchase/purchased-taka/add");
  }

  function navigateToUpdate(id) {
    navigate(`/purchase/purchased-taka/update/${id}`);
  }

  function downloadPdf() {
    // const { leftContent, rightContent } = getPDFTitleContent({ user, company });
    const body = purchaseChallanList?.rows?.map((item, index) => {
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
        challan_no, // bill no
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
    localStorage.setItem("print-title", "Purchase Challan List");
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
      title: "Challan Date",
      dataIndex: "createdAt",
      render: (text) => {
        return dayjs(text).format("DD-MM-YYYY");
      },
    },
    {
      title: "Challan No",
      dataIndex: "challan_no",
      key: "challan_no",
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
      title: "Payment Status",
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
        let isShowReturn = false;
        details.purchase_challan_details.forEach((element) => {
          if (element?.is_returned === false) {
            isShowReturn = true;
            return;
          }
        });
        return (
          <Space>
            <ViewPurchaseChallanInfo details={details} />
            {details.bill_status === "received" ? null : (
              <>
                <Button
                  onClick={() => {
                    navigateToUpdate(details.id);
                  }}
                >
                  <EditOutlined />
                </Button>
                <DeletePurchaseTaka details={details} />
                <Button
                  onClick={() => {
                    let MODE;
                    if (details.bill_status === "received") {
                      MODE = "VIEW";
                    } else if (details.bill_status === "not_received") {
                      MODE = "ADD";
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
              </>
            )}
            {isShowReturn && (
              <ReturnPurchaseChallan details={details} companyId={companyId} />
            )}
            <Button
              onClick={() => {
                localStorage.setItem(
                  "SALE_CHALLAN_ADD",
                  JSON.stringify({ model: "purchase", id: details.id })
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
        dataSource={purchaseChallanList?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          total: purchaseChallanList?.rows?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
        summary={() => {
          return (
            <>
              <Table.Summary.Row className="font-semibold">
                <Table.Summary.Cell>
                  Grand
                  <br /> Total
                </Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell>
                  <Typography.Text>
                    {purchaseChallanList?.total_taka}
                  </Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <Typography.Text>
                    {purchaseChallanList?.total_meter}
                  </Typography.Text>
                </Table.Summary.Cell>
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
            <h3 className="m-0 text-primary">Purchase Challan List</h3>
            <Button
              onClick={navigateToAdd}
              icon={<PlusCircleOutlined />}
              type="text"
            />
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
                  allowClear
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
            </Flex>
            <Button
              icon={<FilePdfOutlined />}
              type="primary"
              disabled={!purchaseChallanList?.rows?.length}
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
      {purchaseTakaChallanModal.isModalOpen && (
        <PurchaseTakaChallanModal
          details={purchaseTakaChallanModal.details}
          isModelOpen={purchaseTakaChallanModal.isModalOpen}
          handleCloseModal={handleCloseModal}
          MODE={purchaseTakaChallanModal.mode}
        />
      )}
    </>
  );
};

export default PurchaseChallanList;
