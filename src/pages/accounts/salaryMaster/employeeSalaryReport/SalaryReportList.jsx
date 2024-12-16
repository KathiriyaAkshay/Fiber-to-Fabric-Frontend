import { useContext, useMemo, useState } from "react";
import {
  Button,
  Radio,
  Select,
  DatePicker,
  Flex,
  Typography,
  Input,
  Switch,
  Spin,
  message,
} from "antd";
import { DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { disabledFutureDate } from "../../../../utils/date";
import dayjs from "dayjs";
import useDebounce from "../../../../hooks/useDebounce";
import { SALARY_TYPES } from "../../../../constants/account";
import { useNavigate } from "react-router-dom";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createPaidSalarySaveRequest,
  createSalaryReportComponentsRequest,
  getWorkBasisSalaryListRequest,
} from "../../../../api/requests/accounts/salary";
import WorkBasisTable from "./tables/WorkBasisTable";
import MonthlyTable from "./tables/MonthlyTable";
import AttendanceTable from "./tables/AttendanceTable";
import { mutationOnErrorHandler } from "../../../../utils/mutationUtils";
import OnProductionTable from "./tables/OnProductionTable";
import { useForm } from "react-hook-form";

const DURATION = [
  { label: "1 to 15", value: "1_to_15" },
  { label: "16 to 31", value: "16_to_31" },
  { label: "Month", value: "month" },
];

