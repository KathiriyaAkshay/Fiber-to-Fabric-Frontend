import AddDailyTask from "../pages/tasks/dailyTask/AddDailyTask";
import DailyTaskList from "../pages/tasks/dailyTask/DailyTaskList";
import UpdateDailyTask from "../pages/tasks/dailyTask/UpdateDailyTask";
import DailyTFOReport from "../pages/tasks/dailyTaskReport/DailyTFOReport";
import DailyTaskReport from "../pages/tasks/dailyTaskReport/DailyTaskReport";
import AddAssignRollReport from "../pages/tasks/dailyTaskReport/TFOReport/assignRollReport/AddAssignRollReport";
import AssignRollReportList from "../pages/tasks/dailyTaskReport/TFOReport/assignRollReport/AssignRollReportList";
import UpdateAssignRollReport from "../pages/tasks/dailyTaskReport/TFOReport/assignRollReport/UpdateAssignRollReport";
import AddRollStockReport from "../pages/tasks/dailyTaskReport/TFOReport/rollStockReport/AddRollStockReport";
import RollStockReportList from "../pages/tasks/dailyTaskReport/TFOReport/rollStockReport/RollStockReportList";
import AddWindingDropReport from "../pages/tasks/dailyTaskReport/TFOReport/windingReport/AddWindingDropReport";
import UpdateWindingDropReport from "../pages/tasks/dailyTaskReport/TFOReport/windingReport/UpdateWindingDropReport";
import WindingDropReportList from "../pages/tasks/dailyTaskReport/TFOReport/windingReport/WindingDropReportList";
import AddWastageReportTask from "../pages/tasks/dailyTaskReport/WastageReport/AddWastageReportTask";
import UpdateWastageReportTask from "../pages/tasks/dailyTaskReport/WastageReport/UpdateWastageReportTask";
import WastageReportTaskList from "../pages/tasks/dailyTaskReport/WastageReport/WastageReportTaskList";
import AddWastageSalesReport from "../pages/tasks/dailyTaskReport/WastageSalesReport/AddWastageSalesReport";
import WastageSalesReportList from "../pages/tasks/dailyTaskReport/WastageSalesReport/WastageSalesReportList";
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
      element: <DailyTFOReport />,
      children: [
        {
          path: "daily-tfo",
          children: [
            { index: true, element: <DailyTaskList /> },
            { path: "add", element: <AddDailyTask /> },
            { path: "update/:id", element: <UpdateDailyTask /> },
          ],
        },
        {
          path: "winding-report",
          children: [
            { index: true, element: <WindingDropReportList /> },
            { path: "add", element: <AddWindingDropReport /> },
            { path: "update/:id", element: <UpdateWindingDropReport /> },
          ],
        },
        {
          path: "roll-stock-report",
          children: [
            { index: true, element: <RollStockReportList /> },
            { path: "add", element: <AddRollStockReport /> },
          ],
        },
        {
          path: "assign-roll-yarn",
          children: [
            { index: true, element: <AssignRollReportList /> },
            { path: "add", element: <AddAssignRollReport /> },
            { path: "update/:id", element: <UpdateAssignRollReport /> },
          ],
        },
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
        { index: true, element: <WastageReportTaskList /> },
        { path: "add", element: <AddWastageReportTask /> },
        { path: "update/:id", element: <UpdateWastageReportTask /> },
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
        { index: true, element: <WastageSalesReportList /> },
        { path: "add", element: <AddWastageSalesReport /> },
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
