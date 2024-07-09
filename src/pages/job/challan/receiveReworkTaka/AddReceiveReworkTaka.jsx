import React, { useContext, useEffect, useRef, useState } from 'react';
import { Table, Select, DatePicker, Button, Input, Space, Flex, Typography, Divider,Form } from 'antd';
import { DeleteOutlined, EyeOutlined, MinusCircleFilled, MinusCircleOutlined, PlusCircleOutlined, SearchOutlined } from '@ant-design/icons';

const { Option } = Select;
const { RangePicker } = DatePicker;

const EditableContext = React.createContext(null);
const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};
const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);
  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };
  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({
        ...record,
        ...values,
      });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };
  let childNode = children;
  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }
  return <td {...restProps}>{childNode}</td>;
};
  

const AddReceiveReworkTaka = () => {
    const [quality, setQuality] = useState(null);
    const [supplier, setSupplier] = useState(null);
    const [status, setStatus] = useState('Stock');
    const [dateRange, setDateRange] = useState([null, null]);
    const [searchText, setSearchText] = useState('');

    const dataSource = [
        {
            key: '1',
            takaNo: 0,
            meter: 0,
            receivedMtr: 0,
            short: 0,
            weight: 0,
            average: 0,
            tp: 0,
            pis: 0
        }
    ];

    const defaultColumns = [
        {
            title: 'Taka No.',
            dataIndex: 'takaNo',
            key: 'takaNo',
            editable:true,
        },
        {
            title: 'Meter',
            dataIndex: 'meter',
            key: 'meter',
        },
        {
            title: 'Received.Mtr',
            dataIndex: 'receivedMtr',
            key: 'receivedMtr',
            editable:true,

        },
        {
            title: 'Short %',
            dataIndex: 'short',
            key: 'short',
        },
        {
            title: 'Weight',
            dataIndex: 'weight',
            key: 'weight',
            editable:true,

        },
        {
            title: 'Average',
            dataIndex: 'average',
            key: 'average',
        },
        {
            title: 'TP',
            dataIndex: 'tp',
            key: 'tp',
            editable:true,
            render: text => <span style={{ color: 'yellow' }}>{text}</span>,
        },
        {
            title: 'PIS',
            dataIndex: 'pis',
            key: 'pis',
            editable:true,
            render: text => <span style={{ color: 'green' }}>{text}</span>,
        },
        {
            title: <div className='text-center'><MinusCircleFilled /></div>,
            key: 'action',
            render: () => <Button icon={<MinusCircleOutlined />} />,
        },
    ];


    const handleAdd = () => {
        const newData = {
          key: count,
          name: `Edward King ${count}`,
          age: '32',
          address: `London, Park Lane no. ${count}`,
        };
        setDataSource([...dataSource, newData]);
        setCount(count + 1);
      };
      const handleSave = (row) => {
        const newData = [...dataSource];
        const index = newData.findIndex((item) => row.key === item.key);
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        setDataSource(newData);
      };
      const components = {
        body: {
          row: EditableRow,
          cell: EditableCell,
        },
      };
      const columns = defaultColumns.map((col) => {
        if (!col.editable) {
          return col;
        }
        return {
          ...col,
          onCell: (record) => ({
            record,
            editable: col.editable,
            dataIndex: col.dataIndex,
            title: col.title,
            handleSave,
          }),
        };
      });

    return (
        <div className="flex flex-col p-4">
            <div className="flex items-center justify-between gap-2">
                <Space>
                    <h3 className="m-0 text-primary">Add Receive Rework Taka</h3>
                </Space>


            </div>


            <Flex justify='space-between' align='start' className='mb-2 mt-3'>

                <Space>

                    <Flex align="center" gap={10}>
                        <Typography.Text className="whitespace-nowrap">
                            Machine
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
                            Looms
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

                </Space>

                <Space>
                    <Button type="primary">Submit</Button>
                    <Button type="primary" danger>Back</Button>
                </Space>


            </Flex>
            <Table
            className='mt-2'
                dataSource={dataSource}
                columns={columns}
                components={components}
                rowClassName={() => 'editable-row'}
                pagination={false}
                summary={() => (
                    <Table.Summary.Row>
                        <Table.Summary.Cell>Total</Table.Summary.Cell>
                        <Table.Summary.Cell>0</Table.Summary.Cell>
                        <Table.Summary.Cell>0</Table.Summary.Cell>
                        <Table.Summary.Cell />
                        <Table.Summary.Cell />
                        <Table.Summary.Cell />
                        <Table.Summary.Cell />
                        <Table.Summary.Cell />
                        <Table.Summary.Cell>
                        </Table.Summary.Cell>
                    </Table.Summary.Row>
                )}
            />
        </div>
    );
};

export default AddReceiveReworkTaka;
