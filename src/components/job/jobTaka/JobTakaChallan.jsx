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
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ToWords } from "to-words";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { useCompanyList } from "../../../api/hooks/company";
import { mutationOnErrorHandler } from "../../../utils/mutationUtils";
const { Text } = Typography;
import moment from "moment";

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
    order_id: yup.string().required("Please select order no."),
    receive_quantity: yup.string().required("Please enter receive quantity"),
    supplier_company_id: yup.string().required("Please select supplier company"),
    invoice_no: yup.string().required("Please enter invoice no."),
    yarn_stock_company_id: yup
        .string()
        .required("Please enter yarn stock company"),
    bill_date: yup.string().required("Please enter bill date"),
    due_date: yup.string().required("Please enter due date"),
    yarn_challan_id: yup.string().required("Please enter yarn challan"),
    freight_value: yup.string().required("Please enter freight value"),
    freight_amount: yup.string().required("Please enter freight amount"),
    is_discount: yup.string().required("Please enter is discount"),
    discount_brokerage_value: yup
        .string()
        .required("Please enter discount brokerage value"),
    discount_brokerage_amount: yup
        .string()
        .required("Please enter discount brokerage amount"),
    SGST_value: yup.string().required("Please enter SGST value"),
    SGST_amount: yup.string().required("Please enter SGST amount"),
    CGST_value: yup.string().required("Please enter CGST value"),
    CGST_amount: yup.string().required("Please enter CGST amount"),
    TCS_value: yup.string().required("Please enter TCS value"),
    TCS_amount: yup.string().required("Please enter TCS amount"),
    IGST_value: yup.string().required("Please enter IGST value"),
    IGST_amount: yup.string().required("Please enter IGST amount"),
    // round_off_amount: yup.string().required("Please enter round off amount"),
    net_amount: yup.string().required("Please enter net amount"),
    TDS_amount: yup.string().required("Please enter TDS amount"),
    after_TDS_amount: yup.string().required("Please enter after TDS amount"),
    quantity_rate: yup.string().required("Please enter quantity rate"),
    quantity_amount: yup.string().required("Please enter quantity amount"),
});

