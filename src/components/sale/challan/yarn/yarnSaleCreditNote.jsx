import { useState } from "react";
import { Button, Col, Flex, Modal, Row, Typography } from "antd";
import { CloseOutlined, CreditCardFilled } from "@ant-design/icons";
import dayjs from "dayjs";
import { ToWords } from "to-words";

const toWords = new ToWords({
  localeCode: "en-IN",
  converterOptions: {
    currency: true,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
    doNotAddOnly: false,
    currencyOptions: {
      // can be used to override defaults for the selected locale
      name: "Rupee",
      plural: "Rupees",
      symbol: "₹",
      fractionalUnit: {
        name: "Paisa",
        plural: "Paise",
        symbol: "",
      },
    },
  },
});
const YarnSaleCreditNote = ({ details }) => {
  const [isModelOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => {
          setIsModalOpen(true);
        }}
      >
        <CreditCardFilled />
      </Button>

      <Modal
        closeIcon={<CloseOutlined className="text-white" />}
        title={
          <Typography.Text className="text-xl font-medium text-white">
            Credit Note
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
        <Flex className="flex-col border border-b-0 border-solid">
          <Row className="p-2 border-0 border-b border-solid">
            <Col span={24} className="flex items-center justify-center border">
              <Typography.Text className="font-semibold text-center">
                <h4>Credit Note</h4>
              </Typography.Text>
            </Col>
          </Row>

          <Row className="border-0 border-b border-solid">
            <Col
              span={12}
              className="p-2 font-medium border-0 border-r border-solid"
            >
              <Flex style={{ padding: "0 !important" }}>
                <strong>Company Name :-</strong>
                <div></div>
              </Flex>
            </Col>

            <Col
              span={6}
              className="p-2 font-medium border-0 border-r border-solid"
            >
              <span>
                <strong>Credit Note No:- </strong>
              </span>
            </Col>
            <Col span={6} className="p-2 font-medium border-0">
              <span>
                <strong>Date:- </strong>
                {dayjs(details?.yarn_sale_bill?.createdAt).format("DD-MM-YYYY")}
              </span>
            </Col>
          </Row>

          <Row className="border-0 border-b border-solid">
            <Col
              span={12}
              className="p-2 font-medium border-0 border-r border-solid"
            >
              <div style={{ display: "flex", padding: "0 !important" }}>
                <strong>Party :-</strong>
                <div>
                  {" "}
                  {details?.supplier?.supplier_company}
                  <br />
                  ADDRESS OF SUPPLIER OF SUPPLIER NAME 123
                </div>
              </div>
            </Col>

            <Col span={12} className="font-medium border-0 border-r">
              <div>
                <Flex style={{ width: "100%" }}>
                  <Col
                    span={12}
                    className="p-2 font-medium border-0 border-r border-solid"
                  >
                    <span>
                      <strong>{"Buyer's Ref. :-"}</strong>
                      {details?.challan_no}
                    </span>
                  </Col>
                  <Col span={12} className="p-2 font-medium border-0">
                    <span>
                      <strong>Date :-</strong>
                      {dayjs(details?.createdAt).format("DD-MM-YYYY")}
                    </span>
                  </Col>
                </Flex>
                <div
                  className="p-2 font-medium border-0"
                  style={{
                    borderTop: "1px solid",
                  }}
                >
                  <span>
                    <strong>DESCRIPTION OF GOODS :</strong>{" "}
                    {`${details?.yarn_stock_company?.yarn_type}(${details?.yarn_stock_company?.yarn_Sub_type})-${details?.yarn_stock_company?.yarn_color}`}
                  </span>
                </div>
                <Flex style={{ width: "100%", borderTop: "1px solid" }}>
                  <Col
                    span={12}
                    className="p-2 font-medium border-0 border-r border-solid"
                  >
                    <span>
                      <strong>HSN :-</strong>
                      {details?.yarn_stock_company?.hsn_no}
                    </span>
                  </Col>
                  <Col span={12} className="p-2 font-medium border-0">
                    <span>
                      <strong>PAN NO :-</strong> ABHPP6021C
                    </span>
                  </Col>
                </Flex>
              </div>
            </Col>
          </Row>

          <Row className="border-0 border-b border-solid">
            <Col
              span={2}
              className="p-2 font-medium border-0 border-r border-solid"
            >
              <strong>S No</strong>
            </Col>
            <Col
              span={5}
              className="p-2 font-medium border-0 border-r border-solid"
            >
              <strong>TOTAL CARTOON</strong>
            </Col>
            <Col
              span={5}
              className="p-2 font-medium border-0 border-r border-solid"
            >
              <strong>TOTAL KG</strong>
            </Col>
            <Col
              span={6}
              className="p-2 font-medium border-0 border-r border-solid"
            >
              <strong>RATE</strong>
            </Col>
            <Col span={6} className="p-2 font-medium border-0">
              <strong>AMOUNT</strong>
            </Col>
          </Row>
          <Row>
            <Col
              span={2}
              className="p-2 font-medium border-0 border-r border-solid"
            >
              1
            </Col>
            <Col
              span={5}
              className="p-2 font-medium border-0 border-r border-solid"
            >
              {details?.cartoon}
            </Col>
            <Col
              span={5}
              className="p-2 font-medium border-0 border-r border-solid"
            >
              {details?.kg}
            </Col>
            <Col
              span={6}
              className="p-2 font-medium border-0 border-r border-solid"
            >
              {details?.yarn_sale_bill?.rate}
            </Col>
            <Col span={6} className="p-2 font-medium border-0">
              {Number(
                Number(details?.kg) * Number(details?.yarn_sale_bill?.rate)
              ).toFixed(2)}
            </Col>
          </Row>
          <Row style={{ height: 300 }}>
            <Col
              span={2}
              className="p-2 font-medium border-0 border-r border-solid"
            ></Col>
            <Col
              span={5}
              className="p-2 font-medium border-0 border-r border-solid"
            ></Col>
            <Col
              span={5}
              className="p-2 font-medium border-0 border-r border-solid"
            ></Col>
            <Col
              span={6}
              className="p-2 font-medium border-0 border-r border-solid"
            ></Col>
            <Col span={6} className="p-2 font-medium border-0"></Col>
          </Row>
          <Row>
            <Col
              span={2}
              className="p-2 font-medium border-0 border-r border-solid"
            ></Col>
            <Col
              span={5}
              className="p-2 font-medium border-0 border-r border-solid"
            ></Col>
            <Col
              span={5}
              className="p-2 font-medium border-0 border-r border-solid"
            >
              SGST(%)
            </Col>
            <Col
              span={6}
              className="p-2 font-medium border-0 border-r border-solid"
            >
              {details?.yarn_sale_bill?.SGST_value}
            </Col>
            <Col span={6} className="p-2 font-medium border-0">
              {details?.yarn_sale_bill?.SGST_amount}
            </Col>
          </Row>
          <Row>
            <Col
              span={2}
              className="p-2 font-medium border-0 border-r border-solid"
            ></Col>
            <Col
              span={5}
              className="p-2 font-medium border-0 border-r border-solid"
            ></Col>
            <Col
              span={5}
              className="p-2 font-medium border-0 border-r border-solid"
            >
              CGST(%)
            </Col>
            <Col
              span={6}
              className="p-2 font-medium border-0 border-r border-solid"
            >
              {details?.yarn_sale_bill?.CGST_value}
            </Col>
            <Col span={6} className="p-2 font-medium border-0">
              {details?.yarn_sale_bill?.CGST_amount}
            </Col>
          </Row>
          <Row>
            <Col
              span={2}
              className="p-2 font-medium border-0 border-r border-solid"
            ></Col>
            <Col
              span={5}
              className="p-2 font-medium border-0 border-r border-solid"
            ></Col>
            <Col
              span={5}
              className="p-2 font-medium border-0 border-r border-solid"
            >
              IGST(%)
            </Col>
            <Col
              span={6}
              className="p-2 font-medium border-0 border-r border-solid"
            >
              {details?.yarn_sale_bill?.IGST_value}
            </Col>
            <Col span={6} className="p-2 font-medium border-0">
              {details?.yarn_sale_bill?.IGST_amount}
            </Col>
          </Row>
          <Row className="border-0 border-b border-solid">
            <Col
              span={2}
              className="p-2 font-medium border-0 border-r border-solid"
            ></Col>
            <Col
              span={5}
              className="p-2 font-medium border-0 border-r border-solid"
            ></Col>
            <Col
              span={5}
              className="p-2 font-medium border-0 border-r border-solid"
            >
              Round Off
            </Col>
            <Col
              span={6}
              className="p-2 font-medium border-0 border-r border-solid"
            >
              ----
            </Col>
            <Col span={6} className="p-2 font-medium border-0">
              {details?.yarn_sale_bill?.round_off_amount}
            </Col>
          </Row>
          <Row className="border-0 border-b border-solid">
            <Col span={2} className="p-2 font-medium"></Col>
            <Col span={5} className="p-2 font-medium"></Col>
            <Col span={5} className="p-2 font-medium "></Col>
            <Col
              span={6}
              className="p-2 font-medium border-0 border-r border-solid"
            >
              <strong>NET AMOUNT</strong>
            </Col>
            <Col span={6} className="p-2 font-medium border-0">
              <strong>{details?.yarn_sale_bill?.net_amount}</strong>
            </Col>
          </Row>
          <Row className="border-0 border-b border-solid">
            <Col span={4} className="p-2 font-medium">
              Rs.(IN WORDS):
            </Col>
            <Col span={20} className="p-2 font-medium">
              {toWords.convert(details?.yarn_sale_bill?.net_amount)}
            </Col>
          </Row>
          <Row className="border-0 p-2" style={{ borderBottom: "1px solid" }}>
            <Col span={18} className="p-2"></Col>
            <Col span={6} className="p-2 text-right">
              <div>
                <strong>For, SONU TEXTILES</strong>
              </div>
              <div>Authorised Signatory</div>
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

export default YarnSaleCreditNote;
