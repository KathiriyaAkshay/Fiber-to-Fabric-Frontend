import { useContext, useState } from "react";
import {
  Button,
  Radio,
  Input,
  Select,
  DatePicker,
  Flex,
  Typography,
  Table,
  Space,
  Spin,
} from "antd";
import { FilePdfOutlined, PlusCircleOutlined } from "@ant-design/icons";
import AddCreditNotes from "../../../components/accounts/notes/CreditNotes/AddCreditNotes";
import Invoice from "../../../components/accounts/notes/CreditNotes/Invoice";
import ActionView from "../../../components/accounts/notes/CreditNotes/ActionView";
import ActionFile from "../../../components/accounts/notes/CreditNotes/ActionFile";
import { usePagination } from "../../../hooks/usePagination";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { useQuery } from "@tanstack/react-query";
import { getCreditNotesListRequest } from "../../../api/requests/accounts/notes";

const CREDIT_NOTE_TYPES = [
  { label: "Sale Return", value: "sale_return" },
  { label: "Late Payment", value: "late_payment" },
  { label: "Claim Note", value: "claim_note" },
  { label: "Discount Note", value: "discount_note" },
  { label: "Other", value: "other" },
];

const CreditNotes = () => {
  const { companyId } = useContext(GlobalContext);

  const [creditNoteTypes, setCreditNoteTypes] = useState("sale_return");
  const [party, setParty] = useState(null);
  const [quality, setQuality] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [saleReturnNo, setSaleReturnNo] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const { data: creditNotesList, isLoading: isLoadingCreditNoteList } =
    useQuery({
      queryKey: [
        "get",
        "credit-notes",
        "list",
        {
          company_id: companyId,
          page,
          pageSize,
        },
      ],
      queryFn: async () => {
        const params = {
          company_id: companyId,
          page,
          pageSize,
        };
        const response = await getCreditNotesListRequest({ params });
        return response.data.data;
      },
      enabled: Boolean(companyId),
    });

  const columns = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
    },
    {
      title: "Return Date",
      dataIndex: "returnDate",
      key: "returnDate",
    },
    {
      title: "Credit No",
      dataIndex: "creditNo",
      key: "creditNo",
    },

    {
      title: "Quality/Denier",
      dataIndex: "quality_denier",
      key: "quality_denier",
    },
    {
      title: "Firm Name",
      dataIndex: "firm_name",
      key: "firm_name",
    },
    {
      title: "Party Name",
      dataIndex: "party_name",
      key: "party_name",
    },
    {
      title: "Meter",
      dataIndex: "meter",
      key: "meter",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Net Amount",
      dataIndex: "net_amount",
      key: "net_amount",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Invoice Date",
      dataIndex: "invoice_date",
      key: "invoice_date",
    },

    {
      title: "Action",
      render: () => {
        return (
          <Space>
            <ActionView />
            <ActionFile />
            <Invoice />
          </Space>
        );
      },
    },
  ];

  function renderTable() {
    if (isLoadingCreditNoteList) {
      return (
        <Spin tip="Loading" size="large">
          <div className="p-14" />
        </Spin>
      );
    }

    return (
      <Table
        dataSource={creditNotesList?.creditNotes?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          total: creditNotesList?.creditNotes?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
        summary={() => {
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
                <b>{creditNotesList?.total_meter}</b>
              </Table.Summary.Cell>

              <Table.Summary.Cell index={1}>
                <b>{creditNotesList?.total_amount || 0}</b>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1}>
                <b>{creditNotesList?.total_amount || 0}</b>
              </Table.Summary.Cell>
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
    <>
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-5 mx-3 mb-3">
          <div className="flex items-center gap-2">
            <h3 className="m-0 text-primary">Credit Notes</h3>
            {creditNoteTypes !== "late_payment" ? (
              <Button
                onClick={() => {
                  setIsAddModalOpen(true);
                }}
                icon={<PlusCircleOutlined />}
                type="text"
              />
            ) : null}
          </div>
          <div style={{ marginLeft: "auto" }}>
            <Radio.Group
              name="production_filter"
              value={creditNoteTypes}
              onChange={(e) => setCreditNoteTypes(e.target.value)}
            >
              {CREDIT_NOTE_TYPES.map(({ label, value }) => {
                return (
                  <Radio key={value} value={value}>
                    {label}
                  </Radio>
                );
              })}
            </Radio.Group>
          </div>
          {/* <div style={{ marginLeft: "auto" }}>
            <Radio.Group name="production_filter">
              <Radio value={"current"}>Current</Radio>
              <Radio value={"previous"}>Previous</Radio>
            </Radio.Group>
          </div> */}
        </div>

        <Flex align="center" justify="flex-end" gap={10}>
          {/* <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Company
            </Typography.Text>
            <Select
              allowClear
              placeholder="Select Party"
              dropdownStyle={{
                textTransform: "capitalize",
              }}
              style={{
                textTransform: "capitalize",
              }}
              className="min-w-40"
            />
          </Flex> */}

          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Party
            </Typography.Text>
            <Select
              allowClear
              placeholder="Select Party"
              dropdownStyle={{
                textTransform: "capitalize",
              }}
              style={{
                textTransform: "capitalize",
              }}
              className="min-w-40"
              value={party}
              onChange={setParty}
            />
          </Flex>
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Quality
            </Typography.Text>
            <Select
              allowClear
              placeholder="Select Party"
              dropdownStyle={{
                textTransform: "capitalize",
              }}
              style={{
                textTransform: "capitalize",
              }}
              className="min-w-40"
              value={quality}
              onChange={setQuality}
            />
          </Flex>

          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              From
            </Typography.Text>
            <DatePicker value={fromDate} onChange={setFromDate} />
          </Flex>
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">To</Typography.Text>
            <DatePicker value={toDate} onChange={setToDate} />
          </Flex>
        </Flex>

        <div className="flex items-center justify-end gap-5 mx-3 mb-3 mt-4  ">
          <Flex align="center" gap={10}>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                Sales Return No
              </Typography.Text>
              <Input
                placeholder="Challan NO"
                value={saleReturnNo}
                onChange={(e) => setSaleReturnNo(e.target.value)}
              />

              <Button
                icon={<FilePdfOutlined />}
                type="primary"
                // disabled={!paymentBillList?.billPaymentDetails?.rows?.length}
                // onClick={downloadPdf}
                className="flex-none"
              />
            </Flex>
          </Flex>
        </div>
        {renderTable()}
      </div>

      {isAddModalOpen && (
        <AddCreditNotes
          isAddModalOpen={isAddModalOpen}
          setIsAddModalOpen={setIsAddModalOpen}
        />
      )}
    </>
  );
};

export default CreditNotes;
