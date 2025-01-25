import { useRef, useState, useEffect, useMemo } from "react";
import { Button, Col, Flex, Modal, Row, Typography } from "antd";
import { EyeOutlined, CloseOutlined } from "@ant-design/icons";
import moment from "moment";
const { Paragraph } = Typography;
import ReactToPrint from "react-to-print";
import { useContext } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { getDisaplyWrapDennierName, getDisplayQualityName } from "../../../../constants/nameHandler";

const AccountBeamSaleChallan = ({ details }) => {

    const [isModelOpen, setIsModalOpen] = useState(false);
    const componentRef = useRef();
    const { companyListRes } = useContext(GlobalContext);
    const [companyInfo, setCompanyInfo] = useState({});

    useEffect(() => {
        companyListRes?.rows?.map((element) => {
        if (element?.id == details?.company_id) {
            setCompanyInfo(element);
        }
        });
    }, [details, companyListRes]);

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
            <Button onClick={() => {
                setIsModalOpen(true) ; 
            }}>
                <EyeOutlined />
            </Button>

            <Modal
                closeIcon={<CloseOutlined className="text-white" />}
                title={
                    <Typography.Text className="text-xl font-medium text-white">
                        Beam Sale Challan
                    </Typography.Text>
                }
                open={isModelOpen}
                footer={() => {
                    return (
                        <>
                            <ReactToPrint
                                trigger={() => (
                                    <Flex>
                                        <Button
                                            type="primary"
                                            style={{ marginLeft: "auto", marginTop: 15 }}
                                        >
                                            PRINT
                                        </Button>
                                    </Flex>
                                )}
                                content={() => componentRef.current}
                                pageStyle={pageStyle}
                            />
                        </>
                    );
                }}
                onCancel={() => {setIsModalOpen(false)}}
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
                        backgroundColor: "#efefef",
                    },
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
              <p style={{ marginTop: 0, marginBottom: 0 }}>
                <strong>{`${companyInfo?.address_line_1} ${
                  companyInfo?.address_line_2 == null
                    ? ""
                    : companyInfo?.address_line_2
                }, ${companyInfo?.city}, ${companyInfo?.state} - ${
                  companyInfo?.pincode
                }, ${companyInfo?.country}`}</strong>
              </p>
              <p style={{ marginTop: 3, marginBottom: 0 }}>
                Phone no: {companyInfo?.company_contact} &nbsp;&nbsp;&nbsp;
                PAYMENT: {companyInfo?.account_number}
              </p>
              <p style={{ marginTop: 3, marginBottom: 0 }}>
                GST NO: {companyInfo?.gst_no} &nbsp;&nbsp;&nbsp;&nbsp; PAN NO:{" "}
                {companyInfo?.pancard_no}
              </p>
            </Col>
          </Row>
          <Row style={{
            borderTop: "1px dashed",
            paddingTop: 10
          }}>
<Col span={12}>
              <p>
                <strong>M/S :</strong><br/> 
                {details?.supplier?.supplier_name}<br/>
                <span style={{fontWeight: 600}}>({details?.supplier?.supplier_company})</span>
              </p>
              <p>{details?.supplier?.user?.address}</p>
              <p>
                <strong>GST :</strong> {details?.supplier?.user?.gst_no}
              </p>
              <p>
                <strong>E-Way Bill No :</strong>
              </p>
            </Col>
            <Col span={12} style={{ textAlign: "right" }}>
              <p>
                <strong>CHALLAN NO :</strong> {details?.challan_no}
              </p>
              <p>
                <strong>DATE :</strong>{" "}
                {moment(details?.createdAt).format("DD-MM-YYYY")}
              </p>
              <p>
                <strong>VEHICLE NO :</strong>
                {details?.vehicle?.vehicle?.vehicleNo}
              </p>
            </Col>
          </Row>
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
          {/* {details?.beam_sale_return?.beam_sale?.beam_sale_details?.map((item, index) => {
              const obj =
                item?.loaded_beam?.non_pasarela_beam_detail ||
                item?.loaded_beam?.recieve_size_beam_detail ||
                item?.loaded_beam?.job_beam_receive_detail;
              return (
                <Row
                  key={index}
                  gutter={24}
                  style={{
                    paddingTop: 15,
                    paddingBottom: 15,
                  }}
                >
                  <Col span={3}>{index + 1}</Col>
                  <Col span={3} style={{fontWeight: 600}}>{obj?.beam_no || 0}</Col>
                  <Col span={3}>{obj?.ends_or_tars || obj.tars || 0}</Col>
                  <Col span={3}>{obj?.pano || 0}</Col>
                  <Col span={4}>{obj?.taka || 0}</Col>
                  <Col span={4}>{obj?.meters || obj.meter || 0}</Col>
                  <Col span={4}>{obj?.net_weight || 0}</Col>
                </Row>
              );
            })} */}
                </Flex>
            </Modal>
        </>
    )
}

export default AccountBeamSaleChallan; 