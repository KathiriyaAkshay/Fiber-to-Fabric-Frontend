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
import { useContext, useMemo, useState } from "react";
import { getDropdownSupplierListRequest } from "../../../api/requests/users";
import { useQuery } from "@tanstack/react-query";
import { GlobalContext } from "../../../contexts/GlobalContext";
import PaymentVoucherDetails from "../../../components/accounts/payment/PaymentVoucherDetails";
import ChequeBookModal from "../../../components/accounts/payment/ChequeBookModal";

import { usePagination } from "../../../hooks/usePagination";
import dayjs from "dayjs";
import { getPaymentBillListRequest } from "../../../api/requests/accounts/payment";
import { BILL_VOUCHER_TAG_COLOR } from "../../../constants/tag";
import moment from "moment";
import BillVoucherDetails from "../../../components/accounts/payment/billVocherDetails";

const BillList = () => {
  const { companyId, companyListRes } = useContext(GlobalContext);

  const [bank, setBank] = useState(null);
  const [supplier, setSupplier] = useState(null);
  const [chequeDate, setChequeDate] = useState(null);
  const [voucherDate, setVoucherDate] = useState(null);

  function disabledFutureDate(current) {
    return current && current > moment().endOf("day");
  }

  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const bankOption = useMemo(() => {
    if (companyId && companyListRes) {
      const selectedCompany = companyListRes.rows.find(
        ({ id }) => id === companyId
      );
      if (selectedCompany && selectedCompany?.company_bank_details.length) {
        const bankOption = selectedCompany?.company_bank_details?.map(
          ({ bank_name, id, balance }) => {
            return { label: bank_name, value: id, balance };
          }
        );

        return bankOption;
      } else {
        return [];
      }
    } else {
      return [];
    }
  }, [companyId, companyListRes]);

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

  const { data: paymentBillList, isLoading: isLoadingPaymentList } = useQuery({
    queryKey: [
      "get",
      "payment-bill",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
        bank_id: bank,
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
        bank_id: bank,
        supplier_name: supplier,
      };
      if (chequeDate) {
        params.cheque_date = dayjs(chequeDate).format("YYYY-MM-DD");
      }
      if (voucherDate) {
        params.voucher_date = dayjs(voucherDate).format("YYYY-MM-DD");
      }
      const response = await getPaymentBillListRequest({ params });
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
      title: "Supplier Name",
      dataIndex: ["supplier", "supplier_name"],
      key: "supplier_name",
      render: (text) => {
        return(
          <div style={{
            fontWeight: 600
          }}>
            {String(text).toUpperCase()}
          </div>
        )
      },
    },
    {
      title: "Account Name",
      dataIndex: ["supplier", "supplier_company"],
      key: "account_name",
      render: (text) => {
        return(
          <div style={{
            fontWeight: 600
          }}>
            {String(text).toUpperCase()}
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
      dataIndex: "total_amount",
      key: "total_amount",
    },
    {
      title: "Voucher No.",
      dataIndex: "voucher_no",
      key: "voucher_no",
      render: (text, record) => {
        return(
          <Tag color={BILL_VOUCHER_TAG_COLOR}>
            {text}
          </Tag>
        )
      }
    },
    {
      title: "Voucher Date.",
      dataIndex: "voucher_date",
      key: "createdAt",
      render: (text, record) => {
        return(
          <div>
            {moment(record?.createdAt).format("DD-MM-YYYY")}
          </div>
        )
      }
    },
    {
      title: "Cheque No.",
      dataIndex: "cheque_no",
      key: "cheque_no",
    },
    {
      title: "Cheque Date",
      dataIndex: "cheque_date",
      key: "cheque_date",
      render: (text) => dayjs(text).format("DD-MM-YYYY"),
    },
    {
      title: "Action",
      key: "action",
      render: (details) => (
        <Space>
          <BillVoucherDetails details={details} />
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
        dataSource={paymentBillList?.billPaymentDetails?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          current: page + 1,
          pageSize: pageSize,
          total: paymentBillList?.billPaymentDetails?.count || 0,
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
                <Table.Summary.Cell></Table.Summary.Cell>
                <Table.Summary.Cell>
                  {paymentBillList?.total_amount?.total_amount}
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
          <Typography.Text className="whitespace-nowrap">Bank</Typography.Text>
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
            options={bankOption}
            value={bank}
            onChange={setBank}
          />
        </Flex>
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
          <DatePicker value={chequeDate} onChange={setChequeDate} disabledDate={disabledFutureDate} />
        </Flex>
        <Flex align="center" gap={10}>
          <Typography.Text className="whitespace-nowrap">
            Voucher Date
          </Typography.Text>
          <DatePicker value={voucherDate} onChange={setVoucherDate} disabledDate={disabledFutureDate} />
        </Flex>
        <Button
          icon={<FilePdfOutlined />}
          type="primary"
          disabled={!paymentBillList?.billPaymentDetails?.rows?.length}
          onClick={downloadPdf}
          className="flex-none"
        />
      </Flex>
      {renderTable()}
    </>
  );
};

export default BillList;
