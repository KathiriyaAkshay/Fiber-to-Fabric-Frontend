import { Button, Flex, Typography } from "antd";
import { useRef } from "react";
import { useState, useEffect } from "react";
import { PrinterOutlined } from "@ant-design/icons";
import ReactToPrint from "react-to-print";
import { useContext } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  // PDFViewer,
  Font,
} from "@react-pdf/renderer";
import { DownloadOutlined } from "@ant-design/icons";
import { FileExcelFilled } from "@ant-design/icons";
import "../../../components/common/printPage.css";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { capitalizeFirstCharacter } from "../../../utils/mutationUtils";

function getFileName(input) {
  const formattedString = input?.toLowerCase()?.split(" ").join("-");
  const dateString = dayjs().format("YYYY-MMD-D_HH:mm:ss");
  return `${formattedString}-${dateString}`;
}

const PrintCashBookStatement = () => {
  const ComponentRef = useRef();
  const pageStyle = `
         @media print {
            * {
                box-sizing: border-box; /* Include box-sizing for better layout control */
            }

            html, body {
                margin: 0;
                padding: 0;
                width: 100%;
                height: auto;
            }

            .print-wrapper {
                margin: 0;
                padding: 0;
            }

            table {
                width: 100%;
                table-layout: fixed; /* This will help the table to take full width */
            }

            td, th {
                overflow: hidden;
                text-overflow: ellipsis; /* To add ellipsis (...) for overflow text */
                word-wrap: break-word; /* To wrap long words */
            }
    }`;

  Font.register({
    family: "Roboto",
    fonts: [
      {
        src: "./font/Roboto-Medium.ttf", // Regular
        fontWeight: "normal",
      },
      {
        src: "./font/Roboto-Bold.ttf",
        fontWeight: "bold",
      },
    ],
  });

  const borderColorValue = "#efefef";
  const printPageStyle = StyleSheet.create({
    page: {
      flexDirection: "column",
      padding: 20,
      fontFamily: "Roboto",
    },

    section: {
      marginRight: "auto",
    },

    title: {
      fontSize: 13,
      textAlign: "center",
      marginBottom: 20,
      color: "#194A6D",
      fontWeight: "bold",
    },

    companyInfo: {
      display: "flex",
      flexDirection: "row",
      width: "100%",
      marginBottom: 20,
    },

    infoText: {
      fontSize: 9,
    },

    leftColumn: {
      fontSize: 9,
      color: "black",
      marginRight: "auto",
    },

    rightColumn: {
      fontSize: 9,
      color: "black",
      marginRight: "auto",
      justifyContent: "flex-end",
    },

    table: {
      display: "table",
      width: "auto",
      borderStyle: "solid",
      borderWidth: 1,
      borderRightWidth: 0,
      borderBottomWidth: 0,
      borderLeftColor: borderColorValue,
      borderTopColor: borderColorValue,
    },
    tableRow: {
      flexDirection: "row",
    },
    tableCol: {
      borderStyle: "solid",
      borderWidth: 1,
      borderLeftWidth: 0,
      borderTopWidth: 0,
      paddingBottom: 5,
      borderRightColor: borderColorValue,
      borderBottomColor: borderColorValue,
      paddingLeft: 2,
      paddingRight: 2,
      flex: 1,
      fontSize: 10,
    },

    tableHeaderCol: {
      borderStyle: "solid",
      borderWidth: 1,
      borderLeftWidth: 0,
      borderTopWidth: 0,
      backgroundColor: "#194A6D",
      paddingBottom: 3,
      borderRightColor: borderColorValue,
      borderBottomColor: borderColorValue,
      flex: 1,
      fontSize: 10,
    },
    tableCell: {
      margin: "auto",
      marginTop: 5,
      fontSize: 9,
    },
  });

  const [orderData, setOrderData] = useState([]);
  const [orderTitle] = useState("CashBook Entries");
  const [tableHead, setTableHead] = useState(null);
  // const [totalVisible, setTotalVisible] = useState(false);
  // const [totalCount, setTotalCount] = useState(null);
  const [downloadFileName, setDownloadFileName] = useState("");

  const { company } = useContext(GlobalContext);
  console.log("cash book print statement");

  const excelDownloadHandler = () => {
    const fileName = prompt(
      "Please enter the file name",
      getFileName(orderTitle)
    );

    if (fileName) {
      let data = [];

      const unverifiedEntriesBlock = [
        "",
        "",
        "",
        orderData?.unverifiedEntries && orderData?.unverifiedEntries?.length
          ? "Unverified Entries"
          : "No unverified entry available",
        "",
        "",
        "",
      ];
      const unverifiedEntries = orderData.unverifiedEntries.map((row) => {
        return [
          dayjs(row?.createdAt).format("DD-MM-YYYY"),
          dayjs(row?.createdAt).format("HH:mm:ss"),
          capitalizeFirstCharacter(row?.particular_type).split("_").join(" "),
          row?.is_withdraw ? row?.amount?.toFixed(2) : (0).toFixed(2),
          !row?.is_withdraw ? row?.amount?.toFixed(2) : (0).toFixed(2),
          row?.balance,
          row.remarks,
        ];
      });

      const verifiedEntriesBlock = [
        "",
        "",
        "",
        orderData?.verifiedEntries && orderData?.verifiedEntries?.length
          ? "Verified Entries"
          : "No verified entry available",
        "",
        "",
        "",
      ];
      const verifiedEntries = orderData.verifiedEntries.map((row) => {
        return [
          dayjs(row?.createdAt).format("DD-MM-YYYY"),
          dayjs(row?.createdAt).format("HH:mm:ss"),
          capitalizeFirstCharacter(row?.particular_type).split("_").join(" "),
          row?.is_withdraw ? row?.amount?.toFixed(2) : (0).toFixed(2),
          !row?.is_withdraw ? row?.amount?.toFixed(2) : (0).toFixed(2),
          row?.balance,
          row.remarks,
        ];
      });

      const totalBlock = [
        [
          "Total",
          "",
          "",
          orderData?.totalAmount || 0,
          orderData?.totalDeposit || 0,
          "",
          "",
        ],
        ["Closing Balance", "", "", "", orderData?.closingBalance || 0, "", ""],
      ];

      data = [
        tableHead,
        unverifiedEntriesBlock,
        ...unverifiedEntries,
        verifiedEntriesBlock,
        ...verifiedEntries,
        Array(9).fill(""),
        ...totalBlock,
      ];

      let worksheet = XLSX.utils.aoa_to_sheet(data);
      let workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, orderTitle);

      // Export to Excel file
      // const dateString = dayjs().format("YYYY-MMD-D_HH:mm:ss");
      // const fileName = `${fileName}.xlsx`;
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
    }
  };

  useEffect(() => {
    // let page_title = localStorage.getItem("print-title");
    // setOrderTitle(page_title);

    let page_data = JSON.parse(localStorage.getItem("print-array"));
    setOrderData({ ...page_data });

    let page_head = JSON.parse(localStorage.getItem("print-head"));
    setTableHead(page_head);

    // let total_visible = localStorage.getItem("total-count");
    // if (total_visible == "1") {
    //   setTotalVisible(true);
    // } else {
    //   setTotalVisible(false);
    // }

    // let total_data = JSON.parse(localStorage.getItem("total-data"));
    // setTotalCount(total_data);
  }, []);

  const MyDocument = () => (
    <Document>
      <Page size="A3" style={printPageStyle.page}>
        <View style={[printPageStyle.section]}>
          <Text style={[printPageStyle.title]}>{orderTitle}</Text>
        </View>
        <View style={[printPageStyle.companyInfo]}>
          <View style={printPageStyle.rightColumn}>
            <Text
              style={[
                printPageStyle.infoText,
                { textAlign: "right", marginBottom: 6 },
              ]}
            >
              Company Name:- {company?.company_name}
            </Text>
            <Text style={[printPageStyle.infoText, { marginBottom: 6 }]}>
              Company Contact:- {company?.company_contact}
            </Text>
            <Text style={[printPageStyle.infoText, { textAlign: "right" }]}>
              GST No.:- {company?.gst_no}
            </Text>
          </View>
        </View>
        <View style={printPageStyle.table}>
          <View style={printPageStyle.tableRow}>
            {tableHead?.map((element, index) => (
              <View
                key={index + "_header"}
                style={printPageStyle.tableHeaderCol}
              >
                <Text style={[printPageStyle.tableCell, { color: "#FFFFFF" }]}>
                  {element}
                </Text>
              </View>
            ))}
          </View>

          <View style={printPageStyle.tableRow}>
            <View style={printPageStyle.tableCol}>
              <Text style={printPageStyle.tableCell} colSpan={8}>
                {orderData?.unverifiedEntries &&
                orderData?.unverifiedEntries?.length
                  ? "Unverified Entries"
                  : "No unverified entry available"}
              </Text>
            </View>
          </View>

          {orderData?.unverifiedEntries && orderData?.unverifiedEntries?.length
            ? orderData?.unverifiedEntries?.map((row, index) => {
                return (
                  <View
                    key={index}
                    style={{
                      ...printPageStyle.tableRow,
                      backgroundColor: row?.is_withdraw ? "#ffe9e9" : "#eff5e9",
                    }}
                  >
                    <View style={printPageStyle.tableCol}>
                      <Text style={printPageStyle.tableCell}>
                        {dayjs(row?.createdAt).format("DD-MM-YYYY")}
                      </Text>
                    </View>
                    <View style={printPageStyle.tableCol}>
                      <Text style={printPageStyle.tableCell}>
                        {dayjs(row?.createdAt).format("HH:mm:ss")}
                      </Text>
                    </View>
                    <View style={printPageStyle.tableCol}>
                      <Text style={printPageStyle.tableCell}>
                        {capitalizeFirstCharacter(row?.particular_type)
                          .split("_")
                          .join(" ")}
                      </Text>
                    </View>
                    <View style={printPageStyle.tableCol}>
                      <Text
                        style={{
                          ...printPageStyle.tableCell,
                          color: "red",
                          fontWeight: "600",
                        }}
                      >
                        {row?.is_withdraw
                          ? row?.amount?.toFixed(2)
                          : (0).toFixed(2)}
                      </Text>
                    </View>
                    <View
                      style={{
                        ...printPageStyle.tableCol,
                        color: "red",
                        fontWeight: "600",
                      }}
                    >
                      <Text style={printPageStyle.tableCell}>
                        {!row?.is_withdraw
                          ? row?.amount?.toFixed(2)
                          : (0).toFixed(2)}
                      </Text>
                    </View>
                    <View style={printPageStyle.tableCol}>
                      <Text style={printPageStyle.tableCell}>
                        {row?.balance}
                      </Text>
                    </View>
                    <View style={printPageStyle.tableCol}>
                      <Text style={printPageStyle.tableCell}>
                        {row.remarks}
                      </Text>
                    </View>
                  </View>
                );
              })
            : null}

          <View style={printPageStyle.tableRow}>
            <View style={printPageStyle.tableCol}>
              <Text style={printPageStyle.tableCell} colSpan={8}>
                {orderData?.verifiedEntries &&
                orderData?.verifiedEntries?.length
                  ? "Verified Entries"
                  : "No verified entry available"}
              </Text>
            </View>
          </View>

          {orderData?.verifiedEntries && orderData?.verifiedEntries?.length
            ? orderData?.verifiedEntries?.map((row, index) => {
                return (
                  <View
                    key={index}
                    style={{
                      ...printPageStyle.tableRow,
                      backgroundColor: row?.is_withdraw ? "#ffe9e9" : "#eff5e9",
                    }}
                  >
                    <View style={printPageStyle.tableCol}>
                      <Text style={printPageStyle.tableCell}>
                        {dayjs(row?.createdAt).format("DD-MM-YYYY")}
                      </Text>
                    </View>
                    <View style={printPageStyle.tableCol}>
                      <Text style={printPageStyle.tableCell}>
                        {dayjs(row?.createdAt).format("HH:mm:ss")}
                      </Text>
                    </View>
                    <View style={printPageStyle.tableCol}>
                      <Text style={printPageStyle.tableCell}>
                        {capitalizeFirstCharacter(row?.particular_type)
                          .split("_")
                          .join(" ")}
                      </Text>
                    </View>
                    <View style={printPageStyle.tableCol}>
                      <Text
                        style={{
                          ...printPageStyle.tableCell,
                          color: "red",
                          fontWeight: "600",
                        }}
                      >
                        {row?.is_withdraw
                          ? row?.amount?.toFixed(2)
                          : (0).toFixed(2)}
                      </Text>
                    </View>
                    <View
                      style={{
                        ...printPageStyle.tableCol,
                        color: "red",
                        fontWeight: "600",
                      }}
                    >
                      <Text style={printPageStyle.tableCell}>
                        {!row?.is_withdraw
                          ? row?.amount?.toFixed(2)
                          : (0).toFixed(2)}
                      </Text>
                    </View>
                    <View style={printPageStyle.tableCol}>
                      <Text style={printPageStyle.tableCell}>
                        {row?.balance}
                      </Text>
                    </View>
                    <View style={printPageStyle.tableCol}>
                      <Text style={printPageStyle.tableCell}>
                        {row.remarks}
                      </Text>
                    </View>
                  </View>
                );
              })
            : null}

          <View style={printPageStyle.tableRow}>
            <View style={printPageStyle.tableCol}>
              <Text style={printPageStyle.tableCell}>Total</Text>
            </View>
            <View style={printPageStyle.tableCol}>
              <Text style={printPageStyle.tableCell}></Text>
            </View>
            <View style={printPageStyle.tableCol}>
              <Text style={printPageStyle.tableCell}></Text>
            </View>
            <View style={printPageStyle.tableCol}>
              <Text style={printPageStyle.tableCell}>
                {orderData?.totalAmount || 0}
              </Text>
            </View>
            <View style={printPageStyle.tableCol}>
              <Text style={printPageStyle.tableCell}>
                {orderData?.totalDeposit || 0}
              </Text>
            </View>
            <View style={printPageStyle.tableCol}>
              <Text style={printPageStyle.tableCell}></Text>
            </View>
            <View style={printPageStyle.tableCol}>
              <Text style={printPageStyle.tableCell}></Text>
            </View>
          </View>

          <View style={printPageStyle.tableRow}>
            <View style={printPageStyle.tableCol}>
              <Text style={printPageStyle.tableCell}> Closing Balance</Text>
            </View>
            <View style={printPageStyle.tableCol}>
              <Text style={printPageStyle.tableCell}></Text>
            </View>
            <View style={printPageStyle.tableCol}>
              <Text style={printPageStyle.tableCell}></Text>
            </View>
            <View style={printPageStyle.tableCol}>
              <Text style={printPageStyle.tableCell}></Text>
            </View>
            <View style={printPageStyle.tableCol}>
              <Text style={printPageStyle.tableCell}>
                {orderData?.closingBalance || 0}
              </Text>
            </View>
            <View style={printPageStyle.tableCol}>
              <Text style={printPageStyle.tableCell}></Text>
            </View>
            <View style={printPageStyle.tableCol}>
              <Text style={printPageStyle.tableCell}></Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );

  const handleDownloadPDF = () => {
    const fileName = prompt(
      "Please enter the file name",
      getFileName(orderTitle)
    );
    if (fileName) {
      setDownloadFileName(fileName);
      setTimeout(() => {
        const downloadLink = document.getElementById("pdf-download-link");
        downloadLink.click();
      }, 200);
    }
  };

  return (
    <>
      <div className="printable-page">
        <Flex justify="flex-start" style={{ textAlign: "left" }} gap={10}>
          <ReactToPrint
            trigger={() => (
              <Button type="primary" icon={<PrinterOutlined />}>
                Print
              </Button>
            )}
            content={() => ComponentRef.current}
            pageStyle={pageStyle}
          />

          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownloadPDF}
          >
            Download PDF
          </Button>

          <Button
            icon={<FileExcelFilled />}
            type="primary"
            onClick={excelDownloadHandler}
          >
            Download Excel
          </Button>
        </Flex>
        {/* <div style={{ marginLeft: "auto", width: "100%", marginTop: "15px" }}>
                </div> */}

        <div className="printable-main-div" ref={ComponentRef}>
          <div className="page_title">{orderTitle}</div>

          <div className="company-info">
            <div>
              Company Name: <strong>{company?.company_name}</strong>
            </div>
            <div className="company-contact">
              Company Contact: <strong>{company?.company_contact}</strong>
            </div>
            <div className="gst-number">
              GST No.: <strong>{company?.gst_no}</strong>
            </div>
          </div>

          <div className="printable-table-div">
            <table className="printable_table">
              <thead>
                <tr>
                  {tableHead?.map((element, index) => (
                    <th key={index}>{element}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: "16px",
                    }}
                    colSpan={8}
                  >
                    {orderData?.unverifiedEntries &&
                    orderData?.unverifiedEntries?.length
                      ? "Unverified Entries"
                      : "No unverified entry available"}
                  </td>
                </tr>
                {orderData?.unverifiedEntries &&
                orderData?.unverifiedEntries?.length
                  ? orderData?.unverifiedEntries?.map((row, index) => {
                      return (
                        <tr
                          key={index + "_unverified"}
                          className={row?.is_withdraw ? "red" : "green"}
                          style={{
                            backgroundColor: row?.is_withdraw
                              ? "#ffe9e9"
                              : "#eff5e9",
                          }}
                        >
                          <td>{dayjs(row?.createdAt).format("DD-MM-YYYY")}</td>
                          <td>{dayjs(row?.createdAt).format("HH:mm:ss")}</td>
                          {/* <td>{row?.cheque_no}</td> */}
                          <td>
                            {capitalizeFirstCharacter(row?.particular_type)
                              .split("_")
                              .join(" ")}
                          </td>
                          <td>
                            <Typography
                              style={{ color: "red", fontWeight: "600" }}
                            >
                              {row?.is_withdraw
                                ? row?.amount?.toFixed(2)
                                : (0).toFixed(2)}
                            </Typography>
                          </td>
                          <td>
                            <Typography
                              style={{ color: "green", fontWeight: "600" }}
                            >
                              {!row?.is_withdraw
                                ? row?.amount?.toFixed(2)
                                : (0).toFixed(2)}
                            </Typography>
                          </td>
                          <td>{row?.balance}</td>
                          <td width={250}>{row.remarks}</td>
                        </tr>
                      );
                    })
                  : null}

                <tr>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: "16px",
                    }}
                    colSpan={8}
                  >
                    {orderData?.verifiedEntries &&
                    orderData?.verifiedEntries?.length
                      ? "Verified Entries"
                      : "No verified entry available"}
                  </td>
                </tr>

                {orderData?.verifiedEntries &&
                orderData?.verifiedEntries?.length
                  ? orderData?.verifiedEntries?.map((row, index) => {
                      return (
                        <tr
                          key={index + "_verified"}
                          className={row?.is_withdraw ? "red" : "green"}
                          style={{
                            backgroundColor: row?.is_withdraw
                              ? "#ffe9e9"
                              : "#eff5e9",
                          }}
                        >
                          <td>{dayjs(row?.createdAt).format("DD-MM-YYYY")}</td>
                          <td>{dayjs(row?.createdAt).format("HH:mm:ss")}</td>
                          {/* <td>{row?.cheque_no}</td> */}
                          <td>
                            {capitalizeFirstCharacter(row?.particular_type)
                              .split("_")
                              .join(" ")}
                          </td>
                          <td>
                            <Typography
                              style={{ color: "red", fontWeight: "600" }}
                            >
                              {row?.is_withdraw
                                ? row?.amount?.toFixed(2)
                                : (0).toFixed(2)}
                            </Typography>
                          </td>
                          <td>
                            <Typography
                              style={{ color: "green", fontWeight: "600" }}
                            >
                              {!row?.is_withdraw
                                ? row?.amount?.toFixed(2)
                                : (0).toFixed(2)}
                            </Typography>
                          </td>
                          <td>{row?.balance}</td>
                          <td>{row.remarks}</td>
                        </tr>
                      );
                    })
                  : null}

                <tr>
                  <td>
                    <Typography style={{ fontWeight: "700" }}>Total</Typography>
                  </td>
                  <td></td>
                  <td></td>
                  <td>
                    <Typography style={{ fontWeight: "700" }}>
                      {orderData?.totalAmount || 0}
                    </Typography>
                  </td>
                  <td>
                    <Typography style={{ fontWeight: "700" }}>
                      {orderData?.totalDeposit || 0}
                    </Typography>
                  </td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td>
                    <Typography style={{ fontWeight: "700" }}>
                      Closing Balance
                    </Typography>
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td>
                    <Typography style={{ fontWeight: "700" }}>
                      {orderData?.closingBalance || 0}
                    </Typography>
                  </td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Download pdf code here. */}
      <PDFDownloadLink
        // PDFDownloadLink
        document={<MyDocument />}
        fileName={downloadFileName}
        id="pdf-download-link"
        style={{ display: "none" }}
      >
        {({ loading }) => (loading ? "Loading document..." : "Download PDF")}
      </PDFDownloadLink>
    </>
  );
};

export default PrintCashBookStatement;
