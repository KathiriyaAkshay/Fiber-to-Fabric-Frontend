import { Card, Col, Divider, Row, Statistic } from "antd";
import QueryChart from "./Charts/QueryChart";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   PieChart,
//   RadialBar,
//   RadialBarChart,
// } from "recharts";
// import { BarChart, Bar, Pie, Cell } from "recharts";
import { ChartWrapper } from "./Chart Wrapper/ChartWrapper";
import { useContext } from "react";
import { GlobalContext } from "../../contexts/GlobalContext";
// import ApexCharts from "apexcharts";

const Dashboard = () => {
  const { companyId } = useContext(GlobalContext);

  return (
    <div className="dashboard-wrapper">
      <Row>
        <Col span={24}>
          <div className="dashboard-advertisement">
            <p>
              Yesterday Target :- 2564 Achieved :- 0 Short :- 2563.66 (100%)
              Monthly Estimated :- 4067.48
            </p>
          </div>
        </Col>
      </Row>
      <Row gutter={6} className="mt-2 w-100">
        {/* part 1 */}
        <Col span={4}>
          <Row justify={"flex-start"} align={"flex-start"}>
            <Col span={24}>
              <Card className="w-100 chart-wrapper side-row-card">
                <Statistic title="Sales Order" value={-1204} />
                <Divider />
                <Statistic title="Schedule Meter" value={0} />
              </Card>
            </Col>
            <Col span={24}>
              <Card className="w-100 mt-1 chart-wrapper side-row-card">
                <Statistic title="Yarn Purchase Order" value={4.38} />
                <Divider />
                <Statistic title="Trading Meter" value={5.38} />
                <Divider />
                <Statistic title="Trading Meter" value={1.548} />
              </Card>
            </Col>
            <Col span={24}>
              <Card className="w-100 mt-1 chart-wrapper side-row-card">
                <Statistic title="Yarn Purchase Order" value={4.38} />
                <Divider />
                <Statistic title="Trading Meter" value={5.38} />
                <Divider />
                <Statistic title="Trading Meter" value={1.548} />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* part 2 */}
        <Col span={20}>
          {/* number box */}
          <Row justify={"space-between"} align={"flex-end"}>
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
                <Statistic
                  title="Avg. Making Cost"
                  value={112893}
                  suffix="Rs."
                />
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
                <Statistic
                  title="Total Sales Meter"
                  value={112893}
                  suffix="T"
                />
              </QueryChart>
            </Col>
          </Row>

          <Row gutter={6} className="mt-6 w-100">
            <Col span={10}>
              <ChartWrapper
                chart="LINE"
                header="Monthly Production"
                companyId={companyId}
              ></ChartWrapper>
            </Col>
            <Col span={8}>
              <ChartWrapper
                chart="BAR"
                header="Cost Summary"
                companyId={companyId}
              ></ChartWrapper>
            </Col>
            <Col span={6}>
              <ChartWrapper
                chart="PIE"
                header="Days Payable Outstanding"
                companyId={companyId}
              ></ChartWrapper>
            </Col>
            <Col span={8}>
              <ChartWrapper
                chart="RADICAL"
                header="Total Sales/Stock"
                companyId={companyId}
              ></ChartWrapper>
            </Col>
            <Col span={8}>
              <ChartWrapper chart="TREE" companyId={companyId}></ChartWrapper>
            </Col>
            <Col span={8}>
              <ChartWrapper
                chart="BAR"
                header="Days Receivable Aging"
                companyId={companyId}
              ></ChartWrapper>
            </Col>
            <Col span={24}>
              <ChartWrapper
                chart="TABLE"
                header="Data"
                companyId={companyId}
              ></ChartWrapper>
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
