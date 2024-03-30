import AddDailyTask from "../pages/tasks/dailyTask/AddDailyTask";
import DailyTaskList from "../pages/tasks/dailyTask/DailyTaskList";
import UpdateDailyTask from "../pages/tasks/dailyTask/UpdateDailyTask";
import DailyTaskReport from "../pages/tasks/dailyTaskReport/DailyTaskReport";
import AddWastageReport from "../pages/tasks/dailyTaskReport/WastageReport/AddWastageReport";
import WastageReportList from "../pages/tasks/dailyTaskReport/WastageReport/WastageReportList";
import AddDenierwiseWastageReport from "../pages/tasks/dailyTaskReport/denierwiseWastageReport/AddDenierwiseWastageReport";
import DenierwiseWastageReportList from "../pages/tasks/dailyTaskReport/denierwiseWastageReport/DenierwiseWastageReportList";
import UpdateDenierwiseWastageReport from "../pages/tasks/dailyTaskReport/denierwiseWastageReport/UpdateDenierwiseWastageReport";
import AddEmployeeAttendanceReport from "../pages/tasks/dailyTaskReport/employeeAttendanceReport/AddEmployeeAttendanceReport";
import EmployeeAttendanceReportList from "../pages/tasks/dailyTaskReport/employeeAttendanceReport/EmployeeAttendanceReportList";
import UpdateEmployeeAttendanceReport from "../pages/tasks/dailyTaskReport/employeeAttendanceReport/UpdateEmployeeAttendanceReport";
import AddOtherReport from "../pages/tasks/dailyTaskReport/otherReports/AddOtherReport";
import OtherReportList from "../pages/tasks/dailyTaskReport/otherReports/OtherReportList";
import UpdateOtherReport from "../pages/tasks/dailyTaskReport/otherReports/UpdateOtherReport";
import AddYarnStockReport from "../pages/tasks/dailyTaskReport/yarnStockReport/AddYarnStockReport";
import UpdateYarnStockReport from "../pages/tasks/dailyTaskReport/yarnStockReport/UpdateYarnStockReport";
import YarnStockReportList from "../pages/tasks/dailyTaskReport/yarnStockReport/YarnStockReportList";

export const dailyTaskReportRoutes = {
  path: "daily-task-report",
  children: [
    { index: true, element: <DailyTaskReport /> },
    {
      path: "daily-tfo-report",
      children: [
        { index: true, element: <DailyTaskList /> },
        { path: "add", element: <AddDailyTask /> },
        { path: "update/:id", element: <UpdateDailyTask /> },
      ],
    },
    {
      path: "beam-stock-report",
      children: [
        { index: true, element: <DailyTaskList /> },
        { path: "add", element: <AddDailyTask /> },
        { path: "update/:id", element: <UpdateDailyTask /> },
      ],
    },
    {
      path: "check-taka-and-report",
      children: [
        { index: true, element: <DailyTaskList /> },
        { path: "add", element: <AddDailyTask /> },
        { path: "update/:id", element: <UpdateDailyTask /> },
      ],
    },
    {
      path: "yarn-stock-report",
      children: [
        { index: true, element: <YarnStockReportList /> },
        { path: "add", element: <AddYarnStockReport /> },
        { path: "update/:id", element: <UpdateYarnStockReport /> },
      ],
    },
    {
      path: "other-reports",
      children: [
        { index: true, element: <OtherReportList /> },
        { path: "add", element: <AddOtherReport /> },
        { path: "update/:id", element: <UpdateOtherReport /> },
      ],
    },
    {
      path: "employees-attendance-report",
      children: [
        { index: true, element: <EmployeeAttendanceReportList /> },
        { path: "add", element: <AddEmployeeAttendanceReport /> },
        { path: "update/:id", element: <UpdateEmployeeAttendanceReport /> },
      ],
    },
    {
      path: "todays-report",
      children: [
        { index: true, element: <DailyTaskList /> },
        { path: "add", element: <AddDailyTask /> },
        { path: "update/:id", element: <UpdateDailyTask /> },
      ],
    },
    {
      path: "wastage-report",
      children: [
        { index: true, element: <WastageReportList /> },
        { path: "add", element: <AddWastageReport /> },
      ],
    },
    {
      path: "denierwise-wastage-report",
      children: [
        { index: true, element: <DenierwiseWastageReportList /> },
        { path: "add", element: <AddDenierwiseWastageReport /> },
        { path: "update/:id", element: <UpdateDenierwiseWastageReport /> },
      ],
    },
    {
      path: "wastage-sales-report",
      children: [
        { index: true, element: <DailyTaskList /> },
        { path: "add", element: <AddDailyTask /> },
        { path: "update/:id", element: <UpdateDailyTask /> },
      ],
    },
    {
      path: "beam-card",
      children: [
        { index: true, element: <DailyTaskList /> },
        { path: "add", element: <AddDailyTask /> },
        { path: "update/:id", element: <UpdateDailyTask /> },
      ],
    },
  ],
};
