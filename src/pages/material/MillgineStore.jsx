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
import { useContext, useState } from "react";
import { BarcodeOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  getMillgineListRequest,
  getMillgineReportListRequest,
} from "../../api/requests/material";
import { GlobalContext } from "../../contexts/GlobalContext";
import useDebounce from "../../hooks/useDebounce";
import MillgineStoreSettingModal from "../../components/material/MillgineStoreSettingModal";
import dayjs from "dayjs";
import MillgineStoreQrModal from "../../components/material/MillgineStoreQrModal";
import MillgineStoreUpdateModal from "../../components/material/MillgineStoreUpdateModal";

const ForMachine = ({ companyId, fromDate, toDate }) => {
  const { data: millgineReportData, isLoading } = useQuery({
    queryKey: [
      "get",
      "millgine-report",
      "list",
      {
        company_id: companyId,
        from: dayjs(fromDate).format("YYYY-MM-DD"),
        to: dayjs(toDate).format("YYYY-MM-DD"),
      },
    ],
    queryFn: async () => {
      const res = await getMillgineReportListRequest({
        params: {
          company_id: companyId,
          from: dayjs(fromDate).format("YYYY-MM-DD"),
          to: dayjs(toDate).format("YYYY-MM-DD"),
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
      dataIndex: "description",
      key: "description",
      render: (text) => text || "-",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Machine No",
      dataIndex: "machine_no",
      key: "machine_no",
      render: (text) => text || "-",
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
        dataSource={millgineReportData?.machineWiseAudit || []}
        columns={columnsOfMachine}
        rowKey={"id"}
        // scroll={{ y: 330 }}
        pagination={false}
        summary={(pageData) => {
          let totalAmount = 0;
          pageData.forEach((item) => {
            totalAmount += +item.amount || 0;
          });
          return (
            <Table.Summary.Row>
              <Table.Summary.Cell>Total</Table.Summary.Cell>
              <Table.Summary.Cell></Table.Summary.Cell>
              <Table.Summary.Cell>{totalAmount}</Table.Summary.Cell>
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

const ForOther = ({ companyId, fromDate, toDate }) => {
  const { data: millgineReportData, isLoading } = useQuery({
    queryKey: [
      "get",
      "millgine-report",
      "list",
      {
        company_id: companyId,
        from: dayjs(fromDate).format("YYYY-MM-DD"),
        to: dayjs(toDate).format("YYYY-MM-DD"),
      },
    ],
    queryFn: async () => {
      const res = await getMillgineReportListRequest({
        params: {
          company_id: companyId,
          from: dayjs(fromDate).format("YYYY-MM-DD"),
          to: dayjs(toDate).format("YYYY-MM-DD"),
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
      dataIndex: "description",
      key: "description",
      render: (text) => text || "-",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Remark",
      dataIndex: "remark",
      key: "remark",
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
        dataSource={millgineReportData?.allAudit || []}
        columns={columnsOfOther}
        rowKey={"id"}
        // scroll={{ y: 330 }}
        pagination={false}
        summary={(pageData) => {
          let totalAmount = 0;
          pageData.forEach((item) => {
            totalAmount += +item.amount || 0;
          });

          return (
            <Table.Summary.Row>
              <Table.Summary.Cell>Total</Table.Summary.Cell>
              <Table.Summary.Cell></Table.Summary.Cell>
              <Table.Summary.Cell>{totalAmount}</Table.Summary.Cell>
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
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const showQrModal = () => {
    setIsQrModalOpen(true);
  };
  const [qrDetails, setQrDetails] = useState([]);

  const debounceSearch = useDebounce(search, 500);
  const debounceFromDate = useDebounce(fromDate, 500);
  const debounceToDate = useDebounce(toDate, 500);

  const { companyId } = useContext(GlobalContext);

  const { data: millgineListData, isLoading } = useQuery({
    queryKey: [
      "get",
      "millgine",
      "list",
      {
        company_id: companyId,
        search: debounceSearch,
      },
    ],
    queryFn: async () => {
      const res = await getMillgineListRequest({
        params: {
          company_id: companyId,
          search: debounceSearch,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const columns = [
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
      render: (details) => {
        return (
          <Space>
            <Button
              type="primary"
              onClick={() => {
                setQrDetails([
                  {
                    ...details,
                  },
                ]);
                showQrModal();
              }}
            >
              <BarcodeOutlined />
            </Button>
            <MillgineStoreSettingModal details={details} />
            <MillgineStoreUpdateModal details={details} />
          </Space>
        );
      },
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
        // scroll={{ y: 330 }}
        pagination={false}
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
          onChange={(e) => setSearch(e.target.value)}
          allowClear
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
          <DatePicker value={fromDate} onChange={(date) => setFromDate(date)} />
        </Flex>
        <Flex align="center" gap={10}>
          <Typography.Text className="whitespace-nowrap">To</Typography.Text>
          <DatePicker value={toDate} onChange={(date) => setToDate(date)} />
        </Flex>
      </div>

      <Row gutter={12}>
        <Col span={12}>
          <Card>
            <ForMachine
              companyId={companyId}
              fromDate={debounceFromDate}
              toDate={debounceToDate}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <ForOther
              companyId={companyId}
              fromDate={debounceFromDate}
              toDate={debounceToDate}
            />
          </Card>
        </Col>
      </Row>

      {isQrModalOpen && (
        <MillgineStoreQrModal
          key={"qr_details"}
          open={isQrModalOpen}
          handleClose={() => setIsQrModalOpen(false)}
          details={qrDetails}
        />
      )}
    </>
  );
};

export default MillgineStore;
