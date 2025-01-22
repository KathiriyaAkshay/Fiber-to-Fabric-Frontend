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
  Tag,
} from "antd";
import {
  EditOutlined,
  FilePdfOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import CreditNoteInvoice from "../../../components/accounts/notes/CreditNotes/CreditNoteInvoice";
import AddCreditNotes from "../../../components/accounts/notes/CreditNotes/AddCreditNotes";
import { usePagination } from "../../../hooks/usePagination";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { useQuery } from "@tanstack/react-query";
import { getCreditNotesListRequest } from "../../../api/requests/accounts/notes";
import { getPartyListRequest } from "../../../api/requests/users";
import { getInHouseQualityListRequest } from "../../../api/requests/qualityMaster";
import dayjs from "dayjs";
import ViewCreditNoteModal from "../../../components/accounts/notes/CreditNotes/ViewCreditNoteModal";
import moment from "moment";
import { BEAM_RECEIVE_TAG_COLOR, CREDIT_NOTE_CLAIM, CREDIT_NOTE_DISCOUNT, CREDIT_NOTE_OTHER, CREDIT_NOTE_SALE_RETURN, JOB_TAG_COLOR, PURCHASE_TAG_COLOR, SALE_TAG_COLOR, YARN_SALE_BILL_TAG_COLOR } from "../../../constants/tag";
import useDebounce from "../../../hooks/useDebounce";
import { disabledFutureDate } from "../../../utils/date";
import CreditNoteSaleReturnComp from "../../../components/sale/challan/saleReturn/creditNoteSaleReturnComp";
import ViewDiscountCreditNoteModel from "../../../components/accounts/notes/CreditNotes/viewDiscountCreditNote";
import AccountantYarnSaleChallan from "../../../components/sale/challan/yarn/accountantYarnSaleChallan";
import DeleteCreditNote from "../../../components/accounts/notes/CreditNotes/DeleteCreditNote";
import UpdateCreditNote from "../../../components/accounts/notes/CreditNotes/UpdateCreditNote";
import { BEAM_SALE_BILL_MODEL, BEAM_SALE_MODEL_NAME, GENERAL_PURCHASE_MODEL_NAME, GENRAL_PURCHASE_BILL_MODEL, JOB_GREAY_BILL_MODEL_NAME, JOB_GREAY_SALE_BILL_MODEL, JOB_REWORK_BILL_MODEL, JOB_REWORK_MODEL_NAME, JOB_TAKA_BILL_MODEL, JOB_TAKA_MODEL_NAME, JOB_WORK_BILL_MODEL, JOB_WORK_MODEL_NAME, PURCHASE_TAKA_BILL_MODEL, PURCHASE_TAKA_MODEL_NAME, RECEIVE_SIZE_BEAM_BILL_MODEL, RECEIVE_SIZE_BEAM_MODEL_NAME, SALE_BILL_MODEL, SALE_BILL_MODEL_NAME, YARN_RECEIVE_BILL_MODEL, YARN_RECEIVE_MODEL_NAME, YARN_SALE_BILL_MODEL, YARN_SALE_BILL_MODEL_NAME } from "../../../constants/bill.model";
import { getDisplayQualityName } from "../../../constants/nameHandler";
// import UpdateCreditNode from "../../../components/accounts/notes/CreditNotes/UpdateCreditNote";

const CREDIT_NOTE_TYPES = [
  { label: "Sale Return", value: "sale_return" },
  { label: "Late Payment", value: "late" },
  { label: "Claim Note", value: "claim" },
  { label: "Discount Note", value: "discount" },
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
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [creditNoteData, setCreditNoteData] = useState(null);

  const debounceParty = useDebounce(party, 150);
  const debounceQuality = useDebounce(quality, 150);
  const debounceFromDate = useDebounce(fromDate, 150);
  const debounceToDate = useDebounce(toDate, 150);
  const debounceSaleReturnNo = useDebounce(saleReturnNo, 150);

  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  // Party list dropdown =====================================
  const { data: partyUserListRes, isLoading: isLoadingPartyList } = useQuery({
    queryKey: ["party", "list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getPartyListRequest({
        params: { company_id: companyId },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  // InHouse Quality dropdown
  const { data: dropDownQualityListRes, isLoading: dropDownQualityLoading } =
    useQuery({
      queryKey: [
        "dropDownQualityListRes",
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
          credit_note_type: creditNoteTypes,
          party_id: debounceParty,
          quality_id: debounceQuality,
          from: debounceFromDate,
          to: debounceToDate,
          sale_return_no: debounceSaleReturnNo,
        },
      ],
      queryFn: async () => {
        const params = {
          company_id: companyId,
          page,
          pageSize,
          credit_note_type: creditNoteTypes,
          party_id: debounceParty,
          quality_id: debounceQuality,
        };
        if (fromDate) {
          params.from = dayjs(debounceFromDate).format("YYYY-MM-DD");
        }
        if (toDate) {
          params.to = dayjs(debounceToDate).format("YYYY-MM-DD");
        }
        if (saleReturnNo) {
          params.sale_return_no = debounceSaleReturnNo;
        }
        const response = await getCreditNotesListRequest({ params });
        return response.data.data;
      },
      enabled: Boolean(companyId),
    });

  const downloadPdf = () => {
    console.log("downloadPdf");
  };

  const columns = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (_, record, index) => index + 1,
    },
    {
      title: "Return Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => dayjs(text).format("DD-MM-YYYY"),
    },
    {
      title: "Credit No",
      dataIndex: "credit_note_number",
      key: "credit_note_number",
      render: (text) => <Tag color="green">{text}</Tag>,
    },
    {
      title: "Challan/Bill",
      dataIndex: "challan",
      key: "challan",
      render: (text, record) => {
        if (creditNoteTypes == "sale_return"){
          return(
            <div>
              { record?.sale_challan_return?.sale_challan?.challan_no || 
                record?.yarn_sale?.challan_no || "-"  
              }
            </div>
          )
        } else{
          return (
            <div style={{
              fontWeight: 600
            }}>
              {record?.credit_note_details
                ?.map((element) => element?.invoice_no || element?.bill_no || "N/A")  // Map through to get bill_no or "N/A" if it's null
                .join(", ")}
            </div>
          );
        } 
      },
    },
    {
      title: "Quality/Denier",
      dataIndex: "inhouse_quality",
      key: "inhouse_quality",
      render: (text, record) => {
        if (creditNoteTypes == "late"){
          // Showing purchasse related information 
          // Show quality id and yarn stock company related information 

          console.log(record);
          
          
          return(
            <div>-</div>
          )
        } else if (creditNoteTypes == "discount"){
          return(
            <div>-</div>
          )
        } else if (creditNoteTypes == "other"){
          return(
            <div>-</div>
          )
        } else if (creditNoteTypes == "claim"){
          // Show only quality related information 
          // Contain bill of sale bill, job work, job gray sale 

          let credit_note_model = record?.credit_note_details[0]?.model ; 
          if (credit_note_model === JOB_WORK_BILL_MODEL){
            let yarn_stock_company = record?.credit_note_details[0]?.yarn_stock_company ; 
            return(
              <div>
                <div style={{fontWeight: 600}}>
                  {yarn_stock_company?.yarn_company_name || "N/A"}
                </div>
                {yarn_stock_company?.yarn_count && yarn_stock_company?.yarn_denier && yarn_stock_company?.yarn_type ? (
                  `${yarn_stock_company.yarn_count}C/${yarn_stock_company.yarn_denier}D (${yarn_stock_company.yarn_type}(${yarn_stock_company?.yarn_Sub_type}))`
                ) : (
                  "Details unavailable"
                )}
              </div>
            )
          } else {
            let quality_details = record?.credit_note_details[0]; 
            return(
              <div>
                {getDisplayQualityName(quality_details?.inhouse_quality)}
              </div>
            )
          }

        } else if (record?.yarn_sale == null){
          return `${text?.quality_name || ""} (${text?.quality_weight || ""}KG)`;
        } else{
          return(
            <div>
              {`${record?.yarn_sale?.yarn_stock_company?.yarn_denier}( ${record?.yarn_sale?.yarn_stock_company?.yarn_type}-${record?.yarn_sale?.yarn_stock_company?.yarn_Sub_type}-${record?.yarn_sale?.yarn_stock_company?.yarn_color} )`}
            </div>
          );
        }
      },
    },
    {
      title: "Party Name",
      dataIndex: ["party", "company_name"],
      key: ["party", "company_name"],
      render: (text, record) => {
        return (
          <>
            <strong>
              {String(
                record?.party?.user?.first_name ||
                  record?.supplier?.supplier_name
              ).toUpperCase()}
            </strong>
            <div>
              {record?.party?.company_name ||
                record?.supplier?.supplier_company}
            </div>
          </>
        );
      },
    },
    {
      title: "Meter",
      dataIndex: "total_meter",
      key: "total_meter",
      render: (text) => text || 0,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (text, record) => {
        let total_amount = 0;
        record?.credit_note_details?.map((element) => {
          total_amount += +element?.amount;
        });
        return(
          <div>
            {parseFloat(total_amount).toFixed(2)}
          </div>
        )
      },
    },
    {
      title: "Net Amount",
      dataIndex: "net_amount",
      key: "net_amount",
      render: (text, record) => {
        return(
          <div>
            {parseFloat(text).toFixed(2)}
          </div>
        )
      }
    },
    {
      title: "Type",
      dataIndex: "credit_note_type",
      key: "credit_note_type",
      render: (text, record) => {
        if (creditNoteTypes === "other") {
          let credit_note_model = record?.credit_note_details[0]?.model ; 
          if (credit_note_model == null || credit_note_model == undefined){
            return(
              <Tag color = {CREDIT_NOTE_OTHER}>
                OTHER
              </Tag>
            )
          }  else {
            return(
              <div>
                <div style={{
                  fontWeight: 600, 
                  fontSize: 13
                }}>Sundry</div>
                <Tag color = "blue">
                  {
                    credit_note_model == YARN_RECEIVE_BILL_MODEL?YARN_RECEIVE_MODEL_NAME:
                    credit_note_model == RECEIVE_SIZE_BEAM_BILL_MODEL?RECEIVE_SIZE_BEAM_MODEL_NAME:
                    credit_note_model == PURCHASE_TAKA_BILL_MODEL?PURCHASE_TAKA_MODEL_NAME:
                    credit_note_model == JOB_TAKA_BILL_MODEL?JOB_TAKA_MODEL_NAME:
                    credit_note_model == JOB_REWORK_BILL_MODEL?JOB_REWORK_MODEL_NAME:GENERAL_PURCHASE_MODEL_NAME
                  }
                </Tag>
              </div>
            )
          }
        } else if (creditNoteTypes == "late"){
          let credit_note_model = record?.credit_note_details[0]?.model ; 
          let credit_note_color = "default" ; 
          if (credit_note_model == GENRAL_PURCHASE_BILL_MODEL){
            credit_note_color = SALE_TAG_COLOR
          } else if (credit_note_model == YARN_RECEIVE_BILL_MODEL){
            credit_note_color = YARN_SALE_BILL_TAG_COLOR
          } else if (credit_note_model == JOB_REWORK_BILL_MODEL){
            credit_note_color = JOB_TAG_COLOR
          } else if (credit_note_model == RECEIVE_SIZE_BEAM_BILL_MODEL){
            credit_note_color = BEAM_RECEIVE_TAG_COLOR
          } else if (credit_note_model == PURCHASE_TAKA_BILL_MODEL){
            credit_note_color = PURCHASE_TAG_COLOR
          } else {
            credit_note_color = JOB_TAG_COLOR
          }
          return(
            <Tag color = {credit_note_color}>
              {
                credit_note_model == YARN_RECEIVE_BILL_MODEL?YARN_RECEIVE_MODEL_NAME:
                credit_note_model == RECEIVE_SIZE_BEAM_BILL_MODEL?RECEIVE_SIZE_BEAM_MODEL_NAME:
                credit_note_model == PURCHASE_TAKA_BILL_MODEL?PURCHASE_TAKA_MODEL_NAME:
                credit_note_model == JOB_TAKA_BILL_MODEL?JOB_TAKA_MODEL_NAME:
                credit_note_model == JOB_REWORK_BILL_MODEL?JOB_REWORK_MODEL_NAME:
                credit_note_model == GENRAL_PURCHASE_BILL_MODEL?GENERAL_PURCHASE_MODEL_NAME:credit_note_model
              } 
            </Tag>
          )
        } else {
          let credit_note_model = record?.credit_note_details[0]?.model ; 
          let credit_note_color = "default"

          if (credit_note_model == YARN_SALE_BILL_MODEL){
            credit_note_color = YARN_SALE_BILL_TAG_COLOR
          } else if (credit_note_model == BEAM_SALE_BILL_MODEL){
            credit_note_color = BEAM_RECEIVE_TAG_COLOR
          } else if (credit_note_model == JOB_WORK_BILL_MODEL){
            credit_note_color =  JOB_TAG_COLOR
          } else if (credit_note_model == JOB_GREAY_SALE_BILL_MODEL){
            credit_note_color = JOB_TAG_COLOR
          } else {
            credit_note_color = SALE_TAG_COLOR ; 
          }
           
          return(
            <Tag 
              color={credit_note_color}
              style={{ marginLeft: "8px" }}
            >
              {
                credit_note_model === YARN_SALE_BILL_MODEL
                  ? YARN_SALE_BILL_MODEL_NAME
                  : credit_note_model === BEAM_SALE_BILL_MODEL
                  ? BEAM_SALE_MODEL_NAME
                  : credit_note_model === JOB_WORK_BILL_MODEL
                  ? JOB_WORK_MODEL_NAME
                  : credit_note_model === SALE_BILL_MODEL
                  ? SALE_BILL_MODEL_NAME
                  : credit_note_model === JOB_GREAY_SALE_BILL_MODEL
                  ? JOB_GREAY_BILL_MODEL_NAME
                  : ""
              }
            </Tag>

          )
        }
      },
    },
    {
      title: "Invoice Date",
      dataIndex: "createdAt",
      key: "invoice_date",
      render: (text) => {
        return <div>{moment(text).format("DD-MM-YYYY")}</div>;
      },
    },

    {
      title: "Action",
      render: (details) => {
        return (
          <Space>
            {/* Sale return related information*/}
            {details?.credit_note_type == "sale_return" && (
              <CreditNoteSaleReturnComp details={details} />
            )}

            {/* Yarn sale return related information  */}
            {details?.credit_note_type == "yarn_sale_return" && (
              <AccountantYarnSaleChallan details={details} />
            )}

            {creditNoteTypes != "discount" ? (
              <>
                <ViewCreditNoteModal details={details} type={creditNoteTypes} />
              </>
            ) : (
              <>
                <ViewDiscountCreditNoteModel
                  details={details}
                  type={creditNoteTypes}
                />
              </>
            )}
            {!details.is_partial_payment ? (
              <>
                {/* <UpdateCreditNote details={details} /> */}
                <Button
                  onClick={() => {
                    setIsUpdateModalOpen(true);
                    setCreditNoteData(details);
                  }}
                >
                  <EditOutlined />
                </Button>

                <DeleteCreditNote
                  key={"delete_credit_note"}
                  details={details}
                />
              </>
            ) : null}

            <CreditNoteInvoice />
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
          current: page + 1,
          pageSize: pageSize,
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
                <b>{creditNotesList?.total_meter || 0}</b>
              </Table.Summary.Cell>

              <Table.Summary.Cell index={1}>
                <b>{creditNotesList?.total_amount || 0}</b>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1}>
                <b>{creditNotesList?.total_net_amount || 0}</b>
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
            <Button
              onClick={() => {
                setIsAddModalOpen(true);
                setCreditNoteData(null);
              }}
              icon={<PlusCircleOutlined />}
              type="text"
            />
          </div>
          <div style={{ marginLeft: "auto" }}>
            <Radio.Group
              name="production_filter"
              value={creditNoteTypes}
              onChange={(e) => setCreditNoteTypes(e.target.value)}
              className="payment-options"
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
              loading={isLoadingPartyList}
              options={partyUserListRes?.partyList?.rows?.map((party) => ({
                label:
                  party.first_name +
                  " " +
                  party.last_name +
                  " " +
                  `| ( ${party?.username})`,
                value: party.id,
              }))}
            />
          </Flex>
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Quality
            </Typography.Text>
            <Select
              allowClear
              placeholder="Select Quality"
              dropdownStyle={{
                textTransform: "capitalize",
              }}
              style={{
                textTransform: "capitalize",
              }}
              className="min-w-40"
              value={quality}
              onChange={setQuality}
              loading={dropDownQualityLoading}
              options={
                dropDownQualityListRes &&
                dropDownQualityListRes?.rows?.map((item) => ({
                  value: item.id,
                  label: item.quality_name,
                }))
              }
            />
          </Flex>

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
        </Flex>

        <div className="flex items-center justify-end gap-5 mx-3 mb-3 mt-4  ">
          <Flex align="center" gap={10}>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                Sales Return No
              </Typography.Text>
              <Input
                placeholder="Enter sales return no."
                value={saleReturnNo}
                onChange={(e) => setSaleReturnNo(e.target.value)}
              />

              <Button
                icon={<FilePdfOutlined />}
                type="primary"
                disabled={!creditNotesList?.creditNotes?.rows?.length}
                onClick={downloadPdf}
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
          creditNoteTypes={creditNoteTypes}
          creditNoteData={creditNoteData}
        />
      )}

      {isUpdateModalOpen && (
        <UpdateCreditNote
          details={creditNoteData}
          isModalOpen={isUpdateModalOpen}
          setIsModalOpen={setIsUpdateModalOpen}
          creditNoteTypes={creditNoteTypes}
        />
      )}
    </>
  );
};

export default CreditNotes;
