import { useContext, useMemo } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { Flex, Spin, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { getAverageSalaryReportListRequest } from "../../../../api/requests/accounts/salary";
import _ from "lodash";

const MachineNoWiseTable = ({ month, machineNo, machineName }) => {
  const { company, companyId } = useContext(GlobalContext);

  // Generate dates dynamically based on the selected month
  const generateDates = (day) => {
    const startOfMonth = month.startOf("month"); // First day of the month
    // const daysInMonth = month.daysInMonth(); // Total days in the selected month

    // return Array.from({ length: daysInMonth }, (_, i) => {
    return startOfMonth.add(+day - 1, "day").format("DD-MM-YYYY");
    // });
  };

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
        month: month,
        machine_no: machineNo,
        machine_name: machineName,
      },
    ],
    queryFn: async () => {
      const params = {
        company_id: companyId,
        machine_no: machineNo,
        machine_name: machineName,
        month: dayjs(month).format("MM-YYYY"),
        is_user_group: 0,
      };

      const response = await getAverageSalaryReportListRequest({ params });
      return response.data.data;
    },
    enabled: Boolean(companyId && machineNo),
  });

  const header = useMemo(() => {
    if (
      averageSalaryReportData &&
      averageSalaryReportData?.involvedUsers?.length
    ) {
      return averageSalaryReportData?.involvedUsers?.map((item) => ({
        userId: item.id,
        username: item?.userName,
      }));
    } else {
      return [];
    }
  }, [averageSalaryReportData]);

  const data = useMemo(() => {
    if (averageSalaryReportData && averageSalaryReportData.result) {
      return Object.keys(averageSalaryReportData.result);
    } else {
      return [];
    }
  }, [averageSalaryReportData]);

  const Total = useMemo(() => {
    const totalData = {};
    if (data && data.length && header && header.length) {
      header.forEach((user) => {
        let total = 0;
        data.forEach((day) => {
          const userData = averageSalaryReportData.result[day];
          const userSalaryData = userData[user.userId];
          const value = userSalaryData
            ? (userSalaryData.day_meter || 0) +
              (userSalaryData.night_meter || 0)
            : 0;
          total += value;
        });
        totalData[user.userId] = total;
      });
    }
    return totalData;
  }, [averageSalaryReportData, data, header]);

  return (
    <>
      <Flex
        justify="center"
        gap={6}
        align="center"
        style={{
          flexDirection: "column",
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
          {company?.company_name || ""}
        </Typography.Text>
        <Typography.Text
          style={{
            color: "rgb(25 74 109)",
            fontSize: "0.8rem",
            fontWeight: "bold",
          }}
        >
          {dayjs(month).format("MMMM-YYYY")}
        </Typography.Text>
      </Flex>
      {isLoadingAverageSalaryReport ? (
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
      ) : (
        <div style={{ maxHeight: "calc(100vh - 260px)", overflowY: "scroll" }}>
          <table className="custom-table">
            <thead style={{ position: "sticky", top: 0, zIndex: 9 }}>
              <tr>
                <td>Date</td>
                {/* <td>Taka No.</td> */}
                {header.map((user) => (
                  <td key={user.userId}>{user.username}</td>
                ))}
              </tr>
            </thead>
            <tbody>
              {data && data.length ? (
                data.map((day) => {
                  const newDate = generateDates(day);
                  const userData = averageSalaryReportData.result[day];

                  return (
                    <tr key={day + "_machine_wise"}>
                      <td style={{ textAlign: "center" }}>{newDate}</td>
                      {/* <td style={{ textAlign: "center" }}>-</td> */}
                      {header.map((user) => {
                        const userSalaryData = userData[user.userId];

                        return (
                          <td
                            key={user.userId + "_machine_wise_user_data"}
                            style={{ textAlign: "center" }}
                          >
                            {!_.isEmpty(userSalaryData)
                              ? +userSalaryData.day_meter ||
                                0 + +userSalaryData.night_meter ||
                                0
                              : "-"}{" "}
                            &nbsp;&nbsp;&nbsp;
                            {!_.isEmpty(userSalaryData) ? (
                              <Tag color="blue">
                                Taka No: {userSalaryData?.taka_no}
                              </Tag>
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={2 + header.length}
                    style={{ textAlign: "center" }}
                  >
                    No data found
                  </td>
                </tr>
              )}
              <tr
                style={{
                  position: "sticky",
                  bottom: -1,
                  backgroundColor: "white",
                }}
              >
                <td>Total</td>
                {header.map((user) => {
                  return (
                    <td
                      key={user.userId + "_machine_wise_total"}
                      style={{ textAlign: "center" }}
                    >
                      <b>{Total[user.userId]}</b>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default MachineNoWiseTable;
