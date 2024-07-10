import { useContext, useEffect, useState, useRef } from "react";
import {
    Button,
    Col,
    Flex,
    Modal,
    Row,
    Typography,
} from "antd";
import { CloseOutlined, CreditCardFilled } from "@ant-design/icons";
import dayjs from "dayjs";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { ToWords } from "to-words";
import ReactToPrint from "react-to-print";

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
const YarnSaleCreditNote = ({ details }) => {
    console.log(details);
    const [isModelOpen, setIsModalOpen] = useState(false);
    const componentRef = useRef() ; 
    const {companyListRes} = useContext(GlobalContext) ; 
    const [companyInfo, setCompanyInfo] = useState({});

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

    useEffect(() => {
        companyListRes?.rows?.map((element) => {
            if (element?.id == details?.company_id){
                setCompanyInfo(element) ; 
            }
        })
    },[details, companyListRes]) ;

    return (
        <>
            <Button onClick={() => { setIsModalOpen(true) }}>
                <CreditCardFilled />
            </Button>

            <Modal
                closeIcon={<CloseOutlined className="text-white" />}
                title={
                    <Typography.Text className="text-xl font-medium text-white">
                        Credit Note
                    </Typography.Text>
                }
                open={isModelOpen}
                footer={() => {
                    return(
                        <>
                            <ReactToPrint
                                trigger={() => <Flex>
                                    <Button type="primary" style={{marginLeft: "auto", marginTop: 15}}>
                                        PRINT
                                    </Button>
                                </Flex>}
                                content={() => componentRef.current}
                                pageStyle={pageStyle}
                            />
                        </>
                    )
                }}
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
                        maxHeight: "75vh", 
                        overflowY: "auto"
                    },

                    footer:{
                        paddingBottom: 10, 
                        paddingRight: 10, 
                        backgroundColor: "#efefef"
                    }
                }}
                width={"70vw"}
            >
                <Flex className="flex-col border border-b-0 border-solid" ref={componentRef}>
                    <Row className="p-2 border-0 border-b border-solid">
                        <Col
                            span={24}
                            className="flex items-center justify-center border"
                        >
                            <Typography.Text className="font-semibold text-center">
                                <h4>Credit Note</h4>
                            </Typography.Text>

                        </Col>
                    </Row>

                    <Row className="border-0 border-b border-solid">
                        <Col
                            span={12}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            <Flex style={{ padding: "0 !important" }}>
                                <strong>Company Name :- {companyInfo?.company_name}</strong>
                                <div></div>
                            </Flex>
                        </Col>

                        <Col
                            span={6}
                            className="p-2 font-medium border-0 border-r border-solid"
                        >
                            <span><strong>Credit Note No:- </strong></span>
                        </Col>
                        <Col
                            span={6}
                            className="p-2 font-medium border-0"
                        >
                            <span><strong>Date:- </strong>{dayjs(details?.yarn_sale_bill?.createdAt).format("DD-MM-YYYY")}</span>
                        </Col>
                    </Row>

                    <Row className="border-0 border-b border-solid">
                        <Col span={12} className="p-2 font-medium border-0 border-r border-solid">
                            <div style={{ display: 'flex', padding: '0 !important' }}>
                                <strong>Party :-</strong>
                                <div> {details?.supplier?.supplier_company}<br/>
                                    {details?.supplier?.user?.address}
                                </div>
                            </div>
                        </Col>

                        <Col span={12} className="font-medium border-0 border-r">

                            <div>
                                <Flex style={{ width: "100%" }}>
                                    <Col span={12} className="p-2 font-medium border-0 border-r border-solid">
                                        <span><strong>Buyer's Ref. :-</strong>{details?.challan_no}</span>
                                    </Col>
                                    <Col span={12} className="p-2 font-medium border-0">
                                        <span><strong>Date :-</strong>{dayjs(details?.createdAt).format("DD-MM-YYYY")}</span>
                                    </Col>
                                </Flex>
                                <div className="p-2 font-medium border-0" style={{
                                    borderTop: "1px solid"
                                }}>
                                    <span><strong>DESCRIPTION OF GOODS :</strong> {`${details?.yarn_stock_company?.yarn_type}(${details?.yarn_stock_company?.yarn_Sub_type})-${details?.yarn_stock_company?.yarn_color}`}</span>
                                </div>
                                <Flex style={{ width: "100%", borderTop: "1px solid" }}>
                                    <Col span={12} className="p-2 font-medium border-0 border-r border-solid">
                                        <span><strong>HSN :-</strong>{details?.yarn_stock_company?.hsn_no}</span>
                                    </Col>
                                    <Col span={12} className="p-2 font-medium border-0">
                                        <span><strong>PAN NO :-</strong> {details?.supplier?.user?.pancard_no}</span>
                                    </Col>
                                </Flex>
                            </div>
                        </Col>
                    </Row>

                    <Row className="border-0 border-b border-solid">
                        <Col span={2} className="p-2 font-medium border-0 border-r border-solid text-center">
                            <strong>S No</strong>
                        </Col>
                        <Col span={5} className="p-2 font-medium border-0 border-r border-solid text-center">
                            <strong>TOTAL CARTOON</strong>
                        </Col>
                        <Col span={5} className="p-2 font-medium border-0 border-r border-solid text-center">
                            <strong>TOTAL KG</strong>
                        </Col>
                        <Col span={6} className="p-2 font-medium border-0 border-r border-solid text-center">
                            <strong>RATE</strong>
                        </Col>
                        <Col span={6} className="p-2 font-medium border-0 text-center">
                            <strong>AMOUNT</strong>
                        </Col>
                    </Row>
                    <Row >
                        <Col span={2} className="p-2 font-medium border-0 border-r border-solid text-center">
                            1
                        </Col>
                        <Col span={5} className="p-2 font-medium border-0 border-r border-solid text-center">
                            {details?.cartoon}
                        </Col>
                        <Col span={5} className="p-2 font-medium border-0 border-r border-solid text-center">
                            {details?.kg}
                        </Col>
                        <Col span={6} className="p-2 font-medium border-0 border-r border-solid text-center">
                            {details?.yarn_sale_bill?.rate}
                        </Col>
                        <Col span={6} className="p-2 font-medium border-0 text-center">
                            {Number(Number(details?.kg)*Number(details?.yarn_sale_bill?.rate)).toFixed(2)}
                        </Col>
                    </Row>
                    <Row style={{ height: 300 }}>
                        <Col span={2} className="p-2 font-medium border-0 border-r border-solid text-center">
                        </Col>
                        <Col span={5} className="p-2 font-medium border-0 border-r border-solid text-center">
                        </Col>
                        <Col span={5} className="p-2 font-medium border-0 border-r border-solid text-center">
                        </Col>
                        <Col span={6} className="p-2 font-medium border-0 border-r border-solid text-center">
                        </Col>
                        <Col span={6} className="p-2 font-medium border-0 text-center">
                        </Col>
                    </Row>
                    <Row >
                        <Col span={2} className="p-2 font-medium border-0 border-r border-solid text-center">
                        </Col>
                        <Col span={5} className="p-2 font-medium border-0 border-r border-solid text-center">
                        </Col>
                        <Col span={5} className="p-2 font-medium border-0 border-r border-solid text-center">
                            SGST(%)
                        </Col>
                        <Col span={6} className="p-2 font-medium border-0 border-r border-solid text-center">
                            {details?.yarn_sale_bill?.SGST_value}
                        </Col>
                        <Col span={6} className="p-2 font-medium border-0 text-center">
                            {details?.yarn_sale_bill?.SGST_amount}
                        </Col>
                    </Row>
                    <Row >
                        <Col span={2} className="p-2 font-medium border-0 border-r border-solid text-center">
                        </Col>
                        <Col span={5} className="p-2 font-medium border-0 border-r border-solid text-center">
                        </Col>
                        <Col span={5} className="p-2 font-medium border-0 border-r border-solid text-center">
                            CGST(%)
                        </Col>
                        <Col span={6} className="p-2 font-medium border-0 border-r border-solid text-center">
                            {details?.yarn_sale_bill?.CGST_value}
                        </Col>
                        <Col span={6} className="p-2 font-medium border-0 text-center">
                            {details?.yarn_sale_bill?.CGST_amount}
                        </Col>
                    </Row>
                    <Row >
                        <Col span={2} className="p-2 font-medium border-0 border-r border-solid text-center">
                        </Col>
                        <Col span={5} className="p-2 font-medium border-0 border-r border-solid text-center">
                        </Col>
                        <Col span={5} className="p-2 font-medium border-0 border-r border-solid text-center">
                            IGST(%)
                        </Col>
                        <Col span={6} className="p-2 font-medium border-0 border-r border-solid text-center">
                            {details?.yarn_sale_bill?.IGST_value}
                        </Col>
                        <Col span={6} className="p-2 font-medium border-0 text-center">
                            {details?.yarn_sale_bill?.IGST_amount}
                        </Col>
                    </Row>
                    <Row className="border-0 border-b border-solid">
                        <Col span={2} className="p-2 font-medium border-0 border-r border-solid text-center">
                        </Col>
                        <Col span={5} className="p-2 font-medium border-0 border-r border-solid text-center">
                        </Col>
                        <Col span={5} className="p-2 font-medium border-0 border-r border-solid text-center">
                            Round Off
                        </Col>
                        <Col span={6} className="p-2 font-medium border-0 border-r border-solid text-center">
                            ----
                        </Col>
                        <Col span={6} className="p-2 font-medium border-0 text-center">
                            {details?.yarn_sale_bill?.round_off_amount}
                        </Col>
                    </Row>
                    <Row className="border-0 border-b border-solid">
                        <Col span={2} className="p-2 font-medium ">
                        </Col>
                        <Col span={5} className="p-2 font-medium">
                        </Col>
                        <Col span={5} className="p-2 font-medium ">
                        </Col>
                        <Col span={6} className="p-2 font-medium border-0 border-r border-solid text-center">
                            <strong>NET AMOUNT</strong>
                        </Col>
                        <Col span={6} className="p-2 font-medium border-0 text-center">
                            <strong>{details?.yarn_sale_bill?.net_amount}</strong>
                        </Col>
                    </Row>
                    <Row className="border-0 border-b border-solid">
                        <Col span={4} className="p-2 font-medium">
                            Rs.(IN WORDS):
                        </Col>
                        <Col span={20} className="p-2 font-medium">
                            {toWords.convert(details?.yarn_sale_bill?.net_amount)}
                        </Col>
                    </Row>
                    <Row className="border-0 p-2" style={{borderBottom: "1px solid"}}>
                        <Col span={18} className="p-2">
                        </Col>
                        <Col span={6} className="p-2 text-right">
                            <div>
                                <strong>For, {companyInfo?.company_name}</strong>
                            </div>
                            <div>Authorised Signatory</div>
                        </Col>
                    </Row>
                </Flex>

            </Modal>
        </>
    )
}

export default YarnSaleCreditNote; 