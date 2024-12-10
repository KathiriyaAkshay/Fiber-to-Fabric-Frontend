import { useState } from "react";
import {
  Button,
  Radio,
  Select,
  DatePicker,
  Flex,
  Typography,
  Input,
  Switch,
} from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import { disabledFutureDate } from "../../../../utils/date";
import dayjs from "dayjs";
import useDebounce from "../../../../hooks/useDebounce";
import { SALARY_TYPES } from "../../../../constants/account";
import { useNavigate } from "react-router-dom";

const DURATION = [
  { label: "1 to 15", value: "1_15" },
  { label: "16 to 31", value: "16_31" },
  { label: "Month", value: "month" },
];

const SalaryReportList = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [salaryType, setSalaryType] = useState(null);
  const [month, setMonth] = useState(dayjs());
  const [duration, setDuration] = useState("month");

  const debounceSearch = useDebounce(search, 500);
  const debounceSalaryType = useDebounce(salaryType, 500);
  const debounceMonth = useDebounce(month, 500);
  const debounceDuration = useDebounce(duration, 500);

  console.log({
    debounceSearch,
    debounceSalaryType,
    debounceMonth,
    debounceDuration,
  });

  return (
    <>
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-5 mx-3 mb-3">
          <div className="flex items-center gap-2">
            <h3 className="m-0 text-primary">Employee Salary Report</h3>
            <Button
              icon={<PlusCircleOutlined />}
              type="text"
              onClick={() => {
                navigate("add");
              }}
            ></Button>
          </div>
        </div>

        <Flex align="center" justify="space-between">
          <Flex gap={12}>
            <Flex align="center" gap={10}>
              <Flex align="center" gap={10}>
                <Input
                  placeholder="Search here"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </Flex>

              <Typography.Text className="whitespace-nowrap">
                Salary Type
              </Typography.Text>
              <Select
                allowClear
                placeholder="Select salary type"
                dropdownStyle={{
                  textTransform: "capitalize",
                }}
                style={{
                  textTransform: "capitalize",
                }}
                className="min-w-40"
                value={salaryType}
                onChange={setSalaryType}
                options={SALARY_TYPES}
              />
            </Flex>

            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                From
              </Typography.Text>
              <DatePicker
                picker="month"
                value={month}
                onChange={setMonth}
                disabledDate={disabledFutureDate}
                maxDate={dayjs()}
              />
            </Flex>

            <Flex align="center" gap={10}>
              <Radio.Group
                name="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="payment-options"
              >
                {DURATION.map(({ label, value }) => {
                  return (
                    <Radio key={value} value={value}>
                      {label}
                    </Radio>
                  );
                })}
              </Radio.Group>
            </Flex>
          </Flex>
          <Flex align="center" gap={10}>
            <Button title="Generate salary report">G</Button>
            <Button type="primary">Summary</Button>
            <Button type="primary">Save</Button>
          </Flex>
        </Flex>

        <Flex
          justify="space-between"
          gap={12}
          style={{
            padding: "12px 50px",
            backgroundColor: "var(--secondary-color)",
          }}
        >
          <Switch />
          <Typography.Text
            style={{
              color: "rgb(25 74 109)",
              fontSize: "1rem",
              fontWeight: "bold",
            }}
          >
            {dayjs(month).format("MMMM YYYY")}, Salary Report
          </Typography.Text>
        </Flex>
        {/* {renderTable()} */}
      </div>
    </>
  );
};

export default SalaryReportList;
