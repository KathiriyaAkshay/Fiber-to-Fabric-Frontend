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
import { useEffect, useMemo, useState } from "react";
import _ from "lodash";
import { CheckOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { Controller } from "react-hook-form";

const WorkBasisTable = ({
  data,
  selectedEntries,
  selectEntryHandler,
  selectAllEntries,
  createSalaryReportComponents,
  timeSlice,
  control,
  setValue,
}) => {
  const header = useMemo(() => {
    if (data && data.salary_report.length) {
      const qualityData = data.salary_report[0].result;
      return qualityData.map((item) => {
        return item?.quality?.quality_name;
      });
    } else {
      return [];
    }
  }, [data]);

  return (
    <>
      <table className="custom-table">
        <thead>
          <tr>
            <td>
              <Checkbox onChange={(e) => selectAllEntries(e, data)} />{" "}
              &nbsp;&nbsp; Action
            </td>
            <td width={150}>Employee</td>
            {header.map((item) => {
              return <td key={item}>{item}</td>;
            })}
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
                  key={row.id + "_work_basis"}
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
              <td colSpan={9} style={{ textAlign: "center" }}>
                No records found
              </td>
            </tr>
          )}

          <tr>
            <td>Total</td>
            <td></td>
            {header.map((item) => (
              <td key={item + "_total"}></td>
            ))}
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

export default WorkBasisTable;

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
  // const attendance = `${+row.total_present_count || 0} x ${
  //   +row.per_attendance || 0
  // }`;
  // const calculateAttendance =
  //   (+row.total_present_count || 0) * (+row.per_attendance || 0);

  const qualityData = useMemo(() => {
    if (row && row.result.length) {
      return row.result.map((item) => {
        const dayMeter = item.monthly_report.length ? 0 : 0;
        return {
          value: `${item.quality.production_rate} x ${dayMeter}`,
          production_rate: item.quality.production_rate,
          dayMeter,
        };
      });
    } else {
      return [];
    }
  }, [row]);

  const tds = +row.tds || 0;

  const total = useMemo(() => {
    let qualityTotal = 0;
    qualityData.forEach((item) => {
      qualityTotal += item.production_rate * item.dayMeter;
    });
    console.log({ qualityTotal });

    const calculateTotal = qualityTotal + bonusValue - deductionValue;
    const final = calculateTotal - (calculateTotal * tds) / 100;
    return final;
  }, [bonusValue, deductionValue, qualityData, tds]);

  const advance = useMemo(() => {
    if (_.isEmpty(row.advance_salary)) {
      return 0;
    }
    return row.advance_salary.reduce((accumulator, currentValue) => {
      return accumulator + +currentValue.amount;
    }, 0);
  }, [row.advance_salary]);

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
      {qualityData && qualityData.length
        ? qualityData.map((item) => {
            return <td key={item.value}>{item.value}</td>;
          })
        : null}
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
