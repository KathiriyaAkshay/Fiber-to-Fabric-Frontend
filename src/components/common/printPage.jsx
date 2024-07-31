import { Button } from "antd";
import React, { useRef } from "react";
import { useState, useEffect } from "react";
import { PrinterOutlined } from "@ant-design/icons";
import "./printPage.css"; 
import ReactToPrint from "react-to-print";
import { GlobalContext } from "../../contexts/GlobalContext";
import { useContext } from "react";

const PrintPage = () => {
    const ComponentRef = useRef() ; 
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

        table {
            width: 100%;
            table-layout: fixed; /* This will help the table to take full width */
        }
    }` ;    
    const [orderData, setOrderData] = useState([]) ; 
    const [orderTitle, setOrderTitle] = useState(null) ; 
    const [tableHead, setTableHead] = useState(null) ; 
    const [totalVisible, setTotalVisible] = useState(false) ; 
    const [totalCount, setTotalCount] = useState(null) ; 

    const { company, companyId, financialYearEnd } = useContext(GlobalContext);

    useEffect(() => {
        let page_title = localStorage.getItem("print-title") ; 
        setOrderTitle(page_title) ; 

        let page_data = JSON.parse(localStorage.getItem("print-array")) ; 
        setOrderData([...page_data]) ; 

        let page_head = JSON.parse(localStorage.getItem("print-head")) ; 
        setTableHead(page_head) ; 

        let total_visible = localStorage.getItem("total-count") ; 
        if (total_visible == "1"){
            console.log("Run this");
            setTotalVisible(true) ; 
        }   else {
            setTotalVisible(false) ; 
        }

        let total_data = JSON.parse(localStorage.getItem("total-data")) ; 
        console.log(total_data);
        setTotalCount(total_data) ; 

    }, []); 

    return (
        <div className="printable-page">
            
            <div style={{ marginLeft: "auto", width: "100%", marginTop: "15px" }}>
                <ReactToPrint
                    trigger={() => 
                        <Button style={{ marginLeft: "auto" }} type="primary" icon={<PrinterOutlined />}>
                            Print
                        </Button>
                    }
                    content={() => ComponentRef.current}
                    pageStyle={pageStyle}
                />
            </div>

            <div 
                className="printable-main-div" 
                ref={ComponentRef}>

                <div className="page_title">
                    {orderTitle}
                </div>

                <div class="company-info">
                    <div>Company Name: <strong>{company?.company_name}</strong></div>
                    <div class="company-contact">Company Contact: <strong>{company?.company_contact}</strong></div>
                    <div class="gst-number">GST No.: <strong>{company?.gst_no}</strong></div>
                </div>

                <div className="printable-table-div">

                    <table className="printable_table">
                        <thead>
                            <tr>
                                {tableHead?.map((element) => (
                                    <th>{element}</th>
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
                                {totalVisible && (
                                    totalCount?.map((element, index) => (
                                        <td className="total-information-td">{element}</td>
                                    ))
                                )}
                            </tr>
                        </tbody>
                    </table>

                </div>


            </div>

        </div>
    )
}

export default PrintPage; 