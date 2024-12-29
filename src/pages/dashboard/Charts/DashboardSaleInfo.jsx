import { Flex, Spin, Button, Modal, Table } from "antd";
import { useContext, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GlobalContext } from "../../../contexts/GlobalContext";
import PieCharts from "./PieChart";
import { ArrowsAltOutlined } from "@ant-design/icons";
import { getDashboardOutStandingInformation, getDashboardSaleInfoReportRequest } from "../../../api/requests/dashboard";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { getSundryDebtorsService } from "../../../api/requests/accounts/sundryDebtors";
import moment from "moment";
import RadicalCharts from "./RadicalCharts";

const DashboardSaleInfo = ({ }) => {
    const { companyId } = useContext(GlobalContext);
    const [totalMeter, setTotalMeter] = useState(undefined) ; 

    // Get total sales related information ===============================
    const { data: salesInformation, isPending } = useQuery({
        queryKey: ["dashboard", "sale-information"],
        queryFn: async () => {
            const params = {
                company_id: companyId
            };
            const response = await getDashboardSaleInfoReportRequest({ params });
        }
    }); 

    useEffect(() => {

    },[ salesInformation]) ; 

    return (
        <div className="chart-wrapper">
            <Flex justify="space-between" align="center" className="mb-2">
                <div className="title" style={{
                    fontWeight: 600,
                    color: "#000"
                }}>
                    Total Sales/Stock
                </div>
            </Flex>
            <div style={{ width: "100%" }}>
                <RadicalCharts />
            </div>

            <div class="sale-dashboard-container">
                <div class="sale-stat">
                    <p class="sale-value">48.87 T</p>
                    <p class="sale-label">Total Meter</p>
                </div>
                <div class="sale-stat">
                    <p class="sale-value sale-highlight-blue">15.52 T</p>
                    <p class="sale-label">Sold Meter</p>
                </div>
                <div class="sale-stat">
                    <p class="sale-value sale-highlight-green">33.35 T</p>
                    <p class="sale-label">Stock Meter</p>
                </div>
                <div class="sale-stat">
                    <p class="sale-value">61</p>
                    <p class="sale-label">Total Bills</p>
                </div>
                <div class="sale-stat">
                    <p class="sale-value sale-highlight-blue">42</p>
                    <p class="sale-label">Sales Bills</p>
                </div>
                <div class="sale-stat">
                    <p class="sale-value sale-highlight-green">19</p>
                    <p class="sale-label">Pending Bills</p>
                </div>
            </div>

        </div>
    )
}

export default DashboardSaleInfo; 