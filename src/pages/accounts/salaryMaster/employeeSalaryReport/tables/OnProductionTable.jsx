import { CheckOutlined } from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Flex,
  Input,
  message,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import _ from "lodash";
import { useEffect, useMemo, useState } from "react";
import { Controller } from "react-hook-form";

const OnProductionTable = ({
  data,
  selectedEntries,
  selectEntryHandler,
  selectAllEntries,
  createSalaryReportComponents,
  timeSlice,
  control,
  setValue,
  month,
}) => {
  console.log("OnProductionTable", data);
  return (
    <>
      <table className="custom-table">
        <thead>
          <tr>
            <td>
              <Checkbox onChange={(e) => selectAllEntries(e, data)} /> Action
            </td>
            <td width={250}>Employee</td>
            <td>Type</td>
            <td>Total Production</td>
            <td>Bonus</td>
            <td>Deduction</td>
            <td>Total</td>
            <td>Advance</td>
            <td>CF Advance</td>
            <td>Payable</td>
            <td></td>
          </tr>
        </thead>
        <tbody>
          {data && data.salary_report.length ? (
            data.salary_report.map((row) => {
              return (
                <TableRow
                  key={row.id + "_on_production"}
                  row={row}
                  selectedEntries={selectedEntries}
                  selectEntryHandler={selectEntryHandler}
                  timeSlice={timeSlice}
                  createSalaryReportComponents={createSalaryReportComponents}
                  control={control}
                  setValue={setValue}
                  month={month}
                />
              );
            })
          ) : (
            <tr>
              <td colSpan={11} style={{ textAlign: "center" }}>
                No records found
              </td>
            </tr>
          )}

          <tr>
            <td>Total</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

export default OnProductionTable;

const TableRow = ({
  row,
  selectedEntries,
  selectEntryHandler,
  timeSlice,
  createSalaryReportComponents,
  control,
  setValue,
  month,
}) => {
  const [bonusValue, setBonusValue] = useState(0);
  const [deductionValue, setDeductionValue] = useState(0);
  const [cfAdvanceValue, setCfAdvanceValue] = useState(0);

  const isPaid = row.salary_paid_log?.length;
  const totalProduction = (
    <>
      {/* Regular */}
      <span>
        {row?.is_regular_per_taka
          ? row?.total_folding_production_taka || 0
          : row?.total_meter || 0}{" "}
        x {+row.regular_rate || 0}
      </span>{" "}
      ({row?.is_regular_per_taka ? "per taka" : "per meter"})
      <br />
      {/* Rework  */}
      <span>
        {0} x {+row.rework_rate || 0}
      </span>{" "}
      ({row?.is_rework_per_taka ? "per taka" : "per meter"})
    </>
  );
  const calculatedTotalProduction =
    (row?.is_regular_per_taka
      ? row?.total_folding_production_taka || 0
      : row?.total_meter || 0) *
      (+row.regular_rate || 0) +
    0 * (+row.rework_rate || 0);

  // const bonus = _.isEmpty(row.components) ? 0 : 0;
  // const bonus = useMemo(() => {
  //   return _.isEmpty(row.components) ? 0 : row.components.bonus;
  // }, [row.components]);

  // const deduction = useMemo(() => {
  //   return _.isEmpty(row.components) ? 0 : row.components.deduction;
  // }, [row.components]);

  const tds = +row.tds || 0;
  // const calculateTotal = calculateAttendance + bonusValue - deductionValue;

  const total = useMemo(() => {
    const calculateTotal =
      calculatedTotalProduction + bonusValue - deductionValue;
    const final = calculateTotal - (calculateTotal * tds) / 100;
    return final;
  }, [bonusValue, calculatedTotalProduction, deductionValue, tds]);

  const advance = useMemo(() => {
    if (_.isEmpty(row.advance_salary)) {
      return 0;
    }
    return row.advance_salary.reduce((accumulator, currentValue) => {
      return accumulator + +currentValue.amount;
    }, 0);
  }, [row.advance_salary]);

  // const cfAdvance = _.isEmpty(row.components) ? 0 : 0;
  // const payable = useMemo(() => {
  //   return (+cfAdvanceValue + total - advance).toFixed(2);
  // }, [advance, cfAdvanceValue, total]);
  useEffect(() => {
    setValue(
      `payable_${row.id}`,
      (+cfAdvanceValue + total - advance).toFixed(2)
    );
  }, [advance, cfAdvanceValue, row.id, setValue, total]);

  useEffect(() => {
    setBonusValue(_.isEmpty(row.components) ? 0 : row.components.bonus);
    setDeductionValue(_.isEmpty(row.components) ? 0 : row.components.deduction);
    setCfAdvanceValue(
      _.isEmpty(row.components) ? 0 : row.components.cf_advance
    );
  }, [row.components]);

  const saveHandler = () => {
    try {
      const selectedMonth = dayjs(month); // `month` contains the selected month from DatePicker
      const currentDay = dayjs().date(); // Get the current day

      // Ensure the `currentDay` does not exceed the last day of the selected month
      const lastDayOfSelectedMonth = selectedMonth.daysInMonth();
      const validDay = Math.min(currentDay, lastDayOfSelectedMonth);

      // Construct the `createdAt` date with the selected month, year, and adjusted day
      const createdAt = selectedMonth.date(validDay).format("YYYY-MM-DD");

      const data = {
        user_id: row.user.id,
        bonus: +bonusValue,
        deduction: +deductionValue,
        cf_advance: +cfAdvanceValue,
        time_slice: timeSlice,
        createdAt: createdAt,
        salary_type: row.salary_type,
      };
      createSalaryReportComponents(data);
    } catch (error) {
      message.error(error.message || "Something went wrong!");
    }
  };

  const isSelected = selectedEntries.find((item) => item.id === row.id);

  return (
    <tr>
      <td style={{ textAlign: "center" }}>
        {!isPaid ? (
          <Checkbox
            checked={Boolean(isSelected)}
            onChange={(e) => selectEntryHandler(e, row)}
          />
        ) : null}
      </td>
      <td style={{ cursor: "pointer" }}>
        <Tooltip
          title={
            <>
              <Flex>
                <span>Name: </span>{" "}
                <span>
                  {row?.user?.first_name} {row?.user?.last_name}
                </span>
              </Flex>
              <Flex>
                <span>Mobile No: </span> <span>{row?.user?.mobile}</span>
              </Flex>
              <Flex>
                <span>Machine: </span> <span>{row?.machineNo_from}</span>
              </Flex>
              <Flex>
                <span>Paid Date: </span>{" "}
                <span>{isPaid ? "Paid  date" : "UnPaid"}</span>
              </Flex>
            </>
          }
        >
          {row?.user?.first_name} {row?.user?.last_name} ({row.machineNo_from}-
          {row.machineNo_to}){isPaid ? <Tag color="green">Paid</Tag> : null}
        </Tooltip>
      </td>
      <td></td>
      <td>{totalProduction}</td>
      <td>
        <Input
          style={{ width: "150px" }}
          placeholder="1200"
          className="remove-input-box"
          value={bonusValue}
          onChange={(e) => setBonusValue(e.target.value)}
        />
      </td>
      <td>
        <Input
          style={{ width: "150px" }}
          placeholder="1200"
          className="remove-input-box"
          value={deductionValue}
          onChange={(e) => setDeductionValue(e.target.value)}
        />
      </td>
      <td>
        <Typography>
          {total.toFixed(2)} <span style={{ color: "blue" }}>({tds}%)</span>
        </Typography>
      </td>
      <td>{advance}</td>
      <td>
        <Input
          style={{ width: "180px" }}
          placeholder="1200"
          className="remove-input-box"
          value={cfAdvanceValue}
          onChange={(e) => setCfAdvanceValue(e.target.value)}
        />
      </td>
      <td>
        <Controller
          control={control}
          name={`payable_${row.id}`}
          render={({ field }) => (
            <Input {...field} className="remove-input-box" />
          )}
        />
      </td>
      <td>
        <Button title="save" onClick={saveHandler}>
          <CheckOutlined style={{ color: "green" }} />
        </Button>
      </td>
    </tr>
  );
};
