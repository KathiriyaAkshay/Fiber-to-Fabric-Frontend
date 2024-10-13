import {
  Button,
  Card,
  Col,
  DatePicker,
  Flex,
  Input,
  Row,
  Space,
  Spin,
  Table,
  Typography,
} from "antd";
// import { usePagination } from "../../hooks/usePagination";
import { useContext, useState } from "react";
import {
  EditOutlined,
  QrcodeOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  getMillgineListRequest,
  getMillgineReportListRequest,
} from "../../api/requests/material";
import { GlobalContext } from "../../contexts/GlobalContext";
import useDebounce from "../../hooks/useDebounce";

const ForMachine = ({ companyId }) => {
  // const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const { data: millgineReportData, isLoading } = useQuery({
    queryKey: [
      "get",
      "millgine-report",
      "list",
      {
        company_id: companyId,
        // page,
        // pageSize,
      },
    ],
    queryFn: async () => {
      const res = await getMillgineReportListRequest({
        params: {
          company_id: companyId,
          // page,
          // pageSize,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  // For Machine.............................................................
  const columnsOfMachine = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Description",
    },
    {
      title: "Amount",
    },
    {
      title: "Machine No",
    },
  ];

  function renderMachineTable() {
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
        columns={columnsOfMachine}
        rowKey={"id"}
        scroll={{ y: 330 }}
        // pagination={{
        //   total: 0,
        //   showSizeChanger: true,
        //   onShowSizeChange: onShowSizeChange,
        //   onChange: onPageChange,
        // }}
        summary={() => {
          return (
            <Table.Summary.Row>
              <Table.Summary.Cell>Total</Table.Summary.Cell>
              <Table.Summary.Cell></Table.Summary.Cell>
              <Table.Summary.Cell>0</Table.Summary.Cell>
              <Table.Summary.Cell></Table.Summary.Cell>
            </Table.Summary.Row>
          );
        }}
      />
    );
  }

  return (
    <>
      <div className="flex items-center justify-start gap-5 mx-3 mb-3">
        <h2 className="m-0 text-primary">{"➤  For Machine"}</h2>
      </div>

      {renderMachineTable()}
    </>
  );
};

const ForOther = ({ companyId }) => {
  // const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const { data: millgineReportData, isLoading } = useQuery({
    queryKey: [
      "get",
      "millgine-report",
      "list",
      {
        company_id: companyId,
        // page,
        // pageSize,
      },
    ],
    queryFn: async () => {
      const res = await getMillgineReportListRequest({
        params: {
          company_id: companyId,
          // page,
          // pageSize,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  // For Other.............................................................

  const columnsOfOther = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Description",
    },
    {
      title: "Amount",
    },
    {
      title: "Remark",
    },
  ];

  function renderOtherTable() {
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
        columns={columnsOfOther}
        rowKey={"id"}
        scroll={{ y: 330 }}
        // pagination={{
        //   total: 0,
        //   showSizeChanger: true,
        //   onShowSizeChange: onShowSizeChange,
        //   onChange: onPageChange,
        // }}
        summary={() => {
          return (
            <Table.Summary.Row>
              <Table.Summary.Cell>Total</Table.Summary.Cell>
              <Table.Summary.Cell></Table.Summary.Cell>
              <Table.Summary.Cell>0</Table.Summary.Cell>
              <Table.Summary.Cell></Table.Summary.Cell>
            </Table.Summary.Row>
          );
        }}
      />
    );
  }

  return (
    <>
      <div className="flex items-center justify-start gap-5 mx-3 mb-3">
        <h2 className="m-0 text-primary">{"➤  For Other"}</h2>
      </div>
      {renderOtherTable()}
    </>
  );
};

const MillgineStore = () => {
  const [search, setSearch] = useState("");

  const debounceSearch = useDebounce(search, 500);

  const { companyId } = useContext(GlobalContext);
  // const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const { data: millgineListData, isLoading } = useQuery({
    queryKey: [
      "get",
      "millgine",
      "list",
      {
        company_id: companyId,
        // page,
        // pageSize,
        search: debounceSearch,
      },
    ],
    queryFn: async () => {
      const res = await getMillgineListRequest({
        params: {
          company_id: companyId,
          // page,
          // pageSize,
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
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Quantity",
      dataIndex: "total_quantity",
      key: "total_quantity",
    },
    {
      title: "Pcs",
      dataIndex: "total_pis",
      key: "total_pis",
    },
    {
      title: "Used Quantity",
      dataIndex: "used_quantity",
      key: "used_quantity",
      render: (text) => text || 0,
    },
    {
      title: "Used Pcs",
      dataIndex: "used_pis",
      key: "used_pis",
      render: (text) => text || 0,
    },
    {
      title: "Quantity Stock",
      dataIndex: "quantity_stock",
      key: "quantity_stock",
      render: (_, record) => {
        return (record?.total_quantity || 0) - (record?.used_quantity || 0);
      },
    },
    {
      title: "Pcs Stock",
      dataIndex: "pis_stock",
      key: "pis_stock",
      render: (_, record) => {
        return (record?.total_pis || 0) - (record?.used_pis || 0);
      },
    },
    {
      title: "Amount",
      dataIndex: "total_amount",
      key: "total_amount",
    },
    {
      title: "Action",
      key: "action",
      render: () => (
        <Space>
          <Button type="primary">
            <QrcodeOutlined />
          </Button>
          <Button>
            <SettingOutlined />
          </Button>
          <Button>
            <EditOutlined />
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
        dataSource={millgineListData?.millgineList || []}
        columns={columns}
        rowKey={"id"}
        scroll={{ y: 330 }}
        // pagination={{
        //   total: 0,
        //   showSizeChanger: true,
        //   onShowSizeChange: onShowSizeChange,
        //   onChange: onPageChange,
        // }}
      />
    );
  }

  return (
    <>
      <Flex style={{ marginLeft: "auto" }} gap={10}>
        <Input
          name="search"
          placeholder="Search"
          value={search}
          onChange={setSearch}
        />
      </Flex>
      {renderTable()}

      <div className="flex items-center justify-center gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h2 className="m-0 text-primary">{"❖ Today's Millgine Cost ❖"}</h2>
        </div>
      </div>

      <div className="flex items-center justify-end gap-5 mx-3 mb-3">
        <Flex align="center" gap={10}>
          <Typography.Text className="whitespace-nowrap">Date</Typography.Text>
          <DatePicker />
        </Flex>
        <Flex align="center" gap={10}>
          <Typography.Text className="whitespace-nowrap">To</Typography.Text>
          <DatePicker />
        </Flex>
      </div>

      <Row gutter={12}>
        <Col span={12}>
          <Card>
            <ForMachine companyId={companyId} />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <ForOther companyId={companyId} />
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default MillgineStore;
