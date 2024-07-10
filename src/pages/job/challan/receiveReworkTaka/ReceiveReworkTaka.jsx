import React, { useState } from 'react';
import { Table, Select, DatePicker, Button, Input, Space, Flex, Typography, Divider } from 'antd';
import { DeleteOutlined, EyeOutlined, PlusCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const { RangePicker } = DatePicker;

const ReceiveReworkTaka = () => {
    const [quality, setQuality] = useState(null);
    const [supplier, setSupplier] = useState(null);
    const [status, setStatus] = useState('Stock');
    const [dateRange, setDateRange] = useState([null, null]);
    const [searchText, setSearchText] = useState('');
    const navigate = useNavigate();


    const columns = [
        { title: 'No', dataIndex: 'no', key: 'no' },
        { title: 'Taka No', dataIndex: 'takaNo', key: 'takaNo' },
        { title: 'Total Meter', dataIndex: 'totalMeter', key: 'totalMeter' },
        { title: 'Total Rec. Meter', dataIndex: 'totalRecMeter', key: 'totalRecMeter' },
        { title: 'Total Rec. Weight', dataIndex: 'totalRecWeight', key: 'totalRecWeight' },
        { title: 'Short(%)', dataIndex: 'short', key: 'short' },
        { title: 'Wastage', dataIndex: 'wastage', key: 'wastage' },
        { title: 'Quality', dataIndex: 'quality', key: 'quality' },
        { title: 'Supplier Name', dataIndex: 'supplierName', key: 'supplierName' },
        { title: 'Company', dataIndex: 'company', key: 'company' },
        {
            title: 'Action', dataIndex: 'action', key: 'action', render: () => (
                <Space>
                    <Button type="primary" icon={<EyeOutlined />} />
                    <Button type="danger" icon={<DeleteOutlined />} />
                </Space>
            )
        }
    ];

    const data = [
        {
            key: '1',
            no: 1,
            takaNo: 28,
            totalMeter: 12,
            totalRecMeter: 10,
            totalRecWeight: 11,
            short: 16.67,
            wastage: 18.33,
            quality: '33P PALLU PATTERN (SDFSDFSDFSDFSDFSD) - (8KG)',
            supplierName: 'KEYUR VAGHASIYA',
            company: 'SONU TEXTILES',
            action: '',
        }
    ];

    const navigateClick=()=>{
        navigate("/job/challan/receive-rework-taka/add");

    }

    return (
        <div className="flex flex-col p-4">
            <div className="flex items-center justify-between gap-2">
                <Space>
                <h3 className="m-0 text-primary">Receive Rework Taka</h3>
                <Button
                    onClick={navigateClick}
                    icon={<PlusCircleOutlined />}
                    type="text"
                />
                </Space>
                
                <Space style={{ margin: "16px 0px", width: "75%" }} align='center' direction='horizontal'>
                    <Flex align="center" gap={10}>
                        <Typography.Text className="whitespace-nowrap">
                            Quality
                        </Typography.Text>
                        <Select
                            placeholder="Select quality"
                            onChange={setQuality}
                            style={{ width: 200 }}
                        >
                            <Option value="quality1">Quality 1</Option>
                            <Option value="quality2">Quality 2</Option>
                        </Select>
                    </Flex>

                    <Flex align="center" gap={10}>
                        <Typography.Text className="whitespace-nowrap">
                            Supplier
                        </Typography.Text>
                        <Select
                            placeholder="Select supplier"
                            onChange={setSupplier}
                            style={{ width: 200 }}
                        >
                            <Option value="supplier1">Supplier 1</Option>
                            <Option value="supplier2">Supplier 2</Option>
                        </Select>
                    </Flex>

                    <Flex align="center" gap={10}>
                        <Typography.Text className="whitespace-nowrap">
                            Status
                        </Typography.Text>
                        <Select
                            defaultValue="Stock"
                            onChange={setStatus}
                            style={{ width: 200 }}
                        >
                            <Option value="Stock">Stock</Option>
                            <Option value="Other">Other</Option>
                        </Select>
                    </Flex>


                    <Flex align="center" gap={10}>
                        <Typography.Text className="whitespace-nowrap">
                            From - to
                        </Typography.Text>
                        <RangePicker onChange={setDateRange} />
                    </Flex>

                    <Button type="primary" icon={<SearchOutlined />} />
                </Space>
            </div>


            <Flex justify='end' align='center' className='mb-2 mt-3'>
                <Typography.Text className='me-2'>
                    Search:
                </Typography.Text>
                <Input
                    placeholder="Search"
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    style={{ width: 200 }}
                />
            </Flex>
            <Table
                columns={columns}
                dataSource={data}
                pagination={{ pageSize: 25 }}
            />
        </div>
    );
};

export default ReceiveReworkTaka;
