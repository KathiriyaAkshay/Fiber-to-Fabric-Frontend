import {
  Button,
  Flex,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  DatePicker,
} from "antd";
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
import { usePagination } from "../../../hooks/usePagination";
import { getSizeBeamOrderListRequest } from "../../../api/requests/orderMaster";
import { useContext, useState } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import DeleteSizeBeamOrderButton from "../../../components/orderMaster/sizeBeamOrder/DeleteSizeBeamOrderButton";
import useDebounce from "../../../hooks/useDebounce";
import BeamPipeChallanModel from "../../../components/purchase/PurchaseSizeBeam/ReceiveSizeBeam/BeamPipeChallanMode";
import moment from "moment";
import { currentMonthStartDateEndDate } from "../../../utils/date";

function SizeBeamOrderList() {
  const navigate = useNavigate();
  const [monthStartDate, monthEndDate] = currentMonthStartDateEndDate();
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();
  const { company, companyId, financialYearEnd } = useContext(GlobalContext);
  const [fromDate, setFromDate] = useState(dayjs(monthStartDate));
  const [toDate, setToDate] = useState(dayjs(monthEndDate));
  const debouncedFromDate = useDebounce(
    dayjs(fromDate).format("YYYY-MM-DD"),
    500
  );
  const debouncedToDate = useDebounce(dayjs(toDate).format("YYYY-MM-DD"), 500);

  const { data: sizeBeamOrderListRes, isLoading } = useQuery({
    queryKey: [
      "order-master",
      "size-beam-order",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
        end: financialYearEnd,
        fromDate: debouncedFromDate,
        toDate: debouncedToDate,
      },
    ],
    queryFn: async () => {
      const res = await getSizeBeamOrderListRequest({
        params: {
          company_id: companyId,
          page,
          pageSize,
          end: financialYearEnd,
          pending: true,
          fromDate: debouncedFromDate,
          toDate: debouncedToDate,
        },
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
    // const { leftContent, rightContent } = getPDFTitleContent({ user, company });
    // const body = sizeBeamOrderListRes?.SizeBeamOrderList?.map(
    //   (sizeBeamOrder) => {
    //     const {
    //       id,
    //       order_date,
    //       total_pipe,
    //       total_meters,
    //       pending_meters,
    //       status,
    //       print_challan_status,
    //       company = {},
    //       yarn_stock_company = {},
    //     } = sizeBeamOrder;
    //     const { company_name = "" } = company;
    //     const { yarn_company_name = "" } = yarn_stock_company;
    //     return [
    //       id,
    //       dayjs(order_date).format("DD-MM-YYYY"),
    //       yarn_company_name,
    //       company_name,
    //       total_pipe,
    //       total_meters,
    //       pending_meters,
    //       status,
    //       print_challan_status,
    //     ];
    //   }
    // );

    // downloadUserPdf({
    //   body,
    //   head: [
    //     [
    //       "ID",
    //       "Date",
    //       "From",
    //       "To",
    //       "Total Pipe",
    //       "Total Meter",
    //       "Pending Meter",
    //       "Order Status",
    //       "Print Challan",
    //     ],
    //   ],
    //   leftContent,
    //   rightContent,
    //   title: "Send Beam Pipe Order List",
    // });

    let title = [
      "ID",
      "Order No",
      "Date",
      "From",
      "To",
      "Total Pipe",
      "Total Meter",
      "Order Status",
      "Print Challan",
    ];

    let temp = [];

    sizeBeamOrderListRes?.SizeBeamOrderList?.map((element, index) => {
      let temp_meter = 0;
      element?.size_beam_order_details?.map((data) => {
        temp_meter = temp_meter + Number(data?.meters);
      });
      temp.push([
        index + 1,
        element?.id,
        moment(element?.order_date).format("DD-MM-YYYY"),
        element?.company?.company_name,
        element?.yarn_stock_company?.yarn_company_name,
        element?.size_beam_order_details?.length,
        temp_meter,
        element?.status,
        element?.print_challan_status,
      ]);
    });

    localStorage.setItem("print-title", "Send Beam Pipe Order List");
    localStorage.setItem("print-head", JSON.stringify(title));
    localStorage.setItem("print-array", JSON.stringify(temp));
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
      render: ({ order_date }) => {
        return dayjs(order_date).format("DD-MM-YYYY");
      },
      key: "order_date",
    },
    {
      title: "Order No",
      key: "order_no",
      dataIndex: "order_no",
    },
    {
      title: "Supplier",
      key: "supplier_name",
      dataIndex: ["supplier", "supplier_name"],
    },
    {
      title: "Supplier company",
      dataIndex: ["yarn_stock_company", "yarn_company_name"],
      key: "yarn_stock_company.yarn_company_name",
    },
    {
      title: "Purchase company",
      dataIndex: ["company", "company_name"],
      key: "company.company_name",
    },
    {
      title: "Total Pipe",
      dataIndex: "total_pipe",
      key: "total_pipe",
      render: (text, record) => {
        return <div>{record?.size_beam_order_details?.length}</div>;
      },
    },
    {
      title: "Total Meter",
      dataIndex: "total_meters",
      key: "total_meters",
      render: (text, record) => {
        let total_meter = 0;
        record?.size_beam_order_details?.map((element) => {
          total_meter = total_meter + Number(element?.meters);
        });
        return <div>{total_meter}</div>;
      },
    },
    {
      title: "Pending Meter",
      dataIndex: "pending_meter",
      key: "pending_meters",
    },
    {
      title: "Order Status",
      dataIndex: "status",
      key: "status",
      render: (text, record) =>
        text == "FINISHED" ? (
          <>
            <Tag color="green">{text}</Tag>
          </>
        ) : (
          <>
            <Tag color="red">{text}</Tag>
          </>
        ),
    },
    {
      title: "Print Challan",
      dataIndex: "print_challan_status",
      key: "print_challan_status",
      render: (text, record) =>
        text == "PRINTED" ? (
          <>
            <Tag color="green">{text}</Tag>
          </>
        ) : (
          <>
            <Tag color="red">{text}</Tag>
          </>
        ),
    },
    {
      title: "Action",
      render: (sizeBeamOrder, record) => {
        const {
          id,
          order_date,
          total_pipe,
          pending_meter,
          status,
          print_challan_status,
          company = {},
          yarn_stock_company = {},
        } = sizeBeamOrder;

        let total_meter = 0;
        record?.size_beam_order_details?.map((element) => {
          total_meter = total_meter + Number(element?.meters);
        });

        return (
          <Space>
            <BeamPipeChallanModel details={record} />

            {record?.status == "PENDING" && (
              <>
                {total_meter == pending_meter && (
                  <Button
                    onClick={() => {
                      navigateToUpdate(id);
                    }}
                  >
                    <EditOutlined />
                  </Button>
                )}

                <DeleteSizeBeamOrderButton data={sizeBeamOrder} />
              </>
            )}
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
          current: page + 1,
          pageSize: pageSize,
          total: sizeBeamOrderListRes?.SizeBeamOrderList?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
        style={{ overflow: "auto" }}
      />
    );
  }

  const disableFutureDates = (current) => {
    return current && current > moment().endOf("day");
  };

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
        <Flex style={{ marginLeft: "auto" }} gap={10}>
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              From
            </Typography.Text>
            <DatePicker
              value={fromDate}
              onChange={setFromDate}
              className="min-w-40"
              disabledDate={disableFutureDates}
              format={"DD-MM-YYYY"}
            />
          </Flex>

          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">To</Typography.Text>
            <DatePicker
              value={toDate}
              onChange={setToDate}
              className="min-w-40"
              format={"DD-MM-YYYY"}
              // disabledDate={disableFutureDates}
            />
          </Flex>
        </Flex>
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
