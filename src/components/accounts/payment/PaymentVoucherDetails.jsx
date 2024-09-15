import { EyeOutlined } from "@ant-design/icons";
import { Button, Col, Flex, Modal, Row, Table } from "antd";
import dayjs from "dayjs";
import { useState } from "react";

const dataSourcePayment = [
  {
    no: "1",
  },
];

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

const PaymentVoucherDetails = ({ details }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
        scroll={{ y: 330 }}
        pagination={{
          total: 0,
          showSizeChanger: true,
          //   onShowSizeChange: onShowSizeChange,
          //   onChange: onPageChange,
        }}
        summary={() => {
          return (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0}>
                <b>Total</b>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={0}>
                <b>1</b>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>

              <Table.Summary.Cell index={0}>
                <b>1123</b>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={0}>
                <b>1124513</b>
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
      >
        <div className="font-semibold text-lg mb-3">
          Payment Voucher Details
        </div>
        <Row gutter={6}>
          <Col span={6}>
            <Flex justify="center">
              <div className="w-1/2 text-left font-semibold">Voucher No</div>
              <div className="w-1/2 text-left">{details?.voucher_no}</div>
            </Flex>
          </Col>
          <Col span={6}>
            <Flex justify="space-evenly">
              <div className="w-1/2 text-left font-semibold">Cheque No</div>
              <div className="w-1/2 text-left">{details?.cheque_no}</div>
            </Flex>
          </Col>{" "}
          <Col span={6}>
            <Flex justify="space-evenly">
              <div className="w-1/2 text-left font-semibold">Supplier Name</div>
              <div className="w-1/2 text-left">
                {details?.supplier?.supplier_name}
              </div>
            </Flex>
          </Col>{" "}
          <Col span={6}>
            <Flex justify="space-evenly">
              <div className="w-1/2 text-left font-semibold">Company Name</div>
              <div className="w-1/2 text-left">Sonu Textiles</div>
            </Flex>
          </Col>
        </Row>
        <Row className="mt-2" gutter={6}>
          <Col span={6}>
            <Flex justify="center">
              <div className="w-1/2 text-left font-semibold">Voucher Date</div>
              <div className="w-1/2 text-left">
                {dayjs(details?.voucher_date).format("DD-MM-YYYY")}
              </div>
            </Flex>
          </Col>
          <Col span={6}>
            <Flex justify="space-evenly">
              <div className="w-1/2 text-left font-semibold">Cheque Date</div>
              <div className="w-1/2 text-left">
                {dayjs(details?.cheque_date).format("DD-MM-YYYY")}
              </div>
            </Flex>
          </Col>{" "}
          <Col span={6}>
            <Flex justify="space-evenly">
              <div className="w-1/2 text-left font-semibold">Account Name</div>
              <div className="w-1/2 text-left">***</div>
            </Flex>
          </Col>{" "}
          <Col span={6}>
            <Flex justify="space-evenly">
              <div className="w-1/2 text-left font-semibold">Bank Name</div>
              <div className="w-1/2 text-left">
                {details?.company_bank_detail?.bank_name}
              </div>
            </Flex>
          </Col>
        </Row>
        <Row className="mt-2">
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
        </Row>
        {renderPaymentTable()}
      </Modal>
    </>
  );
};

export default PaymentVoucherDetails;
