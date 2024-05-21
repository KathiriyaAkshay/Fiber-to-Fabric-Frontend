import { useContext } from "react";
import { Select } from "antd";
import { GlobalContext } from "../../../contexts/GlobalContext";
import dayjs from "dayjs";
import { getFinancialYearEnd } from "../../../utils/dayjs";

const currentDate = dayjs();
const currentYearEnd = getFinancialYearEnd(currentDate);

function YearSelection() {
  const { financialYearEnd, setFinancialYearEnd } = useContext(GlobalContext);

  return (
    <Select
      placeholder="Year"
      options={[
        {
          label: `${currentYearEnd - 2} - ${currentYearEnd - 1}`,
          value: currentYearEnd - 1,
        },
        {
          label: `${currentYearEnd - 1} - ${currentYearEnd}`,
          value: currentYearEnd,
        },
      ]}
      className="w-32 text-primary"
      value={financialYearEnd}
      onChange={setFinancialYearEnd}
    />
  );
}

export default YearSelection;
