import { useContext, useEffect, useState } from "react";
import {
  Table,
  Select,
  DatePicker,
  Button,
  Input,
  Flex,
  Typography,
  Spin,
  Space,
  Tag,
} from "antd";
import { EditOutlined, FilePdfOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { usePagination } from "../../../../hooks/usePagination";
import { useQuery } from "@tanstack/react-query";
// import { useCurrentUser } from "../../../../api/hooks/auth";
import { getDropdownSupplierListRequest } from "../../../../api/requests/users";
import { getInHouseQualityListRequest } from "../../../../api/requests/qualityMaster";
import useDebounce from "../../../../hooks/useDebounce";
// import {
//   downloadUserPdf,
//   getPDFTitleContent,
// } from "../../../../lib/pdf/userPdf";
import dayjs from "dayjs";
import DeleteReworkChallan from "../../../../components/job/challan/reworkChallan/DeleteReworkChallan";
import { getPruchaseReturnListRequest } from "../../../../api/requests/purchase/purchaseReturn";
import ViewPurchaseReturnChallanInfo from "../../../../components/purchase/purchaseReturn/ViewPurchaseReturnChallan";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import DebitNote from "../../../../components/purchase/purchaseReturn/DebitNote";
import moment from "moment/moment";
import ParticularPurchaseReturnInfo from "../../../../components/purchase/purchaseReturn/particularPurchaseReturnInfo";

const PurchaseReturnInformation = ({ item }) => {
  const makeUniqueList = (items) => {
    const filteredItems = items.filter(
      (item) => item.purchased_return_id !== null
    );
    const grouped = filteredItems.reduce((acc, item) => {
      const key = item.purchased_return_id;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});

    // Convert grouped object back into an array
    return Object.values(grouped);
  };

  const uniqueList = makeUniqueList(
    item?.purchase_taka_challan?.purchase_challan_details
  );

  const columns = [
    {
      title: "Return Taka",
      render: (text, record) => {
        return <div>{record?.length}</div>;
      },
    },
    {
      title: "Return Meter",
      render: (text, record) => {
        let total_return_meter = 0;
        record?.map((element) => {
          total_return_meter += +element?.meters || +element?.meter;
        });
        return (
          <div
            style={{
              fontWeight: 600,
              color: "red",
            }}
          >
            {total_return_meter}
          </div>
        );
      },
    },
    {
      title: "Action",
      render: (record) => {
        let taka_no = [];
        record?.map((element) => {
          taka_no.push(element?.taka_no);
        });
        return (
          <Space>
            <ParticularPurchaseReturnInfo
              details={{ ...item, new_challan_details: record }}
            />
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <div
        style={{
          paddingTop: 10,
          paddingBottom: 10,
        }}
      >
        <Table
          dataSource={uniqueList}
          columns={columns}
          pagination={false}
          className="sub-table"
        />
      </div>
    </>
  );
};

const PurchaseReturnList = () => {
  const navigate = useNavigate();
  const [quality, setQuality] = useState(null);
  const [supplier, setSupplier] = useState(null);
  const [challanNo, setChallanNo] = useState("");
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();
  const [data, setData] = useState([]);

  const debouncedFromDate = useDebounce(fromDate, 500);
  const debouncedToDate = useDebounce(toDate, 500);
  const debouncedQuality = useDebounce(quality, 500);
  const debouncedChallanNo = useDebounce(challanNo, 500);
  const debouncedSupplier = useDebounce(supplier, 500);

  const { companyId } = useContext(GlobalContext);
  // const { data: user } = useCurrentUser();
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

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

  const { data: dropDownQualityListRes, isLoading: dropDownQualityLoading } =
    useQuery({
      queryKey: [
        "dropDownQualityListRes",
        "list",
        {
          company_id: companyId,
          page: 0,
          pageSize: 99999,
          is_active: 1,
        },
      ],
      queryFn: async () => {
        const res = await getInHouseQualityListRequest({
          params: {
            company_id: companyId,
            page: 0,
            pageSize: 99999,
            is_active: 1,
          },
        });
        return res.data?.data;
      },
      enabled: Boolean(companyId),
    });

  const { data: purchaseReturnList, isLoading } = useQuery({
    queryKey: [
      "purchase",
      "return",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
        from: debouncedFromDate,
        to: debouncedToDate,
        quality_id: debouncedQuality,
        challan_no: debouncedChallanNo,
        supplier_name: debouncedSupplier,
      },
    ],
    queryFn: async () => {
      const res = await getPruchaseReturnListRequest({
        params: {
          company_id: companyId,
          page,
          pageSize,
          from: debouncedFromDate,
          to: debouncedToDate,
          quality_id: debouncedQuality,
          challan_no: debouncedChallanNo,

          supplier_name: debouncedSupplier,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  function navigateToUpdate(id) {
    navigate(`/job/challan/rework-challan/update/${id}`);
  }

  function disabledFutureDate(current) {
    return current && current > moment().endOf("day");
  }

  function downloadPdf() {
    // const { leftContent, rightContent } = getPDFTitleContent({ user, company });
    const body = purchaseReturnList?.rows?.map((item, index) => {
      const {
        createdAt,
        purchase_taka_challan: {
          challan_no,
          inhouse_quality,
          gray_order,
          supplier,
          total_taka,
          total_meter,
          createdAt: createdAt2,
        },
      } = item;
      return [
        index + 1,
        dayjs(createdAt).format("DD-MM-YYYY"),
        challan_no,
        `${inhouse_quality.quality_name} (${inhouse_quality.quality_weight}KG)`,
        gray_order.order_no,
        supplier.supplier_name,
        supplier.supplier_company,
        total_meter,
        total_taka,
        dayjs(createdAt2).format("DD-MM-YYYY"),
      ];
    });

    const tableTitle = [
      "ID",
      "Challan Date",
      "Challan/Bill No",
      "Quality",
      "Order Code",
      "Supplier Name",
      "Supplier Company",
      "Total Meter",
      "Total Taka",
      "Date",
    ];

    // Set localstorage item information
    localStorage.setItem("print-array", JSON.stringify(body));
    localStorage.setItem("print-title", "Purchased Return");
    localStorage.setItem("print-head", JSON.stringify(tableTitle));
    localStorage.setItem("total-count", "0");

    // downloadUserPdf({
    //   body,
    //   head: [
    //     [
    //       "ID",
    //       "Challan Date",
    //       "Challan/Bill No",
    //       "Quality",
    //       "Order Code",
    //       "Supplier Name",
    //       "Supplier Company",
    //       "Total Meter",
    //       "Total Taka",
    //       "Date",
    //     ],
    //   ],
    //   leftContent,
    //   rightContent,
    //   title: "Purchased Return",
    // });
    window.open("/print");
  }

  const columns = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Challan Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => dayjs(text).format("DD-MM-YYYY"),
    },
    {
      title: "Challan No",
      dataIndex: ["purchase_taka_challan", "challan_no"],
      key: "challan_no",
      render: (text, record) => {
        return <Tag color="#108ee9">{text}</Tag>;
      },
    },
    {
      title: "Quality",
      dataIndex: ["purchase_taka_challan", "inhouse_quality"],
      key: "inhouse_quality",
      render: (text) => `${text?.quality_name} (${text?.quality_weight})`,
    },
    {
      title: "Order No",
      dataIndex: ["purchase_taka_challan", "gray_order", "order_no"],
      key: "order_no",
    },
    {
      title: "Supplier Name",
      dataIndex: ["purchase_taka_challan", "supplier"],
      key: "supplier",
      render: (supplier) => `${supplier?.supplier_name}`,
    },
    {
      title: "Supplier Company",
      render: (details) =>
        details?.purchase_taka_challan?.supplier?.supplier_company,
    },
    // {
    //   title: "Return Meter",
    //   render: (text, record) => {
    //     let data = record?.new_challan_details;
    //     let return_meter = 0;
    //     data?.map((element) => {
    //       return_meter += +element?.meter;
    //     })
    //     return (
    //       <div style={{
    //         color: "red",
    //         fontWeight: 600
    //       }}>{return_meter}</div>
    //     )
    //   },
    // },
    {
      title: "Total Taka",
      render: (details) => details?.purchase_taka_challan?.total_taka,
    },
    {
      title: "Total Meter",
      render: (details) => details?.purchase_taka_challan?.total_meter,
    },
    // {
    //   title: "Return Date",
    //   dataIndex: "return_date",
    //   key: "return_date",
    // },
    {
      title: "Action",
      render: (details) => {
        return (
          <Space>
            {/* <ParticularPurchaseReturnInfo details={details} /> */}
            <Button
              onClick={() => {
                navigateToUpdate(details.id);
              }}
            >
              <EditOutlined />
            </Button>
            <DebitNote />
            <DeleteReworkChallan details={details} />
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
        dataSource={purchaseReturnList?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          current: page + 1,
          pageSize: pageSize,
          total: purchaseReturnList?.rows?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
        expandable={{
          expandedRowRender: (record) => {
            return <PurchaseReturnInformation item={record} />;
          },
          expandedRowKeys:
            purchaseReturnList?.rows?.map((element) => element?.id) || [], // Correct syntax
        }}
      />
    );
  }

  return (
    <>
      <div className="flex flex-col p-4">
        <div className="flex items-center justify-between gap-5 mx-3 mb-3">
          <div className="flex items-center gap-2">
            <h3 className="m-0 text-primary">Purchased Return</h3>
            {/* <Button
              onClick={navigateToAdd}
              icon={<PlusCircleOutlined />}
              type="text"
            /> */}
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
              disabled={!purchaseReturnList?.rows?.length}
              onClick={downloadPdf}
              className="flex-none"
            />
          </Flex>
        </div>

        <div className="flex items-center justify-end gap-5 mx-3 mb-3 mt-2">
          <Flex align="center" gap={10}>
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
          </Flex>
        </div>
        {renderTable()}
      </div>
    </>
  );
};

export default PurchaseReturnList;
