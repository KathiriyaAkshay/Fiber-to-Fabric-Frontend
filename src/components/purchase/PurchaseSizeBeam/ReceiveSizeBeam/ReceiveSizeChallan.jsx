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
import { createReceiveSizeBeamBillRequest } from "../../../../api/requests/purchase/purchaseSizeBeam";
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

const SizeBeamChallanModal = ({ details = {} }) => {

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
    const [isModelOpen, setIsModalOpen] = useState(false);
    const { data: companyListRes, isLoading: isLoadingCompanyList } =
        useCompanyList();
    const [totalTaka, setTotalTaka] = useState(0) ; 
    const [totalMeter, setTotalMeter] = useState(0) ;
    const [totalKG, setTotalKG] = useState(0) ; 
    const [rate, setRate] = useState(0) ; 
    const [totalAmount, setTotalAmount] = useState(0) ;     
    const currentValues = watch() ; 

    useEffect(() => {
        let tempTotalTaka = 0;
        let tempNetWeight = 0 ; 
        details?.recieve_size_beam_details?.map((element) => {
            tempTotalTaka = tempTotalTaka + element?.taka;
            tempNetWeight = tempNetWeight + element?.net_weight ; 
        })
        setTotalTaka(tempTotalTaka) ; 
        setTotalMeter(details?.total_meter) ; 
        setTotalKG(tempNetWeight) ; 
    }, []) ; 

    useEffect(() => {

        let rate = currentValues?.rate ; 
        let amount = Number(rate)*Number(totalKG) ; 
        setValue("amount", parseFloat(amount).toFixed(2)) ; 

        let discount = currentValues?.discount_value ;
        let discount_value = (Number(currentValues?.amount)*(Number(discount))) / 100 ; 
        discount_value = amount - discount_value ;
        setValue("discount_amount", Number(discount_value).toFixed(2))

        let freight = currentValues?.freight_value; 
        let freight_amount = Number(discount_value) + Number(freight) ; 
        setValue("freight_amount", Number(freight_amount).toFixed(2)) ; 

    }, [currentValues?.rate, currentValues?.discount_value, currentValues?.amount, currentValues?.freight_value, setValue])

    useEffect(() => {
        let total = 0 ; 
        total = total + Number(currentValues?.freight_amount) ; 
        total = total + Number(currentValues?.IGST_amount) ; 
        total = total + Number(currentValues?.SGST_amount) ; 
        total = total + Number(currentValues?.CGST_amount) ; 

        let roundOffAmount = Math.round(total) - total ; 
        setValue("round_off", parseFloat(roundOffAmount).toFixed(2)) ; 
        setValue("net_amount",  Math.round(total)) ; 
    }, [currentValues?.freight_amount, currentValues?.IGST_amount, currentValues?.SGST_amount, currentValues?.CGST_amount]) ; 

    useEffect(() => {

        let igst = currentValues?.IGST_value ; 
        let sgst = currentValues?.SGST_value ;
        let cgst = currentValues?.CGST_value ;  

        let igst_amount = (Number(currentValues?.freight_amount)*Number(igst)) / 100 ; 
        let sgst_amount = (Number(currentValues?.freight_amount)*Number(sgst)) / 100 ; 
        let cgst_amount = (Number(currentValues?.freight_amount)*Number(cgst)) / 100 ; 

        setValue("IGST_amount", parseFloat(igst_amount).toFixed(2)) ; 
        setValue("SGST_amount", parseFloat(sgst_amount).toFixed(2)) ; 
        setValue("CGST_amount", parseFloat(cgst_amount).toFixed(2)) ; 

    }, [currentValues?.IGST_value, currentValues?.SGST_value, currentValues?.CGST_value, currentValues?.freight_amount,  setValue]) ; 


    const disablePastDates = (current) => {
        return current && current < new Date().setHours(0, 0, 0, 0);
    };

    const disableFutureDates = (current) => {
        return current && current > new Date().setHours(0, 0, 0, 0);
    }

    const { mutateAsync: createSizeBeamBill } = useMutation({
        mutationFn: async (data) => {
          const res = await createReceiveSizeBeamBillRequest({
            data,
            params: { company_id: companyId },
          });
          return res.data;
        },
        mutationKey: ["yarn-stock/yarn-receive-challan/create"],
        onSuccess: (res) => {
            const successMessage = res?.message;
            if (successMessage) {
                message.success(successMessage);
            }
            // handleCancel();
        },
        onError: (error) => {
          mutationOnErrorHandler({ error, message });
        },
    });

    const onSubmit = async (values) => {
        let requestData = values ; 
        requestData["bill_date"] = moment(values?.bill_date).format("YYYY-MM-DD")
        requestData["due_date"] = moment(values?.bill_date).format("YYYY-MM-DD")
        requestData["SGST_amount"] = parseFloat(values?.SGST_amount).toFixed(2)
        requestData["receive_size_beam_id"] = details?.id ;
        requestData["total_kg"]= totalKG ; 
        requestData["inhouse_quality_id"] = details?.inhouse_quality?.id ; 
        requestData["total_taka"] = totalTaka ; 
        requestData["total_meter"] = totalMeter ; 
        requestData["supplier_id"] = details?.supplier?.id ; 

        await createSizeBeamBill(requestData) ; 
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

 

                        <Row
                            className="px-2 pt-4 border-0 border-b border-solid !m-0"
                            gutter={12}
                        >
                            <Col span={12} className="flex flex-col self-center mb-6">
                                <Row gutter={12} className="flex-grow w-full">
                                    <Col span={8} className="font-medium">
                                        Supplier Name :
                                    </Col>
                                    <Col span={16}>{`${details?.supplier?.first_name} ${details?.supplier?.last_name}`}</Col>
                                </Row>
                                <Row gutter={12} className="flex-grow w-full mt-3">
                                    <Col span={8} className="font-medium">
                                        Company Name :
                                    </Col>
                                    <Col span={16}>{`${details?.inhouse_quality?.quality_name} ${details?.inhouse_quality?.quality_weight}KG `}</Col>
                                </Row>
                            </Col>
                            <Col span={12} className="flex flex-col self-center mb-6">
                                <Row gutter={12} className="flex-grow w-full">
                                    <Col span={8} className="font-medium">
                                        Invoice Number :
                                    </Col>
                                    <Col span={16}>
                                        <Form.Item
                                            // label="Invoice No."
                                            name="invoice_number"
                                            validateStatus={errors.invoice_number ? "error" : ""}
                                            help={errors.invoice_number && errors.invoice_number.message}
                                            required={true}
                                        // className="mb-0"
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
                                </Row>
                                <Row gutter={12} className="flex-grow w-full" style={{ marginTop: -10, marginBottom: -20 }}>
                                    <Col span={8} className="font-medium">
                                        Bill date :
                                    </Col>
                                    <Col span={16}>
                                        <Form.Item
                                            // label="BILL Date"
                                            name="bill_date"
                                            validateStatus={errors.bill_date ? "error" : ""}
                                            help={errors.bill_date && errors.bill_date.message}
                                            required={true}
                                            wrapperCol={{ sm: 24 }}
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
                            </Col>
                        </Row>

                        <Row className="border-0 border-b border-solid !m-0">
                            <Col
                                span={4}
                                className="p-2 font-medium border-0 border-r border-solid"
                            >
                                Challan
                            </Col>
                            <Col
                                span={4}
                                className="p-2 font-medium border-0 border-r border-solid"
                            >
                                Total Taka
                            </Col>
                            <Col
                                span={4}
                                className="p-2 font-medium border-0 border-r border-solid"
                            >
                                Total Meter
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
                    
                        <Row >
                            <Col span={4} className="p-2 border-0 border-r border-solid">
                                {details?.challan_no}
                            </Col>
                            <Col span={4} className="p-2 border-0 border-r border-solid">
                                {totalTaka}
                            </Col>
                            <Col span={4} className="p-2 border-0 border-r border-solid">
                                {totalMeter}
                            </Col>
                            <Col span={3} className="p-2 border-0 border-r border-solid">
                                {totalKG}
                            </Col>
                            <Col span={4} className="p-2 border-0 border-r border-solid">
                                <Form.Item
                                    // label="Invoice No."
                                    name="rate"
                                    validateStatus={errors.rate ? "error" : ""}
                                    help={errors.rate && errors.rate.message}
                                    required={true}
                                // className="mb-0"
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
                            <Col span={4} className="p-2 font-medium" >
                                {/* <Form.Item
                                    // label="Invoice No."
                                    name="amount"
                                    validateStatus={errors.amount ? "error" : ""}
                                    help={errors.amount && errors.amount.message}
                                    required={true}
                                // className="mb-0"
                                >
                                    <Controller
                                        control={control}
                                        name="amount"
                                        render={({ field }) => (
                                            <Input {...field} placeholder="Amount" type="number" />
                                        )}
                                    />
                                </Form.Item> */}
                                {currentValues?.amount}
                            </Col>
                        </Row>

                        <Row >
                            <Col span={4} className="p-2 border-0 border-r border-solid">
                            </Col>
                            <Col span={4} className="p-2 border-0 border-r border-solid ">
                            </Col>
                            <Col span={4} className="p-2 border-0 border-r border-solid">
                            </Col>
                            <Col span={3} className="p-2 border-0 border-r border-solid">
                                Discount ( % )
                            </Col>
                            <Col span={4} className="p-2 border-0 border-r border-solid">
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
                            <Col span={4} className="p-2 font-medium" >
                                {currentValues?.discount_amount}
                            </Col>
                        </Row>

                        <Row >
                            <Col span={4} className="p-2 border-0 border-r border-solid">
                            </Col>
                            <Col span={4} className="p-2 border-0 border-r border-solid ">
                            </Col>
                            <Col span={4} className="p-2 border-0 border-r border-solid">
                            </Col>
                            <Col span={3} className="p-2 border-0 border-r border-solid">
                                FREIGHT ( % )
                            </Col>
                            <Col span={4} className="p-2 border-0 border-r border-solid">
                                <Form.Item
                                    // label="Invoice No."
                                    name="freight_value"
                                    validateStatus={errors.freight_value ? "error" : ""}
                                    help={errors.freight_value && errors.freight_value.message}
                                    required={true}
                                // className="mb-0"
                                >
                                    <Controller
                                        control={control}
                                        name="freight_value"
                                        render={({ field }) => (
                                            <Input {...field}
                                                placeholder="Freight" 
                                                type="number" 
                                                onChange={(e) => {
                                                    setValue("freight_value", e.target.value) ; 
                                                }}
                                            />
                                        )}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={4} className="p-2 font-medium" >
                                {currentValues?.freight_amount}
                            </Col>
                        </Row>

                        <Row >
                            <Col span={4} className="p-2 border-0 border-r border-solid">
                            </Col>
                            <Col span={4} className="p-2 border-0 border-r border-solid ">
                            </Col>
                            <Col span={4} className="p-2 border-0 border-r border-solid">
                            </Col>
                            <Col span={3} className="p-2 border-0 border-r border-solid">
                                SGST ( % )
                            </Col>
                            <Col span={4} className="p-2 border-0 border-r border-solid">
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
                            
                            <Col span={4} className="p-2 font-medium" >
                                {currentValues?.SGST_amount}
                                {/* <Form.Item
                                    // label="Invoice No."
                                    name="SGST_amount"
                                    validateStatus={errors.SGST_amount ? "error" : ""}
                                    help={errors.SGST_amount && errors.SGST_amount.message}
                                    required={true}
                                // className="mb-0"
                                >
                                    <Controller
                                        control={control}
                                        name="SGST_amount"
                                        render={({ field }) => (
                                            <Input {...field}
                                                placeholder="SGST amount" 
                                                type="number" 
                                                onChange={(e) => {
                                                    setValue("SGST_amount", e.target.value) ; 
                                                    let tempDiscount = parseFloat((currentValues?.amount*e.target.value)/ 100) ; 
                                                    // console.log(tempDiscount); 
                                                    // console.log(parseFloat(currentValues?.amount - tempDiscount).toFixed(2));
                                                    // setValue("discount_amount", parseFloat(currentValues?.amount - tempDiscount).toFixed(2))
                                                }}
                                            />
                                        )}
                                    />
                                </Form.Item> */}
                            </Col>
                        </Row>

                        <Row >
                            <Col span={4} className="p-2 border-0 border-r border-solid">
                            </Col>
                            <Col span={4} className="p-2 border-0 border-r border-solid ">
                            </Col>
                            <Col span={4} className="p-2 border-0 border-r border-solid">
                            </Col>
                            <Col span={3} className="p-2 border-0 border-r border-solid">
                                CGST ( % )
                            </Col>
                            <Col span={4} className="p-2 border-0 border-r border-solid">
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
                            <Col span={4} className="p-2 font-medium" >
                                {currentValues?.CGST_amount}
                                {/* <Form.Item
                                    // label="Invoice No."
                                    name="CGST_amount"
                                    validateStatus={errors.CGST_amount ? "error" : ""}
                                    help={errors.CGST_amount && errors.CGST_amount.message}
                                    required={true}
                                // className="mb-0"
                                >
                                    <Controller
                                        control={control}
                                        name="CGST_amount"
                                        render={({ field }) => (
                                            <Input {...field}
                                                placeholder="CGST amount" 
                                                type="number" 
                                                onChange={(e) => {
                                                    setValue("CGST_amount", e.target.value) ; 
                                                    let tempDiscount = parseFloat((currentValues?.amount*e.target.value)/ 100) ; 
                                                    // console.log(tempDiscount); 
                                                    // console.log(parseFloat(currentValues?.amount - tempDiscount).toFixed(2));
                                                    // setValue("discount_amount", parseFloat(currentValues?.amount - tempDiscount).toFixed(2))
                                                }}
                                            />
                                        )}
                                    />
                                </Form.Item> */}
                            </Col>
                        </Row>
                        
                        <Row  >
                            <Col span={4} className="p-2 border-0 border-r border-solid">
                            </Col>
                            <Col span={4} className="p-2 border-0 border-r border-solid ">
                            </Col>
                            <Col span={4} className="p-2 border-0 border-r border-solid">
                            </Col>
                            <Col span={3} className="p-2 border-0 border-r border-solid">
                                IGST ( % )
                            </Col>
                            <Col span={4} className="p-2 border-0 border-r border-solid">
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
                            <Col span={4} className="p-2 font-medium" >
                                {currentValues?.IGST_amount}
                                {/* <Form.Item
                                    // label="Invoice No."
                                    name="IGST_amount"
                                    validateStatus={errors.IGST_amount ? "error" : ""}
                                    help={errors.IGST_amount && errors.IGST_amount.message}
                                    required={true}
                                // className="mb-0"
                                >
                                    <Controller
                                        control={control}
                                        name="IGST_amount"
                                        render={({ field }) => (
                                            <Input {...field}
                                                placeholder="IGST_amount" 
                                                type="number" 
                                                onChange={(e) => {
                                                    setValue("IGST_amount", e.target.value) ; 
                                                    let tempDiscount = parseFloat((currentValues?.amount*e.target.value)/ 100) ; 
                                                    // console.log(tempDiscount); 
                                                    // console.log(parseFloat(currentValues?.amount - tempDiscount).toFixed(2));
                                                    // setValue("discount_amount", parseFloat(currentValues?.amount - tempDiscount).toFixed(2))
                                                }}
                                            />
                                        )}
                                    />
                                </Form.Item> */}
                            </Col>
                        </Row>
                        
                        <Row  className="border-0 border-b border-solid !m-0">
                            <Col span={4} className="p-2 border-0 border-r border-solid">
                            </Col>
                            <Col span={4} className="p-2 border-0 border-r border-solid ">
                            </Col>
                            <Col span={4} className="p-2 border-0 border-r border-solid">
                            </Col>
                            <Col span={3} className="p-2 border-0 border-r border-solid">
                                Round off 
                            </Col>
                            <Col span={4} className="p-2 border-0 border-r border-solid">
                            </Col>
                            <Col span={4} className="p-2 font-medium" >
                                {currentValues?.round_off}
                                {/* <Form.Item
                                    // label="Invoice No."
                                    name="IGST_amount"
                                    validateStatus={errors.IGST_amount ? "error" : ""}
                                    help={errors.IGST_amount && errors.IGST_amount.message}
                                    required={true}
                                // className="mb-0"
                                >
                                    <Controller
                                        control={control}
                                        name="IGST_amount"
                                        render={({ field }) => (
                                            <Input {...field}
                                                placeholder="IGST_amount" 
                                                type="number" 
                                                onChange={(e) => {
                                                    setValue("IGST_amount", e.target.value) ; 
                                                    let tempDiscount = parseFloat((currentValues?.amount*e.target.value)/ 100) ; 
                                                    // console.log(tempDiscount); 
                                                    // console.log(parseFloat(currentValues?.amount - tempDiscount).toFixed(2));
                                                    // setValue("discount_amount", parseFloat(currentValues?.amount - tempDiscount).toFixed(2))
                                                }}
                                            />
                                        )}
                                    />
                                </Form.Item> */}
                            </Col>
                        </Row>
                        
                        <Row  className="border-0 border-b border-solid !m-0">
                            <Col span={4} className="p-2 border-0 border-r border-solid"></Col>
                            <Col span={4} className="p-2 border-0 border-r border-solid"></Col>
                            <Col span={7} className="p-2 border-0 border-r border-solid">
                                <Form.Item
                                    // label="BILL Date"
                                    name="bill_date"
                                    validateStatus={errors.due_date ? "error" : ""}
                                    help={errors.bill_date && errors.due_date.message}
                                    required={true}
                                    wrapperCol={{ sm: 24 }}
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
                            {/* <Col span={15} className="p-2 border-0 border-r border-solid">
                                <Form.Item
                                    // label="BILL Date"
                                    name="bill_date"
                                    validateStatus={errors.bill_date ? "error" : ""}
                                    help={errors.bill_date && errors.bill_date.message}
                                    required={true}
                                    wrapperCol={{ sm: 24 }}
                                // className="mb-0"
                                >
                                    <Controller
                                        control={control}
                                        name="bill_date"
                                        render={({ field }) => (
                                            <DatePicker
                                                {...field}
                                                style={{
                                                    width: "100%",
                                                }}
                                                format="DD-MM-YYYY"
                                            />
                                        )}
                                    />
                                </Form.Item>
                            </Col> */}
                            <Col span={4} className="p-2 border-0 border-r border-solid">
                                <strong>NET Amount</strong>
                            </Col>
                            <Col span={4} className="p-2 font-medium" >
                                {currentValues?.net_amount}
                            </Col>
                        </Row>

                        <Row  className="border-0 border-b border-solid !m-0">
                            <Col span={4} className="p-2 font-semibold">
                                Rs.(IN WORDS):
                            </Col>
                            <Col span={20} className="p-2 font-semibold">
                                {Number(currentValues?.net_amount)?toWords.convert(currentValues?.net_amount):""}
                            </Col>
                        </Row>

                    </Flex>

                    <Flex gap={10} justify="flex-end" className="mt-3">
                        <Button htmlType="button" onClick={() => reset()}>
                            Reset
                        </Button>
                        <Button type="primary" htmlType="submit">
                            Receive Bill
                        </Button>
                    </Flex>
                </Form>
            </Modal>
        </>

    )
}

export default SizeBeamChallanModal; 