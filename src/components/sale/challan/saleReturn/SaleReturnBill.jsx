import { useContext, useRef, useState } from "react";
import { CloseOutlined, FileTextOutlined } from "@ant-design/icons";
import { Button, Modal, Typography, Flex } from "antd";
import ReactToPrint from "react-to-print";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import dayjs from "dayjs";

// const { Text } = Typography;

const SaleReturnBill = ({ details }) => {
  const { company } = useContext(GlobalContext);
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

  if (isModelOpen) {
    console.log({ details });
  }
  // const columns = [
  //   { title: "S. NO", dataIndex: "sno", key: "sno", align: "center" },
  //   {
  //     title: "TOTAL TAKA",
  //     dataIndex: "totalTaka",
  //     key: "totalTaka",
  //     align: "center",
  //   },
  //   {
  //     title: "TOTAL METER",
  //     dataIndex: "totalMeter",
  //     key: "totalMeter",
  //     align: "center",
  //   },
  //   { title: "RATE", dataIndex: "rate", key: "rate", align: "center" },
  //   { title: "AMOUNT", dataIndex: "amount", key: "amount", align: "center" },
  // ];

  // const data = [
  //   { key: 1, sno: 1, totalTaka: 1, totalMeter: 5, rate: 12, amount: 60.0 },
  // ];

  return (
    <>
      <Button
        // type="primary"
        onClick={() => {
          setIsModalOpen(true);
        }}
      >
        <FileTextOutlined />
      </Button>

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
                  <strong>Credit Note No. :-</strong> DD-11
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
                  <strong>Party :-</strong>
                  {details?.sale_challan?.party?.party?.company_name}(
                  {`${details?.sale_challan?.party?.first_name}${details?.sale_challan?.party?.last_name}`}
                  ){details?.sale_challan?.party?.address}
                  <br />
                  23423
                </td>
                <td className="border border-gray-400 p-2">
                  <strong>{"Buyer's Ref. :-"}</strong> 2422
                  <br />
                  <strong>Date :-</strong>{" "}
                  {dayjs(details.createdAt).format("DD-MM-YYYY")}
                </td>

                <td className="border border-gray-400 p-2">
                  <strong>{"Buyer's Order No. :-"}</strong> 32
                </td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2" colSpan="3">
                  <strong>DESCRIPTION OF GOODS :-</strong>{" "}
                  {`${details.sale_challan.inhouse_quality.quality_name}`}
                  {details.sale_challan.inhouse_quality.quality_weight}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2">
                  <strong>HSN :-</strong> 574
                </td>
                <td className="border border-gray-400 p-2" colSpan="4">
                  <strong>PAN NO :-</strong> ABHPF6021C
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
                  12
                </td>
                <td
                  className="border border-gray-400 p-2 text-center"
                  colSpan="1"
                >
                  12
                </td>
                <td
                  className="border border-gray-400 p-2 text-center"
                  colSpan="1"
                >
                  15
                </td>
                <td
                  className="border border-gray-400 p-2 text-center"
                  colSpan="1"
                >
                  5
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
                ></td>
                <td
                  className="border border-gray-400 p-2 text-center"
                  colSpan="1"
                >
                  0
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
                  0
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
                  2.50
                </td>
                <td
                  className="border border-gray-400 p-2 text-center"
                  colSpan="1"
                >
                  1.50
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
                  2.50
                </td>
                <td
                  className="border border-gray-400 p-2 text-center"
                  colSpan="1"
                >
                  1.50
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
                  2.50
                </td>
                <td
                  className="border border-gray-400 p-2 text-center"
                  colSpan="1"
                >
                  1.50
                </td>
              </tr>
              <tr className="no-border text-gray-400">
                <td className="border border-gray-400 p-2" colSpan="1"></td>
                <td className="border border-gray-400 p-2" colSpan="1"></td>
                <td
                  className="border border-gray-400 p-2 text-center"
                  colSpan="1"
                >
                  Round Off
                </td>
                <td
                  className="border border-gray-400 p-2 text-center"
                  colSpan="1"
                >
                  2.50
                </td>
                <td
                  className="border border-gray-400 p-2 text-center"
                  colSpan="1"
                >
                  1.50
                </td>
              </tr>

              <tr>
                <td colSpan={4} className="text-end">
                  <strong>NET AMOUNT</strong>
                </td>
                <td colSpan={1} className="text-center">
                  <strong>43</strong>
                </td>
              </tr>

              <tr>
                <td colSpan={2}>
                  <strong>Rs.(IN WORDS):</strong>
                </td>
                <td colSpan={3}>Sixty Three only</td>
              </tr>

              <tr className="no-border">
                <td
                  style={{ borderColor: "white", padding: "0px 0px 0px 10px" }}
                >
                  <strong>IRN:</strong>
                </td>
                <td colSpan={4} className="text-right">
                  <strong>For, SONU TEXTILES</strong>
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
