import {
  Card,
  Col,
  Collapse,
  Divider,
  Flex,
  Row,
  Statistic,
  Typography,
} from "antd";
import QueryChart from "./Charts/QueryChart";
import { ChartWrapper } from "./Chart Wrapper/ChartWrapper";
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../contexts/GlobalContext";
import MonthlyProductionTable from "./Charts/MonthlyProductionTable";
import { useQuery } from "@tanstack/react-query";
import {
  getCompanyBankBalanceRequest,
  getCompanyUserAnalyticsRequest,
} from "../../api/requests/dashboard";
import prettyNum from "pretty-num";

const formatNumber = (number) => {
  // Using pretty-num to convert to short format
  return prettyNum(number, {
    precision: 1, // Keep one decimal place
    abbreviations: {
      K: 'K', 
      M: 'M',    // Millions
      B: 'B',    // Billions
      Cr: 'Cr',  // Crore
      L: 'L',    // Lakh
    },
  });
};

// ============== Company bank balance related information ================== // 
const CompanyBankBalance = ({ company }) => {
  const { data: bankBalanceData } = useQuery({
    queryKey: ["get", "company", "bank-balance", { companyId: company }],
    queryFn: async () => {
      const params = {
        company_id: company,
      };
      const response = await getCompanyBankBalanceRequest({ params });
      return response?.data?.data;
    },
  });

  // Ensure bankBalanceData is defined before processing
  const groupedData = bankBalanceData
    ? [...(bankBalanceData.banks || []), ...(bankBalanceData.cashbook || [])].reduce(
      (acc, item) => {
        const { company_name } = item;

        // Initialize the group if it doesn't exist
        if (!acc[company_name]) {
          acc[company_name] = { banks: [], cashbook: [] };
        }

        // Push items into the respective group
        if ("bank_name" in item) {
          acc[company_name].banks.push(item);
        } else if ("id" in item) {
          acc[company_name].cashbook.push(item);
        }

        return acc;
      },
      {}
    )
    : {}; // Return an empty object if bankBalanceData is undefined

  const [totalBankBalance, setTotalBankBalance] = useState(0);
  const [totalCashbookBalance, setTotalCashbookBalanace] = useState(0);
  console.log(groupedData);


  useEffect(() => {
    if (groupedData !== undefined) {
      let temp_total_balance = 0;
      let temp_total_cashbook_balance = 0;
      Object.entries(groupedData).map(([key, value]) => {
        value?.banks?.map((element) => {
          temp_total_balance += +element?.balance || 0;
          
        })
        value?.cashbook?.map((element) => {
          temp_total_cashbook_balance += +element?.balance || 0;
        })
      })
      setTotalBankBalance(temp_total_balance);
      setTotalCashbookBalanace(temp_total_cashbook_balance);
    }
  }, [groupedData]);


  return (
    <div>
      {/* Bank wise bank balance and cashbbook balance related information  */}
      {Object.entries(groupedData).map(([key, value]) => {
        return (
          <div key={key}
            style={{ padding: "2px", borderBottom: "1px solid #888888", paddingBottom: 10 }}>

            <h3 style={{
              color: "var(--menu-item-hover-color)",
              marginBottom: 0,
              marginTop: 8
            }}>
              ❖ {key} ❖
            </h3>

            {/* Render bank balance related inforamtion  */}
            {value.banks && value.banks.length > 0 && (
              value.banks.map((item, index) => (
                <Flex key={index + "_bank"} justify="space-between" style={{
                  marginTop: 8
                }}>
                  <Typography >{String(item.bank_name).toUpperCase()}</Typography>
                  <Typography>
                    B/L: <b>{formatNumber(item.balance)}</b>
                  </Typography>
                </Flex>
              ))
            )}

            {/* Render cashbook balance related information  */}
            {value.cashbook && value.cashbook.length > 0 && (
              value.cashbook.map((item, index) => (
                <Flex key={index + "_cashbook"} justify="space-between" style={{
                  marginTop: 8
                }}>
                  <Typography style={{ color: "blue", fontWeight: 600 }}>CB B/L :</Typography>
                  <Typography>
                    <b>{item.balance}</b>
                  </Typography>
                </Flex>
              ))
            )}
          </div>
        );
      })}

      {/* Total data related information  */}
      <div>
        <div 
          style={{ color: "green", marginTop:10, marginBottom: 10, fontWeight: 600, fontSize: 16 }}>Total </div>
        
        <Flex justify="space-between">
          <Typography>
            B/L: <b style={{marginLeft: 6}}>{totalBankBalance}</b>
          </Typography>
        </Flex>
        
        <Flex justify="space-between" style={{
          marginTop: 5
        }}>
          <Typography>
            <span
              style={{
                color: "var(--menu-item-hover-color)",
              }}
            >
              CB B/L:
            </span>{" "}
            <b style={{marginLeft: 6}}>{totalCashbookBalance}</b>
          </Typography>
        </Flex>
      </div>
    </div>
  );

};

const Dashboard = () => {
  const { companyId, companyListRes } = useContext(GlobalContext);

  const { data: userAnalyticsData } = useQuery({
    queryKey: ["get", "company", "user-analytics", { companyId }],
    queryFn: async () => {
      const params = {
        company_id: companyId,
      };
      const response = await getCompanyUserAnalyticsRequest({ params });
      return response?.data?.data;
    },
  });

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
              <Card
                className="w-100 mt-1 chart-wrapper side-row-card"
                style={{ padding: "0px" }}
              >
                <Row>
                  <Col span={12}>
                    <Typography>
                      <b>Total Party</b>
                    </Typography>
                  </Col>
                  <Col span={12}>
                    <Typography>
                      <b>Total broker</b>
                    </Typography>
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>{userAnalyticsData?.total_party}</Col>
                  <Col span={12}>{userAnalyticsData?.total_broker}</Col>
                </Row>
                <Divider />
                <Row>
                  <Col span={24}>
                    <Typography>
                      <b>Total Employee</b>
                    </Typography>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>{userAnalyticsData?.total_employee}</Col>
                </Row>
                <Divider />
                <table
                  border={1}
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Req.</th>
                      <th>Abs.</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userAnalyticsData?.employee &&
                      userAnalyticsData?.employee?.length
                      ? userAnalyticsData?.employee?.map((item, index) => {
                        return (
                          <tr key={index}>
                            <td>{item?.salary_type}</td>
                            <td>0</td>
                            <td>0</td>
                            <td>{item?.employee_count}</td>
                          </tr>
                        );
                      })
                      : null}
                  </tbody>
                </table>
              </Card>
            </Col>

            {/* ============= Company bank balance data ==================  */}

            <Col span={24}>
              <Card className="bank-balance-card" style={{ padding: "0px" }}>
                <Collapse
                  accordion
                  defaultActiveKey={"1"}
                  items={[
                    {
                      key: "1",
                      label: "Bank Balance",
                      children: (
                        <>
                          <CompanyBankBalance
                            key={companyId}
                            company={companyId}
                          />
                        </>
                      ),
                    },
                  ]}
                />
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
                chart="monthly_production"
                header="Monthly Production"
                companyId={companyId}
              ></ChartWrapper>
            </Col>
            <Col span={6}>
              <MonthlyProductionTable />
            </Col>
            <Col span={8}>
              <ChartWrapper
                chart="BAR"
                header="Cost Summary"
                companyId={companyId}
              ></ChartWrapper>
            </Col>
            <Col span={8}>
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
