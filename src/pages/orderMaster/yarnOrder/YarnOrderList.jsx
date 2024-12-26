import {
  Button,
  Flex,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  Select,
} from "antd";
import {
  FilePdfOutlined,
  PlusCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "../../../api/hooks/auth";
import { downloadUserPdf, getPDFTitleContent } from "../../../lib/pdf/userPdf";
import dayjs from "dayjs";
import { usePagination } from "../../../hooks/usePagination";
import { getYarnOrderListRequest } from "../../../api/requests/orderMaster";
import { useContext, useState } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import YarnOrderAdvanceModal from "../../../components/orderMaster/yarnOrder/YarnOrderAdvanceModal";
import DeleteYarnOrderButton from "../../../components/orderMaster/yarnOrder/DeleteYarnOrder";
import GridInformationModel from "../../../components/common/modal/gridInformationModel";
import useDebounce from "../../../hooks/useDebounce";
import { getYSCDropdownList } from "../../../api/requests/reports/yarnStockReport";
import { getSupplierListRequest } from "../../../api/requests/users";

function YarnOrderList() {
  const navigate = useNavigate();
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();
  const { companyId, financialYearEnd } = useContext(GlobalContext);

  const [orderStatus, setOrderStatus] = useState(null);
  const debouncedOrderStatus = useDebounce(orderStatus, 500);
  const [yarnCompanyName, setYarnCompanyName] = useState(null);
  const debouceYarnCompanyName = useDebounce(yarnCompanyName, 500);
  const [supplier, setSupplier] = useState(null);
  const debounceSupplier = useDebounce(supplier, 500);

  const { data: supplierListRes, isLoading: isLoadingSupplierList } = useQuery({
    queryKey: ["supplier", "list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getSupplierListRequest({
        params: { company_id: companyId },
      });
      return res.data?.data?.supplierList;
    },
    enabled: Boolean(companyId),
  });

  const { data: yscdListRes, isLoading: isLoadingYSCDList } = useQuery({
    queryKey: ["dropdown", "yarn_company", "list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getYSCDropdownList({
        params: { company_id: companyId },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const { data: yarnOrderListRes, isLoading } = useQuery({
    queryKey: [
      "order-master",
      "yarn-order",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
        end: financialYearEnd,
        order_status: debouncedOrderStatus,
        yarn_company_name: debouceYarnCompanyName,
        supplier_name: debounceSupplier,
        // yarn_company_id: debouncedDenier,
        // supplier_id: debouncedSupplier,
      },
    ],
    queryFn: async () => {
      const res = await getYarnOrderListRequest({
        params: {
          company_id: companyId,
          page,
          pageSize,
          end: financialYearEnd,
          order_status: debouncedOrderStatus,
          yarn_company_name: debouceYarnCompanyName,
          // yarn_company_id: debouncedDenier,
          // supplier_id: debouncedSupplier,
          supplier_name: debounceSupplier,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  function navigateToAdd() {
    navigate("/order-master/my-yarn-orders/add");
  }

  function navigateToUpdate(id) {
    navigate(`/order-master/my-yarn-orders/update/${id}`);
  }

  function downloadPdf() {
    // const { leftContent, rightContent } = getPDFTitleContent({ user, company });
    const body = yarnOrderListRes?.yarnOrderList?.rows?.map(
      (yarnOrder, index) => {
        const {
          id,
          order_date,
          yarn_stock_company = {},
          user = {},
          order_no,
          lot_no,
          yarn_grade,
          rate,
          quantity,
          approx_cartoon,
          approx_amount,
          status,
        } = yarnOrder;
        const {
          yarn_denier,
          filament,
          luster_type,
          yarn_color,
          yarn_Sub_type,
          yarn_company_name,
        } = yarn_stock_company;

        const { first_name: supplierName } = user;
        return [
          index + 1,
          order_no,
          dayjs(order_date).format("DD-MM-YYYY"),
          supplierName,
          yarn_company_name,
          `${yarn_denier}D/${filament}F (${yarn_Sub_type} ${luster_type} - ${yarn_color})`,
          lot_no,
          yarn_grade,
          approx_cartoon,
          quantity,
          rate,
          approx_amount,
          status,
        ];
      }
    );

    let tableTitle = [
      "ID",
      "Order No.",
      "Order Date",
      "Party/Supplier Name",
      "Yarn Company",
      "Dennier",
      "Lot no",
      "Yarn Grade",
      "Cartoon",
      "Quantity",
      "Rate",
      "Approx Amount",
      "Order Status",
    ];

    // Set localstorage item information
    localStorage.setItem("print-array", JSON.stringify(body));
    localStorage.setItem("print-title", "Yarn Order List");
    localStorage.setItem("print-head", JSON.stringify(tableTitle));
    localStorage.setItem("total-count", "0");

    // downloadUserPdf({
    //   body,
    //   head: [
    //     [
    //       "ID",
    //       "Order No.",
    //       "Order Date",
    //       "Party/Supplier Name",
    //       "Yarn Company",
    //       "Dennier",
    //       "Lot no",
    //       "Yarn Grade",
    //       "Cartoon",
    //       "Quantity",
    //       "Rate",
    //       "Approx Amount",
    //       "Order Status",
    //     ],
    //   ],
    //   leftContent,
    //   rightContent,
    //   title: "Yarn Order List",
    // });

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
      title: "Order Date",
      width: 150,
      render: ({ order_date }) => {
        return dayjs(order_date).format("DD-MM-YYYY");
      },
      key: "order_date",
    },
    {
      title: "Order No.",
      dataIndex: "order_no",
      key: "order_no",
    },
    {
      title: "Party/Supplier Name",
      dataIndex: "supplier_name",
      key: "user.first_name",
    },
    {
      title: "Yarn Company",
      dataIndex: ["yarn_stock_company", "yarn_company_name"],
      key: "yarn_stock_company.yarn_company_name",
    },
    {
      title: "Denier",
      render: ({ yarn_stock_company }) => {
        const {
          yarn_denier = 0,
          filament = 0,
          luster_type = "",
          yarn_color = "",
          yarn_Sub_type = "",
        } = yarn_stock_company;
        return `${yarn_denier}D/${filament}F (${yarn_Sub_type} ${luster_type} - ${yarn_color})`;
      },
      key: "denier",
    },
    {
      title: "Lot No.",
      dataIndex: "lot_no",
      key: "lot_no",
    },
    {
      title: "Yarn grade",
      dataIndex: "yarn_grade",
      key: "yarn_grade",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Delivered Quantity",
      dataIndex: "delivered_quantity",
      key: "delivered_quantity",
    },
    {
      title: "Pending Quantity",
      dataIndex: "pending_quantity",
      key: "pending_quantity",
    },
    {
      title: "Rate",
      dataIndex: "rate",
      key: "rate",
    },
    {
      title: "Approx amount",
      dataIndex: "approx_amount",
      key: "approx_amount",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text) =>
        text == "FINISHED" ? (
          <>
            <Tag color="green">FINISHED</Tag>
          </>
        ) : (
          <>
            <Tag color="red">{text}</Tag>
          </>
        ),
    },
    {
      title: "Action",
      render: (yarnOrder) => {
        const {
          order_date,
          yarn_stock_company = {},
          user = {},
          order_no,
          lot_no,
          yarn_grade,
          rate,
          credit_days,
          quantity,
          pending_quantity,
          delivered_quantity,
          approx_cartoon,
          pending_cartoon,
          delivered_cartoon,
          approx_amount,
          id,
          has_advance_payment_count,
        } = yarnOrder;

        const {
          yarn_denier,
          filament,
          luster_type,
          yarn_color,
          yarn_Sub_type,
          yarn_company_name,
        } = yarn_stock_company;

        const { first_name: supplierName } = user;

        return (
          <Space>
            <GridInformationModel
              title="Yarn Order Details"
              details={[
                { label: "Yarn Company", value: yarn_company_name },
                {
                  label: "Dennier",
                  value: `${yarn_denier}D/${filament}F (${yarn_Sub_type} ${luster_type} - ${yarn_color})`,
                },
                {
                  label: "Order Date",
                  value: dayjs(order_date).format("DD-MM-YYYY"),
                },
                { label: "Supplier Name", value: supplierName },
                { label: "Order No.", value: order_no },
                { label: "Lot No.", value: lot_no },
                { label: "Yarn Grade", value: yarn_grade },
                { label: "Rate", value: rate },
                { label: "Credit Days", value: credit_days },
                { label: "Quantity", value: quantity },
                { label: "Pending Quantity", value: pending_quantity },
                { label: "Delivered Quantity", value: delivered_quantity },
                { label: "Approx Cartoon", value: approx_cartoon },
                { label: "Pending Cartoon", value: pending_cartoon },
                { label: "Delivered Cartoon", value: delivered_cartoon },
                { label: "Approx Amount", value: approx_amount },
              ]}
            />

            {quantity == pending_quantity && (
              <Button
                onClick={() => {
                  navigateToUpdate(id);
                }}
              >
                <EditOutlined />
              </Button>
            )}

            {!has_advance_payment_count && (
              <DeleteYarnOrderButton data={yarnOrder} />
            )}
            <YarnOrderAdvanceModal yarnOrder={yarnOrder} />
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
        dataSource={yarnOrderListRes?.yarnOrderList?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          current: page + 1,
          pageSize: pageSize,
          total: yarnOrderListRes?.yarnOrderList?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
        style={{ overflow: "auto" }}
        summary={() => {
          if (!yarnOrderListRes?.yarnOrderList?.rows?.length) return;
          const {
            total_quantity,
            total_delivered_quantity,
            total_pending_quantity,
            total_approxAmount,
          } = yarnOrderListRes;
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
                <Table.Summary.Cell />
                <Table.Summary.Cell>
                  <Typography.Text>{total_quantity}</Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <Typography.Text>{total_delivered_quantity}</Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <Typography.Text>{total_pending_quantity}</Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell>
                  <Typography.Text>{total_approxAmount}</Typography.Text>
                </Table.Summary.Cell>
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
          <h3 className="m-0 text-primary">Yarn Order List</h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>

        <Flex style={{ marginLeft: "auto" }} gap={15}>
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Order Status
            </Typography.Text>

            <Select
              placeholder="Select order status"
              loading={isLoading}
              options={[
                {
                  label: "Pending",
                  value: "PENDING",
                },
                {
                  label: "Cancelled",
                  value: "CANCELLED",
                },
                {
                  label: "Finished",
                  value: "FINISHED",
                },
              ]}
              value={orderStatus}
              onChange={setOrderStatus}
              style={{
                textTransform: "capitalize",
              }}
              dropdownStyle={{
                textTransform: "capitalize",
              }}
              className="min-w-40"
              allowClear={true}
            />
          </Flex>

          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Yarn company
            </Typography.Text>

            <Select
              placeholder="Select Yarn company"
              loading={isLoading}
              options={yscdListRes?.yarnCompanyList?.map(
                ({ yarn_company_name = "" }) => {
                  return {
                    label: yarn_company_name,
                    value: yarn_company_name,
                  };
                }
              )}
              value={yarnCompanyName}
              onChange={setYarnCompanyName}
              style={{
                textTransform: "capitalize",
              }}
              dropdownStyle={{
                textTransform: "capitalize",
              }}
              className="min-w-40"
              allowClear={true}
            />
          </Flex>

          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Select Supplier
            </Typography.Text>

            <Select
              placeholder="Select supplier"
              loading={isLoadingSupplierList}
              options={supplierListRes?.rows?.map((supervisor) => ({
                label: `${supervisor?.first_name} ${supervisor?.last_name} | ( ${supervisor?.username} )`,
                value: supervisor?.first_name,
              }))}
              allowClear
              value={supplier}
              onChange={setSupplier}
            />
          </Flex>
        </Flex>

        <Button
          icon={<FilePdfOutlined />}
          type="primary"
          disabled={!yarnOrderListRes?.yarnOrderList?.rows?.length}
          onClick={downloadPdf}
        />
      </div>
      {renderTable()}
    </div>
  );
}

export default YarnOrderList;
