import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
const BarCharts = (props) => {
  const data = props?.data || [];
  console.log(data);
  
  return (
    <BarChart
      width={props.isModalOpen ? 550 : 350}
      height={props.isModalOpen ? 400 : 200}
      data={data}
      margin={{
        top: 20,
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
      <Bar dataKey={"pv"} label = {props?.name} stackId="a" fill="#8884d8" />
    </BarChart>
  );
};

export default BarCharts;
