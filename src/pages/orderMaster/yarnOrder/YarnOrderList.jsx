import { Button, Space, Spin, Table } from "antd";
import {
  EditOutlined,
  FilePdfOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "../../../api/hooks/auth";
import { downloadUserPdf, getPDFTitleContent } from "../../../lib/pdf/userPdf";
import dayjs from "dayjs";
import ViewDetailModal from "../../../components/common/modal/ViewDetailModal";
import { usePagination } from "../../../hooks/usePagination";
import { getYarnOrderListRequest } from "../../../api/requests/orderMaster";
import { useContext } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";

function YarnOrderList() {
  const navigate = useNavigate();
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();
  const { data: user } = useCurrentUser();
  const { company, companyId } = useContext(GlobalContext);

  const { data: yarnOrderListRes, isLoading } = useQuery({
    queryKey: [
      "order-master",
      "yarn-order",
      "list",
      { company_id: companyId, page, pageSize },
    ],
    queryFn: async () => {
      const res = await getYarnOrderListRequest({
        params: { company_id: companyId, page, pageSize },
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
    const { leftContent, rightContent } = getPDFTitleContent({ user, company });
    const body = yarnOrderListRes?.yarnOrderList?.rows?.map((yarnOrder) => {
      const { id, first_name, last_name, mobile, address } = yarnOrder;
      return [id, first_name, last_name, mobile, address];
    });

    downloadUserPdf({
      body,
      head: [
        ["ID", "First Name", "Last Name", "Contact No", "Rate", "Address"],
      ],
      leftContent,
      rightContent,
      title: "Yarn Order List",
    });
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Order Date",
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
      dataIndex: ["user", "first_name"],
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
            <ViewDetailModal
              title="Yarn Order Detail"
              details={[
                { title: "Yarn Company", value: yarn_company_name },
                {
                  title: "Dennier",
                  value: `${yarn_denier}D/${filament}F (${yarn_Sub_type} ${luster_type} - ${yarn_color})`,
                },
                {
                  title: "Order Date",
                  value: dayjs(order_date).format("DD-MM-YYYY"),
                },
                { title: "Supplier Name", value: supplierName },
                { title: "Order No.", value: order_no },
                { title: "Lot No.", value: lot_no },
                { title: "Yarn Grade", value: yarn_grade },
                { title: "Rate", value: rate },
                { title: "Credit Days", value: credit_days },
                { title: "Quantity", value: quantity },
                { title: "Pending Quantity", value: pending_quantity },
                { title: "Delivered Quantity", value: delivered_quantity },
                { title: "Approx Cartoon", value: approx_cartoon },
                { title: "Pending Cartoon", value: pending_cartoon },
                { title: "Delivered Cartoon", value: delivered_cartoon },
                { title: "Approx Amount", value: approx_amount },
                // { title: "Advance Amount", value: "" },
                // { title: "Remaining Amount", value: "" },
              ]}
            />
            <Button
              onClick={() => {
                navigateToUpdate(yarnOrder.id);
              }}
            >
              <EditOutlined />
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
        dataSource={yarnOrderListRes?.yarnOrderList?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          total: yarnOrderListRes?.yarnOrderList?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
        style={{ overflow: "auto" }}
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
