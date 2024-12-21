import { EyeOutlined } from "@ant-design/icons";
import { Button, Col, Descriptions, Flex, Modal, Row, Table, Tag } from "antd";
import dayjs from "dayjs";
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { DEPOSITE_TAG_COLOR, WITHDRAW_TAG_COLOR } from "../../../constants/tag";

const dataSourcePayment = [];

const columnsPayment = [
  {
    title: "No.",
    dataIndex: "no",
    key: "no",
  },
  {
    title: "Bill no",
    dataIndex: "bill_no",
    key: "bill_no",
  },
  {
    title: "Type",
    dataIndex: "type",
    key: "type",
  },
  {
    title: "Bill Amount",
    dataIndex: "bill_amount",
    key: "bill_amount",
  },
  {
    title: "Net Amount",
    dataIndex: "net_amount",
    key: "net_amount",
  },
  {
    title: "Bill Date",
    dataIndex: "bill_date",
    key: "bill_date",
  },
  {
    title: "Due Days",
    dataIndex: "due_days",
    key: "due_days",
  },
  {
    title: "Less",
    dataIndex: "less",
    key: "less",
  },
  {
    title: "Plus",
    dataIndex: "plus",
    key: "plus",
  },
];

const CashbookVoucherDetails = ({ details }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {companyListRes} = useContext(GlobalContext) ; 
  const [companyInfo, setCompanyInfo] = useState(undefined) ; 

  useEffect(() => {
    if (isModalOpen){
        let data = companyListRes?.rows?.find((element) => element?.id == details?.company_id) ; 
        setCompanyInfo(data) ; 
    }
  },[isModalOpen]) ; 
  
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  function renderPaymentTable() {
    return (
      <Table
        dataSource={dataSourcePayment || []}
        columns={columnsPayment}
        rowKey={"id"}
        className="mt-3"
        pagination = {false}
        summary={() => {
          return (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0}>
                <b>Total</b>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={0}>
                <b></b>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>

              <Table.Summary.Cell index={0}>
                <b>0</b>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={0}>
                <b>0</b>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>

              <Table.Summary.Cell index={1}></Table.Summary.Cell>
              <Table.Summary.Cell index={1}></Table.Summary.Cell>
            </Table.Summary.Row>
          );
        }}
      />
    );
  }

  return (
    <>
      <Button type="primary" onClick={() => showModal()}>
        <EyeOutlined />
      </Button>

      <Modal
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width={"85%"}
        centered
        footer = {null}
      >
        <Descriptions
          bordered
          column={4}
          title="Payment Voucher Details"
          className="payment-voucher-model"
          style={{ marginBottom: "20px" }}
        >

          {/* Voucher number information  */}
          <Descriptions.Item label="Voucher No">{details?.voucher_no}</Descriptions.Item>
          
          <Descriptions.Item label="Cheque No">{"--"}</Descriptions.Item>
          {/* <Descriptions.Item label="Supplier Name">{String(details?.from_particular).toUpperCase()}</Descriptions.Item> */}
          <Descriptions.Item label="Company Name">{companyInfo?.company_name}</Descriptions.Item>

          {/* Voucher date information  */}
          <Descriptions.Item label="Voucher Date">{dayjs(details?.voucher_date).format("DD-MM-YYYY")}</Descriptions.Item>
          <Descriptions.Item label="Cheque Date">--</Descriptions.Item>
          {/* <Descriptions.Item label="Account Name">
            {String(details?.to_particular).toUpperCase()}
          </Descriptions.Item> */}
          <Descriptions.Item label="Bank Name">{details?.company_bank_detail?.bank_name || "--"}</Descriptions.Item>
          <Descriptions.Item label="Amount">
            <Tag color = {details?.is_withdraw?WITHDRAW_TAG_COLOR:DEPOSITE_TAG_COLOR}>
                {details?.amount}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Remark">{details?.remark || "-"}</Descriptions.Item>
        </Descriptions>
        {/* <Row className="mt-2">
          <Col span={6}>
            <Flex justify="center">
              <div className="w-1/2 text-left font-semibold">Amount</div>
              <div className="w-1/2 text-left">{details?.total_amount}</div>
            </Flex>
          </Col>
          <Col span={18}>
            <Flex justify="center">
              <div className="w-1/2 text-left font-semibold">Remark</div>
              <div className="w-1/2 text-left">{details?.remark}</div>
            </Flex>
          </Col>
        </Row> */}
        {renderPaymentTable()}
      </Modal>
    </>
  );
};

export default CashbookVoucherDetails;
