import { EyeOutlined } from "@ant-design/icons";
import { Button, Col, Flex, Modal, Row, Typography } from "antd";
import { useState } from "react";
import { CloseOutlined } from "@ant-design/icons";
import { useRef, useEffect } from "react";
import ReactToPrint from "react-to-print";
import dayjs from "dayjs";

const { Text } = Typography;

const ViewSaleReturn = ({ details }) => {
  const [isModelOpen, setIsModalOpen] = useState(false);
  const componentRef = useRef();
  // const { companyListRes } = useContext(GlobalContext);
  // const [companyInfo, setCompanyInfo] = useState({});
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

    TakaArray?.map((element, index) => {
      tempTotal1 =
        Number(tempTotal1) +
        Number(details?.sale_challan?.sale_challan_details[index]?.meter || 0);
      tempTotal2 =
        Number(tempTotal2) +
        Number(
          details?.sale_challan?.sale_challan_details[index + 12]?.meter || 0
        );
    });

    let total = Number(tempTotal1) + Number(tempTotal2);

    setTotalMeter(total);
    setTotalTaka1(tempTotal1);
    setTotalTaka2(tempTotal2);
  }, [TakaArray, details]);

  // useEffect(() => {
  //   companyListRes?.rows?.map((element) => {
  //     if (element?.id == details?.company_id) {
  //       setCompanyInfo(element);
  //     }
  //   });
  // }, [details, companyListRes]);

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
            Sale Challan
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
              <Row style={{ padding: "6px 0px" }}>
                <Col span={24}>
                  <Text className="font-bold">M/S.</Text>
                  <Text className="block">
                    {details?.sale_challan?.supplier?.supplier_company}(
                    {details?.sale_challan?.supplier?.supplier_name})
                  </Text>
                  <Text className="block">
                    {details?.sale_challan?.supplier?.user?.address}
                  </Text>
                </Col>
              </Row>
              <Row style={{ padding: "6px 0px" }}>
                <Col span={24}>
                  <Text className="font-bold">GST</Text>
                  <Text className="block">
                    {details?.sale_challan?.supplier?.user?.gst_no}
                  </Text>
                </Col>
              </Row>
            </Col>
            <Col span={12}>
              <Row style={{ padding: "6px 0px" }}>
                <Col span={24}>
                  <Text className="font-bold">CHALLAN No</Text>
                  <Text className="block">
                    {details?.sale_challan?.challan_no}
                  </Text>
                </Col>
              </Row>
              <Row style={{ padding: "6px 0px" }}>
                <Col span={24}>
                  <Text className="font-bold">DATE</Text>
                  <Text className="block">
                    {dayjs(details.createdAt).format("DD-MM-YYYY")}
                  </Text>
                </Col>
              </Row>
              <Row style={{ padding: "6px 0px" }}>
                <Col span={24}>
                  <Text className="font-bold">BROKER</Text>
                  <Text className="block">
                    {details?.sale_challan?.broker?.first_name}{" "}
                    {details?.sale_challan?.broker?.last_name}
                  </Text>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row
            className="p-4 border-0 border-b border-solid !m-0"
            style={{ borderTop: "1px dashed" }}
          >
            <Col span={6}>
              <Text className="font-bold">DESCRIPTION OF GOODS:</Text>
            </Col>
            <Col span={6}>
              {details?.sale_challan?.inhouse_quality?.quality_name} (
              {details?.sale_challan?.inhouse_quality?.quality_weight}
              KG)
            </Col>
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
                  {details?.sale_challan?.sale_challan_details[index]?.taka_no}
                </Col>
                <Col span={5} style={{ textAlign: "center" }}>
                  {details?.sale_challan?.sale_challan_details[index]?.meter}
                </Col>
                <Col span={1} style={{ textAlign: "center" }}>
                  {index + 13}
                </Col>
                <Col span={5} style={{ textAlign: "center" }}>
                  {
                    details?.sale_challan?.sale_challan_details[index + 12]
                      ?.taka_no
                  }
                </Col>
                <Col span={5} style={{ textAlign: "center" }}>
                  {
                    details?.sale_challan?.sale_challan_details[index + 12]
                      ?.meter
                  }
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
              {details?.sale_challan?.sale_challan_details?.length}
            </Col>
            <Col span={3} style={{ textAlign: "center" }}>
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

export default ViewSaleReturn;
