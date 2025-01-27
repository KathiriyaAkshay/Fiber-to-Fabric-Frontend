import { useContext, useRef, useState } from "react";
import { CloseOutlined, FileTextOutlined } from "@ant-design/icons";
import { Button, Modal, Typography, Flex } from "antd";
import ReactToPrint from "react-to-print";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import dayjs from "dayjs";
import { getDisplayQualityName } from "../../../../constants/nameHandler";
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

const SaleReturnBill = ({ details }) => {
  const { company } = useContext(GlobalContext);
  console.log("Company information");
  console.log(company);

  console.log("Credit note details");
  console.log(details);
  
  
  
  const [isModelOpen, setIsModalOpen] = useState(false);
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

  return (
    <>
      {/* <Button
        // type="primary"
        onClick={() => {
          setIsModalOpen(true);
        }}
      >
      </Button> */}
      
      <div style={{
        fontSize: 20, 
        cursor: "pointer", 
        marginLeft: 10, 
        color: "green"
      }}
        onClick={() => {
          setIsModalOpen(true);
        }}
      >
        <FileTextOutlined />
      </div>

      <Modal
        closeIcon={<CloseOutlined className="text-white" />}
        title={
          <Typography.Text className="text-xl font-medium text-white">
            Credit Note
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
            <span className="align-center">
              <Typography.Title level={2}>Credit Note</Typography.Title>
            </span>
          </div>

          <table className="w-full table-custom border border-collaps">
            <tbody>
              <tr>
                <td className="border border-gray-400 p-2" colSpan={3}>
                  <strong>Company Name :-</strong>{" "}
                  {company.company_name.split("_").join(" ")}
                </td>
                <td className="border border-gray-400 p-2">
                  <strong>Credit Note No. :-</strong> {details?.credit_note?.credit_note_number}
                </td>
                <td className="border border-gray-400 p-2">
                  <strong>Date :-</strong> 24-07-2024
                </td>
              </tr>
              <tr>
                <td
                  className="border border-gray-400 p-2"
                  rowSpan={3}
                  colSpan={3}
                > 
                  <div>
                    <strong>Party :</strong>
                    <div>
                      <strong>
                        {String(details?.sale_challan?.party?.party?.company_name).toUpperCase()}
                      </strong>
                    </div>
                    <div>
                      {`${details?.sale_challan?.party?.first_name}${details?.sale_challan?.party?.last_name}`}
                    </div>
                    <div>
                      {details?.sale_challan?.party?.address}
                    </div>
                    <div>
                      <strong>GST NO:</strong> {details?.sale_challan?.party?.gst_no}
                    </div>
                  </div>
                </td>
                <td className="border border-gray-400 p-2">
                  <strong>{"Buyer's Ref. :-"}</strong> {details?.credit_note?.invoice_no}
                  <br />
                  <strong>Date :-</strong>{" "}
                  {dayjs(details.createdAt).format("DD-MM-YYYY")}
                </td>

                <td className="border border-gray-400 p-2">
                  <strong>{"Buyer's Order No. :-"}</strong> {details?.sale_challan?.gray_order?.order_no}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2" colSpan="3">
                  <strong>DESCRIPTION OF GOODS :-</strong>{" "}
                  {`${getDisplayQualityName(details.sale_challan.inhouse_quality)}`}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2">
                  <strong>HSN :-</strong> --
                </td>
                <td className="border border-gray-400 p-2" colSpan="4">
                  <strong>PAN NO :-</strong> {details?.sale_challan?.party?.pancard_no}
                </td>
              </tr>
              <tr>
                <td colSpan={5}></td>
              </tr>
              <tr>
                <td
                  className="border border-gray-400 p-2 text-center"
                  colSpan="1"
                >
                  <strong>S. NO-</strong>
                </td>
                <td
                  className="border border-gray-400 p-2 text-center"
                  colSpan="1"
                >
                  <strong>TOTAL TAKA</strong>
                </td>
                <td
                  className="border border-gray-400 p-2 text-center"
                  colSpan="1"
                >
                  <strong>TOTAL METER</strong>
                </td>
                <td
                  className="border border-gray-400 p-2 text-center"
                  colSpan="1"
                >
                  <strong>RATE</strong>
                </td>
                <td
                  className="border border-gray-400 p-2 text-center"
                  colSpan="1"
                >
                  <strong>AMOUNT</strong>
                </td>
              </tr>
              <tr className="no-border">
                <td
                  className="border border-gray-400 p-2 text-center"
                  colSpan="1"
                >
                  1
                </td>
                <td
                  className="border border-gray-400 p-2 text-center"
                  colSpan="1"
                >
                  {details?.credit_note?.total_taka}
                </td>
                <td
                  className="border border-gray-400 p-2 text-center"
                  colSpan="1"
                >
                  {details?.credit_note?.total_meter}
                </td>
                <td
                  className="border border-gray-400 p-2 text-center"
                  colSpan="1"
                >
                  {details?.credit_note?.rate}
                </td>
                <td
                  className="border border-gray-400 p-2 text-center"
                  colSpan="1"
                >
                  {details?.credit_note?.amount}
                </td>
              </tr>
              {Array.from({ length: 5 }).map((_, index) => {
                return (
                  <tr key={index} className="no-border">
                    <td className="border border-gray-400 p-2" colSpan="1"></td>
                    <td className="border border-gray-400 p-2" colSpan="1"></td>
                    <td className="border border-gray-400 p-2" colSpan="1"></td>
                    <td className="border border-gray-400 p-2" colSpan="1"></td>
                    <td className="border border-gray-400 p-2" colSpan="1"></td>
                  </tr>
                );
              })}
              <tr className="no-border text-gray-400">
                <td className="border border-gray-400 p-2" colSpan="1"></td>
                <td className="border border-gray-400 p-2" colSpan="1"></td>
                <td
                  className="border border-gray-400 p-2 text-center"
                  colSpan="1"
                >
                  (-) Discount
                </td>
                <td
                  className="border border-gray-400 p-2 text-center"
                  colSpan="1"
                >
                </td>
                <td
                  className="border border-gray-400 p-2 text-center"
                  colSpan="1"
                >
                  {details?.credit_note?.discount_value || 0}
                </td>
              </tr>
              <tr className="no-border text-gray-400">
                <td className="border border-gray-400 p-2" colSpan="1"></td>
                <td className="border border-gray-400 p-2" colSpan="1"></td>
                <td
                  className="border border-gray-400 p-2 text-center"
                  colSpan="1"
                >
                  (-) Total Amount
                </td>
                <td
                  className="border border-gray-400 p-2 text-center"
                  colSpan="1"
                ></td>
                <td
                  className="border border-gray-400 p-2 text-center"
                  colSpan="1"
                >
                  {details?.credit_note?.discount_amount || details?.credit_note?.amount}
                </td>
              </tr>
              <tr className="no-border text-gray-400">
                <td className="border border-gray-400 p-2" colSpan="1"></td>
                <td className="border border-gray-400 p-2" colSpan="1"></td>
                <td
                  className="border border-gray-400 p-2 text-center"
                  colSpan="1"
                >
                  SGST(%)
                </td>
                <td
                  className="border border-gray-400 p-2 text-center"
                  colSpan="1"
                >
                  {details?.credit_note?.SGST_value || 0}
                </td>
                <td
                  className="border border-gray-400 p-2 text-center"
                  colSpan="1"
                >
                  {details?.credit_note?.SGST_amount || 0 }
                </td>
              </tr>
              <tr className="no-border text-gray-400">
                <td className="border border-gray-400 p-2" colSpan="1"></td>
                <td className="border border-gray-400 p-2" colSpan="1"></td>
                <td
                  className="border border-gray-400 p-2 text-center"
                  colSpan="1"
                >
                  CGST(%)
                </td>
                <td
                  className="border border-gray-400 p-2 text-center"
                  colSpan="1"
                >
                  {details?.credit_note?.CGST_value || 0}
                </td>
                <td
                  className="border border-gray-400 p-2 text-center"
                  colSpan="1"
                >
                  {details?.credit_note?.CGST_amount || 0}
                </td>
              </tr>
              <tr className="no-border text-gray-400">
                <td className="border border-gray-400 p-2" colSpan="1"></td>
                <td className="border border-gray-400 p-2" colSpan="1"></td>
                <td
                  className="border border-gray-400 p-2 text-center"
                  colSpan="1"
                >
                  IGST(%)
                </td>
                <td
                  className="border border-gray-400 p-2 text-center"
                  colSpan="1"
                >
                  {details?.credit_note?.IGST_value || 0 }
                </td>
                <td
                  className="border border-gray-400 p-2 text-center"
                  colSpan="1"
                >
                  {details?.credit_note?.IGST_amount || 0 }
                </td>
              </tr>
              <tr className="no-border text-gray-400">
                <td className="border border-gray-400 p-2" colSpan="1"></td>
                <td className="border border-gray-400 p-2" colSpan="1"></td>
                <td
                  className="border border-gray-400 p-2 text-center"
                  colSpan="1"
                >
                  <div style={{
                    fontWeight: 600
                  }}>
                    Round Off
                  </div>
                </td>
                <td
                  className="border border-gray-400 p-2 text-center"
                  colSpan="1"
                >
                </td>
                <td
                  className="border border-gray-400 p-2 text-center"
                  colSpan="1"
                >
                  {details?.credit_note?.round_off_amount || 0}
                </td>
              </tr>

              <tr>
                <td colSpan={4} className="text-end">
                  <strong>NET AMOUNT</strong>
                </td>
                <td colSpan={1} className="text-center">
                  <strong>
                    {details?.credit_note?.net_amount || 0 }
                  </strong>
                </td>
              </tr>

              <tr>
                <td colSpan={2}>
                  <strong>Rs.(IN WORDS):</strong>
                </td>
                <td colSpan={3}>{details?.credit_note?.net_amount?toWords.convert(details?.credit_note?.net_amount):toWords.convert(0)}</td>
              </tr>

              <tr className="no-border">
                <td
                  style={{ borderColor: "white", padding: "0px 0px 0px 10px" }}
                >
                  <strong>IRN:</strong>
                </td>
                <td colSpan={4} className="text-right">
                  <strong>For, {company?.company_name}</strong>
                </td>
              </tr>

              <tr className="no-border">
                <td
                  style={{ borderColor: "white", padding: "0px 0px 0px 10px" }}
                >
                  <strong>ACK NO:</strong>
                </td>
                <td colSpan={4} className="text-right"></td>
              </tr>

              <tr className="no-border">
                <td
                  style={{ borderColor: "white", padding: "0px 0px 0px 10px" }}
                >
                  <strong>ACK DATE:</strong>
                </td>
                <td colSpan={4} className="text-right"></td>
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

export default SaleReturnBill;
