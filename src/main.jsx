import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Dashboard from "./pages/dashboard/Dashboard";
import BaseLayout from "./layouts/BaseLayout";
import ErrorBoundary from "./components/common/ErrorBoundary";

const router = createBrowserRouter([
  {
    path: "/",
    element: <BaseLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "/dashboard", element: <Dashboard /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
