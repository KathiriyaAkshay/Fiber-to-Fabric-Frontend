import { FilePdfOutlined } from "@ant-design/icons";
import {
  Button,
  Space,
  Table,
  Select,
  DatePicker,
  Flex,
  Typography,
  Spin,
  Tag,
} from "antd";
import { useContext, useState } from "react";
import { getDropdownSupplierListRequest } from "../../../api/requests/users";
import { useQuery } from "@tanstack/react-query";
import { GlobalContext } from "../../../contexts/GlobalContext";
import PaymentVoucherDetails from "../../../components/accounts/payment/PaymentVoucherDetails";
import ChequeBookModal from "../../../components/accounts/payment/ChequeBookModal";
import { usePagination } from "../../../hooks/usePagination";
import dayjs from "dayjs";
import { getCashbookListRequest } from "../../../api/requests/accounts/payment";
import { BILL_VOUCHER_TAG_COLOR, DEPOSITE_TAG_COLOR, WITHDRAW_TAG_COLOR } from "../../../constants/tag";
import CashbookVoucherDetails from "../../../components/accounts/payment/cashbookVoucherDetails";

const CashBookList = () => {
  const { companyId } = useContext(GlobalContext);

  const [supplier, setSupplier] = useState(null);
  const [chequeDate, setChequeDate] = useState(null);
  const [voucherDate, setVoucherDate] = useState(null);

  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

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
      "payment-cash-book",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
        supplier_name: supplier,
        cheque_date: chequeDate,
        voucher_date: voucherDate,
      },
    ],
    queryFn: async () => {
      const params = {
        company_id: companyId,
        page,
        pageSize,
        supplier_name: supplier,
      };
      if (chequeDate) {
        params.cheque_date = dayjs(chequeDate).format("YYYY-MM-DD");
      }
      if (voucherDate) {
        params.voucher_date = dayjs(voucherDate).format("YYYY-MM-DD");
      }
      const response = await getCashbookListRequest({ params });
      return response.data.data;
    },
    enabled: Boolean(companyId),
  });

  const downloadPdf = () => {
    alert("downloadPdf");
  };

  const columns = [
    {
      title: "No.",
      dataIndex: "no",
      key: "no",
      render: (_, record, index) => index + 1,
    },
    {
      title: "Account Name",
      dataIndex: "account_name",
      key: "account_name",
      render: (text, record) => {
        return(
          <div style={{
            fontWeight: 600
          }}>
            {String(record?.particular_type).toUpperCase()}
          </div>
        )
      },
    },
    // {
    //   title: "Company Name",
    //   dataIndex: "company_name",
    //   key: "company_name",
    // },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (text, { is_withdraw }) => {
        return (
          <span>
            {text} <br />
            <Tag color={is_withdraw?WITHDRAW_TAG_COLOR:DEPOSITE_TAG_COLOR}>{is_withdraw ? "Withdrawals" : "Deposite"}</Tag>
          </span>
        );
      },
    },
    {
      title: "Voucher No.",
      dataIndex: "voucher_no",
      key: "voucher_no",
      render: (text, record) => {
        return(
          <Tag color = {BILL_VOUCHER_TAG_COLOR}>
            {text}
          </Tag>
        )
      }
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
      render: (text, record) => {
        return(
          <div>-</div>
        )
      }
    },
    {
      title: "Cheque Date",
      dataIndex: "cheque_date",
      key: "cheque_date",
      render: (text, record) => {
        return(
          <div>-</div>
        )
      },
    },
    {
      title: "Action",
      key: "action",
      render: (details) => (
        <Space>
          <CashbookVoucherDetails details={details} />
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
        dataSource={paymentList?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          current: page + 1,
          pageSize: pageSize,
          total: paymentList?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
        summary={() => {
          return (
            <Table.Summary>
              <Table.Summary.Row>
                <Table.Summary.Cell>Total</Table.Summary.Cell>
                <Table.Summary.Cell></Table.Summary.Cell>
                <Table.Summary.Cell>{parseFloat(paymentList?.totalAmount).toFixed(2)}</Table.Summary.Cell>
                <Table.Summary.Cell>
                </Table.Summary.Cell>
                <Table.Summary.Cell></Table.Summary.Cell>
                <Table.Summary.Cell></Table.Summary.Cell>
                <Table.Summary.Cell></Table.Summary.Cell>
                <Table.Summary.Cell></Table.Summary.Cell>
                <Table.Summary.Cell></Table.Summary.Cell>
                {/* <Table.Summary.Cell></Table.Summary.Cell> */}
              </Table.Summary.Row>
            </Table.Summary>
          );
        }}
      />
    );
  }

  return (
    <>
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
          disabled={!paymentList?.rows?.length}
          onClick={downloadPdf}
          className="flex-none"
        />
      </Flex>
      {renderTable()}
    </>
  );
};

export default CashBookList;
