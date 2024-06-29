import { useContext, useState } from "react";
import {
    Button,
    Col,
    DatePicker,
    Flex,
    Form,
    Input,
    Layout,
    Modal,
    Row,
    Typography,
    message,
    Divider
} from "antd";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { EyeOutlined, FileTextOutlined, CloseOutlined } from "@ant-design/icons";
import moment from "moment";
const { Title, Paragraph } = Typography;

const PrintJobWorkChallan = ({ details }) => {
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
                        Job Work
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
                <Flex className="flex-col p-3" style={{border: "1px solid #efefef"}}>
                    <Row className="p-2 ">
                        <Col
                            span={24}
                            className="flex items-center justify-center border"
                        >
                            <Typography.Text className="font-semibold text-center">
                                <h3>SONU TEXTILES</h3>
                            </Typography.Text>

                        </Col>
                    </Row>

                    <Row justify="center" align="middle" style={{
                        borderTop: "1px dashed",
                        paddingTop: 15,
                        paddingBottom: 15
                    }}>
                        <Col span={24} style={{ textAlign: 'center' }}>
                            <p style={{ marginTop: 0, marginBottom: 0 }}><strong>PLOT NO. 78,, JAYVEER INDU. ESTATE,, GUJARAT HOUSING BOARD ROAD, PANDESARA,, SURAT, GUJARAT, 394221 PANDESARA</strong></p>
                            <p style={{ marginTop: 3, marginBottom: 0 }}>At: Surat DIST-Surat</p>
                            <p style={{ marginTop: 3, marginBottom: 0 }}>Phone no: 6353207671 &nbsp;&nbsp;&nbsp; PAYMENT: 6353207671</p>
                            <p style={{ marginTop: 3, marginBottom: 0 }}>GST NO: 24ABHPP6021C1Z4 &nbsp;&nbsp;&nbsp;&nbsp; PAN NO: ABHPP6021C</p>
                        </Col>
                    </Row>
                    <Row style={{
                        borderTop: "1px dashed",
                        paddingTop: 10
                    }}>
                        <Col span={12}>
                            <p><strong>M/S :</strong> {details?.supplier?.supplier_company}({details?.supplier?.supplier_name})</p>
                            <p>ADDRESS OF SUPPLIER OF SUPPLIER NAME 123</p>
                            <p><strong>GST :</strong> 24ABHPP6021C1Z4</p>
                            <p><strong>E-Way Bill No :</strong></p>
                        </Col>
                        <Col span={12} style={{ textAlign: 'right' }}>
                            <p><strong>CHALLAN NO :</strong> {details?.challan_no}</p>
                            <p><strong>DATE :</strong> {moment(details?.createdAt).format("DD-MM-YYYY")}</p>
                            <p><strong>VEHICLE NO :</strong>{details?.vehicle?.vehicle?.vehicleNo}</p>
                        </Col>
                    </Row>

                    <Row style={{
                        borderTop: "1px dashed",
                        paddingTop: 15,
                        paddingBottom: 15
                    }}>
                        <Col span={8}><strong>DESCRIPTION OF GOODS:</strong></Col>
                        <Col span={4}><strong>{details?.yarn_stock_company?.yarn_company_name}</strong></Col>
                    </Row>
                    <div style={{ height: 400 }}>
                        <Row gutter={24} style={{
                            borderTop: "1px dashed",
                            paddingTop: 15,
                            paddingBottom: 15
                        }}>
                            <Col span={3}><strong>No</strong></Col>
                            <Col span={7}><strong>Yarn Company</strong></Col>
                            <Col span={6}><strong>Dennier</strong></Col>
                            <Col span={4}><strong>Cartoon</strong></Col>
                            <Col span={4}><strong>KG</strong></Col>
                        </Row>
                        <Row gutter={24} style={{
                            borderTop: "1px dashed",
                            paddingTop: 15,
                            paddingBottom: 15
                        }}>
                            <Col span={3}>1</Col>
                            <Col span={7}>{details?.yarn_stock_company?.yarn_company_name}</Col>
                            <Col span={6}>{`${details?.yarn_stock_company?.yarn_count}C/${details?.yarn_stock_company?.filament}F(${details?.yarn_stock_company?.luster_type}(${details?.yarn_stock_company?.yarn_Sub_type}) - ${details?.yarn_stock_company?.yarn_color})`}</Col>
                            <Col span={4}>{details?.cartoon}</Col>
                            <Col span={4}>{details?.kg}</Col>
                        </Row>
                    </div>
                    <Row gutter={24} style={{
                        borderTop: "1px dashed",
                        paddingTop: 8,
                        paddingBottom: 8
                    }}>
                        <Col span={3}><strong></strong></Col>
                        <Col span={7}><strong></strong></Col>
                        <Col span={6}><strong></strong></Col>
                        <Col span={4}><strong>{details?.cartoon}</strong></Col>
                        <Col span={4}><strong>{details?.kg}</strong></Col>
                    </Row>

                    <Row gutter={24} style={{
                        borderTop: "1px dashed",
                        paddingTop: 8,
                        paddingBottom: 8
                    }}>
                        <Col span={4}><strong>TOTAL CARTOON:</strong></Col>
                        <Col span={4}><strong>{details?.cartoon}</strong></Col>
                        <Col span={4}><strong>TOTAL KG:</strong></Col>
                        <Col span={4}><strong>{details?.kg}</strong></Col>
                    </Row>

                    <Row gutter={24} style={{ borderTop: "1px dashed", paddingTop: 15 }}>
                        <Col span={4}>TERMS OF SALES:</Col>
                    </Row>

                    <Row gutter={[16, 16]} style={{marginTop: 15}}>
                        <Col span={24}>
                            <Paragraph style={{marginBottom: 0}}>
                                (1) Interest at 2% per month will be charged remaining unpaid from date of bill.
                            </Paragraph>
                        </Col>
                        <Col span={24}>
                            <Paragraph style={{marginBottom: 0}}>
                                (2) Complaint if any regarding this invoice must be settled within 24 hours.
                            </Paragraph>
                        </Col>
                        <Col span={24}>
                            <Paragraph style={{marginBottom: 0}}>
                                (3) Subject to SURAT jurisdiction.
                            </Paragraph>
                        </Col>
                        <Col span={24}>
                            <Paragraph style={{marginBottom: 0}}>
                                (4) We are not responsible for processed good &amp; width.
                            </Paragraph>
                        </Col>
                    </Row>
                    <Row style={{ marginTop: '40px' }}>
                        <Col span={24} style={{ textAlign: 'right' }}>
                            <Paragraph>For, SONU TEXTILES</Paragraph>
                        </Col>
                    </Row>
                    <Row style={{ marginTop: '70px' }}>
                        <Col span={12}>
                            <Paragraph>Checked by</Paragraph>
                        </Col>
                        <Col span={12} style={{ textAlign: 'right' }}>
                            <Paragraph>Authorised Signatory</Paragraph>
                        </Col>
                    </Row>
                </Flex>
                <Flex>
                    <Button type="primary" style={{marginLeft: "auto", marginTop: 15}}>
                        PRINT
                    </Button>
                </Flex>
            </Modal>
        </>
    )
}

export default PrintJobWorkChallan; 