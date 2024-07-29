import { Button } from "antd";
import React, { useRef } from "react";
import { useState, useEffect } from "react";
import { PrinterOutlined } from "@ant-design/icons";
import "./printPage.css"; 
import ReactToPrint from "react-to-print";

const PrintPage = () => {

    const ComponentRef = useRef() ; 

    const orders = [
        { no: 1, orderNo: 12, orderDate: '28-07-2024', party: 'MILLIGINE', yarnCompany: 'AARTI SYNTHETICS', dennier: 156, lotNo: 78, yarnGrade: 'A+', cartoon: 1000, quantity: 100, rate: 10, approxAmount: 1000, orderStatus: 'Pending' },
        { no: 2, orderNo: 11, orderDate: '24-06-2024', party: 'MILLIGINE', yarnCompany: 'YARN_COMPANY_NAME_1', dennier: 44, lotNo: 10, yarnGrade: 'A+', cartoon: 500, quantity: 500, rate: 50, approxAmount: 25000, orderStatus: 'Pending' },
        // Add other orders here...
    ];


    const pageStyle = `
        @media print {
            body {
                margin: 0 !important;
                padding: 0 !important;
                box-shadow: none !important;
            }
            .print-instructions {
                display: none;
            }
            .printable-content {
                width: 100%;
                margin-top: 0;
                padding-top: 0;
            }
        }` ; 

    return (
        <div style={{ padding: 10 }}>
            <div style={{ marginLeft: "auto", width: "100%" }}>
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

            <div style={{marginTop: 10}} ref={ComponentRef}>

                <div className="page_title">
                    Yarn Order List
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>Order No.</th>
                            <th>Order Date</th>
                            <th>Party/Supplier Name</th>
                            <th>Yarn Company</th>
                            <th>Dennier</th>
                            <th>Lot no</th>
                            <th>Yarn Grade</th>
                            <th>Cartoon</th>
                            <th>Quantity</th>
                            <th>Rate</th>
                            <th>Approx Amount</th>
                            <th>Order Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order, index) => (
                            <tr key={index}>
                                <td>{order.no}</td>
                                <td>{order.orderNo}</td>
                                <td>{order.orderDate}</td>
                                <td>{order.party}</td>
                                <td>{order.yarnCompany}</td>
                                <td>{order.dennier}</td>
                                <td>{order.lotNo}</td>
                                <td>{order.yarnGrade}</td>
                                <td>{order.cartoon}</td>
                                <td>{order.quantity}</td>
                                <td>{order.rate}</td>
                                <td>{order.approxAmount}</td>
                                <td>{order.orderStatus}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>
        </div>
    )
}

export default PrintPage; 