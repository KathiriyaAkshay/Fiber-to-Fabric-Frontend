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

function calculateDaysDifference(dueDate) {
    const today = new Date(); // Get today's date
    const [day, month, year] = dueDate.split('-');
    const due = new Date(year, month - 1, day);
    const timeDifference = today - due; // Difference in milliseconds
    const dayDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
    return dayDifference;
}

const DayReceivableOutStanding = ({setDayReceivableData}) => {

    const navigate = useNavigate();
    const { companyId } = useContext(GlobalContext);
    const [netAmount, setNetAmount] = useState(undefined);
    const currentYear = dayjs().year();
    const currentFromDate = dayjs(`${currentYear}-04-01`);
    const currentToDate = dayjs(`${currentYear + 1}-03-31`);

    const [title, setTitle] = useState(undefined);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [tableData, setTableData] = useState([]);

    // Get total outstanding related information  =============================== 
    const { data: outStandingData, isPending } = useQuery({
        queryKey: ["dashbaord", "payable-outstanding"],
        queryFn: async () => {
            const params = {
                company_id: companyId,
            }
            const response = await getDashboardOutStandingInformation({ params });
            return response?.data?.data
        },
    })

    // Get total debitor related information data ==============================
    const { data: sundryDebtorData, isFetching: isSundaryLoading } = useQuery({
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
                from_date: dayjs(currentFromDate).format("YYYY-MM-DD"),
                to_date: dayjs(currentToDate).format("YYYY-MM-DD"),
                company_id: companyId
            };
            const res = await getSundryDebtorsService({ params });
            return res?.data?.data;
        },

    })

    // Particular groupwise data information 
    const [final_net_amount, set_final_net_amount] = useState(undefined);
    const [charData, setCharData] = useState([])
    const [normal_bill, set_normal_bill] = useState([]);
    const [days_30, set_days_30] = useState([]);
    const [days_45, set_days_45] = useState([]);
    const [days_60, set_days_60] = useState([]);
    const [days_90, set_days_90] = useState([]);

    useEffect(() => {
        if (sundryDebtorData) {
            let temp_normal_bills = [];
            let temp_30_days = [];
            let temp_45_days = [];
            let temp_60_days = [];
            let temp_90_days = [];
            let temp_final_net_amount = 0;
            let chart_data = [] ; 

            sundryDebtorData?.map((element) => {
                const temp_bill = element?.bills?.map((bill) => {
                    if (["credit_notes", "debit_notes"]?.includes(bill?.model)) {
                        return false;
                    }
                    const dueDate = moment(bill?.due_days).format("DD-MM-YYYY");
                    const dueDays = isNaN(calculateDaysDifference(dueDate)) ? 0 : calculateDaysDifference(dueDate);
                    let total_amount = parseFloat(+bill?.amount || 0).toFixed(2) || 0;
                    let credit_note_amount = parseFloat(+bill?.credit_note_amount || 0).toFixed(2) || 0;
                    let paid_amount = parseFloat(+bill?.paid_amount || 0).toFixed(2) || 0;
                    let finalAmount = total_amount - paid_amount - credit_note_amount;
                    if (dueDays >= 0 && dueDays < 30) {
                        temp_final_net_amount += +finalAmount;
                        temp_normal_bills.push({
                            ...element,
                            bills: { ...bill, final_net_amount: finalAmount },
                        })
                    }
                    else if (dueDays >= 30 && dueDays < 45) {
                        temp_final_net_amount += +finalAmount;
                        temp_30_days.push({
                            ...element,
                            bills: { ...bill, final_net_amount: finalAmount },
                        })
                    } else if (dueDays >= 45 && dueDays < 60) {
                        temp_final_net_amount += +finalAmount;
                        temp_45_days.push({
                            ...element,
                            bills: { ...bill, final_net_amount: finalAmount },
                        })
                    } else if (dueDays > 60 && dueDays < 90) {
                        temp_final_net_amount += +finalAmount;
                        temp_60_days.push({
                            ...element,
                            bills: { ...bill, final_net_amount: finalAmount },
                        })
                    } else if (dueDays > 90) {
                        temp_final_net_amount += +finalAmount;
                        temp_90_days.push({
                            ...element,
                            bills: { ...bill, final_net_amount: finalAmount },
                        })
                    }
                })

            })
            set_final_net_amount(temp_final_net_amount);
            set_normal_bill(temp_normal_bills)
            set_days_30(temp_30_days);
            set_days_45(temp_45_days);
            set_days_60(temp_60_days);
            set_days_90(temp_90_days);
            chart_data.push({
                name: `30+ : (${temp_30_days?.length} )`, 
                pv: temp_30_days?.reduce((total, element) => total + (+element?.bills?.final_net_amount || 0), 0) || 0
            })
            chart_data.push({
                name: `45+ : (${temp_45_days?.length} )`, 
                pv: temp_45_days?.reduce((total, element) => total + (+element?.bills?.final_net_amount || 0), 0) || 0
            })
            chart_data.push({
                name: `60+ : (${temp_60_days?.length} )`, 
                pv: temp_60_days?.reduce((total, element) => total + (+element?.bills?.final_net_amount || 0), 0) || 0
            })
            chart_data.push({
                name: `90+ : (${temp_90_days?.length} )`, 
                pv: temp_90_days?.reduce((total, element) => total + (+element?.bills?.final_net_amount || 0), 0) || 0
            })
            setDayReceivableData(chart_data) ; 
        }
    }, [sundryDebtorData]);

    // Total net amount related information 
    useEffect(() => {
        if (outStandingData) {
            let total_amount = 0;
            outStandingData?.result?.map((element) => {
                total_amount += +element?.total_net_amount;
            })
            setNetAmount(total_amount);
        }
    }, [outStandingData]);

    useEffect(() => {
        if (netAmount !== 0) {
            let temp_final_net_amount = 0;
            if (final_net_amount > 0) {
                temp_final_net_amount = final_net_amount;
            }
            let dueAmount = temp_final_net_amount;
            dueAmount = (+dueAmount * 100) / netAmount;
            setCharData([
                { name: "Total Receivable", value: +parseFloat(100 - +dueAmount).toFixed(2) },
                { name: "Total Dues", value: +parseFloat(dueAmount).toFixed(2) },
            ])
        }

    }, [final_net_amount, netAmount])

    const columns = [
        {
            title: "No",
            dataIndex: "name",
            key: "name",
            render: (text, record, index) => {
                return (
                    <div>{index + 1}</div>
                )
            }
        },
        {
            title: "Invoice No",
            dataIndex: "bill_no",
            render: (text, record) => {
                return(
                    <div>
                        {record?.bills?.bill_no}
                    </div>
                )
            }

        },
        {
            title: "Party/Supplier",
            dataIndex: "address",
            key: "address",
            render: (text, record) => {
                return(
                    <div>
                        {String(record?.first_name + " " + record?.last_name).toUpperCase()}
                    </div>
                )
            }
        },
        {
            title: "Due Days",
            dataIndex: "due_days", 
            render: (text, record) => {
                const dueDate = moment(record?.bills?.due_days).format("DD-MM-YYYY");
                const dueDays = isNaN(calculateDaysDifference(dueDate)) ? 0 : calculateDaysDifference(dueDate);
                return(
                    <div style={{
                        fontWeight: 600,
                        color: "red"
                    }}>
                        {dueDays}
                    </div>
                )
            }
        },
        {
            title: "Net Amount", 
            render: (text, record) => {
                let bill = record?.bills; 
                let total_amount = parseFloat(+bill?.amount || 0).toFixed(2) || 0;
                let credit_note_amount = parseFloat(+bill?.credit_note_amount || 0).toFixed(2) || 0;
                let paid_amount = parseFloat(+bill?.paid_amount || 0).toFixed(2) || 0;
                let finalAmount = total_amount - paid_amount - credit_note_amount;
                return(
                    <div>
                        {finalAmount}
                    </div>
                )
            }
        },
        {
            title: "Invoice Date", 
            render: (text, record) => {
                console.log(record);
                
                return(
                    <div>
                        {moment(record?.bills?.createdAt).format("DD-MM-YYYY")}
                    </div>
                )
            }
        }
    ];


    // Challan click handler 
    const ChallanClickHandler = (model) => {
        if (model == "yarn_receive_challans") {
            navigate("/purchase/receive/yarn-receive");
        } else if (model == "purchase_taka_challan") {
            navigate("/purchase/challan/purchase-challan");
        } else if (model == "job_taka_challan") {
            navigate("/job/challan/job-challan");
        } else {
            navigate("/job/challan/rework-challan")
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
                <div style={{ width: "100%" }}>
                    <PieCharts
                        data={charData || []}
                    />
                </div>
                <div class="dashboard-chart-card">
                    <div class="dashboard-chart-header">
                        <div class="dashboard-chart-title">Total Outstanding</div>
                        <div class="dashboard-chart-total-dues">Total Dues :<span class="dues-value"><br />
                            <span style={{ fontWeight: 400 }}>{final_net_amount}</span>
                        </span></div>
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

                            {/* 30+ due days information ` */}
                            {days_30?.length > 0 && (
                                <tr>
                                    <td class="due-days"
                                        onClick={() => {
                                            setIsModelOpen(true);
                                            setTitle(`Due bills: 30+ days`)
                                            setTableData(days_30)
                                        }}>30+</td>
                                    <td>{days_30?.length}</td>
                                    <td>{days_30?.reduce((total, element) => total + (+element?.bills?.final_net_amount || 0), 0) || 0}</td>
                                </tr>
                            )}

                            {/* 45+ due days information */}
                            {days_45?.length > 0 && (
                                <tr>
                                    <td class="due-days" onClick={() => {
                                        setIsModelOpen(true);
                                        setTitle(`Due bills: 45+ days`)
                                        setTableData(days_45)
                                    }}>45+</td>
                                    <td>{days_45?.length}</td>
                                    <td>{days_45?.reduce((total, element) => total + (+element?.bills?.final_net_amount || 0), 0) || 0}</td>
                                </tr>
                            )}

                            {/* 60+ due days information  */}
                            {days_60?.length > 0 && (
                                <tr>
                                    <td class="due-days" onClick={() => {
                                        setIsModelOpen(true);
                                        setTitle(`Due bills: 60+ days`)
                                        setTableData(days_60)
                                    }}>60+</td>
                                    <td>{days_60?.length}</td>
                                    <td>{days_60?.reduce((total, element) => total + (+element?.bills?.final_net_amount || 0), 0) || 0}</td>
                                </tr>
                            )}

                            {days_90?.length > 0 && (
                                <tr>
                                    <td class="due-days" onClick={() => {
                                        setIsModelOpen(true);
                                        setTitle(`Due bills: 90+ days`)
                                        setTableData(days_90)
                                    }}>90+</td>
                                    <td>{days_90?.length}</td>
                                    <td>{days_90?.reduce((total, element) => total + (+element?.bills?.final_net_amount || 0), 0) || 0}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* <div style={{
                    marginTop: -10
                }}>
                    
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

                </div> */}


            </div>

            <Modal
                title={title}
                open={isModelOpen}
                onCancel={() => { setIsModelOpen(false) }}
                className="view-in-house-quality-model"
                centered
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
                footer={null}
            >
                <Table
                    columns={columns}
                    dataSource={tableData}
                    pagination={false}
                />
            </Modal>
        </>
    )
}

export default DayReceivableOutStanding; 