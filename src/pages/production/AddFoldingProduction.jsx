import { useState } from "react";
import {
  Button,
  Radio,
  Form,
  Input,
  Select,
  Row,
  Col,
  DatePicker,
  Checkbox,
  Flex,
  Popconfirm,
  Space,
  Table,
} from "antd";

const { Option } = Select;

import { ArrowLeftOutlined, EyeOutlined } from "@ant-design/icons";

import { disabledFutureDate } from "../../utils/date";
import dayjs from "dayjs";

const AddFoldingProduction = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState([
    {
      key: "1",
      date: "2024-11-25",
      columns: [
        { dayMeter: false, nightMeter: false },
        { dayMeter: false, nightMeter: false },
        { dayMeter: false, nightMeter: false },
        { dayMeter: false, nightMeter: false },
        { dayMeter: false, nightMeter: false },
      ],
    },
    {
      key: "2",
      date: "2024-11-26",
      columns: [
        { dayMeter: false, nightMeter: false },
        { dayMeter: false, nightMeter: false },
        { dayMeter: false, nightMeter: false },
        { dayMeter: false, nightMeter: false },
        { dayMeter: false, nightMeter: false },
      ],
    },
    {
      key: "3",
      date: "2024-11-27",
      columns: [
        { dayMeter: false, nightMeter: false },
        { dayMeter: false, nightMeter: false },
        { dayMeter: false, nightMeter: false },
        { dayMeter: false, nightMeter: false },
        { dayMeter: false, nightMeter: false },
      ],
    },
  ]);

  // Handle row deletion
  const handleDelete = (key) => {
    setData(data.filter((item) => item.key !== key));
  };

  // Handle date change
  const handleDateChange = (date, dateString, recordKey) => {
    const newData = [...data];
    const record = newData.find((item) => item.key === recordKey);
    if (record) {
      record.date = dateString;
      setData(newData);
    }
  };

  // Toggle button selection
  const handleToggle = (recordKey, columnIndex, type) => {
    const newData = [...data];
    const record = newData.find((item) => item.key === recordKey);
    if (record) {
      record.columns[columnIndex][type] = !record.columns[columnIndex][type];
      setData(newData);
    }
  };

  // Columns for the table
  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (text, record) => (
        <DatePicker
        // value={text ? text : null}
        // onChange={(date, dateString) =>
        //   handleDateChange(date, dateString, record.key)
        // }
        />
      ),
    },
    ...[1, 2, 3,4,5].map((col, index) => ({
      title: `Column ${col}`,
      dataIndex: `columns`,
      key: `column-${col}`,
      render: (_, record) => (
        <Space>
          <Button
            type={record.columns[index].dayMeter ? "primary" : "default"}
            onClick={() => handleToggle(record.key, index, "dayMeter")}
          >
            Day Meter
          </Button>
          <Button
            type={record.columns[index].nightMeter ? "primary" : "default"}
            onClick={() => handleToggle(record.key, index, "nightMeter")}
          >
            Night Meter
          </Button>
        </Space>
      ),
    })),
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Popconfirm
          title="Are you sure to delete this row?"
          onConfirm={() => handleDelete(record.key)}
        >
          <Button danger>Delete</Button>
        </Popconfirm>
      ),
    },
  ];

  const components = {
    body: {
      wrapper: (props) => (
        <>
          {/* Extra First Row */}
          <tr style={{ backgroundColor: "#f6f6f6", fontWeight: "bold" }}>
            <td>
              <Space size="large">
                <span>Date</span>
              </Space>
            </td>
            <td>
              <Space size="large">
                <Select
                  placeholder="Select Employee"
                  // loading={isLoadingMachineList}
                  // options={machineListRes?.rows?.map((machine) => ({
                  //   label: machine?.machine_name,
                  //   value: machine?.machine_name,
                  // }))}
                  style={{
                    textTransform: "capitalize",
                  }}
                  dropdownStyle={{
                    textTransform: "capitalize",
                  }}
                  // onChange={(value) => {
                  //   field.onChange(value);
                  //   resetField("quality_id");
                  // }}
                />
                <Button icon={<EyeOutlined className="cursor-pointer" />}/>
              </Space>
            </td>

            <td>
              <Space size="large">
                <Select
                  placeholder="Select Employee"
                  // loading={isLoadingMachineList}
                  // options={machineListRes?.rows?.map((machine) => ({
                  //   label: machine?.machine_name,
                  //   value: machine?.machine_name,
                  // }))}
                  style={{
                    textTransform: "capitalize",
                  }}
                  dropdownStyle={{
                    textTransform: "capitalize",
                  }}
                  // onChange={(value) => {
                  //   field.onChange(value);
                  //   resetField("quality_id");
                  // }}
                />
                <Button icon={<EyeOutlined className="cursor-pointer" />}/>
                </Space>
            </td>

            <td>
              <Space size="large">
                <Select
                  placeholder="Select Employee"
                  // loading={isLoadingMachineList}
                  // options={machineListRes?.rows?.map((machine) => ({
                  //   label: machine?.machine_name,
                  //   value: machine?.machine_name,
                  // }))}
                  style={{
                    textTransform: "capitalize",
                  }}
                  dropdownStyle={{
                    textTransform: "capitalize",
                  }}
                  // onChange={(value) => {
                  //   field.onChange(value);
                  //   resetField("qua  lity_id");
                  // }}
                />
                <Button icon={<EyeOutlined className="cursor-pointer" />}/>
                </Space>
            </td>
            <td>
              <Space size="large">
                <Select
                  placeholder="Select Employee"
                  // loading={isLoadingMachineList}
                  // options={machineListRes?.rows?.map((machine) => ({
                  //   label: machine?.machine_name,
                  //   value: machine?.machine_name,
                  // }))}
                  style={{
                    textTransform: "capitalize",
                  }}
                  dropdownStyle={{
                    textTransform: "capitalize",
                  }}
                  // onChange={(value) => {
                  //   field.onChange(value);
                  //   resetField("qua  lity_id");
                  // }}
                />
                <Button icon={<EyeOutlined className="cursor-pointer" />}/>
                </Space>
            </td>
            <td>
              <Space size="large">
                <Select
                  placeholder="Select Employee"
                  // loading={isLoadingMachineList}
                  // options={machineListRes?.rows?.map((machine) => ({
                  //   label: machine?.machine_name,
                  //   value: machine?.machine_name,
                  // }))}
                  style={{
                    textTransform: "capitalize",
                  }}
                  dropdownStyle={{
                    textTransform: "capitalize",
                  }}
                  // onChange={(value) => {
                  //   field.onChange(value);
                  //   resetField("qua  lity_id");
                  // }}
                />
                <Button icon={<EyeOutlined className="cursor-pointer" />}/>
                </Space>
            </td>
            <td>
              <Space size="large">Actions</Space>
            </td>
          </tr>
          {/* Render default rows */}
          {props.children}
        </>
      ),
    },
  };
    // Add a custom footer for totals
    const footer = () => (
      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
        <span>Total</span>
        <span>{totals.takaNo || 0}</span>
        <span>{totals.employee1 || 0}</span>
        <span>{totals.employee2 || 0}</span>
        <span>{totals.test || 0}</span>
      </div>
    );

  const addRow = () => {
    console.log("ejrer")
    const newKey = (data.length + 1).toString();
    const newRow = {
      key: newKey,
      date: dayjs().format("YYYY-MM-DD"), // Default date
      columns: [
        { dayMeter: false, nightMeter: false },
        { dayMeter: false, nightMeter: false },
        { dayMeter: false, nightMeter: false },
        { dayMeter: false, nightMeter: false },
        { dayMeter: false, nightMeter: false },
      ],
    };
    setData([...data, newRow]);
  };

  const [dataBelow, setDataBelow] = useState([
    { key: "1", date: "24-11-2024", takaNo: 4567, employee1: 200, employee2: 0, test: 0 },
    { key: "2", date: "23-11-2024", takaNo: null, employee1: 0, employee2: 0, test: 0 },
    { key: "3", date: "22-11-2024", takaNo: null, employee1: 0, employee2: 0, test: 0 },
    // Add more rows as needed
  ]);

  // Calculate totals for each column
  const totals = {
    takaNo: dataBelow.reduce((sum, row) => sum + (row.takaNo || 0), 0),
    employee1: dataBelow.reduce((sum, row) => sum + (row.employee1 || 0), 0),
    employee2: dataBelow.reduce((sum, row) => sum + (row.employee2 || 0), 0),
    test: dataBelow.reduce((sum, row) => sum + (row.test || 0), 0),
  };

  const columnsBelow = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Taka No",
      dataIndex: "takaNo",
      key: "takaNo",
      render: (text) => (text ? text : <span style={{ color: "red" }}>--</span>),
    },
    {
      title: "EMPLOYE_WORK_BASIS_2 (1-88)",
      dataIndex: "employee1",
      key: "employee1",
      render: (text) => (text ? text : <span style={{ color: "red" }}>0</span>),
    },
    {
      title: "NEW EMPLOYEE (1-10)",
      dataIndex: "employee2",
      key: "employee2",
      render: (text) => (text ? text : <span style={{ color: "red" }}>0</span>),
    },
    {
      title: "TEST (1-20)",
      dataIndex: "test",
      key: "test",
      render: (text) => (text ? text : <span style={{ color: "red" }}>0</span>),
    },
  ];

 
  return (
    <Form
      form={form}
      layout="vertical"
      style={{ marginTop: "1rem" }}
      onFinish={() => {}}
    >
      <div className="flex flex-col gap-2 p-4 pt-2">
        <div className="flex items-center justify-between gap-5 mx-3 mb-3">
          <div className="flex items-center gap-5">
            <Button onClick={() => navigate(-1)}>
              <ArrowLeftOutlined />
            </Button>
            <h3 className="m-0 text-primary">Add Folding Production</h3>
          </div>

          <div style={{ marginLeft: "auto" }}>
            <label htmlFor="">GRADE </label>

            <Radio.Group
              name="production_filter"
              onChange={(e) => {
                field.onChange(e);
                changeProductionFilter(e.target.value);
              }}
              defaultValue={"A"}
              buttonStyle="solid"
              optionType="button"
            >
              <Radio value={"A"}>A</Radio>
              <Radio value={"B"}>B</Radio>
              <Radio value={"C"}>C</Radio>
              <Radio value={"D"}>D</Radio>
            </Radio.Group>
          </div>
          <div style={{ marginLeft: "" }}>
            <Checkbox onChange={() => {}}>Generate QR Code</Checkbox>
          </div>
          <div style={{ marginLeft: "" }}>
            <Checkbox onChange={() => {}}>Auto Taka Generate</Checkbox>
          </div>
        </div>

        <Row className="w-100" justify={"flex-start"} style={{ gap: "12px" }}>
          <Col span={6}>
            <Form.Item
              label="Users"
              name="users"
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Select
                placeholder="Select Folding User"
                // loading={isLoadingMachineList}
                // options={machineListRes?.rows?.map((machine) => ({
                //   label: machine?.machine_name,
                //   value: machine?.machine_name,
                // }))}
                style={{
                  textTransform: "capitalize",
                }}
                dropdownStyle={{
                  textTransform: "capitalize",
                }}
                // onChange={(value) => {
                //   field.onChange(value);
                //   resetField("quality_id");
                // }}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Machine"
              name="machine"
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Select
                placeholder="Select Machine"
                // loading={isLoadingMachineList}
                // options={machineListRes?.rows?.map((machine) => ({
                //   label: machine?.machine_name,
                //   value: machine?.machine_name,
                // }))}
                style={{
                  textTransform: "capitalize",
                }}
                dropdownStyle={{
                  textTransform: "capitalize",
                }}
                // onChange={(value) => {
                //   field.onChange(value);
                //   resetField("quality_id");
                // }}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Machine No."
              name="machine no"
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Select
                placeholder="Select Machine"
                // loading={isLoadingMachineList}
                // options={machineListRes?.rows?.map((machine) => ({
                //   label: machine?.machine_name,
                //   value: machine?.machine_name,
                // }))}
                style={{
                  textTransform: "capitalize",
                }}
                dropdownStyle={{
                  textTransform: "capitalize",
                }}
                // onChange={(value) => {
                //   field.onChange(value);
                //   resetField("quality_id");
                // }}
              />
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item
              label="Taka No."
              name="taka no"
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Input disabled value={"134"} placeholder="1234" />
            </Form.Item>
          </Col>
        </Row>

        <Row className="w-100" justify={"flex-start"} style={{ gap: "12px" }}>
          <Col span={6}>
            <Form.Item
              label="Quality"
              name="quality"
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Select
                placeholder="Select Quality"
                // loading={isLoadingMachineList}
                // options={machineListRes?.rows?.map((machine) => ({
                //   label: machine?.machine_name,
                //   value: machine?.machine_name,
                // }))}
                style={{
                  textTransform: "capitalize",
                }}
                dropdownStyle={{
                  textTransform: "capitalize",
                }}
                // onChange={(value) => {
                //   field.onChange(value);
                //   resetField("quality_id");
                // }}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="B No."
              name="b no"
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Input disabled value={"134"} placeholder="1234" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="P. Mtr"
              name="p mtr"
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Input disabled value={"134"} placeholder="1234" />
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item
              label="Date"
              name="date"
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <div>
          <Table
            dataSource={data}
            columns={columns}
            pagination={false}
            rowKey="key"
            bordered
            showHeader={false}
            components={components}
            footer={() => (
              <div style={{ textAlign: "left" }}>
                <Button type="primary" onClick={()=>{addRow()}}>
                  Add Row
                </Button>
                <Input className="w-28 ml-1" placeholder="extra meter"/>

              </div>
            )} // Hides the header row
          />
        </div>
        <div>
        <Row className="w-100" justify={"flex-start"} style={{ gap: "12px" }}>
          <Col span={2}>
            <Form.Item
              label="Weight"
              name="weight"
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Input/>
            </Form.Item>
          </Col>
          <Col span={2}>
            <Form.Item
              label="Average"
              name="average"
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Input disabled value={"134"} placeholder="1234" />
            </Form.Item>
          </Col>
          <Col span={2}>
            <Form.Item
              label="Actual Meter"
              name="actual meter"
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Input disabled value={"134"} placeholder="1234" />
            </Form.Item>
          </Col>
          <Col span={1}>
            <Form.Item
              label=" "
              name="actual meter"
              required={true}
              wrapperCol={{ sm: 24 }}
            >
            <Checkbox onChange={() => {}}>TP</Checkbox>
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item
              label="Pis"
              name="pis"
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Input  value={"134"} placeholder="" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Notes"
              name="notes"
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Input value={"134"} placeholder="" />
            </Form.Item>
          </Col>
        </Row>
        </div>
        <Flex gap={10} justify="flex-end">
          <Button htmlType="button" onClick={() => {}}>
            Back
          </Button>
          <Button
            type="primary"
            htmlType="button"
            // onClick={handleSubmit(onSubmit)}
            // loading={isPending}
          >
            Save
          </Button>
        </Flex>
        <div>
        <div>
      <h3 style={{ textAlign: "center", marginBottom: "10px" }}>SONU TEXTILES</h3>
      <p style={{ textAlign: "center", fontWeight: "bold", marginBottom: "20px" }}>November-2024</p>
      <Table
        dataSource={dataBelow}
        columns={columnsBelow}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Showing 1 to ${total} of ${data.length} entries`,
        }}
        bordered
        footer={footer}
      />
    </div>
        </div>
      </div>
    </Form>
  );
};

export default AddFoldingProduction;
