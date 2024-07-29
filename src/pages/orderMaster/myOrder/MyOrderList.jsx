import { Button, Flex, Select, Space, Spin, Table, Typography, Tag } from "antd";
import {
  EditOutlined,
  FilePdfOutlined,
  PlusCircleOutlined,
  ClockCircleOutlined,
  RedoOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "../../../api/hooks/auth";
import { downloadUserPdf, getPDFTitleContent } from "../../../lib/pdf/userPdf";
import { usePagination } from "../../../hooks/usePagination";
import { useContext, useState } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import useDebounce from "../../../hooks/useDebounce";
import { getCompanyMachineListRequest } from "../../../api/requests/machine";
import { getMyOrderListRequest } from "../../../api/requests/orderMaster";
import dayjs from "dayjs";
import {
  getBrokerListRequest,
  getPartyListRequest,
} from "../../../api/requests/users";
import { getInHouseQualityListRequest } from "../../../api/requests/qualityMaster";
import DeleteMyOrder from "../../../components/orderMaster/myOrder/DeleteMyOrder";
import { ORDER_STATUS, ORDER_TYPE } from "../../../constants/orderMaster";
import GridInformationModel from "../../../components/common/modal/gridInformationModel";

const MyOrderList = () => {
  const [machine, setMachine] = useState();
  const [status, setStatus] = useState("pending");
  const [orderType, setOrderType] = useState("taka(inhouse)");
  const [broker, setBroker] = useState();
  const [quality, setQuality] = useState();
  const [party, setParty] = useState();
  const debouncedMachine = useDebounce(machine, 500);
  const debouncedStatus = useDebounce(status, 500);
  const debouncedOrderType = useDebounce(orderType, 500);
  const debouncedBroker = useDebounce(broker, 500);
  const debouncedQuality = useDebounce(quality, 500);
  const debouncedParty = useDebounce(party, 500);

  const { company, companyId } = useContext(GlobalContext);
  const navigate = useNavigate();
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();
  const { data: user } = useCurrentUser();

  const { data: machineListRes, isLoading: isLoadingMachineList } = useQuery({
    queryKey: ["machine", "list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getCompanyMachineListRequest({
        companyId,
        params: { company_id: companyId },
      });
      return res.data?.data?.machineList;
    },
    enabled: Boolean(companyId),
  });

  const { data: brokerUserListRes, isLoading: isLoadingBrokerList } = useQuery({
    queryKey: ["broker", "list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getBrokerListRequest({
        params: { company_id: companyId, page: 0, pageSize: 99999 },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const { data: inHouseQualityList, isLoading: isLoadingInHouseQualityList } =
    useQuery({
      queryKey: [
        "inhouse-quality",
        "list",
        {
          company_id: companyId,
          machine_name: debouncedMachine,
          page: 0,
          pageSize: 9999,
          is_active: 1,
        },
      ],
      queryFn: async () => {
        if (debouncedMachine) {
          const res = await getInHouseQualityListRequest({
            params: {
              company_id: companyId,
              machine_name: debouncedMachine,
              page: 0,
              pageSize: 9999,
              is_active: 1,
            },
          });
          return res.data?.data;
        }
      },
      enabled: Boolean(companyId),
    });

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

  const { data: myOrderList, isLoading } = useQuery({
    queryKey: [
      "myOrder",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
        machine_name: debouncedMachine,
        status: debouncedStatus,
        order_type: debouncedOrderType,
        quality_id: debouncedQuality,
        broker_id: debouncedBroker,
        party_id: debouncedParty,
      },
    ],
    queryFn: async () => {
      const res = await getMyOrderListRequest({
        params: {
          company_id: companyId,
          page,
          pageSize,
          machine_name: debouncedMachine,
          status: debouncedStatus,
          order_type: debouncedOrderType,
          quality_id: debouncedQuality,
          broker_id: debouncedBroker,
          party_id: debouncedParty,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  function navigateToAdd() {
    navigate("/order-master/my-orders/add");
  }

  function navigateToUpdate(id) {
    navigate(`/order-master/my-orders/update/${id}`);
  }

  function downloadPdf() {
    const { leftContent, rightContent } = getPDFTitleContent({ user, company });

    const body = myOrderList?.row?.map((user, index) => {
      const { quality_name, quality_group, production_type, is_active } = user;
      return [
        index + 1,
        quality_name,
        quality_group,
        production_type,
        is_active ? "Active" : "Inactive",
      ];
    });

    downloadUserPdf({
      body,
      head: [["ID", "Quality Name", "Quality Group", "Product Type", "Status"]],
      leftContent,
      rightContent,
      title: "Trading Quality List",
    });
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => ((page * pageSize) + index) + 1,
    },
    {
      title: "Order Date",
      width: 150,
      render: (details) => {
        return dayjs(details.createdAt).format("DD-MM-YYYY");
      },
    },
    {
      title: "Order No",
      dataIndex: "order_no",
      key: "order_no",
    },
    {
      title: "Party / Supplier Name",
      render: (details) => {
        if (details.party) {
          return `${details.party.first_name} ${details.party.last_name}`;
        } else {
          return `${details.supplier_name}`;
        }
      },
    },
    {
      title: "Machine Name",
      dataIndex: "machine_name",
      key: "machine_name",
    },
    {
      title: "Quality Name",
      render: (details) => {
        return details?.inhouse_quality?.quality_name;
      },
    },
    {
      title: "Total Taka",
      dataIndex: "total_taka",
      key: "total_taka",
    },
    {
      title: "Pending Taka",
      dataIndex: "pending_taka",
      key: "pending_taka",
    },
    {
      title: "Deliver Taka",
      dataIndex: "delivered_taka",
      key: "delivered_taka",
    },

    {
      title: "Total Meter",
      dataIndex: "total_meter",
      key: "total_meter",
    },
    {
      title: "Pending Meter",
      dataIndex: "pending_meter",
      key: "pending_meter",
    },
    {
      title: "Deliver Meter",
      dataIndex: "delivered_meter",
      key: "delivered_meter",
    },
    {
      title: "Order Status",
      dataIndex: "status",
      key: "status",
      render: (text, record) => (
        text == "complete"?<>
          <Tag color="green">{text}</Tag>
        </>:<>
          <Tag color="red">{String(text).toUpperCase()}</Tag>
        </>
      )
    },
    {
      title: "Action",
      render: (details) => {
        console.log(details);
        return (
          <Space>
            <GridInformationModel
              title="Order Details"
              isScroll={true}
              details={[
                { label: "Order Type", value: details.order_type },
                {
                  label: "Order Date",
                  value: dayjs(details.order_date).format("DD-MM-YYYY"),
                },
                {
                  label: "Order Time",
                  value: dayjs(details.order_date).format("HH:mm:ss"),
                },
                { label: "Soda Code", value: details?.order_no },
                {
                  label: "Party / Supplier Name",
                  value: `${
                    details.party
                      ? `${details.party.first_name} ${details.party.last_name}`
                      : `${details.supplier_name}`
                  }`,
                },
                {
                  label: "Quality Name",
                  value: details.inhouse_quality.quality_name,
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

                { label: "Credit Days", value: details?.credit_days },
                { label: "Remarks", value: details?.notes },
                { label: "Delivered Lot", value: "" },
                { label: "Delivered Taka", value: details.delivered_taka },
                { label: "Delivered Meter", value: details.delivered_meter },
                { label: "Pending Meter", value: details.pending_meter },
                { label: "Return Meter", value: "" },
                { label: "Checker Name", value: "" },
                { label: "Checker Mobile No.", value: "" },
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
            <Button>
              <ClockCircleOutlined />
            </Button>
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
        dataSource={myOrderList?.row || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          total: myOrderList?.row?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
        summary={(tableData) => {
          let totalPendingTaka = 0;
          let totalDeliveredTaka = 0;
          let totalPendingMeter = 0;
          let totalDeliveredMeter = 0;

          tableData.forEach(
            ({
              pending_taka,
              delivered_taka,
              pending_meter,
              delivered_meter,
            }) => {
              totalPendingTaka += pending_taka;
              totalDeliveredTaka += delivered_taka;
              totalPendingMeter += pending_meter;
              totalDeliveredMeter += delivered_meter;
            }
          );
          return (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0}>
                <b>Total</b>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={1}>
                <b>{totalPendingTaka}</b>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1}>
                <b>{totalDeliveredTaka}</b>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1}></Table.Summary.Cell>
              <Table.Summary.Cell index={1}>
                <b>{totalPendingMeter}</b>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1}>
                <b>{totalDeliveredMeter}</b>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1}></Table.Summary.Cell>
              <Table.Summary.Cell index={1}></Table.Summary.Cell>
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
          <h3 className="m-0 text-primary">Order List</h3>
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
            <Select
              placeholder="Select Status"
              value={status}
              options={ORDER_STATUS}
              dropdownStyle={{
                textTransform: "capitalize",
              }}
              onChange={setStatus}
              style={{
                textTransform: "capitalize",
              }}
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

      <div className="flex items-center justify-end gap-5 mx-3 mb-3">
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
            allowClear = {true}
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
      </div>
      {renderTable()}
    </div>
  );
};

export default MyOrderList;
