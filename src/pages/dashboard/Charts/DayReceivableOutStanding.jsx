import { Flex, Spin, Button } from "antd";
import { useContext, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GlobalContext } from "../../../contexts/GlobalContext";
import PieCharts from "./PieChart";
import { ArrowsAltOutlined } from "@ant-design/icons";
import { getDashboardOutStandingInformation } from "../../../api/requests/dashboard";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { getSundryDebtorsService } from "../../../api/requests/accounts/sundryDebtors";

const DayReceivableOutStanding = () => {
    
    const navigate = useNavigate() ; 
    const {companyId} = useContext(GlobalContext) ; 
    const [netAmount, setNetAmount] = useState(undefined) ;
    const currentYear = dayjs().year() ; 
    const currentFromDate = dayjs(`${currentYear}-04-01`);
    const currentToDate = dayjs(`${currentYear + 1}-03-31`);

    // Get total outstanding related information  =============================== 
    const {data: outStandingData, isPending} = useQuery({
        queryKey: ["dashbaord", "payable-outstanding"], 
        queryFn: async () => {
            const params = {
                company_id: companyId,
            }
            const response = await getDashboardOutStandingInformation({params}) ; 
            return response?.data?.data
        }, 
    })

    // Get total debitor related information data ==============================
    const {data: sundryDebtorData, isFetching: isSundaryLoading} = useQuery({
        queryKey: [
            "sundry", 
            "debtor", 
            "data", 
            {
                from_date: dayjs(currentFromDate).format("YYYY-MM-DD"), 
                to_date: dayjs(currentToDate).format("YYYY-MM-DD")
            }
        ], 
        queryFn: async () => {
            const params = {
                from_date:  dayjs(currentFromDate).format("YYYY-MM-DD"),
                to_date: dayjs(currentToDate).format("YYYY-MM-DD"), 
                company_id: companyId
            }; 
            const res = await getSundryDebtorsService({params}) ; 
            return res?.data?.data; 
        }, 
        
    })

    // Total net amount related information 
    useEffect(() => {
        if (outStandingData){
            let total_amount = 0 ;
            outStandingData?.result?.map((element) => {
                total_amount += +element?.total_amount ; 
            })
            setNetAmount(total_amount) ; 
        }
    }, [outStandingData]); 

    // Challan click handler 
    const ChallanClickHandler = (model) => {
        if (model == "yarn_receive_challans"){
            navigate("purchase/receive/yarn-receive") ; 
        }   else if (model == "purchase_taka_challan"){
            navigate("purchase/challan/purchase-challan") ; 
        }   else if (model == "job_taka_challan"){
            navigate("job/challan/job-challan") ; 
        }   else {
            navigate("job/challan/rework-challan")
        }
    }

    return (
        <>
            <div className="chart-wrapper">
                <Flex justify="space-between" align="center" className="mb-2">
                    <div className="title" style={{
                        fontWeight: 600,
                        color: "#000"
                    }}>Day Receivable OutStanding</div>
                    <div>
                        <Button
                            icon={<ArrowsAltOutlined />}
                        />
                    </div>
                </Flex>
                <div style={{width: "100%"}}>
                    <PieCharts />
                </div>
                <div class="dashboard-chart-card">
                    <div class="dashboard-chart-header">
                        <div class="dashboard-chart-title">Total Outstanding</div>
                        <div class="dashboard-chart-total-dues">Total Dues <span class="dues-value">22.730 T</span></div>
                    </div>
                    <div class="dashboard-chart-amount">{netAmount || 0}</div>
                    <table class="dashboard-chart-details">
                        <thead>
                            <tr>
                                <th>DueDays</th>
                                <th>Bills</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="due-days">30+</td>
                                <td>1</td>
                                <td>7,371</td>
                            </tr>
                            <tr>
                                <td class="due-days">90+</td>
                                <td>2</td>
                                <td>15,359</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                {outStandingData?.challan_result?.length > 0 ? (
                    outStandingData.challan_result.map((element, index) => (
                        <div className="challan-information-text" key={index}>
                            <div className="challan-information-text" key={index}
                                onClick={() => {ChallanClickHandler(element?.model)}}>
                                {
                                    element?.model == "yarn_receive_challans" ? "Total Yarn Receive Challan" :
                                    element?.model == "purchase_taka_challan" ? "Total Purchase Challan" :
                                    element?.model == "job_taka_challan" ? "Total Job Challan" :
                                    element?.model == "job_rework_challan" ? "Job Job Rework Challan" :
                                    ""
                                }
                                : 
                                <span className="challan-information-count">{element?.number_of_challans}</span>
                            </div>

                        </div>
                    ))
                ) : (
                    <div>No challan data available</div>
                )}


            </div>
        </>
    )
}

export default DayReceivableOutStanding; 