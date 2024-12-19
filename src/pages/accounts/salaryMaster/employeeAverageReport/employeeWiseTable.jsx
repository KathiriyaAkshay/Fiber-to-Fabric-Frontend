import { useQuery } from "@tanstack/react-query";
import { getAverageSalaryReportListRequest } from "../../../../api/requests/accounts/salary";
import dayjs from "dayjs";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { useContext } from "react";
import { Card, Flex, Spin, Typography } from "antd";

const EmployeeWiseTable = ({ month, machineName, employee }) => {
  return (
    <>
      {employee?.map((employee, index) => {
        return (
          <UserAverageReport
            key={index}
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
        // machine_no: machineNo,
        machine_name: machineName,
      },
    ],
    queryFn: async () => {
      const params = {
        company_id: companyId,
        // machine_no: machineNo,
        machine_name: machineName,
        month: dayjs(month).format("MM-YYYY"),
        is_user_group: 1,
      };

      const response = await getAverageSalaryReportListRequest({ params });
      return response.data.data;
    },
    enabled: Boolean(companyId),
  });
  console.log({ averageSalaryReportData });

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
          {employee}
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
    </Card>
  );
};
