import {
    Button,
    Col,
    Flex,
    Form,
    Input,
    Modal,
    Row,
    Typography,
    message,
} from "antd";
import { useEffect, useRef, useState, useContext } from "react";
const { Text, Title } = Typography;
import * as yup from "yup";
import { CloseOutlined } from "@ant-design/icons";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { ToWords } from "to-words";
import moment from "moment";
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

export default function JobGrayBillMultiplePrint({ details, isModelOpen, handleCloseModal }) {
    console.log(details);

    const { companyId, companyListRes } = useContext(GlobalContext);
    const [companyInfo, setCompanyInfo] = useState({});
    const ComponentRef = useRef();

    useEffect(() => {
        companyListRes?.rows?.map((element) => {
            if (element?.id == details[0]?.company_id) {
                setCompanyInfo(element);
            }
        });
    }, [details, companyListRes]);

    const pageStyle = `
        @media print {
        .print-instructions {
            display: none;
        }

        .sale-challan-table{
        page-break-after: always;
        }

        .page-break{
        display: none;
        }

        .printable-content {
        padding: 20px; /* Add padding for print */
        width: 100%;
        }

        .print-div{
        height: auto; 
        overflow: hidden; 
        page-break-inside: avoid;
        }
        
        .final-total-count{
        border-top: 1px solid ;
        }

        .sorting-option{
        display: none !important; 
        }
    `;

    return (
        <>
            <Modal
                closeIcon={<CloseOutlined className="text-white" />}
                title={
                    <Typography.Text className="text-xl font-medium text-white">
                        Job Grey Sale Bill Print
                    </Typography.Text>
                }
                open={isModelOpen}
                footer={() => {
                    return (
                      <>
                        <ReactToPrint
                          trigger={() => (
                            <Flex align="center" justify="end">
                              <Button type="primary" style={{ marginTop: 15 }}>
                                PRINT
                              </Button>
                            </Flex>
                          )}
                          content={() => ComponentRef.current}
                          pageStyle={pageStyle}
                        />
                      </>
                    );
                  }}               
                onCancel={handleCloseModal}
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
                        maxHeight: "80vh",
                        overflowY: "auto"
                    },
                    footer: {
                        paddingBottom: 10,
                        paddingRight: 10,
                        backgroundColor: "#efefef",
                    }
                }}
                width={"70vw"}
            >

                <div style={{
                    marginLeft: 1,
                    marginRight: 1
                }} ref={ComponentRef}>

                    {details?.map((element) => {
                        let initialDate = new Date(element?.createdAt);
                        let daysToAdd = element?.due_days;
                        let newDate = new Date(initialDate);
                        newDate.setDate(initialDate.getDate() + daysToAdd);

                        let dueDate = moment(newDate).format("DD-MM-YYYY") ; 

                        return (
                            <>
                                <Flex className="flex-col border border-b-0 border-solid sale-challan-table"
                                    style={{marginTop: 20}}>
                                    <Row className="p-2 border-0 border-b border-solid">
                                        <Col
                                            span={24}
                                            className="flex items-center justify-center border"
                                        >
                                            <div>:: SHREE GANESHAY NAMAH ::</div>
                                        </Col>
                                        <Col
                                            span={24}
                                            className="flex items-center justify-center border"
                                            style={{ marginTop: -20 }}
                                        >
                                            <Typography.Text className="font-semibold text-center">
                                                <h3>{companyInfo?.company_name}</h3>
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
                                                {`${companyInfo?.address_line_1} ${companyInfo?.address_line_2 == null
                                                    ? ""
                                                    : companyInfo?.address_line_2
                                                    }, ${companyInfo?.city}, ${companyInfo?.state} - ${companyInfo?.pincode
                                                    }, ${companyInfo?.country}`}
                                                <br />
                                                MOBILE NO: {companyInfo?.company_contact}, PAYMENT:{" "}
                                                {companyInfo?.account_number}
                                            </Typography.Text>
                                        </Col>
                                    </Row>

                                    <Row className="border-0 border-b border-solid !m-0 p-2">
                                        <Col span={12} className="border-r pr-4">
                                            <Typography.Text className="block font-semibold">
                                                M/s.
                                            </Typography.Text>
                                            <Typography.Text>
                                                <strong>{`${element?.party?.first_name} ${element?.party?.last_name}`}</strong>
                                            </Typography.Text>
                                            <Typography.Text className="block">
                                                {element?.party?.address}
                                            </Typography.Text>
                                            <Typography.Text
                                                className="block mt-2 font-semibold"
                                                style={{ color: "black" }}
                                            >
                                                GST IN
                                            </Typography.Text>
                                            <Typography.Text>{element?.party?.gst_no}</Typography.Text>
                                            <Typography.Text className="block mt-2">
                                                E-WAY BILL NO.
                                            </Typography.Text>
                                        </Col>
                                        <Col span={12} className="pl-4">
                                            <Row>
                                                <Col span={12}>
                                                    <Typography.Text className="block font-semibold">
                                                        INVOICE NO.
                                                    </Typography.Text>
                                                    <Typography.Text>
                                                        {element?.invoice_no}
                                                    </Typography.Text>
                                                </Col>
                                                <Col span={12}>
                                                    <Typography.Text className="block font-semibold">
                                                        ORDER NO.
                                                    </Typography.Text>
                                                </Col>
                                            </Row>
                                            <Row className="mt-2">
                                                <Col span={12}>
                                                    <Typography.Text className="block font-semibold">
                                                        PARTY ORDER NO.
                                                    </Typography.Text>
                                                </Col>
                                                <Col span={12}>
                                                    <Typography.Text className="block font-semibold">
                                                        CHALLAN NO.
                                                    </Typography.Text>
                                                    <Typography.Text>21312</Typography.Text>
                                                </Col>
                                            </Row>
                                            <Row className="mt-2">
                                                <Col span={12}>
                                                    <Typography.Text className="block font-semibold">
                                                        BROKER NAME
                                                    </Typography.Text>
                                                    <Typography.Text>
                                                        {element?.broker?.first_name}{" "}
                                                        {element?.broker?.last_name}
                                                    </Typography.Text>
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
                                            {element.inhouse_quality.quality_name}{" "}
                                            {`(${element.inhouse_quality.quality_weight}KG)`}
                                        </Col>
                                        <Col
                                            span={2}
                                            className="p-2 font-medium border-0 border-r border-solid"
                                        >
                                            {element.hsn_no}
                                        </Col>
                                        <Col
                                            span={3}
                                            className="p-2 font-medium border-0 border-r border-solid"
                                        >
                                            {element.total_taka}
                                        </Col>
                                        <Col
                                            span={3}
                                            className="p-2 font-medium border-0 border-r border-solid"
                                        >
                                            {element?.total_meter}
                                        </Col>
                                        <Col
                                            span={4}
                                            className="p-2 font-medium border-0 border-r border-solid"
                                        >
                                            {element?.rate}
                                        </Col>
                                        <Col span={4} className="p-2 font-medium">
                                            {parseFloat(parseFloat(element?.total_meter)*parseFloat(element?.rate)).toFixed(2)}
                                        </Col>
                                    </Row>

                                    <Row className="border-0 border-b !m-0">
                                        <Col
                                            span={8}
                                            className="p-2 font-medium border-0 border-r border-solid"
                                        ></Col>
                                        <Col
                                            span={2}
                                            className="p-2 font-medium border-0 border-r border-solid"
                                        ></Col>
                                        <Col
                                            span={3}
                                            className="p-2 font-medium border-0 border-r border-solid"
                                        ></Col>
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
                                            {element?.discount_value}
                                        </Col>
                                        <Col span={4} className="p-2 font-medium">
                                            {element?.discount_amount}
                                        </Col>
                                    </Row>

                                    <Row className="border-0 border-b !m-0">
                                        <Col
                                            span={8}
                                            className="p-2 font-medium border-0 border-r border-solid"
                                        ></Col>
                                        <Col
                                            span={2}
                                            className="p-2 font-medium border-0 border-r border-solid"
                                        ></Col>
                                        <Col
                                            span={3}
                                            className="p-2 font-medium border-0 border-r border-solid"
                                        ></Col>
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
                                            {/* TOTAL AMOUNT */}
                                        </Col>
                                        <Col span={4} className="p-2 font-medium">
                                            {element.amount}
                                        </Col>
                                    </Row>

                                    <Row className="border-0 border-b !m-0">
                                        <Col
                                            span={8}
                                            className="p-2 font-medium border-0 border-r border-solid"
                                        ></Col>
                                        <Col
                                            span={2}
                                            className="p-2 font-medium border-0 border-r border-solid"
                                        ></Col>
                                        <Col
                                            span={3}
                                            className="p-2 font-medium border-0 border-r border-solid"
                                        ></Col>
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
                                            {element?.SGST_value}
                                        </Col>
                                        <Col span={4} className="p-2 font-medium">
                                            {element?.SGST_amount}
                                        </Col>
                                    </Row>

                                    <Row className="border-0 border-b !m-0">
                                        <Col
                                            span={8}
                                            className="p-2 font-medium border-0 border-r border-solid"
                                        ></Col>
                                        <Col
                                            span={2}
                                            className="p-2 font-medium border-0 border-r border-solid"
                                        ></Col>
                                        <Col
                                            span={3}
                                            className="p-2 font-medium border-0 border-r border-solid"
                                        ></Col>
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
                                            {element?.CGST_value}
                                        </Col>
                                        <Col span={4} className="p-2 font-medium">
                                            {element?.CGST_amount}
                                        </Col>
                                    </Row>

                                    <Row className="border-0 border-b !m-0">
                                        <Col
                                            span={8}
                                            className="p-2 font-medium border-0 border-r border-solid"
                                        ></Col>
                                        <Col
                                            span={2}
                                            className="p-2 font-medium border-0 border-r border-solid"
                                        ></Col>
                                        <Col
                                            span={3}
                                            className="p-2 font-medium border-0 border-r border-solid"
                                        ></Col>
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
                                            {element?.IGST_value}
                                        </Col>
                                        <Col span={4} className="p-2 font-medium">
                                            {element?.IGST_amount}
                                        </Col>
                                    </Row>

                                    <Row className="border-0 border-b !m-0">
                                        <Col
                                            span={8}
                                            className="p-2 font-medium border-0 border-r border-solid"
                                        ></Col>
                                        <Col
                                            span={2}
                                            className="p-2 font-medium border-0 border-r border-solid"
                                        ></Col>
                                        <Col
                                            span={3}
                                            className="p-2 font-medium border-0 border-r border-solid"
                                        ></Col>
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
                                            0
                                        </Col>
                                    </Row>

                                    <Row className="border-0 border-b border-solid !m-0">
                                        <Col
                                            span={8}
                                            className="p-2 font-medium border-0 border-r border-solid"
                                        >
                                            Avg Rate: {parseFloat(parseFloat(element?.net_amount)/parseFloat(element?.total_taka)).toFixed(2)}
                                        </Col>
                                        <Col
                                            span={2}
                                            className="p-2 font-medium border-0 border-r border-solid"
                                        ></Col>
                                        <Col
                                            span={3}
                                            className="p-2 font-medium border-0 border-r border-solid"
                                        ></Col>
                                        <Col
                                            span={3}
                                            className="p-2 font-medium border-0 border-r border-solid"
                                        >
                                            <div style={{ color: "gray" }}>Round off</div>
                                        </Col>
                                        <Col
                                            span={4}
                                            className="p-2 font-medium border-0 border-r border-solid"
                                        ></Col>
                                        <Col span={4} className="p-2 font-medium">
                                            {element?.round_off_amount}
                                        </Col>
                                    </Row>

                                    <Row className="border-0 border-b border-solid !m-0 p-2">
                                        <Col span={18}>
                                            <Typography.Text className="block font-semibold">
                                                ♦ DELIVERY AT:
                                            </Typography.Text>
                                            <Typography.Text className="block font-semibold mt-1">
                                                <strong>{`${element?.party?.first_name} ${element?.party?.last_name}`}</strong>
                                            </Typography.Text>
                                            <Typography.Text className="block mt-1">
                                                {element?.party?.address}
                                            </Typography.Text>
                                        </Col>
                                        <Col span={6} className="flex justify-end items-start"></Col>
                                    </Row>
                                    <Row className="border-0 border-b border-solid !m-0 ">
                                        <Col
                                            span={13}
                                            className="pt-2 pb-2 pl-2 border-0 border-r border-solid"
                                        >
                                            <Typography.Text className="font-semibold">
                                                NO DYEING & BLOOMING GUARANTEE
                                            </Typography.Text>
                                        </Col>
                                        <Col
                                            span={3}
                                            className="p-2 font-medium border-0 border-r border-solid"
                                        >
                                            <div style={{ color: "gray" }}>Due date: {dueDate}</div>
                                        </Col>
                                        <Col
                                            span={4}
                                            className="p-2 font-medium border-0 border-r border-solid"
                                        >
                                            NET AMOUNT
                                        </Col>
                                        <Col span={4} className="p-2 font-medium">
                                            {element?.net_amount}
                                        </Col>
                                    </Row>
                                    <Row className="border-0 border-b border-solid !m-0 ">
                                        <Col span={24} className="pt-2 pb-2 pl-2 border-0">
                                            <Typography.Text className="font-semibold">
                                                Tax Amount(IN WORDS):{" "}
                                                {toWords.convert(element?.net_amount)}
                                            </Typography.Text>
                                        </Col>
                                    </Row>

                                    <Row className="border-0 border-b !m-0 p-4">
                                        <Col span={16} className="p-2">
                                            <Title level={5} className="m-0">
                                                ➤ TERMS OF SALES :-
                                            </Title>
                                            <Text
                                                className="block"
                                                style={{ color: "#000", fontWeight: 600 }}
                                            >
                                                1. Interest at 2% per month will be charged remaining unpaid
                                                from the date bill.
                                            </Text>
                                            <Text
                                                className="block"
                                                style={{ color: "#000", fontWeight: 600 }}
                                            >
                                                2. Complaint if any regarding this invoice must be settled
                                                within 24 hours.
                                            </Text>
                                            <Text
                                                className="block"
                                                style={{ color: "#000", fontWeight: 600 }}
                                            >
                                                3. Disputes shall be settled in SURAT court only.
                                            </Text>
                                            <Text
                                                className="block"
                                                style={{ color: "#000", fontWeight: 600 }}
                                            >
                                                4. We are not responsible for processed goods & width.
                                            </Text>
                                            <Text
                                                className="block"
                                                style={{ color: "#000", fontWeight: 600 }}
                                            >
                                                5. Subject to SURAT Jurisdiction.
                                            </Text>
                                            <Text className="block mt-2"></Text>
                                        </Col>
                                        <Col span={8} className="p-2 text-right">
                                            <Text strong>For, {companyInfo?.company_name}</Text>
                                        </Col>
                                    </Row>

                                    <Row
                                        className="border-0 border-b border-solid !m-0 p-4"
                                        style={{ paddingTop: 0 }}
                                    >
                                        <Col span={16} className="p-2">
                                            <Text strong>Bank Details:</Text> {companyInfo?.bank_name}
                                            <br />
                                            <Text strong>A/C No:</Text> {companyInfo?.account_number}
                                            <br />
                                            <Text strong>IFSC Code:</Text> {companyInfo?.ifsc_code}
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
                                        <Col span={6} className="p-2 font-medium border-0">
                                            {"PARTY'S BANK"}
                                        </Col>
                                    </Row>
                                </Flex>
                            </>
                        )
                    })}

                </div>
            </Modal>
        </>
    )
}