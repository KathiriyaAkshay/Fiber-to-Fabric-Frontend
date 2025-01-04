import { Button, Flex, Space, Spin, Table, Input, Tag } from "antd";
import { EditOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usePagination } from "../../../hooks/usePagination";
import { useContext, useState } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import useDebounce from "../../../hooks/useDebounce";
import { getScheduleDeliveryListRequest } from "../../../api/requests/orderMaster";
import dayjs from "dayjs";
import GridInformationModel from "../../../components/common/modal/gridInformationModel";
import DeleteScheduleDelivery from "../../../components/orderMaster/scheduleDelivery/DeleteScheduleDelivery";

const ScheduleDeliveryList = () => {
  const navigate = useNavigate();
  const { companyId } = useContext(GlobalContext);
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { data: ScheduleDeliveryList, isLoading } = useQuery({
    queryKey: [
      "schedule-delivery",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
        search: debouncedSearch,
      },
    ],
    queryFn: async () => {
      const res = await getScheduleDeliveryListRequest({
        params: {
          company_id: companyId,
          page,
          pageSize,
          search: debouncedSearch,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  function navigateToAdd() {
    navigate("/order-master/my-orders");
  }

  function navigateToUpdate(id) {
    navigate(`/order-master/schedule-delivery-list/update/${id}`);
  }

  // function downloadPdf() {
  //   // const { leftContent, rightContent } = getPDFTitleContent({ user, company });

  //   const body = ScheduleDeliveryList?.scheduleDeliveryList?.map(
  //     (order, index) => {
  //       const companyName =
  //         order.order_type === "job"
  //           ? order.party.party.company_name
  //           : order.party.party.company_name; // supplier company should be here in else part.
  //       return [
  //         index + 1,
  //         order.order_no,
  //         dayjs(order.order_date).format("DD-MM-YYYY"),
  //         companyName,
  //         `${order.inhouse_quality.quality_name} (${order.inhouse_quality.quality_weight}KG)`,
  //         order.pending_taka,
  //         order.delivered_taka,
  //         order.pending_meter,
  //         order.delivered_meter,
  //         order.status,
  //       ];
  //     }
  //   );

  //   const tableTitle = [
  //     "ID",
  //     "Order No",
  //     "Order Date",
  //     "Company Name",
  //     "Quality",
  //     "Pending Taka",
  //     "Deliver Taka",
  //     "Pending Meter",
  //     "Deliver Meter",
  //     "Status",
  //   ];

  //   // Set localstorage item information
  //   localStorage.setItem("print-array", JSON.stringify(body));
  //   localStorage.setItem("print-title", "Order List");
  //   localStorage.setItem("print-head", JSON.stringify(tableTitle));
  //   localStorage.setItem("total-count", "0");

  //   window.open("/print");
  // }

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
          return `${details.party.checker_name}`;
        }
      },
    },
    {
      title: "Order No",
      dataIndex: ["gray_order", "order_no"],
      key: "order_no",
    },
    {
      title: "Taka / Meter",
      render: (_, record) => `${record.total_taka} / ${record.total_meter}`,
    },
    {
      title: "Checker Name/Mobile No",
      render: (details) => {
        if (details.party) {
          return `${details.party.checker_name}`;
        }
      },
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text) => (
        <Tag color={text === "pending" ? "red" : "green"}>
          {text.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Action",
      render: (details) => {
        return (
          <Space>
            <GridInformationModel
              title="Schedule Delivery Details"
              isScroll={true}
              details={[]}
            />
            <Button
              onClick={() => {
                navigateToUpdate(details.id);
              }}
            >
              <EditOutlined />
            </Button>
            <DeleteScheduleDelivery data={details} />
          </Space>
        );
      },
      key: "action",
    },
  ];

  function renderTable() {
    if (isLoading) {
      return (
        <Flex className="p-14" align="center" justify="center">
          <Spin tip="Loading" size="large"></Spin>
        </Flex>
      );
    }

    return (
      <Table
        dataSource={ScheduleDeliveryList?.scheduleDeliveryList || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          current: page + 1,
          pageSize: pageSize,
          total: ScheduleDeliveryList?.count || 0,
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
            <Input
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="min-w-40"
            />
          </Flex>

          {/* <Button
            icon={<FilePdfOutlined />}
            type="primary"
            disabled={!ScheduleDeliveryList?.scheduleDeliveryList?.length}
            onClick={downloadPdf}
            className="flex-none"
          /> */}
        </Flex>
      </div>
      {renderTable()}
    </div>
  );
};

export default ScheduleDeliveryList;
