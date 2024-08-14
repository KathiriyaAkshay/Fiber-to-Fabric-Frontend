import { EyeOutlined } from "@ant-design/icons";
import { Button, Col, Flex, Modal, Row, Typography } from "antd";
import { useState } from "react";
import { CloseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useRef, useContext, useEffect } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import ReactToPrint from "react-to-print";

const { Text, Title } = Typography;

const ViewReworkChallanInfo = ({ details }) => {
  const [isModelOpen, setIsModalOpen] = useState(false);
  const componentRef = useRef();
  const { companyListRes } = useContext(GlobalContext);
  const [companyInfo, setCompanyInfo] = useState({});
  const TakaArray = Array(12).fill(0);

  const [totalTaka1, setTotalTaka1] = useState(0);
  const [totalTaka2, setTotalTaka2] = useState(0);
  const [totalMeter, setTotalMeter] = useState(0);

  const pageStyle = `
    @media print {
      /* General styles for print */
      body {
        margin: 0;
        font-size: 12pt;
      }

      .print-instructions {
        display: none;
      }

      .printable-content {
        padding: 20px;
        width: 100%;
        page-break-inside: avoid;
      }

      /* Adjust layout for smaller screens */
      @media print and (max-width: 768px) {
        .printable-content {
          padding: 10px;
          font-size: 10pt;
        }
      }

      /* Adjust layout for larger screens */
      @media print and (min-width: 769px) {
        .printable-content {
          padding: 20px;
          font-size: 12pt;
        }
      }

      /* Landscape orientation */
      @page {
        size: auto;
        margin: 10mm;
      }

      @media print and (orientation: landscape) {
        .printable-content {
          padding: 15px;
        }
      }
    }
  `;

  useEffect(() => {
    let tempTotal1 = 0;
    let tempTotal2 = 0;

    TakaArray?.map((element, index) => {
      tempTotal1 =
        Number(tempTotal1) +
        Number(details?.job_rework_challan_details[index]?.meter || 0);
      tempTotal2 =
        Number(tempTotal2) +
        Number(details?.job_rework_challan_details[index + 12]?.meter || 0);
    });

    let total = Number(tempTotal1) + Number(tempTotal2);

    setTotalMeter(total);
    setTotalTaka1(tempTotal1);
    setTotalTaka2(tempTotal2);
  }, [TakaArray, details]);

  useEffect(() => {
    companyListRes?.rows?.map((element) => {
      if (element?.id == details?.company_id) {
        setCompanyInfo(element);
      }
    });
  }, [details, companyListRes]);

  return (
    <>
      <Button
        type="primary"
        onClick={() => {
          setIsModalOpen(true);
        }}
      >
        <EyeOutlined />
      </Button>

      <Modal
        closeIcon={<CloseOutlined className="text-white" />}
        title={
          <Typography.Text className="text-xl font-medium text-white">
            Job Challan
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
            maxHeight: "75vh",
            overflowY: "auto",
          },
          footer: {
            paddingBottom: 10,
            paddingRight: 10,
            backgroundColor: "#efefef",
          },
        }}
        width={"60vw"}
      >

        <div ref={componentRef} style={{ marginRight: "1px", marginLeft: "1px", width: "99%" }}>
          <Flex
            className="flex-col border border-b-0 border-solid"
          >
            <Row
              className="border p-4 border-b ,0border-solid !m-0"
              style={{
                borderTop: 0,
                borderLeft: 0,
                borderRight: 0,
                borderBottom: 0,
              }}
            >
              <Col span={12}>
                <Row>
                  <Col span={24}>
                    <Text>To,</Text>
                    <Text className="block font-bold">
                      {details?.supplier?.supplier_company}(
                      {details?.supplier?.supplier_name})
                    </Text>
                    <Text className="block">
                      {details?.supplier?.user?.address}
                    </Text>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <Text>Challan</Text>
                    <Text className="block">{details?.challan_no}</Text>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <Text>GST</Text>
                    <Text className="block">
                      {details?.supplier?.user?.gst_no}
                    </Text>
                  </Col>
                </Row>
              </Col>
              <Col span={12}>
                <Row>
                  <Col span={24}>
                    <Text>From,</Text>
                    <Text className="block font-bold">
                      {companyInfo?.company_name}
                    </Text>
                    <Text className="block">{`${companyInfo?.address_line_1} ${companyInfo?.address_line_2 == null
                      ? ""
                      : companyInfo?.address_line_2
                      }, ${companyInfo?.city}, ${companyInfo?.state} - ${companyInfo?.pincode
                      }, ${companyInfo?.country}`}</Text>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <Text>Broker</Text>
                    <Text className="block font-bold">
                      {details?.broker?.first_name} {details?.broker?.last_name}
                    </Text>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <Text>GST</Text>
                    <Text className="block">{companyInfo?.gst_no}</Text>
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row
              className="p-4 border-0 border-b border-solid !m-0"
              style={{ borderTop: "1px dashed" }}
            >
              <Col span={6}><strong>Description:</strong></Col>
              <Col span={6}>
                {details?.inhouse_quality?.quality_name} (
                {details?.inhouse_quality?.quality_weight}KG)
              </Col>
              <Col span={6}><strong>Date:</strong></Col>
              <Col span={6}>{dayjs(details?.createdAt).format("DD-MM-YYYY")}</Col>
            </Row>
            <Row
              className="p-4 border-0 border-b border-solid !m-0"
              style={{ borderBottom: 0 }}
            >

              <Col span={2} style={{ textAlign: "center" }}>
                <strong>No</strong>
              </Col>
              <Col span={2} style={{ textAlign: "center" }}>
                <strong>TAKA NO</strong>
              </Col>
              <Col span={2} style={{ textAlign: "center" }}>
                <strong>Meter</strong>
              </Col>
              <Col span={3} style={{ textAlign: "center" }}>
                <strong>Recv Meter</strong>
              </Col>
              <Col span={3} style={{ textAlign: "center" }}>
                <strong>Recv Weight</strong>
              </Col>

              <Col span={2} style={{ textAlign: "center" }}>
                <strong>No</strong>
              </Col>
              <Col span={2} style={{ textAlign: "center" }}>
                <strong>TAKA NO</strong>
              </Col>
              <Col span={2} style={{ textAlign: "center" }}>
                <strong>Meter</strong>
              </Col>
              <Col span={3} style={{ textAlign: "center" }}>
                <strong>Recv Meter</strong>
              </Col>
              <Col span={3} style={{ textAlign: "center" }}>
                <strong>Recv Weight</strong>
              </Col>
            </Row>

            {TakaArray?.map((element, index) => {
              return (
                <Row
                  key={index}
                  className="p-3 border-0"
                  style={{ borderTop: 0 }}
                >
                  <Col span={2} style={{ textAlign: "center" }}>
                    <strong>{index + 1}</strong>
                  </Col>
                  <Col span={2} style={{ textAlign: "center" }}>
                    {details?.job_rework_challan_details[index]?.taka_no}
                  </Col>
                  <Col span={2} style={{ textAlign: "center" }}>
                    {details?.job_rework_challan_details[index]?.meter}
                  </Col>
                  <Col span={3} style={{ textAlign: "center" }}>
                    {details?.job_rework_challan_details[index]?.received_meter}
                  </Col>
                  <Col span={3} style={{ textAlign: "center" }}>
                    {details?.job_rework_challan_details[index]?.received_weight}
                  </Col>
                  <Col span={2} style={{ textAlign: "center" }}>
                    <strong>{index + 13}</strong>
                  </Col>
                  <Col span={2} style={{ textAlign: "center" }}>
                    {details?.job_rework_challan_details[index + 12]?.taka_no}
                  </Col>
                  <Col span={2} style={{ textAlign: "center" }}>
                    {details?.job_rework_challan_details[index + 12]?.meter}
                  </Col>
                  <Col span={3} style={{ textAlign: "center" }}>
                    {
                      details?.job_rework_challan_details[index + 12]
                        ?.received_meter
                    }
                  </Col>
                  <Col span={3} style={{ textAlign: "center" }}>
                    {
                      details?.job_rework_challan_details[index + 12]
                        ?.received_weight
                    }
                  </Col>
                </Row>
              );
            })}

            <Row className="p-3 border-0" style={{ borderTop: "1px solid", borderTopStyle: "dashed" }}>
              <Col span={1} style={{ textAlign: "center" }}></Col>
              <Col span={2} style={{ textAlign: "center" }}></Col>
              <Col span={2} style={{ textAlign: "center" }}>
                <strong>{totalTaka1}</strong>
              </Col>
              <Col span={3} style={{ textAlign: "center" }}></Col>
              <Col span={3} style={{ textAlign: "center" }}></Col>
              <Col span={1} style={{ textAlign: "center" }}></Col>
              <Col span={2} style={{ textAlign: "center" }}></Col>
              <Col span={2} style={{ textAlign: "center" }}>
                <strong>{totalTaka2}</strong>
              </Col>
            </Row>

            <Row
              className="p-3 border-0"
              style={{ borderTop: "1px dashed", borderBottom: "1px dashed" }}
            >
              <Col span={3} style={{ textAlign: "center" }}>
                <strong>Total Taka:</strong>
              </Col>
              <Col span={5} style={{ textAlign: "center" }}>
                {details?.job_rework_challan_details?.length}
              </Col>
              <Col span={4} style={{ textAlign: "center" }}>
                <strong>Total Meter:</strong>
              </Col>
              <Col span={5} style={{ textAlign: "center" }}>
                {totalMeter}
              </Col>
            </Row>


            <Row className="border-b !m-0 p-4" style={{ borderBottom: "1px solid" }}>
              <Col span={16} className="p-2">
                <Title level={5} className="m-0">
                  ➤ TERMS OF SALES :-
                </Title>
                <Text
                  className="block"
                  style={{ color: "#000" }}
                >
                  1. Interest at 2% per month will be charged remaining unpaid
                  from the date bill.
                </Text>
                <Text
                  className="block"
                  style={{ color: "#000" }}
                >
                  2. Complaint if any regarding this invoice must be settled
                  within 24 hours.
                </Text>
                <Text
                  className="block"
                  style={{ color: "#000" }}
                >
                  3. Disputes shall be settled in SURAT court only.
                </Text>
                <Text
                  className="block"
                  style={{ color: "#000" }}
                >
                  4. We are not responsible for processed goods & width.
                </Text>
                <Text
                  className="block"
                  style={{ color: "#000" }}
                >
                  5. Subject to SURAT Jurisdiction.
                </Text>
                <Text className="block mt-2"></Text>
              </Col>
              <Col span={8} className="p-2 text-right">
                <Text strong>For, {companyInfo?.company_name}</Text><br />Authorized Signature
              </Col>
            </Row>

          </Flex>
        </div>
      </Modal>
    </>
  );
};

export default ViewReworkChallanInfo;
