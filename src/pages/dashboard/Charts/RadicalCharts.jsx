import React from "react";
import {
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBar,
  RadialBarChart,
} from "recharts";

const style = {
  top: "50%",
  right: 0,
  transform: "translate(0, -50%)",
  lineHeight: "24px",
};

const RadicalCharts = (props) => {
  const RadicalData = [
    {
      name: "18-24",
      uv: 31.47,
      pv: 2400,
      fill: "#8884d8",
    },
    {
      name: "25-29",
      uv: 29.69,
      pv: 4567,
      fill: "#83a6ed",
    },
    {
      name: "25-29",
      uv: 21.69,
      pv: 4567,
      fill: "#83a6d",
    },
  ];
  return (
    <RadialBarChart
      width={props.isModalOpen ? 550 : 350}
      height={props.isModalOpen ? 400 : 200}
      innerRadius="10%"
      outerRadius="80%"
      barSize={10}
      data={RadicalData}
    >
      <Tooltip />
      <RadialBar
        minAngle={15}
        label={{ position: "insideStart", fill: "#fff" }}
        background
        clockWise
        dataKey="uv"
      />
      <Legend
        iconSize={10}
        layout="vertical"
        verticalAlign="middle"
        wrapperStyle={style}
      />
    </RadialBarChart>
  );
};

export default RadicalCharts;
