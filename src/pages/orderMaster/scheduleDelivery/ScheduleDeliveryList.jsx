import { Button, Flex, Space, Spin, Table, Typography, Input } from "antd";
import {
  EditOutlined,
  FilePdfOutlined,
  PlusCircleOutlined,
  RedoOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
// import { useCurrentUser } from "../../../api/hooks/auth";
// import { downloadUserPdf, getPDFTitleContent } from "../../../lib/pdf/userPdf";
import { usePagination } from "../../../hooks/usePagination";
import { useContext, useState } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import useDebounce from "../../../hooks/useDebounce";
import { getMyOrderListRequest } from "../../../api/requests/orderMaster";
import dayjs from "dayjs";
import DeleteMyOrder from "../../../components/orderMaster/myOrder/DeleteMyOrder";
import GridInformationModel from "../../../components/common/modal/gridInformationModel";

const ScheduleDeliveryList = () => {
  //   const [machine, setMachine] = useState();
  const [search, setSearch] = useState("");
  //   const [orderType, setOrderType] = useState("taka(inhouse)");
  //   const [broker, setBroker] = useState();
  //   const [quality, setQuality] = useState();
  //   const [party, setParty] = useState();
  //   const debouncedStatus = useDebounce(status, 500);
  //   const debouncedOrderType = useDebounce(orderType, 500);
  const debouncedSearch = useDebounce(search, 500);

  //   const debouncedBroker = useDebounce(broker, 500);
  //   const debouncedQuality = useDebounce(quality, 500);
  //   const debouncedParty = useDebounce(party, 500);

  const { companyId } = useContext(GlobalContext);
  const navigate = useNavigate();
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();
  // const { data: user } = useCurrentUser();

  const { data: myOrderList, isLoading } = useQuery({
    queryKey: [
      "schedule-delivery",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
        // machine_name: debouncedMachine,
        // status: debouncedStatus,
        // order_type: debouncedOrderType,
        // quality_id: debouncedQuality,
        // broker_id: debouncedBroker,
        // party_id: debouncedParty,
      },
    ],
    queryFn: async () => {
      const res = await getMyOrderListRequest({
        params: {
          company_id: companyId,
          page,
          pageSize,
          //   machine_name: debouncedMachine,
          //   status: debouncedStatus,
          //   order_type: debouncedOrderType,
          //   quality_id: debouncedQuality,
          //   broker_id: debouncedBroker,
          //   party_id: debouncedParty,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  function navigateToAdd() {
    navigate("add");
  }

  function navigateToUpdate(id) {
    navigate(`/order-master/my-orders/update/${id}`);
  }

  function downloadPdf() {
    // const { leftContent, rightContent } = getPDFTitleContent({ user, company });

    const body = myOrderList?.row?.map((order, index) => {
      const companyName =
        order.order_type === "job"
          ? order.party.party.company_name
          : order.party.party.company_name; // supplier company should be here in else part.
      return [
        index + 1,
        order.order_no,
        dayjs(order.order_date).format("DD-MM-YYYY"),
        companyName,
        `${order.inhouse_quality.quality_name} (${order.inhouse_quality.quality_weight}KG)`,
        order.pending_taka,
        order.delivered_taka,
        order.pending_meter,
        order.delivered_meter,
        order.status,
      ];
    });

    const tableTitle = [
      "ID",
      "Order No",
      "Order Date",
      "Company Name",
      "Quality",
      "Pending Taka",
      "Deliver Taka",
      "Pending Meter",
      "Deliver Meter",
      "Status",
    ];

    // Set localstorage item information
    localStorage.setItem("print-array", JSON.stringify(body));
    localStorage.setItem("print-title", "Order List");
    localStorage.setItem("print-head", JSON.stringify(tableTitle));
    localStorage.setItem("total-count", "0");

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
      width: 150,
      render: (details) => {
        return dayjs(details.createdAt).format("DD-MM-YYYY");
      },
    },
    {
      title: "Quality Name",
      render: (details) => {
        return details?.inhouse_quality?.quality_name;
      },
    },
    {
      title: "Party Name",
      render: (details) => {
        if (details.party) {
          return `${details.party.first_name} ${details.party.last_name}`;
        } else {
          return `${details.supplier_name}`;
        }
      },
    },
    {
      title: "Order No",
      dataIndex: "machine_name",
      key: "machine_name",
    },
    {
      title: "Taka / Meter",
      dataIndex: "quality_name",
      key: "quality_name",
    },
    {
      title: "Checker Name/Mobile No",
      dataIndex: "total_taka",
      key: "total_taka",
    },
    {
      title: "Notes",
      dataIndex: "pending_taka",
      key: "pending_taka",
    },
    {
      title: "Status",
      dataIndex: "delivered_taka",
      key: "delivered_taka",
    },
    {
      title: "Action",
      render: (details) => {
        return (
          <Space>
            <GridInformationModel
              title="Order Details"
              isScroll={true}
              details={[
                { label: "Order Type", value: details?.order_type },
                {
                  label: "Order Date",
                  value: dayjs(details?.order_date).format("DD-MM-YYYY"),
                },
                { label: "Soda Code", value: details?.order_no },
                {
                  label: "Party Name",
                  value: `${
                    details.party
                      ? `${details?.party.first_name} ${details?.party.last_name}`
                      : `${details?.supplier_name}`
                  }`,
                },
                {
                  label: "Quality Name",
                  value: details?.inhouse_quality.quality_name,
                },
                {
                  label: "Broker name",
                  value: `${details.broker.first_name} ${details.broker.last_name}`,
                },
                { label: "Total Lot", value: details.total_lot },
                { label: "Total Taka", value: details.total_taka },
                { label: "Total Meter", value: details.total_meter },
                { label: "Rate", value: details.rate },
                { label: "Approx Amount", value: details?.amount },
                { label: "Brokerage(%)", value: 0 },
                { label: "Brokerage(Rs)", value: 0 },
                { label: "Total Amount", value: details.total_amount },
                { label: "Discount", value: details.discount },
                { label: "Credit Days", value: details?.credit_days },
                { label: "Remarks", value: details?.notes },
                { label: "Delivered Taka", value: details.delivered_taka },
                { label: "Delivered Meter", value: details.delivered_meter },
                { label: "Pending Taka", value: details.pending_taka },
                { label: "Pending Meter", value: details.pending_meter },
                { label: "Return Taka", value: "**" },
                { label: "Return Meter", value: "**" },

                { label: "Delivered", value: "**" },
                {
                  label: "Date",
                  value: dayjs(details?.createdAt).format("DD-MM-YYYY"),
                },
                {
                  label: "Time",
                  value: dayjs(details?.createdAt).format("hh:mm:ss"),
                },

                {
                  label: "Checker Name",
                  value: details?.party?.party.checker_name,
                },
                {
                  label: "Checker Mobile No.",
                  value: details?.party?.party?.checker_number,
                },
              ]}
            />
            <Button
              onClick={() => {
                navigateToUpdate(details.id);
              }}
            >
              <EditOutlined />
            </Button>
            <DeleteMyOrder details={details} />
            {/* {orderType === "taka(inhouse)" && (
              <Button>
                <ClockCircleOutlined />
              </Button>
            )} */}
            <Button>
              <RedoOutlined />
            </Button>
          </Space>
        );
      },
      key: "action",
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
        dataSource={[]}
        columns={columns}
        rowKey={"id"}
        pagination={{
          current: page + 1,
          pageSize: pageSize,
          total: myOrderList?.row?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
        summary={() => {
          return (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0}>
                <b>Total</b>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2}></Table.Summary.Cell>
              <Table.Summary.Cell index={3}></Table.Summary.Cell>
              <Table.Summary.Cell index={4}></Table.Summary.Cell>
              <Table.Summary.Cell index={5}></Table.Summary.Cell>
              <Table.Summary.Cell index={6}></Table.Summary.Cell>
              <Table.Summary.Cell index={7}></Table.Summary.Cell>
              <Table.Summary.Cell index={8}></Table.Summary.Cell>
              <Table.Summary.Cell index={9}></Table.Summary.Cell>
              <Table.Summary.Cell index={10}></Table.Summary.Cell>
            </Table.Summary.Row>
          );
        }}
      />
    );
  }
  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary">Schedule Delivery</h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>

        <Flex align="center" gap={10}>
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Order Status
            </Typography.Text>
            <Input
              placeholder="Search"
              value={search}
              onChange={setSearch}
              className="min-w-40"
            />
          </Flex>

          <Button
            icon={<FilePdfOutlined />}
            type="primary"
            disabled={!myOrderList?.row?.length}
            onClick={downloadPdf}
            className="flex-none"
          />
        </Flex>
      </div>

      {/* <div className="flex items-center justify-end gap-5 mx-3 mb-3">
        <Flex align="center" gap={10}>
          <Typography.Text className="whitespace-nowrap">
            Machine
          </Typography.Text>
          <Select
            placeholder="Select Machine"
            loading={isLoadingMachineList}
            value={machine}
            options={machineListRes?.rows?.map((machine) => ({
              label: machine?.machine_name,
              value: machine?.machine_name,
            }))}
            dropdownStyle={{
              textTransform: "capitalize",
            }}
            onChange={setMachine}
            style={{
              textTransform: "capitalize",
            }}
            className="min-w-40"
            allowClear
          />
        </Flex>
        <Flex align="center" gap={10}>
          <Typography.Text className="whitespace-nowrap">
            Order Type
          </Typography.Text>
          <Select
            placeholder="Select Order Type"
            value={orderType}
            options={ORDER_TYPE}
            dropdownStyle={{
              textTransform: "capitalize",
            }}
            onChange={setOrderType}
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
            placeholder="Select Order Type"
            value={quality}
            loading={isLoadingInHouseQualityList}
            options={inHouseQualityList?.rows?.map(
              ({ id = 0, quality_name = "" }) => ({
                label: quality_name,
                value: id,
              })
            )}
            dropdownStyle={{
              textTransform: "capitalize",
            }}
            onChange={setQuality}
            style={{
              textTransform: "capitalize",
            }}
            allowClear
            className="min-w-40"
          />
        </Flex>
        <Flex align="center" gap={10}>
          <Typography.Text className="whitespace-nowrap">Party</Typography.Text>
          <Select
            placeholder="Select Party"
            value={party}
            allowClear
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
            Broker
          </Typography.Text>
          <Select
            placeholder="Select Broker"
            value={broker}
            dropdownStyle={{
              textTransform: "capitalize",
            }}
            allowClear={true}
            onChange={setBroker}
            style={{
              textTransform: "capitalize",
            }}
            className="min-w-40"
            loading={isLoadingBrokerList}
            options={brokerUserListRes?.brokerList?.rows?.map((broker) => ({
              label:
                broker.first_name +
                " " +
                broker.last_name +
                " " +
                `| (${broker?.username})`,
              value: broker.id,
            }))}
          />
        </Flex>
      </div> */}
      {renderTable()}
    </div>
  );
};

export default ScheduleDeliveryList;
