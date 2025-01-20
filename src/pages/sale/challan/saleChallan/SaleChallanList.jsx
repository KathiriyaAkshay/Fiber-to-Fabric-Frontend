import {
  Button,
  DatePicker,
  Flex,
  Input,
  Radio,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  EditOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usePagination } from "../../../../hooks/usePagination";
import { useContext, useState } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
// import useDebounce from "../../../hooks/useDebounce";
import dayjs from "dayjs";
import useDebounce from "../../../../hooks/useDebounce";
import { getInHouseQualityListRequest } from "../../../../api/requests/qualityMaster";
import { ORDER_TYPE } from "../../../../constants/orderMaster";
import { getSaleChallanListRequest } from "../../../../api/requests/sale/challan/challan";
import { getPartyListRequest } from "../../../../api/requests/users";
import DeleteSaleChallan from "../../../../components/sale/challan/saleChallan/DeleteSaleChallan";
import ViewSaleChallan from "../../../../components/sale/challan/saleChallan/ViewSaleChallan";
import SaleChallanBill from "../../../../components/sale/challan/saleChallan/SaleChallanBill";
import ViewChallan from "../../../../components/sale/challan/saleChallan/ViewChallan";
import { disabledFutureDate } from "../../../../utils/date";
import { JOB_TAG_COLOR, PURCHASE_TAG_COLOR, SALE_TAG_COLOR } from "../../../../constants/tag";
import { getDisplayQualityName } from "../../../../constants/nameHandler";

