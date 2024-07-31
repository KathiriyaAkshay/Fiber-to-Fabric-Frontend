import { useContext, useState, useRef, useEffect } from "react";
import { Button, Col, Flex, Modal, Row, Typography } from "antd";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { EyeOutlined, CloseOutlined } from "@ant-design/icons";
import moment from "moment";
const { Paragraph } = Typography;
import ReactToPrint from "react-to-print";

const PrintJobWorkChallan = ({ details }) => {
  const [isModelOpen, setIsModalOpen] = useState(false);
  const { companyListRes } = useContext(GlobalContext);
  const [companyInfo, setCompanyInfo] = useState({});
  const componentRef = useRef();

  const pageStyle = `
        @media print {
             .print-instructions {
                display: none;
            }
            .printable-content {
                width: 100%;
            }
    `;

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
            Job Work
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
            maxHeight: "80vh",
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
        <Flex className="flex-col p-3" ref={componentRef}>
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
          <Row
            style={{
              borderTop: "1px dashed",
              paddingTop: 10,
            }}
          >
            <Col span={12}>
              <p>
                <strong>M/S :</strong> {details?.supplier?.supplier_company}(
                {details?.supplier?.supplier_name})
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
              <Col span={3} className="text-center">
                <strong>No</strong>
              </Col>
              <Col span={7} className="text-center">
                <strong>Yarn Company</strong>
              </Col>
              <Col span={6} className="text-center">
                <strong>Dennier</strong>
              </Col>
              <Col span={4} className="text-center">
                <strong>Cartoon</strong>
              </Col>
              <Col span={4} className="text-center">
                <strong>KG</strong>
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
              <Col span={3} className="text-center">
                1
              </Col>
              <Col span={7} className="text-center">
                {details?.yarn_stock_company?.yarn_company_name}
              </Col>
              <Col
                span={6}
                className="text-center"
              >{`${details?.yarn_stock_company?.yarn_count}C/${details?.yarn_stock_company?.filament}F(${details?.yarn_stock_company?.luster_type}(${details?.yarn_stock_company?.yarn_Sub_type}) - ${details?.yarn_stock_company?.yarn_color})`}</Col>
              <Col span={4} className="text-center">
                {details?.quantity}
              </Col>
              <Col span={4} className="text-center">
                {details?.kg}
              </Col>
            </Row>
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
              <strong></strong>
            </Col>
            <Col span={7}>
              <strong></strong>
            </Col>
            <Col span={6}>
              <strong></strong>
            </Col>
            <Col span={4} className="text-center">
              <strong>{details?.quantity}</strong>
            </Col>
            <Col span={4} className="text-center">
              <strong>{details?.kg}</strong>
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
              <strong>TOTAL CARTOON:</strong>
            </Col>
            <Col span={4}>
              <strong>{details?.quantity}</strong>
            </Col>
            <Col span={4}>
              <strong>TOTAL KG:</strong>
            </Col>
            <Col span={4}>
              <strong>{details?.kg}</strong>
            </Col>
          </Row>

          <Row gutter={24} style={{ borderTop: "1px dashed", paddingTop: 15 }}>
            <Col span={4} style={{ color: "#000", fontWeight: 600 }}>
              TERMS OF SALES:
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 15 }}>
            <Col span={24}>
              <Paragraph
                style={{ marginBottom: 0, color: "#000", fontWeight: 600 }}
              >
                (1) Interest at 2% per month will be charged remaining unpaid
                from date of bill.
              </Paragraph>
            </Col>
            <Col span={24}>
              <Paragraph
                style={{ marginBottom: 0, color: "#000", fontWeight: 600 }}
              >
                (2) Complaint if any regarding this invoice must be settled
                within 24 hours.
              </Paragraph>
            </Col>
            <Col span={24}>
              <Paragraph
                style={{ marginBottom: 0, color: "#000", fontWeight: 600 }}
              >
                (3) Subject to SURAT jurisdiction.
              </Paragraph>
            </Col>
            <Col span={24}>
              <Paragraph
                style={{ marginBottom: 0, color: "#000", fontWeight: 600 }}
              >
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
      </Modal>
    </>
  );
};

export default PrintJobWorkChallan;
