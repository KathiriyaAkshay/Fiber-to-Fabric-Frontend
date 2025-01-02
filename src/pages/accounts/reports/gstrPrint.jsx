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
  render,
} from "@react-pdf/renderer";
import { DownloadOutlined } from "@ant-design/icons";
import { FileExcelFilled } from "@ant-design/icons";
import "../../../components/common/printPage.css";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import { BEAM_RECEIVE_TAG_COLOR, SALE_TAG_COLOR, YARN_SALE_BILL_TAG_COLOR } from "../../../constants/tag";

function getFileName(input) {
  const formattedString = input?.toLowerCase()?.split(" ").join("-");
  const dateString = dayjs().format("YYYY-MMD-D_HH:mm:ss");
  return `${formattedString}-${dateString}`;
}

const GstrPrint = () => {
  const { key } = useParams();

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
        let bill_model = record?.model ; 
        
        if (bill_model == "yarn_sale_bills"){
          return(
            <div>
              {record?.yarn_sale?.supplier?.supplier_company}
            </div>
          )
        } else if (["sale_bills", "job_gray_sale_bill"]?.includes(bill_model)){
          return(
            <div>
              {record?.party?.company_name}
            </div>
          ) 
        } else if (bill_model == "beam_sale_bill"){
          return(
            <div>
              {record?.beam_sale?.supplier?.supplier_company}
            </div>
          )
        } else {
          return(
            <div>
              {record?.job_work?.supplier?.supplier_company}
            </div>
          )
        }
      }
    },
    {
      title: "GST No", 
      dataIndex: "gst_no", 
      render: (text, record) => {
        let bill_model = record?.model ; 
        
        if (bill_model == "yarn_sale_bills"){
          return(
            <div>
              {record?.yarn_sale?.supplier?.user?.gst_no}
            </div>
          )
        } else if (["sale_bills", "job_gray_sale_bill"]?.includes(bill_model)){
          return(
            <div>
              {record?.party?.company_gst_number}
            </div>
          ) 
        } else if (bill_model == "beam_sale_bill"){
          return(
            <div>
              {record?.beam_sale?.supplier?.user?.gst_no}
            </div>
          )
        } else {
          return(
            <div>
              {record?.job_work?.supplier?.user?.gst_no}
            </div>
          )
        }
      }
    },
    {
      title: "Place of Supply",
      dataIndex: "place_of_supply",
      key: "place_of_supply",
      render: (text, record) => {
        let bill_model = record?.model ; 
        
        if (bill_model == "yarn_sale_bills"){
          return(
            <div>
              {record?.yarn_sale?.supplier?.user?.address}
            </div>
          )
        } else if (["sale_bills", "job_gray_sale_bill"]?.includes(bill_model)){
          return(
            <div>
              {record?.party?.delivery_address}
            </div>
          ) 
        } else if (bill_model == "beam_sale_bill"){
          return(
            <div>
              {record?.beam_sale?.supplier?.user?.address}
            </div>
          )
        } else {
          return(
            <div>
              {record?.job_work?.supplier?.user?.address}
            </div>
          )
        }
      }
    },
    {
      title: "Meter/KG",
      dataIndex: "total_meter",
      key: "total_meter",
      render: (text, record) => {
        if (record?.model == "yarn_sale_bills"){
          return(
            <div>
              {record?.yarn_sale?.kg} <span style={{
                fontWeight: 600
              }}>KG</span>
            </div>
          )
        } else if (record?.model == "job_work_bills"){
          return(
            <div>
              {record?.job_work?.kg} <span style={{
                fontWeight: 600
              }}>KG</span>
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
          // Beam sale bill handler 
          let yarn_stock_company = undefined ; 

          record?.beam_sale?.beam_sale_warp_deniers?.map((element) => {
            if (element?.inhouse_waraping_detail?.is_primary){
              yarn_stock_company = element?.inhouse_waraping_detail?.yarn_stock_company ; 
            }
          })

          return(
            <div>
              {yarn_stock_company?.hsn_no || "----"}
            </div>
          )
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
        if (record?.model == "yarn_sale_bills"){
          model = "Yarn sale"
        } else if (record?.model == "beam_sale_bill"){
          model = "Beam sale" ; 
        } else if (record?.model == "sale_bills") {
          model = "Grey Job Sale"
        } else if (record?.model == "job_gray_sale_bill"){
          model = "Inhouse"
        } else {
          model = "Job Work"
        }
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
        let bill_model = record?.model ; 
        
        if (bill_model == "yarn_sale_bills"){
          return(
            <div>
              {record?.yarn_sale?.supplier?.supplier_company}
            </div>
          )
        } else if (["sale_bills", "job_gray_sale_bill"]?.includes(bill_model)){
          return(
            <div>
              {record?.party?.company_name}
            </div>
          ) 
        } else if (bill_model == "beam_sale_bill"){
          return(
            <div>
              {record?.beam_sale?.supplier?.supplier_company}
            </div>
          )
        } else {
          return(
            <div>
              {record?.job_work?.supplier?.supplier_company}
            </div>
          )
        } 
      }
    },
    {
      title: "GST No", 
      dataIndex: "gst_no", 
      render: (text, record) => {
        let bill_model = record?.model ; 
        
        if (bill_model == "yarn_sale_bills"){
          return(
            <div>
              {record?.yarn_sale?.supplier?.user?.gst_no}
            </div>
          )
        } else if (["sale_bills", "job_gray_sale_bill"]?.includes(bill_model)){
          return(
            <div>
              {record?.party?.company_gst_number}
            </div>
          ) 
        } else if (bill_model == "beam_sale_bill"){
          return(
            <div>
              {record?.beam_sale?.supplier?.user?.gst_no}
            </div>
          )
        } else {
          return(
            <div>
              {record?.job_work?.supplier?.user?.gst_no}
            </div>
          )
        }
      }
    },
    {
      title: "Place of Supply",
      dataIndex: "place_of_supply",
      key: "place_of_supply",
      render: (text, record) => {
        let bill_model = record?.model ; 
        
        if (bill_model == "yarn_sale_bills"){
          return(
            <div>
              {record?.yarn_sale?.supplier?.user?.address}
            </div>
          )
        } else if (["sale_bills", "job_gray_sale_bill"]?.includes(bill_model)){
          return(
            <div>
              {record?.party?.delivery_address}
            </div>
          ) 
        } else if (bill_model == "beam_sale_bill"){
          return(
            <div>
              {record?.beam_sale?.supplier?.user?.address}
            </div>
          )
        } else {
          return(
            <div>
              {record?.job_work?.supplier?.user?.address}
            </div>
          )
        }
      }
    },
    {
      title: "Meter/KG",
      dataIndex: "total_meter",
      key: "total_meter",
      render: (text, record) => {
        if (record?.model == "yarn_sale_bills"){
          return(
            <div>
              {record?.yarn_sale?.kg} <span style={{
                fontWeight: 600
              }}>KG</span>
            </div>
          )
        } else if (record?.model == "job_work_bills"){
          return(
            <div>
              {record?.job_work?.kg} <span style={{
                fontWeight: 600
              }}>KG</span>
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
          // Beam sale bill handler 
          let yarn_stock_company = undefined ; 

          record?.beam_sale?.beam_sale_warp_deniers?.map((element) => {
            if (element?.inhouse_waraping_detail?.is_primary){
              yarn_stock_company = element?.inhouse_waraping_detail?.yarn_stock_company ; 
            }
          })

          return(
            <div>
              {yarn_stock_company?.hsn_no || "----"}
            </div>
          )
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
        if (record?.model == "yarn_sale_bills"){
          model = "Yarn sale"
        } else if (record?.model == "beam_sale_bill"){
          model = "Beam sale" ; 
        } else if (record?.model == "sale_bills") {
          model = "Grey Job Sale"
        } else if (record?.model == "job_gray_sale_bill"){
          model = "Inhouse"
        } else {
          model = "Job Work"
        }
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
        } else if (type == "claim"){
          type_value = "Claim Note" ; 
        } else if (type == "discount"){
          type_value = "Discount Note" ; 
        } else if (type == "sale_return"){
          type_value = "Sale Return" ; 
        } else if (type == "yarn_sale_return"){
          type_value = "Yarn Sale Return" ; 
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
      render: (text, record) => {
        return(
          <div>{selectedCompany?.company_name}</div>
        )
      }
    },
    {
      title: "Supplier/Party Company",
      dataIndex: "party_company",
      key: "party_company",
      render: (text, record) => {
        if (record?.party !== null){
          return(
            <div>{record?.party?.company_name}</div>
          )
        } else {
          return(
            <div>
              {record?.supplier?.supplier_company || "-"}
            </div>
          )
        }

      }
    },
    {
      title: "No of GSTIN (2)",
      dataIndex: "gstin_count",
      key: "gstin_count",
      render: (text, record) => {
        if (record?.party !== null){
          return(
            <div>
              {record?.party?.user?.gst_no}
            </div>
          )
        } else {
          return(
            <div>
              {record?.supplier?.user?.gst_no}
            </div>
          )
        }
      }
    },
    {
      title: "Place of Supply",
      dataIndex: "place_of_supply",
      key: "place_of_supply",
      render: (text, record) => {
        if (record?.party !== null){
          return(
            <div>
              {record?.party?.delivery_address}
            </div>
          )
        } else {
          return(
            <div>
              {record?.supplier?.user?.address}
            </div>
          )
        }
      }
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (text, record) => {
        let amount = text
        if (amount == null){
          let details = record?.credit_note_details || record?.debit_note_details ; 
          let totalAmount = 0 ; 
          details?.map((element) => {
            totalAmount += +element?.amount || 0; 
          })

          return(
            <div>
              {parseFloat(totalAmount).toFixed(2)}
            </div>
          )
          
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

  // HSN Wise Summary related data information ==========================
  const HSNWiseSummaryColumns = [
    {
      title: 'No',
      dataIndex: 'no',
      key: 'no',
      className: "gstr-index-column ", 
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
      title: 'Company Name',
      dataIndex: 'companyName',
      key: 'companyName',
      render: (text, record) => {
        return(
          <div>{selectedCompany?.company_name}</div>
        )
      }
      
    },
    {
      title: 'HSN',
      dataIndex: 'hsn',
      key: 'hsn',
    },
    {
      title: 'Meter/KG',
      dataIndex: 'meter',
      key: 'meter',
      render: (text, record) => {
        if (record?.type == "yarn_sale_bills"){ 
          return(
            <div>
              {record?.kg} 
            </div>
          )
        } else if (record?.type == "job_work_bills"){
          return(
            <div>
              {record?.kg}
            </div>
          )
        } else {
          return(
            <div>
              {record?.meter}
            </div>
          )
        }
      }
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: 'GST Rate',
      dataIndex: 'gstRate',
      key: 'gstRate',
      render: (text, record) => {
        return(
          <div style={{
            fontWeight: 600
          }}>
            {text}
          </div>
        )
      }
    },
    {
      title: 'SGST',
      dataIndex: 'sgst',
      key: 'sgst',
    },
    {
      title: 'CGST',
      dataIndex: 'cgst',
      key: 'cgst',
    },
    {
      title: 'IGST',
      dataIndex: 'igst',
      key: 'igst',
    },
    {
      title: 'Net Amount',
      dataIndex: 'netAmount',
      key: 'netAmount',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (text, record) => {
        let model = undefined ;
        let bill_model = text;  
        if (bill_model == "yarn_sale_bills"){
          model = "Yarn sale"
        } else if (bill_model == "beam_sale_bill"){
          model = "Beam sale" ; 
        } else if (bill_model == "sale_bills") {
          model = "Grey Job Sale"
        } else if (bill_model == "job_gray_sale_bill"){
          model = "Inhouse"
        } else {
          model = "Job Work"
        }
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
  ];
  const [b2bInvoiceHsnSummary, setB2bInvoiceHsnSummary] = useState([]) ; 

  useEffect(() => {
    if (reportData !== undefined && Object.entries(reportData)?.length > 0 ){
      let HSNB2BInvoices = [] ; 

      const groupedData = reportData?.b2b_invoice?.reduce((acc, item) => {
        if (!acc[item.model]) {
          acc[item.model] = {};
        }

        let HSN_number = undefined;  
        let bill_model = item?.model ; 

        if (bill_model == "yarn_sale_bills"){
          HSN_number = item?.yarn_sale?.yarn_stock_company?.hsn_no ; 
        } else if (["sale_bills", "job_gray_sale_bill"]?.includes(bill_model)){
          HSN_number = item?.inhouse_quality?.vat_hsn_no ; 
        } else if (bill_model == "job_work_bills"){
          HSN_number = item?.job_work?.yarn_stock_company?.hsn_no ; 
        } else{
          let yarn_stock_company = undefined ; 
          item?.beam_sale?.beam_sale_warp_deniers?.map((element) => {
            if (element?.inhouse_waraping_detail?.is_primary){
              yarn_stock_company = element?.inhouse_waraping_detail?.yarn_stock_company ; 
            }
          })
          HSN_number = yarn_stock_company?.hsn_no; 
        }
      
        if (!acc[item.model][HSN_number]) {
          acc[item.model][HSN_number] = [];
        }
      
        acc[item.model][HSN_number].push(item);
      
        return acc;
      }, {});

      Object.entries(groupedData).forEach(([key, value]) => {
        
        Object.entries(value).forEach(([hsn_number, bills]) => {
          let GST_Rate_Wise_data = {} ; 

          bills?.map((element) => {
            let GST_Rate = 0 ;
            let total_meter = 0 ; 
            let total_kg = 0 ; 

            if (key == "yarn_sale_bill"){
              total_kg = +element?.yarn_sale?.kg ; 
            } else if (key == "job_work_bills"){
              total_kg += +element?.job_work?.kg ; 
            } else if (key == "beam_sale_bill"){
              total_meter += element?.beam_sale?.total_meter ; 
            } else {
              total_meter += +element?.total_meter ; 
            }
            
            let total_amount = +element?.amount ; 
            let SGST_amount = +element?.SGST_amount ; 
            let CGST_amount = +element?.CGST_amount ;
            let IGST_amount = +element?.ISGT_amount || 0 ;
            
            GST_Rate = ((SGST_amount + CGST_amount + IGST_amount) / total_amount)*100;
            GST_Rate = Math.round(GST_Rate) ; 
            GST_Rate = isNaN(GST_Rate)?0:GST_Rate;  

            let total_net_amount = +element?.net_amount;  

            // Initialize the GST_Rate entry if it doesn't exist
            if (!GST_Rate_Wise_data[GST_Rate]) {
              GST_Rate_Wise_data[GST_Rate] = {
                total_amount: 0,
                total_sgst: 0,
                total_cgst: 0,
                total_igst: 0,
                total_net_amount: 0,
                total_meter: 0,
                total_kg: 0
              };
            }

            // Reference the object for the given GST_Rate
            const total_info = GST_Rate_Wise_data[GST_Rate];

            // Create a mapping of fields to their values
            const fieldValues = {
              total_amount,
              total_cgst: CGST_amount,
              total_sgst: SGST_amount,
              total_igst: IGST_amount,
              total_net_amount,
              total_meter,
              total_kg
            };

            // Update the fields dynamically
            for (const [key, value] of Object.entries(fieldValues)) {
              total_info[key] += +value; // Ensure numeric addition
            }
          })

          Object.entries(GST_Rate_Wise_data).forEach(([gst_rate, value]) => {
            let total_meter = value?.total_meter; 
            let total_kg = value?.total_kg; 
            let total_sgst = value?.total_sgst ; 
            let total_cgst = value?.total_cgst ; 
            let total_igst = value?.total_igst ; 
            let total_net_amount = value?.total_net_amount; 
            let total_amount = value?.total_amount ; 

            HSNB2BInvoices.push({
              hsn: hsn_number, 
              meter: total_meter, 
              kg: total_kg, 
              amount: total_amount, 
              gstRate: gst_rate, 
              sgst: total_sgst, 
              cgst: total_cgst, 
              igst: total_igst, 
              netAmount: total_net_amount, 
              type: key
            })
          }) 
          
        })
      })
      setB2bInvoiceHsnSummary(HSNB2BInvoices) ; 
    }
  }, [reportData])

  
  
  const RenderTableList = () => {
    return (
      <div className="printable-table-div">
        
        {key === "1" ? (
          <>
            <div style={{
              fontWeight: 600, 
              fontSize: 20, 
              marginBottom: 10
            }}>
              B2B Invoices  |
              <span style={{
                marginLeft: 10,
                color: "blue"
              }}>
                {reportData?.b2b_invoice?.length} Bills
              </span>
            </div>

            {/* ============== B2B invoice information table =============  */}
            <Table
              columns={B2BInvoiceColumn}
              dataSource={reportData?.b2b_invoice}
              pagination={false}
              summary={() => {
                let total_meter = 0 ; 
                let total_kg = 0 ;
                let total_amount = 0 ; 
                let total_sgst = 0 ; 
                let total_cgst = 0 ; 
                let total_igst = 0 ; 
                let total_net_amount = 0 ;

                reportData?.b2b_invoice?.map((element) => {
                  let bill_model = element?.model ; 
                  
                  // Count Meter and KG
                  if (bill_model == "yarn_sale_bills"){
                    total_kg += +element?.yarn_sale?.kg ; 
                  } else if (bill_model == "job_work_bills"){
                    total_kg += +element?.job_work?.kg ; 
                  } else if (bill_model == "beam_sale_bill"){
                    total_meter += +element?.beam_sale?.total_meter ; 
                  } else {
                    total_meter += +element?.total_meter || 0 ;
                  }

                  // Count total Amount 
                  total_amount += +element?.amount; 
                  total_sgst += +element?.SGST_amount ; 
                  total_cgst += +element?.CGST_amount ; 
                  total_igst += +element?.IGST_amount ; 
                  total_net_amount += +element?.net_amount ; 
                })

                total_amount = parseFloat(total_amount).toFixed(2); 
                total_sgst = parseFloat(total_sgst).toFixed(2); 
                total_cgst = parseFloat(total_cgst).toFixed(2) ; 
                total_igst = parseFloat(total_igst).toFixed(2) ; 
                total_net_amount = parseFloat(total_net_amount).toFixed(2) ; 
 
                return(
                  <>
                    <Table.Summary.Row key={"total"}>
                      <Table.Summary.Cell>
                        <Text>
                          Total
                        </Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell></Table.Summary.Cell>
                      <Table.Summary.Cell></Table.Summary.Cell>
                      <Table.Summary.Cell></Table.Summary.Cell>
                      <Table.Summary.Cell></Table.Summary.Cell>
                      <Table.Summary.Cell></Table.Summary.Cell>
                      <Table.Summary.Cell></Table.Summary.Cell>
                      <Table.Summary.Cell>
                        {total_meter} M / {total_kg} KG
                      </Table.Summary.Cell>
                      <Table.Summary.Cell></Table.Summary.Cell>
                      <Table.Summary.Cell>
                        {total_amount}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell>
                        {total_sgst}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell>
                        {total_cgst}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell>
                        {total_igst}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell>
                        {total_net_amount}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell></Table.Summary.Cell>
                      <Table.Summary.Cell></Table.Summary.Cell>
                    </Table.Summary.Row>
                  </>
                )
              }}
            />

            <div style={{
              fontWeight: 600,
              color: "red", 
              marginTop: 20
            }}>
              ◈ Zero tax rate invoice are found and removed in this report is are as follow: 
            </div>

            <div style={{
              marginTop: 7,
              fontSize: 15, 
              fontWeight: 600
            }}>
              Total {reportData?.skip_b2b_bills?.length} Bills
            </div>

            <Table
              style={{
                marginTop: 15
              }}
              columns={NoTaxInvoiceColumn}
              dataSource={reportData?.skip_b2b_bills}
              pagination={false}
              summary={() => {

                let total_meter = 0 ; 
                let total_kg = 0 ;
                let total_amount = 0 ; 
                let total_sgst = 0 ; 
                let total_cgst = 0 ; 
                let total_igst = 0 ; 
                let total_net_amount = 0 ;

                reportData?.skip_b2b_bills?.map((element) => {
                  let bill_model = element?.model ; 
                  
                  // Count Meter and KG
                  if (bill_model == "yarn_sale_bills"){
                    total_kg += +element?.yarn_sale?.kg ; 
                  } else if (bill_model == "job_work_bills"){
                    total_kg += +element?.job_work?.kg ; 
                  } else if (bill_model == "beam_sale_bill"){
                    total_meter += +element?.beam_sale?.total_meter ; 
                  } else {
                    total_meter += +element?.total_meter || 0 ;
                  }

                  // Count total Amount 
                  total_amount += +element?.amount; 
                  total_sgst += +element?.SGST_amount ; 
                  total_cgst += +element?.CGST_amount ; 
                  total_igst += +element?.IGST_amount ; 
                  total_net_amount += +element?.net_amount ; 
                })

                total_amount = parseFloat(total_amount).toFixed(2); 
                total_sgst = parseFloat(total_sgst).toFixed(2); 
                total_cgst = parseFloat(total_cgst).toFixed(2) ; 
                total_igst = parseFloat(total_igst).toFixed(2) ; 
                total_net_amount = parseFloat(total_net_amount).toFixed(2) ;
                
                return(
                  <>
                    <Table.Summary.Row key={"total"}>
                      <Table.Summary.Cell>
                        <Text>
                          Total
                        </Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell></Table.Summary.Cell>
                      <Table.Summary.Cell></Table.Summary.Cell>
                      <Table.Summary.Cell></Table.Summary.Cell>
                      <Table.Summary.Cell></Table.Summary.Cell>
                      <Table.Summary.Cell></Table.Summary.Cell>
                      <Table.Summary.Cell></Table.Summary.Cell>
                      <Table.Summary.Cell>
                        {total_meter} M / {total_kg} KG
                      </Table.Summary.Cell>
                      <Table.Summary.Cell></Table.Summary.Cell>
                      <Table.Summary.Cell>
                        {total_amount}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell>
                        {total_sgst}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell>
                        {total_cgst}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell>
                        {total_igst}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell>
                        {total_net_amount}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell></Table.Summary.Cell>
                      <Table.Summary.Cell></Table.Summary.Cell>
                    </Table.Summary.Row>
                  </>
                )
              }}
            />

          </>
        ) : null}

        {key === "3" ? (
          <>
            <div style={{
              color: "#1677FF", 
              marginBottom: 6, 
              fontWeight: 600, 
              fontSize: 18
            }}>
              HSN-wise Summary
            </div>

            <div style={{
              fontSize: 16, 
              marginBottom: 10, 
            }}>
              B2B Invoices  | <span style={{
                color: "blue"
              }}>
              {b2bInvoiceHsnSummary?.length} Bills
              </span>
            </div>

            <Table
              columns={HSNWiseSummaryColumns}
              dataSource={b2bInvoiceHsnSummary || []}
              pagination = {false}
              summary={() => {
                
                let total_meter = 0; 
                let total_kg = 0 ; 
                let total_sgst = 0 ;
                let total_cgst = 0 ; 
                let total_isgt = 0 ; 
                let total_amount = 0 ; 
                let total_net_amount = 0 ;

                b2bInvoiceHsnSummary?.map((element) => {
                  console.log(element?.meter);
                  
                  total_meter += isNaN(element?.meter)?0:+element?.meter ; 
                  total_kg += +element?.kg;  
                  total_sgst += +element?.sgst; 
                  total_cgst += +element?.cgst ; 
                  total_isgt += +element?.igst; 
                  total_net_amount += +element?.netAmount ; 
                  total_amount += +element?.amount; 
                })

                return(
                  <Table.Summary.Row>
                    <Table.Summary.Cell>
                      Total
                    </Table.Summary.Cell>
                    <Table.Summary.Cell></Table.Summary.Cell>
                    <Table.Summary.Cell></Table.Summary.Cell>
                    <Table.Summary.Cell>
                      {total_meter} M / {total_kg} KG
                    </Table.Summary.Cell>
                    <Table.Summary.Cell>
                      {total_amount}
                    </Table.Summary.Cell>
                    <Table.Summary.Cell></Table.Summary.Cell>
                    <Table.Summary.Cell>
                      {total_sgst}
                    </Table.Summary.Cell>
                    <Table.Summary.Cell>
                      {total_cgst}
                    </Table.Summary.Cell>
                    <Table.Summary.Cell>
                      {total_isgt}
                    </Table.Summary.Cell>
                    <Table.Summary.Cell>
                      {total_net_amount}
                    </Table.Summary.Cell>
                    <Table.Summary.Cell></Table.Summary.Cell>
                  </Table.Summary.Row>
                )
              }}
            />
          </>
        ):null}

        {/* Table of Debit Credit */}
        {key === "2" ? (
          <>
            <div style={{
              fontWeight: 600, 
              fontSize: 20, 
              marginBottom: 10
            }}>
              Credit/Debit Note :
              <span style={{
                color: "blue", 
                marginLeft: 5
              }}>
                { reportData?.credit_debit_note?.length} Notes
              </span>
            </div>
            <Table
              columns={DebiteNoteCreditNoteColumns}
              dataSource={reportData?.credit_debit_note}
              pagination = {false}
              summary={() => {
                let total_amount = 0 ;
                let total_sgst_amount = 0 ;
                let total_cgst_amount = 0 ; 
                let total_igst_amount = 0 ; 
                let total_net_amount = 0 ; 

                reportData?.credit_debit_note?.map((element) => {

                  // Total amount related information
                  if (element?.amount == null){
                    let details = element?.credit_note_details || element?.debit_note_details ; 
                    let totalAmount = 0 ; 
                    details?.map((record) => {
                      totalAmount += +record?.amount || 0; 
                    })
                    total_amount += +totalAmount ; 

                  } else {
                    total_amount += +element?.amount ; 
                  }

                  total_sgst_amount += +element?.SGST_amount ; 
                  total_cgst_amount += +element?.CGST_amount ; 
                  total_igst_amount += +element?.IGST_amount ; 
                  total_net_amount += +element?.net_amount ; 

                })

                total_amount = parseFloat(total_amount).toFixed(2) ; 
                total_sgst_amount = parseFloat(total_amount).toFixed(2) ; 
                total_cgst_amount = parseFloat(total_cgst_amount).toFixed(2) ; 
                total_igst_amount = parseFloat(total_igst_amount).toFixed(2) ; 
                total_net_amount = parseFloat(total_net_amount).toFixed(2) ; 

                return(
                  <>
                    <Table.Summary.Row>
                      <Table.Summary.Cell>
                        Total
                      </Table.Summary.Cell>
                      <Table.Summary.Cell></Table.Summary.Cell>
                      <Table.Summary.Cell></Table.Summary.Cell>
                      <Table.Summary.Cell></Table.Summary.Cell>
                      <Table.Summary.Cell></Table.Summary.Cell>
                      <Table.Summary.Cell></Table.Summary.Cell>
                      <Table.Summary.Cell></Table.Summary.Cell>
                      <Table.Summary.Cell></Table.Summary.Cell>
                      <Table.Summary.Cell>
                        {total_amount}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell>
                        {total_sgst_amount}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell>
                        {total_cgst_amount}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell>
                        {total_igst_amount}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell>
                        {total_net_amount}
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </>
                )
              }}
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

export default GstrPrint;
