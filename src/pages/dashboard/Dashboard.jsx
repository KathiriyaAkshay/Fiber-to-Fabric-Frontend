import { Card, Col, Flex, Row, Statistic } from "antd";
import React from "react";
import QueryChart from "./Charts/QueryChart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  RadialBar,
  RadialBarChart,
} from "recharts";
import { BarChart, Bar, Pie, Cell } from "recharts";
import { ChartWrapper } from "./Chart Wrapper/ChartWrapper";
import ApexCharts from "apexcharts";

const Dashboard = () => {
  return (
    <div className="dashboard-wrapper">
      <Row
        gutter={0}
        justify={"space-between"}
        align={"center"}
        className="mt-2 w-100"
      >
        <Col span={3}>
          <QueryChart>
            <Statistic title="Avg. Yarn" value={112893} precision={2} />
          </QueryChart>
        </Col>
        <Col span={3}>
          <QueryChart>
            <Statistic title="Avg. Weight" value={112893} suffix="kg" />
          </QueryChart>
        </Col>
        <Col span={3}>
          <QueryChart>
            <Statistic title="Yarn Cost" value={112893} suffix="Rs." />
          </QueryChart>
        </Col>
        <Col span={3}>
          <QueryChart>
            <Statistic title="Avg. Making Cost" value={112893} suffix="Rs." />
          </QueryChart>
        </Col>
        <Col span={3}>
          <QueryChart>
            <Statistic title="Making Cost" value={112893} suffix="Rs." />
          </QueryChart>
        </Col>
        <Col span={3}>
          <QueryChart>
            <Statistic title="Avg. Sales" value={112893} suffix="Rs." />
          </QueryChart>
        </Col>
        <Col span={3}>
          <QueryChart>
            <Statistic title="Total Sales Meter" value={112893} suffix="T" />
          </QueryChart>
        </Col>
      </Row>

      <Row justify={"space-evenly"} align={"start"} className="mt-3 w-100">
        <Col span={4}>
          <Card bordered={false} className="w-100">
            <Statistic title="Sales Order" value={-1204} />

            <Statistic title="Schedule Meter" value={0} />
          </Card>
          <Card bordered={false} className="w-100 mt-1">
            <Statistic title="Yarn Purchase Order" value={4.38} />
            <Statistic title="Trading Meter" value={5.38} />
            <Statistic title="Trading Meter" value={1.548} />
          </Card>
          <Card bordered={false} className="w-100 mt-1">
            <Statistic title="Yarn Purchase Order" value={4.38} />

            <Statistic title="Trading Meter" value={5.38} />
            <Statistic title="Trading Meter" value={1.548} />
          </Card>
        </Col>
        <Col span={20}>
          <Row justify="" className="w-100">
            <Col span={8}>
              <ChartWrapper
                chart="LINE"
                header="Monthly Production"
              ></ChartWrapper>
            </Col>
            <Col span={8}>
              <ChartWrapper chart="BAR" header="Cost Summary"></ChartWrapper>
            </Col>
            <Col span={8}>
              <ChartWrapper
                chart="PIE"
                header="Days Payable Outstanding"
              ></ChartWrapper>
            </Col>
            <Col span={8}>
              <ChartWrapper
                chart="RADICAL"
                header="Total Sales/Stock"
              ></ChartWrapper>
            </Col>
            <Col span={8}>
              <ChartWrapper chart="TREE"></ChartWrapper>
            </Col>
            <Col span={8}>
              <ChartWrapper
                chart="BAR"
                header="Days Receivable Aging"
              ></ChartWrapper>
            </Col>
            <Col span={24}>
              <ChartWrapper chart="TABLE" header="Data"></ChartWrapper>
            </Col>
            {/*
            <Col span={8}>
              <ChartWrapper>
                <LineChart
                  width={350}
                  height={200}
                  data={data}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="pv"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                  <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
                </LineChart>
              </ChartWrapper>
            </Col>
            <Col span={8}>
              <ChartWrapper>
                <LineChart
                  width={350}
                  height={200}
                  data={data}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="pv"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                  <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
                </LineChart>
              </ChartWrapper>
            </Col> */}
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
