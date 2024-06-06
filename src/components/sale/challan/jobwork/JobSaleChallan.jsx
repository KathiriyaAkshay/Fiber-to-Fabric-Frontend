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
const { Text, Title } = Typography;
import { CloseOutlined, FileTextOutlined } from "@ant-design/icons";
import { Controller, useForm } from "react-hook-form";
import dayjs from "dayjs";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ToWords } from "to-words";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { useCompanyList } from "../../../../api/hooks/company";
import * as yup from "yup"; 
import moment from "moment";
import { mutationOnErrorHandler } from "../../../../utils/mutationUtils";

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

const addSizeBeamReceive = yup.object().shape({
    invoice_number: yup.string().required("Please enter invoice no."),
    bill_date: yup.string().required("Please enter bill date"),
    due_date: yup.string().required("Please enter due date"),
    freight_value: yup.string().required("Please enter freight value"),
    freight_amount: yup.string().required("Please enter freight amount"),
    discount_value: yup.string().required("Please enter is discount"),
    discount_amount: yup.string().required("Please enter is discount"),
    SGST_value: yup.string().required("Please enter SGST value"),
    SGST_amount: yup.string().required("Please enter SGST amount"),
    CGST_value: yup.string().required("Please enter CGST value"),
    CGST_amount: yup.string().required("Please enter CGST amount"),
    IGST_value: yup.string().required("Please enter IGST value"),
    IGST_amount: yup.string().required("Please enter IGST amount"),
    // TCS_value: yup.string().required("Please enter TCS value"),
    // TCS_amount: yup.string().required("Please enter TCS amount"),
    // round_off_amount: yup.string().required("Please enter round off amount"),
    net_amount: yup.string().required("Please enter net amount"),
    // TDS_amount: yup.string().required("Please enter TDS amount"),
    // after_TDS_amount: yup.string().required("Please enter after TDS amount"),
    // quantity_rate: yup.string().required("Please enter quantity rate"),
    // quantity_amount: yup.string().required("Please enter quantity amount"),
});

