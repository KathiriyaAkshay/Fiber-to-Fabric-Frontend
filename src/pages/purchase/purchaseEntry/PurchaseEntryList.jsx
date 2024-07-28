import { PlusCircleOutlined } from '@ant-design/icons'
import { Button, Col, DatePicker, Flex, Form, Input, Radio, Row, Select, Space, Table, Tag, Spin } from 'antd'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useContext } from 'react'
import { GlobalContext } from '../../../contexts/GlobalContext'
import { usePagination } from '../../../hooks/usePagination'
import { getGeneralPurchaseListRequest } from '../../../api/requests/purchase/purchaseSizeBeam'
import moment from 'moment';
import GeneralPurchaseInfo from '../../../components/purchase/generalPurchase/generalPurchaseInfo'
import useDebounce from '../../../hooks/useDebounce'
import dayjs from 'dayjs';
import { getDropdownSupplierListRequest } from '../../../api/requests/users'
import { useMemo } from 'react'
import DeleteGeneralPurchaseButton from '../../../components/purchase/generalPurchase/DeleteGeneralPurchase'
import PaidGeneralPurchaseInfo from '../../../components/purchase/generalPurchase/paidGeneralPurchaseInfo'

const PurchaseEntryList = () => {
    const { companyId, financialYearEnd } = useContext(GlobalContext);
    const navigation = useNavigate();
    const [ProdFilter, setProdFilter] = useState('Current Year');
    const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

    const [isPaid, setIsPaid] = useState("");
    const debouncePaid = useDebounce(isPaid, 500);

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

    const [supplier, setSupplier] = useState();
    const [supplierCompany, setSupplierCompany] = useState();
    const debouncedSupplier = useDebounce(supplier, 500);
    const debouncedSupplierCompany = useDebounce(supplierCompany, 500);

    const formItemLayout = {
        labelAlign: "left",
        labelCol: { span: 20 },
        wrapperCol: { span: 20 }
    };

    const disableFutureDates = (current) => {
        return current && current > moment().endOf('day');
    };

    const {
        data: generalPurchaseList,
        isLoading: isLoadingGeneralPurchaseList,
    } = useQuery({
        queryKey: [
            "purchase/generalPurchase/list",
            {
                company_id: companyId,
                page,
                pageSize,
                // search: debouncedSearch,
                to_date: debouncedToDate,
                from_date: debouncedFromDate,
                end: financialYearEnd,
                is_paid: debouncePaid, 
                supplier_id: debouncedSupplierCompany
            },
        ],
        queryFn: async () => {
            const res = await getGeneralPurchaseListRequest({
                companyId,
                params: {
                    company_id: companyId,
                    page,
                    pageSize,
                    //   search: debouncedSearch,
                    to_date: debouncedToDate,
                    from_date: debouncedFromDate,
                    end: financialYearEnd,
                    is_paid: debouncePaid,
                    supplier_id: debouncedSupplierCompany
                },
            });
            return res.data?.data;
        },
        enabled: Boolean(companyId),
    });

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

    const dropDownSupplierCompanyOption = useMemo(() => {
        if (
            debouncedSupplier &&
            dropdownSupplierListRes &&
            dropdownSupplierListRes.length
        ) {
            const obj = dropdownSupplierListRes.filter((item) => {
                return item.supplier_name === debouncedSupplier;
            })[0];

            return obj?.supplier_company?.map((item) => {
                return { label: item.supplier_company, value: item.supplier_id };
            });
        } else {
            return [];
        }
    }, [debouncedSupplier, dropdownSupplierListRes]);

    const columns = [
        {
            title: 'No.',
            dataIndex: 'no',
            key: 'no',
            render: (text, record, index) => ((page * pageSize) + index) + 1
        },
        {
            title: 'Invoice Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text, record) => (
                moment(text).format("DD-MM-YYYY")
            )
        },
        {
            title: 'Invoice No',
            dataIndex: 'invoice_no',
            key: 'invoice_no',
        },
        {
            title: 'Haed',
            dataIndex: 'head',
            key: 'head',
        },
        {
            title: 'Supplier Name',
            dataIndex: ["supplier", "supplier_name"],
            // key: ["supplier", "supplier_name"],
        },
        {
            title: 'Supplier Company',
            dataIndex: ["supplier",'supplier_company'],
            key: 'supplier_company',
        },
        {
            title: 'Remark',
            dataIndex: 'remark',
            key: 'remark',
        },
        {
            title: 'Grand Total',
            dataIndex: 'grand_total',
            key: 'grand_total',
        },
        {
            title: 'Due Date',
            dataIndex: 'due_date',
            key: 'due_date',
            render: (text, record) => (
                moment(text).format("DD-MM-YYYY")
            )
        },
        // {
        //     title: 'Billing Days',
        //     dataIndex: 'billing_days',
        //     key: 'billing_days',
        // },
        {
            title: "Status",
            dataIndex: 'is_paid',
            key: 'is_paid',
            render: (text, record) => {
                return text === true ? (
                    <Tag color="green">Paid</Tag>
                ) : (
                    <Tag color="red">Un-paid</Tag>
                )
            }
        },
        {
            title: "Action",
            dataIndex: 'action',
            key: 'action',
            render: (text, record) => {
                return (
                    <Space>
                        <GeneralPurchaseInfo details={record} />
                        <DeleteGeneralPurchaseButton details={record} />
                        <PaidGeneralPurchaseInfo details={record} />
                    </Space>
                )
            }
        },

    ];

    function renderTable() {
        if (isLoadingGeneralPurchaseList) {
            return (
                <Spin tip="Loading" size="large">
                    <div className="p-14" />
                </Spin>
            );
        }

        return (
            <Table
                dataSource={generalPurchaseList?.rows || []}
                columns={columns}
                rowKey={"id"}
                pagination={{
                    total: 0,
                    showSizeChanger: true,
                    onShowSizeChange: onShowSizeChange,
                    onChange: onPageChange,
                }}
                summary={(tableData) => {
                    let totalPendingTaka = 0;
                    let totalDeliveredTaka = 0;
                    let totalPendingMeter = 0;
                    let totalDeliveredMeter = 0;


                    return (
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0}>
                                <b>Total</b>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={0}><b></b></Table.Summary.Cell>
                            <Table.Summary.Cell index={0}><b></b></Table.Summary.Cell>
                            <Table.Summary.Cell index={0}><b></b></Table.Summary.Cell>
                            <Table.Summary.Cell index={0}><b></b></Table.Summary.Cell>
                            <Table.Summary.Cell index={0}><b></b></Table.Summary.Cell>
                            <Table.Summary.Cell index={0}><b></b></Table.Summary.Cell>
                            <Table.Summary.Cell index={0}><b>0</b></Table.Summary.Cell>
                            <Table.Summary.Cell index={0}><b></b></Table.Summary.Cell>
                            <Table.Summary.Cell index={0}><b></b></Table.Summary.Cell>
                            <Table.Summary.Cell index={0}><b></b></Table.Summary.Cell>
                        </Table.Summary.Row>
                    );
                }}

            />
        );
    }

    return (
        <div className="flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between gap-5 mx-3 mb-3">
                <div className="flex items-center gap-2">
                    <h3 className="m-0 text-primary">General Purchase Entry List</h3>
                    <Button
                        onClick={() => { navigation("/purchase/general-purchase-entry/add") }}
                        icon={<PlusCircleOutlined />}
                        type="text"
                    />
                </div>

            </div>
            <div>
                <Row className='w-100' justify={"start"} gutter={24}>

                    <Col span={4}>
                        <Form.Item label="Supplier" {...formItemLayout}>
                            <Select
                                allowClear
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
                                className="min-w-40"
                            />
                        </Form.Item>
                    </Col>


                    <Col span={4}>
                        <Form.Item label="Supplier Company" {...formItemLayout}>
                            <Select
                                allowClear
                                placeholder="Select Company"
                                options={dropDownSupplierCompanyOption}
                                dropdownStyle={{
                                    textTransform: "capitalize",
                                }}
                                value={supplierCompany}
                                onChange={setSupplierCompany}
                                style={{
                                    textTransform: "capitalize",
                                }}
                                className="min-w-40"
                            />
                        </Form.Item>
                    </Col>


                    <Col span={4}>
                        <Form.Item label="From" {...formItemLayout}>
                            <DatePicker
                                value={fromDate}
                                onChange={setFromDate}
                                disabledDate = {disableFutureDates}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={4}>
                        <Form.Item label="To" {...formItemLayout}>
                            <DatePicker
                                value={toDate}
                                onChange={setToDate}
                                disabledDate = {disableFutureDates}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={4}>
                        <Form.Item label="Status" {...formItemLayout}>
                            <Select
                                placeholder="Select payment "
                                style={{
                                    width: "100%",
                                }}
                                value={isPaid}
                                onChange={setIsPaid}
                                options={[
                                    {
                                        value: 1,
                                        label: 'Paid',
                                    },
                                    {
                                        value: 0,
                                        label: 'Unpaid',
                                    }

                                ]}
                            />
                        </Form.Item>

                    </Col>



                </Row>

                {/* <Row style={{ width: "100%" }} className='w-100' justify={"start"}>

                    <Col span={24}>
                        <Flex justify='flex-end' className='gap-1'>
                            <Form.Item>
                                <Button type="primary" icon={<SearchOutlined />} />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" icon={<FileZipOutlined />} />
                            </Form.Item>
                        </Flex>

                    </Col>
                </Row> */}
            </div>

            {renderTable()}

        </div>
    )
}

export default PurchaseEntryList