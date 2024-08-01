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
import { CloseOutlined, FileTextOutlined } from "@ant-design/icons";
import { Controller, useForm } from "react-hook-form";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { getYarnBillById } from "../../../../api/requests/purchase/purchaseTaka";
import moment from "moment";
import { ToWords } from "to-words";

const toWords = new ToWords({
    localeCode: "en-IN",
    converterOptions: {
        currency: true,
        ignoreDecimal: false,
        ignoreZeroCurrency: false,
        doNotAddOnly: false,
        currencyOptions: {
            // can be used to override defaults for the selected locale
            name: "Rupee",
            plural: "Rupees",
            symbol: "₹",
            fractionalUnit: {
                name: "Paisa",
                plural: "Paise",
                symbol: "",
            },
        },
    },
});

const ViewYarnReceiveChallan = ({ details }) => {
    const [isModelOpen, setIsModalOpen] = useState(false);
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [totalCartoon, setTotalCartoon] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const {company} = useContext(GlobalContext) ;   
    
    console.log("Details information ========================");
    console.log(details);

    useEffect(() => {
        let tempQuantity = 0;
        let tempCartoon = 0;
        let tempTotalAmount = 0;

        details?.yarn_bill_details?.map((element) => {
            tempQuantity = tempQuantity + Number(element?.yarn_receive_challan?.receive_quantity);
            tempCartoon = tempCartoon + Number(element?.yarn_receive_challan?.receive_cartoon_pallet);
            tempTotalAmount = tempTotalAmount + Number(element?.quantity_amount);
        })
        setTotalCartoon(tempCartoon);
        setTotalQuantity(tempQuantity);
        setTotalAmount(tempTotalAmount.toFixed(2));
    }, [details]);

    return (
        <>
            <Button onClick={() => { setIsModalOpen(true) }}>
                <FileTextOutlined />
            </Button>

            <Modal
                closeIcon={<CloseOutlined className="text-white" />}
                title={
                    <Typography.Text className="text-xl font-medium text-white">
                        Yarn Receive Bill
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
                    <Row className="p-2 border-0 border-b border-solid">
                        <Col
                            span={24}
                            className="flex items-center justify-center border"
                        >
                            <Typography.Text className="font-semibold text-center">
                                :: SHREE GANESHAY NAMAH ::
                            </Typography.Text>
                        </Col>
                    </Row>

                    <Row className="border p-4 border-b border-solid !m-0" style={{ borderTop: 0, borderLeft: 0, borderRight: 0 }}>
                        <Col span={12} >
                            <Row>
                                <Col span={24}>
                                    <Typography.Text>To,</Typography.Text>
                                    <Typography.Text className="block font-bold">{details?.supplier?.supplier?.supplier_name}({details?.supplier?.supplier?.supplier_company})</Typography.Text>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={24}>
                                    <Typography.Text>Gst In</Typography.Text>
                                    <Typography.Text className="block">{details?.supplier?.gst_no}</Typography.Text>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={24}>
                                    <Typography.Text>Invoice No</Typography.Text>
                                    <Typography.Text className="block">{details?.invoice_no}</Typography.Text>
                                </Col>
                            </Row>
                        </Col>
                        <Col span={12}>
                            <Row>
                                <Col span={24}>
                                    <Typography.Text>From,</Typography.Text>
                                    <Typography.Text className="block font-bold">{company?.company_name}</Typography.Text>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={24}>
                                    <Typography.Text>Gst In</Typography.Text>
                                    <Typography.Text className="block">{company?.gst_no}</Typography.Text>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={24}>
                                    <Typography.Text>Bill Date</Typography.Text>
                                    <Typography.Text className="block">{moment(details?.bill_date).format("DD-MM-YYYY")}</Typography.Text>
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                    <Row className="border-0 border-b border-solid !m-0">
                        <Col
                            span={5}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            Company name
                        </Col>
                        <Col
                            span={4}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            Challan
                        </Col>
                        <Col
                            span={2}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            Dennier
                        </Col>
                        <Col
                            span={2}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            Quantity
                        </Col>
                        <Col
                            span={4}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            Cartoon
                        </Col>
                        <Col
                            span={3}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            RATE
                        </Col>
                        <Col span={4} className="p-2 font-medium">
                            AMOUNT
                        </Col>
                    </Row>

                    <Row className="border-0 !m-0">
                        <Col
                            span={5}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            {details?.yarn_stock_company?.yarn_company_name}
                        </Col>
                        <Col
                            span={4}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            {details?.yarn_bill_details?.map(item => item.yarn_receive_challan.challan_no).join(',')}
                        </Col>
                        <Col
                            span={2}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            {details?.yarn_stock_company?.yarn_denier}
                        </Col>
                        <Col
                            span={2}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            {totalQuantity}
                        </Col>
                        <Col
                            span={4}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            {totalCartoon}
                        </Col>
                        <Col
                            span={3}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            {details?.yarn_bill_details[0]?.quantity_rate}
                        </Col>
                        <Col span={4} className="p-2 font-medium">
                            {totalAmount}
                        </Col>
                    </Row>

                    <Row className="border-0 !m-0" style={{height: "100px"}}>
                        <Col
                            span={5}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={4}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={2}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
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
                        <Col span={4} className="p-2 font-medium">
                        </Col>
                    </Row>

                    <Row>
                        <Col
                            span={5}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={4}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={2}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={2}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={4}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            FREIGHT
                        </Col>
                        <Col
                            span={3}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            {details?.freight_value}
                        </Col>
                        <Col span={4} className="p-2 font-medium">
                            {details?.freight_amount}
                        </Col>
                    </Row>

                    <Row>
                        <Col
                            span={5}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={4}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={2}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={2}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={4}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            {details?.is_discount ? "Discount(%)" : "Brokrage(%)"}
                        </Col>
                        <Col
                            span={3}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            {details?.discount_brokerage_value}
                        </Col>
                        <Col span={4} className="p-2 font-medium">
                            {details?.discount_brokerage_amount}
                        </Col>
                    </Row>

                    <Row>
                        <Col
                            span={5}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={4}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={2}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={2}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={4}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            SGST(%)
                        </Col>
                        <Col
                            span={3}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            {details?.SGST_value}
                        </Col>
                        <Col span={4} className="p-2 font-medium">
                            {details?.SGST_amount}
                        </Col>
                    </Row>

                    <Row>
                        <Col
                            span={5}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={4}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={2}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={2}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={4}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            CGST(%)
                        </Col>
                        <Col
                            span={3}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            {details?.CGST_value}
                        </Col>
                        <Col span={4} className="p-2 font-medium">
                            {details?.CGST_amount}
                        </Col>
                    </Row>

                    <Row>
                        <Col
                            span={5}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={4}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={2}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={2}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={4}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            IGST(%)
                        </Col>
                        <Col
                            span={3}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            {details?.IGST_value}
                        </Col>
                        <Col span={4} className="p-2 font-medium">
                            {details?.IGST_amount}
                        </Col>
                    </Row>

                    <Row>
                        <Col
                            span={5}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={4}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={2}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={2}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={4}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            TCS(%)
                        </Col>
                        <Col
                            span={3}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            {details?.TCS_value}
                        </Col>
                        <Col span={4} className="p-2 font-medium">
                            {details?.TCS_amount}
                        </Col>
                    </Row>

                    <Row >
                        <Col
                            span={5}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={4}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={2}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={2}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                        </Col>
                        <Col
                            span={4}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            Round Off
                        </Col>
                        <Col
                            span={3}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >

                        </Col>
                        <Col span={4} className="p-2 font-medium">
                            {details?.round_off_amount}
                        </Col>
                    </Row>

                    <Row className="border border-b border-solid !m-0" style={{ borderLeft: 0, borderRight: 0 }}>
                        <Col span={6} className="p-2 font-semibold">
                            NO DYEING GUARANTEE
                        </Col>

                        <Col span={11} className="p-2 font-semibold border-0 border-r border-solid">
                            <div style={{ textAlign: "right" }}>
                                <strong>Due Date</strong>: {moment(details?.due_date).format("DD-MM-YYYY")}
                            </div>
                        </Col>
                        <Col
                            span={3}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            NET Amount
                        </Col>
                        <Col span={4} className="p-2 font-medium">
                            {details?.net_amount}
                        </Col>
                    </Row>

                    <Row className="border border-b border-solid !m-0" style={{ borderLeft: 0, borderRight: 0, borderTop: 0 }}>
                        <Col span={4} className="p-2 font-semibold">
                            Rs.(IN WORDS):
                        </Col>
                        <Col span={20} className="p-2 font-semibold">
                            {Number(details?.net_amount) ? toWords.convert(details?.net_amount) : ""}
                        </Col>
                    </Row>
                    <Row className="border border-b border-solid !m-0" style={{ borderLeft: 0, borderRight: 0, borderTop: 0 }}>
                        <Col span={4} className="p-2 font-semibold">
                            <strong>TDS : </strong>{details?.TDS_amount}
                        </Col>
                        <Col span={20} className="p-2 font-semibold">
                            <strong>After TDS :</strong>{details?.after_TDS_amount}
                        </Col>
                    </Row>
                </Flex>
            </Modal>
        </>
    )
}

export default ViewYarnReceiveChallan; 