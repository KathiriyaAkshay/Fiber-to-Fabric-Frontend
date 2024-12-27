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

// const formatData = (data, previousFinancialYear, currentFinancialYear) => {
//   const formattedData = [];
//   const financialYears = {
//     [previousFinancialYear]: {}, // Dynamically initialize previous financial year
//     [currentFinancialYear]: {}, // Dynamically initialize current financial year
//   };

//   // Initialize months map
//   const months = [
//     "Jan",
//     "Feb",
//     "Mar",
//     "Apr",
//     "May",
//     "Jun",
//     "Jul",
//     "Aug",
//     "Sep",
//     "Oct",
//     "Nov",
//     "Dec",
//   ];

//   // Loop through input data and categorize by financial year
//   data.forEach(({ totalMeter, productionMonth }) => {
//     const [year, month] = productionMonth.split("-").map(Number);
//     const monthIndex = month - 1; // Convert to 0-based index

//     // Determine the financial year
//     let financialYear;
//     if (month >= 4) {
//       // April to December
//       financialYear = `${year}-${year + 1}`;
//     } else {
//       // January to March
//       financialYear = `${year - 1}-${year}`;
//     }

//     // Initialize the financial year entry if it doesn't exist
//     if (!financialYears[financialYear]) {
//       financialYears[financialYear] = {};
//     }

//     // Add data to the specific month within the financial year
//     const monthName = months[monthIndex];
//     financialYears[financialYear][monthName] =
//       (financialYears[financialYear][monthName] || 0) + totalMeter;
//   });

//   // Ensure all months have data for each financial year
//   months.forEach((month) => {
//     const monthData = { name: month };

//     // Add data for each financial year, defaulting to 0 if no data available
//     for (const yearRange in financialYears) {
//       monthData[yearRange] = financialYears[yearRange][month] || 0;
//     }

//     formattedData.push(monthData);
//   });

//   return formattedData;
// };

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

const CommonLineCharts = ({ isModalOpen, data }) => {

  return (
    <LineChart
      width={isModalOpen ? 550 : 400}
      height={isModalOpen ? 400 : 200}
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
        type="basis"
        dataKey={previousFinancialYear}
        stroke="#8884d8"
        activeDot={{ r: 8 }}
      />
      <Line type="monotone" dataKey={currentFinancialYear} stroke="#82ca9d" />
    </LineChart>
  );
};

export default CommonLineCharts;
