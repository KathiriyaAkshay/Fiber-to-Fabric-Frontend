import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "react-phone-number-input/style.css";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import Dashboard from "./pages/dashboard/Dashboard";
import BaseLayout from "./layouts/BaseLayout";
import ErrorBoundary from "./components/common/ErrorBoundary";
import Login from "./pages/auth/Login";
// import Register from "./pages/auth/Register";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import OtpVerificationPage from "./pages/auth/OtpVerificationPage";
import ForgetPasswordPage from "./pages/auth/ForgetPasswordPage";
import CompanyList from "./pages/company/CompanyList";
import AddCompany from "./pages/company/AddCompany";
import UpdateCompany from "./pages/company/UpdateCompany";
import { ConfigProvider } from "antd";
import SupervisorList from "./pages/userMaster/supervisor/SupervisorList";
import AddSupervisor from "./pages/userMaster/supervisor/AddSupervisor";
import UpdateSupervisor from "./pages/userMaster/supervisor/UpdateSupervisor";
import BrokerList from "./pages/userMaster/broker/BrokerList";
import AddBroker from "./pages/userMaster/broker/AddBroker";
import UpdateBroker from "./pages/userMaster/broker/UpdateBroker";
import PartyList from "./pages/userMaster/party/PartyList";
import AddParty from "./pages/userMaster/party/AddParty";
import UpdateParty from "./pages/userMaster/party/UpdateParty";
import SupplierList from "./pages/userMaster/supplier/SupplierList";
import AddSupplier from "./pages/userMaster/supplier/AddSupplier";
import UpdateSupplier from "./pages/userMaster/supplier/UpdateSupplier";
import EmployeeList from "./pages/userMaster/employee/EmployeeList";
import AddEmployee from "./pages/userMaster/employee/AddEmployee";
import UpdateEmployee from "./pages/userMaster/employee/UpdateEmployee";
import CollectionUserList from "./pages/userMaster/collectionUser/CollectionUserList";
import AddCollectionUser from "./pages/userMaster/collectionUser/AddCollectionUser";
import UpdateCollectionUser from "./pages/userMaster/collectionUser/UpdateCollectionUser";
import AccountantUserList from "./pages/userMaster/accountantUser/AccountantUserList";
import AddAccountantUser from "./pages/userMaster/accountantUser/AddAccountantUser";
import UpdateAccountantUser from "./pages/userMaster/accountantUser/UpdateAccountantUser";
import VehicleUserList from "./pages/userMaster/vehicleUser/VehicleUserList";
import AddVehicleUser from "./pages/userMaster/vehicleUser/AddVehicleUser";
import UpdateVehicleUser from "./pages/userMaster/vehicleUser/UpdateVehicleUser";
import MachineList from "./pages/machine/MachineList";
import AddMachine from "./pages/machine/AddMachine";
import UpdateMachine from "./pages/machine/UpdateMachine";
import YarnStockCompanyList from "./pages/yarnStock/yarnStockCompany/YarnStockCompanyList";
import AddYarnStockCompany from "./pages/yarnStock/yarnStockCompany/AddYarnStockCompany";
import UpdateYarnStockCompany from "./pages/yarnStock/yarnStockCompany/UpdateYarnStockCompany";
import DailyTaskList from "./pages/tasks/dailyTask/DailyTaskList";
import AddDailyTask from "./pages/tasks/dailyTask/AddDailyTask";
import UpdateDailyTask from "./pages/tasks/dailyTask/UpdateDailyTask";
import { dailyTaskReportRoutes } from "./router/dailyTaskReportRoutes";
import UserRoles from "./pages/profile/userRoles/UserRoles";
import UserActivity from "./pages/profile/userActivity/UserActivity";
import { orderMasterRoutes } from "./router/orderMasterRoutes";
import GlobalContextProvider from "./contexts/GlobalContext";
import YarnReceiveList from "./pages/purchase/receive/yarn-receive/YarnReceiveList";
import AddYarnReceive from "./pages/purchase/receive/yarn-receive/AddYarnReceive";
import UpdateYarnReceive from "./pages/purchase/receive/yarn-receive/UpdateYarnReceive";
import InHouseQualityList from "./pages/qualityMaster/inhouseQuality/InHouseQualityList";
import TradingQualityList from "./pages/qualityMaster/tradingQuality/TradingQualityList";
import AddInHouseQuality from "./pages/qualityMaster/inhouseQuality/AddInHouseQuality";
import AddTradingQuality from "./pages/qualityMaster/tradingQuality/AddTradingQuality";
import { UpdateTradingQuality } from "./pages/qualityMaster/tradingQuality/UpdateTradingQuality";
import CostCalculator from "./pages/costCalculator";
import RequireReadyBeamList from "./pages/requireReadyBeam/RequireReadyBeamList";
import EditRequireReadyBeam from "./pages/requireReadyBeam/EditRequireReadyBeam";
import JobYarnStockReportList from "./pages/job/reports/jobYarnStockReports/jobYarnStockReportList";
import AddJobYarnStockReport from "./pages/job/reports/jobYarnStockReports/addJobYarnStockReport";
import GatePassList from "./pages/gatePass";
import AddGatePass from "./pages/gatePass/addGatePass";
import UpdateGatePass from "./pages/gatePass/updateGatePass";
import UpdateInHouseQuality from "./pages/qualityMaster/inhouseQuality/UpdateInHouseQuality";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "auth",
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <Login />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "verify-otp",
        element: <OtpVerificationPage />,
      },
      {
        path: "forget-password",
        element: <ForgetPasswordPage />,
      },
      // {
      //   path: "register",
      //   element: <Register />,
      // },
    ],
  },
  {
    path: "/",
    element: (
      <GlobalContextProvider>
        <BaseLayout />
      </GlobalContextProvider>
    ),
    errorElement: <ErrorBoundary />,

    children: [
      { index: true, element: <Dashboard /> },
      { path: "/dashboard", element: <Dashboard /> },
      {
        path: "/quality-master",
        children: [
          { index: true, element: <InHouseQualityList /> },
          {
            path: "inhouse-quality",
            children: [
              { index: true, element: <InHouseQualityList /> },
              { path: "add", element: <AddInHouseQuality /> },
              { path: "update/:qualityId", element: <UpdateInHouseQuality /> },
            ],
          },
          {
            path: "trading-quality",
            children: [
              { index: true, element: <TradingQualityList /> },
              { path: "add", element: <AddTradingQuality /> },
              { path: "update/:qualityId", element: <UpdateTradingQuality /> },
            ],
          },
        ],
      },
      {
        path: "/company",
        children: [
          { index: true, element: <CompanyList /> },
          { path: "add", element: <AddCompany /> },
          { path: "update/:companyId", element: <UpdateCompany /> },
        ],
      },
      {
        path: "/user-master",
        children: [
          { index: true, element: <SupervisorList /> },
          {
            path: "my-supervisor",
            children: [
              { index: true, element: <SupervisorList /> },
              { path: "add", element: <AddSupervisor /> },
              { path: "update/:id", element: <UpdateSupervisor /> },
            ],
          },
          {
            path: "my-broker",
            children: [
              { index: true, element: <BrokerList /> },
              { path: "add", element: <AddBroker /> },
              { path: "update/:id", element: <UpdateBroker /> },
            ],
          },
          {
            path: "my-party",
            children: [
              { index: true, element: <PartyList /> },
              { path: "add", element: <AddParty /> },
              { path: "update/:id", element: <UpdateParty /> },
            ],
          },
          {
            path: "my-supplier",
            children: [
              { index: true, element: <SupplierList /> },
              { path: "add", element: <AddSupplier /> },
              { path: "update/:id", element: <UpdateSupplier /> },
            ],
          },
          {
            path: "my-employee",
            children: [
              { index: true, element: <EmployeeList /> },
              { path: "add", element: <AddEmployee /> },
              { path: "update/:id", element: <UpdateEmployee /> },
            ],
          },
          {
            path: "my-collection",
            children: [
              { index: true, element: <CollectionUserList /> },
              { path: "add", element: <AddCollectionUser /> },
              { path: "update/:id", element: <UpdateCollectionUser /> },
            ],
          },
          {
            path: "my-accountant",
            children: [
              { index: true, element: <AccountantUserList /> },
              { path: "add", element: <AddAccountantUser /> },
              { path: "update/:id", element: <UpdateAccountantUser /> },
            ],
          },
          {
            path: "vehicle",
            children: [
              { index: true, element: <VehicleUserList /> },
              { path: "add", element: <AddVehicleUser /> },
              { path: "update/:id", element: <UpdateVehicleUser /> },
            ],
          },
        ],
      },
      {
        path: "/tasks",
        children: [
          { index: true, element: <DailyTaskList /> },
          {
            path: "daily-task",
            children: [
              { index: true, element: <DailyTaskList /> },
              { path: "add", element: <AddDailyTask /> },
              { path: "update/:id", element: <UpdateDailyTask /> },
            ],
          },
          dailyTaskReportRoutes,
        ],
      },
      {
        path: "/production",
        element: (
          <div>
            <div>production</div>
            <Outlet />
          </div>
        ),
        children: [
          { index: true, element: <div>production</div> },
          {
            path: "add-new-production",
            element: <div>add-new-production</div>,
          },
          {
            path: "inhouse-production",
            element: <div>inhouse-production</div>,
          },
          {
            path: "opening-production",
            element: <div>opening-production</div>,
          },
          { path: "taka-tp-cutting", element: <div>taka-tp-cutting</div> },
          {
            path: "monthly-production-report",
            element: <div>monthly-production-report</div>,
          },
          {
            path: "folding-production",
            element: (
              <div>
                <div>folding-production</div>
                <Outlet />
              </div>
            ),
            children: [
              { index: true, element: <div>folding-production</div> },
              {
                path: "add-folding-production",
                element: <div>add-folding-production</div>,
              },
              {
                path: "folding-production",
                element: <div>folding-production</div>,
              },
            ],
          },
        ],
      },
      {
        path: "sales",
        element: (
          <div>
            <div>sales</div>
            <Outlet />
          </div>
        ),
        children: [
          { index: true, element: <div>sales</div> },
          {
            path: "taka-return-request",
            element: <div>taka-return-request</div>,
          },
          {
            path: "challan",
            element: (
              <div>
                <div>challan</div>
                <Outlet />
              </div>
            ),
            children: [
              { index: true, element: <div>challan</div> },
              {
                path: "grey-sale",
                element: <div>grey-sale</div>,
              },
              {
                path: "yarn-sale",
                element: <div>yarn-sale</div>,
              },
              {
                path: "beam-sale",
                element: <div>beam-sale</div>,
              },
              {
                path: "sale-challan",
                element: <div>sale-challan</div>,
              },
              {
                path: "sales-return",
                element: <div>sales-return</div>,
              },
            ],
          },
          {
            path: "bill",
            element: (
              <div>
                <div>bill</div>
                <Outlet />
              </div>
            ),
            children: [
              { index: true, element: <div>bill</div> },
              {
                path: "sales-bill-list",
                element: <div>sales-bill-list</div>,
              },
              {
                path: "yarn-sales-bill-list",
                element: <div>yarn-sales-bill-list</div>,
              },
              {
                path: "beam-sales-bill-list",
                element: <div>beam-sales-bill-list</div>,
              },
            ],
          },
        ],
      },
      {
        path: "/purchase",
        children: [
          {
            path: "purchased-taka",
            element: <div>purchased-taka</div>,
          },
          {
            path: "general-purchase-entry",
            element: <div>general-purchase-entry</div>,
          },
          {
            path: "receive",
            children: [
              {
                path: "yarn-receive",
                children: [
                  { index: true, element: <YarnReceiveList /> },
                  { path: "add", element: <AddYarnReceive /> },
                  {
                    path: "update/:id",
                    element: <UpdateYarnReceive />,
                  },
                ],
              },
            ],
          },
          {
            path: "/purchase-size-beam",
            element: (
              <div>
                <div>purchase-size-beam</div>
                <Outlet />
              </div>
            ),
            children: [
              { index: true, element: <div>purchase-size-beam</div> },
              {
                path: "send-beam-pipe",
                element: <div>send-beam-pipe</div>,
              },
              {
                path: "bills-of-size-beam",
                element: <div>bills-of-size-beam</div>,
              },
              {
                path: "receive-size-beam",
                element: <div>receive-size-beam</div>,
              },
            ],
          },
          {
            path: "challan",
            element: (
              <div>
                <div>challan</div>
                <Outlet />
              </div>
            ),
            children: [
              { index: true, element: <div>challan</div> },
              {
                path: "purchase-challan",
                element: <div>purchase-challan</div>,
              },
              {
                path: "purchased-return",
                element: <div>purchased-return</div>,
              },
              {
                path: "sale-purchased-taka",
                element: <div>sale-purchased-taka</div>,
              },
            ],
          },
          {
            path: "bill",
            element: (
              <div>
                <div>bill</div>
                <Outlet />
              </div>
            ),
            children: [
              { index: true, element: <div>bill</div> },
              {
                path: "grey-purchased-bill",
                element: <div>grey-purchased-bill</div>,
              },
              {
                path: "yarn-bills",
                element: <div>yarn-bills</div>,
              },
            ],
          },
        ],
      },
      {
        path: "/job",
        children: [
          { index: true, element: <div>job-taka</div> },
          {
            path: "job-taka",
            element: <div>job-taka</div>,
          },
          {
            path: "sent",
            element: (
              <div>
                <div>sent</div>
                <Outlet />
              </div>
            ),
            children: [
              { index: true, element: <div>sent</div> },
              {
                path: "beam-sent",
                element: <div>beam-sent</div>,
              },
              {
                path: "yarn-sent",
                element: <div>yarn-sent</div>,
              },
            ],
          },
          {
            path: "receive",
            element: (
              <div>
                <div>receive</div>
                <Outlet />
              </div>
            ),
            children: [
              { index: true, element: <div>receive</div> },
              {
                path: "beam-receive",
                element: <div>beam-receive</div>,
              },
              {
                path: "taka-receive",
                element: <div>taka-receive</div>,
              },
            ],
          },
          {
            path: "report",
            children: [
              { index: true, element: <div>beam-sent-report</div> },
              {
                path: "beam-sent-report",
                element: <div>beam-sent-report</div>,
              },
              {
                path: "yarn-sent-report",
                element: <div>yarn-sent-report</div>,
              },
              {
                path: "job-cost-report",
                element: <div>job-cost-report</div>,
              },
              {
                path: "job-profit-report",
                element: <div>job-profit-report</div>,
              },
              {
                path: "job-yarn-stock-report",
                children: [
                  { index: true, element: <JobYarnStockReportList/> },
                  { path: "add", element: <AddJobYarnStockReport /> },
                ]
              },
              {
                path: "job-production",
                element: <div>job-production</div>,
              },
            ],
          },
          {
            path: "challan",
            element: (
              <div>
                <div>challan</div>
                <Outlet />
              </div>
            ),
            children: [
              { index: true, element: <div>challan</div> },
              {
                path: "job-challan",
                element: <div>job-challan</div>,
              },
              {
                path: "sale-job-taka",
                element: <div>sale-job-taka</div>,
              },
              {
                path: "rework-challan",
                element: <div>rework-challan</div>,
              },
              {
                path: "receive-rework-taka",
                element: <div>receive-rework-taka</div>,
              },
            ],
          },
          {
            path: "bill",
            element: (
              <div>
                <div>bill</div>
                <Outlet />
              </div>
            ),
            children: [
              { index: true, element: <div>bill</div> },
              {
                path: "job-bill",
                element: <div>job-bill</div>,
              },
              {
                path: "rework-challan-bill",
                element: <div>rework-challan-bill</div>,
              },
            ],
          },
        ],
      },
      orderMasterRoutes,
      {
        path: "/account",
        element: (
          <div>
            <div>account</div>
            <Outlet />
          </div>
        ),
        children: [
          { index: true, element: <div>account</div> },
          {
            path: "accounts-report",
            element: <div>accounts-report</div>,
          },
          {
            path: "payment",
            element: <div>payment</div>,
          },
          {
            path: "balance-sheet",
            element: <div>balance-sheet</div>,
          },
          {
            path: "profite-and-loss",
            element: <div>profite-and-loss</div>,
          },
          {
            path: "statement",
            element: (
              <div>
                <div>statement</div>
                <Outlet />
              </div>
            ),
            children: [
              { index: true, element: <div>statement</div> },
              {
                path: "passbook",
                element: <div>passbook</div>,
              },
              {
                path: "cashbook",
                element: <div>cashbook</div>,
              },
              {
                path: "emi-loan",
                element: <div>emi-loan</div>,
              },
              {
                path: "bank-reconciliation",
                element: <div>bank-reconciliation</div>,
              },
              {
                path: "cashbook-verify",
                element: <div>cashbook-verify</div>,
              },
            ],
          },
          {
            path: "reports",
            element: (
              <div>
                <div>reports</div>
                <Outlet />
              </div>
            ),
            children: [
              { index: true, element: <div>reports</div> },
              {
                path: "sales-report",
                element: <div>sales-report</div>,
              },
              {
                path: "cost-and-profit-report",
                element: <div>cost-and-profit-report</div>,
              },
              {
                path: "purchase-report",
                element: <div>purchase-report</div>,
              },
              {
                path: "ledger-report",
                element: <div>ledger-report</div>,
              },
              {
                path: "particular-ledger-report",
                element: <div>particular-ledger-report</div>,
              },
              {
                path: "gstr-1-report",
                element: <div>gstr-1-report</div>,
              },
              {
                path: "gstr-2-report",
                element: <div>gstr-2-report</div>,
              },
              {
                path: "gstr-3b-report",
                element: <div>gstr-3b-report</div>,
              },
              {
                path: "passbook-cashbook-balance",
                element: <div>passbook-cashbook-balance</div>,
              },
              {
                path: "turnover",
                element: <div>turnover</div>,
              },
              {
                path: "live-stock-report",
                element: <div>live-stock-report</div>,
              },
              {
                path: "monthly-transaction-report",
                element: <div>monthly-transaction-report</div>,
              },
            ],
          },
          {
            path: "notes",
            element: (
              <div>
                <div>notes</div>
                <Outlet />
              </div>
            ),
            children: [
              { index: true, element: <div>notes</div> },
              {
                path: "credit-notes",
                element: <div>credit-notes</div>,
              },
              {
                path: "debit-notes",
                element: <div>debit-notes</div>,
              },
            ],
          },
          {
            path: "group-wise-outstanding",
            element: (
              <div>
                <div>group-wise-outstanding</div>
                <Outlet />
              </div>
            ),
            children: [
              { index: true, element: <div>group-wise-outstanding</div> },
              {
                path: "sundry-debtors",
                element: <div>sundry-debtors</div>,
              },
              {
                path: "sundry-creditors",
                element: <div>sundry-creditors</div>,
              },
            ],
          },
          {
            path: "cost-per-meter",
            element: <div>cost-per-meter</div>,
          },
          {
            path: "salary-master",
            element: (
              <div>
                <div>salary-master</div>
                <Outlet />
              </div>
            ),
            children: [
              { index: true, element: <div>salary-master</div> },
              {
                path: "employee-salary-report",
                element: <div>employee-salary-report</div>,
              },
              {
                path: "employee-advance-salary",
                element: <div>employee-advance-salary</div>,
              },
              {
                path: "employee-average-report",
                element: <div>employee-average-report</div>,
              },
            ],
          },
        ],
      },

      {
        path: "machine",
        children: [
          { index: true, element: <MachineList /> },
          { path: "add", element: <AddMachine /> },
          { path: "update/:id", element: <UpdateMachine /> },
        ],
      },
      {
        path: "material",
        element: <div>material</div>,
      },
      {
        path: "yarn-stock-company",
        children: [
          { index: true, element: <YarnStockCompanyList /> },
          {
            path: "company-list",
            children: [
              { index: true, element: <YarnStockCompanyList /> },
              { path: "add", element: <AddYarnStockCompany /> },
              { path: "update/:id", element: <UpdateYarnStockCompany /> },
            ],
          },
          // {
          //   path: "manage-yarn-stock",
          //   element: <div>manage-yarn-stock</div>,
          // },
        ],
      },
      {
        path: "beam-card",
        element: <div>beam-card</div>,
      },
      {
        path: "require-ready-beam",
        children: [
          { index: true, element: <RequireReadyBeamList /> },
          { path: "update/:id", element: <EditRequireReadyBeam /> },
        ],
      },
      {
        path: "seeking",
        element: <div>seeking</div>,
      },
      {
        path: "cost-calculator",
        element: <CostCalculator />,
      },
      {
        path: "today-report",
        element: <div>today-report</div>,
      },
      {
        path: "gate-pass",
        children: [
          { index: true, element: <GatePassList /> },
          { path: "add", element: <AddGatePass /> },
          { path: "update/:gatePassId", element: <UpdateGatePass /> },
        ]
      },
      {
        path: "profile",
        children: [
          { index: true, element: <div>my-profile</div> },
          {
            path: "my-profile",
            element: <div>my-profile</div>,
          },
          {
            path: "change-password",
            element: <div>change-password</div>,
          },
          {
            path: "create-user",
            element: <div>create-user</div>,
          },
          {
            path: "user-roles",
            element: <UserRoles />,
          },
          {
            path: "user-activity",
            element: <UserActivity />,
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#194A6D",
            fontFamily: "Poppins",
          },
          components: {
            Card: {
              headerBg: "#194A6D",
              extraColor: "white",
            },
            Menu: {
              darkItemBg: "#194A6D",
              darkSubMenuItemBg: "#194A6D",
              darkGroupTitleColor: "#FFFFFF",
              darkItemColor: "#FFFFFF",
            },
            Table: {
              headerBg: "#194A6D",
              headerColor: "#FFFFFF",
            },
            Modal: {
              headerBg: "#194A6D",
              titleColor: "#FFFFFF",
            },
          },
        }}
      >
        <RouterProvider router={router} />
      </ConfigProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  </React.StrictMode>
);
