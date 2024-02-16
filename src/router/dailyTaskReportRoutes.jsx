import AddDailyTask from "../pages/tasks/dailyTask/AddDailyTask";
import DailyTaskList from "../pages/tasks/dailyTask/DailyTaskList";
import UpdateDailyTask from "../pages/tasks/dailyTask/UpdateDailyTask";
import DailyTaskReport from "../pages/tasks/dailyTaskReport/DailyTaskReport";

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
        { index: true, element: <DailyTaskList /> },
        { path: "add", element: <AddDailyTask /> },
        { path: "update/:id", element: <UpdateDailyTask /> },
      ],
    },
    {
      path: "other-reports",
      children: [
        { index: true, element: <DailyTaskList /> },
        { path: "add", element: <AddDailyTask /> },
        { path: "update/:id", element: <UpdateDailyTask /> },
      ],
    },
    {
      path: "employees-attendance-report",
      children: [
        { index: true, element: <DailyTaskList /> },
        { path: "add", element: <AddDailyTask /> },
        { path: "update/:id", element: <UpdateDailyTask /> },
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
        { index: true, element: <DailyTaskList /> },
        { path: "add", element: <AddDailyTask /> },
        { path: "update/:id", element: <UpdateDailyTask /> },
      ],
    },
    {
      path: "denierwise-wastage-report",
      children: [
        { index: true, element: <DailyTaskList /> },
        { path: "add", element: <AddDailyTask /> },
        { path: "update/:id", element: <UpdateDailyTask /> },
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
