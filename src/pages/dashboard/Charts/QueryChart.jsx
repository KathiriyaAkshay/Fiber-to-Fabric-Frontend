// import React from 'react'

import { MoneyIcon } from "../../../../public/icons/icons";

const QueryChart = ({icon, title, value, precision }) => {
  return <div className="query-chart-wrapper">
    <div className="w-full flex items-center gap-1 mb-2 h-2/6">
      <div className="query-chart-icon">
       {icon}
      </div>
      <div>{title}</div>
    </div>
    <div className="flex items-center w-full h-4/6 text-2xl">
      {value}
    </div>
  </div>;
};

export default QueryChart;
