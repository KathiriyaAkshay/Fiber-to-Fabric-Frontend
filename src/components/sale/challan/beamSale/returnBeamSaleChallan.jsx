import { useRef, useState, useEffect } from "react";
import { Button, Col, Flex, Modal, Row, Typography, Checkbox, message } from "antd";
import { EyeOutlined, CloseOutlined, UndoOutlined } from "@ant-design/icons";
import moment from "moment";
const { Paragraph } = Typography;
import ReactToPrint from "react-to-print";
import { useContext } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { returnBeamSaleChallanRequest } from "../../../../api/requests/sale/challan/beamSale";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";

const ReturnBeamSaleChallan = ({ details }) => {
    const queryClient = useQueryClient() ; 
    const [isModelOpen, setIsModalOpen] = useState(false);
    const componentRef = useRef();
    const { companyListRes, companyId } = useContext(GlobalContext);
    const [companyInfo, setCompanyInfo] = useState({});
    const [selectedBeamId, setSelectedBeamId] = useState([]);

    useEffect(() => {
        companyListRes?.rows?.map((element) => {
            if (element?.id == details?.company_id) {
                setCompanyInfo(element);
            }
        })
    }, [details, companyListRes]);

    const handleSelectBeamChallan = (event, index) => {
        if (event.  target.checked) {
            setSelectedBeamId((prev) => {
                return [...prev, details?.beam_sale_details[index]?.id]
            })
        } else {
            setSelectedBeamId((prev) => {
                return prev.filter(
                    (i) => i != details?.beam_sale_details?.[index]?.id
                )
            })
        }
    }

    const { mutateAsync: returnBeamSaleChallan, isPending } = useMutation({
        mutationFn: async (data) => {
          const res = await returnBeamSaleChallanRequest({
            data,
            params: {
              company_id: companyId,
            },
          });
          return res.data;
        },
        mutationKey: ["beamSale", "list"],
        onSuccess: (res) => {
          queryClient.invalidateQueries([
            "purchaseTaka",
            "challan",
            "list",
            companyId,
          ]);
          const successMessage = res?.message;
          if (successMessage) {
            message.success(successMessage);
          }
          setIsModalOpen(false);
        },
        onError: (error) => {
          const errorMessage = error?.response?.data?.message || error.message;
          message.error(errorMessage);
        },
    });

    const handleReturn = async () => {
        if (selectedBeamId?.length == 0){
            message.warning("Please, Select at least one beam for return") ; 
        }   else {
            let beam_sale_ids = selectedBeamId ;
            let requestPayload = {
                "beam_sale_id": details?.id,
                "beam_sale_detail_ids": beam_sale_ids,
                "createdAt": new Date(),
                "supplier_name": details?.supplier?.supplier_name,
                "supplier_id": details?.supplier?.id,
                "quality_id": details?.quality_id   
            }
            await returnBeamSaleChallan(requestPayload)
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
            }
        `;

    return (
        <>
            <Button
                danger
                onClick={() => {
                    setIsModalOpen(true);
                }}
            >
                <UndoOutlined />
            </Button>

            <Modal
                closeIcon={<CloseOutlined className="text-white" />}
                title={
                    <Typography.Text className="text-xl font-medium text-white">
                        Beam Sale
                    </Typography.Text>
                }
                open={isModelOpen}
                footer={() => {
                    return (
                        <>
                            {/* <ReactToPrint
                        trigger={() => <Flex>
                            <Button type="primary" style={{marginLeft: "auto", marginTop: 15}}>
                                PRINT
                            </Button>
                        </Flex>}
                        content={() => componentRef.current}
                        pageStyle={pageStyle}
                    /> */}
                            <div style={{
                                paddingTop: 15
                            }}>
                                <Button danger loading = {isPending} onClick={handleReturn}>
                                    Return
                                </Button>
                            </div>
                        </>
                    )
                }}
                onCancel={() => {
                    setIsModalOpen(false);
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

                    footer: {
                        paddingBottom: 10,
                        paddingRight: 10,
                        backgroundColor: "#efefef"
                    }
                }}
                width={"70vw"}
            >
                <Flex className="flex-col" ref={componentRef}>
                    <Row className="p-2 ">
                        <Col span={24} className="flex items-center justify-center border">
                            <Typography.Text className="font-semibold text-center">
                                <h3>{companyInfo?.company_name}</h3>
                            </Typography.Text>
                        </Col>
                    </Row>

                    <Row
                        justify="center"
                        align="middle"
                        style={{
                            borderTop: "1px dashed",
                            paddingTop: 15,
                            paddingBottom: 15,
                        }}
                    >
                        <Col span={24} style={{ textAlign: "center" }}>
                            <p style={{ marginTop: 0, marginBottom: 0 }}><strong>{`${companyInfo?.address_line_1} ${companyInfo?.address_line_2 == null ? "" : companyInfo?.address_line_2}, ${companyInfo?.city}, ${companyInfo?.state} - ${companyInfo?.pincode}, ${companyInfo?.country}`}</strong></p>
                            <p style={{ marginTop: 3, marginBottom: 0 }}>Phone no: {companyInfo?.company_contact} &nbsp;&nbsp;&nbsp; PAYMENT: {companyInfo?.account_number}</p>
                            <p style={{ marginTop: 3, marginBottom: 0 }}>GST NO: {companyInfo?.gst_no} &nbsp;&nbsp;&nbsp;&nbsp; PAN NO: {companyInfo?.pancard_no}</p>
                        </Col>
                    </Row>
                    <Row
                        style={{
                            borderTop: "1px dashed",
                            paddingTop: 10,
                        }}
                    >
                        <Col span={12}>
                            <p><strong>M/S :</strong> {details?.supplier?.supplier_company}({details?.supplier?.supplier_name})</p>
                            <p>{details?.supplier?.user?.address}</p>
                            <p><strong>GST :</strong> {details?.supplier?.user?.gst_no}</p>
                            <p><strong>E-Way Bill No :</strong></p>
                        </Col>
                        <Col span={12} style={{ textAlign: 'right' }}>
                            <p><strong>CHALLAN NO :</strong> {details?.challan_no}</p>
                            <p><strong>DATE :</strong> {moment(details?.createdAt).format("DD-MM-YYYY")}</p>
                            <p><strong>VEHICLE NO :</strong>{details?.vehicle?.vehicle?.vehicleNo}</p>
                        </Col>
                    </Row>

                    <Row
                        style={{
                            borderTop: "1px dashed",
                            paddingTop: 15,
                            paddingBottom: 15,
                        }}
                    >
                        <Col span={8}>
                            <strong>DESCRIPTION OF GOODS:</strong>
                        </Col>
                        <Col span={4}>
                            <strong>{details?.yarn_stock_company?.yarn_company_name}</strong>
                        </Col>
                    </Row>
                    <div style={{ height: 400 }}>
                        <Row
                            gutter={24}
                            style={{
                                borderTop: "1px dashed",
                                paddingTop: 15,
                                paddingBottom: 15,
                            }}
                        >
                            <Col span={3}>
                                <strong>No</strong>
                            </Col>
                            <Col span={3}>
                                <strong>Beam No</strong>
                            </Col>
                            <Col span={3}>
                                <strong>Tar</strong>
                            </Col>
                            <Col span={3}>
                                <strong>Pano</strong>
                            </Col>
                            <Col span={4}>
                                <strong>Taka No</strong>
                            </Col>
                            <Col span={4}>
                                <strong>Meter</strong>
                            </Col>
                            <Col span={4}>
                                <strong>Weight</strong>
                            </Col>
                        </Row>
                        {details?.beam_sale_details.map((item, index) => {
                            const isReturn = item?.beam_sale_return_id ; 
                            const obj =
                                item?.loaded_beam?.non_pasarela_beam_detail ||
                                item?.loaded_beam?.recieve_size_beam_detail ||
                                item?.loaded_beam?.job_beam_receive_detail;
                            return (
                                <Row
                                    key={index}
                                    gutter={24}
                                    style={{
                                        // borderTop: "1px dashed",
                                        paddingTop: 15,
                                        paddingBottom: 15,
                                    }}
                                >
                                    <Col span={3}>
                                        {index + 1}
                                        {!isReturn && (
                                            <Checkbox
                                                style={{ marginLeft: 10 }}
                                                onChange={(e) => {
                                                    handleSelectBeamChallan(e, index)
                                                }}
                                            />
                                        )}
                                    </Col>
                                    <Col span={3} style={{
                                        fontWeight: 600, 
                                        color: isReturn?"red":"#000"
                                    }}>{obj?.beam_no || 0}</Col>
                                    <Col span={3} style={{color: isReturn?"red":"#000"}}>{obj?.ends_or_tars || obj.tars || 0}</Col>
                                    <Col span={3} style={{color: isReturn?"red":"#000"}}>{obj?.pano || 0}</Col>
                                    <Col span={4} style={{color: isReturn?"red":"#000"}}>{obj?.taka || 0}</Col>
                                    <Col span={4} style={{color: isReturn?"red":"#000"}}>{obj?.meters || obj.meter || 0}</Col>
                                    <Col span={4} style={{color: isReturn?"red":"#000"}}>{obj?.net_weight || 0}</Col>
                                </Row>
                            );
                        })}
                    </div>
                    <Row
                        gutter={24}
                        style={{
                            borderTop: "1px dashed",
                            paddingTop: 8,
                            paddingBottom: 8,
                        }}
                    >
                        <Col span={3}>
                            <strong>TOTAL</strong>
                        </Col>
                        <Col span={7}>
                            <strong></strong>
                        </Col>
                        <Col span={6}>
                            <strong></strong>
                        </Col>
                        <Col span={4}>
                            <strong>{details?.total_meter}</strong>
                        </Col>
                        <Col span={4}>
                            <strong>{details?.enter_weight}</strong>
                        </Col>
                    </Row>

                    <Row
                        gutter={24}
                        style={{
                            borderTop: "1px dashed",
                            paddingTop: 8,
                            paddingBottom: 8,
                        }}
                    >
                        <Col span={4}>
                            <strong>TOTAL Meter:</strong>
                        </Col>
                        <Col span={4}>
                            <strong>{details?.total_meter}</strong>
                        </Col>
                        <Col span={4}>
                            <strong>TOTAL Weight:</strong>
                        </Col>
                        <Col span={4}>
                            <strong>{details?.enter_weight}</strong>
                        </Col>
                    </Row>

                    <Row gutter={24} style={{ borderTop: "1px dashed", paddingTop: 15 }}>
                        <Col span={4}>TERMS OF SALES:</Col>
                    </Row>

                    <Row gutter={[16, 16]} style={{ marginTop: 15 }}>
                        <Col span={24}>
                            <Paragraph style={{ marginBottom: 0 }}>
                                (1) Interest at 2% per month will be charged remaining unpaid
                                from date of bill.
                            </Paragraph>
                        </Col>
                        <Col span={24}>
                            <Paragraph style={{ marginBottom: 0 }}>
                                (2) Complaint if any regarding this invoice must be settled
                                within 24 hours.
                            </Paragraph>
                        </Col>
                        <Col span={24}>
                            <Paragraph style={{ marginBottom: 0 }}>
                                (3) Subject to SURAT jurisdiction.
                            </Paragraph>
                        </Col>
                        <Col span={24}>
                            <Paragraph style={{ marginBottom: 0 }}>
                                (4) We are not responsible for processed good &amp; width.
                            </Paragraph>
                        </Col>
                    </Row>
                    <Row style={{ marginTop: "40px" }}>
                        <Col span={24} style={{ textAlign: "right" }}>
                            <Paragraph>For, {companyInfo?.company_name}</Paragraph>
                        </Col>
                    </Row>
                    <Row style={{ marginTop: "70px" }}>
                        <Col span={12}>
                            <Paragraph>Checked by</Paragraph>
                        </Col>
                        <Col span={12} style={{ textAlign: "right" }}>
                            <Paragraph>Authorised Signatory</Paragraph>
                        </Col>
                    </Row>
                </Flex>
                {/* <Flex>
            <Button type="primary" style={{ marginLeft: "auto", marginTop: 15 }}>
                PRINT
            </Button>
            </Flex> */}
            </Modal>
        </>
    );
};

export default ReturnBeamSaleChallan;
