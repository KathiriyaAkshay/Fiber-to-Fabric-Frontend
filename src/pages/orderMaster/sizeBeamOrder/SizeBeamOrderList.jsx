import { Button, Space, Spin, Table } from "antd";
import { EditOutlined, FilePdfOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "../../../api/hooks/auth";
import { downloadUserPdf, getPDFTitleContent } from "../../../lib/pdf/userPdf";
import dayjs from "dayjs";
import ViewDetailModal from "../../../components/common/modal/ViewDetailModal";
import { usePagination } from "../../../hooks/usePagination";
import { getSizeBeamOrderListRequest } from "../../../api/requests/orderMaster";
import { useContext } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import DeleteSizeBeamOrderButton from "../../../components/orderMaster/sizeBeamOrder/DeleteSizeBeamOrderButton";

function SizeBeamOrderList() {
  const navigate = useNavigate();
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();
  const { data: user } = useCurrentUser();
  const { company, companyId } = useContext(GlobalContext);

  const { data: sizeBeamOrderListRes, isLoading } = useQuery({
    queryKey: [
      "order-master",
      "size-beam-order",
      "list",
      { company_id: companyId, page, pageSize },
    ],
    queryFn: async () => {
      const res = await getSizeBeamOrderListRequest({
        params: { company_id: companyId, page, pageSize },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  function navigateToAdd() {
    navigate("/order-master/size-beam-order/add");
  }

  function navigateToUpdate(id) {
    navigate(`/order-master/size-beam-order/update/${id}`);
  }

  function downloadPdf() {
    const { leftContent, rightContent } = getPDFTitleContent({ user, company });
    const body = sizeBeamOrderListRes?.SizeBeamOrderList?.rows?.map(
      (sizeBeamOrder) => {
        const {
          id,
          order_date,
          user = {},
          order_no,
          rate,
          quantity,
          approx_cartoon,
          approx_amount,
          status,
        } = sizeBeamOrder;
        const { first_name: supplierName } = user;
        return [
          id,
          order_no,
          dayjs(order_date).format("DD-MM-YYYY"),
          supplierName,
          approx_cartoon,
          quantity,
          rate,
          approx_amount,
          status,
        ];
      }
    );

    downloadUserPdf({
      body,
      head: [
        [
          "ID",
          "Order No.",
          "Order Date",
          "Party/Supplier Name",
          "Dennier",
          "Lot no",
          "Cartoon",
          "Quantity",
          "Rate",
          "Approx Amount",
          "Order Status",
        ],
      ],
      leftContent,
      rightContent,
      title: "Send Beam Pipe Order List",
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
      title: "Lot No.",
      dataIndex: "lot_no",
      key: "lot_no",
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
      render: (sizeBeamOrder) => {
        const {
          id,
          order_date,
          user = {},
          order_no,
          lot_no,
          rate,
          credit_days,
          quantity,
          pending_quantity,
          delivered_quantity,
          approx_cartoon,
          pending_cartoon,
          delivered_cartoon,
          approx_amount,
        } = sizeBeamOrder;
        const { first_name: supplierName } = user;

        return (
          <Space>
            <ViewDetailModal
              title="Beam Pipe Challan"
              details={[
                {
                  title: "Order Date",
                  value: dayjs(order_date).format("DD-MM-YYYY"),
                },
                { title: "Supplier Name", value: supplierName },
                { title: "Order No.", value: order_no },
                { title: "Lot No.", value: lot_no },
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
                navigateToUpdate(id);
              }}
            >
              <EditOutlined />
            </Button>
            <DeleteSizeBeamOrderButton data={sizeBeamOrder}/>
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
        dataSource={sizeBeamOrderListRes?.SizeBeamOrderList?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          total: sizeBeamOrderListRes?.SizeBeamOrderList?.count || 0,
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
          <h3 className="m-0 text-primary">Send Beam Pipe</h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>
        <Button
          icon={<FilePdfOutlined />}
          type="primary"
          disabled={!sizeBeamOrderListRes?.SizeBeamOrderList?.rows?.length}
          onClick={downloadPdf}
        />
      </div>
      {renderTable()}
    </div>
  );
}

export default SizeBeamOrderList;