const SalaryReportList = () => {
  const navigate = useNavigate();
  const { companyId } = useContext(GlobalContext);

  const [selectedEntries, setSelectedEntries] = useState([]);

  const [search, setSearch] = useState("");
  const [salaryType, setSalaryType] = useState(null);
  const [month, setMonth] = useState(dayjs());
  const [duration, setDuration] = useState("month");

  const debounceMonth = useDebounce(month, 500);
  const debounceDuration = useDebounce(duration, 500);

  const {
    data: workBasisSalaryList,
    isLoading: isLoadingWorkBasisSalary,
    refetch: refetchWorkBasisSalary,
  } = useQuery({
    queryKey: [
      "generate",
      "work-basis-salary",
      "list",
      {
        company_id: companyId,
        month: debounceMonth,
        duration: debounceDuration,
        salary_type: salaryType,
      },
    ],
    queryFn: async () => {
      const params = {
        company_id: companyId,
        time_slice: debounceDuration,
        salary_type: salaryType,
      };
      if (duration === "month") {
        params.from = dayjs(debounceMonth)
          .startOf("month")
          .format("YYYY-MM-DD");
        params.to = dayjs(debounceMonth).endOf("month").format("YYYY-MM-DD");
      } else if (duration === "1_to_15") {
        params.from = dayjs(debounceMonth)
          .startOf("month")
          .format("YYYY-MM-DD");
        params.to = dayjs(debounceMonth)
          .startOf("month")
          .add(15, "days")
          .format("YYYY-MM-DD");
      } else if (duration === "16_to_31") {
        params.from = dayjs(debounceMonth)
          .startOf("month")
          .add(15, "days")
          .format("YYYY-MM-DD");
        params.to = dayjs(debounceMonth).endOf("month").format("YYYY-MM-DD");
      }

      const response = await getWorkBasisSalaryListRequest({ params });
      return response.data.data;
    },
    enabled: Boolean(companyId && salaryType),
  });

  const { mutateAsync: createSalaryReportComponents } = useMutation({
    mutationFn: async (data) => {
      const payload = { ...data, salary_type: salaryType };
      const res = await createSalaryReportComponentsRequest({
        data: payload,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["create", "salary-report", "components"],
    onSuccess: (res) => {
      refetchWorkBasisSalary();
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
    },
    onError: (error) => {
      mutationOnErrorHandler({ error });
    },
  });

  const { mutateAsync: paidSaveHandler } = useMutation({
    mutationFn: async (data) => {
      const res = await createPaidSalarySaveRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["create", "paid-salary", "report"],
    onSuccess: (res) => {
      refetchWorkBasisSalary();
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      setSelectedEntries([]);
    },
    onError: (error) => {
      mutationOnErrorHandler({ error });
    },
  });

  const onSubmit = async (data) => {
    if (!selectedEntries.length) {
      message.error("Please select at least one entry!");
      return;
    }
    let fromDate;
    let toDate;
    if (duration === "month") {
      fromDate = dayjs(debounceMonth).startOf("month").format("YYYY-MM-DD");
      toDate = dayjs(debounceMonth).endOf("month").format("YYYY-MM-DD");
    } else if (duration === "1_to_15") {
      fromDate = dayjs(debounceMonth).startOf("month").format("YYYY-MM-DD");
      toDate = dayjs(debounceMonth)
        .startOf("month")
        .add(15, "days")
        .format("YYYY-MM-DD");
    } else if (duration === "16_to_31") {
      fromDate = dayjs(debounceMonth)
        .startOf("month")
        .add(15, "days")
        .format("YYYY-MM-DD");
      toDate = dayjs(debounceMonth).endOf("month").format("YYYY-MM-DD");
    }

    const records =
      selectedEntries && selectedEntries?.length ? selectedEntries : [];

    let isValidAmount = true;
    const payload = records.map((row) => {
      isValidAmount = +data[`payable_${row.id}`] >= 0;
      console.log(+data[`payable_${row.id}`], isValidAmount);

      return {
        user_id: row.user_id,
        amount: +data[`payable_${row.id}`],
        from: fromDate,
        to: toDate,
      };
    });

    if (!isValidAmount) {
      message.error("Amount must be greater than or equal to 0.");
      return;
    }

    await paidSaveHandler(payload);
  };

  const { control, handleSubmit, setValue } = useForm({});

  const selectEntryHandler = (e, row) => {
    if (e.target.checked) {
      setSelectedEntries((prev) => [...prev, row]);
    } else {
      setSelectedEntries((prev) => prev.filter((item) => item.id !== row.id));
    }
  };

  const selectAllEntries = (e, data) => {
    if (e.target.checked) {
      setSelectedEntries(
        data && data?.salary_report?.length ? [...data.salary_report] : []
      );
    } else {
      setSelectedEntries([]);
    }
  };

  const renderTable = useMemo(() => {
    if (salaryType === "attendance") {
      return (
        <AttendanceTable
          data={workBasisSalaryList}
          selectedEntries={selectedEntries}
          selectEntryHandler={selectEntryHandler}
          selectAllEntries={selectAllEntries}
          createSalaryReportComponents={createSalaryReportComponents}
          timeSlice={duration}
          control={control}
          setValue={setValue}
        />
      );
    } else if (salaryType === "monthly") {
      return (
        <MonthlyTable
          data={workBasisSalaryList}
          selectedEntries={selectedEntries}
          selectEntryHandler={selectEntryHandler}
          selectAllEntries={selectAllEntries}
          createSalaryReportComponents={createSalaryReportComponents}
          timeSlice={duration}
          control={control}
          setValue={setValue}
        />
      );
    } else if (salaryType === "on production") {
      return (
        <OnProductionTable
          data={workBasisSalaryList}
          selectedEntries={selectedEntries}
          selectEntryHandler={selectEntryHandler}
          selectAllEntries={selectAllEntries}
          createSalaryReportComponents={createSalaryReportComponents}
          timeSlice={duration}
          control={control}
          setValue={setValue}
        />
      );
    } else if (salaryType === "work basis") {
      return (
        <WorkBasisTable
          data={workBasisSalaryList}
          selectedEntries={selectedEntries}
          selectEntryHandler={selectEntryHandler}
          selectAllEntries={selectAllEntries}
          createSalaryReportComponents={createSalaryReportComponents}
          timeSlice={duration}
          control={control}
          setValue={setValue}
        />
      );
    } else if (salaryType === "BEAM pasaria") {
      return null;
    } else if (salaryType === "BEAM warpar") {
      return null;
    } else {
      return (
        <Flex align="center" justify="center">
          <Typography
            style={{ fontSize: "20px", fontWeight: "bold", marginTop: "1rem" }}
          >
            Please select the salary type to continue.
          </Typography>
        </Flex>
      );
    }
  }, [
    control,
    createSalaryReportComponents,
    duration,
    salaryType,
    setValue,
    workBasisSalaryList,
    selectedEntries,
  ]);

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
            <Button
              title="Generate salary report"
              onClick={() => {
                if (!salaryType) {
                  return;
                }
                refetchWorkBasisSalary();
              }}
              type="primary"
            >
              G
            </Button>
            <Button type="primary">Summary</Button>
            <Button type="primary" onClick={handleSubmit(onSubmit)}>
              Save
            </Button>
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

        {selectedEntries.length ? (
          <Flex>
            <Button danger icon={<DeleteOutlined />}>
              Delete Salary
            </Button>
          </Flex>
        ) : null}

        {isLoadingWorkBasisSalary ? (
          <div
            style={{
              height: "200px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Spin />
          </div>
        ) : (
          renderTable
        )}
      </div>
    </>
  );
};

export default SalaryReportList;
