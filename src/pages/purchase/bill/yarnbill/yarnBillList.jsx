import React, { useState } from "react";
import { Button, DatePicker, Typography, Select, Table, Spin, Space, Flex } from "antd";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usePagination } from "../../../../hooks/usePagination";
import { useContext } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { useCurrentUser } from "../../../../api/hooks/auth";
import { getDropdownSupplierListRequest } from "../../../../api/requests/users";
import { getYarnBillListRequest } from "../../../../api/requests/purchase/purchaseTaka";
import moment from "moment";
import ViewYarnReceiveChallan from "../../../../components/purchase/receive/yarnReceive/ViewYarnReceiveChallanModal";
import DeleteYarnBillButton from "../../../../components/purchase/receive/yarnReceive/DeleteYarnBillButton";
import useDebounce from "../../../../hooks/useDebounce";
import dayjs from "dayjs";
import UpdateYarnChallanModel from "../../../../components/purchase/receive/yarnReceive/updateYarnChallanModel";
import { currentMonthStartDateEndDate } from "../../../../utils/date";
import { FilePdfOutlined, PlusCircleFilled } from "@ant-design/icons";

const YarnBillList = () => {
    const [startDate, endDate] = currentMonthStartDateEndDate() ; 
    const { company, companyId } = useContext(GlobalContext);
    const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

    const [supplier, setSupplier] = useState();
    const debounceSupplier = useDebounce(supplier, 500);

    const [toDate, setToDate] = useState(dayjs(endDate));
    const debouncedToDate = useDebounce(
        toDate && dayjs(toDate).format("YYYY-MM-DD"),
        500
    );
    const [fromDate, setFromDate] = useState(dayjs(startDate));
    const debouncedFromDate = useDebounce(
        fromDate && dayjs(fromDate).format("YYYY-MM-DD"),
        500
    );

    const [status, setStatus] = useState();
    const debounceStatus = useDebounce(status, 600);

    const {
        data: dropdownSupplierListRes,
        isLoading: isLoadingDropdownSupplierList,
    } = useQuery({
        queryKey: ["dropdown/supplier/list", { company_id: companyId }],
        queryFn: async () => {
            const res = await getDropdownSupplierListRequest({
                params: { company_id: companyId },
            });
            return res.data?.data?.supplierList;
        },
        enabled: Boolean(companyId),
    });

    const { data: yarnBillData, isLoading } = useQuery({
        queryKey: [
            "yarn/bill/list",
            {
                company_id: companyId,
                page,
                pageSize,
                supplier_company: debounceSupplier,
                bill_from: debouncedFromDate,
                bill_to: debouncedToDate, 
                is_paid: debounceStatus
            }
        ],
        queryFn: async () => {
            const res = await getYarnBillListRequest({
                params: {
                    company_id: companyId,
                    page,
                    pageSize,
                    supplier_company: debounceSupplier,
                    bill_from: debouncedFromDate,
                    bill_to: debouncedToDate, 
                    is_paid: debounceStatus
                }
            })
            return res?.data?.data;
        },
        enabled: Boolean(companyId)
    })

    const CalculateRateGst = (rate, net_amount, quantity) => {
        let rate_include_gst = Number(rate) + Number(Number(net_amount) / Number(quantity)) ; 
        rate_include_gst = Number(rate_include_gst).toFixed(2) ; 
        return rate_include_gst ; 
    }

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            render: (text, record, index) => ((page * pageSize) + index) + 1
        },
        {
            title: "Bill Date",
            dataIndex: "bill_date",
            render: (text, record) => (
                moment(text).format("DD-MM-YYYY")
            )
        },
        {
            title: "Bill No",
            dataIndex: "invoice_no"
        },
        {
            title: "Supplier name",
            dataIndex: ["supplier", "supplier", "supplier_name"]
        },
        {
            title: "Supplier Company",
            dataIndex: ["supplier", "supplier", "supplier_company"]
        },
        {
            title: "Yarn Company",
            dataIndex: ["yarn_stock_company", "yarn_company_name"]
        },
        {
            title: "Yarn dennier",
            dataIndex: ["yarn_stock_company"],
            render: (text, record) => {
                return (
                    <div>
                        {`${text?.yarn_count}C/${text?.filament}F(${text?.yarn_type}(${text?.yarn_Sub_type})-${text?.luster_type}-${text?.yarn_color})`}
                    </div>
                )
            }
        },
        {
            title: "Quantity KG",
            dataIndex: "yarn_bill_details",
            render: (text, record) => {
                let total_quantity = 0;
                text?.map((element) => {
                    total_quantity = total_quantity + Number(element?.yarn_receive_challan?.receive_quantity)
                })
                return (
                    <div>{total_quantity}</div>
                )
            }
        },
        {
            title: "Rate incl. gst",
            dataIndex: "yarn_bill_details",
            render: (text, record) => {
                let total_quantity = 0;
                record?.yarn_bill_details?.map((element) => {
                    total_quantity = total_quantity + Number(element?.quantity_amount)
                })
                return (
                    <div>
                        {CalculateRateGst(record?.yarn_order?.rate, record?.net_amount, total_quantity)}
                    </div>
                )
            }
        },
        {
            title: "SGST",
            dataIndex: "SGST_amount"
        },
        {
            title: "CGST",
            dataIndex: "CGST_amount"
        },
        {
            title: "IGST",
            dataIndex: "IGST_amount"
        },
        {
            title: "Total Amount",
            dataIndex: "discount_brokerage_amount"
        },
        {
            title: "Amt incl. gst.",
            dataIndex: "net_amount"
        },
        {
            title: "Due Date",
            dataIndex: "due_date",
            render: (text, record) => (
                moment(text).format("MM-DD-YYYY")
            )
        },
        {
            title: "Due Days",
            dataIndex: "",
            render: (text, record) => {
                let due_date = record?.due_date;
                due_date = new Date(due_date);

                let today = new Date();

                let timeDifference = due_date.getTime() - today.getTime();
                let daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));

                if (daysDifference < 0) {
                    daysDifference = 0;
                }

                return (
                    <div>{daysDifference}</div>
                )
            }
        },
        {
            title: "Action",
            render: (record) => {
                return (
                    <Space>
                        <ViewYarnReceiveChallan details={record}/>
                        <DeleteYarnBillButton details={record} />
                        <UpdateYarnChallanModel details={record} />
                    </Space>
                )
            }
        }
    ]

    const PDFDownload = () => {
        const tableTitle = [
            "No", 
            "Bill Date", 
            "Bill No", 
            "Supplier Name", 
            "Supplier Company", 
            "Yarn Company", 
            "Dennier", 
            "Quantity-KG", 
            "Net Amount", 
            "Amount", 
            "Due Date"
        ] ; 

        const temp = [] ; 

        yarnBillData?.row?.map((element, index) => {
            let total_quantity = 0 ; 
            element?.yarn_bill_details?.map((data) => {
                total_quantity = total_quantity + Number(data?.quantity_amount)
            }) ; 
            
            temp.push([
                index + 1, 
                moment(element?.bill_date).format("DD-MM-YYYY"), 
                element?.invoice_no, 
                element?.supplier?.supplier?.supplier_name,
                element?.supplier?.supplier?.supplier_company,
                element?.yarn_stock_company?.yarn_company_name, 
                `${element?.yarn_stock_company?.yarn_count}C/${element?.yarn_stock_company?.filament}F(${element?.yarn_stock_company?.yarn_type}(${element?.yarn_stock_company?.yarn_Sub_type})-${element?.yarn_stock_company?.luster_type}-${element?.yarn_stock_company?.yarn_color})`,
                total_quantity,
                element?.freight_amount, 
                element?.net_amount, 
                moment(element?.due_date).format("DD-MM-YYYY")
            ])
        }); 

        let total = [
            "", 
            "",
            "", 
            "",
            "",
            "",
            "", 
            yarnBillData?.totalQuantity, 
            yarnBillData?.amount_include_gst, 
            yarnBillData?.total_amount, 
            "" 
        ]


        localStorage.setItem("print-title", "Yarn Bill List") ; 
        localStorage.setItem("print-head", JSON.stringify(tableTitle)) ; 
        localStorage.setItem("print-array", JSON.stringify(temp)) ; 
        localStorage.setItem("total-count", "1") ; 
        localStorage.setItem("total-data", JSON.stringify(total)) ; 

        window.open("/print") ; 

    }

    const [summaryLoading, setSummaryLoading] = useState(false) ; 
    const SummaryGeneration = async () => {
        setSummaryLoading(true) ; 
        const res = await getYarnBillListRequest({
            params: {
                company_id: companyId,
                page,
                pageSize: 9999,
                bill_from: dayjs(startDate).format("YYYY-MM-DD"),
                bill_to: dayjs(toDate).format('YYYY-MM-DD'), 
            }
        });
        
        let temp_company = [] ; 
        let temp_data = {} ; 

        res?.data?.data?.row?.map((element) => {
            let supplier_company = element?.supplier?.supplier?.supplier_company ; 
            
            if (temp_company.includes(supplier_company)){

            }   else {
                let total_weight = 0 ; 
                element?.yarn_bill_details?.map((data) => {
                    total_weight = total_weight + Number(data?.yarn_receive_challan?.receive_quantity)
                }); 

                console.log("Total weight", total_weight);

                temp_company.push(supplier_company) ; 
                temp_data[supplier_company] = {
                    "weight": total_weight , 
                    "amount": element?.discount_brokerage_amount, 
                    "cgst": element?.CGST_amount, 
                    "sgst": element?.SGST_amount, 
                    "igst": element?.IGST_amount, 
                    "net_amount": element?.net_amount
                }
            }
        }); 

        setSummaryLoading(false) ; 

        let title = [
            "PARTY", 
            "WEIGHT", 
            "AMT", 
            "CGST", 
            "SGST", 
            "IGST", 
            "NET_AMT"
        ] ; 

        localStorage.setItem("print-title", "Purchase Bill Report") ;
        localStorage.setItem("print-head", JSON.stringify(title)) ;  

        let temp = [] ; 
        let total_weight = 0 ; 
        let total_sgst = 0 ; 
        let total_csgt = 0 ; 
        let total_igst = 0 ; 
        let total_net_amount = 0 ; 
        let total_amount = 0 ; 

        Object.entries(temp_data).forEach(([key, value]) => {
            total_weight = total_weight + Number(value["weight"]) ; 
            total_amount = total_amount + Number(value["amount"]) ; 
            total_csgt = total_csgt + Number(value["cgst"]) ; 
            total_sgst = total_sgst + Number(value["sgst"]) ; 
            total_igst = total_igst + Number(value["igst"]) ; 
            total_net_amount = total_net_amount + Number(value["net_amount"]) ; 
            temp.push([
                key, 
                value["weight"], 
                value["amount"], 
                value["cgst"], 
                value["sgst"], 
                value["igst"], 
                value["net_amount"]
            ]); 
        });

        localStorage.setItem("print-array", JSON.stringify(temp)) ; 
        localStorage.setItem("total-count", "1") ; 

        let total = [
            "", 
            total_weight, 
            total_amount, 
            total_csgt, 
            total_sgst, 
            total_igst, 
            total_net_amount
        ]

        localStorage.setItem("total-data", JSON.stringify(total)) ;
        
        window.open("/print") ; 
    }



    function renderTable() {
        if (isLoading) {
            return (
                <Spin tip="Loading" size="large">
                    <div className="p-14" />
                </Spin>
            );
        }

        return (
            <Table
                dataSource={yarnBillData?.row || []}
                columns={columns}
                rowKey={"id"}
                pagination={{
                    total: yarnBillData?.count || 0,
                    showSizeChanger: true,
                    onShowSizeChange: onShowSizeChange,
                    onChange: onPageChange,
                }}
                summary={(pageData) => {
                    if (!yarnBillData?.row?.length) return ; 
                    const {
                        totalQuantity,
                        total_amount, 
                        total_quality_rate, 
                        amount_include_gst
                    } = yarnBillData ; 

                    return (
                        <Table.Summary.Row className="font-semibold">
                            <Table.Summary.Cell>Total</Table.Summary.Cell>
                            
                            <Table.Summary.Cell />
                            <Table.Summary.Cell />
                            <Table.Summary.Cell />
                            <Table.Summary.Cell />
                            <Table.Summary.Cell />
                            <Table.Summary.Cell />
                            <Table.Summary.Cell>
                                <Typography.Text>{totalQuantity}</Typography.Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell>
                                <Typography.Text></Typography.Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell />
                            <Table.Summary.Cell />
                            <Table.Summary.Cell />
                            <Table.Summary.Cell>
                                <Typography.Text>{amount_include_gst}</Typography.Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell>
                                <Typography.Text>{total_amount}</Typography.Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell />
                            <Table.Summary.Cell />
                            <Table.Summary.Cell />
                        </Table.Summary.Row>
                    )
                }}
            />
        )
    }

    return (
        <>
            <div className="flex flex-col p-4">
                <div className="flex items-center justify-between gap-5 mx-3 mb-3">
                    <div className="flex items-center gap-2">
                        <h3 className="m-0 text-primary">Yarn Bill List </h3>

                        <Flex style={{marginLeft: "10px"}} gap={"10px"}>
                            <Button type="primary" icon= {<PlusCircleFilled/>}>
                                Advance Bill payment
                            </Button>
                            <Button onClick={SummaryGeneration} type="primary" loading = {summaryLoading}>
                                SUMMARY
                            </Button>
                        </Flex>
                    
                    </div>
                    <Flex align="center" gap={10}>
                        <Flex align="center" gap={10}>
                            <Flex align="center" gap={10}>
                                <Typography.Text className="whitespace-nowrap">
                                    payment status
                                </Typography.Text>
                                <Select
                                    placeholder="Payment status"
                                    options={[
                                        { label: "paid", value: "true" },
                                        { label: "Unpaid", value: "false" }
                                    ]}
                                    dropdownStyle={{
                                        textTransform: "capitalize",
                                    }}
                                    value={status}
                                    onChange={setStatus}
                                    style={{
                                        textTransform: "capitalize",
                                    }}
                                    allowClear
                                    className="min-w-40"
                                />
                            </Flex>

                            <Flex align="center" gap={10}>
                                <Typography.Text className="whitespace-nowrap">
                                    Supplier
                                </Typography.Text>
                                <Select
                                    placeholder="Select supplier"
                                    loading={isLoadingDropdownSupplierList}
                                    options={dropdownSupplierListRes?.map((supervisor) => ({
                                        label: supervisor?.supplier_name,
                                        value: supervisor?.supplier_name,
                                    }))}
                                    dropdownStyle={{
                                        textTransform: "capitalize",
                                    }}
                                    value={supplier}
                                    onChange={setSupplier}
                                    style={{
                                        textTransform: "capitalize",
                                    }}
                                    allowClear
                                    className="min-w-40"
                                />
                            </Flex>

                            <Flex align="center" gap={10}>
                                <Typography.Text className="whitespace-nowrap">
                                    From
                                </Typography.Text>
                                <DatePicker
                                    allowClear={true}
                                    style={{
                                        width: "200px",
                                    }}
                                    format="YYYY-MM-DD"
                                    value={fromDate}
                                    onChange={setFromDate}
                                />
                            </Flex>

                            <Flex align="center" gap={10}>
                                <Typography.Text className="whitespace-nowrap">To</Typography.Text>
                                <DatePicker
                                    allowClear={true}
                                    style={{
                                        width: "200px",
                                    }}
                                    format="YYYY-MM-DD"
                                    value={toDate}
                                    onChange={setToDate}
                                />
                            </Flex>

                            <Button
                                icon = {<FilePdfOutlined/>}
                                type="primary"
                                disabled = {!yarnBillData?.row?.length}
                                onClick={PDFDownload}
                            />
                        </Flex>
                    </Flex>

                </div>
                {renderTable()}
            </div>
        </>
    )
}

export default YarnBillList; 