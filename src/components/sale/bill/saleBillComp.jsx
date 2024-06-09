import { useContext, useEffect, useState } from "react";
import {
    Button,
    Col,
    DatePicker,
    Flex,
    Form,
    Input,
    Modal,
    Row,
    Typography,
    message,
} from "antd";
const { Text, Title } = Typography;
import * as yup from "yup";
import { CloseOutlined } from "@ant-design/icons";
import { Controller, useForm } from "react-hook-form";
import dayjs from "dayjs";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


const SaleBillComp = ({ details }) => {
    const [isModelOpen, setIsModalOpen] = useState(true);
    const onSubmit = async (values) => {

    }
    return (
        <>
            <Modal
                closeIcon={<CloseOutlined className="text-white" />}
                title={
                    <Typography.Text className="text-xl font-medium text-white">
                        Receive Size Beam Challan
                    </Typography.Text>
                }
                open={isModelOpen}
                footer={null}
                onCancel={() => { setIsModalOpen(false) }}
                className={{
                    header: "text-center",
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
                    },
                }}
                width={"70vw"}
            >
                <Flex className="flex-col border border-b-0 border-solid">
                    <Row className="p-2 border-0 border-b border-solid">
                        <Col
                            span={24}
                            className="flex items-center justify-center border"
                        >
                            <Typography.Text
                                className="font-semibold text-center"
                                style={{ fontSize: 24 }}
                            >
                                :: SHREE GANESHAY NAMAH ::
                            </Typography.Text>
                        </Col>
                    </Row>

                    <Row className="p-2 border-0 border-b border-solid">
                        <Col
                            span={24}
                            className="flex items-center justify-center border"
                        >
                            <Typography.Text className="font-semibold text-center">
                                MFG OF FANCY & GREY CLOTH
                            </Typography.Text>
                        </Col>
                    </Row>
                    <Row className="p-2 border-0 border-b border-solid">
                        <Col
                            span={24}
                            className="flex items-center justify-center border"
                        >
                            <Typography.Text className="font-semibold text-center">
                                PLOT NO. 78,, JAYVEER INDU. ESTATE,, GUJARAT HOUSING BOARD ROAD, PANDESARA,, SURAT, GUJARAT,394221, PANDESARA<br />
                                394221<br />
                                DIST: Surat<br />
                                MOBILE NO: 6353207671, PAYMENT: 6353207671
                            </Typography.Text>
                        </Col>
                    </Row>

                    <Row className="border-0 border-b border-solid !m-0 p-2">
                        <Col span={12} className="border-r pr-4">
                            <Typography.Text className="block font-semibold">M/s.</Typography.Text>
                            <Typography.Text>BABAJI SILK FABRIC / H M SILK FABRIC</Typography.Text>
                            <Typography.Text className="block">GALA NO 16, B PART, BHAWANI C. H. S. LTD, GARRAGE GALLI, DADAR,</Typography.Text>
                            <Typography.Text className="block">Maharashtra, 400028</Typography.Text>
                            <Typography.Text className="block mt-2 font-semibold" style={{ color: "black" }}>GST IN</Typography.Text>
                            <Typography.Text>27ANJPD1966G1ZZ</Typography.Text>
                            <Typography.Text className="block mt-2">E-WAY BILL NO.</Typography.Text>
                        </Col>
                        <Col span={12} className="pl-4">
                            <Row>
                                <Col span={12}>
                                    <Typography.Text className="block font-semibold">INVOICE NO.</Typography.Text>
                                    <Typography.Text>21312</Typography.Text>
                                </Col>
                                <Col span={12}>
                                    <Typography.Text className="block font-semibold">ORDER NO.</Typography.Text>
                                </Col>
                            </Row>
                            <Row className="mt-2">
                                <Col span={12}>
                                    <Typography.Text className="block font-semibold">PARTY ORDER NO.</Typography.Text>
                                </Col>
                                <Col span={12}>
                                    <Typography.Text className="block font-semibold">CHALLAN NO.</Typography.Text>
                                    <Typography.Text>21312</Typography.Text>
                                </Col>
                            </Row>
                            <Row className="mt-2">
                                <Col span={12}>
                                    <Typography.Text className="block font-semibold">BROKER NAME</Typography.Text>
                                    <Typography.Text>NIK BROKER</Typography.Text>
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                    <Row className="border-0 border-b border-solid !m-0">
                        <Col
                            span={8}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            QUALITY
                        </Col>
                        <Col
                            span={2}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            HSN NO
                        </Col>
                        <Col
                            span={3}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            TAKA
                        </Col>
                        <Col
                            span={3}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            METER
                        </Col>
                        <Col
                            span={4}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            RATE
                        </Col>
                        <Col span={4} className="p-2 font-medium">
                            AMOUNT
                        </Col>
                    </Row>
                    <Row className="border-0 border-b !m-0">
                        <Col
                            span={8}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            33P PALLU PATERN (SDFSDFSDFSDFSDFSD)
                        </Col>
                        <Col
                            span={2}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            124
                        </Col>
                        <Col
                            span={3}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            123
                        </Col>
                        <Col
                            span={3}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            1213
                        </Col>
                        <Col
                            span={4}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            134
                        </Col>
                        <Col span={4} className="p-2 font-medium">
                            1244
                        </Col>
                    </Row>

                    <Row className="border-0 border-b !m-0" >
                        <Col
                            span={8}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={2}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={3}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={3}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            Discount ( % )
                        </Col>
                        <Col
                            span={4}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            0
                        </Col>
                        <Col span={4} className="p-2 font-medium">
                            0.0
                        </Col>
                    </Row>

                    <Row className="border-0 border-b !m-0" >
                        <Col
                            span={8}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={2}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={3}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={3}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            TOTAL AMOUNT
                        </Col>
                        <Col
                            span={4}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            0
                        </Col>
                        <Col span={4} className="p-2 font-medium">
                            15129
                        </Col>
                    </Row>

                    <Row className="border-0 border-b !m-0" >
                        <Col
                            span={8}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={2}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={3}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={3}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            <div style={{ color: "gray" }}>SGST(%)</div>
                        </Col>
                        <Col
                            span={4}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            0
                        </Col>
                        <Col span={4} className="p-2 font-medium">
                            15129
                        </Col>
                    </Row>

                    <Row className="border-0 border-b !m-0" >
                        <Col
                            span={8}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={2}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={3}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={3}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            <div style={{ color: "gray" }}>CGST(%)</div>
                        </Col>
                        <Col
                            span={4}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            0
                        </Col>
                        <Col span={4} className="p-2 font-medium">
                            15129
                        </Col>
                    </Row>

                    <Row className="border-0 border-b !m-0" >
                        <Col
                            span={8}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={2}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={3}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={3}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            <div style={{ color: "gray" }}>IGST(%)</div>
                        </Col>
                        <Col
                            span={4}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            0
                        </Col>
                        <Col span={4} className="p-2 font-medium">
                            15129
                        </Col>
                    </Row>
                    
                    <Row className="border-0 border-b !m-0" >
                        <Col
                            span={8}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={2}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={3}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={3}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            <div style={{ color: "gray" }}>TCS(%)</div>
                        </Col>
                        <Col
                            span={4}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            0
                        </Col>
                        <Col span={4} className="p-2 font-medium">
                            15129
                        </Col>
                    </Row>

                    <Row className="border-0 border-b border-solid !m-0" >
                        <Col
                            span={8}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            Avg Rate: 123
                        </Col>
                        <Col
                            span={2}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={3}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={3}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            <div style={{ color: "gray" }}>Round off</div>
                        </Col>
                        <Col
                            span={4}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >

                        </Col>
                        <Col span={4} className="p-2 font-medium">
                            15129
                        </Col>
                    </Row>

                    <Row className="border-0 border-b border-solid !m-0 p-2">
                        <Col span={18}>
                            <Typography.Text className="block font-semibold">♦ DELIVERY AT:</Typography.Text>
                            <Typography.Text className="block font-semibold mt-1">BABAJI SILK FABRIC / H M SILK FABRIC</Typography.Text>
                            <Typography.Text className="block mt-1">GALA NO 16, B PART, BHAWANI C. H. S. LTD, GARRAGE GALLI, DADAR,</Typography.Text>
                            <Typography.Text className="block">Maharashtra, 400028</Typography.Text>
                        </Col>
                        <Col span={6} className="flex justify-end items-start">
                        </Col>
                    </Row>
                    <Row className="border-0 border-b border-solid !m-0 ">
                        <Col span={13} className="pt-2 pb-2 pl-2 border-0 border-r border-solid">
                            <Typography.Text className="font-semibold">NO DYEING & BLOOMING GUARANTEE</Typography.Text>
                        </Col>
                        <Col
                            span={3}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            <div style={{ color: "gray" }}>Due date: 18/05/2023</div>
                        </Col>
                        <Col
                            span={4}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            NET AMOUNT
                        </Col>
                        <Col span={4} className="p-2 font-medium">
                            15129
                        </Col>
                    </Row>
                    <Row className="border-0 border-b border-solid !m-0 ">
                        <Col span={24} className="pt-2 pb-2 pl-2 border-0 border-r border-solid">
                            <Typography.Text className="font-semibold">Tax Amount(IN WORDS):INR Fifteen Thousand One Hundred and Twenty Nine only</Typography.Text>
                        </Col>
                    </Row>

                    <Row className="border-0 border-b !m-0 p-4">
                        <Col span={16} className="p-2">
                            <Title level={5} className="m-0">
                                ➤ TERMS OF SALES :-
                            </Title>
                            <Text className="block">
                                1. Interest at 2% per month will be charged remaining unpaid
                                from the date bill.
                            </Text>
                            <Text className="block">
                                2. Complaint if any regarding this invoice must be settled
                                within 24 hours.
                            </Text>
                            <Text className="block">
                                3. Disputes shall be settled in SURAT court only.
                            </Text>
                            <Text className="block">
                                4. We are not responsible for processed goods & width.
                            </Text>
                            <Text className="block">5. Subject to SURAT Jurisdiction.</Text>
                            <Text className="block mt-2"></Text>
                        </Col>
                        <Col span={8} className="p-2 text-right">
                            <Text strong>For, SONU TEXTILES</Text>
                        </Col>
                    </Row>

                    <Row
                        className="border-0 border-b border-solid !m-0 p-4"
                        style={{ paddingTop: 0 }}
                    >
                        <Col span={16} className="p-2">
                            <Text strong>Bank Details:</Text> MESHANA URBAN
                            <br />
                            <Text strong>A/C No:</Text> 0021101005190
                            <br />
                            <Text strong>IFSC Code:</Text> MSNU0000021
                            <br />
                            <Text>IRN: --</Text>
                            <br />
                            <Text>ACK NO: --</Text>
                            <br />
                            <Text>ACK DATE: --</Text>
                        </Col>
                        <Col span={8} className="p-2 text-right">
                            <Text strong>Authorised Signatory</Text>
                        </Col>
                    </Row>

                    <Row className="p-2 border-0 border-b border-solid">
                        <Col
                            span={24}
                            className="flex items-center justify-center border"
                        >
                            <Typography.Text className="font-semibold text-center">
                                PAID DETAILS
                            </Typography.Text>
                        </Col>
                    </Row>

                    <Row className="border-0 border-b border-solid !m-0">
                        <Col
                            span={6}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            RECEIVED RS.
                        </Col>
                        <Col
                            span={6}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            CHQ/DD NO.
                        </Col>
                        <Col
                            span={6}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            DATE
                        </Col>
                        <Col
                            span={6}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            {"PARTY'S BANK"}
                        </Col>
                    </Row>

                </Flex>
            </Modal>
        </>
    )
}

export default SaleBillComp; 