import { Flex, Spin, Button, Modal, Table } from "antd";
import { useContext, useEffect, useMemo, useState } from "react";
import LineCharts from "./LineCharts";
import CommonLineCharts from "./CommonLineCharts";
import BarCharts from "./BarCharts";

const PayableChart = ({dayPayableData, dayReceivableData}) => {
    return(
        <div className="chart-wrapper">
            <div style={{
                width: "100%", 
                height: "100%"
            }}>

                <div style={{
                    fontWeight: 600, 
                    color: "#000", 
                    fontSize: 16
                }}>
                    {String("Day Receivable OutStanding").toUpperCase()}
                </div>
                <div style={{
                    marginTop: 20
                }}>
                    <BarCharts
                        data = {dayReceivableData}
                        name = {"Due Date"}
                    />
                </div>
            </div>
            <div style={{
                width: "100%", 
                height: "100%", 
                marginTop: 10
            }}>

                <div style={{
                    fontWeight: 600, 
                    color: "#000", 
                    fontSize: 16
                }}>
                    {String("Day Payable OutStanding").toUpperCase()}
                </div>
                <div style={{
                    marginTop: 20
                }}>
                    <BarCharts
                        data = {dayPayableData}
                        name = {"Due Date"}
                    />
                </div>
            </div>
        </div>
    )
}

export default PayableChart ; 