import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { getMonthlyProductionChartRequest } from "../../../api/requests/dashboard";
import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "antd";
import { LineChartOutlined } from "@ant-design/icons";

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

    // Initialize the financial year entry if it doesn't exist
    if (!financialYears[financialYear]) {
      financialYears[financialYear] = {};
    }

    // Add data to the specific month within the financial year
    const monthName = months[monthIndex];
    financialYears[financialYear][monthName] =
      (financialYears[financialYear][monthName] || 0) + totalMeter;
  });

  // Ensure all months have data for each financial year
  months.forEach((month) => {
    const monthData = { name: month };

    // Add data for each financial year, defaulting to 0 if no data available
    for (const yearRange in financialYears) {
      monthData[yearRange] = financialYears[yearRange][month] || 0;
    }

    formattedData.push(monthData);
  });

  return formattedData;
};

const LineCharts = ({ isModalOpen, companyId }) => {
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

  // const data = [
  //   {
  //     name: "Jan",
  //     "2023-2024": 4000,
  //     "2024-2025": 2400,
  //   },
  //   {
  //     name: "Feb",
  //     "2023-2024": 500,
  //     "2024-2025": 600,
  //   },
  //   {
  //     name: "Mar",
  //     "2023-2024": 3000,
  //     "2024-2025": 2500,
  //   },
  //   {
  //     name: "Apr",
  //     "2023-2024": 1500,
  //     "2024-2025": 1000,
  //   },
  //   {
  //     name: "May",
  //     "2023-2024": 500,
  //     "2024-2025": 200,
  //   },
  //   {
  //     name: "June",
  //     "2023-2024": 4500,
  //     "2024-2025": 3000,
  //     // amt: 2500,
  //   },
  //   {
  //     name: "July",
  //     "2023-2024": 2350,
  //     "2024-2025": 4690,
  //     // amt: 2100,
  //   },
  //   {
  //     name: "Aug",
  //     "2023-2024": 1000,
  //     "2024-2025": 1200,
  //     // amt: 2100,
  //   },
  //   {
  //     name: "Sept",
  //     "2023-2024": 1000,
  //     "2024-2025": 1000,
  //     // amt: 2100,
  //   },
  // ];

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

  if (isLoading) {
    return (
      <Skeleton.Node
        className="monthly-production-line-chart-skeleton"
        active={isLoading}
        // style={{ width: "100% !important", height: "200px" }}
      >
        <LineChartOutlined style={{ fontSize: 100, color: "#bfbfbf" }} />
      </Skeleton.Node>
    );
  }

  return (
    <LineChart
      width={isModalOpen ? 550 : 450}
      height={isModalOpen ? 400 : 200}
      data={formattedData}
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
        type="basis"
        dataKey={previousFinancialYear}
        stroke="#8884d8"
        activeDot={{ r: 8 }}
      />
      <Line type="monotone" dataKey={currentFinancialYear} stroke="#82ca9d" />
    </LineChart>
  );
};

export default LineCharts;
