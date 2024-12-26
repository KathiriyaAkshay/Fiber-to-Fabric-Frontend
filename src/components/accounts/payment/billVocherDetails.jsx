import { EyeOutlined } from "@ant-design/icons";
import { Button, Col, Descriptions, Flex, Modal, Row, Table, Tag, Tooltip } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { WITHDRAW_TAG_COLOR, DEPOSITE_TAG_COLOR } from "../../../constants/tag";
import moment from "moment";
import { generatePurchaseBillDueDate, generateJobBillDueDate } from "../../../pages/accounts/reports/utils";

const dataSourcePayment = [];

function calculateDaysDifference(dueDate) {
    const today = new Date(); // Get today's date
    const [day, month, year] = dueDate.split('-');
    const due = new Date(year, month - 1, day);
    const timeDifference = today - due; // Difference in milliseconds
    const dayDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
    return dayDifference;
  }

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
    render: (text, record) => {
        let final_amount = 0; 
        let net_amount = +record?.net_amount;
        final_amount = net_amount ;  
        let tds_amount = +record?.tds ;
        final_amount -= tds_amount ;  
        let plus_amount = (net_amount*(+record?.plus_percentage)) / 100 ; 
        final_amount += plus_amount ; 
        let less_amount = (net_amount*(+record?.less_percentage)) / 100 ; 
        final_amount -= less_amount ; 
        
        return(
            <div>
                {text} <strong>({final_amount})</strong>
            </div>
        )
    }
  },
  {
    title: "Bill Date",
    dataIndex: "bill_date",
    key: "bill_date",
    render: (text, record) => {
        return(
            <div>
                {moment(text).format("DD-MM-YYYY")}
            </div>
        )
    }
  },
  {
    title: "Due Days",
    dataIndex: "due_days",
    key: "due_days",
    render: (text, record) => {
        return(
            <div style={{
                fontWeight: 600,
                color: "red"
            }}>
                +{text}D
            </div>
        )
    }
  },
  {
    title: "TDS" , 
    dataIndex: "tds"

  }, 
  {
    title: "Less",
    dataIndex: "less",
    key: "less",
    render: (text, record) => {
        let final_amount = 0; 
        let net_amount = +record?.net_amount;
        final_amount = net_amount ;  
        let tds_amount = +record?.tds ;
        final_amount -= tds_amount ;  
        let plus_amount = (net_amount*(+record?.plus_percentage)) / 100 ; 
        final_amount += plus_amount ; 
        let less_amount = (net_amount*(+record?.less_percentage)) / 100 ; 
        final_amount -= less_amount ; 
        return(
            <Tooltip title = {less_amount}>
                <div style={{
                    fontWeight: 600, 
                    color: "red"
                }}>
                    {text}
                </div>
            </Tooltip>
        )
    }
  },
  {
    title: "Plus",
    dataIndex: "plus",
    key: "plus",
    render: (text, record) => {
        let final_amount = 0; 
        let net_amount = +record?.net_amount;
        final_amount = net_amount ;  
        let tds_amount = +record?.tds ;
        final_amount -= tds_amount ;  
        let plus_amount = (net_amount*(+record?.plus_percentage)) / 100 ; 
        final_amount += plus_amount ; 
        let less_amount = (net_amount*(+record?.less_percentage)) / 100 ; 
        final_amount -= less_amount ; 
        return(
            <Tooltip title = {plus_amount}>
                <div style={{
                    fontWeight: 600,
                    color: "green"
                }}>
                    {text}
                </div>
            </Tooltip>
        )
    }
  },
];

const BillVoucherDetails = ({ details }) => {
  console.log(details);
  
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

  const [data, setData] = useState([]);
  const [total, setTotal] = useState({}) ; 

  useEffect(() => {
    if (details){
        let tempData = [] ; 
        let totalBillAmount = 0; 
        let totalNetAmount = 0; 

        details?.bill_payments?.map((element, index) => {
            let model = element?.model ; 
            let dueDate = element?.due_date == null?
                element?.model == "purchase_taka_bills"?generatePurchaseBillDueDate(element?.bill_date):
                generateJobBillDueDate(element?.bill_date)
                :moment(element?.due_date).format("DD-MM-YYYY") ;
            
            const dueDays = element?.model == "credit_notes"?0:calculateDaysDifference(dueDate)
        
            tempData.push({
                no: index + 1, 
                bill_no: element?.bill_no,
                type: model == "purchase_taka_bills" ? "PURCHASE TAKA" :
                    model == "yarn_bills" ? "YARN" :
                    model == "receive_size_beam_bill" ? "BEAM PURCHASE" :
                    model == "credit_notes" ? "CREDIT NOTE" :
                    model == "job_rework_bill" ? "JOB REWORK" : "JOB BILL", 
                bill_amount: element?.amount || "0", 
                net_amount: element?.net_amount || "0",
                bill_date: moment(element?.bill_date).format("DD-MM-YYYY"), 
                due_days: dueDays,
                tds: element?.tds,
                less: element?.less_percentage, 
                plus: element?.plus_percentage, 
                ...element
            })
            totalBillAmount += +element?.amount || 0; 
            totalNetAmount += element?.net_amount || 0 ; 
        })
        setData(tempData); 
        setTotal({
            "bill_amount": totalBillAmount, 
            "net_amount": totalNetAmount
        })
    }
  }, [details])

  function renderPaymentTable() {
    return (
      <Table
        dataSource={data || []}
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
              </Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}>
                {parseFloat(total?.bill_amount).toFixed(2) || 0}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={0}>
                {parseFloat(total?.net_amount).toFixed(2) || 0}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>

              <Table.Summary.Cell index={1}></Table.Summary.Cell>
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
          
          <Descriptions.Item label="Cheque No">{details?.cheque_no}</Descriptions.Item>
          <Descriptions.Item label="Supplier Name">{details?.supplier?.supplier_name}</Descriptions.Item>
          <Descriptions.Item label="Company Name">{details?.supplier?.supplier_company}</Descriptions.Item>

          {/* Voucher date information  */}
          <Descriptions.Item label="Voucher Date">{dayjs(details?.voucher_date).format("DD-MM-YYYY")}</Descriptions.Item>
          <Descriptions.Item label="Cheque Date">{dayjs(details?.createdAt).format("DD-MM-YYYY")}</Descriptions.Item>
          <Descriptions.Item label="Account Name">
            KEYUR VAGHASIYA
          </Descriptions.Item>
          <Descriptions.Item label="Bank Name">{details?.company_bank_detail?.bank_name}</Descriptions.Item>
          <Descriptions.Item label="Amount">
            {details?.total_amount}
          </Descriptions.Item>          
          <Descriptions.Item label="Remark">{details?.remark}</Descriptions.Item>
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

export default BillVoucherDetails;
