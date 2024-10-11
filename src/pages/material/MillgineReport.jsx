import { DeleteOutlined } from "@ant-design/icons";
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
import { usePagination } from "../../hooks/usePagination";
import { useContext, useState } from "react";
import useDebounce from "../../hooks/useDebounce";
import { getMillgineReportListRequest } from "../../api/requests/material";
import { GlobalContext } from "../../contexts/GlobalContext";
import { useQuery } from "@tanstack/react-query";

const data = [{ code: "12", description: "description" }];

const MillgineReport = () => {
  const [search, setSearch] = useState("");

  const debounceSearch = useDebounce(search, 500);

  const { companyId } = useContext(GlobalContext);
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const { data: millgineReportData, isLoading } = useQuery({
    queryKey: [
      "get",
      "millgine-report",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
        search: debounceSearch,
      },
    ],
    queryFn: async () => {
      const res = await getMillgineReportListRequest({
        params: {
          company_id: companyId,
          page,
          pageSize,
          search: debounceSearch,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const columns = [
    // {
    //   title: "No.",
    //   dataIndex: "no",
    //   key: "no",
    //   render: (_, record, index) => index + 1,
    // },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Description",
    },
    {
      title: "Date",
    },
    {
      title: "Type",
    },
    {
      title: "Machine No",
    },
    {
      title: "Quantity",
    },
    {
      title: "Quantity Amount",
    },
    {
      title: "Pcs",
    },
    {
      title: "Pcs Amount",
    },
    {
      title: "Total Amount",
    },
    {
      title: "User Name",
    },
    {
      title: "Remark",
    },
    {
      title: "Action",
      key: "action",
      render: () => (
        <Space>
          <Button danger>
            <DeleteOutlined />
          </Button>
        </Space>
      ),
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
        dataSource={data || []}
        columns={columns}
        rowKey={"id"}
        scroll={{ y: 330 }}
        pagination={{
          total: 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
        summary={() => {
          return (
            <Table.Summary.Row>
              <Table.Summary.Cell colSpan={5}>Grand Total</Table.Summary.Cell>
              <Table.Summary.Cell>0</Table.Summary.Cell>
              <Table.Summary.Cell>0</Table.Summary.Cell>
              <Table.Summary.Cell>0</Table.Summary.Cell>
              <Table.Summary.Cell>0</Table.Summary.Cell>
              <Table.Summary.Cell>0</Table.Summary.Cell>
              <Table.Summary.Cell colSpan={3}></Table.Summary.Cell>
            </Table.Summary.Row>
          );
        }}
      />
    );
  }

  return (
    <>
      <div className="flex items-center justify-end gap-5 mx-3 mb-3">
        <Flex align="center" gap={10}>
          <Typography.Text className="whitespace-nowrap">Date</Typography.Text>
          <DatePicker />
        </Flex>
        <Flex align="center" gap={10}>
          <Typography.Text className="whitespace-nowrap">To</Typography.Text>
          <DatePicker />
        </Flex>
        <Flex align="center" gap={10}>
          <Input placeholder="Search" value={search} onChange={setSearch} />
        </Flex>
      </div>

      {renderTable()}
    </>
  );
};

export default MillgineReport;
