import { useState } from "react";
import { Button, Col, Flex, Modal, Row, Typography } from "antd";
import { EyeOutlined, CloseOutlined } from "@ant-design/icons";
import moment from "moment";
const { Paragraph } = Typography;

const PrintBeamSaleChallan = ({ details }) => {
  const [isModelOpen, setIsModalOpen] = useState(false);

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
            Beam Sale
          </Typography.Text>
        }
        open={isModelOpen}
        footer={null}
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
        }}
        width={"70vw"}
      >
        <Flex className="flex-col ">
          <Row className="p-2 ">
            <Col span={24} className="flex items-center justify-center border">
              <Typography.Text className="font-semibold text-center">
                <h3>SONU TEXTILES</h3>
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
                <strong>
                  PLOT NO. 78,, JAYVEER INDU. ESTATE,, GUJARAT HOUSING BOARD
                  ROAD, PANDESARA,, SURAT, GUJARAT, 394221 PANDESARA
                </strong>
              </p>
              <p style={{ marginTop: 3, marginBottom: 0 }}>
                At: Surat DIST-Surat
              </p>
              <p style={{ marginTop: 3, marginBottom: 0 }}>
                Phone no: 6353207671 &nbsp;&nbsp;&nbsp; PAYMENT: 6353207671
              </p>
              <p style={{ marginTop: 3, marginBottom: 0 }}>
                GST NO: 24ABHPP6021C1Z4 &nbsp;&nbsp;&nbsp;&nbsp; PAN NO:
                ABHPP6021C
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
              <p>ADDRESS OF SUPPLIER OF SUPPLIER NAME 123</p>
              <p>
                <strong>GST :</strong> 24ABHPP6021C1Z4
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
              const obj =
                item.loaded_beam.non_pasarela_beam_detail ||
                item.loaded_beam.recieve_size_beam_detail ||
                item.loaded_beam.job_beam_receive_detail;
              return (
                <Row
                  key={index}
                  gutter={24}
                  style={{
                    borderTop: "1px dashed",
                    paddingTop: 15,
                    paddingBottom: 15,
                  }}
                >
                  <Col span={3}>{index + 1}</Col>
                  <Col span={3}>{obj?.beam_no || 0}</Col>
                  <Col span={3}>{obj?.ends_or_tars || 0}</Col>
                  <Col span={3}>{obj?.pano || 0}</Col>
                  <Col span={4}>{obj?.taka || 0}</Col>
                  <Col span={4}>{obj?.meters || 0}</Col>
                  <Col span={4}>{obj?.net_weight || 0}</Col>
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
              <Paragraph>For, SONU TEXTILES</Paragraph>
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
        <Flex>
          <Button type="primary" style={{ marginLeft: "auto", marginTop: 15 }}>
            PRINT
          </Button>
        </Flex>
      </Modal>
    </>
  );
};

export default PrintBeamSaleChallan;
