import React from "react";
import { Treemap, ResponsiveContainer } from "recharts";

const data = [
  { name: "OperatorSwitch", size: 2901 },
  { name: "SortOperator", size: 2023 },
];

const TreeMap = (props) => {
  return (
    <Treemap
      width={props.isModalOpen ? 550 : 350}
      height={props.isModalOpen ? 400 : 200}
      data={data}
      dataKey="size"
      aspectRatio={4 / 3}
      stroke="#fff"
      fill="#8884d8"
    />
  );
};

export default TreeMap;
