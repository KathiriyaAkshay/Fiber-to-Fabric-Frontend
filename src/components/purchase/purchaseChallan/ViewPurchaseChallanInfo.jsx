import { EyeOutlined } from "@ant-design/icons";
import { Button, Col, Flex, Modal, Row, Typography } from "antd";
import { useState } from "react";
import { CloseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useRef, useContext, useEffect } from "react";
import ReactToPrint from "react-to-print";
import { GlobalContext } from "../../../contexts/GlobalContext";

const { Text } = Typography;

const ViewPurchaseChallanInfo = ({ details }) => {
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
             .print-instructions {
                display: none;
            }
            .printable-content {
                padding: 20px; /* Add padding for print */
                width: 100%;
            }
    `;

  useEffect(() => {
    let tempTotal1 = 0;
    let tempTotal2 = 0;

    TakaArray?.map((_, index) => {
      tempTotal1 =
        Number(tempTotal1) +
        Number(details?.purchase_challan_details[index]?.meter || 0);
      tempTotal2 =
        Number(tempTotal2) +
        Number(details?.purchase_challan_details[index + 12]?.meter || 0);
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
            Purchase Return Challan
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
        width={"70vw"}
      >
        <Flex
          className="flex-col border border-b-0 border-solid"
          style={{marginRight: 1}}
          ref={componentRef}
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
                  <Text className="block">{`${companyInfo?.address_line_1} ${
                    companyInfo?.address_line_2 == null
                      ? ""
                      : companyInfo?.address_line_2
                  }, ${companyInfo?.city}, ${companyInfo?.state} - ${
                    companyInfo?.pincode
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
            <Col span={6}>Description:</Col>
            <Col span={6}>
              {details?.inhouse_quality?.quality_name} (
              {details?.inhouse_quality?.quality_weight}
              KG)
            </Col>
            <Col span={6}>Date:</Col>
            <Col span={6}>{dayjs(details?.createdAt).format("DD-MM-YYYY")}</Col>
          </Row>
          <Row
            className="p-4 border-0 border-b border-solid !m-0"
            style={{ borderBottom: 0 }}
          >
            <Col span={1} style={{ textAlign: "center" }}>
              <strong>No</strong>
            </Col>
            <Col span={5} style={{ textAlign: "center" }}>
              <strong>TAKA NO</strong>
            </Col>
            <Col span={5} style={{ textAlign: "center" }}>
              <strong>Meter</strong>
            </Col>
            <Col span={1} style={{ textAlign: "center" }}>
              <strong>No</strong>
            </Col>
            <Col span={5} style={{ textAlign: "center" }}>
              <strong>TAKA NO</strong>
            </Col>
            <Col span={5} style={{ textAlign: "center" }}>
              <strong>Meter</strong>
            </Col>
          </Row>

          {TakaArray?.map((element, index) => {
            return (
              <Row
                key={index}
                className="p-3 border-0"
                style={{ borderTop: 0 }}
              >
                <Col span={1} style={{ textAlign: "center" }}>
                  {index + 1}
                </Col>
                <Col span={5} style={{ textAlign: "center" }}>
                  {details?.purchase_challan_details[index]?.taka_no}
                </Col>
                <Col span={5} style={{ textAlign: "center" }}>
                  {details?.purchase_challan_details[index]?.meter}
                </Col>
                <Col span={1} style={{ textAlign: "center" }}>
                  {index + 13}
                </Col>
                <Col span={5} style={{ textAlign: "center" }}>
                  {details?.purchase_challan_details[index + 12]?.taka_no}
                </Col>
                <Col span={5} style={{ textAlign: "center" }}>
                  {details?.purchase_challan_details[index + 12]?.meter}
                </Col>
              </Row>
            );
          })}

          <Row className="p-3 border-0" style={{ borderTop: 0 }}>
            <Col span={1} style={{ textAlign: "center" }}></Col>
            <Col span={5} style={{ textAlign: "center" }}></Col>
            <Col span={5} style={{ textAlign: "center" }}>
              <strong>{totalTaka1}</strong>
            </Col>

            <Col span={1} style={{ textAlign: "center" }}></Col>
            <Col span={5} style={{ textAlign: "center" }}></Col>
            <Col span={5} style={{ textAlign: "center" }}>
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
              {details?.purchase_challan_details?.length}
            </Col>
            <Col span={4} style={{ textAlign: "center" }}>
              <strong>Total Meter:</strong>
            </Col>
            <Col span={5} style={{ textAlign: "center" }}>
              {totalMeter}
            </Col>
          </Row>
        </Flex>
      </Modal>
    </>
  );
};

export default ViewPurchaseChallanInfo;
