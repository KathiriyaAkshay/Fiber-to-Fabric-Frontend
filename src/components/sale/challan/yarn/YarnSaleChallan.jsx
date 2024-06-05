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

const YarnSaleChallanModel = ({details = {}}) => {

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
                        Receive Size Beam Challan
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
                                <Typography.Text className="font-semibold text-center">
                                    :: SHREE GANESHAY NAMAH ::
                                </Typography.Text>
                            </Col>
                        </Row>
                    </Flex>
                </Form>
            </Modal>
        </>
    )
}

export default YarnSaleChallanModel ; 