import { Flex, Spin, Button, Modal, Table } from "antd";
import { useContext, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GlobalContext } from "../../../contexts/GlobalContext";
import PieCharts from "./PieChart";
import { ArrowsAltOutlined } from "@ant-design/icons";
import { getDashboardOutStandingInformation, getDashboardSaleInfoReportRequest, getProductionStockReportRequest } from "../../../api/requests/dashboard";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { getSundryDebtorsService } from "../../../api/requests/accounts/sundryDebtors";
import moment from "moment";
import RadicalCharts from "./RadicalCharts";

const DashboardSaleInfo = ({ setTakaInformation, takaInformation }) => {
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
            setTakaInformation(response?.data?.data) ; 
            return response?.data?.data ; 
        }
    }); 

    useEffect(() => {
        if (salesInformation !== undefined){
            let temp_total_meter = 0 ;
            temp_total_meter += +salesInformation?.total_production_meter || 0 ;
            temp_total_meter += +salesInformation?.purchase_taka?.[0]?.total_meter ; 
            temp_total_meter += +salesInformation?.job_taka?.[0]?.total_meter ; 
            setTotalMeter(temp_total_meter);
            
        }
    },[ salesInformation]) ; 

    const [productionStockTotalInformation, setProductionStockTotalInformation] = useState(undefined) ; 
    const {data: productionStockReport, isPending: stockReportLoading} = useQuery({
        queryKey: ["dashboard", "production-report"],
        queryFn: async () => {
            const params = {
                company_id: companyId
            }; 
            const response = await getProductionStockReportRequest({params}) ; 
            return response?.data?.data ; 
        }
    })
    
    useEffect(() => {
        if (productionStockReport !== undefined){
            let temp_total_taka = 0; 
            let temp_total_meter = 0 ;
            let temp_total_running_machine = 0 ; 

            productionStockReport?.map((element) => {
                temp_total_taka += +element?.total_taka ; 
                temp_total_meter += +element?.total_meter ; 
                temp_total_running_machine += +element?.running_machines ; 
            })
            setProductionStockTotalInformation({
                temp_total_meter, 
                temp_total_taka, 
                temp_total_running_machine
            })
        }
    },[productionStockReport])

    // =========== Particular taka information ================== // 
    const [isTakaInformationModelOpen, setIsTakaInformationModelOpen] = useState(false); 
    const [particularTakaInformation, setParticularTakaInformation] = useState([]) ; 
    const [particularQualityInformation, setParticularQualityInformation] = useState(undefined) ; 
    const taka_info_columns = [
        {
            title: "ID", 
            render: (text, record, index) => {
                return(
                    <div>
                        {index + 1}
                    </div>
                )
            }

        }, 
        {
            title: "Status", 
            dataIndex: "status"
        }, 
        {
            title: "Taka", 
            dataIndex: "taka"
        }, 
        {
            title: "Meter", 
            dataIndex: "meter"
        }, 
        {
            title: "A", 
            dataIndex: "a_meter", 
            render: (text, record) => {
                return(
                    <div>
                        {`${record?.a_meter}`}
                        <span className="production-taka-info">{`( ${record?.a_taka} )`}</span>
                    </div>
                )
            }
        }, 
        {
            title: "B", 
            dataIndex: "b_meter", 
            render: (text, record) => {
                return(
                    <div>
                        {`${record?.b_meter}`}
                        <span className="production-taka-info">{`( ${record?.b_taka} )`}</span>
                    </div>
                )
            }
        }, 
        {
            title: "C", 
            dataIndex: "c_meter", 
            render: (text, record) => {
                return(
                    <div>
                        {`${record?.c_meter}`}
                        <span className="production-taka-info">{`( ${record?.c_taka} )`}</span>
                    </div>
                )
            }
        }, 
        {
            title: "D", 
            dataIndex: "d_meter", 
            render: (text, record) => {
                return(
                    <div>
                        {`${record?.d_meter}`}
                        <span className="production-taka-info">{`( ${record?.d_taka} )`}</span>
                    </div>
                )
            }
        }
    ]

    // ============= Production report ============= // 
    const [isModelOpen, setIsModelOpen] = useState(false) ; 
    const columns = [
        {
            title: "ID", 
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
            title: "Quality", 
            render: (text, record) => {
              return (
                <div style={{
                    fontWeight: 600
                }}>
                  {record?.quality?.quality_name} ({record?.quality?.quality_weight}KG)
                </div>
              );
            }
        }, 
        {
            title: "Taka", 
            render: (text, record) => {
                return(
                    <div className="production-taka-report"
                        onClick={() => {
                            setParticularQualityInformation(record?.quality);
                            let temp = []; 
                            temp.push({
                                "status": "Salable", 
                                "taka": record?.total_taka, 
                                "meter": record?.total_meter, 
                                "a_meter": record?.grade_wise_summary["A"] !== undefined?record?.grade_wise_summary["A"]?.total_meter:"0", 
                                "a_taka": record?.grade_wise_summary["A"] !== undefined?record?.grade_wise_summary["A"]?.total_taka:"0", 
                                "b_meter": record?.grade_wise_summary["B"] !== undefined?record?.grade_wise_summary["B"]?.total_meter:"0", 
                                "b_taka": record?.grade_wise_summary["B"] !== undefined?record?.grade_wise_summary["B"]?.total_taka:"0", 
                                "c_meter": record?.grade_wise_summary["C"] !== undefined?record?.grade_wise_summary["C"]?.total_meter:"0", 
                                "c_taka": record?.grade_wise_summary["C"] !== undefined?record?.grade_wise_summary["C"]?.total_taka:"0", 
                                "d_meter": record?.grade_wise_summary["D"] !== undefined?record?.grade_wise_summary["D"]?.total_meter:"0", 
                                "d_taka": record?.grade_wise_summary["D"] !== undefined?record?.grade_wise_summary["D"]?.tota_taka:"0"
                            }); 
                            temp.push({
                                "status": "Re-work", 
                                "taka": record?.rework_taka, 
                                "meter": record?.rework_meter, 
                                "a_meter": record?.grade_wise_summary["A"] !== undefined?record?.grade_wise_summary["A"]?.rework_meter:"0", 
                                "a_taka": record?.grade_wise_summary["A"] !== undefined?record?.grade_wise_summary["A"]?.rework_taka:"0", 
                                "b_meter": record?.grade_wise_summary["B"] !== undefined?record?.grade_wise_summary["B"]?.rework_meter:"0", 
                                "b_taka": record?.grade_wise_summary["B"] !== undefined?record?.grade_wise_summary["B"]?.rework_taka:"0", 
                                "c_meter": record?.grade_wise_summary["C"] !== undefined?record?.grade_wise_summary["C"]?.rework_meter:"0", 
                                "c_taka": record?.grade_wise_summary["C"] !== undefined?record?.grade_wise_summary["C"]?.rework_taka:"0", 
                                "d_meter": record?.grade_wise_summary["D"] !== undefined?record?.grade_wise_summary["D"]?.rework_meter:"0", 
                                "d_taka": record?.grade_wise_summary["D"] !== undefined?record?.grade_wise_summary["D"]?.rework_taka:"0"
                            })
                            setParticularTakaInformation(temp) ; 
                            setIsTakaInformationModelOpen(true) ; 
                        }}>
                        {record?.total_taka || 0}
                    </div>
                )
            }
        }, 
        {
            title: "Total Meter", 
            render: (text, record) => {
                return(
                    <div>
                        {record?.total_meter || 0}
                    </div>
                )
            }
        }, 
        {
            title: "R. Machine",
            render: (text, record) => {
                return(
                    <div>
                        {record?.running_machines}
                    </div>
                )
            }
        }
    ]

    return (
        <div className="chart-wrapper">
            <Flex justify="space-between" align="center" className="mb-2">
                <div className="title sale-stock-title" style={{
                    fontWeight: 600,
                    color: "#000"
                }} onClick={() => {setIsModelOpen(true)}}>
                    Total Sales/Stock
                </div>
            </Flex>
            <div style={{ width: "100%" }}>
                <RadicalCharts />
            </div>

            <div class="sale-dashboard-container">
                <div class="sale-stat">
                    <p class="sale-value">{totalMeter}</p>
                    <p class="sale-label">Total Meter</p>
                </div>
                <div class="sale-stat">
                    <p class="sale-value sale-highlight-blue">{salesInformation?.total_sold_meter || 0 }</p>
                    <p class="sale-label">Sold Meter</p>
                </div>
                <div class="sale-stat">
                    <p class="sale-value sale-highlight-green">{+totalMeter - salesInformation?.total_sold_meter >0?
                        +totalMeter - salesInformation?.total_sold_meter:0}</p>
                    <p class="sale-label">Stock Meter</p>
                </div>
                <div class="sale-stat">
                    <p class="sale-value">{salesInformation?.total_bills || 0}</p>
                    <p class="sale-label">Total Bills</p>
                </div>
                <div class="sale-stat">
                    <p class="sale-value sale-highlight-blue">{salesInformation?.sale_bills || 0}</p>
                    <p class="sale-label">Sales Bills</p>
                </div>
                <div class="sale-stat">
                    <p class="sale-value sale-highlight-green">{+salesInformation?.total_bills - +salesInformation?.sale_bills > 0?
                        +salesInformation?.total_bills - +salesInformation?.sale_bills:0}</p>
                    <p class="sale-label">Pending Bills</p>
                </div>

            </div>


            {/* ===== Production quality wise report information =========  */}
            <Modal
                title = {
                    <div>
                        Production Stock 
                    </div>
                }
                open = {isModelOpen}
                onCancel={() => {setIsModelOpen(false)}}
                centered
                className="view-in-house-quality-model"
                classNames={{
                    header: "text-center",
                }}
                styles={{
                    content: {
                        padding: 0,
                        width: "700px",
                        margin: "auto",
                    },
                    header: {
                        padding: "16px",
                        margin: 0,
                    },
                    body: {
                        padding: "10px 16px",
                    },
                }}
                footer = {null}
            >
                <Table
                    columns={columns}
                    dataSource={productionStockReport || []}
                    pagination = {false}
                    summary={() => (
                        <>
                            <Table.Summary.Row>
                                <Table.Summary.Cell></Table.Summary.Cell>
                                <Table.Summary.Cell></Table.Summary.Cell>
                                <Table.Summary.Cell>
                                    {productionStockTotalInformation?.temp_total_taka || 0}
                                </Table.Summary.Cell>
                                <Table.Summary.Cell>
                                    {productionStockTotalInformation?.temp_total_meter || 0}
                                </Table.Summary.Cell>
                                <Table.Summary.Cell>
                                    {productionStockTotalInformation?.temp_total_running_machine || 0}
                                </Table.Summary.Cell>
                            </Table.Summary.Row>
                        </>
                    )}
                />
            </Modal>

            {/* ============= Taka information model ====================  */}
            <Modal
                title = {
                    <div>
                        Production Stock 
                    </div>
                }
                open = {isTakaInformationModelOpen}
                onCancel={() => {setIsTakaInformationModelOpen(false)}}
                centered
                className="view-in-house-quality-model"
                classNames={{
                    header: "text-center",
                }}
                styles={{
                    content: {
                        padding: 0,
                        width: "600px",
                        margin: "auto",
                    },
                    header: {
                        padding: "16px",
                        margin: 0,
                    },
                    body: {
                        padding: "10px 16px",
                    },
                }}
                footer = {null}
            >
                <div className="production-taka-info-quality">
                    {particularQualityInformation?.quality_name} ( {`${particularQualityInformation?.quality_weight}KG`} )
                </div>
                <Table
                    columns={taka_info_columns}
                    dataSource={particularTakaInformation || []}
                    pagination = {false}
                    style={{
                        marginTop: 15
                    }}
                />
            </Modal>

        </div>
    )
}

export default DashboardSaleInfo; 