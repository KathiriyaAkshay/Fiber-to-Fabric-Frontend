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
  Tag,
} from "antd";
import {
  EditOutlined,
  FilePdfOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import AddDebitNotes from "../../../components/accounts/notes/DebitNotes/AddDebitNotes";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { useQuery } from "@tanstack/react-query";
import { usePagination } from "../../../hooks/usePagination";
import { getDebitNotesListRequest } from "../../../api/requests/accounts/notes";
import dayjs from "dayjs";
import { disabledFutureDate } from "../../../utils/date";
import ViewDebitNote from "../../../components/accounts/notes/DebitNotes/ViewDebitNote";
import { CREDIT_NOTE_OTHER, PURCHASE_TAG_COLOR, YARN_SALE_BILL_TAG_COLOR } from "../../../constants/tag";
import { SALE_TAG_COLOR, JOB_TAG_COLOR, BEAM_RECEIVE_TAG_COLOR } from "../../../constants/tag";
import DeleteDebitNote from "../../../components/accounts/notes/DebitNotes/DeleteDebitNote";
import UpdateDebitNote from "../../../components/accounts/notes/DebitNotes/UpdateDebitNote";
import DebitNotInvoice from "../../../components/accounts/notes/DebitNotes/DebitNoteInvoice";
import { BEAM_SALE_BILL_MODEL, BEAM_SALE_MODEL_NAME, DEBIT_NOTE_OTHER_TYPE, DEBIT_NOTE_PURCHASE_RETURN, DEBIT_NOTE_PURCHASE_RETURN_NAME, DEBIT_NOTE_SIZE_BEAM_RETURN, DEBIT_NOTE_SIZE_BEAM_RETURN_NAME, DEBIT_NOTE_YARN_RETURN, DEBIT_NOTE_YARN_RETURN_NAME, GENERAL_PURCHASE_MODEL_NAME, JOB_GREAY_BILL_MODEL_NAME, JOB_GREAY_SALE_BILL_MODEL, JOB_REWORK_MODEL_NAME, JOB_TAKA_MODEL_NAME, JOB_WORK_BILL_MODEL, JOB_WORK_MODEL_NAME, PURCHASE_RETURN_MODEL_NAME, PURCHASE_TAKA_MODEL_NAME, RECEIVE_BEAM_RETURN_MODEL_NAME, RECEIVE_SIZE_BEAM_MODEL_NAME, SALE_BILL_MODEL, SALE_BILL_MODEL_NAME, YARN_RECEIVE_MODEL_NAME, YARN_RECEIVE_RETURN_MODEL_NAME, YARN_SALE_BILL_MODEL, YARN_SALE_BILL_MODEL_NAME } from "../../../constants/bill.model";

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

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [debitNoteData, setDebitNoteData] = useState(null);

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
        if (record?.debit_note_type == DEBIT_NOTE_PURCHASE_RETURN) {
          return (
            <div>
              {record?.sale_challan?.challan_no || "N/A"}
            </div>
          )
        } else if (record?.debit_note_type == DEBIT_NOTE_SIZE_BEAM_RETURN){
          return(
            <div>
              {record?.recevice_size_beam_return?.receive_size_beam?.challan_no}
            </div>
          )
        } else if (record?.debit_note_type == DEBIT_NOTE_YARN_RETURN){
          return(
            <div>
              {record?.yarn_receive_challan?.challan_no}
            </div>
          )
        } else if (record?.debit_note_type == DEBIT_NOTE_OTHER_TYPE){
          return(
            <div>
              {record?.invoice_no || "N/A"}
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
        if (record?.debit_note_type == DEBIT_NOTE_PURCHASE_RETURN) {
          return (
            <Tag color={PURCHASE_TAG_COLOR}>
              <div style={{ fontSize: 11 }}>
                {DEBIT_NOTE_PURCHASE_RETURN_NAME}
              </div>
            </Tag>
          )
        } else if (record?.debit_note_type == DEBIT_NOTE_SIZE_BEAM_RETURN){
          return(
            <Tag color = {BEAM_RECEIVE_TAG_COLOR}>
              {DEBIT_NOTE_SIZE_BEAM_RETURN_NAME}
            </Tag>
          )
        } else if (record?.debit_note_type == DEBIT_NOTE_YARN_RETURN){
          return(
            <Tag color = {YARN_SALE_BILL_TAG_COLOR} >
              {DEBIT_NOTE_YARN_RETURN_NAME}
            </Tag>
          )
        } else if (debitNoteType == DEBIT_NOTE_OTHER_TYPE) {
          let debit_note_model = record?.debit_note_details[0]?.model ; 
          let debit_note_type = record?.debit_note_type ; 
          
          if (debit_note_type == DEBIT_NOTE_OTHER_TYPE && (debit_note_model == null || debit_note_model == undefined)){
            return(
              <Tag color = {CREDIT_NOTE_OTHER}>
                OTHER
              </Tag>
            )
          } else {
            return(
              <div>
                <div style={{fontSize: 12, fontWeight: 600}}>Sundry</div>
                <Tag color="blue">
                  { 
                    debit_note_model == YARN_SALE_BILL_MODEL?YARN_SALE_BILL_MODEL_NAME:
                    debit_note_model == BEAM_SALE_BILL_MODEL?BEAM_SALE_MODEL_NAME:
                    debit_note_model == JOB_WORK_BILL_MODEL?JOB_WORK_MODEL_NAME:
                    debit_note_model == SALE_BILL_MODEL?SALE_BILL_MODEL_NAME:
                    debit_note_model == JOB_GREAY_SALE_BILL_MODEL?JOB_GREAY_BILL_MODEL_NAME:""
                  }
                </Tag>
              </div>
            )
          }
          
        } else{
          let debit_note_model = record?.debit_note_details[0]?.model ; 
          return (
            <Tag
              color={{
                general_purchase_entries: SALE_TAG_COLOR,
                yarn_bills: YARN_SALE_BILL_TAG_COLOR,
                job_rework_bill: JOB_TAG_COLOR,
                receive_size_beam_bill: BEAM_RECEIVE_TAG_COLOR,
                purchase_taka_bills: PURCHASE_TAG_COLOR,
                job_taka_bills: JOB_TAG_COLOR,
              }[debit_note_model] || "default"}
              style={{ marginLeft: "8px" }}
            >
              {{
                general_purchase_entries: GENERAL_PURCHASE_MODEL_NAME,
                yarn_bills: YARN_RECEIVE_MODEL_NAME,
                job_rework_bill: JOB_REWORK_MODEL_NAME,
                receive_size_beam_bill: RECEIVE_SIZE_BEAM_MODEL_NAME,
                purchase_taka_bills: PURCHASE_TAKA_MODEL_NAME,
                job_taka_bills: JOB_TAKA_MODEL_NAME,
              }[debit_note_model] || "Default"}
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
        return(
          <div>
            {parseFloat(text || 0).toFixed(2)}
          </div>
        )
      },
    },
    {
      title: "KG",
      dataIndex: "kg",
      key: "kg",
      render: (text, record) => {
        return(
          <div>
            {parseFloat(record?.total_taka || 0).toFixed(2)}
          </div>
        )
      }
    },
    {
      title: "Part/Supplier",
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
        );
      },
    },
    {
      title: "Int./return Amt",
      dataIndex: "net_amount",
      key: "net_amount",
      render: (text, record) => {
        return(
          <div>
            {isNaN(parseFloat(text).toFixed(2))?"0.0":parseFloat(text).toFixed(2)}
          </div>
        )

      }
    },
    {
      title: "Int. Payment Date",
      dataIndex: "interest_pay_date",
      key: "interest_pay_date",
      render: (text) => (text ? dayjs(text).format("DD-MM-YYYY") : "-"),
    },
    {
      title: "Action",
      render: (text, record) => {
        return (
          <Space>
            
            {/* Debit note view  */}
            <ViewDebitNote
              details={record}
              type={debitNoteType}
            />

            {!record?.is_partial_payment ? (
              <>
                {/* <UpdateCreditNote details={details} /> */}
                <Button
                  onClick={() => {
                    setIsUpdateModalOpen(true);
                    setDebitNoteData(record);
                  }}
                >
                  <EditOutlined />
                </Button>

                <DeleteDebitNote key={"delete_debit_note"} details={record} />
              </>
            ) : null}

            <DebitNotInvoice />
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
          current: page + 1,
          pageSize: pageSize,
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
            <DatePicker
              value={fromDate}
              onChange={setFromDate}
              disabledDate={disabledFutureDate}
            />
          </Flex>
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">To</Typography.Text>
            <DatePicker
              value={toDate}
              onChange={setToDate}
              disabledDate={disabledFutureDate}
            />
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

      {isUpdateModalOpen && (
        <UpdateDebitNote
          details={debitNoteData}
          isModalOpen={isUpdateModalOpen}
          setIsModalOpen={setIsUpdateModalOpen}
          debitNoteTypes={debitNoteType}
        />
      )}
    </>
  );
};

export default DebitNotes;