const JobWorkSaleChallanModel = ({details = {}}) => {

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue,
    } = useForm({
        resolver: yupResolver(addSizeBeamReceive),
        defaultValues: {
            bill_date: dayjs(),
            due_date: dayjs(),
            discount_amount: 0, 
            discount_value: 0,
            freight_value: 0  , 
            freight_amount: 0  , 
            rate: 0, 
            amount: 0, 
            net_amount: 0, 
            IGST_value: 0, 
            SGST_value: 0, 
            CGST_value: 0, 
            SGST_amount: 0 ,
            CGST_amount: 0, 
            IGST_amount: 0, 
            round_off: 0 
            //   receive_quantity: receive_quantity,
            //   yarn_challan_id: yarn_challan_id,
            //   yarn_stock_company_id: yarn_stock_company_id,
        },
    });

    const {companyId} = useContext(GlobalContext) ; 
    const [isModelOpen, setIsModalOpen] = useState(false)   ; 
    const currentValues = watch() ; 

    const disablePastDates = (current) => {
        return current && current < new Date().setHours(0, 0, 0, 0);
    };

    const disableFutureDates = (current) => {
        return current && current > new Date().setHours(0, 0, 0, 0);
    }
    
    const onSubmit = async (values) => {}
    return(
        <>
        
            <Button onClick={() => { setIsModalOpen(true) }}>
                <FileTextOutlined />
            </Button>
            <Modal
                closeIcon={<CloseOutlined className="text-white" />}
                title={
                    <Typography.Text className="text-xl font-medium text-white">
                        Job Work Challan
                    </Typography.Text>
                }
                open={isModelOpen}
                footer={null}
                onCancel={() => { setIsModalOpen(false) }}
                className={{
                    header: "text-center"
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
                <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
                    <Flex className="flex-col border border-b-0 border-solid">
                        <Row className="p-2 border-0 border-b border-solid">
                            <Col
                                span={24}
                                className="flex items-center justify-center border"
                            >
                                <Typography.Text className="font-semibold text-center" style={{fontSize: 24}}>
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
                                span={8}
                                className="flex items-center justify-center border"
                            >   
                                <Typography.Text className="font-semibold text-center">
                                    GST IN: GST number information
                                </Typography.Text>
                            </Col>
                            <Col
                                span={8}
                                className="flex items-center justify-center border"
                            >   
                                <Typography.Text className="font-semibold text-center">
                                    PAN NO : ABHPP6021C
                                </Typography.Text>
                            </Col>
                            <Col
                                span={4}
                                className="flex items-center justify-center border"
                            >
                                <Typography.Text className="font-semibold text-center">
                                    Bill date
                                </Typography.Text>
                            </Col>

                            <Col
                                span={4}
                                className="flex items-center justify-center border"
                            >   
                               <Form.Item
                                    // label="BILL Date"
                                    name="bill_date"
                                    validateStatus={errors.bill_date ? "error" : ""}
                                    help={errors.bill_date && errors.bill_date.message}
                                    required={true}
                                    wrapperCol={{ sm: 24 }}
                                    style={{margin: 0}}
                                // className="mb-0"
                                >
                                    <Controller
                                        control={control}
                                        name="bill_date"
                                        render={({ field }) => (
                                            <DatePicker
                                                {...field}
                                                disabledDate={disableFutureDates}
                                                style={{
                                                    width: "100%",
                                                }}
                                                format="DD-MM-YYYY"
                                            />
                                        )}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row className="p-2 border-0 border-b">
                            <Col
                                span={4}
                                className="flex items-right justify-center border"
                            >
                                <Typography.Text className="font-semibold text-center">
                                   M/s.
                                </Typography.Text>
                            </Col>
                            <Col
                                span={8}
                                className="flex items-right justify-center border"
                            >
                                <Typography.Text className="font-semibold text-center">
                                    SUPPLIER_2
                                    ADDRESS OF SUPPLIER OF SUPPLIER NAME 123
                                </Typography.Text>
                            </Col>
                            <Col
                                span={4}
                                className="flex items-right justify-center border"
                            >
                                <Typography.Text className="font-semibold text-center">
                                   INVOICE NO
                                </Typography.Text>
                            </Col>
                            <Col
                                span={8}
                                className="flex items-right justify-left border"
                            >
                                <Typography.Text className="font-semibold text-center text-left">
                                    12
                                </Typography.Text>
                            </Col>
                        </Row>
                        <Row className="p-2 border-0 border-b">
                            <Col
                                span={4}
                                className="flex items-right justify-center border"
                            >
                                <Typography.Text className="font-semibold text-center">
                                    GST IN
                                </Typography.Text>
                            </Col>
                            <Col
                                span={8}
                                className="flex items-right justify-left border"
                            >
                                <Typography.Text className="font-semibold text-center">
                                    24ABHPP6021C1Z4              
                                </Typography.Text>
                            </Col>
                            <Col
                                span={4}
                                className="flex items-right justify-center border"
                            >
                                <Typography.Text className="font-semibold text-center">
                                    CHALLAN NO.
                                </Typography.Text>
                            </Col>
                            <Col
                                span={8}
                                className="flex items-right justify-left border"
                            >
                                <Typography.Text className="font-semibold text-center">
                                    Y-6
                                </Typography.Text>
                            </Col>
                        </Row>
                        <Row className="p-3 border-0 border-b border-solid mt-4">
                            <Col
                                span={4}
                                className="flex items-right justify-center border"
                            >
                                <Typography.Text className="font-semibold text-center">
                                    E-WAY BILL NO
                                </Typography.Text>
                            </Col>
                            <Col
                                span={8}
                                className="flex items-right justify-left borde"
                            >
                                <Form.Item
                                    // label="Invoice No."
                                    name="invoice_number"
                                    validateStatus={errors.invoice_number ? "error" : ""}
                                    help={errors.invoice_number && errors.invoice_number.message}
                                    required={true}
                                    className="mb-0"
                                >
                                    <Controller
                                        control={control}
                                        name="invoice_number"
                                        render={({ field }) => (
                                            <Input {...field} placeholder="Invoice No." />
                                        )}
                                    />
                                </Form.Item>
                            </Col>
                            <Col
                                span={4}
                                className="flex items-right justify-center border"
                            >
                                <Typography.Text className="font-semibold text-center">
                                    VEHICLE NO
                                </Typography.Text>
                            </Col>
                            <Col
                                span={8}
                                className="flex items-right justify-left border"
                            >
                                <Typography.Text className="font-semibold text-center">
                                    Y-6
                                </Typography.Text>
                            </Col>
                        </Row>

                        <Row className="border-0 border-b border-solid !m-0">
                            <Col
                                span={8}
                                className="p-2 font-medium border-0 border-r border-solid"
                            >
                                DENNIER
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
                                CARTOON
                            </Col>
                            <Col
                                span={3}
                                className="p-2 font-medium border-0 border-r border-solid"
                            >
                                Total KG
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
                                DENNIER
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
                                CARTOON
                            </Col>
                            <Col
                                span={3}
                                className="p-2 font-medium border-0 border-r border-solid"
                            >
                                Total KG
                            </Col>
                            <Col
                                span={4}
                                className="p-2 font-medium border-0 border-r border-solid"
                            >
                                <Form.Item
                                    // label="Invoice No."
                                    name="rate"
                                    validateStatus={errors.rate ? "error" : ""}
                                    help={errors.rate && errors.rate.message}
                                    required={true}
                                    className="mb-0"
                                >
                                    <Controller
                                        control={control}
                                        name="rate"
                                        render={({ field }) => (
                                            <Input {...field}
                                                placeholder="Rate" 
                                                type="number" 
                                                onChange={(e) => {
                                                    setValue("rate", e.target.value) ; 
                                                }}
                                            />
                                        )}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={4} className="p-2 font-medium">
                                {currentValues?.amount}
                            </Col>
                        </Row>
                        <Row className="border-0 border-b !m-0">
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
                                Discount
                            </Col>
                            <Col
                                span={4}
                                className="p-2 font-medium border-0 border-r border-solid"
                            >
                                <Form.Item
                                    // label="Invoice No."
                                    name="discount_value"
                                    validateStatus={errors.discount_value ? "error" : ""}
                                    help={errors.discount_value && errors.discount_value.message}
                                    required={true}
                                // className="mb-0"
                                >
                                    <Controller
                                        control={control}
                                        name="discount_value"
                                        render={({ field }) => (
                                            <Input {...field}
                                                placeholder="Discount" 
                                                type="number" 
                                                onChange={(e) => {
                                                    setValue("discount_value", e.target.value) ; 
                                                }}
                                            />
                                        )}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={4} className="p-2 font-medium">
                                {currentValues?.amount}
                            </Col>
                        </Row>
                        <Row className="border-0 border-b !m-0">
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
                                SGST(%)
                            </Col>
                            <Col
                                span={4}
                                className="p-2 font-medium border-0 border-r border-solid"
                            >
                                <Form.Item
                                    // label="Invoice No."
                                    name="SGST_value"
                                    validateStatus={errors.SGST_value ? "error" : ""}
                                    help={errors.SGST_value && errors.SGST_value.message}
                                    required={true}
                                // className="mb-0"
                                >
                                    <Controller
                                        control={control}
                                        name="SGST_value"
                                        render={({ field }) => (
                                            <Input {...field}
                                                placeholder="SGST" 
                                                type="number" 
                                                onChange={(e) => {
                                                    setValue("SGST_value", e.target.value) ; 
                                                    let tempDiscount = parseFloat((currentValues?.amount*e.target.value)/ 100) ; 
                                                    // console.log(tempDiscount); 
                                                    // console.log(parseFloat(currentValues?.amount - tempDiscount).toFixed(2));
                                                    // setValue("discount_amount", parseFloat(currentValues?.amount - tempDiscount).toFixed(2))
                                                }}
                                            />
                                        )}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={4} className="p-2 font-medium">
                                {currentValues?.amount}
                            </Col>
                        </Row>
                        <Row className="border-0 border-b !m-0">
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
                                CGST(%)
                            </Col>
                            <Col
                                span={4}
                                className="p-2 font-medium border-0 border-r border-solid"
                            >
                                <Form.Item
                                    // label="Invoice No."
                                    name="CGST_value"
                                    validateStatus={errors.SGST_value ? "error" : ""}
                                    help={errors.SGST_value && errors.SGST_value.message}
                                    required={true}
                                // className="mb-0"
                                >
                                    <Controller
                                        control={control}
                                        name="CGST_value"
                                        render={({ field }) => (
                                            <Input {...field}
                                                placeholder="SGST" 
                                                type="number" 
                                                onChange={(e) => {
                                                    setValue("CGST_value", e.target.value) ; 
                                                    let tempDiscount = parseFloat((currentValues?.amount*e.target.value)/ 100) ; 
                                                    // console.log(tempDiscount); 
                                                    // console.log(parseFloat(currentValues?.amount - tempDiscount).toFixed(2));
                                                    // setValue("discount_amount", parseFloat(currentValues?.amount - tempDiscount).toFixed(2))
                                                }}
                                            />
                                        )}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={4} className="p-2 font-medium">
                                {currentValues?.amount}
                            </Col>
                        </Row>
                        <Row className="border-0 border-b !m-0">
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
                                IGST(%)
                            </Col>
                            <Col
                                span={4}
                                className="p-2 font-medium border-0 border-r border-solid"
                            > 
                                <Form.Item
                                    // label="Invoice No."
                                    name="IGST_value"
                                    validateStatus={errors.IGST_value ? "error" : ""}
                                    help={errors.IGST_value && errors.IGST_value.message}
                                    required={true}
                                // className="mb-0"
                                >
                                    <Controller
                                        control={control}
                                        name="IGST_value"
                                        render={({ field }) => (
                                            <Input {...field}
                                                placeholder="SGST" 
                                                type="number" 
                                                onChange={(e) => {
                                                    setValue("IGST_value", e.target.value) ; 
                                                    let tempDiscount = parseFloat((currentValues?.amount*e.target.value)/ 100) ; 
                                                    // console.log(tempDiscount); 
                                                    // console.log(parseFloat(currentValues?.amount - tempDiscount).toFixed(2));
                                                    // setValue("discount_amount", parseFloat(currentValues?.amount - tempDiscount).toFixed(2))
                                                }}
                                            />
                                        )}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={4} className="p-2 font-medium">
                                {currentValues?.amount}
                            </Col>
                        </Row>
                        <Row className="border-0 border-b border-solid !m-0">
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
                                Round Off
                            </Col>
                            <Col
                                span={4}
                                className="p-2 font-medium border-0 border-r border-solid"
                            > 
                            </Col>
                            <Col span={4} className="p-2 font-medium">
                                {currentValues?.amount}
                            </Col>
                        </Row>
                        <Row className="border-0 border-b border-solid !m-0">
                            <Col
                                span={8}
                                className="p-2 font-medium border-0 border-r "
                            >
                                NO DYEING GUARANTEE
                            </Col>
                            <Col
                                span={8}
                                className="p-2 font-medium border-0 border-r border-solid"
                            >
                                <Form.Item
                                    // label="BILL Date"
                                    name="bill_date"
                                    validateStatus={errors.due_date ? "error" : ""}
                                    help={errors.bill_date && errors.due_date.message}
                                    required={true}
                                    wrapperCol={{ sm: 24 }}
                                    style={{marginBottom: 0}}
                                >
                                    <Controller
                                        control={control}
                                        name="due_date"
                                        render={({ field }) => (
                                            <DatePicker
                                                {...field}
                                                style={{
                                                    width: "100%",
                                                }}
                                                format="DD-MM-YYYY"
                                                disabledDate={disablePastDates}
                                            />
                                        )}
                                    />
                                </Form.Item>
                            </Col>
                            <Col
                                span={4}
                                className="p-2 font-medium border-0 border-r border-solid"
                            > 
                                NET AMOUNT
                            </Col>
                            <Col span={4} className="p-2 font-medium">
                                {currentValues?.amount}
                            </Col>
                        </Row>
                        <Row className="border-0 border-b border-solid !m-0">
                            <Col
                                span={24}
                                className="p-2 font-medium border-0 border-r "
                            >
                                NET RATE: 10Rs/Kg
                            </Col>
                        </Row>
                        <Row className="border-0 border-b !m-0 p-4">
                            <Col span={16} className="p-2">
                                <Title level={5} className="m-0">
                                ➤ TERMS OF SALES :-
                                </Title>
                                <Text className="block">1. Interest at 2% per month will be charged remaining unpaid from the date bill.</Text>
                                <Text className="block">2. Complaint if any regarding this invoice must be settled within 24 hours.</Text>
                                <Text className="block">3. Disputes shall be settled in SURAT court only.</Text>
                                <Text className="block">4. We are not responsible for processed goods & width.</Text>
                                <Text className="block">5. Subject to SURAT Jurisdiction.</Text>
                                <Text className="block mt-2">
                                </Text>
                            </Col>
                            <Col span={8} className="p-2 text-right">
                                <Text strong>For, SONU TEXTILES</Text>
                            </Col>
                        </Row>
                        <Row className="border-0 border-b border-solid !m-0 p-4" style={{paddingTop:0}}>
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
                                PARTY'S BANK
                            </Col>
                        </Row>
                        <Row className="border-0 border-b border-solid !m-0">
                            <Col
                                span={6}
                                className="p-2 font-medium border-0 border-r border-solid"
                            >
                            </Col>
                            <Col
                                span={6}
                                className="p-2 font-medium border-0 border-r border-solid"
                            >
                            </Col>
                            <Col
                                span={6}
                                className="p-2 font-medium border-0 border-r border-solid"
                            >
                            </Col>
                            <Col
                                span={6}
                                className="p-2 font-medium border-0 border-r border-solid"
                            >
                            </Col>
                        </Row>
                    </Flex>
                </Form>
            </Modal>
        </>
    )
}

export default JobWorkSaleChallanModel ; 