import { Button, Flex, Table } from "antd";
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
import { BEAM_RECEIVE_TAG_COLOR, JOB_TAG_COLOR, PURCHASE_TAG_COLOR, SALE_TAG_COLOR, YARN_SALE_BILL_TAG_COLOR } from "../../../constants/tag";

function getFileName(input) {
  const formattedString = input?.toLowerCase()?.split(" ").join("-");
  const dateString = dayjs().format("YYYY-MMD-D_HH:mm:ss");
  return `${formattedString}-${dateString}`;
}

const GstrPrint2 = () => {
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

  // B2B invoice related table columns =================================
  const B2BInvoiceColumn = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      className : "gstr-index-column", 
      render: (text, record, index) => {
        return(
          <div style={{
            fontWeight: 600
          }}>{index + 1}</div>
        )
      }
    },
    {
      title: "Bill No.",
      dataIndex: "invoice_no",
      key: "invoice_no",
      render: (text, record) => {
        return(
          <div>
            {text || record?.invoice_number}
          </div>
        )
      }
    },
    {
      title: "Bill Date",
      dataIndex: "bill_date",
      key: "bill_date",
      render: (text) => dayjs(text).format("DD-MM-YYYY"),
    },
    {
      title: "Company Name",
      dataIndex: "company_name",
      key: "company_name",
      render: (text, record) => {
        return(
          <div>{selectedCompany?.company_name}</div>
        )
      }
    },
    {
      title: "Party Company",
      dataIndex: "gst_no",
      key: "gst_no",
      render: (text, record) => {
        return(
          <div>
            Party company
          </div>
        )
      }
    },
    {
      title: "GST No", 
      dataIndex: "gst_no"
    },
    // {
    //   title: "Place of Supply",
    //   dataIndex: "place_of_supply",
    //   key: "place_of_supply",
    // },
    // {
    //   title: "Meter/KG",
    //   dataIndex: "total_meter",
    //   key: "total_meter",
    //   render: (text, record) => {
    //     if (record?.model == "yarn_sale_bills"){
    //       return(
    //         <div>
    //           {record?.yarn_sale?.kg}
    //         </div>
    //       )
    //     } else if (record?.model == "job_work_bills"){
    //       return(
    //         <div>
    //           {record?.job_work?.kg}
    //         </div>
    //       )
    //     } else if (record?.model == "beam_sale_bill"){
    //       return(
    //         <div>
    //           {record?.beam_sale?.total_meter}
    //         </div>
    //       )
    //     }else {
    //       return(
    //         <div>
    //           {record?.total_meter || "Keyur"}
    //         </div>
    //       )
    //     }
    //   }
    // },
    // {
    //   title: "HSN",
    //   dataIndex: "hsn",
    //   key: "hsn",
    //   render: (text, record) => {
    //     let bill_model = record?.model ; 
    //     if (bill_model == "yarn_sale_bills"){
    //       return(
    //         <div>
    //           {record?.yarn_sale?.yarn_stock_company?.hsn_no}
    //         </div>
    //       )
    //     } else if (["sale_bills", "job_gray_sale_bill"]?.includes(bill_model)){
    //       return(
    //         <div>
    //           {record?.inhouse_quality?.vat_hsn_no}
    //         </div>
    //       )
    //     } else if (bill_model == "job_work_bills"){
    //       return(
    //         <div>
    //           {record?.job_work?.yarn_stock_company?.hsn_no}
    //         </div>
    //       )
    //     } else {

    //     }
    //   }
    // },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (text, record) => {
        if (record?.model == "yarn_bills"){
          return(
            <div>
              {record?.discount_brokerage_amount}
            </div>
          ) 
        } else {
          return(
            <div>
              {text}
            </div>
          )
        }
      }
    },
    {
      title: "SGST",
      dataIndex: "SGST_amount",
      key: "SGST_amount",
    },
    {
      title: "CGST",
      dataIndex: "CGST_amount",
      key: "CGST_amount",
    },
    {
      title: "IGST",
      dataIndex: "IGST_amount",
      key: "IGST_amount",
    },
    {
      title: "Net Amount",
      dataIndex: "net_amount",
      key: "net_amount",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (text, record) => {
        let model = undefined ;
        let bill_model = record?.model ;  
        if (record?.model == "purchase_taka_bills"){
          model = "Purchase Taka"
        } else if (record?.model == "receive_size_beam_bill"){
          model = "Size Beam Receive" ; 
        } else if (record?.model == "yarn_bills") {
          model = "Yarn Bill"
        } else if (record?.model == "job_taka_bills"){
          model = "Job Taka"
        } else {
          model = "Rework Taka"
        }
        return(
          <div style={{
            color : bill_model == "purchase_taka_bills"?PURCHASE_TAG_COLOR:
              bill_model == "receive_size_beam_bill"?BEAM_RECEIVE_TAG_COLOR:
              bill_model == "yarn_bills"?YARN_SALE_BILL_TAG_COLOR:
              bill_model == "job_taka_bills"?JOB_TAG_COLOR: "gray",
            fontWeight: 600
          }}>
            {model}
          </div>
        )
      }
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text, record) => {
        let is_paid = record?.is_paid ;
        return(
          <div style = {{
            color: is_paid == false?"red":"green", 
            fontWeight: 600 
          }}>
            {is_paid == false?"Unpaid":"Paid"}
          </div>
        ) 
      }
    },
  ];

  // NoTax invoice related table columns ================================
  const NoTaxInvoiceColumn = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      className : "gstr-index-column", 
      render: (text, record, index) => {
        return(
          <div style={{
            fontWeight: 600
          }}>{index + 1}</div>
        )
      }
    },
    {
      title: "Bill No.",
      dataIndex: "invoice_no",
      key: "invoice_no",
      render: (text, record) => {
        return(
          <div style={{
            color: "red", 
            fontWeight: 600
          }}>
            {text}
          </div>
        )
      }
    },
    {
      title: "Bill Date",
      dataIndex: "bill_date",
      key: "bill_date",
      render: (text) => dayjs(text).format("DD-MM-YYYY"),
    },
    {
      title: "Company Name",
      dataIndex: "company_name",
      key: "company_name",
      render: (text, record) => {
        return(
          <div>{selectedCompany?.company_name}</div>
        )
      }
    },
    {
      title: "Party Company",
      dataIndex: "gst_no",
      key: "gst_no",
      render: (text, record) => {
        return(
          <div>
            Party company
          </div>
        )
      }
    },
    {
      title: "GST No", 
      dataIndex: "gst_no"
    },
    {
      title: "Place of Supply",
      dataIndex: "place_of_supply",
      key: "place_of_supply",
    },
    {
      title: "Meter/KG",
      dataIndex: "total_meter",
      key: "total_meter",
      render: (text, record) => {
        if (record?.model == "yarn_sale_bills"){
          return(
            <div>
              {record?.yarn_sale?.kg}
            </div>
          )
        } else if (record?.model == "job_work_bills"){
          return(
            <div>
              {record?.job_work?.kg}
            </div>
          )
        } else if (record?.model == "beam_sale_bill"){
          return(
            <div>
              {record?.beam_sale?.total_meter}
            </div>
          )
        }else {
          return(
            <div>
              {record?.total_meter || "Keyur"}
            </div>
          )
        }
      }
    },
    {
      title: "HSN",
      dataIndex: "hsn",
      key: "hsn",
      render: (text, record) => {
        let bill_model = record?.model ; 
        if (bill_model == "yarn_sale_bills"){
          return(
            <div>
              {record?.yarn_sale?.yarn_stock_company?.hsn_no}
            </div>
          )
        } else if (["sale_bills", "job_gray_sale_bill"]?.includes(bill_model)){
          return(
            <div>
              {record?.inhouse_quality?.vat_hsn_no}
            </div>
          )
        } else if (bill_model == "job_work_bills"){
          return(
            <div>
              {record?.job_work?.yarn_stock_company?.hsn_no}
            </div>
          )
        } else {

        }
      }
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "SGST",
      dataIndex: "SGST_amount",
      key: "SGST_amount",
    },
    {
      title: "CGST",
      dataIndex: "CGST_amount",
      key: "CGST_amount",
    },
    {
      title: "IGST",
      dataIndex: "IGST_amount",
      key: "IGST_amount",
    },
    {
      title: "Net Amount",
      dataIndex: "net_amount",
      key: "net_amount",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (text, record) => {
        let model = undefined ;
        let bill_model = record?.model ;  
        return(
          <div style={{
            color : bill_model == "sale_bills"?SALE_TAG_COLOR:
              bill_model == "yarn_sale_bills"?YARN_SALE_BILL_TAG_COLOR:
              bill_model == "job_gray_sale_bill"?SALE_TAG_COLOR:
              bill_model == "beam_sale_bill"?BEAM_RECEIVE_TAG_COLOR: "gray",
            fontWeight: 600
          }}>
            {model}
          </div>
        )
      }
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text, record) => {
        let is_paid = record?.is_paid ;
        return(
          <div style = {{
            color: is_paid == false?"red":"green", 
            fontWeight: 600 
          }}>
            {is_paid == false?"Unpaid":"Paid"}
          </div>
        ) 
      }
    },
  ];

  // Credit note / Debit note related table columns =====================
  const DebiteNoteCreditNoteColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      className: "gstr-index-column", 
      render: (text, record, index) => {
        return(
          <div style={{
            fontWeight: 600
          }}>
            {index + 1}
          </div>
        )
      }
    },
    {
      title: "Debit/Credit",
      dataIndex: "debit_credit",
      key: "debit_credit",
      render: (text, record) => {
        return(
          <div>
            {record?.debit_note_number || record?.credit_note_number}
          </div>
        )
      }
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (text, record) => {
        let model = record?.model ;
        let type = record?.debit_note_type || record?.credit_note_type ; 
        let type_value = undefined ;

        if (type == "other"){
          type_value = "Other" ; 
        } else if (type == "claim_note"){
          type_value = "Claim Note" ; 
        } else if (type == "discount_note"){
          type_value = "Discount Note" ; 
        } else if (type == "purchase_return"){
          type_value = "Purchase Return" ; 
        } else if (type == "yarn_return"){
          type_value = "Yarn Return" ; 
        } else if (type == "beam_sale_return"){
          type_value = "Beam Sale Return" ;
        } else if (type == "late"){
          type_value = "Late Payment"
        }
        return(
          <div style={{
            color: model == "debit_notes"?"red":"blue"
          }}>
            {type_value || type}
          </div>
        )
      }
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "date",
      render: (text) => dayjs(text).format("DD-MM-YYYY"), // Format date if required
    },
    {
      title: "Company Name",
      dataIndex: "company_name",
      key: "company_name",
    },
    {
      title: "Supplier/Party Company",
      dataIndex: "party_company",
      key: "party_company",
    },
    {
      title: "No of GSTIN (2)",
      dataIndex: "gstin_count",
      key: "gstin_count",
    },
    {
      title: "Place of Supply",
      dataIndex: "place_of_supply",
      key: "place_of_supply",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (text, record) => {
        let amount = text
        if (amount == null){

        }
        
        return(
          <div>
            {text}
          </div>
        )
      }
    },
    {
      title: "SGST",
      dataIndex: "SGST_amount",
      key: "SGST_amount",
      render: (text) => {
        return(
          <div>
            {text || "0"}
          </div>
        )
      }
    },
    {
      title: "CGST",
      dataIndex: "CGST_amount",
      key: "CGST_amount",
      render: (text, record) => {
        return(
          <div>
            {text || 0}
          </div>
        )
      }
    },
    {
      title: "IGST",
      dataIndex: "IGST_amount",
      key: "IGST_amount",
      render: (text, record) => {
        return(
          <div>
            {text || 0}
          </div>
        )
      }
    },
    {
      title: "Net Amount",
      dataIndex: "net_amount",
      key: "net_amount",
    },
  ];
  
  
  const RenderTableList = () => {
    return (
      <div className="printable-table-div">
        {/* Table of B2B */}
        {key === "1" || key === "3" ? (
          <>
            <div style={{
              fontWeight: 600, 
              fontSize: 20, 
              marginBottom: 10
            }}>
              B2B Invoices
            </div>

            {/* ============== B2B invoice information table =============  */}
            <Table
              columns={B2BInvoiceColumn}
              dataSource={reportData?.b2b_invoice}
              pagination={false}
            />

            {/* <div style={{
              fontWeight: 600,
              color: "red", 
              marginTop: 20
            }}>
              ◈ Zero tax rate invoice are found and removed in this report is are as follow: 
            </div>

            <Table
              style={{
                marginTop: 15
              }}
              columns={NoTaxInvoiceColumn}
              dataSource={reportData?.skip_b2b_bills}
              pagination={false}
            /> */}


          </>
        ) : null}

        {key === "3" ? <br /> : null}

        {/* Table of Debit Credit */}
        {key === "2" ? (
          <>
            <div style={{
              fontWeight: 600, 
              fontSize: 20, 
              marginBottom: 10
            }}>
              Credit/Debit Note
            </div>
            <Table
              columns={DebiteNoteCreditNoteColumns}
              dataSource={reportData?.credit_debit_note}
              pagination = {false}
            />
          </>
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

export default GstrPrint2;
