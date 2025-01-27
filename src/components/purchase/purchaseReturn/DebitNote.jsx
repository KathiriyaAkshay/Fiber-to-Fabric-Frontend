import { CloseOutlined, FileOutlined } from "@ant-design/icons";
import { Button, Modal, Table, Typography, Row, Col, Flex, Tooltip } from "antd";
import React, { useRef, useState, useContext } from "react";
import ReactToPrint from "react-to-print";
import logo from "./../../../assets/png/debit_icon.png";
const { Text } = Typography;
import { FileTextOutlined } from "@ant-design/icons";
import { GlobalContext } from "../../../contexts/GlobalContext";
import moment from "moment";
import { getDisplayQualityName } from "../../../constants/nameHandler";
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

const DebitNote = ({ details }) => {
  const [isModelOpen, setIsModalOpen] = useState(false);
  const { companyId, companyListRes, company } = useContext(GlobalContext);
  const componentRef = useRef();
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

  const columns = [
    { title: "S. NO", dataIndex: "sno", key: "sno", align: "center" },
    {
      title: "TOTAL TAKA",
      dataIndex: "totalTaka",
      key: "totalTaka",
      align: "center",
    },
    {
      title: "TOTAL METER",
      dataIndex: "totalMeter",
      key: "totalMeter",
      align: "center",
    },
    { title: "RATE", dataIndex: "rate", key: "rate", align: "center" },
    { title: "AMOUNT", dataIndex: "amount", key: "amount", align: "center" },
  ];

  const data = [
    { key: 1, sno: 1, totalTaka: 1, totalMeter: 5, rate: 12, amount: 60.0 },
  ];

  return (
    <>
      <div onClick={() => {
        setIsModalOpen(true);
      }}
        style={{cursor: "pointer"}}
      >
        <Tooltip title = {`DEBIT NOTE : ${details?.debit_note?.debit_note_number}`}>
          <FileTextOutlined
            style={{
              fontSize: 20, 
              marginLeft: 10, 
              color: "red"
            }}
          />
        </Tooltip>
      </div>
      <Modal
        closeIcon={<CloseOutlined className="text-white" />}
        title={
          <Typography.Text className="text-xl font-medium text-white">
            Debit Note
          </Typography.Text>
        }
        open={isModelOpen}
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
        width={"70vw"}
      >
        <div className="debitnote-wrapper" ref={componentRef}>
          {/* first component */}
          <div className="text-center relative border-b border-black">
            <span className="align-left absolute left-1 h-full">
              <img src={logo} height="100%" width="100%" />
            </span>
            <span className="align-center">
              <Typography.Title level={2}>Debit Note</Typography.Title>
            </span>
          </div>
          <table className="w-full table-custom border border-collaps">
            <tbody>
              <tr>
                <td className="border border-gray-400 p-2" colSpan={3}>
                  <strong>Company Name :-</strong> {company?.company_name}
                </td>
                <td className="border border-gray-400 p-2">
                  <strong>Debit Note No. :-</strong> {details?.debit_note?.debit_note_number}
                </td>
                <td className="border border-gray-400 p-2">
                  <strong>Dated :-</strong> {moment(details?.debit_note?.createdAt).format("DD-MM-YYYY")}
                </td>
              </tr>
              <tr>
                <td
                  className="border border-gray-400 p-2"
                  rowSpan={3}
                  colSpan={3}
                >
                  <div>
                    <div>
                      Supplier
                    </div>
                    <strong>
                      {String(details?.purchase_taka_challan?.supplier?.supplier_company).toUpperCase()}
                    </strong>
                    <div>
                      {details?.purchase_taka_challan?.supplier?.supplier_name}
                    </div>
                    <div>
                      <strong>Address: </strong> {details?.purchase_taka_challan?.supplier?.user?.address}
                    </div>
                    <div>
                      <strong>GST NO: </strong> {details?.purchase_taka_challan?.supplier?.user?.gst_no}
                    </div>
                  </div>
                </td>
                <td className="border border-gray-400 p-2">
                  <strong>Buyer's Ref. :-</strong> {details?.debit_note?.invoice_no || "N/A"}
                  <br />
                  <strong>Challan Date :-</strong> {moment(details?.purchase_taka_challan?.createdAt).format("DD-MM-YYYY")}
                </td>

                <td className="border border-gray-400 p-2">
                  <strong>Buyer's Order No. :-</strong> {details?.purchase_taka_challan?.gray_order?.order_no}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2" colSpan="3">
                  <strong>DESCRIPTION OF GOODS :-</strong> {getDisplayQualityName(details?.purchase_taka_challan?.inhouse_quality)}
                  (8KG)
                </td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2">
                  <strong>HSN :-</strong> ----
                </td>
                <td className="border border-gray-400 p-2" colSpan="4">
                  <strong>PAN NO :-</strong> {details?.purchase_taka_challan?.supplier?.user?.pancard_no}
                </td>
              </tr>
              <tr>
                <td colSpan={5}></td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2" colSpan="1">
                  <strong>S. NO-</strong>
                </td>
                <td className="border border-gray-400 p-2" colSpan="1">
                  <strong>TOTAL TAKA</strong>
                </td>
                <td className="border border-gray-400 p-2" colSpan="1">
                  <strong>TOTAL METER</strong>
                </td>
                <td className="border border-gray-400 p-2" colSpan="1">
                  <strong>RATE</strong>
                </td>
                <td className="border border-gray-400 p-2" colSpan="1">
                  <strong>AMOUNT</strong>
                </td>
              </tr>
              <tr className="no-border">
                <td className="border border-gray-400 p-2" colSpan="1">
                  1
                </td>
                <td className="border border-gray-400 p-2" colSpan="1">
                  {details?.debit_note?.total_taka || 0 }
                </td>
                <td className="border border-gray-400 p-2" colSpan="1">
                  {details?.debit_note?.total_meter || 0}
                </td>
                <td className="border border-gray-400 p-2" colSpan="1">
                  {details?.debit_note?.rate || 0}
                </td>
                <td className="border border-gray-400 p-2" colSpan="1">
                  {details?.debit_note?.amount || 0 }
                </td>
              </tr>
              <tr className="no-border">
                <td className="border border-gray-400 p-2" colSpan="1"></td>
                <td className="border border-gray-400 p-2" colSpan="1"></td>
                <td className="border border-gray-400 p-2" colSpan="1"></td>
                <td className="border border-gray-400 p-2" colSpan="1"></td>
                <td className="border border-gray-400 p-2" colSpan="1"></td>
              </tr>
              <tr className="no-border text-gray-400">
                <td className="border border-gray-400 p-2" colSpan="1"></td>
                <td className="border border-gray-400 p-2" colSpan="1"></td>
                <td className="border border-gray-400 p-2" colSpan="1">
                  SGST(%)
                </td>
                <td className="border border-gray-400 p-2" colSpan="1">
                  {details?.debit_note?.SGST_value || 0 }
                </td>
                <td className="border border-gray-400 p-2" colSpan="1">
                  {details?.debit_note?.SGST_amount || 0 }
                </td>
              </tr>
              <tr className="no-border text-gray-400">
                <td className="border border-gray-400 p-2" colSpan="1"></td>
                <td className="border border-gray-400 p-2" colSpan="1"></td>
                <td className="border border-gray-400 p-2" colSpan="1">
                  CGST(%)
                </td>
                <td className="border border-gray-400 p-2" colSpan="1">
                  {details?.debit_note?.CGST_value || 0}
                </td>
                <td className="border border-gray-400 p-2" colSpan="1">
                  1.50
                </td>
              </tr>
              <tr className="no-border text-gray-400">
                <td className="border border-gray-400 p-2" colSpan="1"></td>
                <td className="border border-gray-400 p-2" colSpan="1"></td>
                <td className="border border-gray-400 p-2" colSpan="1">
                  IGST(%)
                </td>
                <td className="border border-gray-400 p-2" colSpan="1">
                  {details?.debit_note?.IGST_value || 0}
                </td>
                <td className="border border-gray-400 p-2" colSpan="1">
                  {details?.debit_note?.IGST_amount || 0 }
                </td>
              </tr>
              <tr className="no-border text-gray-400">
                <td className="border border-gray-400 p-2" colSpan="1"></td>
                <td className="border border-gray-400 p-2" colSpan="1"></td>
                <td className="border border-gray-400 p-2" colSpan="1">
                  Round Off
                </td>
                <td className="border border-gray-400 p-2" colSpan="1">
                  
                </td>
                <td className="border border-gray-400 p-2" colSpan="1">
                  {details?.debit_note?.round_off_amount || 0 }
                </td>
              </tr>

              <tr>
                <td colSpan={4}>
                  <strong>NET AMOUNT</strong>
                </td>
                <td colSpan={1}>
                  <strong>{details?.debit_note?.net_amount}</strong>
                </td>
              </tr>

              <tr>
                <td colSpan={2}>
                  <strong>Rs.(IN WORDS):</strong>
                </td>
                <td colSpan={3}>
                {details?.debit_note?.net_amount?toWords.convert(details?.debit_note?.net_amount):toWords.convert(0)}
                </td>
              </tr>
              <tr className="no-border">
                <td colSpan={5} className="text-right">
                  <strong>For, {company?.company_name}</strong>
                </td>
              </tr>
              <tr className="no-border">
                <td colSpan={5} className="text-right">
                  <strong>Authorized Singnatory</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Modal>
    </>
  );
};

export default DebitNote;
