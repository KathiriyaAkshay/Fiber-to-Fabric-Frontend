import { useContext, useEffect, useMemo, useState } from "react";
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
  Popover,
} from "antd";
import {
  DeleteOutlined,
  ExportOutlined,
  PlusCircleOutlined,
  PrinterOutlined,
  SaveOutlined,
} from "@ant-design/icons";
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
  deleteWorkBasisSalaryRequest,
  getWorkBasisSalaryListRequest,
} from "../../../../api/requests/accounts/salary";
import WorkBasisTable from "./tables/WorkBasisTable";
import MonthlyTable from "./tables/MonthlyTable";
import AttendanceTable from "./tables/AttendanceTable";
import { mutationOnErrorHandler } from "../../../../utils/mutationUtils";
import OnProductionTable from "./tables/OnProductionTable";
import { useForm } from "react-hook-form";
import { ROLE_ID_USER_TYPE_MAP } from "../../../../constants/userRole";
import BeamPasaria from "./tables/BeamPasaria";
import BeamWarpar from "./tables/BeamWarpar";

const DURATION = [
  { label: "1 to 15", value: "1_to_15" },
  { label: "16 to 31", value: "16_to_31" },
  { label: "Month", value: "month" },
];

const getFromAndTo = (duration, date) => {
  let from;
  let to;
  if (duration === "month") {
    from = dayjs(date).startOf("month").format("YYYY-MM-DD");
    to = dayjs(date).endOf("month").format("YYYY-MM-DD");
  } else if (duration === "1_to_15") {
    from = dayjs(date).startOf("month").format("YYYY-MM-DD");
    to = dayjs(date).startOf("month").add(15, "days").format("YYYY-MM-DD");
  } else if (duration === "16_to_31") {
    from = dayjs(date).startOf("month").add(15, "days").format("YYYY-MM-DD");
    to = dayjs(date).endOf("month").format("YYYY-MM-DD");
  }

  return { from, to };
};

