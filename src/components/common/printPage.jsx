import { Button, Flex } from "antd";
import { useRef } from "react";
import { useState, useEffect } from "react";
import { PrinterOutlined } from "@ant-design/icons";
import ReactToPrint from "react-to-print";
import { GlobalContext } from "../../contexts/GlobalContext";
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
import "./printPage.css";
import * as XLSX from "xlsx";
import dayjs from "dayjs";

function getFileName(input) {
  const formattedString = input?.toLowerCase()?.split(" ").join("-");

  // // Get the current date and time
  // const currentDate = new Date();
  // const day = String(currentDate.getDate()).padStart(2, "0"); // Get day and pad with 0 if necessary
  // const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are 0-based, so add 1 and pad with 0
  // const year = currentDate.getFullYear(); // Get full year

  // const hours = String(currentDate.getHours()).padStart(2, "0"); // Get hours and pad with 0 if necessary
  // const minutes = String(currentDate.getMinutes()).padStart(2, "0"); // Get minutes and pad with 0 if necessary
  // const seconds = String(currentDate.getSeconds()).padStart(2, "0"); // Get seconds and pad with 0 if necessary

  // // Format the date as DD-MM-YYYY and time as HH-MM-SS
  // const formattedDate = `${day}-${month}-${year}`;
  // const formattedTime = `${hours}-${minutes}-${seconds}`;

  const dateString = dayjs().format("YYYY-MMD-D_HH:mm:ss");

  // return `${formattedString}-${formattedDate}-${formattedTime}`;
  return `${formattedString}-${dateString}`;
}

const PrintPage = () => {
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

  // const printPageStyle = StyleSheet.create({
  //     page: {
  //       flexDirection: 'row',
  //       backgroundColor: '#E4E4E4',
  //     },
  //     section: {
  //       margin: 10,
  //       padding: 10,
  //       flexGrow: 1,
  //     },
  // });

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
  const [orderTitle, setOrderTitle] = useState(null);
  const [tableHead, setTableHead] = useState(null);
  const [totalVisible, setTotalVisible] = useState(false);
  const [totalCount, setTotalCount] = useState(null);
  const [downloadFileName, setDownloadFileName] = useState("");

  const { company /*companyId, financialYearEnd*/ } = useContext(GlobalContext);

  const excelDownloadHandler = () => {
    const fileName = prompt(
      "Please enter the file name",
      getFileName(orderTitle)
    );

    if (fileName) {
      let data = [];
      if (totalVisible) {
        data = [tableHead, ...orderData, totalCount];
      } else {
        data = [tableHead, ...orderData];
      }
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
    let page_title = localStorage.getItem("print-title");
    console.log("Page title information");
    console.log(page_title);
    
    setOrderTitle(page_title);

    let page_data = JSON.parse(localStorage.getItem("print-array"));
    setOrderData([...page_data]);

    let page_head = JSON.parse(localStorage.getItem("print-head"));
    setTableHead(page_head);

    let total_visible = localStorage.getItem("total-count");
    if (total_visible == "1") {
      setTotalVisible(true);
    } else {
      setTotalVisible(false);
    }

    let total_data = JSON.parse(localStorage.getItem("total-data"));
    setTotalCount(total_data);
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

          {orderData?.map((order, index) => (
            <View key={index + "_data"} style={printPageStyle.tableRow}>
              {order?.map((element, elementIndex) => (
                <View key={elementIndex} style={printPageStyle.tableCol}>
                  <Text style={printPageStyle.tableCell}>{element}</Text>
                </View>
              ))}
            </View>
          ))}

          {/* {totalVisible &&
            totalCount?.map((element, index) => (
              <View key={index + "_total"} style={printPageStyle.tableRow}>
                <View style={printPageStyle.tableHeaderCol}>
                  <Text
                    style={[printPageStyle.tableCell, { color: "#FFFFFF" }]}
                  >
                    {element}
                  </Text>
                </View>
              </View>
            ))} */}
          {totalVisible && (
            <View style={printPageStyle.tableRow}>
              {totalCount?.map((element, index) => (
                <View
                  key={index + "_total"}
                  style={printPageStyle.tableHeaderCol}
                >
                  <Text
                    style={[printPageStyle.tableCell, { color: "#FFFFFF" }]}
                  >
                    {element}
                  </Text>
                </View>
              ))}
            </View>
          )}
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
                {orderData.map((order, index) => (
                  <tr key={index}>
                    {order?.map((element, elementIndex) => (
                      <td key={elementIndex}>{element}</td>
                    ))}
                  </tr>
                ))}

                <tr>
                  {totalVisible &&
                    totalCount?.map((element, index) => (
                      <td key={index} className="total-information-td">
                        {element}
                      </td>
                    ))}
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

export default PrintPage;