const JobTakaChallanModal = ({ details = {} }) => {
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
            freight_value: 0,
            freight_amount: 0,
            rate: 0,
            amount: 0,
            net_amount: 0,
            IGST_value: 0,
            SGST_value: 0,
            CGST_value: 0,
            SGST_amount: 0,
            CGST_amount: 0,
            IGST_amount: 0,
            round_off: 0
            //   receive_quantity: receive_quantity,
            //   yarn_challan_id: yarn_challan_id,
            //   yarn_stock_company_id: yarn_stock_company_id,
        },
    });
    const { companyId } = useContext(GlobalContext);
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [supplierName, setSupplierName] = useState();
    const { data: companyListRes, isLoading: isLoadingCompanyList } =
        useCompanyList();
    const currentFValue = watch() ; 

    const onSubmit = async (values) => {

    }

    const disablePastDates = (current) => {
        return current && current < new Date().setHours(0, 0, 0, 0);
    };

    const disableFutureDates = (current) => {
        return current && current > new Date().setHours(0, 0, 0, 0);
    }

    return (
        <>
            <Button onClick={() => { setIsModalOpen(true) }}>
                <FileTextOutlined />
            </Button>
            <Modal
                closeIcon={<CloseOutlined className="text-white" />}
                title={
                    <Typography.Text className="text-xl font-medium text-white">
                        Received Job Bill
                    </Typography.Text>
                }
                open={isModalOpen}
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
                            <Col span={12} className="p-3 border-right">
                                <Row>
                                    <Col span={24}>
                                        <Text strong>To,</Text>
                                    </Col>
                                    <Col span={24}>
                                        <Text>POWER(SONU TEXTILES)</Text>
                                    </Col>
                                    <Col span={24} className="mt-1">
                                        <Text strong>Gst In</Text>
                                    </Col>
                                    <Col span={24}>
                                        <Text>24ABHPP6021C1Z4</Text>
                                    </Col>
                                    <Col span={24} className="mt-2">
                                        <Text strong>Invoice No</Text>
                                        <Form.Item name="invoice_no" noStyle>
                                            <Input defaultValue="907" style={{ width: "100px", marginLeft: "10px" }} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>
                            <Col span={12} className="p-3">
                                <Row>
                                    <Col span={24}>
                                        <Text strong>From,</Text>
                                    </Col>
                                    <Col span={24}>
                                        <Text>SONU TEXTILES</Text>
                                    </Col>
                                    <Col span={24} className="mt-1">
                                        <Text strong>Gst In</Text>
                                    </Col>
                                    <Col span={24}>
                                        <Text>24ABHPP6021C1Z4</Text>
                                    </Col>
                                    <Col span={24} className="mt-2">
                                        <Text strong>Bill Date</Text>
                                        <Form.Item name="bill_date" noStyle>
                                            <DatePicker defaultValue={moment("31-05-2024", "DD-MM-YYYY")} format="DD-MM-YYYY" style={{ marginLeft: "10px" }} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>

                        <Row className="border-0 border-b border-solid">
                            <Col span={6} className="p-2 font-medium border-0 border-r border-solid"><Text strong>QUALITY NAME</Text></Col>
                            <Col span={4} className="p-2 font-medium border-0 border-r border-solid"><Text strong>CHALLAN NO</Text></Col>
                            <Col span={2} className="p-2 font-medium border-0 border-r border-solid"><Text strong>TAKA</Text></Col>
                            <Col span={4} className="p-2 font-medium border-0 border-r border-solid"><Text strong>METER</Text></Col>
                            <Col span={4} className="p-2 font-medium border-0 border-r border-solid"><Text strong>RATE</Text></Col>
                            <Col span={4} className="p-2 font-medium border-0 border-r"><Text strong>AMOUNT</Text></Col>
                        </Row>
                        <Row className="border-0 border-b">
                            <Col span={6} className="p-2 font-medium border-0 border-r border-solid">33P PALLU PATERN (SDFSDFSDFSDFSDFSD) - (8KG)</Col>
                            <Col span={4} className="p-2 font-medium border-0 border-r border-solid">684</Col>
                            <Col span={2} className="p-2 font-medium border-0 border-r border-solid">343</Col>
                            <Col span={4} className="p-2 font-medium border-0 border-r border-solid">12</Col>
                            <Col span={4} className="p-2 font-medium border-0 border-r border-solid">
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
                            <Col span={4} className="p-2 font-medium border-0 border-r">
                                {currentFValue?.amount}
                            </Col>
                        </Row>
                        <Row className="border-0 border-b">
                            <Col span={6} className="p-2 font-medium border-0 border-r border-solid"></Col>
                            <Col span={4} className="p-2 font-medium border-0 border-r border-solid"></Col>
                            <Col span={2} className="p-2 font-medium border-0 border-r border-solid"></Col>
                            <Col span={4} className="p-2 font-medium border-0 border-r border-solid">Discount(%)</Col>
                            <Col span={4} className="p-2 font-medium border-0 border-r border-solid">
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
                                                    setValue("rate", e.target.value) ; 
                                                }}
                                            />
                                        )}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={4} className="p-2 font-medium border-0 border-r">
                                {currentFValue?.amount}
                            </Col>
                        </Row>
                        <Row className="border-0 border-b">
                            <Col span={6} className="p-2 font-medium border-0 border-r border-solid"></Col>
                            <Col span={4} className="p-2 font-medium border-0 border-r border-solid"></Col>
                            <Col span={2} className="p-2 font-medium border-0 border-r border-solid"></Col>
                            <Col span={4} className="p-2 font-medium border-0 border-r border-solid">SGST(%)</Col>
                            <Col span={4} className="p-2 font-medium border-0 border-r border-solid">
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
                                                    setValue("rate", e.target.value) ; 
                                                }}
                                            />
                                        )}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={4} className="p-2 font-medium border-0 border-r">
                                {currentFValue?.amount}
                            </Col>
                        </Row>
                        <Row className="border-0 border-b">
                            <Col span={6} className="p-2 font-medium border-0 border-r border-solid"></Col>
                            <Col span={4} className="p-2 font-medium border-0 border-r border-solid"></Col>
                            <Col span={2} className="p-2 font-medium border-0 border-r border-solid"></Col>
                            <Col span={4} className="p-2 font-medium border-0 border-r border-solid">CGST(%)</Col>
                            <Col span={4} className="p-2 font-medium border-0 border-r border-solid">
                                <Form.Item
                                    // label="Invoice No."
                                    name="CGST_value"
                                    validateStatus={errors.CGST_value ? "error" : ""}
                                    help={errors.CGST_value && errors.CGST_value.message}
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
                                                }}
                                            />
                                        )}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={4} className="p-2 font-medium border-0 border-r">
                                {currentFValue?.amount}
                            </Col>
                        </Row>
                        <Row className="border-0 border-b">
                            <Col span={6} className="p-2 font-medium border-0 border-r border-solid"></Col>
                            <Col span={4} className="p-2 font-medium border-0 border-r border-solid"></Col>
                            <Col span={2} className="p-2 font-medium border-0 border-r border-solid"></Col>
                            <Col span={4} className="p-2 font-medium border-0 border-r border-solid">IGST(%)</Col>
                            <Col span={4} className="p-2 font-medium border-0 border-r border-solid">
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
                                                placeholder="IGST" 
                                                type="number" 
                                                onChange={(e) => {
                                                    setValue("IGST_value", e.target.value) ; 
                                                }}
                                            />
                                        )}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={4} className="p-2 font-medium border-0 border-r">
                                {currentFValue?.amount}
                            </Col>
                        </Row>
                        <Row className="border-0 border-b">
                            <Col span={6} className="p-2 font-medium border-0 border-r border-solid"></Col>
                            <Col span={4} className="p-2 font-medium border-0 border-r border-solid"></Col>
                            <Col span={2} className="p-2 font-medium border-0 border-r border-solid"></Col>
                            <Col span={4} className="p-2 font-medium border-0 border-r border-solid">TCS(%)</Col>
                            <Col span={4} className="p-2 font-medium border-0 border-r border-solid">
                                <Form.Item
                                    // label="Invoice No."
                                    name="TCS_value"
                                    validateStatus={errors.IGST_value ? "error" : ""}
                                    help={errors.IGST_value && errors.IGST_value.message}
                                    required={true}
                                    // className="mb-0"
                                >
                                    <Controller
                                        control={control}
                                        name="TCS_value"
                                        render={({ field }) => (
                                            <Input {...field}
                                                placeholder="TCS" 
                                                type="number" 
                                                onChange={(e) => {
                                                    setValue("TCS_value", e.target.value) ; 
                                                }}
                                            />
                                        )}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={4} className="p-2 font-medium border-0 border-r">
                                {currentFValue?.amount}
                            </Col>
                        </Row>
                        <Row className="border-0 border-b border-solid">
                            <Col span={6} className="p-2 font-medium border-0 border-r border-solid"></Col>
                            <Col span={4} className="p-2 font-medium border-0 border-r border-solid"></Col>
                            <Col span={2} className="p-2 font-medium border-0 border-r border-solid"></Col>
                            <Col span={4} className="p-2 font-medium border-0 border-r border-solid">Round Off</Col>
                            <Col span={4} className="p-2 font-medium border-0 border-r border-solid">
                            </Col>
                            <Col span={4} className="p-2 font-medium border-0 border-r">
                                {currentFValue?.amount}
                            </Col>
                        </Row>
                        <Row className="border-0 border-b border-solid">
                            <Col span={20} className="p-2 font-medium border-0 border-r border-solid">NO DYEING GUARANTEE</Col>
                            <Col span={4} className="p-2 font-medium border-0 border-r">
                                {currentFValue?.amount}
                            </Col>
                        </Row>
                        <Row className="border-0 border-b border-solid">
                            <Col span={24} className="p-2 font-medium border-0 border-r">RS. (IN WORDS)</Col>
                        </Row>
                    </Flex>

                    <Flex style={{marginTop: 20}} className="flex-col">
                        <Row className="border-0 border-b ">
                            <Col span={4} className="p-2 font-medium border-0 border-r ">TDS (%)</Col>
                            <Col span={8} className="p-2 font-medium border-0 border-r ">
                                <Form.Item
                                    // label="BILL Date"
                                    name="TDS_value"
                                    validateStatus={errors.TDS_value ? "error" : ""}
                                    help={errors.TDS_value && errors.TDS_value.message}
                                    required={true}
                                    wrapperCol={{ sm: 24 }}
                                    style={{marginBottom: 0}}
                                >
                                    <Controller
                                        control={control}
                                        name="TDS_value"
                                        render={({ field }) => (
                                            <Input {...field} placeholder="Invoice No." />
                                        )}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={6} className="p-2 font-medium border-0 border-r "></Col>
                            <Col span={6} className="p-2 font-medium border-0 border-r ">
                                <Flex  gap={10} justify="flex-end">
                                    <Button htmlType="button" onClick={() => reset()} danger>
                                        Close
                                    </Button>
                                    <Button type="primary" htmlType="submit">
                                        Receive Bill
                                    </Button>
                                </Flex>
                            </Col>
                        </Row>
                    </Flex>
                </Form>
            </Modal>
        </>
    )
}

export default JobTakaChallanModal; 