import { useContext, useEffect, useState } from "react";
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
import { CloseOutlined, FileTextOutlined, EyeOutlined } from "@ant-design/icons";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import moment from "moment";
import { ToWords } from "to-words";


const BeamPipeChallanModel = ({ details }) => {
    console.log("Size beam challan information  ===================================");
    console.log(details);

    const [totalMeter, setTotalMeter] = useState(0) ; 

    useEffect(() => {
        let temp_total = 0 ;

        details?.size_beam_order_details?.map((element) => {
            temp_total = Number(temp_total) + Number(element?.meters)
        })

        setTotalMeter(temp_total) ; 
    }, [details]) ; 

    const [isModelOpen, setIsModalOpen] = useState(false);
    return (
        <>
            <Button type="primary" onClick={() => { setIsModalOpen(true) }}>
                <EyeOutlined />
            </Button>
            <Modal
                closeIcon={<CloseOutlined className="text-white" />}
                title={
                    <Typography.Text className="text-xl font-medium text-white">
                        {"Beam Pipe Challan"}
                    </Typography.Text>
                }
                open={isModelOpen}
                footer={null}
                onCancel={() => { setIsModalOpen(false) }}
                centered={true}
                classNames={{
                    header: "text-center",
                }}
                width={"60%"}
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
                    },
                }}
            >
                <Flex className="flex-col border border-solid">
                    <Row className="p-2 border-0 border-b border-solid">
                        <Col
                            span={24}
                            className="flex items-center justify-center border"
                        >
                            <div style={{ fontSize: "1.5rem" }} className="font-semibold text-center">
                                Beam Pipe Challan
                            </div>
                        </Col>
                    </Row>

                    <Row gutter={16} className="pr-0" >
                        <Col span={12} style={{ borderRight: "1px solid", paddingRight: "0px !important" }}>
                            <div className="pl-4 pt-4">
                                <Typography.Text strong>To,</Typography.Text>
                                <br />
                                <Typography.Text>YARN_SUPPLIER_3</Typography.Text>
                                <br />
                                <Typography.Text>SUPPLIER ADDRESS</Typography.Text>
                            </div>

                            <div className="pt-4 pl-4 pb-4" style={{ marginTop: 20, borderTop: "1px solid" }}>
                                <Flex>
                                    <div><strong>DESCRIPTION OF GOODS : </strong></div>
                                    <div style={{ marginLeft: 6 }}>
                                        {`${details?.yarn_stock_company?.yarn_count}C/${details?.yarn_stock_company?.filament}F (${details?.yarn_stock_company?.yarn_type}(${details?.yarn_stock_company?.yarn_Sub_type}) - ${details?.yarn_stock_company?.yarn_color})`}
                                    </div>
                                </Flex>
                            </div>
                        </Col>
                        <Col span={12} style={{ paddingLeft: "0px !important" }}>
                            <div className="pl-4 pt-4 pr-4" style={{ justifyContent: "flex-end", textAlign: "right" }}>
                                <Typography.Text strong>Dated : </Typography.Text>{moment(details?.order_date).format("DD-MM-YYYY")}<br></br>
                                <Typography.Text strong>Order No :- </Typography.Text>{details?.order_no}
                            </div>
                            <div className="pt-4 pl-4 pb-4" style={{ marginTop: 20, borderTop: "1px solid" }}>
                                <Typography.Text strong>From,</Typography.Text>
                                <br />
                                <Typography.Text>SONU TEXTILES</Typography.Text>
                                <br />
                                <Typography.Text>Plot No. 78, Jayveer Indu. Estate, Gujarat Housing Board Road, Pandesara,, Surat, Gujarat,394221 Pandesara</Typography.Text>
                            </div>
                        </Col>
                    </Row>

                    <Row className=" p-0 border-0 border-b border-solid !m-0" style={{ borderTop: "1px solid" }}>
                        <Col
                            span={2}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            <strong>SRL</strong>
                        </Col>
                        <Col
                            span={4}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            <strong>ENDS/TAAR</strong>
                        </Col>
                        <Col
                            span={3}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            <strong>TPM</strong>
                        </Col>
                        <Col
                            span={3}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            <strong>PANO</strong>
                        </Col>
                        <Col
                            span={5}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            <strong>GRADE</strong>
                        </Col>
                        <Col
                            span={3}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            <strong>MTR</strong>
                        </Col>
                        <Col span={4} className="p-2 font-medium">
                            <strong>REMARKS</strong>
                        </Col>
                    </Row>

                    {details?.size_beam_order_details?.map((element, index) => (
                        <Row className=" p-0 border-0 border-solid !m-0" >
                            <Col
                                span={2}
                                className="p-2 font-medium border-0 border-r border-solid"
                            >
                                {index + 1}
                            </Col>
                            <Col
                                span={4}
                                className="p-2 font-medium border-0 border-r border-solid"
                            >
                                {element?.ends_or_tars}
                            </Col>
                            <Col
                                span={3}
                                className="p-2 font-medium border-0 border-r border-solid"
                            >
                                {element?.tpm}
                            </Col>
                            <Col
                                span={3}
                                className="p-2 font-medium border-0 border-r border-solid"
                            >
                                {element?.pano}
                            </Col>
                            <Col
                                span={5}
                                className="p-2 font-medium border-0 border-r border-solid"
                            >
                                {element?.grade}
                            </Col>
                            <Col
                                span={3}
                                className="p-2 font-medium border-0 border-r border-solid"
                            >
                                {element?.meters}
                            </Col>
                            <Col span={4} className="p-2 font-medium">
                               {element?.remark}
                            </Col>
                        </Row>

                    ))}


                    <Row className=" p-0 border-0 border-b border-solid !m-0" style={{ height: 200 }} >
                        <Col
                            span={2}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={4}
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
                        </Col>
                        <Col
                            span={5}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={3}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col span={4} className="p-2 font-medium">
                        </Col>
                    </Row>

                    <Row className=" p-0 border-0 border-b border-solid !m-0">
                        <Col
                            span={2}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            <strong>Total</strong>
                        </Col>
                        <Col
                            span={4}
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
                        </Col>
                        <Col
                            span={5}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={3}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            <strong>{totalMeter}</strong>
                        </Col>
                        <Col span={4} className="p-2 font-medium">
                        </Col>
                    </Row>

                    <Row gutter={16} className="mt-4 p-4" >
                        <Col span={12}>
                            <Typography.Text>Receiver Sign</Typography.Text>
                        </Col>
                        <Col span={12} style={{textAlign: "right" }}>
                            <Typography.Text>For, SONU TEXTILES</Typography.Text>
                            <br /><br /><br /><br /><br /><br /><br /><br />
                            <Typography.Text>Checked by Authorised Signatory</Typography.Text>
                        </Col>
                    </Row>
                    

                </Flex>
                
                <Flex>
                    <Button type="primary" style={{marginLeft: "auto", marginTop: 10}}>
                        PRINT CHALLAN
                    </Button>
                </Flex>
            </Modal>
        </>
    )
}

export default BeamPipeChallanModel; 