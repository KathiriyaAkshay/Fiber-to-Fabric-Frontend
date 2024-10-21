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
import { getPartyListRequest } from "../../../api/requests/users";
import { getInHouseQualityListRequest } from "../../../api/requests/qualityMaster";
import dayjs from "dayjs";

const CREDIT_NOTE_TYPES = [
  { label: "Sale Return", value: "sale_return" },
  { label: "Late Payment", value: "late_payment" },
  { label: "Claim Note", value: "claim" },
  { label: "Discount Note", value: "discount" },
  { label: "Other", value: "other" },
  // { label: "All", value: "all" },
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

  // Partylist dropdown
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
        },
      ],
      queryFn: async () => {
        const params = {
          company_id: companyId,
          page,
          pageSize,
          credit_note_type: creditNoteTypes,
        };
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
    },
    {
      title: "Challan/Bill",
      dataIndex: "challan",
      key: "challan",
    },
    {
      title: "Quality/Denier",
      dataIndex: "inhouse_quality",
      key: "inhouse_quality",
      render: (text) => {
        return `${text?.quality_name || ""} (${text?.quality_weight || ""}KG)`;
      },
    },
    // {
    //   title: "Firm Name",
    //   dataIndex: "firm_name",
    //   key: "firm_name",
    // },
    {
      title: "Party Name",
      dataIndex: ["party", "checker_name"],
      key: ["party", "checker_name"],
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
      render: (text) => text || 0,
    },
    {
      title: "Net Amount",
      dataIndex: "net_amount",
      key: "net_amount",
    },
    {
      title: "Type",
      dataIndex: "credit_note_type",
      key: "credit_note_type",
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
        />
      )}
    </>
  );
};

export default CreditNotes;
