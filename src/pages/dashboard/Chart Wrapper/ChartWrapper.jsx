import { ArrowsAltOutlined } from "@ant-design/icons";
import { Button, Flex, Modal } from "antd";
import { useState } from "react";
import { ResponsiveContainer } from "recharts";
import LineCharts from "../Charts/LineCharts";
import BarCharts from "../Charts/BarCharts";
import "./style.css";
import PieCharts from "../Charts/PieChart";
import RadicalCharts from "../Charts/RadicalCharts";
import TreeMap from "../Charts/TreeMap";
import DataTable from "../Charts/DataTable";

export const ChartWrapper = ({ header, chart, companyId }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const handleCancel = () => {
    setModalOpen(false);
  };

  const renderChart = (modal) => {
    if (chart === "LINE") {
      return <LineCharts isModalOpen={modal} companyId={companyId} />;
    } else if (chart === "BAR") {
      return <BarCharts isModalOpen={modal} companyId={companyId} />;
    } else if (chart === "PIE") {
      return <PieCharts isModalOpen={modal} companyId={companyId} />;
    } else if (chart === "RADICAL") {
      return <RadicalCharts isModalOpen={modal} companyId={companyId} />;
    } else if (chart === "TREE") {
      return <TreeMap isModalOpen={modal} companyId={companyId} />;
    } else if (chart === "TABLE") {
      return <DataTable isModalOpen={modal} companyId={companyId} />;
    }
  };

  return (
    <div className="chart-wrapper">
      <Flex justify="space-between" align="center" className="mb-2">
        <div className="title">{header}</div>
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
