import { ArrowsAltOutlined } from "@ant-design/icons";
import { Button, Flex, Modal } from "antd";
import React, { useState } from "react";
import { BarChart, ResponsiveContainer, Treemap } from "recharts";
import LineCharts from "../Charts/LineCharts";
import BarCharts from "../Charts/BarCharts";
import "./style.css";
import PieCharts from "../Charts/PieChart";
import RadicalCharts from "../Charts/RadicalCharts";
import TreeMap from "../Charts/TreeMap";
import DataTable from "../Charts/DataTable";
export const ChartWrapper = (props) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const handleCancel = () => {
    setModalOpen(false);
  };
  const renderChart = (modal) => {
    if (props.chart === "LINE") {
      return <LineCharts isModalOpen={modal} />;
    } else if (props.chart === "BAR") {
      return <BarCharts isModalOpen={modal} />;
    } else if (props.chart === "PIE") {
      return <PieCharts isModalOpen={modal} />;
    } else if (props.chart === "RADICAL") {
      return <RadicalCharts isModalOpen={modal} />;
    } else if (props.chart === "TREE") {
      return <TreeMap isModalOpen={modal} />;
    } else if (props.chart === "TABLE") {
      return <DataTable isModalOpen={modal} />;
    }
  };
  return (
    <div className="chart-wrapper">
      <Flex justify="space-between" align="center" className="mb-2">
        <div>{props.header}</div>
        <div>
          <Button
            onClick={() => setModalOpen(true)}
            icon={<ArrowsAltOutlined />}
          />
        </div>
      </Flex>
      <div width="100%" height="100%">
        <ResponsiveContainer>{renderChart()}</ResponsiveContainer>
      </div>
      <Modal
        open={isModalOpen}
        onCancel={handleCancel}
        width="max-content"
        height="70%"
        footer={[]}
      >
        <ResponsiveContainer>{renderChart(isModalOpen)}</ResponsiveContainer>
      </Modal>
    </div>
  );
};
