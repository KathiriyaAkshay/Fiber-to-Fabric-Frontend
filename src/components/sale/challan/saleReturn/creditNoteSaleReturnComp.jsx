import { EyeOutlined } from "@ant-design/icons";
import { Button, Col, Flex, Modal, Row, Typography } from "antd";
import { useContext, useState } from "react";
import { CloseOutlined } from "@ant-design/icons";
import { useRef, useEffect } from "react";
import ReactToPrint from "react-to-print";
import dayjs from "dayjs";
import { GlobalContext } from "../../../../contexts/GlobalContext";

const { Text } = Typography;

const CreditNoteSaleReturnComp = ({ details }) => {
  const [isModelOpen, setIsModalOpen] = useState(false);
  const componentRef = useRef();
  const { company } = useContext(GlobalContext);

  // const [companyInfo, setCompanyInfo] = useState({});
  const TakaArray = Array(12).fill(0);

  const [totalTaka1, setTotalTaka1] = useState(0);
  const [totalTaka2, setTotalTaka2] = useState(0);
  const [totalMeter, setTotalMeter] = useState(0);
  const [currentTakaReturnId, setCurrentTakaReturnId] = useState(
    details?.sale_return_id
  );
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
        Number(
          details?.sale_challan_return?.sale_challan?.sale_challan_details[
            index
          ]?.meter || 0
        );
      tempTotal2 =
        Number(tempTotal2) +
        Number(
          details?.sale_challan_return?.sale_challan?.sale_challan_details[
            index + 12
          ]?.meter || 0
        );
    });

    let total = Number(tempTotal1) + Number(tempTotal2);

    setTotalMeter(total);
    setTotalTaka1(tempTotal1);
    setTotalTaka2(tempTotal2);
  }, [TakaArray, details]);

  return (
    <>
      <Button
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
            Sale Return
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
            className="p-4 border-0 border-b border-solid !m-0"
            style={{ textAlign: "center" }}
          >
            <Col span={24}>
              <Text className="font-bold" style={{ fontSize: "22px" }}>
                {String(company?.company_name).toUpperCase()}
              </Text>
            </Col>
          </Row>
          <Row
            className="p-4 border-0 border-b border-solid !m-0"
            style={{ textAlign: "center" }}
          >
            <Col span={24}>
              <Text>
                {company?.address_line_1} {company?.address_line_2} ,{" "}
                {company?.city}
              </Text>
            </Col>
          </Row>
          <Row
            className="p-4 border-0 border-b border-solid !m-0"
            style={{ textAlign: "center" }}
          >
            <Col span={6}>
              <Text>
                <span className="font-bold">PHONE NO:</span>{" "}
                {company?.company_contact}
              </Text>
            </Col>
            <Col span={6}>
              <Text>
                <span className="font-bold">PAYMENT:</span> -
              </Text>
            </Col>
            <Col span={6}>
              <Text>
                <span className="font-bold">GST NO:</span> {company?.gst_no}
              </Text>
            </Col>

            <Col span={6}>
              <Text>
                <span className="font-bold">PAN NO:</span> {company.pancard_no}
              </Text>
            </Col>
          </Row>
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
                    {details?.party?.company_name}(
                    {`${details?.party?.user?.first_name}${details?.party?.user?.last_name}`}
                    )
                  </Text>
                  <Text className="block">{details?.party?.user?.address}</Text>
                </Col>
              </Row>
              <Row style={{ padding: "6px 0px" }}>
                <Col span={24}>
                  <Text className="font-bold">GST</Text>
                  <Text className="block">
                    {details?.party?.company_gst_number}
                  </Text>
                </Col>
              </Row>
            </Col>
            <Col span={12}>
              <Row style={{ padding: "6px 0px" }}>
                <Col span={24}>
                  <Text className="font-bold">CHALLAN No</Text>
                  <Text className="block">
                    {details?.sale_challan_return?.sale_challan?.challan_no}
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
                    {details?.supplier?.broker?.first_name}{" "}
                    {details?.supplier?.broker?.last_name}
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
              {details?.inhouse_quality?.quality_name} (
              {details?.inhouse_quality?.quality_weight}
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
            const isReturned =
              details?.sale_return_id ==
              details?.sale_challan_return?.sale_challan?.sale_challan_details[
                index
              ]?.sale_challan_return_id
                ? true
                : false;
            const isReturned2 =
              details?.sale_return_id ==
              details?.sale_challan_return?.sale_challan?.sale_challan_details[
                index + 12
              ]?.sale_challan_return_id
                ? true
                : false;
            return (
              <Row
                key={index}
                className="p-3 border-0"
                style={{ borderTop: 0 }}
              >
                <Col span={1} style={{ textAlign: "center" }}>
                  <Text
                    style={{
                      color: isReturned ? "red" : "inherit",
                    }}
                  >
                    {index + 1}
                  </Text>
                </Col>
                <Col span={5} style={{ textAlign: "center" }}>
                  <Text
                    style={{
                      color: isReturned ? "red" : "inherit",
                    }}
                  >
                    {
                      details?.sale_challan_return?.sale_challan
                        ?.sale_challan_details[index]?.taka_no
                    }{" "}
                    {isReturned ? "(return)" : ""}
                  </Text>
                </Col>
                <Col span={5} style={{ textAlign: "center" }}>
                  <Text
                    style={{
                      color: isReturned ? "red" : "inherit",
                    }}
                  >
                    {
                      details?.sale_challan_return?.sale_challan
                        ?.sale_challan_details[index]?.meter
                    }
                  </Text>
                </Col>
                {/* Table 2 */}
                <Col span={1} style={{ textAlign: "center" }}>
                  <Text
                    style={{
                      color: isReturned2 ? "red" : "inherit",
                    }}
                  >
                    {index + 13}
                  </Text>
                </Col>
                <Col span={5} style={{ textAlign: "center" }}>
                  <Text
                    style={{
                      color: isReturned2 ? "red" : "inherit",
                    }}
                  >
                    {
                      details?.sale_challan_return?.sale_challan
                        ?.sale_challan_details[index + 12]?.taka_no
                    }{" "}
                    {isReturned2 ? "(return)" : ""}
                  </Text>
                </Col>
                <Col span={5} style={{ textAlign: "center" }}>
                  <Text
                    style={{
                      color: isReturned2 ? "red" : "inherit",
                    }}
                  >
                    {
                      details?.sale_challan_return?.sale_challan
                        ?.sale_challan_details[index + 12]?.meter
                    }
                  </Text>
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
              {
                details?.sale_challan_return?.sale_challan?.sale_challan_details
                  ?.length
              }
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

export default CreditNoteSaleReturnComp;
