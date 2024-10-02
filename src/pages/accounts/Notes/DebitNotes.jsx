import { useContext, useState } from "react";
import {
  Button,
  Radio,
  Input,
  DatePicker,
  Flex,
  Typography,
  Table,
  Space,
  Spin,
} from "antd";
import { FilePdfOutlined, PlusCircleOutlined } from "@ant-design/icons";
import Invoice from "../../../components/accounts/notes/CreditNotes/Invoice";
import ActionView from "../../../components/accounts/notes/CreditNotes/ActionView";
import ActionFile from "../../../components/accounts/notes/CreditNotes/ActionFile";
import AddDebitNotes from "../../../components/accounts/notes/DebitNotes/AddDebitNotes";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { useQuery } from "@tanstack/react-query";
import { usePagination } from "../../../hooks/usePagination";
import { getDebitNotesListRequest } from "../../../api/requests/accounts/notes";
import dayjs from "dayjs";

const DEBIT_NOTE_TYPES = [
  { label: "Purchase Return", value: "purchase_return" },
  { label: "Discount Note", value: "discount_note" },
  { label: "Claim Note", value: "claim_note" },
  { label: "Other", value: "other" },
  { label: "All", value: "all" },
];

const DebitNotes = () => {
  const { companyId } = useContext(GlobalContext);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [debitNoteType, setDebitNoteType] = useState("purchase_return");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [search, setSearch] = useState("");

  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const { data: debitNotesList, isLoading: isLoadingDebitNoteList } = useQuery({
    queryKey: [
      "get",
      "debit-notes",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
        debit_note_type: debitNoteType,
        fromDate: fromDate,
        toDate: toDate,
      },
    ],
    queryFn: async () => {
      const params = {
        company_id: companyId,
        page,
        pageSize,
        debit_note_type: debitNoteType,
      };
      if (fromDate) {
        params.fromDate = dayjs(fromDate).format("YYYY-MM-DD");
      }
      if (toDate) {
        params.toDate = dayjs(toDate).format("YYYY-MM-DD");
      }
      const response = await getDebitNotesListRequest({ params });
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
      dataIndex: "inhouse_quality",
      key: "inhouse_quality",
      render: (text) => {
        return `${text?.quality_name || ""} ${
          text?.quality_weight ? "(" + text?.quality_weight + "KG)" : ""
        }`;
      },
    },
    // {
    //   title: "Firm Name",
    //   dataIndex: "firm_name",
    //   key: "firm_name",
    // },
    {
      title: "Party Name",
      dataIndex: "party",
      key: "party",
      render: (text) => {
        return `${text?.first_name || ""} ${text?.last_name || ""}`;
      },
    },
    {
      title: "Meter",
      dataIndex: "total_meter",
      key: "total_meter",
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
    if (isLoadingDebitNoteList) {
      return (
        <Spin tip="Loading" size="large">
          <div className="p-14" />
        </Spin>
      );
    }

    return (
      <Table
        dataSource={debitNotesList?.debitNotes?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          total: debitNotesList?.debitNotes?.count || 0,
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
                <b>4218</b>
              </Table.Summary.Cell>

              <Table.Summary.Cell index={1}>
                <b>244518</b>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1}>
                <b>11432</b>
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
          <div className="flex items-center gap-5">
            <h3 className="m-0 text-primary">Debit Notes</h3>
            <Button
              onClick={() => {
                setIsAddModalOpen(true);
              }}
              icon={<PlusCircleOutlined />}
              type="text"
            />
          </div>
          <div style={{ marginLeft: "auto" }}>
            <Radio.Group
              name="production_filter"
              value={debitNoteType}
              onChange={(e) => setDebitNoteType(e.target.value)}
            >
              {DEBIT_NOTE_TYPES.map(({ label, value }) => {
                return (
                  <Radio key={value} value={value}>
                    {label}
                  </Radio>
                );
              })}
            </Radio.Group>
          </div>
        </div>
        {/* Filters Start */}
        <Flex align="center" justify="flex-end" gap={10}>
          {/* <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Company
            </Typography.Text>
            <Select
              placeholder="Select Company"
              options={companyListRes?.rows?.map((item) => {
                return { label: item.company_name, value: item?.id };
              })}
              style={{
                textTransform: "capitalize",
              }}
              dropdownStyle={{
                textTransform: "capitalize",
              }}
            />
          </Flex> */}
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
                Search
              </Typography.Text>
              <Input
                placeholder=""
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <Button
                icon={<FilePdfOutlined />}
                type="primary"
                disabled={!debitNotesList?.debitNotes?.rows?.length}
                // onClick={downloadPdf}
                className="flex-none"
              />
            </Flex>
          </Flex>
        </div>
        {renderTable()}
      </div>

      {isAddModalOpen && (
        <AddDebitNotes
          isAddModalOpen={isAddModalOpen}
          setIsAddModalOpen={setIsAddModalOpen}
          defaultDebitNoteType={debitNoteType}
        />
      )}
    </>
  );
};

export default DebitNotes;
