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
    const body = sizeBeamOrderListRes?.SizeBeamOrderList?.map(
      (sizeBeamOrder) => {
        const {
          id,
          order_date,
          from,
          to,
          total_pipe,
          total_meter,
          pending_meter,
          status,
          print_challan_status,
        } = sizeBeamOrder;
        return [
          id,
          dayjs(order_date).format("DD-MM-YYYY"),
          from,
          to,
          total_pipe,
          total_meter,
          pending_meter,
          status,
          print_challan_status,
        ];
      }
    );

    downloadUserPdf({
      body,
      head: [
        [
          "ID",
          "Date",
          "From",
          "To",
          "Total Pipe",
          "Total Meter",
          "Pending Meter",
          "Order Status",
          "Print Challan",
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
      title: "Date",
      render: ({ order_date }) => {
        return dayjs(order_date).format("DD-MM-YYYY");
      },
      key: "order_date",
    },
    {
      title: "From",
      dataIndex: "from",
      key: "from",
    },
    {
      title: "To",
      dataIndex: "to",
      key: "to",
    },
    {
      title: "Total Pipe",
      dataIndex: "total_pipe",
      key: "total_pipe",
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
      title: "Order Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Print Challan",
      dataIndex: "print_challan_status",
      key: "print_challan_status",
    },
    {
      title: "Action",
      render: (sizeBeamOrder) => {
        const {
          id,
          order_date,
          from,
          to,
          total_pipe,
          total_meter,
          pending_meter,
          status,
          print_challan_status,
        } = sizeBeamOrder;

        return (
          <Space>
            <ViewDetailModal
              title="Beam Pipe Challan"
              details={[
                {
                  title: "Order Date",
                  value: dayjs(order_date).format("DD-MM-YYYY"),
                },
                { title: "From", value: from },
                { title: "To", value: to },
                { title: "Total Pipe", value: total_pipe },
                { title: "Total Meter", value: total_meter },
                { title: "Pending Meter", value: pending_meter },
                { title: "Order Status", value: status },
                { title: "Print Challan", value: print_challan_status },
              ]}
            />
            <Button
              onClick={() => {
                navigateToUpdate(id);
              }}
            >
              <EditOutlined />
            </Button>
            <DeleteSizeBeamOrderButton data={sizeBeamOrder} />
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
        dataSource={sizeBeamOrderListRes?.SizeBeamOrderList || []}
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
          disabled={!sizeBeamOrderListRes?.SizeBeamOrderList?.length}
          onClick={downloadPdf}
        />
      </div>
      {renderTable()}
    </div>
  );
}

export default SizeBeamOrderList;
