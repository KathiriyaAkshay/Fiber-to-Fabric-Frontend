import {
  Flex,
  Input,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  Select,
  Button,
} from "antd";
import moment from "moment";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { useState, useContext } from "react";
import useDebounce from "../../../../hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";
import { usePagination } from "../../../../hooks/usePagination";
import { getReceiveSizeBeamBillListRequest } from "../../../../api/requests/purchase/purchaseSizeBeam";
import SizeBeamChallanModal from "../../../../components/purchase/PurchaseSizeBeam/ReceiveSizeBeam/ReceiveSizeChallan";
import DeleteSizeBeamBillButton from "../../../../components/purchase/PurchaseSizeBeam/ReceiveSizeBeam/DeleteSizeBeamBillButton";
import { getInHouseQualityListRequest } from "../../../../api/requests/qualityMaster";
import { getSupplierListRequest } from "../../../../api/requests/users";
import { FilePdfOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

function SizeBeamBillList() {
  const { companyId, company, financialYearEnd } = useContext(GlobalContext);
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const [billNumber, setBillNumber] = useState(null);
  const deboucedBillNumber = useDebounce(billNumber, 500);

  const [billStatus, setBillStatus] = useState(null);
  const deboucedBillStatus = useDebounce(billStatus, 500);

  const [quality, setQuality] = useState(null);
  const deboucedQuality = useDebounce(quality, 500);

  const [supplier, setSupplier] = useState(null);
  const debouncedSupplier = useDebounce(supplier, 500);

  const { data: inHouseQualityList, isLoading: isLoadingInHouseQualityList } =
    useQuery({
      queryKey: [
        "inhouse-quality",
        "list",
        {
          company_id: companyId,
          page: 0,
          pageSize: 9999,
          is_active: 1,
        },
      ],
      queryFn: async () => {
        const res = await getInHouseQualityListRequest({
          params: {
            company_id: companyId,
            page: 0,
            pageSize: 9999,
            is_active: 1,
          },
        });
        return res.data?.data;
      },
      enabled: Boolean(companyId),
    });

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

  const { data: receiveSizeBeamBill, isLoading: isLoadingReceiveSizeBeam } =
    useQuery({
      queryKey: [
        "recive-size-beam/bill/list",
        {
          company_id: companyId,
          page,
          pageSize,
          end: financialYearEnd,
          bill_number: deboucedBillNumber,
          status: deboucedBillStatus,
          quality_id: deboucedQuality,
          supplier_name: debouncedSupplier,
        },
      ],
      queryFn: async () => {
        const res = await getReceiveSizeBeamBillListRequest({
          companyId,
          params: {
            company_id: companyId,
            page,
            pageSize,
            end: financialYearEnd,
            bill_number: deboucedBillNumber,
            status: deboucedBillStatus,
            quality_id: deboucedQuality,
            supplier_name: debouncedSupplier,
          },
        });
        return res.data?.data;
      },
      enabled: Boolean(companyId),
    });

  function downloadPdf() {
    const body = receiveSizeBeamBill?.rows?.map((item, index) => {
      const {
        bill_date,
        supplier,
        inhouse_quality,
        rate,
        net_amount,
        due_date,
        status,
        invoice_number,
      } = item;

      return [
        index + 1,
        dayjs(bill_date).format("DD-MM-YYYY"),
        invoice_number,
        supplier.supplier_company,
        company.company_name,
        `${inhouse_quality?.quality_name} (${inhouse_quality?.quality_weight}KG)`,
        rate,
        net_amount, // average will be here.
        dayjs(due_date).format("DD-MM-YYYY"),
        status === "unpaid" ? "Un-Paid" : "Paid",
      ];
    });

    const tableTitle = [
      "ID",
      "Bill Date",
      "Invoice No",
      "S Company Name",
      "Receive Comp Name",
      "Quality",
      "Bill Rate",
      "Net Amount",
      "Due Date",
      "Status",
    ];

    // Set localstorage item information
    localStorage.setItem("print-array", JSON.stringify(body));
    localStorage.setItem("print-title", "Bills Of Size Beams");
    localStorage.setItem("print-head", JSON.stringify(tableTitle));
    localStorage.setItem("total-count", "0");

    window.open("/print");
  }

  const columns = [
    {
      title: "Id",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => page * pageSize + index + 1,
    },
    {
      title: "Bill date",
      dataIndex: "bill_date",
      render: (text) => {
        return <div>{moment(text).format("DD-MM-YYYY")}</div>;
      },
    },
    {
      title: "Bill No",
      dataIndex: "bill_number",
    },
    {
      title: "Supplier Name",
      dataIndex: "supplier_name",
      render: (text, record) => {
        return <div>{record?.supplier?.supplier_name || "-"}</div>;
      },
    },
    {
      title: "Company Name",
      dataIndex: "company_name",
      render: (text, record) => {
        return <div>{record?.supplier?.supplier_company || "-"}</div>;
      },
    },
    {
      title: "Quality",
      dataIndex: "quality_name",
      render: (text, record) => {
        return <div>{record?.inhouse_quality?.quality_name}</div>;
      },
    },
    {
      title: "Total Taka",
      dataIndex: "total_taka",
    },
    {
      title: "Total Meter",
      dataIndex: "total_meter",
    },
    {
      title: "Rate",
      dataIndex: "rate",
    },
    {
      title: "Amount",
      dataIndex: "freight_amount",
    },
    {
      title: "Net Amount",
      dataIndex: "net_amount",
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      render: (text) => {
        return <div>{moment(text).format("DD-MM-YYYY")}</div>;
      },
    },
    {
      title: "Due Days",
      dataIndex: "",
      render: (text, record) => {
        let due_date = record?.due_date;
        due_date = new Date(due_date);

        let today = new Date();

        let timeDifference = due_date.getTime() - today.getTime();
        let daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));

        if (daysDifference < 0) {
          daysDifference = 0;
        }

        return <div>{daysDifference}</div>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text) => {
        return text == "unpaid" ? (
          <Tag color="red">{text}</Tag>
        ) : (
          <Tag color="green">{text}</Tag>
        );
      },
    },
    {
      title: "Action",
      render: (text, record) => {
        return (
          <Space>
            <SizeBeamChallanModal
              details={{ receive_size_beam_bill: record }}
              mode={"VIEW"}
              isBill={true}
            />

            {record?.status == "unpaid" && (
              <DeleteSizeBeamBillButton details={record} />
            )}
          </Space>
        );
      },
    },
  ];

  function renderTable() {
    if (isLoadingReceiveSizeBeam) {
      return (
        <Spin tip="Loading" size="large">
          <div className="p-14"></div>
        </Spin>
      );
    }

    return (
      <Table
        dataSource={receiveSizeBeamBill?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          current: page + 1,
          pageSize: pageSize,
          total: receiveSizeBeamBill?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
        style={{
          overflow: "auto",
        }}
        summary={() => {
          if (receiveSizeBeamBill?.rows?.length == 0) return;

          return (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0}>
                <b>Total</b>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}>
                {receiveSizeBeamBill?.total_taka || 0}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={0}>
                {receiveSizeBeamBill?.total_meter || 0}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}>
                {receiveSizeBeamBill?.total_amount || 0}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
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
          <h3 className="m-0 text-primary">Bills of size beam List </h3>
        </div>
        <Flex align="center" gap={10} wrap="wrap">
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Bill Number
            </Typography.Text>
            <Input
              placeholder="Search"
              value={billNumber}
              onChange={(e) => setBillNumber(e.target.value)}
              style={{
                width: "200px",
              }}
            />
          </Flex>

          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Status
            </Typography.Text>
            <Select
              placeholder="Select Bill Status"
              value={billStatus}
              options={[
                {
                  label: "Paid",
                  value: "paid",
                },
                {
                  label: "Un-Paid",
                  value: "unpaid",
                },
              ]}
              dropdownStyle={{
                textTransform: "capitalize",
              }}
              onChange={setBillStatus}
              style={{
                textTransform: "capitalize",
              }}
              allowClear
              className="min-w-40"
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

          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Quality
            </Typography.Text>
            <Select
              placeholder="Select Quality"
              value={quality}
              loading={isLoadingInHouseQualityList}
              options={inHouseQualityList?.rows?.map(
                ({ id = 0, quality_name = "" }) => ({
                  label: quality_name,
                  value: id,
                })
              )}
              dropdownStyle={{
                textTransform: "capitalize",
              }}
              onChange={setQuality}
              style={{
                textTransform: "capitalize",
              }}
              allowClear
              className="min-w-40"
            />
          </Flex>

          <Button
            icon={<FilePdfOutlined />}
            type="primary"
            disabled={!receiveSizeBeamBill?.rows?.length}
            onClick={downloadPdf}
            className="flex-none"
          />
        </Flex>
      </div>

      {renderTable()}
    </div>
  );
}

export default SizeBeamBillList;
