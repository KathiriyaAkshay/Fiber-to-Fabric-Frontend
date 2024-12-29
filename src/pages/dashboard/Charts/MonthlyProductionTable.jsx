import { Flex, Spin } from "antd";
import { useContext, useEffect, useMemo, useState } from "react";
import { getMonthlyProductionChartRequest } from "../../../api/requests/dashboard";
import { useQuery } from "@tanstack/react-query";
import { GlobalContext } from "../../../contexts/GlobalContext";

const formatData = (data, previousFinancialYear, currentFinancialYear) => {
  const formattedData = [];
  const financialYears = {
    [previousFinancialYear]: {}, // Dynamically initialize previous financial year
    [currentFinancialYear]: {}, // Dynamically initialize current financial year
  };

  // Initialize months map
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Loop through input data and categorize by financial year
  data.forEach(({ totalMeter, productionMonth }) => {
    const [year, month] = productionMonth.split("-").map(Number);
    const monthIndex = month - 1; // Convert to 0-based index

    // Determine the financial year
    let financialYear;
    if (month >= 4) {
      // April to December
      financialYear = `${year}-${year + 1}`;
    } else {
      // January to March
      financialYear = `${year - 1}-${year}`;
    }

    // Only process data for the current and previous financial year
    if (
      financialYear === previousFinancialYear ||
      financialYear === currentFinancialYear
    ) {
      // Initialize the financial year entry if it doesn't exist
      if (!financialYears[financialYear]) {
        financialYears[financialYear] = {};
      }

      // Add data to the specific month within the financial year
      const monthName = months[monthIndex];
      financialYears[financialYear][monthName] =
        (financialYears[financialYear][monthName] || 0) + totalMeter;
    }
  });

  // Ensure all months have data for each financial year
  months.forEach((month) => {
    const monthData = { name: month };

    // Add data for each financial year, defaulting to 0 if no data available
    for (const yearRange in financialYears) {
      if (financialYears[yearRange]) {
        monthData[yearRange] = financialYears[yearRange][month] || 0;
      }
    }

    formattedData.push(monthData);
  });

  return formattedData;
};

const MonthlyProductionTable = () => {
  const { companyId } = useContext(GlobalContext);

  const [currentFinancialYear, setCurrentFinancialYear] = useState("");
  const [previousFinancialYear, setPreviousFinancialYear] = useState("");

  useEffect(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // getMonth() returns 0-11

    // Determine the start year of the current financial year
    const startYear = currentMonth >= 4 ? currentYear : currentYear - 1;
    const endYear = startYear + 1;

    const currentFY = `${startYear}-${endYear}`;
    const previousFY = `${startYear - 1}-${startYear}`;

    setCurrentFinancialYear(currentFY);
    setPreviousFinancialYear(previousFY);
  }, []);

  const { data: productionMeterData, isLoading } = useQuery({
    queryKey: ["get", "monthly", "production"],
    queryFn: async () => {
      const params = {
        company_id: companyId,
      };
      const response = await getMonthlyProductionChartRequest({ params });
      return response.data.data;
    },
  });

  const formattedData = useMemo(() => {
    if (productionMeterData && currentFinancialYear && previousFinancialYear) {
      return formatData(
        productionMeterData,
        previousFinancialYear,
        currentFinancialYear
      );
    }
  }, [currentFinancialYear, previousFinancialYear, productionMeterData]);

  return (
    <div className="chart-wrapper">
      <Flex justify="space-between" align="center" className="mb-2">
        <div className="title" style={{
          fontWeight: 600, 
          color: "#000"
        }}>Monthly Production (Meter)</div>
      </Flex>

      {isLoading ? (
        <Spin />
      ) : (
        <div style={{ maxHeight: "210px", overflowY: "scroll" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse" }}
            border={1}
            className="dashboard-monthlyproduction-table"
          >
            <thead>
              <tr>
                <th></th>
                <th>{currentFinancialYear}</th>
                <th>{previousFinancialYear}</th>
              </tr>
            </thead>
            <tbody>
              {formattedData && formattedData?.length ? (
                formattedData.map((data, index) => {
                  return (
                    <tr key={index}>
                      <td style={{
                        fontWeight: 600
                      }}>{data?.name}</td>
                      <td style={{ textAlign: "center" }}>
                        {data[currentFinancialYear].toFixed(2)}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {data[previousFinancialYear].toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={3}>No Data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MonthlyProductionTable;
