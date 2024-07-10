import React, { useState, useEffect } from "react";
import { Button, Modal, Typography, Row, Col, Table, Card, Flex, Divider, Tag } from "antd";
import { EyeOutlined, CloseOutlined } from "@ant-design/icons";
import moment from "moment";

const GeneralPurchaseInfo = ({ details }) => {

    const [isModalOpen, setIsModalOpen] = useState(false);

    const columns = [
        {
            title: 'No.',
            dataIndex: 'no',
            key: 'no',
            render: (text, record, index) => (index + 1)

        },
        {
            title: 'Code',
            dataIndex: 'code',
            key: 'code',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'HSN Code',
            dataIndex: 'hsn_code',
            key: 'hsnCode',
        },
        {
            title: 'Pcs',
            dataIndex: 'pis',
            key: 'pcs',
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (text) => text || '--',
        },
        {
            title: 'Rate',
            dataIndex: 'rate',
            key: 'rate',
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
        },
    ];

    const gstInfoColumns = [
        {
            title: 'Class',
            dataIndex: 'class',
            key: 'class',
        },
        {
            title: 'Total',
            dataIndex: 'total',
            key: 'total',
        },
        {
            title: 'Discount',
            dataIndex: 'discount',
            key: 'discount',
        },
        {
            title: 'SGST ( % )',
            dataIndex: 'sgst',
            key: 'sgst',
        },
        {
            title: 'CGST ( % )',
            dataIndex: 'cgst',
            key: 'cgst',
        },
        {
            title: 'Total GST ( % )',
            dataIndex: 'total_gst',
            key: 'totalGst',
        },
    ];

    const [totalPics, setTotalPics] = useState(0) ; 
    const [totalQuantity, setTotalQuantity] = useState(0) ; 
    const [totalAmount, setTotalAmount] = useState(0) ; 

    useEffect(() => {
        let tempPics = 0 ;
        let tempQuantity = 0 ; 
        let tempAmount = 0 ; 

        details?.general_purchase_millgines?.map((element) => {
            tempPics = tempPics + Number(element?.pis) ; 
            tempQuantity = tempQuantity + Number(element?.quantity) ; 
            tempAmount = tempAmount + Number(element?.amount) ; 
        })
        setTotalPics(tempPics) ; 
        setTotalQuantity(tempQuantity) ; 
        setTotalAmount(tempAmount) ; 

    }, [details]) ; 


    return (
        <>
            <Button type="primary" onClick={() => { setIsModalOpen(true) }}>
                <EyeOutlined />
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
                onCancel={() => { setIsModalOpen(false) }}
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
                        overflowY: "auto"
                    },
                }}
            >
                <div className="container">
                    <Card>
                        <Row gutter={16}>
                            <Col span={8}><strong>Invoice No</strong>: {details?.invoice_no}</Col>
                            <Col span={8}><strong>Purchase Company</strong>: {"Yarn company"}</Col>
                            <Col span={8}><strong>Head</strong>: {details?.head}</Col>
                        </Row>
                        <Row gutter={16} style={{ marginTop: 10 }}>
                            <Col span={8}><strong>Invoice Date</strong>: {moment(details?.invoice_date).format("DD-MM-YYYY")}</Col>
                            <Col span={8}><strong>Supplier Name</strong>: {details?.supplier?.supplier_name}</Col>
                            <Col span={8}><strong>Grand Total</strong>: {details?.grand_total}</Col>
                        </Row>
                        <Row gutter={16} style={{ marginTop: 10 }}>
                            <Col span={8}><strong>Due date</strong>: {moment(details?.due_date).format("DD-MM-YYYY")}</Col>
                            <Col span={8}><strong>Bill Status</strong>: <span style={{ color: 'red' }}>
                                    {details?.is_paid?<Tag color="green">Paid</Tag>:<Tag color="red">Un-Paid</Tag>}
                                </span></Col>
                        </Row>
                        <Row style={{ marginTop: 10 }}>
                            <Col span={24}><strong>Remark</strong>: {details?.remark}</Col>
                        </Row>
                    </Card>

                    {details?.is_millgine_bill && (
                        <>
                            <Table
                                columns={columns}
                                dataSource={details?.general_purchase_millgines}
                                pagination={false}
                                rowKey="no"
                                style={{ marginTop: 20 }}
                                summary={() => (
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell>Total</Table.Summary.Cell>
                                        <Table.Summary.Cell></Table.Summary.Cell>
                                        <Table.Summary.Cell></Table.Summary.Cell>
                                        <Table.Summary.Cell></Table.Summary.Cell>
                                        <Table.Summary.Cell>{totalPics}</Table.Summary.Cell>
                                        <Table.Summary.Cell>{totalQuantity}</Table.Summary.Cell>
                                        <Table.Summary.Cell></Table.Summary.Cell>
                                        <Table.Summary.Cell>{totalAmount}</Table.Summary.Cell>
                                    </Table.Summary.Row>
                                )}
                            />

                            
                        </>
                    )}


                    <Row gutter={16} style={{ marginTop: 20 }}>
                        <Col span={6}></Col>
                        <Col span={6}></Col>
                        <Col span={6}><strong>Discount</strong>: {details?.discount}</Col>
                        <Col span={6}><strong>Final Amount</strong>: {details?.sub_total}</Col>
                    </Row>
                </div>
                
                <Divider style={{marginTop:10}} />

                <div>
                    <Flex gap={20} style={{ marginTop: 20 }}>

                        <div style={{ width: "60%" }}>
                            <Table
                                columns={gstInfoColumns}
                                dataSource={details?.general_purchase_entry_details}
                                pagination={false}
                                summary={() => (
                                    <>
                                        <Table.Summary.Row>
                                            <Table.Summary.Cell>Total</Table.Summary.Cell>
                                            <Table.Summary.Cell index={1}>
                                                {details?.sub_total}
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={2}>
                                                {details?.discount}
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={3}>
                                                {details?.sgst_payable}
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={4}>
                                                {details?.cgst_payable}
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={5}>
                                                {details?.main_gst}
                                            </Table.Summary.Cell>
                                        </Table.Summary.Row>
                                    </>
                                )}
                            />
                        </div>

                        <div style={{ width: '40%' }}>
                            <Row gutter={16}>
                                <Col span={24}>
                                    <div >
                                        <table style={{ width: '100%' }}>
                                            <tbody>
                                                <tr style={{backgroundColor: "#efefef", padding: "4px"}}>
                                                    <td style={{ textAlign: "left" }}>
                                                        <strong>Sub total</strong>
                                                    </td>
                                                    <td align="right">{details?.sub_total}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ textAlign: "left" }}>
                                                        <strong>Discount</strong>
                                                    </td>
                                                    <td align="right">{details?.discount}</td>
                                                </tr>
                                                <tr style={{backgroundColor: "#efefef", padding: "4px"}}>
                                                    <td style={{ textAlign: "left" }}>
                                                        <strong>SGST Payable ( % )</strong>
                                                    </td>
                                                    <td align="right">{details?.main_sgst}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ textAlign: "left" }}>
                                                        <strong>CGST Payable ( % )</strong>
                                                    </td>
                                                    <td align="right">{details?.cgst_payable}</td>
                                                </tr>
                                                <tr style={{backgroundColor: "#efefef", padding: "4px"}}>
                                                    <td style={{ textAlign: "left" }}>
                                                        <strong>Round Of</strong>
                                                    </td>
                                                    <td align="right">{details?.round_off}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ fontWeight: 'bold', textAlign: "left" }}>Grand Total</td>
                                                    <td align="right" style={{ fontWeight: 'bold' }}>{details?.grand_total}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </Col>
                            </Row>
                        </div>

                    </Flex>
                </div>

            </Modal>
        </>
    )
}

export default GeneralPurchaseInfo; 