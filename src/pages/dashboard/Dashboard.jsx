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
  getOrderMasterAnalyticsRequest,
  productionInHoustTakaReportRequest,
} from "../../api/requests/dashboard";
import prettyNum from "pretty-num";
import DayReceivableOutStanding from "./Charts/DayReceivableOutStanding";
import DayPayableOutStanding from "./Charts/DayPayableOutStanding";
import PayableChart from "./Charts/PayableChart";
import { useNavigate, useNavigation } from "react-router-dom";
import ProductionReport from "./Charts/productionReport";
import RadicalCharts from "./Charts/RadicalCharts";
import DashboardSaleInfo from "./Charts/DashboardSaleInfo";
import {
  MeterIcon,
  MoneyIcon,
  SalesIcon,
  WeightIcon,
  YarnIcon,
} from "../../../public/icons/icons";

const formatNumber = (number) => {
  // Using pretty-num to convert to short format
  return prettyNum(number, {
    precision: 1, // Keep one decimal place
    abbreviations: {
      K: "K",
      M: "M", // Millions
      B: "B", // Billions
      Cr: "Cr", // Crore
      L: "L", // Lakh
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
    ? [
        ...(bankBalanceData.banks || []),
        ...(bankBalanceData.cashbook || []),
      ].reduce((acc, item) => {
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
      }, {})
    : {}; // Return an empty object if bankBalanceData is undefined

  const [totalBankBalance, setTotalBankBalance] = useState(0);
  const [totalCashbookBalance, setTotalCashbookBalanace] = useState(0);

  useEffect(() => {
    if (groupedData !== undefined) {
      let temp_total_balance = 0;
      let temp_total_cashbook_balance = 0;
      Object.entries(groupedData).map(([key, value]) => {
        value?.banks?.map((element) => {
          temp_total_balance += +element?.balance || 0;
        });
        value?.cashbook?.map((element) => {
          temp_total_cashbook_balance += +element?.balance || 0;
        });
      });
      setTotalBankBalance(temp_total_balance);
      setTotalCashbookBalanace(temp_total_cashbook_balance);
    }
  }, [groupedData]);

  return (
    <div>
      {/* Bank wise bank balance and cashbbook balance related information  */}
      {Object.entries(groupedData).map(([key, value]) => {
        return (
          <div
            key={key}
            style={{
              padding: "2px",
              borderBottom: "1px solid #888888",
              paddingBottom: 10,
            }}
          >
            <h3
              style={{
                color: "var(--menu-item-hover-color)",
                marginBottom: 0,
                marginTop: 8,
              }}
            >
              ❖ {key} ❖
            </h3>

            {/* Render bank balance related inforamtion  */}
            {value.banks &&
              value.banks.length > 0 &&
              value.banks.map((item, index) => (
                <Flex
                  key={index + "_bank"}
                  justify="space-between"
                  style={{
                    marginTop: 8,
                  }}
                >
                  <Typography>
                    {String(item.bank_name).toUpperCase()}
                  </Typography>
                  <Typography>
                    B/L: <b>{formatNumber(item.balance)}</b>
                  </Typography>
                </Flex>
              ))}

            {/* Render cashbook balance related information  */}
            {value.cashbook &&
              value.cashbook.length > 0 &&
              value.cashbook.map((item, index) => (
                <Flex
                  key={index + "_cashbook"}
                  justify="space-between"
                  style={{
                    marginTop: 8,
                  }}
                >
                  <Typography style={{ color: "blue", fontWeight: 600 }}>
                    CB B/L :
                  </Typography>
                  <Typography>
                    <b>{item.balance}</b>
                  </Typography>
                </Flex>
              ))}
          </div>
        );
      })}

      {/* Total data related information  */}
      <div>
        <div
          style={{
            color: "green",
            marginTop: 10,
            marginBottom: 10,
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          Total{" "}
        </div>

        <Flex justify="space-between">
          <Typography>
            B/L: <b style={{ marginLeft: 6 }}>{totalBankBalance}</b>
          </Typography>
        </Flex>

        <Flex
          justify="space-between"
          style={{
            marginTop: 5,
          }}
        >
          <Typography>
            <span
              style={{
                color: "var(--menu-item-hover-color)",
              }}
            >
              CB B/L:
            </span>{" "}
            <b style={{ marginLeft: 6 }}>{totalCashbookBalance}</b>
          </Typography>
        </Flex>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigation = useNavigate();
  const { companyId, companyListRes } = useContext(GlobalContext);

  const [dayPayableData, setDayPayableData] = useState([]);
  const [dayReceivableData, setDayReceivableData] = useState([]);
  const [takaInformation, setTakaInformation] = useState(undefined);
  const [totalTaka, setTotalTaka] = useState(undefined);
  const [totalMeter, setTotalMeter] = useState(undefined);

  // User related data information ============================================
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

  // Order master related data information ====================================
  const { data: orderAnalyticsData } = useQuery({
    queryKey: ["get", "company", "order-analytics", { companyId }],
    queryFn: async () => {
      const params = {
        company_id: companyId,
      };
      const response = await getOrderMasterAnalyticsRequest({ params });
      return response?.data?.data;
    },
  });

  // Production report information related handler ===========================
  const { data: productionReportData } = useQuery({
    queryKey: ["get", "production", "taka-report", { company_id: companyId }],
    queryFn: async () => {
      const params = {
        company_id: companyId,
      };
      const response = await productionInHoustTakaReportRequest({ params });
      return response?.data?.data;
    },
  });

  // Navigation handler ==========================================
  const OrderMasterNavigation = (type) => {
    if (type == "purchase/trading") {
      navigation("/order-master/my-orders");
    } else if (type == "taka(inhouse)") {
      navigation("/order-master/my-orders");
    } else if (type == "job") {
      navigation("/order-master/my-orders");
    } else if (type == "Yarn") {
      navigation("/order-master/my-yarn-orders");
    } else {
      navigation("/order-master/size-beam-order");
    }
  };

  // Taka and Meter information handler ============================
  useEffect(() => {
    if (takaInformation !== undefined) {
      let temp_total_meter = 0;
      let temp_total_taka = 0;

      temp_total_taka += +takaInformation?.purchase_taka[0]?.total_taka || 0;
      temp_total_taka += +takaInformation?.job_taka[0]?.total_taka || 0;
      temp_total_taka += +takaInformation?.production_taka?.total_taka || 0;

      temp_total_meter += +takaInformation?.purchase_taka[0]?.total_meter || 0;
      temp_total_meter += +takaInformation?.job_taka[0]?.total_meter || 0;
      temp_total_meter += +takaInformation?.production_taka?.total_meter || 0;

      setTotalMeter(temp_total_meter);
      setTotalTaka(temp_total_taka);
    }
  }, [takaInformation]);

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
      <Row justify={"space-between"} align={"flex-end"} className="mt-2">
        <Col span={3}>
          <QueryChart
            title="Avg. Yarn"
            value={112893}
            precision={2}
            icon={<YarnIcon />}
          ></QueryChart>
        </Col>
        <Col span={3}>
          <QueryChart
            title="Avg. Weight"
            value={112893}
            suffix="kg"
            icon={<WeightIcon />}
          ></QueryChart>
        </Col>
        <Col span={3}>
          <QueryChart
            title="Yarn Cost"
            value={112893}
            suffix="Rs."
            icon={<MoneyIcon />}
          ></QueryChart>
        </Col>
        <Col span={3}>
          <QueryChart
            title="Making Cost (Avg.)"
            value={112893}
            suffix="Rs."
            icon={<MoneyIcon />}
          ></QueryChart>
        </Col>
        <Col span={3}>
          <QueryChart
            title="Making Cost"
            value={112893}
            suffix="Rs."
            icon={<MoneyIcon />}
          ></QueryChart>
        </Col>
        <Col span={3}>
          <QueryChart
            title="Avg. Sales"
            value={112893}
            suffix="Rs."
            icon={<SalesIcon />}
          ></QueryChart>
        </Col>
        <Col span={3}>
          <QueryChart
            title="Total Sales Meter"
            value={112893}
            suffix="T"
            icon={<MeterIcon />}
          ></QueryChart>
        </Col>
      </Row>
      <Row gutter={6} className="mt-2 w-100">
        {/* part 1 */}
        <Col span={4} style={{ position: "sticky", top: "200px" }}>
          <Row justify={"flex-start"} align={"flex-start"}>
            <Col span={24}>
              <Card className="w-100 chart-wrapper side-row-card">
                <Statistic title="Sales Order" value={-1204} />
                <Divider />
                <Statistic title="Schedule Meter" value={0} />
              </Card>
            </Col>

            {/* ========== Oder master related data information ==========  */}
            <Col span={24}>
              <Card
                className="w-100 mt-1 chart-wrapper side-row-card"
                style={{ cursor: "pointer", padding: 0 }}
              >
                {/* ========= My order information ===========  */}

                <div className="dashboard-order-title">My order</div>

                {orderAnalyticsData?.gray_order?.map((element) => {
                  return (
                    <Flex className="dashboard-order-data-div">
                      <div>
                        <div
                          className="dashboard-order-data-title"
                          onClick={() => {
                            OrderMasterNavigation(element?.order_type);
                          }}
                        >
                          {String(element?.order_type).toUpperCase()}
                        </div>
                        <div className="dashboard-order-pending-meter-title">
                          Pending Meter:{" "}
                          <span
                            style={{
                              color: "red",
                              fontSize: 11,
                              fontWeight: 600,
                            }}
                          >
                            {element?.pending_meters}
                          </span>
                        </div>
                      </div>
                      <div className="dashboard-order-data-count">
                        {element?.orders}
                      </div>
                    </Flex>
                  );
                })}

                {/* ======= Yarn order information ========  */}

                <div
                  className="dashboard-order-title"
                  style={{
                    marginTop: 10,
                    borderTop: "1px solid #a49f9f",
                    paddingTop: 10,
                  }}
                >
                  <Flex>
                    <div
                      onClick={() => {
                        OrderMasterNavigation("Yarn");
                      }}
                    >
                      Yarn Order
                    </div>
                    <div className="dashboard-order-data-count">
                      {String(
                        orderAnalyticsData?.yarn_order[0]?.orders
                      ).toUpperCase()}
                    </div>
                  </Flex>
                </div>

                <div style={{ marginTop: 5 }}>
                  <div className="dashboard-order-pending-meter-title">
                    Pending Quantity:{" "}
                    <span
                      style={{ color: "red", fontSize: 11, fontWeight: 600 }}
                    >
                      {orderAnalyticsData?.yarn_order[0]?.pending_quantity}
                    </span>
                  </div>
                  <div
                    className="dashboard-order-pending-meter-title"
                    style={{ marginTop: 3 }}
                  >
                    Pending Cartoon:{" "}
                    <span
                      style={{ color: "red", fontSize: 11, fontWeight: 600 }}
                    >
                      {orderAnalyticsData?.yarn_order[0]?.pending_cartoon}
                    </span>
                  </div>
                  <div
                    className="dashboard-order-pending-meter-title"
                    style={{ marginTop: 3 }}
                  >
                    Pending KG:{" "}
                    <span
                      style={{ color: "red", fontSize: 11, fontWeight: 600 }}
                    >
                      {orderAnalyticsData?.yarn_order[0]?.pending_kg}
                    </span>
                  </div>
                </div>

                {/* =========== Size beam order information ==========  */}

                <div
                  className="dashboard-order-title"
                  style={{
                    marginTop: 10,
                    borderTop: "1px solid #a49f9f",
                    paddingTop: 10,
                  }}
                >
                  <Flex>
                    <div
                      onClick={() => {
                        OrderMasterNavigation("size_beam_order");
                      }}
                    >
                      Size Beam order
                    </div>
                    <div className="dashboard-order-data-count">
                      {String(
                        orderAnalyticsData?.size_beam_order[0]?.orders
                      ).toUpperCase()}
                    </div>
                  </Flex>
                </div>

                {/* <Statistic title="Yarn Purchase Order" value={4.38} />
                
                <Divider />
                
                <Statistic title="Trading Meter" value={5.38} />
                
                <Divider />
                
                <Statistic title="Trading Meter" value={1.548} /> */}
              </Card>
            </Col>

            {/* ============== Employee related information =============  */}
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
                <Divider
                  style={{ color: "#2d2d2d", marginTop: 5, marginBottom: 5 }}
                />
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
                  className="dashboard-employee-attendance"
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
                      <th>Pre.</th>
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
                              <td>{String(item?.salary_type).toUpperCase()}</td>
                              <td
                                className={
                                  item?.present_user > 0
                                    ? "present-employee-count"
                                    : ""
                                }
                              >
                                {item?.present_user}
                              </td>
                              <td
                                className={
                                  item?.absent_user > 0
                                    ? "absent-employee-count"
                                    : ""
                                }
                              >
                                {item?.absent_user}
                              </td>
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

            {/* ===== Taka report related information =====  */}
            <Col span={24}>
              <Card
                className="w-100 mt-1 chart-wrapper side-row-card"
                style={{ padding: "0px" }}
              >
                <Row>
                  {/* Totak Taka information  */}
                  <Col span={12}>
                    <Typography>
                      <b>Total Taka</b>
                    </Typography>
                  </Col>

                  {/* Total meter information  */}
                  <Col span={12}>
                    <Typography>
                      <b>Total Meter</b>
                    </Typography>
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>{totalTaka || 0}</Col>
                  <Col span={12}>{totalMeter || 0}</Col>
                </Row>
                <Divider />
                <table
                  className="dashboard-employee-attendance"
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
                      <th>Taka</th>
                      <th>Meter</th>
                    </tr>
                  </thead>
                  <tbody>
                    {takaInformation && (
                      <>
                        <tr>
                          <td>Production Taka</td>
                          <td>
                            {takaInformation?.production_taka?.total_taka}
                          </td>
                          <td>
                            {takaInformation?.production_taka?.total_meter}
                          </td>
                        </tr>
                        <tr>
                          <td>Purchase Taka</td>
                          <td>
                            {takaInformation?.purchase_taka[0]?.total_taka}
                          </td>
                          <td>
                            {takaInformation?.purchase_taka[0]?.total_meter}
                          </td>
                        </tr>
                        <tr>
                          <td>Job Taka</td>
                          <td>{takaInformation?.job_taka[0]?.total_taka}</td>
                          <td>{takaInformation?.job_taka[0]?.total_meter}</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </Card>
            </Col>
          </Row>
        </Col>

        {/* part 2 */}
        <Col span={20}>
          {/* number box */}

          <Row gutter={6} className="w-100">
            {/* Monthly Production related information chart  */}
            <Col span={8}>
              <ChartWrapper
                chart="monthly_production"
                header="Monthly Production"
                companyId={companyId}
              ></ChartWrapper>
            </Col>

            {/* Monthly Production table  */}
            <Col span={8}>
              <MonthlyProductionTable />
            </Col>

            <Col span={8}>
              <ChartWrapper
                chart="BAR"
                header="Cost Summary"
                companyId={companyId}
              ></ChartWrapper>
            </Col>
          </Row>

          <Row gutter={6} className="mt-2 w-100">
            {/* Day receivable outstanding related information  */}
            <Col span={8}>
              <DayReceivableOutStanding
                setDayReceivableData={setDayReceivableData}
              />
            </Col>

            {/* Day payable outstanding related information  */}
            <Col span={8}>
              <DayPayableOutStanding setDayPayableData={setDayPayableData} />
            </Col>

            {/* Payable chart related information  */}
            <Col span={8}>
              <PayableChart
                dayPayableData={dayPayableData}
                dayReceivableData={dayReceivableData}
              />
            </Col>
          </Row>

          {/* =========== Production report information ============  */}
          <Col span={24} className="mt-3">
            <ProductionReport />
          </Col>

          {/* ========== Dashboard sale information ============  */}
          <Row gutter={6} className="mt-2 w-100">
            <Col span={8}>
              <DashboardSaleInfo
                setTakaInformation={setTakaInformation}
                takaInformation={takaInformation}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
