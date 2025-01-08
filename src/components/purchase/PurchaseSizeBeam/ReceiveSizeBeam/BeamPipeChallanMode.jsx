import { useContext, useEffect, useState, useRef } from "react";
import {
    Button,
    Col,
    Flex,
    Modal,
    Row,
    Typography,
    message
} from "antd";
import { CloseOutlined, EyeOutlined } from "@ant-design/icons";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import moment from "moment";
import ReactToPrint from "react-to-print";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSizeBeamOrderRequest } from "../../../../api/requests/orderMaster";

const BeamPipeChallanModel = ({ details }) => {
    const componentRef = useRef() ; 
    const [totalMeter, setTotalMeter] = useState(0) ; 
    const {companyListRes, companyId} = useContext(GlobalContext) ; 
    const [companyInfo, setCompanyInfo] = useState({});
    const [isModelOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false) ; 
    const queryClient = useQueryClient() ; 

    useEffect(() => {
        companyListRes?.rows?.map((element) => {
            if (element?.id == details?.company_id){
                setCompanyInfo(element) ; 
            }
        })
    },[details, companyListRes]) ; 

    const { mutateAsync: updateSizeBeamOrder } = useMutation({
        mutationFn: async (data) => {
          setLoading(true) ; 
          const res = await updateSizeBeamOrderRequest({
            id: details?.id,
            data,
            params: { company_id: companyId },
          });
          return res.data;
        },
        mutationKey: ["order-master/size-beam-order/update", details?.id],
        onSuccess: (res) => {
            setLoading(false) ; 
            queryClient.invalidateQueries([
                "order-master",
                "size-beam-order",
                "list",
                { company_id: companyId },
            ]);
        },
        onError: (error) => {
          setLoading(false) ; 
          const errorMessage = error?.response?.data?.message;
          if (errorMessage && typeof errorMessage === "string") {
            message.error(errorMessage);
          }
        },
    });


    const printChallan = async () => {
        if (details?.print_challan_status != "PRINTED"){
            await updateSizeBeamOrder({
                "print_challan_status": "PRINTED"
            })
        }
    }

    const pageStyle = `
        @media print {
            .print-instructions {
                display: none;
            }
            .printable-content {
                padding: 20px; /* Add padding for print */
                width: 100%;
                box-sizing: border-box; /* Include padding in width calculation */
            }
        }
    `;

    useEffect(() => {
        let temp_total = 0 ;
        details?.size_beam_order_details?.map((element) => {
            temp_total = Number(temp_total) + Number(element?.meters)
        })
        setTotalMeter(temp_total) ; 
    }, [details]) ; 

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
                footer={() => {
                    return(
                        <>
                            <ReactToPrint
                                trigger={() => <Flex>
                                    <Button type="primary" 
                                        style={{marginLeft: "auto", marginTop: 15}}
                                        loading = {loading}
                                        onClick={() => {printChallan()}}
                                    >
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
                width={"65%"}
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
                        maxHeight: "80vh", 
                        overflowY: "auto"
                    },

                    footer:{
                        paddingBottom: 10, 
                        paddingRight: 10, 
                        backgroundColor: "#efefef"
                    }
                }}
            >
                <div ref={componentRef}>
                    <Flex className="flex-col border border-solid" >
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
                                    <Typography.Text>{details?.supplier?.supplier_name}</Typography.Text>
                                    <br />
                                    <Typography.Text style={{fontWeight: 600}}>{String(details?.supplier?.supplier_company).toUpperCase()}</Typography.Text>
                                    <br />
                                    <Typography.Text>{details?.supplier?.user?.address}</Typography.Text>
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
                                    <Typography.Text>{companyInfo?.company_name}</Typography.Text>
                                    <br />
                                    <Typography.Text>{`${companyInfo?.address_line_1} ${companyInfo?.address_line_2 == null?"":companyInfo?.address_line_2}, ${companyInfo?.city}, ${companyInfo?.state} - ${companyInfo?.pincode}, ${companyInfo?.country}`}</Typography.Text>
                                </div>
                            </Col>
                        </Row>

                        <Row className=" p-0 border-0 border-b border-solid !m-0" style={{ borderTop: "1px solid" }}>
                            <Col
                                span={2}
                                className="p-2 font-medium border-0 border-r border-solid text-center"
                            >
                                <strong>SRL</strong>
                            </Col>
                            <Col
                                span={4}
                                className="p-2 font-medium border-0 border-r border-solid text-center" 
                            >
                                <strong>ENDS/TAAR</strong>
                            </Col>
                            <Col
                                span={3}
                                className="p-2 font-medium border-0 border-r border-solid text-center"
                            >
                                <strong>TPM</strong>
                            </Col>
                            <Col
                                span={3}
                                className="p-2 font-medium border-0 border-r border-solid text-center"
                            >
                                <strong>PANO</strong>
                            </Col>
                            <Col
                                span={5}
                                className="p-2 font-medium border-0 border-r border-solid text-center"
                            >
                                <strong>GRADE</strong>
                            </Col>
                            <Col
                                span={3}
                                className="p-2 font-medium border-0 border-r border-solid text-center"
                            >
                                <strong>MTR</strong>
                            </Col>
                            <Col span={4} className="p-2 font-medium text-center">
                                <strong>REMARKS</strong>
                            </Col>
                        </Row>

                        {details?.size_beam_order_details?.map((element, index) => (
                            <Row className=" p-0 border-0 border-solid !m-0" >
                                <Col
                                    span={2}
                                    className="p-2 font-medium border-0 border-r border-solid text-center"
                                >
                                    {index + 1}
                                </Col>
                                <Col
                                    span={4}
                                    className="p-2 font-medium border-0 border-r border-solid text-center"
                                >
                                    {element?.ends_or_tars}
                                </Col>
                                <Col
                                    span={3}
                                    className="p-2 font-medium border-0 border-r border-solid text-center"
                                >
                                    {element?.tpm}
                                </Col>
                                <Col
                                    span={3}
                                    className="p-2 font-medium border-0 border-r border-solid text-center"
                                >
                                    {element?.pano}
                                </Col>
                                <Col
                                    span={5}
                                    className="p-2 font-medium border-0 border-r border-solid text-center"
                                >
                                    {element?.grade}
                                </Col>
                                <Col
                                    span={3}
                                    className="p-2 font-medium border-0 border-r border-solid text-center"
                                >
                                    {element?.meters}
                                </Col>
                                <Col span={4} className="p-2 font-medium text-center">
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
                                className="p-2 font-medium border-0 border-r border-solid text-center"
                            >
                                <strong>Total</strong>
                            </Col>
                            <Col
                                span={4}
                                className="p-2 font-medium border-0 border-r border-solid text-center"
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
                                className="p-2 font-medium border-0 border-r border-solid text-center"
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
                                <Typography.Text>For, {companyInfo?.company_name}</Typography.Text>
                                <br /><br /><br /><br /><br /><br /><br /><br />
                                <Typography.Text>Checked by Authorised Signatory</Typography.Text>
                            </Col>
                        </Row>

                    </Flex>
                </div>
                
            </Modal>
        </>
    )
}

export default BeamPipeChallanModel; 