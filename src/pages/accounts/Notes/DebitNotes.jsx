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
  Tag
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
import { disabledFutureDate } from "../../../utils/date";

const DEBIT_NOTE_TYPES = [
  { label: "Purchase Return", value: "purchase_return" },
  { label: "Discount Note", value: "discount_note" },
  { label: "Claim Note", value: "claim_note" },
  { label: "Other", value: "other" },
  // { label: "All", value: "all" },
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
      render: (_, record, index) => index + 1,
    },
    {
      title: "Debit Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => (text ? dayjs(text).format("DD-MM-YYYY") : "-"),
    },
    {
      title: "Debit No",
      dataIndex: "debit_note_number",
      key: "debit_note_number",
      render: (text, record) => (
        <Tag color="green">{text}</Tag>
      ) 
    },
    {
      title: "Challan/Bill Type",
      dataIndex: "debit_note_details",
      key: "debit_note_details",
      render: (text) => text[0]?.model || "-",
    },
    {
      title: "Meter",
      dataIndex: "total_meter",
      key: "total_meter",
      render: (text) => text || "-",
    },
    {
      title: "KG",
      dataIndex: "kg",
      key: "kg",
      render: (text) => text?.checker_name || 0,
    },
    // {
    //   title: "Firm Name",
    //   dataIndex: "firm_name",
    //   key: "firm_name",
    // },
    {
      title: "Party Name",
      dataIndex: ["party", "company_name"],
      key: ["party", "company_name"],
      render: (text, record) => {
        return(
          <>
            <strong>
              { String(record?.party?.user?.first_name ||
                record?.supplier?.supplier_name).toUpperCase()
              }
            </strong>
            <div>
              { record?.party?.company_name || 
                record?.supplier?.supplier_company  
              }
            </div>
          </>
        )
      }
    },
    {
      title: "Int./return Amt",
      dataIndex: "net_amount",
      key: "net_amount",
      render: (text) => text || "-",
    },
    {
      title: "Int. Payment Date",
      dataIndex: "amount",
      key: "amount",
    },
    // {
    //   title: "Net Amount",
    //   dataIndex: "net_amount",
    //   key: "net_amount",
    // },
    // {
    //   title: "Type",
    //   dataIndex: "type",
    //   key: "type",
    // },
    // {
    //   title: "Invoice Date",
    //   dataIndex: "invoice_date",
    //   key: "invoice_date",
    // },
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
        summary={(pageData) => {
          let totalReturnAmount = 0;
          pageData?.forEach((item) => {
            totalReturnAmount += +item.net_amount || 0;
          });
          return (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0}>
                <b>Total</b>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={0} />
              <Table.Summary.Cell index={0} />
              <Table.Summary.Cell index={0} />
              <Table.Summary.Cell index={0} />
              <Table.Summary.Cell index={0} />
              <Table.Summary.Cell index={0} />
              <Table.Summary.Cell index={1}>
                <b>{totalReturnAmount}</b>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} />
              <Table.Summary.Cell index={0} />
              {/* <Table.Summary.Cell index={0} /> */}
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
              className="payment-options"
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
            <DatePicker value={fromDate} onChange={setFromDate} disabledDate={disabledFutureDate} />
          </Flex>
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">To</Typography.Text>
            <DatePicker value={toDate} onChange={setToDate} disabledDate={disabledFutureDate} />
          </Flex>
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
            </Flex>
          </Flex>
          <Button
            icon={<FilePdfOutlined />}
            type="primary"
            disabled={!debitNotesList?.debitNotes?.rows?.length}
            // onClick={downloadPdf}
            className="flex-none"
          />
        </Flex>
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
