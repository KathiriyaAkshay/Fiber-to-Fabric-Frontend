import { Radio } from "antd";
import { useMemo, useState } from "react";
import MillgineStore from "./MillgineStore";
import MaterialStore from "./MaterialStore";
import MillgineReport from "./MillgineReport";

const materialOptions = [
  { label: "Millgine Store", value: "millginre_store" },
  { label: "Material Store", value: "material_store" },
  { label: "Millgine Report", value: "millgine_report" },
];

const Material = () => {
  const [option, setOption] = useState("millginre_store");

  const renderList = useMemo(() => {
    switch (option) {
      case "millginre_store":
        return <MillgineStore />;

      case "material_store":
        return <MaterialStore />;

      case "millgine_report":
        return <MillgineReport />;

      default:
        break;
    }
  }, [option]);

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-center gap-5 mx-3 mb-3">
        {/* <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary">Material</h3>
        </div> */}
        {/* <Flex style={{ marginLeft: "auto" }} gap={10} justify="center"> */}
        <Radio.Group
          value={option}
          onChange={(e) => setOption(e.target.value)}
          className="payment-options"
        >
          {materialOptions.map(({ label, value }, index) => {
            return (
              <Radio key={index + "_material_option"} value={value}>
                {label}
              </Radio>
            );
          })}
        </Radio.Group>
        {/* </Flex> */}
      </div>
      {renderList}
    </div>
  );
};

export default Material;
