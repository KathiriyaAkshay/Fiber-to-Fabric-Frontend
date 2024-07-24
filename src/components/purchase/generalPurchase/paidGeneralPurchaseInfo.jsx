import { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Typography,
  Row,
  Col,
  Table,
  Flex,
  Divider,
  Tag,
  DatePicker,
} from "antd";
import { UndoOutlined, CloseOutlined } from "@ant-design/icons";
import moment from "moment";

const PaidGeneralPurchaseInfo = ({ details }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [dataSource, setDataSource] = useState([]);

  const columns = [
    {
      title: "Class",
      dataIndex: "class",
      key: "class",
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
    },
    {
      title: "Discount",
      dataIndex: "discount",
      key: "discount",
    },
    {
      title: "Return Amt.",
      dataIndex: "returnAmt",
      key: "returnAmt",
    },
    {
      title: "SGST (%)",
      dataIndex: "sgst",
      key: "sgst",
    },
    {
      title: "CGST (%)",
      dataIndex: "cgst",
      key: "cgst",
    },
    {
      title: "Total GST (%)",
      dataIndex: "totalGst",
      key: "totalGst",
    },
  ];

  useEffect(() => {
    let order = ["GST 28 %", "GST 18 %", "GST 12 %", "GST 5 %", "Other"];
    let temp = [];

    order?.map((element) => {
      details?.general_purchase_entry_details?.map((item) => {
        if (item?.class == element) {
          temp.push(item);
        }
      });
    });
    setDataSource(temp);
  }, [details]);

  return (
    <>
      <Button
        onClick={() => {
          setIsModalOpen(true);
        }}
      >
        <UndoOutlined />
      </Button>

      <Modal
        closeIcon={<CloseOutlined className="text-white" />}
        title={
          <Typography.Text className="text-xl font-medium text-white">
            {"General Purchase Entry Details"}
          </Typography.Text>
        }
        open={isModalOpen}
        footer={null}
        onCancel={() => {
          setIsModalOpen(false);
        }}
        centered={true}
        classNames={{
          header: "text-center",
        }}
        width={"70%"}
        styles={{
          content: {
            padding: 0,
          },
          header: {
            padding: "16px",
            margin: 0,
          },
          body: {
            padding: "10px 16px",
            maxHeight: "80vh",
            overflowY: "auto",
          },
        }}
      >
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <span>Invoice No</span>
            <br />
            <strong>{details?.invoice_no}</strong>
          </Col>
          <Col span={6}>
            <span>Purchase Company</span>
            <br />
            <strong>SONU TEXTILES</strong>
          </Col>
          <Col span={6}>
            <span>Supplier Name</span>
            <br />
            <strong>{details?.supplier?.supplier_name}</strong>
          </Col>
          <Col span={6}>
            <span>Head</span>
            <br />
            <strong>{details?.head}</strong>
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={6}>
            <span>Invoice Date</span>
            <br />
            <strong>
              {moment(details?.invoice_date).format("DD-MM-YYYY")}
            </strong>
          </Col>
          <Col span={6}>
            <span>Grand Total</span>
            <br />
            <strong>{details?.grand_total}</strong>
          </Col>
          <Col span={6}>
            <span>Debitnote Date</span>
            <br />
            <strong>
              <DatePicker />
            </strong>
          </Col>
          <Col span={6}>
            <span>Due date</span>
            <br />
            <strong>{moment(details?.due_date).format("DD-MM=YYYY")}</strong>
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={6}>
            <span>Bill Status</span>
            <br />
            {details?.is_paid ? (
              <Tag color="green">Paid</Tag>
            ) : (
              <Tag color="red">Un-Paid</Tag>
            )}
          </Col>
          <Col span={6}>
            <span>Remark</span>
            <br />
            <strong></strong>
          </Col>
          <Col span={6}>
            <span>Debitnote no.</span>
            <br />
            <strong>1212</strong>
          </Col>
        </Row>
        <Divider />

        <Flex gap={29}>
          <div style={{ width: "65%" }}>
            <Table
              dataSource={dataSource}
              columns={columns}
              pagination={false}
              summary={() => {
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell>Total</Table.Summary.Cell>
                    <Table.Summary.Cell>
                      {details?.sub_total}
                    </Table.Summary.Cell>
                    <Table.Summary.Cell>{details?.discount}</Table.Summary.Cell>
                    <Table.Summary.Cell>0</Table.Summary.Cell>
                    <Table.Summary.Cell>
                      {details?.sgst_payable}
                    </Table.Summary.Cell>
                    <Table.Summary.Cell>
                      {details?.cgst_payable}
                    </Table.Summary.Cell>
                    <Table.Summary.Cell>{details?.main_gst}</Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          </div>
          <div style={{ width: "35%" }}>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={12}>
                <span>Sub Total</span>
                <br />
                <strong>{details?.sub_total}</strong>
              </Col>
              <Col span={12}>
                <span>Discount</span>
                <br />
                <strong>{details?.discount}</strong>
              </Col>
              <Col span={12}>
                <span>Return Amt. Total</span>
                <br />
                <strong>0</strong>
              </Col>
              <Col span={12}>
                <span>SGST Payable (%)</span>
                <br />
                <strong>{details?.main_sgst}</strong>
              </Col>
              <Col span={12}>
                <span>CGST Payable (%)</span>
                <br />
                <strong>{details?.main_cgst}</strong>
              </Col>
              <Col span={12}>
                <span>Round Of</span>
                <br />
                <strong>{details?.round_off}</strong>
              </Col>
              <Col span={12}>
                <span>Grand Total</span>
                <br />
                <strong>{details?.grand_total}</strong>
              </Col>
            </Row>
          </div>
        </Flex>
      </Modal>
    </>
  );
};

export default PaidGeneralPurchaseInfo;
