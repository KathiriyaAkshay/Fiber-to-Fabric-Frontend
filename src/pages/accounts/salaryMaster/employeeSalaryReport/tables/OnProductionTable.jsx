import { CheckOutlined } from "@ant-design/icons";
import { Button, Checkbox, Flex, Input, Tag, Tooltip, Typography } from "antd";
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
}) => {
  const [bonusValue, setBonusValue] = useState(0);
  const [deductionValue, setDeductionValue] = useState(0);
  const [cfAdvanceValue, setCfAdvanceValue] = useState(0);

  const isPaid = row.salary_paid_log?.length;
  const totalProduction = (
    <>
      <span>0 x {+row.regular_rate || 0}</span> (per taka)
      <br />
      <span>0 x {+row.rework_rate || 0}</span> (per taka)
    </>
  );
  const calculatedTotalProduction =
    0 * (+row.regular_rate || 0) + 0 * (+row.rework_rate || 0);

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
      const data = {
        user_id: row.user.id,
        bonus: +bonusValue,
        deduction: +deductionValue,
        cf_advance: +cfAdvanceValue,
        time_slice: timeSlice,
        createdAt: dayjs().format("YYYY-MM-DD"),
        salary_type: row.salary_type,
      };
      createSalaryReportComponents(data);
    } catch (error) {
      console.log(error);
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
