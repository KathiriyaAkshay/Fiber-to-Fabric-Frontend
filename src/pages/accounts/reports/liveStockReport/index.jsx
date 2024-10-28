import { Radio } from "antd";
import { useMemo, useState } from "react";
import LiveStockSummary from "./LiveStockSummary";
import CurrentStock from "./CurrentStock";
import OpeningStock from "./OpeningStock";

const OPTIONS = [
  { label: "Live Stock Summary", value: "live_stock_summary" },
  { label: "Opening Stock", value: "opening_stock" },
  { label: "Current Stock", value: "current_stock" },
];

const LiveStockReport = () => {
  const [selectedOption, setSelectedOption] = useState("live_stock_summary");

  const renderContent = useMemo(() => {
    switch (selectedOption) {
      case "live_stock_summary":
        return <LiveStockSummary />;

      case "opening_stock":
        return <OpeningStock />;

      case "current_stock":
        return <CurrentStock />;

      default:
        break;
    }
  }, [selectedOption]);

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary">Live Stock Report</h3>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <Radio.Group
            name="live_stock_report_filter"
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            className="payment-options"
          >
            {OPTIONS.map(({ label, value }) => {
              return (
                <Radio key={value} value={value}>
                  {label}
                </Radio>
              );
            })}
          </Radio.Group>
        </div>
      </div>
      {renderContent}
    </div>
  );
};

export default LiveStockReport;
