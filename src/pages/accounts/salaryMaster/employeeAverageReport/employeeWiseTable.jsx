import { useQuery } from "@tanstack/react-query";
import { getAverageSalaryReportListRequest } from "../../../../api/requests/accounts/salary";
import dayjs from "dayjs";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { useContext, useMemo } from "react";
import { Card, Col, Flex, Row, Spin, Typography } from "antd";
import _ from "lodash";

const EmployeeWiseTable = ({ month, machineName, employee }) => {
  return (
    <>
      {employee?.map((employee) => {
        return (
          <UserAverageReport
            key={employee?.label}
            employee={employee}
            month={month}
            machineName={machineName}
          />
        );
      })}
    </>
  );
};

export default EmployeeWiseTable;

const UserAverageReport = ({ employee, month, machineName }) => {
  const { company, companyId } = useContext(GlobalContext);

  const {
    data: averageSalaryReportData,
    isLoading: isLoadingAverageSalaryReport,
  } = useQuery({
    queryKey: [
      "average",
      "salary-report",
      "list",
      {
        company_id: companyId,
        month: dayjs(month).format("MM-YYYY"),
        machine_name: machineName,
        is_user_group: 0,
        user_id: employee.value,
      },
    ],
    queryFn: async () => {
      const params = {
        company_id: companyId,
        machine_name: machineName,
        month: dayjs(month).format("MM-YYYY"),
        is_user_group: 0,
        user_id: employee.value,
      };

      const response = await getAverageSalaryReportListRequest({ params });
      return response.data.data;
    },
    enabled: Boolean(companyId),
  });

  const data = useMemo(() => {
    if (averageSalaryReportData && averageSalaryReportData.result) {
      return Object.keys(averageSalaryReportData.result);
    } else {
      return [];
    }
  }, [averageSalaryReportData]);

  const data1 = useMemo(() => {
    if (averageSalaryReportData && averageSalaryReportData.result) {
      return Object.keys(averageSalaryReportData.result).slice(0, 15);
    } else {
      return [];
    }
  }, [averageSalaryReportData]);

  const data2 = useMemo(() => {
    if (averageSalaryReportData && averageSalaryReportData.result) {
      return Object.keys(averageSalaryReportData.result).slice(15, 31);
    } else {
      return [];
    }
  }, [averageSalaryReportData]);

  const header = useMemo(() => {
    if (
      averageSalaryReportData &&
      averageSalaryReportData?.invovled_machine?.length
    ) {
      return averageSalaryReportData?.invovled_machine?.map((item) => item);
    } else {
      return [];
    }
  }, [averageSalaryReportData]);

  const First_Total = useMemo(() => {
    const totalData = {};
    if (
      header &&
      header.length &&
      averageSalaryReportData &&
      averageSalaryReportData?.invovled_machine?.length
    ) {
      header.forEach((machineNo) => {
        let total = 0;
        data1.forEach((day) => {
          const machineData = averageSalaryReportData.result[day];

          const machineWiseUserData = machineData[machineNo];

          const value = machineWiseUserData
            ? (machineWiseUserData.day_meter || 0) +
              (machineWiseUserData.night_meter || 0)
            : 0;
          total += value;
        });

        totalData[machineNo] = total;
      });
    }
    return totalData;
  }, [averageSalaryReportData, data1, header]);

  const Second_Total = useMemo(() => {
    const totalData = {};
    if (
      header &&
      header.length &&
      averageSalaryReportData &&
      averageSalaryReportData?.invovled_machine?.length
    ) {
      header.forEach((machineNo) => {
        let total = 0;
        data2.forEach((day) => {
          const machineData = averageSalaryReportData.result[day];

          const machineWiseUserData = machineData[machineNo];

          const value = machineWiseUserData
            ? (machineWiseUserData.day_meter || 0) +
              (machineWiseUserData.night_meter || 0)
            : 0;
          total += value;
        });

        totalData[machineNo] = total;
      });
    }
    return totalData;
  }, [averageSalaryReportData, data2, header]);

  const Final_Total = useMemo(() => {
    const totalData = {};
    if (
      header &&
      header.length &&
      averageSalaryReportData &&
      averageSalaryReportData?.invovled_machine?.length
    ) {
      header.forEach((machineNo) => {
        let total = 0;
        data.forEach((day) => {
          const machineData = averageSalaryReportData.result[day];

          const machineWiseUserData = machineData[machineNo];

          const value = machineWiseUserData
            ? (machineWiseUserData.day_meter || 0) +
              (machineWiseUserData.night_meter || 0)
            : 0;
          total += value;
        });

        totalData[machineNo] = total;
      });
    }
    return totalData;
  }, [averageSalaryReportData, data, header]);

  const Quality_Total = useMemo(() => {
    if (
      averageSalaryReportData &&
      averageSalaryReportData?.qualityWiseReport.length
    ) {
      let total_1_15_meter = 0;
      let total_16_31_meter = 0;
      let totalMeter = 0;
      let total_1_15_amt = 0;
      let total_16_31_amt = 0;
      let totalAmount = 0;

      //  + row["16_to_31_total_meter"]
      averageSalaryReportData?.qualityWiseReport.forEach((row) => {
        total_1_15_meter += row["1_to_15_total_meter"];
        total_16_31_meter += row["16_to_31_total_meter"];
        totalMeter += row["1_to_15_total_meter"] + row["16_to_31_total_meter"];
        total_1_15_amt += row["1_to_15_total_amount"];
        total_16_31_amt += row["16_to_31_total_amount"];
        totalAmount +=
          row["1_to_15_total_amount"] + row["16_to_31_total_amount"];
      });

      return {
        total_1_15_meter,
        total_16_31_meter,
        totalMeter,
        total_1_15_amt,
        total_16_31_amt,
        totalAmount,
      };
    }
  }, [averageSalaryReportData]);

  if (isLoadingAverageSalaryReport) {
    return (
      <div
        style={{
          height: "200px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin />
      </div>
    );
  }

  return (
    <Card>
      <Flex
        justify="space-between"
        gap={6}
        align="center"
        style={{
          flexDirection: "row",
          padding: "12px 50px",
          backgroundColor: "var(--secondary-color)",
        }}
      >
        <Typography.Text
          style={{
            color: "rgb(25 74 109)",
            fontSize: "1rem",
            fontWeight: "bold",
          }}
        >
          {employee?.label || ""}
        </Typography.Text>
        <Typography.Text
          style={{
            color: "rgb(25 74 109)",
            fontSize: "1rem",
            fontWeight: "bold",
          }}
        >
          {company?.company_name || ""}
        </Typography.Text>
        <Typography.Text
          style={{
            color: "rgb(25 74 109)",
            fontSize: "1rem",
            fontWeight: "bold",
          }}
        >
          {dayjs(month).format("MMMM-YYYY")}
        </Typography.Text>
      </Flex>

      <br />
      <Row gutter={24}>
        <Col span={16}>
          <table
            border={1}
            style={{
              borderCollapse: "collapse",
              width: "100%",
              textAlign: "center",
            }}
            className="custom-table"
          >
            <thead>
              <tr>
                <th></th>
                <th></th>
                <th colSpan={2}>Meter</th>
                <th>Tot Mtr</th>
                <th colSpan={2}>Amt</th>
                <th>Tot Amt</th>
                <th>Advance</th>
                <th>Payable</th>
              </tr>
              <tr>
                <th>Quality Name</th>
                <th>Rate</th>
                <th>1 to 15</th>
                <th>16 to 31</th>
                <th></th>
                <th>1 to 15</th>
                <th>16 to 31</th>
                <th></th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {averageSalaryReportData &&
              averageSalaryReportData?.qualityWiseReport.length ? (
                averageSalaryReportData?.qualityWiseReport?.map(
                  (row, index) => {
                    const totalMeter =
                      row["1_to_15_total_meter"] + row["16_to_31_total_meter"];

                    const totalAmount =
                      row["1_to_15_total_amount"] +
                      row["16_to_31_total_amount"];

                    let finalTotalAmount = 0;
                    if (
                      index ===
                      averageSalaryReportData?.qualityWiseReport.length - 1
                    ) {
                      averageSalaryReportData?.qualityWiseReport?.forEach(
                        (row) => {
                          finalTotalAmount +=
                            +row["1_to_15_total_amount"] +
                            +row["16_to_31_total_amount"];
                        }
                      );
                    }
                    const payable =
                      finalTotalAmount -
                      averageSalaryReportData?.advance_amount;

                    return (
                      <tr key={index + "_quality"}>
                        <td>{row.quality_name}</td>
                        <td>{row.production_rate}</td>
                        <td>{row["1_to_15_total_meter"]}</td>
                        <td>{row["16_to_31_total_meter"]}</td>
                        <td>{totalMeter}</td>
                        <td>{row["1_to_15_total_amount"]}</td>
                        <td>{row["16_to_31_total_amount"]}</td>
                        <td>{totalAmount}</td>
                        <td>
                          {index ===
                          averageSalaryReportData?.qualityWiseReport.length - 1
                            ? averageSalaryReportData?.advance_amount || 0
                            : ""}
                        </td>
                        <td>
                          {index ===
                          averageSalaryReportData?.qualityWiseReport.length - 1
                            ? payable || 0
                            : ""}
                        </td>
                      </tr>
                    );
                  }
                )
              ) : (
                <tr>
                  <td colSpan={10}>No Data found</td>
                </tr>
              )}
              <tr>
                <td>
                  <b>Total</b>
                </td>
                <td></td>
                <td>{Quality_Total.total_1_15_meter}</td>
                <td>{Quality_Total.total_16_31_meter}</td>
                <td>{Quality_Total.totalMeter}</td>
                <td>{Quality_Total.total_1_15_amt}</td>
                <td>{Quality_Total.total_16_31_amt}</td>
                <td>{Quality_Total.totalAmount}</td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </Col>
        <Col span={8}>
          <Flex style={{ flexDirection: "column" }} gap={12}>
            <table
              border={1}
              style={{
                borderCollapse: "collapse",
                width: "100%",
                textAlign: "center",
              }}
              className="custom-table"
            >
              <thead>
                <tr>
                  <th>Dt</th>
                  <th>Avg</th>
                  <th>Grand Avg</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1 to 15</td>
                  <td>100</td>
                  <td colSpan={2}>100</td>
                </tr>
                <tr>
                  <td>15 to 30</td>
                  <td>0</td>
                  <td></td>
                </tr>
              </tbody>
            </table>

            <table
              border={1}
              style={{
                borderCollapse: "collapse",
                width: "100%",
                textAlign: "center",
              }}
              className="custom-table"
            >
              <thead>
                <tr>
                  <th>Dt</th>
                  <th>Avg</th>
                  <th>Grand Avg</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1 to 15</td>
                  <td>100</td>
                  <td colSpan={2}>100</td>
                </tr>
                <tr>
                  <td>15 to 30</td>
                  <td>0</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </Flex>
        </Col>
      </Row>

      <br />
      <table
        border={1}
        style={{
          borderCollapse: "collapse",
          width: "100%",
          textAlign: "center",
        }}
        className="custom-table"
      >
        <thead>
          <tr>
            <th>Dt</th>
            <th colSpan={header?.length}>
              Click on search to change the color &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              (Machine Numbers)
            </th>
            <th>Total</th>
          </tr>
          <tr>
            <td></td>
            {header && header.length ? (
              header?.map((item, index) => (
                <td key={index + "_machine_no"}>{item}</td>
              ))
            ) : (
              <td>-</td>
            )}
            <td></td>
          </tr>
        </thead>
        <tbody>
          {data1 && data1.length ? (
            data1.map((day) => {
              const machineData = averageSalaryReportData.result[day];

              let total = 0;
              header.forEach((machineNo) => {
                const machineWiseUserData = machineData[machineNo];

                total += !_.isEmpty(machineWiseUserData)
                  ? +machineWiseUserData.day_meter ||
                    0 + +machineWiseUserData.night_meter ||
                    0
                  : 0;
              });

              return (
                <tr key={day}>
                  <td style={{ textAlign: "center" }}>{day}</td>

                  {header && header.length ? (
                    header.map((machineNo) => {
                      const machineWiseUserData = machineData[machineNo];

                      return (
                        <td
                          key={machineNo + "_machine_wise_user_data"}
                          style={{ textAlign: "center" }}
                        >
                          {!_.isEmpty(machineWiseUserData)
                            ? +machineWiseUserData.day_meter ||
                              0 + +machineWiseUserData.night_meter ||
                              0
                            : "-"}{" "}
                        </td>
                      );
                    })
                  ) : (
                    <td style={{ textAlign: "center" }}>-</td>
                  )}
                  <td style={{ textAlign: "center" }}>{total}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={3} style={{ textAlign: "center" }}>
                No Data Found
              </td>
            </tr>
          )}
          <tr style={{ fontWeight: "bold", border: "2px solid #000" }}>
            <td style={{ textAlign: "center" }}>Mtr</td>
            {header && header.length ? (
              header.map((machineNo) => {
                return (
                  <td
                    key={machineNo + "_total"}
                    style={{ textAlign: "center" }}
                  >
                    {First_Total[machineNo]}
                  </td>
                );
              })
            ) : (
              <td>-</td>
            )}
          </tr>

          {data2 && data2.length ? (
            data2.map((day) => {
              const machineData = averageSalaryReportData.result[day];

              let total = 0;
              header.forEach((machineNo) => {
                const machineWiseUserData = machineData[machineNo];

                total += !_.isEmpty(machineWiseUserData)
                  ? +machineWiseUserData.day_meter ||
                    0 + +machineWiseUserData.night_meter ||
                    0
                  : 0;
              });

              return (
                <tr key={day}>
                  <td style={{ textAlign: "center" }}>{day}</td>

                  {header && header.length ? (
                    header.map((machineNo) => {
                      const machineWiseUserData = machineData[machineNo];

                      return (
                        <td
                          key={machineNo + "_machine_wise_user_data"}
                          style={{ textAlign: "center" }}
                        >
                          {!_.isEmpty(machineWiseUserData)
                            ? +machineWiseUserData.day_meter ||
                              0 + +machineWiseUserData.night_meter ||
                              0
                            : "-"}{" "}
                        </td>
                      );
                    })
                  ) : (
                    <td style={{ textAlign: "center" }}>-</td>
                  )}
                  <td style={{ textAlign: "center" }}>{total}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={3} style={{ textAlign: "center" }}>
                No Data Found
              </td>
            </tr>
          )}
          <tr style={{ fontWeight: "bold", border: "2px solid #000" }}>
            <td style={{ textAlign: "center" }}>Mtr</td>
            {header && header.length ? (
              header.map((machineNo) => {
                return (
                  <td
                    key={machineNo + "_total"}
                    style={{ textAlign: "center" }}
                  >
                    {Second_Total[machineNo]}
                  </td>
                );
              })
            ) : (
              <td>-</td>
            )}
          </tr>
          <tr style={{ fontWeight: "bold", border: "2px solid #000" }}>
            <td style={{ textAlign: "center" }}>Total</td>
            {header && header.length ? (
              header.map((machineNo) => {
                return (
                  <td
                    key={machineNo + "_total"}
                    style={{ textAlign: "center" }}
                  >
                    {Final_Total[machineNo]}
                  </td>
                );
              })
            ) : (
              <td>-</td>
            )}
          </tr>
        </tbody>
      </table>
    </Card>
  );
};
