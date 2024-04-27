import {
  Button,
  DatePicker,
  Flex,
  Input,
  Space,
  Spin,
  Table,
  Typography,
} from "antd";
import { EditOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { usePagination } from "../../../../hooks/usePagination";
import { useContext, useState } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import useDebounce from "../../../../hooks/useDebounce";
import { getYarnReceiveListRequest } from "../../../../api/requests/purchase/yarnReceive";
import DeleteYarnReceiveButton from "../../../../components/purchase/receive/yarnReceive/DeleteYarnReceiveButton";
import YarnReceiveChallanModal from "../../../../components/purchase/receive/yarnReceive/YarnReceiveChallanModal";

function YarnReceiveList() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [toDate, setToDate] = useState();
  const debouncedToDate = useDebounce(
    toDate && dayjs(toDate).format("YYYY-MM-DD"),
    500
  );
  const [fromDate, setFromDate] = useState();
  const debouncedFromDate = useDebounce(
    fromDate && dayjs(fromDate).format("YYYY-MM-DD"),
    500
  );
  const { companyId } = useContext(GlobalContext);
  const navigate = useNavigate();
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const { data: yarnReceiveListRes, isLoading: isLoadingYarnReceiveList } =
    useQuery({
      queryKey: [
        "yarn-stock/yarn-receive-challan/list",
        {
          company_id: companyId,
          page,
          pageSize,
          search: debouncedSearch,
          toDate: debouncedToDate,
          fromDate: debouncedFromDate,
        },
      ],
      queryFn: async () => {
        const res = await getYarnReceiveListRequest({
          companyId,
          params: {
            company_id: companyId,
            page,
            pageSize,
            search: debouncedSearch,
            toDate: debouncedToDate,
            fromDate: debouncedFromDate,
          },
        });
        return res.data?.data;
      },
      enabled: Boolean(companyId),
    });

  function navigateToAdd() {
    navigate("/purchase/receive/yarn-receive/add");
  }

  function navigateToUpdate(id) {
    navigate(`/purchase/receive/yarn-receive/update/${id}`);
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    // {
    //   title: "Order No",
    //   dataIndex: "order_no",
    //   key: "order_no",
    // },
    {
      title: "Challan Date",
      key: "challan_date",
      render: ({ challan_date }) => {
        return dayjs(challan_date).format("DD-MM-YYYY");
      },
    },
    {
      title: "Challan No",
      dataIndex: "challan_no",
      key: "challan_no",
    },
    // {
    //   title: "Supplier",
    //   dataIndex: "supplier",
    //   key: "supplier",
    // },
    // {
    //   title: "Supplier Company",
    //   dataIndex: "supplier_company",
    //   key: "supplier_company",
    // },
    {
      title: "Company",
      dataIndex: ["yarn_stock_company", "yarn_company_name"],
      key: "yarn_stock_company.yarn_company_name",
    },
    {
      title: "Denier",
      key: "denier",
      render: ({ yarn_stock_company = {} }) => {
        const {
          yarn_count = 0,
          filament = 0,
          yarn_type = "",
          yarn_Sub_type = "",
          luster_type = "",
          yarn_color = "",
        } = yarn_stock_company;
        return `${yarn_count}C/${filament}F (${yarn_type}(${yarn_Sub_type}) - ${luster_type} - ${yarn_color})`;
      },
    },
    {
      title: "Quantity KG",
      dataIndex: "receive_quantity",
      key: "receive_quantity",
    },
    {
      title: "Cartoon",
      dataIndex: "receive_cartoon_pallet",
      key: "receive_cartoon_pallet",
    },
    // {
    //   title: "Bill Status /Rate(Excl. Gst)",
    //   dataIndex: "status",
    //   key: "status",
    // },
    {
      title: "Action",
      render: (yarnReceiveDetails) => {
        return (
          <Space>
            <Button
              onClick={() => {
                navigateToUpdate(yarnReceiveDetails.id);
              }}
            >
              <EditOutlined />
            </Button>
            <DeleteYarnReceiveButton details={yarnReceiveDetails} />
            <YarnReceiveChallanModal details={yarnReceiveDetails} />
          </Space>
        );
      },
      key: "action",
    },
  ];

  function renderTable() {
    if (isLoadingYarnReceiveList) {
      return (
        <Spin tip="Loading" size="large">
          <div className="p-14" />
        </Spin>
      );
    }

    return (
      <Table
        dataSource={yarnReceiveListRes?.row || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          total: yarnReceiveListRes?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
        style={{
          overflow: "auto",
        }}
      />
    );
  }

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary">Yarn Receive Challan List</h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>
        <Flex align="center" gap={10} wrap="wrap">
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              From
            </Typography.Text>
            <DatePicker
              style={{
                width: "200px",
              }}
              format="YYYY-MM-DD"
              value={fromDate}
              onChange={setFromDate}
            />
          </Flex>

          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">To</Typography.Text>
            <DatePicker
              style={{
                width: "200px",
              }}
              format="YYYY-MM-DD"
              value={toDate}
              onChange={setToDate}
            />
          </Flex>

          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "200px",
            }}
          />
        </Flex>
      </div>
      {renderTable()}
    </div>
  );
}

export default YarnReceiveList;
