import React from "react";
import { Button, Space, Table, Tag } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import "./_style.css";
const columns = [
  {
    title: "Quality",
    dataIndex: "quality",
    key: "quality",
    render: (text) => <strong>{text}</strong>,
  },
  {
    title: "Sales Meter",
    dataIndex: "sales_meter",
    key: "sales_meter",
  },
  {
    title: "Sales Rate",
    dataIndex: "sales_rate",
    key: "sales_rate",
  },
  {
    title: "Yarn Cost",
    key: "yarn_cost",
    dataIndex: "yarn_cost",
  },
  {
    title: "Making Cost",
    key: "making_cost",
    dataIndex: "making_cost",
  },
  {
    title: "Margin",
    key: "margin",
    dataIndex: "margin",
  },
  {
    title: "Action",
    key: "action",
    render: (_, record) => (
      <Space size="middle">
        <Button icon={<ReloadOutlined />} />
      </Space>
    ),
  },
];
const data = [
  {
    key: "1",
    quality: "MAHESHWARI 10/2",
    sales_meter: 32,
    sales_rate: 92.4,
    yarn_cost: 131.03,
    making_cost: 191.03,
    margin: "--",
  },
];
const DataTable = (props) => (
  <Table columns={columns} dataSource={data} class="table-chart" />
);
export default DataTable;
