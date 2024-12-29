import { Button, Flex } from "antd";
import { useRef } from "react";
import { useState, useEffect } from "react";
import { PrinterOutlined } from "@ant-design/icons";
import ReactToPrint from "react-to-print";
// import { GlobalContext } from "../../../contexts/GlobalContext";
// import { useContext } from "react";
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
import { useParams } from "react-router-dom";

function getFileName(input) {
  const formattedString = input?.toLowerCase()?.split(" ").join("-");
  const dateString = dayjs().format("YYYY-MMD-D_HH:mm:ss");
  return `${formattedString}-${dateString}`;
}

const GstrPrint = () => {
  const { key } = useParams();

  console.log("Key information ====================", key);
  

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
      // fontFamily: "Roboto",
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

  const [title, setTitle] = useState(null);
  const [tableHead1, setTableHead1] = useState([]);
  const [tableBody1, setTableBody1] = useState([]);
  const [tableHead2, setTableHead2] = useState([]);
  const [tableBody2, setTableBody2] = useState([]);

  const [reportData, setReportData] = useState({});
  const [selectedCompany, setSelectedCompany] = useState({});
  const [downloadFileName, setDownloadFileName] = useState("");

  // const { company } = useContext(GlobalContext);

  const excelDownloadHandler = () => {
    const fileName = prompt("Please enter the file name", title);
    if (fileName) {
      let data = [];
      if (key === "1") {
        data = [tableHead1, ...tableBody1];
      } else if (key === "2") {
        data = [tableHead2, ...tableBody2];
      } else if (key === "3") {
        data = [tableHead1, ...tableBody1, [""], tableHead2, ...tableBody2];
      }
      let worksheet = XLSX.utils.aoa_to_sheet(data);
      let workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, fileName);
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
    }
  };

  useEffect(() => {
    const reportData = JSON.parse(localStorage.getItem("gstr-report-data"));
    const companyData = JSON.parse(
      localStorage.getItem("gstr-report-data-company")
    );
    const printTitle = localStorage.getItem("print-title");

    setReportData(reportData);
    setSelectedCompany(companyData);
    setTitle(printTitle);

    setTableHead1([
      "ID",
      "Bill No",
      "Bill Date",
      "Company Name",
      "No of GSTIN (1)",
      "Place of Supply",
      "Meter",
      "HSN",
      "Amount",
      "SGST",
      "CGST",
      "IGST",
      "Net Amount",
      "Type",
      "Status",
    ]);

    setTableBody1(() => {
      return reportData?.b2b_invoice?.map((item, index) => {
        return [
          index + 1,
          item?.invoice_no,
          dayjs(item?.bill_date).format("DD-MM-YYYY"),
          selectedCompany?.company_name,
          selectedCompany?.gst_no,
          "Place of supply",
          item?.total_meter || 0,
          "HSN",
          item?.amount,
          item?.SGST_amount,
          item?.CGST_amount,
          item?.IGST_amount,
          item?.net_amount,
          "Type",
          "Status",
        ];
      });
    });

    setTableHead2([
      "ID",
      "Debit/Credit",
      "Type",
      "Date",
      "Company Name",
      "Supplier/Party Company",
      "No of GSTIN (2)",
      "Place of Supply",
      "Amount",
      "SGST",
      "CGST",
      "IGST",
      "Net Amount",
    ]);

    setTableBody2(() => {
      return reportData?.credit_debit_note?.map((item, index) => {
        return [
          index + 1,
          item?.debit_note_number || item?.credit_note_number,
          item?.debit_note_type || item?.credit_note_type,
          dayjs(item?.createdAt).format("DD-MM-YYYY"),
          selectedCompany?.company_name,
          "",
          selectedCompany?.gst_no,
          "",
          item?.amount,
          item?.SGST_amount,
          item?.CGST_amount,
          item?.IGST_amount,
          item?.net_amount,
        ];
      });
    });
  }, [selectedCompany?.company_name, selectedCompany?.gst_no]);

  const RenderTableList = () => {
    return (
      <div className="printable-table-div">
        {/* Table of B2B */}
        {key === "1" || key === "3" ? (
          <table className="printable_table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Bill No.</th>
                <th>Bill Date</th>
                <th>Company Name</th>
                <th>No of GSTIN (1)</th>
                <th>Place of Supply</th>
                <th>Meter</th>
                <th>HSN</th>
                <th>Amount</th>
                <th>SGST</th>
                <th>CGST</th>
                <th>IGST</th>
                <th>Net Amount</th>
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reportData?.b2b_invoice?.map((item, index) => {
                return (
                  <tr key={index + "_" + key}>
                    <td>{index + 1}</td>
                    <td>{item?.invoice_no}</td>
                    <td>{dayjs(item?.bill_date).format("DD-MM-YYYY")}</td>
                    <td>{selectedCompany?.company_name}</td>
                    <td>{selectedCompany?.gst_no}</td>
                    <td>Place of supply</td>
                    <td>{item?.total_meter || 0}</td>
                    <td>HSN</td>
                    <td>{item?.amount}</td>
                    <td>{item?.SGST_amount}</td>
                    <td>{item?.CGST_amount}</td>
                    <td>{item?.IGST_amount}</td>
                    <td>{item?.net_amount}</td>
                    <td>Type</td>
                    <td>Status</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : null}

        {key === "3" ? <br /> : null}

        {/* Table of Debit Credit */}
        {key === "2" || key === "3" ? (
          <table className="printable_table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Debit/Credit</th>
                <th>Type</th>
                <th>Date</th>
                <th>Company Name</th>
                <th>Supplier/Party Company</th>
                <th>No of GSTIN (2)</th>
                <th>Place of Supply</th>
                <th>Amount</th>
                <th>SGST</th>
                <th>CGST</th>
                <th>IGST</th>
                <th>Net Amount</th>
              </tr>
            </thead>
            <tbody>
              {reportData?.credit_debit_note?.map((item, index) => {
                return (
                  <tr key={index + "_" + key}>
                    <td>{index + 1}</td>
                    <td>
                      {item?.debit_note_number || item?.credit_note_number}
                    </td>
                    <td>{item?.debit_note_type || item?.credit_note_type}</td>
                    <td>{dayjs(item?.createdAt).format("DD-MM-YYYY")}</td>
                    <td>{selectedCompany?.company_name}</td>
                    <td>{""}</td>
                    <td>{selectedCompany?.gst_no}</td>
                    <td>{""}</td>
                    <td>{item?.amount}</td>
                    <td>{item?.SGST_amount}</td>
                    <td>{item?.CGST_amount}</td>
                    <td>{item?.IGST_amount}</td>
                    <td>{item?.net_amount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : null}
      </div>
    );
  };

  const MyDocument = () => {
    return (
      <Document>
        <Page size="A3" style={printPageStyle.page}>
          <View style={[printPageStyle.section]}>
            <Text style={[printPageStyle.title]}>{title}</Text>
          </View>
          {/* <View style={[printPageStyle.companyInfo]}>
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
          </View> */}

          {/* TABLE 1 DATA */}
          {key === "1" || key === "3" ? (
            <View style={printPageStyle.table}>
              <View style={printPageStyle.tableRow}>
                {tableHead1.map((element, index) => (
                  <View
                    key={index + "_header"}
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

              {tableBody1?.map((order, index) => (
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
              {/* {totalVisible && (
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
          )} */}
            </View>
          ) : null}

          {key === "3" ? <br /> : null}

          {/* TABLE 2 DATA */}
          {key === "2" || key === "3" ? (
            <View style={printPageStyle.table}>
              <View style={printPageStyle.tableRow}>
                {tableHead2.map((element, index) => (
                  <View
                    key={index + "_header"}
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

              {tableBody2?.map((order, index) => (
                <View key={index + "_data"} style={printPageStyle.tableRow}>
                  {order?.map((element, elementIndex) => (
                    <View key={elementIndex} style={printPageStyle.tableCol}>
                      <Text style={printPageStyle.tableCell}>{element}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ) : null}
        </Page>
      </Document>
    );
  };

  const handleDownloadPDF = () => {
    const fileName = prompt("Please enter the file name", getFileName(title));
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

        <div className="printable-main-div" ref={ComponentRef}>
          <RenderTableList />
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

export default GstrPrint;