const SaleChallanList = () => {
  const { companyId } = useContext(GlobalContext);
  const navigate = useNavigate();

  const [rowSelection, setRowSelection] = useState([]);
  const [state, setState] = useState("gray");
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();
  const [type, setType] = useState();
  const [quality, setQuality] = useState();
  const [billStatus, setBillStatus] = useState();
  const [fromChallan, setFromChallan] = useState();
  const [toChallan, setToChallan] = useState();
  const [orderNo, setOrderNo] = useState();
  const [party, setParty] = useState();

  const debouncedFromDate = useDebounce(fromDate, 500);
  const debouncedToDate = useDebounce(toDate, 500);
  const debouncedType = useDebounce(type, 500);
  const debouncedQuality = useDebounce(quality, 500);
  const debouncedState = useDebounce(state, 500);
  const debouncedBillStatus = useDebounce(billStatus, 500);
  const debouncedFromChallan = useDebounce(fromChallan, 500);
  const debouncedToChallan = useDebounce(toChallan, 500);
  const debouncedOrderNo = useDebounce(orderNo, 500);
  const debouncedParty = useDebounce(party, 500);

  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const [saleChallanModal, setSaleChallanModal] = useState({
    isModalOpen: false,
    details: null,
    mode: "",
  });
  const handleCloseModal = () => {
    setSaleChallanModal((prev) => ({
      ...prev,
      isModalOpen: false,
      mode: "",
    }));
  };

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

  const { data: saleChallanList, isLoading } = useQuery({
    queryKey: [
      "saleChallan",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
        is_gray: debouncedState === "gray" ? "1" : "0",
        from: debouncedFromDate,
        to: debouncedToDate,
        quality_id: debouncedQuality,
        from_challan_no: debouncedFromChallan,
        to_challan_no: debouncedToChallan,
        sale_challan_type: debouncedType,
        order_no: debouncedOrderNo,
        bill_status: debouncedBillStatus,
        party_id: debouncedParty,
      },
    ],
    queryFn: async () => {
      const params = {
        company_id: companyId,
        page,
        pageSize,
        is_gray: debouncedState === "gray" ? "1" : "0",
        from: debouncedFromDate,
        to: debouncedToDate,
        quality_id: debouncedQuality,
        from_challan: debouncedFromChallan,
        to_challan: debouncedToChallan,
        sale_challan_type: debouncedType,
        order_no: debouncedOrderNo,
        bill_status: debouncedBillStatus,
        party_id: debouncedParty,
      };

      if (debouncedFromDate) {
        params.from = dayjs(debouncedFromDate).format("YYYY-MM-DD");
      }
      if (debouncedToDate) {
        params.to = dayjs(debouncedToDate).format("YYYY-MM-DD");
      }
      const res = await getSaleChallanListRequest({ params });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  function navigateToAdd() {
    localStorage.removeItem("SALE_CHALLAN_ADD");
    navigate("/sales/challan/sale-challan/add");
  }

  function navigateToUpdate(id) {
    navigate(`/sales/challan/sale-challan/update/${id}`);
  }

  function downloadPdf() {
    // const { leftContent, rightContent } = getPDFTitleContent({ user, company });
    const body = saleChallanList?.row?.map((item, index) => {
      const {
        createdAt,
        challan_no,
        gray_order,
        party,
        inhouse_quality,
        total_taka,
        total_meter,
        sale_challan_types,
        bill_status,
        is_paid,
      } = item;
      return [
        index + 1,
        dayjs(createdAt).format("DD-MM-YYYY"),
        gray_order?.order_no,
        challan_no,
        `${party?.first_name} ${party?.last_name}`,
        `${inhouse_quality?.quality_name} (${inhouse_quality?.quality_weight}KG)`,
        total_taka,
        total_meter,
        sale_challan_types.length
          ? sale_challan_types
              .map(({ sale_challan_type }) => sale_challan_type)
              .join(", ")
          : "-",
        bill_status,
        is_paid ? "Paid" : "UnPaid",
      ];
    });

    const tableTitle = [
      "ID",
      "Challan Date",
      "Order No",
      "Challan / Bill",
      "Party Name",
      "Quality",
      "Total Taka / Piece",
      "Total Meter",
      "Challan Type",
      "Bill Status",
      "Payment Status",
    ];

    // Set localstorage item information
    localStorage.setItem("print-array", JSON.stringify(body));
    localStorage.setItem("print-title", "Job Taka List");
    localStorage.setItem("print-head", JSON.stringify(tableTitle));
    localStorage.setItem("total-count", "0");

    // downloadUserPdf({
    //   body,
    //   head: [
    //     [
    //       "ID",
    //       "Challan Date",
    //       "Order No",
    //       "Challan / Bill",
    //       "Party Name",
    //       "Quality",
    //       "Total Taka / Piece",
    //       "Total Meter",
    //       "Challan Type",
    //       "Bill Status",
    //       "Payment Status",
    //     ],
    //   ],
    //   leftContent,
    //   rightContent,
    //   title: "Job Taka List",
    // });

    window.open("/print");
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => index + 1,
      sorter: {
        compare: (a, b) => {
          return a?.id - b?.id;
        },
      },
    },
    {
      title: "Challan Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => dayjs(text).format("DD-MM-YYYY"),
      sorter: {
        compare: (a, b) => {
          return a?.createdAt - b?.createdAt;
        },
      },
    },
    {
      title: "Order No",
      dataIndex: ["gray_order", "order_no"],
      key: "order_no",
      render: (text, record) => {
        return(
          <div style={{fontWeight: 600}}>
            {text}
          </div>
        )
      }, 
      sorter: {
        compare: (a, b) => {
          return a?.gray_order?.order_no - b?.gray_order?.order_no;
        },
      },
    },
    {
      title: "Challan/Bill",
      dataIndex: "challan_no",
      key: "challan_no",
      render: (text, record) => {
        return(
          <Tooltip title = {record?.challan_type == "normal_challan"?
            "Normal Challan"
            :"Lotwise Challan"}>
            <div style={{fontWeight: 600}}>
              {text}
            </div>
          </Tooltip>
        )
      }, 
      sorter: {
        compare: (a, b) => {
          return a?.challan_no - b?.challan_no;
        },
      },
    },
    {
      title: "Party Name",
      dataIndex: "party",
      key: "party",
      render: (text, record) => {
        return(
          <div>
            <div style={{fontWeight: 600}}>
              {String(`${text?.first_name || ""} ${text?.last_name || ""}`).toUpperCase()}
            </div>
            <div>
              {record?.party?.party?.company_name}
            </div>
          </div>
        )
      },
      sorter: {
        compare: (a, b) => {
          return a?.party?.first_name - b?.party?.first_name;
        },
      },
    },
    {
      title: "Quality Name",
      render: (details) => {
        return(
          <div style={{
            fontSize: 13
          }}>
            {getDisplayQualityName(details?.inhouse_quality)}
          </div>
        )
      },
      sorter: {
        compare: (a, b) => {
          return (
            a?.inhouse_quality?.quality_name - b?.inhouse_quality?.quality_name
          );
        },
      },
    },
    {
      title: "Total Taka",
      dataIndex: "total_taka",
      key: "total_taka",
      sorter: {
        compare: (a, b) => {
          return a?.total_taka - b?.total_taka;
        },
      },
    },
    {
      title: "Total Meter",
      dataIndex: "total_meter",
      key: "total_meter",
      sorter: {
        compare: (a, b) => {
          return a?.total_meter - b?.total_meter;
        },
      },
    },
    {
      title: "Challan Type",
      dataIndex: "sale_challan_types",
      key: "sale_challan_types",
      render: (text) => {
        return (
          <div
            style={{
              fontWeight: 600,
            }}
          >
            {text.map(({ sale_challan_type }) => (
              <Tag color={sale_challan_type == "purchase/trading"?PURCHASE_TAG_COLOR:
                sale_challan_type == "taka(inhouse)"?SALE_TAG_COLOR:JOB_TAG_COLOR
              } key={sale_challan_type}>
                {sale_challan_type}
              </Tag>
            ))}
          </div>
        );
      },
    }
    ,
    {
      title: "Bill Status",
      dataIndex: "bill_status",
      key: "bill_status",
      render: (text) => {
        if (text.toLowerCase() === "pending") {
          return <Tag color="red">Pending</Tag>;
        } else {
          return <Tag color="green">Received</Tag>;
        }
      },
      sorter: {
        compare: (a, b) => {
          return a?.bill_status - b?.bill_status;
        },
      },
    },
    {
      title: "Payment Status",
      render: (details) => {
        return details.is_paid ? (
          <Tag color="green">Paid</Tag>
        ) : (
          <Tag color="red">Unpaid</Tag>
        );
      },
      sorter: {
        compare: (a, b) => {
          return a?.is_paid - b?.is_paid;
        },
      },
    },
    {
      title: "Action",
      render: (details) => {
        let is_return_option = 0;

        details?.sale_challan_details?.map((element) => {
          if (element?.is_returned) {
            is_return_option = 1;
          } else {
            is_return_option = 0;
          }
        });

        return (
          <Space>
            <ViewChallan details={[details]} />

            {details?.sale_bill == null && (
              <>
                <Button
                  onClick={() => {
                    navigateToUpdate(details.id);
                  }}
                >
                  <EditOutlined />
                </Button>

                <DeleteSaleChallan details={details} />
              </>
            )}
            
            {is_return_option == 0 && String(details?.bill_status).toLowerCase() !== "pending" && (
              <ViewSaleChallan details={details} companyId={companyId} />
            )}

            <Button
              onClick={() => {
                let MODE;
                if (details.bill_status !== "pending") {
                  MODE = "VIEW";
                } else if (details.bill_status === "pending") {
                  MODE = "ADD";
                }
                setSaleChallanModal((prev) => {
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

  const rowSelectionHandler = {
    rowSelection,
    onChange: (selectedRowKeys, selectedRows) => {
      setRowSelection(selectedRowKeys);
      setMultipleData(selectedRows);
    },
  };

  const [multipleModelOpen, setMultipleModelOpen] = useState(false);
  const [multipleData, setMultipleData] = useState([]);

  const MutlipleChallanPressHandler = () => {
    setMultipleModelOpen(true);
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
        dataSource={saleChallanList?.row || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          current: page + 1,
          pageSize: pageSize,
          total: saleChallanList?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
        rowSelection={rowSelectionHandler}
        summary={(pageData) => {
          let totalTaka = 0;
          let totalMeter = 0;
          pageData.forEach((row) => {
            totalTaka += +row.total_taka || 0;
            totalMeter += +row.total_meter || 0;
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
                <Table.Summary.Cell />
                <Table.Summary.Cell>
                  <Typography.Text>{parseFloat(saleChallanList?.total_taka).toFixed(2) || 0}</Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <Typography.Text>{parseFloat(saleChallanList?.total_meter).toFixed(2) || 0}</Typography.Text>
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
    <div className="flex flex-col p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary">Sales Challan List </h3>
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
              value={state}
              onChange={(e) => setState(e.target.value)}
            >
              <Flex align="center" gap={10}>
                <Radio value={"cash"}> Cash</Radio>
                <Radio value={"gray"}> Grey </Radio>
              </Flex>
            </Radio.Group>
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
                allowClear
                placeholder="Select Party"
                value={party}
                loading={isLoadingPartyList}
                options={partyUserListRes?.partyList?.rows?.map((party) => ({
                  label:
                    party.first_name +
                    " " +
                    party.last_name +
                    " " +
                    `| ( ${party?.username})`,
                  value: party.id,
                }))}
                dropdownStyle={{
                  textTransform: "capitalize",
                }}
                onChange={setParty}
                style={{
                  textTransform: "capitalize",
                }}
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
                    label: getDisplayQualityName(item),
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
            disabled={!saleChallanList?.row?.length}
            onClick={downloadPdf}
            className="flex-none"
          />
        </Flex>
      </div>

      <div className="flex items-center justify-end gap-5 mx-3 mb-3 mt-2">
        <Flex align="center" gap={10}>
          {rowSelection?.length > 0 && (
            <Flex align="center" gap={10}>
              <Button
                type="primary"
                onClick={() => {
                  MutlipleChallanPressHandler();
                }}
              >
                MULTIPLE PRINT
              </Button>
            </Flex>
          )}

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
            <Typography.Text className="whitespace-nowrap">To</Typography.Text>
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
              Bill Status
            </Typography.Text>
            <Select
              allowClear
              placeholder="Select"
              value={billStatus}
              options={[
                { label: "Pending", value: "pending" },
                { label: "Generated", value: "generated" },
              ]}
              dropdownStyle={{
                textTransform: "capitalize",
              }}
              onChange={setBillStatus}
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
            <Input
              placeholder="Challan NO"
              value={fromChallan}
              onChange={(e) => setFromChallan(e.target.value)}
              style={{ width: "150px" }}
            />
          </Flex>

          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">To</Typography.Text>
            <Input
              placeholder="Challan NO"
              value={toChallan}
              onChange={(e) => setToChallan(e.target.value)}
              style={{ width: "150px" }}
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

      {saleChallanModal.isModalOpen && (
        <SaleChallanBill
          details={saleChallanModal.details}
          isModelOpen={saleChallanModal.isModalOpen}
          handleCloseModal={handleCloseModal}
          MODE={saleChallanModal.mode}
        />
      )}

      {multipleModelOpen && (
        <ViewChallan details={multipleData} isMutliple={true} />
      )}
    </div>
  );
};

export default SaleChallanList;
