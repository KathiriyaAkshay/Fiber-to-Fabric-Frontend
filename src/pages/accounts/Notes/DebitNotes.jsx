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
import ViewDebitNote from "../../../components/accounts/notes/DebitNotes/ViewDebitNote";
import { CREDIT_NOTE_LATE_PAYMENT, CREDIT_NOTE_OTHER, CREDIT_NOTE_SALE_RETURN, PURCHASE_TAG_COLOR, YARN_SALE_BILL_TAG_COLOR } from "../../../constants/tag";
import { SALE_TAG_COLOR, JOB_TAG_COLOR, BEAM_RECEIVE_TAG_COLOR } from "../../../constants/tag";

const DEBIT_NOTE_TYPES = [
  { label: "Purchase Return", value: "purchase_return" },
  { label: "Discount Note", value: "discount_note" },
  { label: "Claim Note", value: "claim_note" },
  { label: "Other", value: "other" },
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
      title: "Challan/Bill",
      dataIndex: "debit_note_details",
      key: "debit_note_details",
      render: (text, record) => {
        let debit_note_details = record?.debit_note_details;
        if (debitNoteType == "other") {
          return (
            <div>
              {record?.debit_note_details
                ?.map((element) => element?.invoice_no || "N/A")  // Map through to get bill_no or "N/A" if it's null
                .join(", ")}
            </div>
          )
        } else if (debitNoteType == "purchase_return") {
          if (record?.purchase_taka_challan !== null) {
            return (
              <div>
                {record?.purchase_taka_challan?.challan_no}
              </div>
            )
          } else {
            return (
              <div>
                {record?.yarn_receive_challan?.challan_no}
              </div>
            )
          }
        } else if (debitNoteType == 'claim_note') {
          let bill_number = record?.debit_note_details[0];
          return (
            <div>
              {bill_number?.invoice_no || "-"}
            </div>
          )
        } else {
          return (
            <div style={{
              fontWeight: 600
            }}>
              {record?.debit_note_details
                ?.map((element) => element?.invoice_no || "N/A")  // Map through to get bill_no or "N/A" if it's null
                .join(", ")}
            </div>
          );
        }
      }
    },
    {
      title: "Challan/Bill Type",
      dataIndex: "",
      render: (text, record) => {
        if (debitNoteType == "purchase_return") {
          if (record?.yarn_receive_challan !== null) {
            return (
              <Tag color={YARN_SALE_BILL_TAG_COLOR}>
                <div style={{ fontSize: 11 }}>
                  YARN RETURN
                </div>
              </Tag>
            )
          } else {
            return (
              <Tag color={PURCHASE_TAG_COLOR}>
                <div style={{ fontSize: 11 }}>
                  PURCHASE RETURN
                </div>
              </Tag>
            )
          }
        } else if (debitNoteType == "other") {
          
          let check_type = record?.debit_note_details[0]?.model ; 
          let current_model = null ; 

          if (check_type == null || check_type == undefined){
            current_model = "OTHER" ;
          } else {
            const modelLabels = {
              sale_bills: "SALE BILL",
              yarn_sale_bills: "YARN SALE",
              job_gray_sale_bill: "JOB GRAY",
              beam_sale_bill: "BEAM SALE",
            };
            
            // Get the label using the mapping object
            if (modelLabels[check_type] == undefined){
              current_model = check_type ; 
            } else {
              current_model = modelLabels[check_type]
            }
            
          }

          return (
            <Tag color={current_model == "OTHER"?CREDIT_NOTE_OTHER:CREDIT_NOTE_LATE_PAYMENT}>
              {current_model}
            </Tag>
          )
        } else if (debitNoteType == "claim_note") {
          return (
            <Tag
              color={{
                general_purchase_entries: SALE_TAG_COLOR,
                yarn_bills: YARN_SALE_BILL_TAG_COLOR,
                job_rework_bill: JOB_TAG_COLOR,
                receive_size_beam_bill: BEAM_RECEIVE_TAG_COLOR,
                purchase_taka_bills: PURCHASE_TAG_COLOR,
                job_taka_bills: JOB_TAG_COLOR,
              }[record?.model] || "default"}
              style={{ marginLeft: "8px" }}
            >
              {{
                general_purchase_entries: "General Purchase",
                yarn_bills: "Yarn Bill",
                job_rework_bill: "Job Rework",
                receive_size_beam_bill: "Receive Size Beam",
                purchase_taka_bills: "Purchase Taka",
                job_taka_bills: "Job Taka",
              }[record?.model] || "Default"}
            </Tag>
          )
        } else {
          let bill_type = record?.debit_note_details[0]?.model; 
          return (
            <Tag
              color={{
                general_purchase_entries: SALE_TAG_COLOR,
                yarn_bills: YARN_SALE_BILL_TAG_COLOR,
                job_rework_bill: JOB_TAG_COLOR,
                receive_size_beam_bill: BEAM_RECEIVE_TAG_COLOR,
                purchase_taka_bills: PURCHASE_TAG_COLOR,
                job_taka_bills: JOB_TAG_COLOR,
              }[bill_type] || "default"}
              style={{ marginLeft: "8px" }}
            >
              {{
                general_purchase_entries: "General Purchase",
                yarn_bills: "Yarn Bill",
                job_rework_bill: "Job Rework",
                receive_size_beam_bill: "Receive Size Beam",
                purchase_taka_bills: "Purchase Taka",
                job_taka_bills: "Job Taka",
              }[bill_type] || "Default"}
            </Tag>
          )
        }
      }
    },
    {
      title: "Meter",
      dataIndex: "total_meter",
      key: "total_meter",
      render: (text, record) => {
        if (debitNoteType == "discount_note") {
          let total_meter = 0;
          record?.debit_note_details?.map((element) => {
            total_meter += +element?.quantity || 0;
          });
          return <div>{total_meter}</div>;
        } else {
          return <div>{text || "0"}</div>;
        }
      },
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
        return (
          <>
            <strong>
              {String(record?.party?.user?.first_name ||
                record?.supplier?.supplier_name).toUpperCase()
              }
            </strong>
            <div>
              {record?.party?.company_name ||
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
      render: (text, record) => {
        let debit_note_details = record?.debit_note_details;
        if (debitNoteType == "other") {
          return (
            <div>
              {debit_note_details[0]?.amount || "0"}
            </div>
          )
        } else if (debitNoteType == "purchase_return") {
          return (
            <div>
              {parseFloat(record?.net_amount).toFixed(2)}
            </div>
          )
        } else if (debitNoteType == "claim_note"){
          return(
            <div>
              {record?.net_amount || 0}
            </div>
          )
        } else {
          return(
            <div>
              {record?.net_amount}
            </div>
          )
        }

      }
    },
    {
      title: "Int. Payment Date",
      dataIndex: "amount",
      render: (text, record) => {
        return (
          <div>-</div>
        )
      }
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
      render: (text, record) => {
        return (
          <Space>
            <ViewDebitNote
              details={record}
              type={debitNoteType}
            />
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
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1}>
                {debitNotesList?.debitNotes?.total_bill_amounts}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={0} />
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
