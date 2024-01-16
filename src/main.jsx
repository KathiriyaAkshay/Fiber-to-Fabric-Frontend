import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "react-phone-number-input/style.css";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import Dashboard from "./pages/dashboard/Dashboard";
import BaseLayout from "./layouts/BaseLayout";
import ErrorBoundary from "./components/common/ErrorBoundary";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
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
      {
        path: "register",
        element: <Register />,
      },
    ],
  },
  {
    path: "/",
    element: <BaseLayout />,
    errorElement: <ErrorBoundary />,

    children: [
      { index: true, element: <Dashboard /> },
      { path: "/dashboard", element: <Dashboard /> },
      {
        path: "/quality-master",
        element: (
          <div>
            <div>quality-master</div>
            <Outlet />
          </div>
        ),
        children: [
          { index: true, element: <div>quality-master</div> },
          { path: "inhouse-quality", element: <div>inhouse-quality</div> },
          { path: "trading-quality", element: <div>trading-quality</div> },
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
          { path: "my-broker", element: <div>my-broker</div> },
          { path: "my-parties", element: <div>my-parties</div> },
          { path: "my-supplier", element: <div>my-supplier</div> },
          { path: "my-employee", element: <div>my-employee</div> },
          { path: "my-collection", element: <div>my-collection</div> },
          { path: "my-accountant", element: <div>my-accountant</div> },
          { path: "vehicle", element: <div>vehicle</div> },
        ],
      },
      {
        path: "/tasks",
        element: (
          <div>
            <div>tasks</div>
            <Outlet />
          </div>
        ),
        children: [
          { index: true, element: <div>tasks</div> },
          { path: "daily-task", element: <div>daily-task</div> },
          { path: "daily-task-report", element: <div>daily-task-report</div> },
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
        element: (
          <div>
            <div>purchase</div>
            <Outlet />
          </div>
        ),
        children: [
          { index: true, element: <div>purchase</div> },
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
            element: (
              <div>
                <div>receive</div>
                <Outlet />
              </div>
            ),
            children: [
              { index: true, element: <div>receive</div> },
              {
                path: "yarn-receive",
                element: <div>yarn-receive</div>,
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
        element: (
          <div>
            <div>job</div>
            <Outlet />
          </div>
        ),
        children: [
          { index: true, element: <div>job</div> },
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
            element: (
              <div>
                <div>report</div>
                <Outlet />
              </div>
            ),
            children: [
              { index: true, element: <div>report</div> },
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
                element: <div>job-yarn-stock-report</div>,
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
      {
        path: "/order-master",
        element: (
          <div>
            <div>order-master</div>
            <Outlet />
          </div>
        ),
        children: [
          { index: true, element: <div>order-master</div> },
          {
            path: "my-orders",
            element: <div>my-orders</div>,
          },
          {
            path: "my-yarn-orders",
            element: <div>my-yarn-orders</div>,
          },
          {
            path: "size-beam-order",
            element: <div>size-beam-order</div>,
          },
          {
            path: "schedule-delivery-list",
            element: <div>schedule-delivery-list</div>,
          },
        ],
      },
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
        element: <div>machine</div>,
      },
      {
        path: "material",
        element: <div>material</div>,
      },
      {
        path: "yarn-stock-company",
        element: (
          <div>
            <div>yarn-stock-company</div>
            <Outlet />
          </div>
        ),
        children: [
          { index: true, element: <div>yarn-stock-company</div> },
          {
            path: "company-list",
            element: <div>company-list</div>,
          },
          {
            path: "manage-yarn-stock",
            element: <div>manage-yarn-stock</div>,
          },
        ],
      },
      {
        path: "beam-card",
        element: <div>beam-card</div>,
      },
      {
        path: "require-ready-beam",
        element: <div>require-ready-beam</div>,
      },
      {
        path: "seeking",
        element: <div>seeking</div>,
      },
      {
        path: "cost calculator",
        element: <div>cost calculator</div>,
      },
      {
        path: "today-report",
        element: <div>today-report</div>,
      },
      {
        path: "gate-pass",
        element: <div>gate-pass</div>,
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
          },
        }}
      >
        <RouterProvider router={router} />
      </ConfigProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  </React.StrictMode>
);
