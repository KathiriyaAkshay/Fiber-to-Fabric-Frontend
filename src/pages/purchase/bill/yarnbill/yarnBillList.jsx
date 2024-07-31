import React, { useState, useEffect } from "react";
import { Button, DatePicker, Flex, Typography, Select, Table, Spin, Space } from "antd";
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

const YarnBillList = () => {
    const { company, companyId } = useContext(GlobalContext);
    const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();
    const { data: user } = useCurrentUser();
    const navigatte = useNavigate();

    const [supplier, setSupplier] = useState();
    const debounceSupplier = useDebounce(supplier, 500);

    const [toDate, setToDate] = useState();
    const debouncedToDate = useDebounce(
        toDate && dayjs(toDate).format("YYYY-MM-DD"),
        500
    );
    const [fromDate, setFromDate] = useState();
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
                bill_to: debouncedToDate
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
                    bill_to: debouncedToDate
                }
            })
            return res?.data?.data;
        },
        enabled: Boolean(companyId)
    })

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
                return(
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
                    total_quantity = total_quantity + Number(element?.quantity_amount)
                })
                return (
                    <div>{total_quantity}</div>
                )
            }
        },
        {
            title: "Quantity Rate",
            dataIndex: "yarn_bill_details",
            render: (text, record) => {
                return (
                    <div>{text[0]?.quantity_rate}</div>
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
            dataIndex: "net_amount"
        },
        {
            title: "Amt incl. gst.",
            dataIndex: "after_TDS_amount"
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
                let due_date = record?.due_date ; 
                due_date = new Date(due_date) ; 

                let today = new Date();

                let timeDifference = due_date.getTime() - today.getTime();
                let daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24)); 
                
                if (daysDifference < 0 ){
                    daysDifference = 0 ; 
                }
                
                return(
                    <div>{daysDifference}</div>
                )
            }
        },
        {
            title: "Action",
            render: (record) => {
                return (
                    <Space>
                        <ViewYarnReceiveChallan details={record} />
                        <DeleteYarnBillButton details={record} />
                        <UpdateYarnChallanModel details={record} />
                    </Space>
                )
            }
        }
    ]

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
                                <Typography.Text>100</Typography.Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell>
                                <Typography.Text>100</Typography.Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell />
                            <Table.Summary.Cell />
                            <Table.Summary.Cell />
                            <Table.Summary.Cell>
                                <Typography.Text>100</Typography.Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell>
                                <Typography.Text>100</Typography.Text>
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
                                        { label: "paid", value: "paid" },
                                        { label: "Unpaid", value: "unpaid" }
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
                        </Flex>
                    </Flex>

                </div>
                {renderTable()}
            </div>
        </>
    )
}

export default YarnBillList; 