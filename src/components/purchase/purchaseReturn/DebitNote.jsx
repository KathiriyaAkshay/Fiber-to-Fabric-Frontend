import { CloseOutlined, FileOutlined } from '@ant-design/icons'
import { Button, Modal, Table, Typography, Row, Col, Flex } from 'antd'
import React, { useRef, useState } from 'react'
import ReactToPrint from "react-to-print";
import logo from './../../../assets/png/debit_icon.png'
const { Text } = Typography;
const DebitNote = ({ details }) => {

    const [isModelOpen, setIsModalOpen] = useState(false);
    const componentRef = useRef();
    const pageStyle = `
    @media print {
         .print-instructions {
            display: none;
        }
        .printable-content {
            padding: 20px; /* Add padding for print */
            width: 100%;
        }
`;

    const columns = [
        { title: 'S. NO', dataIndex: 'sno', key: 'sno', align: 'center' },
        { title: 'TOTAL TAKA', dataIndex: 'totalTaka', key: 'totalTaka', align: 'center' },
        { title: 'TOTAL METER', dataIndex: 'totalMeter', key: 'totalMeter', align: 'center' },
        { title: 'RATE', dataIndex: 'rate', key: 'rate', align: 'center' },
        { title: 'AMOUNT', dataIndex: 'amount', key: 'amount', align: 'center' },
    ];

    const data = [
        { key: 1, sno: 1, totalTaka: 1, totalMeter: 5, rate: 12, amount: 60.00 },
    ];

    return (
        <>
            <Button
                // type="primary"
                onClick={() => {
                    setIsModalOpen(true);
                }}
            >
                <FileOutlined />
            </Button>

            <Modal
                closeIcon={<CloseOutlined className="text-white" />}
                title={
                    <Typography.Text className="text-xl font-medium text-white">
                        Debit Note
                    </Typography.Text>
                }
                open={isModelOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                }}
                centered={true}
                classNames={{
                    header: "text-center",
                }}
                styles={{
                    content: {
                        padding: 0,
                    },
                    header: {
                        padding: "16px",
                        margin: 0,
                    },
                    body: {
                        padding: "16px 32px",
                        maxHeight: "75vh",
                        overflowY: "auto",
                    },
                    footer: {
                        paddingBottom: 10,
                        paddingRight: 10,
                        backgroundColor: "#efefef",
                    },
                }}
                footer={() => {
                    return (
                        <>
                            <ReactToPrint
                                trigger={() => (
                                    <Flex>
                                        <Button
                                            type="primary"
                                            style={{ marginLeft: "auto", marginTop: 15 }}
                                        >
                                            PRINT
                                        </Button>
                                    </Flex>
                                )}
                                content={() => componentRef.current}
                                pageStyle={pageStyle}
                            />
                        </>
                    );
                }}
                width={"70vw"}
            >
                <div className='debitnote-wrapper' ref={componentRef}>
                    {/* first component */}
                    <div className='text-center relative border-b border-black'>
                        <span className='align-left absolute left-1 h-full'>
                            <img src={logo} height="100%" width="100%" />
                        </span>
                        <span className='align-center'>
                            <Typography.Title level={2}>Debit Note</Typography.Title>
                        </span>
                    </div>
                    {/* second div */}
                    {/* <Row className='debitnote-sec'>
                        <Col span={12} className='h-full'>

                            <Flex vertical className='border-top border-right h-full'>
                                <div className='border-bottom'>
                                    Company Name : XRZ
                                </div>
                                <div className='border-bottom'>
                                    Party :  POWER_COmpany
                                    232553
                                </div>
                            </Flex>
                        </Col>
                        <Col span={12}>
                            <div>
                                <div>
                                    <div>Debit Note No. :-
                                        DD-11
                                    </div>
                                    <div>
                                        Dated :-
                                        24-07-2024
                                    </div>
                                </div>
                                <div>

                                    <div>Buyer's Ref. :-
                                        2422

                                        Date :-
                                        20-07-2024
                                    </div>
                                    <div>
                                        Buyer's Order No. :-
                                        32
                                    </div>

                                </div>
                                <div>
                                    DESCRIPTION OF GOODS :
                                    33P PALLU PATERN (SDFSDFSDFSDFSDFSD) - (8KG)
                                </div>
                                <div>
                                    <div>HSN :-
                                        574</div>
                                    <div>
                                        PAN NO :-
                                        ABHPP6021C
                                    </div>

                                </div>
                            </div>
                        </Col>
                    </Row> */}
                    <table className="w-full table-custom border border-collaps">
                        <tbody>
                            <tr>
                                <td className="border border-gray-400 p-2" colSpan={3}>
                                    <strong>Company Name :-</strong> SONU TEXTILES
                                </td>
                                <td className="border border-gray-400 p-2" >
                                    <strong>Debit Note No. :-</strong> DD-11
                                </td>
                                <td className="border border-gray-400 p-2">
                                    <strong>Dated :-</strong> 24-07-2024
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-gray-400 p-2" rowSpan={3} colSpan={3}>
                                    <strong>Party :-</strong> POWER_COMPANY
                                    <br />
                                    23423
                                </td>
                                <td className="border border-gray-400 p-2">
                                    <strong>Buyer's Ref. :-</strong> 2422
                                    <br />
                                    <strong>Date :-</strong> 20-07-2024
                                </td>

                                <td className="border border-gray-400 p-2">
                                    <strong>Buyer's Order No. :-</strong> 32
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-gray-400 p-2" colSpan="3">
                                    <strong>DESCRIPTION OF GOODS :-</strong> 33P PALLU PATTERN (8KG)
                                </td>

                            </tr>
                            <tr>
                                <td className="border border-gray-400 p-2">
                                    <strong>HSN :-</strong> 574
                                </td>
                                <td className="border border-gray-400 p-2" colSpan="4">
                                    <strong>PAN NO :-</strong> ABHPF6021C
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={5}></td>

                            </tr>
                            <tr>
                                <td className="border border-gray-400 p-2" colSpan="1">
                                    <strong>S. NO-</strong>
                                </td>
                                <td className="border border-gray-400 p-2" colSpan="1">
                                    <strong>TOTAL TAKA</strong>
                                </td>
                                <td className="border border-gray-400 p-2" colSpan="1">
                                    <strong>TOTAL METER</strong>
                                </td>
                                <td className="border border-gray-400 p-2" colSpan="1">
                                    <strong>RATE</strong>
                                </td>
                                <td className="border border-gray-400 p-2" colSpan="1">
                                    <strong>AMOUNT</strong>
                                </td>
                            </tr>
                            <tr className='no-border'>
                                <td className="border border-gray-400 p-2" colSpan="1">
                                    1
                                </td>
                                <td className="border border-gray-400 p-2" colSpan="1">
                                    12
                                </td>
                                <td className="border border-gray-400 p-2" colSpan="1">
                                    12
                                </td>
                                <td className="border border-gray-400 p-2" colSpan="1">
                                    15
                                </td>
                                <td className="border border-gray-400 p-2" colSpan="1">
                                    5
                                </td>
                            </tr>
                            <tr className='no-border'>
                                <td className="border border-gray-400 p-2" colSpan="1">

                                </td>
                                <td className="border border-gray-400 p-2" colSpan="1">

                                </td>
                                <td className="border border-gray-400 p-2" colSpan="1">

                                </td>
                                <td className="border border-gray-400 p-2" colSpan="1">

                                </td>
                                <td className="border border-gray-400 p-2" colSpan="1">

                                </td>
                            </tr>
                            <tr className='no-border text-gray-400'>
                                <td className="border border-gray-400 p-2" colSpan="1">

                                </td>
                                <td className="border border-gray-400 p-2" colSpan="1">

                                </td>
                                <td className="border border-gray-400 p-2" colSpan="1">
                                    SGST(%)
                                </td>
                                <td className="border border-gray-400 p-2" colSpan="1">
                                    2.50
                                </td>
                                <td className="border border-gray-400 p-2" colSpan="1">
                                    1.50
                                </td>
                            </tr>
                            <tr className='no-border text-gray-400'>
                                <td className="border border-gray-400 p-2" colSpan="1">

                                </td>
                                <td className="border border-gray-400 p-2" colSpan="1">

                                </td>
                                <td className="border border-gray-400 p-2" colSpan="1">
                                    CGST(%)
                                </td>
                                <td className="border border-gray-400 p-2" colSpan="1">
                                    2.50
                                </td>
                                <td className="border border-gray-400 p-2" colSpan="1">
                                    1.50
                                </td>
                            </tr>
                            <tr className='no-border text-gray-400'>
                                <td className="border border-gray-400 p-2" colSpan="1">

                                </td>
                                <td className="border border-gray-400 p-2" colSpan="1">

                                </td>
                                <td className="border border-gray-400 p-2" colSpan="1">
                                    IGST(%)
                                </td>
                                <td className="border border-gray-400 p-2" colSpan="1">
                                    2.50
                                </td>
                                <td className="border border-gray-400 p-2" colSpan="1">
                                    1.50
                                </td>
                            </tr>
                            <tr className='no-border text-gray-400'>
                                <td className="border border-gray-400 p-2" colSpan="1">

                                </td>
                                <td className="border border-gray-400 p-2" colSpan="1">

                                </td>
                                <td className="border border-gray-400 p-2" colSpan="1">
                                    Round Off
                                </td>
                                <td className="border border-gray-400 p-2" colSpan="1">
                                    2.50
                                </td>
                                <td className="border border-gray-400 p-2" colSpan="1">
                                    1.50
                                </td>
                            </tr>


                            <tr>
                                <td colSpan={4}>
                                    <strong>NET AMOUNT
                                    </strong></td>
                                <td colSpan={1}>
                                    <strong>43
                                    </strong>
                                </td>
                            </tr>

                            <tr>
                                <td colSpan={2}>
                                    <strong>Rs.(IN WORDS):
                                    </strong>
                                </td>
                                <td colSpan={3}>Sixty Three only</td>
                            </tr>
                            <tr className='no-border'>
                                <td colSpan={5} className='text-right'>
                                    <strong>For, SONU TEXTILES</strong>
                                </td>
                            </tr>
                            <tr className='no-border' >
                                <td colSpan={5} className='text-right'>
                                    <strong>Authorized Singnatory
                                    </strong>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Modal>
        </>

    )
}

export default DebitNote