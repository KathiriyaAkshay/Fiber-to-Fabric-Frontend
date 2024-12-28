import { Flex, Spin, Button, Modal, Table } from "antd";
import { useContext, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GlobalContext } from "../../../contexts/GlobalContext";
import PieCharts from "./PieChart";
import { ArrowsAltOutlined } from "@ant-design/icons";
import { getDashboardOutStandingInformation } from "../../../api/requests/dashboard";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { getSundryDebtorsService } from "../../../api/requests/accounts/sundryDebtors";
import moment from "moment";
import { productionInHoustTakaReportRequest } from "../../../api/requests/dashboard";

const ProductionReport = ({ }) => {
    
    const {companyId} = useContext(GlobalContext);  
    const currentYear = dayjs().year();
    const currentFromDate = dayjs(`${currentYear}-04-01`);
    const currentToDate = dayjs(`${currentYear + 1}-03-31`);
    const [totalInformation, setTotalInformation] = useState({});

    // Production report information related handler ===========================
    const { data: productionReportData } = useQuery({
        queryKey: ["get", "production", "taka-report", { company_id: companyId }],
        queryFn: async () => {
            const params = {
                company_id: companyId
            };
            const response = await productionInHoustTakaReportRequest({ params });
            return response?.data?.data;
        }
    })

    useEffect(() => {
        if (productionReportData){
            let total_taka = 0 ;
            let total_tp = 0 ; 
            
            let total_grade_a_taka = 0 ;
            let total_grade_a_meter = 0 ; 

            let total_grade_b_taka = 0 ; 
            let total_grade_b_meter = 0 ;

            let total_grade_c_taka = 0 ; 
            let total_grade_c_meter = 0 ;

            let total_grade_d_taka = 0 ;
            let total_grade_d_meter = 0; 
            
            let total_meter = 0 ; 
            let total_weight = 0 ; 
            let total_average = 0 ; 

            productionReportData?.map((element) => { 
                total_taka += +element?.total_taka ; 
                total_tp += +element?.total_tp ; 

                if (element?.grade_wise_summary["A"]?.total_taka !== undefined){
                    total_grade_a_taka += +element?.grade_wise_summary["A"]?.total_taka; 
                    total_grade_a_meter += +element?.grade_wise_summary["A"]?.total_meter;
                    total_meter += +element?.grade_wise_summary["A"]?.total_meter;
                }

                if (element?.grade_wise_summary["B"]?.total_taka !== undefined){
                    total_grade_b_taka += +element?.grade_wise_summary["B"]?.total_taka; 
                    total_grade_b_meter += +element?.grade_wise_summary["B"]?.total_meter;
                    total_meter += +element?.grade_wise_summary["B"]?.total_meter;
                }
                
                if (element?.grade_wise_summary["C"]?.total_taka !== undefined){
                    total_grade_c_taka += +element?.grade_wise_summary["C"]?.total_taka; 
                    total_grade_c_meter += +element?.grade_wise_summary["C"]?.total_meter;
                    total_meter += +element?.grade_wise_summary["C"]?.total_meter;
                }
                
                if (element?.grade_wise_summary["D"]?.total_taka !== undefined){
                    total_grade_d_taka += +element?.grade_wise_summary["D"]?.total_taka; 
                    total_grade_d_meter += +element?.grade_wise_summary["D"]?.total_meter;
                    total_meter += +element?.grade_wise_summary["D"]?.total_meter;
                }

                total_weight += element?.total_weight; 
                
                total_average = (+total_weight/+total_meter)*100;

                setTotalInformation({
                    totalTaka: total_taka, 
                    total_grade_a_taka: total_grade_a_taka, 
                    total_grade_a_meter, 
                    total_grade_b_taka, 
                    total_grade_b_meter, 
                    total_grade_c_meter, 
                    total_grade_c_taka, 
                    total_grade_d_taka, 
                    total_grade_d_meter, 
                    total_weight, 
                    total_average, 
                    total_tp
                })
            })
        }
    },[productionReportData]) ; 

    const columns = [
        {
            title: "ID", 
            dataIndex: "id", 
            render: (text, record, index) => {
                return(
                    <div>{index + 1}</div>
                )
            }
        }, 
        {
            title: "Quality", 
            render: (text, record) => {
                return(
                    <div>
                        {record?.quality?.quality_name} ({record?.quality?.weight_from} KG)
                    </div>
                )
            }
        }, 
        {
            title: "Total Taka", 
            render: (text, record) => {
                return(
                    <div>
                        {record?.total_taka}
                        {record?.total_tp !== 0 && (
                            <span style={{
                                marginLeft: 5,
                                fontSize: 12,
                                color: "#000",
                                fontWeight: 600
                            }}>
                                ( {record?.total_tp} TP )
                            </span>
                        )}
                    </div>
                )
            }
        }, 
        {
            title: "A", 
            render: (text, record) => {
                return(
                    <div>
                        {record?.grade_wise_summary["A"] !== undefined && (
                            <div>
                                {record?.grade_wise_summary["A"]?.total_taka}
                                <span style={{
                                    fontSize: 12,
                                    color: "#000",
                                    fontWeight: 600, 
                                    marginLeft: 5
                                }}>
                                   ({(record?.grade_wise_summary["A"]?.total_meter)}) Me.
                                </span>
                            </div>
                        )}

                        {record?.grade_wise_summary["A"] == undefined && (
                            <div>
                                -
                            </div>
                        )}
                    </div>
                )
            }
        }, 
        {
            title: "B", 
            render: (text, record) => {
                return(
                    <div>
                        {record?.grade_wise_summary["B"] !== undefined && (
                            <div>
                                {record?.grade_wise_summary["B"]?.total_taka}
                                <span style={{
                                    fontSize: 12,
                                    color: "#000",
                                    fontWeight: 600, 
                                    marginLeft: 5
                                }}>
                                   ({(record?.grade_wise_summary["B"]?.total_meter)}) Me.
                                </span>
                            </div>
                        )}

                        {record?.grade_wise_summary["B"] == undefined && (
                            <div>
                                -
                            </div>
                        )}
                    </div>
                )
            }
        }, 
        {
            title: "C", 
            render: (text, record) => {
                return(
                    <div>
                        {record?.grade_wise_summary["C"] !== undefined && (
                            <div>
                                {record?.grade_wise_summary["C"]?.total_taka}
                                <span style={{
                                    fontSize: 12,
                                    color: "#000",
                                    fontWeight: 600, 
                                    marginLeft: 5
                                }}>
                                   ({(record?.grade_wise_summary["C"]?.total_meter)}) Me.
                                </span>
                            </div>
                        )}

                        {record?.grade_wise_summary["C"] == undefined && (
                            <div>
                                -
                            </div>
                        )}
                    </div>
                )
            }
        }, 
        {
            title: "D", 
            render: (text, record) => {
                return(
                    <div>
                        {record?.grade_wise_summary["D"] !== undefined && (
                            <div>
                                {record?.grade_wise_summary["D"]?.total_taka}
                                <span style={{
                                    fontSize: 12,
                                    color: "#000",
                                    fontWeight: 600, 
                                    marginLeft: 5
                                }}>
                                   ({(record?.grade_wise_summary["D"]?.total_meter)}) Me.
                                </span>
                            </div>
                        )}

                        {record?.grade_wise_summary["D"] == undefined && (
                            <div>
                                -
                            </div>
                        )}
                    </div>
                )
            }
        }, 
        {
            title: "Total Meter", 
            render: (text, record) => {
                const totalMeter = Object.values(record?.grade_wise_summary).reduce((sum, grade) => sum + grade.total_meter, 0);
                return(
                    <div>
                        {parseFloat(totalMeter).toFixed(2)}
                    </div>
                )
            }
        }, 
        {
            title: "Total Weight", 
            render: (text, record) => {
                return(
                    <div>
                        {record?.total_weight}
                    </div>
                )
            }
        }, 
        {
            title: "Average", 
            render: (text, record) => {
                let total_weight = +record?.total_weight ; 
                let totalMeter = Object.values(record?.grade_wise_summary).reduce((sum, grade) => sum + grade.total_meter, 0);
                let average = (+total_weight/+totalMeter)*100; 
                return(
                    <div>
                        {isNaN(parseFloat(average).toFixed(2))?0:parseFloat(average).toFixed(2)}
                    </div>
                )
            }
        }
    ]

    return (
        <div className="chart-wrapper">

            <div className="production-report-title">
                Production Report : {dayjs(currentFromDate).format("DD-MM-YYYY")} to {dayjs(currentToDate).format("DD-MM-YYYY")}
            </div>
            
            <Table
                columns={columns}
                dataSource={productionReportData}
                pagination = {false}
                summary={() => {
                    return(
                        <Table.Summary.Row>
                            <Table.Summary.Cell>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell>
                                {productionReportData?.length} Quality
                            </Table.Summary.Cell>
                            <Table.Summary.Cell>
                                {totalInformation?.totalTaka}
                                {totalInformation?.total_tp !== 0 && (
                                    <span style={{
                                        marginLeft: 5,
                                        fontSize: 12,
                                        color: "#000",
                                        fontWeight: 600
                                    }}>
                                        ( {totalInformation?.total_tp} TP )
                                    </span>
                                )}
                            </Table.Summary.Cell>
                            <Table.Summary.Cell>
                                {totalInformation?.total_grade_a_taka}
                                <span style={{
                                    fontSize: 12,
                                    color: "#000",
                                    fontWeight: 600, 
                                    marginLeft: 5
                                }}>
                                   ({totalInformation?.total_grade_a_meter}) Me.
                                </span>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell>
                                {totalInformation?.total_grade_b_taka}
                                <span style={{
                                    fontSize: 12,
                                    color: "#000",
                                    fontWeight: 600, 
                                    marginLeft: 5
                                }}>
                                   ({totalInformation?.total_grade_b_meter}) Me.
                                </span>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell>
                                {totalInformation?.total_grade_c_taka}
                                <span style={{
                                    fontSize: 12,
                                    color: "#000",
                                    fontWeight: 600, 
                                    marginLeft: 5
                                }}>
                                   ({totalInformation?.total_grade_c_meter}) Me.
                                </span>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell>
                                {totalInformation?.total_grade_d_taka}
                                <span style={{
                                    fontSize: 12,
                                    color: "#000",
                                    fontWeight: 600, 
                                    marginLeft: 5
                                }}>
                                   ({totalInformation?.total_grade_d_meter}) Me.
                                </span>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell>
                                {
                                    parseFloat(totalInformation?.total_grade_a_meter + 
                                        totalInformation?.total_grade_b_meter + 
                                        totalInformation?.total_grade_c_meter + 
                                        totalInformation?.total_grade_d_meter).toFixed(2)
                                }
                            </Table.Summary.Cell>
                            <Table.Summary.Cell>
                                {parseFloat(totalInformation?.total_weight).toFixed(2)}
                            </Table.Summary.Cell>
                            <Table.Summary.Cell>
                                {parseFloat(totalInformation?.total_average).toFixed(2)}
                            </Table.Summary.Cell>
                        </Table.Summary.Row>
                    )
                }}
            />
        </div>
    )
}

export default ProductionReport; 