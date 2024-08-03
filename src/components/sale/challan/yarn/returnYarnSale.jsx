import { useContext, useEffect, useState } from "react";
import {
    Button,
    Col,
    DatePicker,
    Flex,
    Form,
    Input,
    Modal,
    Row,
    Typography,
    message,
    Divider,
    Space
} from "antd";
const { Text, Title } = Typography;
import { UndoOutlined } from "@ant-design/icons";
import { CloseOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import moment from "moment";
import { useMutation } from "@tanstack/react-query";
import { returnYarnSaleChallanRequest } from "../../../../api/requests/sale/challan/challan";

const returnYarnReceive = yup.object().shape({
    cartoons: yup.string().required("Please, Enter return cartoon"),
    kg: yup.string().required("Please, Enter return KG")
})

const ReturnYarnSale = ({ details }) => {
    const queryClient = useQueryClient();
    const { companyId, companyListRes, company } = useContext(GlobalContext);
    const [companyInfo, setCompanyInfo] = useState({});
    const [isModelOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        companyListRes?.rows?.map((element) => {
            if (element?.id == details?.company_id) {
                console.log(element);

                setCompanyInfo(element);
            }
        })
    }, [details, companyListRes]);

    const {
        control,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
        getValues,
        reset,
    } = useForm({
        resolver: yupResolver(returnYarnReceive),
        defaultValues: {
            cartoons: details?.cartoon,
            kg: details?.kg
        }
    });

    const { cartoons, kg } = watch();

    // Create yarn sale return 

    const { mutateAsync: generateReturnYarnSale, isPending } = useMutation({
        mutationFn: async (data) => {
          const res = await returnYarnSaleChallanRequest({
            data,
            params: {
              company_id: companyId,
            },
          });
          return res.data;
        },
        mutationKey: ["sale", "yarnSale", "bill"],

        onSuccess: (res) => {
          queryClient.invalidateQueries(["sale/challan/yarn-sale/list", companyId]);
          const successMessage = res?.message;
          if (successMessage) {
            message.success("Yarn return successfully");
          }
          setIsModalOpen(false);
        },
        onError: (error) => {
          const errorMessage = error?.response?.data?.message || error.message;
          message.error(errorMessage);
        },
    });

    const onSubmit = async (values) => {
        let requestData = {
            "yarn_sale_id":  details?.id , 
            ...values
        }; 

        await generateReturnYarnSale(requestData) ; 
        
    }

    return (
        <>
            <Button>
                <UndoOutlined onClick={() => { setIsModalOpen(true) }} />
            </Button>

            <Modal
                closeIcon={<CloseOutlined className="text-white" />}
                title={
                    <Typography.Text className="text-xl font-medium text-white">
                        Yarn sale Return
                    </Typography.Text>
                }
                open={isModelOpen}
                footer={null}
                onCancel={() => { setIsModalOpen(false) }}
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
                    },
                    footer:{
                        paddingTop: 15,
                        paddingBottom: 10, 
                        paddingRight: 10, 
                        backgroundColor: "#efefef"
                    }
                }}
                width={"70vw"}
            >
                <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
                    <Flex className="flex-col border border-b-0 border-solid">
                        <Row className="p-2 border-0 border-b border-solid">
                            <Col span={24} className="justify-center">
                                <p className="text-center">:: SHREE GANESHAY NAMAH ::</p>
                            </Col>
                            <Col
                                span={24}
                                className="flex items-center justify-center border"
                            >
                                <Typography.Text
                                    className="font-semibold text-center"
                                    style={{ fontSize: 24 }}
                                >
                                    {companyInfo?.company_name}
                                </Typography.Text>
                            </Col>
                        </Row>

                        {/* Address Information */}
                        <Row className="p-2 pt-3 border-0 border-b border-solid" style={{
                            borderTop: "1px solid dashed !important"
                        }}>
                            <Col span={24} className="text-center">
                                <Typography.Text>
                                    {companyInfo?.address_line_1}
                                    <br />
                                    At: {companyInfo?.address_line_2}
                                </Typography.Text>
                            </Col>
                        </Row>

                        <Row className="p-2 pt-3 border-0 ">

                            {/* Supplier Info Section */}
                            <Col span={2} className="flex items-center justify-left border">
                                <Typography.Text className="font-semibold">
                                    M/s :
                                </Typography.Text>
                            </Col>
                            <Col span={13} className="flex items-center justify-left border">
                                <Typography.Text className="text-left">
                                    <strong>{details?.supplier?.supplier_name}</strong> <br />
                                    {details?.supplier?.user?.address}
                                </Typography.Text>
                            </Col>

                            {/* Invoice Number Section */}
                            <Col span={9} className="flex items-center justify-left border">
                                <div>
                                    <Typography.Text className="font-semibold text-left">
                                        CHALLAN NO : <span>{details?.challan_no}</span>
                                    </Typography.Text>
                                    <br />
                                    <Typography.Text
                                        className="font-semibold text-left"
                                        style={{ marginTop: 10, display: 'block' }} // Added display block to correctly apply marginTop
                                    >
                                        DATE  : {moment(details?.createdAt).format("DD-MM-YYYY")}<span></span>
                                    </Typography.Text>
                                </div>
                            </Col>
                        </Row>

                        <Row className="p-2 pt-1 border-0 border-b border-solid">
                            <Col span={2} className="flex items-center justify-left border">
                                <Typography.Text className="font-semibold">
                                    GST :
                                </Typography.Text>
                            </Col>
                            <Col span={13} className="flex items-center justify-left border">
                                <Typography.Text className="text-left">
                                    <strong>{details?.supplier?.user?.gst_no}</strong>
                                </Typography.Text>
                            </Col>

                            {/* Invoice Number Section */}
                            <Col span={8} className="flex items-center justify-left border">
                                <div>
                                    <Typography.Text className="font-semibold text-left">
                                        VEHICLE NO : <span>{details?.vehicle?.vehicle?.vehicleNo}</span>
                                    </Typography.Text>
                                    <br />
                                </div>
                            </Col>
                        </Row>

                        <Row className="p-2 pt-2 border-0 border-b border-solid">
                            <Col span={8} className="flex items-center justify-left border">
                                <Typography.Text className="font-semibold">
                                    DESCRIPTION OF GOODS :
                                </Typography.Text>
                            </Col>
                            <Col span={8} className="flex items-center justify-left border">
                                <Typography.Text className="font-semibold">
                                    {details?.yarn_stock_company?.yarn_company_name} ({details?.yarn_stock_company?.yarn_count})
                                </Typography.Text>
                            </Col>
                        </Row>

                        <Row className="p-2 pt-4 border-0 border-b ">
                            <Col span={1} className="flex items-center justify-center border">
                                <Typography.Text className="font-semibold">
                                    No
                                </Typography.Text>
                            </Col>
                            <Col span={6} className="flex items-center justify-center border " >
                                <Typography.Text className="font-semibold text-center">
                                    Yarn Company
                                </Typography.Text>
                            </Col>
                            <Col span={7} className="flex items-center justify-center border">
                                <Typography.Text className="font-semibold">
                                    Dennier
                                </Typography.Text>
                            </Col>
                            <Col span={5} className="flex items-center justify-center border">
                                <Typography.Text className="font-semibold">
                                    Cartoon
                                </Typography.Text>
                            </Col>
                            <Col span={5} className="flex items-center justify-center border">
                                <Typography.Text className="font-semibold">
                                    KG
                                </Typography.Text>
                            </Col>
                        </Row>

                        <Row className="p-2 pt-4 border-0 border-b ">
                            <Col span={1} className="flex items-center justify-center border" >
                                1
                            </Col>
                            <Col span={6} className="flex items-center justify-center border " >
                                {details?.yarn_stock_company?.yarn_company_name}
                            </Col>
                            <Col span={7} className="flex items-center justify-center border">
                                {details?.yarn_stock_company?.yarn_count}/{details?.yarn_stock_company?.yarn_denier}({details?.yarn_stock_company?.yarn_type}-{details?.yarn_stock_company?.yarn_Sub_type}-{details?.yarn_stock_company?.yarn_color})
                            </Col>
                            <Col span={5} className="flex items-center justify-center border">
                                <Form.Item
                                    name="Cartoon"
                                    validateStatus={errors.cartoons ? "error" : ""}
                                    help={errors.cartoons && errors.cartoons.message}
                                    required={true}
                                    className="mb-0"
                                >
                                    <Controller
                                        control={control}
                                        name="cartoons"
                                        render={({ field }) => (
                                            <Input
                                                type="number"
                                                {...field}
                                                placeholder="Cartoon"
                                            />
                                        )}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={5} className="flex items-center justify-center border">
                                <Form.Item
                                    name="kg"
                                    validateStatus={errors.kg ? "error" : ""}
                                    help={errors.kg && errors.kg.message}
                                    required={true}
                                    className="mb-0"
                                >
                                    <Controller
                                        control={control}
                                        name="kg"
                                        render={({ field }) => (
                                            <Input
                                                type="number"
                                                {...field}
                                                placeholder="KG"
                                            />
                                        )}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row className="p-2 pt-4 border-0 border-b" style={{ height: "200px" }}></Row>

                        <Row className="p-2 pt-4 " style={{ borderTop: "1px solid", borderTopStyle: "dashed" }}>
                            <Col span={1} className="flex items-center justify-center border" >
                            </Col>
                            <Col span={6} className="flex items-center justify-center border " >
                            </Col>
                            <Col span={7} className="flex items-center justify-center border">
                            </Col>
                            <Col span={5} className="flex items-center justify-center border">
                                {cartoons}
                            </Col>
                            <Col span={5} className="flex items-center justify-center border">
                                {kg}
                            </Col>
                        </Row>

                        <Row className="p-2 pt-4 " style={{ borderTop: "1px solid", borderTopStyle: "dashed" }}>
                            <Col span={3} className="flex items-center justify-center border" >
                                <Typography.Text className="font-semibold">
                                    TOTAL CARTOON :
                                </Typography.Text>
                            </Col>
                            <Col span={4} className="flex items-center justify-center border " >
                                {cartoons}
                            </Col>
                            <Col span={3} className="flex items-center justify-center border" >
                                <Typography.Text className="font-semibold">
                                    TOTAL KG :
                                </Typography.Text>
                            </Col>
                            <Col span={4} className="flex items-center justify-center border " >
                                {kg}
                            </Col>
                        </Row>

                        <Row className="p-2 pt-3" style={{ borderTop: "1px dashed"}}>
                            <Col span={24} className="mb-4">
                                <Text strong>TERMS OF SALES:</Text>
                            </Col>
                            <Col span={24} className="mb-2">
                                <Text>
                                    (1). Interest at 2% per month will be charged reaming unpaid from date of bill.
                                </Text>
                            </Col>
                            <Col span={24} className="mb-2">
                                <Text>
                                    (2). Complaint if any regarding this invoice must be settled within 24 hours.
                                </Text>
                            </Col>
                            <Col span={24} className="mb-2">
                                <Text>
                                    (3). Subject to SURAT jurisdiction.
                                </Text>
                            </Col>
                            <Col span={24} className="mb-4">
                                <Text>
                                    (4). We are not responsible for processed good &amp; width.
                                </Text>
                            </Col>

                            <Col span={24} className="flex justify-end">
                                <Text style={{ marginRight: "50px", fontWeight: 600, }}>For, SONU TEXTILES</Text>
                            </Col>

                        </Row>

                        <Row className="pt-4 p-3" 
                            style={{ borderTop: "1px solid", borderTopStyle: "dashed", borderBottom: "1px solid", height: "100px" , paddingRight: "20px" }}>
                            <Col span={6} className="flex justify-center">
                                <Text>
                                    Checked by
                                </Text>
                            </Col>

                            <Col span={18} className="flex justify-end">
                                <Text>
                                    Authorised Signatory
                                </Text>
                            </Col>
                        </Row>
                    </Flex>

                    <Space style={{marginTop: "10px"}}>
                        <Button htmlType="submit" type="primary" style={{marginLeft: "auto"}} loading = {isPending}>
                            RETURN YARN SALE
                        </Button>
                    </Space>

                </Form>
            </Modal>

        </>
    )
}

export default ReturnYarnSale; 