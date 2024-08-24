import { FilePdfOutlined, PlusCircleOutlined } from "@ant-design/icons";
import {
  Button,
  Radio,
  Space,
  Table,
  Select,
  DatePicker,
  Flex,
  Typography,
  Spin,
} from "antd";
import { useContext, useState } from "react";
import { getDropdownSupplierListRequest } from "../../api/requests/users";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { GlobalContext } from "../../contexts/GlobalContext";
import PaymentVoucherDetails from "../../components/accounts/payment/PaymentVoucherDetails";
import ChequeBookModal from "../../components/accounts/payment/ChequeBookModal";
import { PAYMENT_OPTIONS } from "../../constants/account";
import { getPassbookListRequest } from "../../api/requests/accounts/payment";
import { usePagination } from "../../hooks/usePagination";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const paymentOptions = [
  { label: "Bill", value: "bill" },
  { label: "Passbook Update", value: "passbook_update" },
  { label: "Cashbook Update", value: "cashbook_update" },
  { label: "Journal", value: "journal" },
];

const Payment = () => {
  const navigate = useNavigate();
  const [paymentFilter, setPaymentFilter] = useState("bill");
  const { companyId } = useContext(GlobalContext);
  const [supplier, setSupplier] = useState(null);
  const [chequeDate, setChequeDate] = useState(null);
  const [voucherDate, setVoucherDate] = useState(null);

  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const changePaymentFilterHandler = ({ target: { value } }) => {
    setPaymentFilter(value);
  };

  const navigateToAdd = () => {
    navigate("add");
  };

  const {
    data: dropdownSupplierListRes,
    isLoading: isLoadingDropdownSupplierList,
  } = useQuery({
    queryKey: ["dropdown/supplier/list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getDropdownSupplierListRequest({
        params: { company_id: companyId },
      });
      return res.data?.data?.supplierList;
    },
    enabled: Boolean(companyId),
  });

  const { data: paymentList, isLoading: isLoadingPaymentList } = useQuery({
    queryKey: [
      "get",
      "payment",
      "list",
      { company_id: companyId, paymentFilter },
    ],
    queryFn: async () => {
      let response;
      let params = { company_id: companyId, page, pageSize };
      switch (paymentFilter) {
        case PAYMENT_OPTIONS.bill:
          console.log(PAYMENT_OPTIONS.bill);
          return response;

        case PAYMENT_OPTIONS.passbook_update:
          response = await getPassbookListRequest({ params });
          return response.data.data;

        case PAYMENT_OPTIONS.cashbook_update:
          console.log(PAYMENT_OPTIONS.cashbook_update);
          return response;

        case PAYMENT_OPTIONS.journal:
          console.log(PAYMENT_OPTIONS.journal);
          return response;

        default:
          break;
      }
    },
    enabled: Boolean(companyId),
    placeholderData: keepPreviousData,
  });

  const columns = [
    {
      title: "No.",
      dataIndex: "no",
      key: "no",
      render: (_, record, index) => index + 1,
    },
    {
      title: "Supplier Name",
      dataIndex: "supplier_name",
      key: "supplier_name",
      render: (text) => text || "-",
    },
    {
      title: "Account Name",
      dataIndex: "account_name",
      key: "account_name",
      render: (text) => text || "-",
    },
    {
      title: "Company Name",
      dataIndex: "company_name",
      key: "company_name",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Voucher No.",
      dataIndex: "voucher_no",
      key: "voucher_no",
    },
    {
      title: "Voucher Date.",
      dataIndex: "voucher_date",
      key: "voucher_date",
      render: (text) => (text ? dayjs(text).format("DD-MM-YYYY") : "-"),
    },
    {
      title: "Cheque No.",
      dataIndex: "cheque_no",
      key: "cheque_no",
    },
    {
      title: "Cheque Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => dayjs(text).format("DD-MM-YYYY"),
    },
    {
      title: "Action",
      key: "action",
      render: (details) => (
        <Space>
          <PaymentVoucherDetails details={details} />
          <ChequeBookModal details={details} />
        </Space>
      ),
    },
  ];

  function renderTable() {
    if (isLoadingPaymentList) {
      return (
        <Spin tip="Loading" size="large">
          <div className="p-14" />
        </Spin>
      );
    }

    return (
      <Table
        dataSource={paymentList?.passbookAudit || []}
        columns={columns}
        rowKey={"id"}
        scroll={{ y: 330 }}
        pagination={{
          total: paymentList?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary">Payment Voucher List</h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>
        <div>
          <Radio.Group
            options={paymentOptions}
            onChange={changePaymentFilterHandler}
            value={paymentFilter}
          />
        </div>
      </div>
      <Flex align="center" justify="flex-end" gap={10}>
        <Flex align="center" gap={10}>
          <Typography.Text className="whitespace-nowrap">
            Supplier
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
            loading={isLoadingDropdownSupplierList}
            options={dropdownSupplierListRes?.map((supervisor) => ({
              label: supervisor?.supplier_name,
              value: supervisor?.supplier_name,
            }))}
            value={supplier}
            onChange={setSupplier}
          />
        </Flex>
        <Flex align="center" gap={10}>
          <Typography.Text className="whitespace-nowrap">
            Cheque Date
          </Typography.Text>
          <DatePicker value={chequeDate} onChange={setChequeDate} />
        </Flex>
        <Flex align="center" gap={10}>
          <Typography.Text className="whitespace-nowrap">
            Voucher Date
          </Typography.Text>
          <DatePicker value={voucherDate} onChange={setVoucherDate} />
        </Flex>
        <Button
          icon={<FilePdfOutlined />}
          type="primary"
          //   disabled={!saleChallanReturnList?.rows?.length}
          //   onClick={downloadPdf}
          className="flex-none"
        />
      </Flex>
      {renderTable()}
    </div>
  );
};

export default Payment;
