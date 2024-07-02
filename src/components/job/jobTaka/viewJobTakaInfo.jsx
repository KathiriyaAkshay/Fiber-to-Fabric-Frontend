import { EyeOutlined } from "@ant-design/icons";
import {
    Button,
    Col,
    DatePicker,
    Flex,
    Form,
    Input,
    Modal,
    Radio,
    Row,
    Select,
    Typography,
    message,
} from "antd";
import { useState } from "react";
import { CloseOutlined, FileTextOutlined } from "@ant-design/icons";
import { Controller, useForm } from "react-hook-form";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { ToWords } from "to-words";

const { Text } = Typography;

const ViewJobTakaInfo = ({ details }) => {
    const [isModelOpen, setIsModalOpen] = useState(false);
    return (
        <>
            <Button onClick={() => { setIsModalOpen(true) }}>
                <EyeOutlined />
            </Button>

            <Modal
                closeIcon={<CloseOutlined className="text-white" />}
                title={
                    <Typography.Text className="text-xl font-medium text-white">
                        Job Challan
                    </Typography.Text>
                }
                open={isModelOpen}
                footer={null}
                onCancel={() => { setIsModalOpen(false) }}
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
                    <Row className="border p-4 border-b ,0border-solid !m-0" style={{ borderTop: 0, borderLeft: 0, borderRight: 0, borderBottom: 0 }}>
                        <Col span={12}>
                            <Row>
                                <Col span={24}>
                                    <Text>To,</Text>
                                    <Text className="block font-bold">INSURANCE AND TAXES (TEXT_121_SUPPLIER)</Text>
                                    <Text className="block">NEW SUPPLIER ADDRESS</Text>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={24}>
                                    <Text>Challan</Text>
                                    <Text className="block">23232323</Text>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={24}>
                                    <Text>GST</Text>
                                    <Text className="block">24ABHPP6021C1Z4</Text>
                                </Col>
                            </Row>
                        </Col>
                        <Col span={12}>
                            <Row>
                                <Col span={24}>
                                    <Text>From,</Text>
                                    <Text className="block font-bold">SONU TRADERS</Text>
                                    <Text className="block">PLOT NO. 78, JAYVEER INDU. ESTATE, GUJARAT HOUSING BOARD ROAD, PANDESARA, SURAT, GUJARAT, 394221 SURAT, At: 1041 DIST-1041</Text>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={24}>
                                    <Text>Broker</Text>
                                    <Text className="block font-bold">NIK BROKER</Text>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={24}>
                                    <Text>GST</Text>
                                    <Text className="block">24ABHPP6021C1Z4</Text>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row className="p-4 border-0 border-b border-solid !m-0" style={{borderTop: "1px dashed"}}>
                        <Col span={6}>Description of Goods:</Col>
                        <Col span={6}>Description of Goods:</Col>
                        <Col span={6}>Description of Goods:</Col>
                        <Col span={6}>Description of Goods:</Col>
                    </Row>
                    <Row className="p-4 border-0 border-b border-solid !m-0" style={{borderTop: "1px dashed"}}>
                        <Col span={2}>Description of Goods:</Col>
                        <Col span={5}>Description of Goods:</Col>
                        <Col span={5}>Description of Goods:</Col>
                        <Col span={2}>Description of Goods:</Col>
                        <Col span={5}>Description of Goods:</Col>
                        <Col span={5}>Description of Goods:</Col>
                    </Row>
                </Flex>
            </Modal>

        </>
    )
}

export default ViewJobTakaInfo; 