const getExportData = (salaryType, data) => {
  let body = [];
  let tableTitle = [];
  if (salaryType === "monthly") {
    body = data?.map((item, index) => {
      const salary = +item.salary || 0;
      const bonus = item.components ? +item.components.bonus : 0;
      const deduction = item.components ? +item.components.deduction : 0;
      const tds = +item.tds || 0;
      const cf_advance = item.components ? +item.components.cf_advance : 0;

      const calculateTotal = +salary + +bonus - +deduction;
      const calculatedTDS = (calculateTotal * tds) / 100;
      const total = calculateTotal - calculatedTDS;

      const advanceSalary = item.advance_salary.reduce(
        (accumulator, currentValue) => {
          return accumulator + +currentValue.amount;
        },
        0
      );
      const isPaid = item.salary_paid_log?.length;

      const payable = (+cf_advance + total - advanceSalary).toFixed(2);

      return [
        index + 1,

        `${item?.user?.first_name} ${item?.user?.last_name} (${
          item?.machineNo_from || ""
        }-
        ${item?.machineNo_to || ""})`,

        ROLE_ID_USER_TYPE_MAP[item.employee_type_id] || "",
        salary,
        bonus || 0,
        deduction || 0,
        calculatedTDS || 0,
        advanceSalary || 0,
        cf_advance || 0,
        payable || 0,
        isPaid
          ? dayjs(item.salary_paid_log[0].createdAt).format("DD-MM-YYYY")
          : "",
        isPaid ? "Paid" : "Un-paid",
      ];
    });

    tableTitle = [
      "No.",
      "Employee Name",
      "Type",
      "Salary",
      "Bonus",
      "Deduction",
      "TDS",
      "Advance",
      "CF Advance",
      "Payable",
      "Paid Date",
      "Sign",
    ];
  } else if (salaryType === "attendance") {
    body = data?.map((item, index) => {
      const bonus = +item.components.bonus;
      const deduction = +item.components.deduction;
      const tds = +item.tds || 0;
      const cf_advance = +item.components.cf_advance;

      const attendance = `${+item.total_present_count || 0} x ${
        +item.per_attendance || 0
      }`;
      const calculateAttendance =
        (+item.total_present_count || 0) * (+item.per_attendance || 0);

      const calculateTotal = +calculateAttendance + +bonus - +deduction;
      const calculatedTDS = (calculateTotal * tds) / 100;
      const total = calculateTotal - calculatedTDS;

      const advanceSalary = item.advance_salary.reduce(
        (accumulator, currentValue) => {
          return accumulator + +currentValue.amount;
        },
        0
      );
      const isPaid = item.salary_paid_log?.length;

      const payable = (+cf_advance + total - advanceSalary).toFixed(2);

      return [
        index + 1,

        `${item?.user?.first_name} ${item?.user?.last_name} (${
          item?.machineNo_from || ""
        }-
        ${item?.machineNo_to || ""})`,

        ROLE_ID_USER_TYPE_MAP[item.employee_type_id] || "",
        attendance,
        bonus || 0,
        deduction || 0,
        calculatedTDS || 0,
        total || 0,
        advanceSalary || 0,
        cf_advance || 0,
        payable || 0,
        isPaid
          ? dayjs(item.salary_paid_log[0].createdAt).format("DD-MM-YYYY")
          : "",
        isPaid ? "Paid" : "Un-paid",
      ];
    });

    tableTitle = [
      "No.",
      "Employee Name",
      "Type",
      "Attendance",
      "Bonus",
      "Deduction",
      "TDS",
      "Total",
      "Advance",
      "CF Advance",
      "Payable",
      "Paid Date",
      "Sign",
    ];
  } else if (salaryType === "on production") {
    body = data?.map((item, index) => {
      const bonus = item.components ? +item.components.bonus : 0;
      const deduction = item.components ? +item.components.deduction : 0;
      const tds = +item.tds || 0;
      const cf_advance = item.components ? +item.components.cf_advance : 0;

      const totalProduction = `
      ${
        item?.is_regular_per_taka
          ? item?.total_folding_production_taka || 0
          : item?.total_meter || 0
      } x ${+item.regular_rate || 0},     
      ${0} x ${+item.rework_rate || 0}
    `;

      const calculatedTotalProduction =
        (item?.is_regular_per_taka
          ? item?.total_folding_production_taka || 0
          : item?.total_meter || 0) *
          (+item.regular_rate || 0) +
        0 * (+item.rework_rate || 0);

      const calculateTotal = calculatedTotalProduction + bonus - deduction;
      const calculatedTDS = (calculateTotal * tds) / 100;
      const total = calculateTotal - calculatedTDS;

      const advanceSalary = item.advance_salary.reduce(
        (accumulator, currentValue) => {
          return accumulator + +currentValue.amount;
        },
        0
      );
      const isPaid = item.salary_paid_log?.length;

      const payable = (+cf_advance + +total - +advanceSalary).toFixed(2);

      return [
        index + 1,

        `${item?.user?.first_name} ${item?.user?.last_name} (${
          item?.machineNo_from || ""
        }-
        ${item?.machineNo_to || ""})`,

        ROLE_ID_USER_TYPE_MAP[item.employee_type_id] || "",
        totalProduction,
        bonus || 0,
        deduction || 0,
        calculatedTDS || 0,
        total || 0,
        advanceSalary || 0,
        cf_advance || 0,
        payable || 0,
        isPaid
          ? dayjs(item.salary_paid_log[0].createdAt).format("DD-MM-YYYY")
          : "",
        isPaid ? "Paid" : "Un-paid",
      ];
    });

    tableTitle = [
      "No.",
      "Employee Name",
      "Type",
      "Total Production",
      "Bonus",
      "Deduction",
      "TDS",
      "Total",
      "Advance",
      "CF Advance",
      "Payable",
      "Paid Date",
      "Sign",
    ];
  } else if (salaryType === "work basis") {
    body = data?.map((item, index) => {
      const bonus = item.components ? +item.components.bonus : 0;
      const deduction = item.components ? +item.components.deduction : 0;
      const tds = +item.tds || 0;
      const cf_advance = item.components ? +item.components.cf_advance : 0;

      let qualityData;
      if (item && item?.result && item?.result?.length) {
        qualityData = item.result.map((item) => {
          const dayMeter = item.monthly_report.length ? 0 : 0;
          return {
            value: `${item.quality.production_rate} x ${dayMeter}`,
            production_rate: item.quality.production_rate,
            dayMeter,
          };
        });
      } else {
        qualityData = [];
      }

      let qualityTotal = 0;
      qualityData.forEach((item) => {
        qualityTotal += item.production_rate * item.dayMeter;
      });

      const calculateTotal = qualityTotal + bonus - deduction;
      const calculatedTDS = (calculateTotal * tds) / 100;
      const total = calculateTotal - calculatedTDS;

      const advanceSalary = item.advance_salary.reduce(
        (accumulator, currentValue) => {
          return accumulator + +currentValue.amount;
        },
        0
      );
      const isPaid = item.salary_paid_log?.length;

      const payable = (+cf_advance + +total - +advanceSalary).toFixed(2);

      return [
        index + 1,

        `${item?.user?.first_name} ${item?.user?.last_name} (${
          item?.machineNo_from || ""
        }-
        ${item?.machineNo_to || ""})`,
        total || 0,
        advanceSalary || 0,
        cf_advance || 0,
        payable || 0,
        isPaid
          ? dayjs(item.salary_paid_log[0].createdAt).format("DD-MM-YYYY")
          : "",
        isPaid ? "Paid" : "Un-paid",
      ];
    });

    tableTitle = [
      "No.",
      "Employee Name",
      "Total",
      "Advance",
      "CF Advance",
      "Payable",
      "Paid Date",
      "Sign",
    ];
  } else if (salaryType === "BEAM pasaria") {
    body = data?.map((item, index) => {
      const bonus = item.components ? +item.components.bonus : 0;
      const deduction = item.components ? +item.components.deduction : 0;
      const tds = +item.tds || 0;
      const cf_advance = item.components ? +item.components.cf_advance : 0;

      let qualityData;
      if (item && item?.result && item?.result?.length) {
        qualityData = item.result.map((item) => {
          const pasarela_beams_count = item?.pasarela_beams_count || 0;
          const pasaria_rate =
            item?.quality?.inhouse_beam_rate?.pasaria_rate || 0;

          const pissing_beam_counts = item?.pissing_beam_counts || 0;
          const beam_pissing_secondary =
            item?.quality?.inhouse_beam_rate?.beam_pissing_secondary || 0;

          const total =
            pasarela_beams_count * pasaria_rate +
            pissing_beam_counts * beam_pissing_secondary;
          return {
            value: `
              ${pasarela_beams_count} x ${pasaria_rate} | 
              ${pissing_beam_counts} x ${beam_pissing_secondary}
            `,
            total,
          };
        });
      } else {
        qualityData = [];
      }

      let qualityTotal = 0;
      qualityData.forEach((item) => {
        qualityTotal += item.total;
      });

      const calculateTotal = qualityTotal + bonus - deduction;
      const calculatedTDS = (calculateTotal * tds) / 100;
      const total = calculateTotal - calculatedTDS;

      const advanceSalary = item.advance_salary.reduce(
        (accumulator, currentValue) => {
          return accumulator + +currentValue.amount;
        },
        0
      );
      const isPaid = item.salary_paid_log?.length;

      const payable = (+cf_advance + +total - +advanceSalary).toFixed(2);

      return [
        index + 1,

        `${item?.user?.first_name} ${item?.user?.last_name} (${
          item?.machineNo_from || ""
        }-
        ${item?.machineNo_to || ""})`,
        bonus || 0,
        deduction || 0,
        total || 0,
        advanceSalary || 0,
        cf_advance || 0,
        payable || 0,
        isPaid
          ? dayjs(item.salary_paid_log[0].createdAt).format("DD-MM-YYYY")
          : "",
        isPaid ? "Paid" : "Un-paid",
      ];
    });

    tableTitle = [
      "No.",
      "Employee Name",
      "Bonus",
      "Deduction",
      "Total",
      "Advance",
      "CF Advance",
      "Payable",
      "Paid Date",
      "Sign",
    ];
  } else if (salaryType === "BEAM warpar") {
    body = data?.map((item, index) => {
      const bonus = item.components ? +item.components.bonus : 0;
      const deduction = item.components ? +item.components.deduction : 0;
      const tds = +item.tds || 0;
      const cf_advance = item.components ? +item.components.cf_advance : 0;

      let qualityData;
      if (item && item?.result && item?.result?.length) {
        qualityData = item.result.map((item) => {
          const pasarela_beams_count = item?.pasarela_beams_count || 0;
          const beam_maker_primary =
            item?.quality?.inhouse_beam_rate?.beam_maker_primary || 0;

          const pissing_beam_counts = item?.pissing_beam_counts || 0;
          const beam_maker_secondary =
            item?.quality?.inhouse_beam_rate?.beam_maker_secondary || 0;

          const total =
            pasarela_beams_count * beam_maker_primary +
            pissing_beam_counts * beam_maker_secondary;
          return {
            value: `
            ${pasarela_beams_count} x ${beam_maker_primary} | 
            ${pissing_beam_counts} x ${beam_maker_secondary}
          `,
            total,
          };
        });
      } else {
        qualityData = [];
      }

      let qualityTotal = 0;
      qualityData.forEach((item) => {
        qualityTotal += item.total;
      });

      const calculateTotal = qualityTotal + bonus - deduction;
      const calculatedTDS = (calculateTotal * tds) / 100;
      const total = calculateTotal - calculatedTDS;

      const advanceSalary = item.advance_salary.reduce(
        (accumulator, currentValue) => {
          return accumulator + +currentValue.amount;
        },
        0
      );
      const isPaid = item.salary_paid_log?.length;

      const payable = (+cf_advance + +total - +advanceSalary).toFixed(2);

      return [
        index + 1,

        `${item?.user?.first_name} ${item?.user?.last_name} (${
          item?.machineNo_from || ""
        }-
        ${item?.machineNo_to || ""})`,
        bonus || 0,
        deduction || 0,
        total || 0,
        advanceSalary || 0,
        cf_advance || 0,
        payable || 0,
        isPaid
          ? dayjs(item.salary_paid_log[0].createdAt).format("DD-MM-YYYY")
          : "",
        isPaid ? "Paid" : "Un-paid",
      ];
    });

    tableTitle = [
      "No.",
      "Employee Name",
      "Bonus",
      "Deduction",
      "Total",
      "Advance",
      "CF Advance",
      "Payable",
      "Paid Date",
      "Sign",
    ];
  }

  return { body, tableTitle };
};

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
      const { from, to } = getFromAndTo(debounceDuration, debounceMonth);
      params.from = from;
      params.to = to;

      // if (duration === "month") {
      //   params.from = dayjs(debounceMonth)
      //     .startOf("month")
      //     .format("YYYY-MM-DD");
      //   params.to = dayjs(debounceMonth).endOf("month").format("YYYY-MM-DD");
      // } else if (duration === "1_to_15") {
      //   params.from = dayjs(debounceMonth)
      //     .startOf("month")
      //     .format("YYYY-MM-DD");
      //   params.to = dayjs(debounceMonth)
      //     .startOf("month")
      //     .add(15, "days")
      //     .format("YYYY-MM-DD");
      // } else if (duration === "16_to_31") {
      //   params.from = dayjs(debounceMonth)
      //     .startOf("month")
      //     .add(15, "days")
      //     .format("YYYY-MM-DD");
      //   params.to = dayjs(debounceMonth).endOf("month").format("YYYY-MM-DD");
      // }

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
    mutationFn: async ({ data, isExport }) => {
      const res = await createPaidSalarySaveRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      // return res.data;
      return { res: res.data, isExport };
    },
    mutationKey: ["create", "paid-salary", "report"],
    onSuccess: ({ res, isExport }) => {
      refetchWorkBasisSalary();
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      if (isExport) {
        exportSalaryHandler(selectedEntries);
      } else {
        setSelectedEntries([]);
      }
    },
    onError: (error) => {
      mutationOnErrorHandler({ error });
    },
  });

  const {
    mutateAsync: deleteWorkBasisSalary,
    isPending: isPendingDeleteSalary,
  } = useMutation({
    mutationFn: async (data) => {
      const res = await deleteWorkBasisSalaryRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["delete", "work-basis", "salary"],
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

  const onClickDeleteSalary = async () => {
    const { from, to } = getFromAndTo(duration, month);

    const payload = selectedEntries.map((row) => {
      return {
        user_id: row.user_id,
        time_slice: duration,
        from: from,
        to: to,
        salary_type: salaryType,
      };
    });

    await deleteWorkBasisSalary(payload);
  };

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

      return {
        user_id: row.user_id,
        amount: +data[`total_${row.id}`],
        total_amount: +data[`payable_${row.id}`],
        from: fromDate,
        to: toDate,
      };
    });

    if (!isValidAmount) {
      message.error("Amount must be greater than or equal to 0.");
      return;
    }

    await paidSaveHandler({ data: payload, isExport: false });
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

  useEffect(() => {
    setSelectedEntries([]);
  }, [salaryType]);

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
          month={month}
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
          month={month}
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
          month={month}
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
          month={month}
        />
      );
    } else if (salaryType === "BEAM pasaria") {
      return (
        <BeamPasaria
          data={workBasisSalaryList}
          selectedEntries={selectedEntries}
          selectEntryHandler={selectEntryHandler}
          selectAllEntries={selectAllEntries}
          createSalaryReportComponents={createSalaryReportComponents}
          timeSlice={duration}
          control={control}
          setValue={setValue}
          month={month}
        />
      );
    } else if (salaryType === "BEAM warpar") {
      return (
        <BeamWarpar
          data={workBasisSalaryList}
          selectedEntries={selectedEntries}
          selectEntryHandler={selectEntryHandler}
          selectAllEntries={selectAllEntries}
          createSalaryReportComponents={createSalaryReportComponents}
          timeSlice={duration}
          control={control}
          setValue={setValue}
          month={month}
        />
      );
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
    salaryType,
    workBasisSalaryList,
    selectedEntries,
    createSalaryReportComponents,
    duration,
    control,
    setValue,
    month,
  ]);

  const exportSalaryHandler = (data) => {
    // if (salaryType === "monthly") {
    //   const body = workBasisSalaryList?.salary_report?.map((item, index) => {
    //     const salary = +item.salary || 0;
    //     const bonus = item.components ? +item.components.bonus : 0;
    //     const deduction = item.components ? +item.components.deduction : 0;
    //     const tds = +item.tds || 0;
    //     const cf_advance = item.components ? +item.components.cf_advance : 0;

    //     const calculateTotal = +salary + +bonus - +deduction;
    //     const calculatedTDS = (calculateTotal * tds) / 100;
    //     const total = calculateTotal - calculatedTDS;

    //     const advanceSalary = item.advance_salary.reduce(
    //       (accumulator, currentValue) => {
    //         return accumulator + +currentValue.amount;
    //       },
    //       0
    //     );
    //     const isPaid = item.salary_paid_log?.length;

    //     const payable = (+cf_advance + total - advanceSalary).toFixed(2);

    //     return [
    //       index + 1,

    //       `${item?.user?.first_name} ${item?.user?.last_name} (${
    //         item?.machineNo_from || ""
    //       }-
    //       ${item?.machineNo_to || ""})`,

    //       ROLE_ID_USER_TYPE_MAP[item.employee_type_id] || "",
    //       salary,
    //       bonus || 0,
    //       deduction || 0,
    //       calculatedTDS || 0,
    //       advanceSalary || 0,
    //       cf_advance || 0,
    //       payable || 0,
    //       isPaid
    //         ? dayjs(item.salary_paid_log[0].createdAt).format("DD-MM-YYYY")
    //         : "",
    //       isPaid ? "Paid" : "Un-paid",
    //     ];
    //   });

    //   const tableTitle = [
    //     "No.",
    //     "Employee Name",
    //     "Type",
    //     "Salary",
    //     "Bonus",
    //     "Deduction",
    //     "TDS",
    //     "Advance",
    //     "CF Advance",
    //     "Payable",
    //     "Paid Date",
    //     "Sign",
    //   ];

    //   localStorage.setItem("print-array", JSON.stringify(body));
    //   localStorage.setItem("print-title", "Salary Report (Monthly Basis)");
    //   localStorage.setItem("print-head", JSON.stringify(tableTitle));
    //   localStorage.setItem("total-count", "0");
    // } else if (salaryType === "attendance") {
    //   const body = workBasisSalaryList?.salary_report?.map((item, index) => {
    //     const bonus = +item.components.bonus;
    //     const deduction = +item.components.deduction;
    //     const tds = +item.tds || 0;
    //     const cf_advance = +item.components.cf_advance;

    //     const attendance = `${+item.total_present_count || 0} x ${
    //       +item.per_attendance || 0
    //     }`;
    //     const calculateAttendance =
    //       (+item.total_present_count || 0) * (+item.per_attendance || 0);

    //     const calculateTotal = +calculateAttendance + +bonus - +deduction;
    //     const calculatedTDS = (calculateTotal * tds) / 100;
    //     const total = calculateTotal - calculatedTDS;

    //     const advanceSalary = item.advance_salary.reduce(
    //       (accumulator, currentValue) => {
    //         return accumulator + +currentValue.amount;
    //       },
    //       0
    //     );
    //     const isPaid = item.salary_paid_log?.length;

    //     const payable = (+cf_advance + total - advanceSalary).toFixed(2);

    //     return [
    //       index + 1,

    //       `${item?.user?.first_name} ${item?.user?.last_name} (${
    //         item?.machineNo_from || ""
    //       }-
    //       ${item?.machineNo_to || ""})`,

    //       ROLE_ID_USER_TYPE_MAP[item.employee_type_id] || "",
    //       attendance,
    //       bonus || 0,
    //       deduction || 0,
    //       calculatedTDS || 0,
    //       total || 0,
    //       advanceSalary || 0,
    //       cf_advance || 0,
    //       payable || 0,
    //       isPaid
    //         ? dayjs(item.salary_paid_log[0].createdAt).format("DD-MM-YYYY")
    //         : "",
    //       isPaid ? "Paid" : "Un-paid",
    //     ];
    //   });

    //   const tableTitle = [
    //     "No.",
    //     "Employee Name",
    //     "Type",
    //     "Attendance",
    //     "Bonus",
    //     "Deduction",
    //     "TDS",
    //     "Total",
    //     "Advance",
    //     "CF Advance",
    //     "Payable",
    //     "Paid Date",
    //     "Sign",
    //   ];

    //   localStorage.setItem("print-array", JSON.stringify(body));
    //   localStorage.setItem("print-title", "Salary Report (Attendance Basis)");
    //   localStorage.setItem("print-head", JSON.stringify(tableTitle));
    //   localStorage.setItem("total-count", "0");
    // } else if (salaryType === "on production") {
    //   const body = workBasisSalaryList?.salary_report?.map((item, index) => {
    //     const bonus = item.components ? +item.components.bonus : 0;
    //     const deduction = item.components ? +item.components.deduction : 0;
    //     const tds = +item.tds || 0;
    //     const cf_advance = item.components ? +item.components.cf_advance : 0;

    //     const totalProduction = `
    //     ${
    //       item?.is_regular_per_taka
    //         ? item?.total_folding_production_taka || 0
    //         : item?.total_meter || 0
    //     } x ${+item.regular_rate || 0},
    //     ${0} x ${+item.rework_rate || 0}
    //   `;

    //     const calculatedTotalProduction =
    //       (item?.is_regular_per_taka
    //         ? item?.total_folding_production_taka || 0
    //         : item?.total_meter || 0) *
    //         (+item.regular_rate || 0) +
    //       0 * (+item.rework_rate || 0);

    //     const calculateTotal = calculatedTotalProduction + bonus - deduction;
    //     const calculatedTDS = (calculateTotal * tds) / 100;
    //     const total = calculateTotal - calculatedTDS;

    //     const advanceSalary = item.advance_salary.reduce(
    //       (accumulator, currentValue) => {
    //         return accumulator + +currentValue.amount;
    //       },
    //       0
    //     );
    //     const isPaid = item.salary_paid_log?.length;

    //     const payable = (+cf_advance + +total - +advanceSalary).toFixed(2);

    //     return [
    //       index + 1,

    //       `${item?.user?.first_name} ${item?.user?.last_name} (${
    //         item?.machineNo_from || ""
    //       }-
    //       ${item?.machineNo_to || ""})`,

    //       ROLE_ID_USER_TYPE_MAP[item.employee_type_id] || "",
    //       totalProduction,
    //       bonus || 0,
    //       deduction || 0,
    //       calculatedTDS || 0,
    //       total || 0,
    //       advanceSalary || 0,
    //       cf_advance || 0,
    //       payable || 0,
    //       isPaid
    //         ? dayjs(item.salary_paid_log[0].createdAt).format("DD-MM-YYYY")
    //         : "",
    //       isPaid ? "Paid" : "Un-paid",
    //     ];
    //   });

    //   const tableTitle = [
    //     "No.",
    //     "Employee Name",
    //     "Type",
    //     "Total Production",
    //     "Bonus",
    //     "Deduction",
    //     "TDS",
    //     "Total",
    //     "Advance",
    //     "CF Advance",
    //     "Payable",
    //     "Paid Date",
    //     "Sign",
    //   ];

    //   localStorage.setItem("print-array", JSON.stringify(body));
    //   localStorage.setItem("print-title", "Salary Report (Production Basis)");
    //   localStorage.setItem("print-head", JSON.stringify(tableTitle));
    //   localStorage.setItem("total-count", "0");
    // } else if (salaryType === "work basis") {
    //   const body = workBasisSalaryList?.salary_report?.map((item, index) => {
    //     const bonus = item.components ? +item.components.bonus : 0;
    //     const deduction = item.components ? +item.components.deduction : 0;
    //     const tds = +item.tds || 0;
    //     const cf_advance = item.components ? +item.components.cf_advance : 0;

    //     let qualityData;
    //     if (item && item?.result && item?.result?.length) {
    //       qualityData = item.result.map((item) => {
    //         const dayMeter = item.monthly_report.length ? 0 : 0;
    //         return {
    //           value: `${item.quality.production_rate} x ${dayMeter}`,
    //           production_rate: item.quality.production_rate,
    //           dayMeter,
    //         };
    //       });
    //     } else {
    //       qualityData = [];
    //     }

    //     let qualityTotal = 0;
    //     qualityData.forEach((item) => {
    //       qualityTotal += item.production_rate * item.dayMeter;
    //     });

    //     const calculateTotal = qualityTotal + bonus - deduction;
    //     const calculatedTDS = (calculateTotal * tds) / 100;
    //     const total = calculateTotal - calculatedTDS;

    //     const advanceSalary = item.advance_salary.reduce(
    //       (accumulator, currentValue) => {
    //         return accumulator + +currentValue.amount;
    //       },
    //       0
    //     );
    //     const isPaid = item.salary_paid_log?.length;

    //     const payable = (+cf_advance + +total - +advanceSalary).toFixed(2);

    //     return [
    //       index + 1,

    //       `${item?.user?.first_name} ${item?.user?.last_name} (${
    //         item?.machineNo_from || ""
    //       }-
    //       ${item?.machineNo_to || ""})`,
    //       total || 0,
    //       advanceSalary || 0,
    //       cf_advance || 0,
    //       payable || 0,
    //       isPaid
    //         ? dayjs(item.salary_paid_log[0].createdAt).format("DD-MM-YYYY")
    //         : "",
    //       isPaid ? "Paid" : "Un-paid",
    //     ];
    //   });

    //   const tableTitle = [
    //     "No.",
    //     "Employee Name",
    //     "Total",
    //     "Advance",
    //     "CF Advance",
    //     "Payable",
    //     "Paid Date",
    //     "Sign",
    //   ];

    //   localStorage.setItem("print-array", JSON.stringify(body));
    //   localStorage.setItem("print-title", "Salary Report (Work Basis)");
    //   localStorage.setItem("print-head", JSON.stringify(tableTitle));
    //   localStorage.setItem("total-count", "0");
    // }

    const { body, tableTitle } = getExportData(salaryType, data);
    let printTitle = "";
    if (salaryType === "monthly") {
      printTitle = "Salary Report (Monthly Basis)";
    } else if (salaryType === "attendance") {
      printTitle = "Salary Report (Attendance Basis)";
    } else if (salaryType === "on production") {
      printTitle = "Salary Report (On Production Basis)";
    } else if (salaryType === "work basis") {
      printTitle = "Salary Report (Work Basis)";
    } else if (salaryType === "BEAM pasaria") {
      printTitle = "Salary Report (BEAM pasaria Basis)";
    } else if (salaryType === "BEAM warpar") {
      printTitle = "Salary Report (BEAM warpar Basis)";
    }

    localStorage.setItem("print-array", JSON.stringify(body));
    localStorage.setItem("print-title", printTitle);
    localStorage.setItem("print-head", JSON.stringify(tableTitle));
    localStorage.setItem("total-count", "0");
    window.open("/print");
  };

  // const paidAndExportHandler = async () => {
  //   if (!selectedEntries.length) {
  //     message.error("Please select at least one entry!");
  //     return;
  //   }
  //   const data = getValues();

  //   let fromDate;
  //   let toDate;
  //   if (duration === "month") {
  //     fromDate = dayjs(debounceMonth).startOf("month").format("YYYY-MM-DD");
  //     toDate = dayjs(debounceMonth).endOf("month").format("YYYY-MM-DD");
  //   } else if (duration === "1_to_15") {
  //     fromDate = dayjs(debounceMonth).startOf("month").format("YYYY-MM-DD");
  //     toDate = dayjs(debounceMonth)
  //       .startOf("month")
  //       .add(15, "days")
  //       .format("YYYY-MM-DD");
  //   } else if (duration === "16_to_31") {
  //     fromDate = dayjs(debounceMonth)
  //       .startOf("month")
  //       .add(15, "days")
  //       .format("YYYY-MM-DD");
  //     toDate = dayjs(debounceMonth).endOf("month").format("YYYY-MM-DD");
  //   }

  //   const records =
  //     selectedEntries && selectedEntries?.length ? selectedEntries : [];

  //   let isValidAmount = true;
  //   const payload = records.map((row) => {
  //     isValidAmount = +data[`payable_${row.id}`] >= 0;

  //     return {
  //       user_id: row.user_id,
  //       amount: +data[`total_${row.id}`],
  //       total_amount: +data[`payable_${row.id}`],
  //       from: fromDate,
  //       to: toDate,
  //     };
  //   });

  //   if (!isValidAmount) {
  //     message.error("Amount must be greater than or equal to 0.");
  //     return;
  //   }

  //   await paidSaveHandler({ data: payload, isExport: true });
  // };

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary">Employee Salary Report</h3>
          <Button
            icon={<PlusCircleOutlined />}
            type="text"
            onClick={() => navigate("add")}
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
          <Popover
            content={
              <Flex
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <Button
                  type="default"
                  icon={<SaveOutlined />}
                  onClick={handleSubmit(onSubmit)}
                >
                  Save Salary
                </Button>
                <Button
                  type="default"
                  icon={<ExportOutlined />}
                  onClick={() =>
                    exportSalaryHandler(workBasisSalaryList?.salary_report)
                  }
                >
                  Export Salary
                </Button>
                {/* <Button
                  type="default"
                  icon={<PrinterOutlined />}
                  onClick={paidAndExportHandler}
                >
                  Paid and Export Salary
                </Button> */}
                <Button
                  type="default"
                  icon={<PrinterOutlined />}
                  onClick={() =>
                    exportSalaryHandler(workBasisSalaryList?.salary_report)
                  }
                >
                  Print Salary
                </Button>
              </Flex>
            }
            title=""
            trigger="click"
          >
            <Button type="primary">Save</Button>
          </Popover>
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
        <Flex justify="flex-start" align="middle">
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={onClickDeleteSalary}
            loading={isPendingDeleteSalary}
          >
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
  );
};

export default SalaryReportList;
