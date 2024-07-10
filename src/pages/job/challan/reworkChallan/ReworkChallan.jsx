import React, { useState } from 'react';
import { Table, Select, DatePicker, Button, Input, Space, Flex, Typography, Divider, Tag } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined, FileOutlined, PlusCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const { RangePicker } = DatePicker;

const ReworkChallan = () => {
    const [quality, setQuality] = useState(null);
    const [supplier, setSupplier] = useState(null);
    const [status, setStatus] = useState('Stock');
    const [dateRange, setDateRange] = useState([null, null]);
    const [searchText, setSearchText] = useState('');
    const navigate = useNavigate();

    const columns = [
        {
            title: 'No',
            dataIndex: 'no',
            key: 'no',
        },
        {
            title: 'Challan No',
            dataIndex: 'challanNo',
            key: 'challanNo',
        },
        {
            title: 'Challan Date',
            dataIndex: 'challanDate',
            key: 'challanDate',
        },
        {
            title: 'Company',
            dataIndex: 'company',
            key: 'company',
        },
        {
            title: 'Supplier Name',
            dataIndex: 'supplierName',
            key: 'supplierName',
        },
        {
            title: 'Quality',
            dataIndex: 'quality',
            key: 'quality',
        },
        {
            title: 'Total Taka',
            dataIndex: 'totalTaka',
            key: 'totalTaka',
        },
        {
            title: 'Total Meter',
            dataIndex: 'totalMeter',
            key: 'totalMeter',
        },
        {
            title: 'Total Rec. Meter',
            dataIndex: 'totalRecMeter',
            key: 'totalRecMeter',
        },
        {
            title: 'Wastage in KG.',
            dataIndex: 'wastageInKg',
            key: 'wastageInKg',
        },
        {
            title: 'Short(%)',
            dataIndex: 'shortPercentage',
            key: 'shortPercentage',
        },
        {
            title: 'Bill Status',
            dataIndex: 'billStatus',
            key: 'billStatus',
            render: billStatus => (
                <Tag color={billStatus === 'Not-Received' ? 'red' : 'green'}>
                    {billStatus}
                </Tag>
            ),
        },
        {
            title: 'Payment Status',
            dataIndex: 'paymentStatus',
            key: 'paymentStatus',
            render: paymentStatus => (
                <Tag color={paymentStatus === 'Unpaid' ? 'red' : 'green'}>
                    {paymentStatus}
                </Tag>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            width: '10%',
            render: () => (
                <Flex justify='space-evenly'>
                    <Button icon={<EyeOutlined />} />
                    <Button icon={<EditOutlined />} />
                    <Button icon={<DeleteOutlined />} />
                    <Button icon={<FileOutlined />} />
                </Flex>
            ),
        },
    ];

    const data = [
        {
            key: '1',
            no: '1',
            challanNo: '2',
            challanDate: '08-07-2024',
            company: 'SONU TEXTILES',
            supplierName: 'POWER',
            quality: '33P PALLU PATERN (SDFSDFSDFSDFSDFSD) - (8KG)',
            totalTaka: '1',
            totalMeter: '6',
            totalRecMeter: '1',
            wastageInKg: '83.33',
            shortPercentage: '83.33',
            billStatus: 'Not-Received',
            paymentStatus: 'Unpaid',
        },
    ];


    const navigateClick = () => {
        navigate("/job/challan/receive-rework-taka/add");

    }

    return (
        <div className="flex flex-col p-4">
            <div className="flex items-center justify-between gap-2">
                <Space>
                    <h3 className="m-0 text-primary">Rework Challan</h3>
                    <Button
                        onClick={navigateClick}
                        icon={<PlusCircleOutlined />}
                        type="text"
                    />
                </Space>

                <Space style={{ margin: "16px 0px" }} align='center' direction='horizontal'>
                    <Flex align="center" gap={10}>
                        <Typography.Text className="whitespace-nowrap">
                            Supplier
                        </Typography.Text>
                        <Select
                            placeholder="Select Supplier"
                            onChange={setQuality}
                            style={{ width: 200 }}
                        >
                            <Option value="quality1">Power</Option>
                        </Select>
                    </Flex>

                    <Flex align="center" gap={10}>
                        <Typography.Text className="whitespace-nowrap">
                            Machine
                        </Typography.Text>
                        <Select
                            placeholder="Select Loom"
                            onChange={setSupplier}
                            style={{ width: 200 }}
                        >
                            <Option value="supplier1">Jaquard</Option>
                        </Select>
                    </Flex>

                    <Flex align="center" gap={10}>
                        <Typography.Text className="whitespace-nowrap">
                            Quality
                        </Typography.Text>
                        <Select
                            placeholder="Select Quality"
                            onChange={setStatus}
                            style={{ width: 200 }}
                        >
                            <Option value="Stock">33L PALLU PATTERN</Option>
                        </Select>
                    </Flex>




                    <Button type="primary" icon={<FileOutlined />} />
                    <Button type="primary" icon={<SearchOutlined />} />
                </Space>
            </div>


            <Flex justify='end' align='center' className='mb-2 mt-3'>
                <Flex align="center" gap={10}>
                    <Typography.Text className="whitespace-nowrap">
                        From - to
                    </Typography.Text>
                    <RangePicker onChange={setDateRange} />
                </Flex>
                <Flex align="center" gap={10} className='ms-2'>


                    <Typography.Text className='me-2'>
                        Challan No:
                    </Typography.Text>
                    <Input
                        style={{ width: 200 }}
                    />
                </Flex>
            </Flex>
            <Table
                columns={columns}
                dataSource={data}
                pagination={{ pageSize: 25 }}
                summary={() => (
                    <Table.Summary.Row>
                        <Table.Summary.Cell index={6}>
                            <strong>Grand Total</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={0}></Table.Summary.Cell>
                        <Table.Summary.Cell index={1}></Table.Summary.Cell>
                        <Table.Summary.Cell index={2}></Table.Summary.Cell>
                        <Table.Summary.Cell index={3}></Table.Summary.Cell>
                        <Table.Summary.Cell index={4}></Table.Summary.Cell>
                        <Table.Summary.Cell index={5}></Table.Summary.Cell>
                        <Table.Summary.Cell index={7}>
                            <strong>6.00</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={8}>
                            <strong>1.00</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={9}>
                            <strong>83.33</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={10}>
                            <strong>83.33</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={11}></Table.Summary.Cell>
                        <Table.Summary.Cell index={12}></Table.Summary.Cell>
                        <Table.Summary.Cell index={13}></Table.Summary.Cell>
                    </Table.Summary.Row>
                )}
            />
        </div>
    );
};

export default ReworkChallan;
