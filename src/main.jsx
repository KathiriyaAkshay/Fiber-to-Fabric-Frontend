import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "react-phone-number-input/style.css";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from "react-router-dom";
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
import ReceiveSizeBeamList from "./pages/purchase/PurchaseSizeBeam/ReceiveSizeBeam/ReceiveSizeBeamList";
import AddReceiveSizeBeam from "./pages/purchase/PurchaseSizeBeam/ReceiveSizeBeam/AddReceiveSizeBeam";
import UpdateReceiveSizeBeam from "./pages/purchase/PurchaseSizeBeam/ReceiveSizeBeam/UpdateReceiveSizeBeam";
import GatePassList from "./pages/gatePass";
import AddGatePass from "./pages/gatePass/addGatePass";
import UpdateGatePass from "./pages/gatePass/updateGatePass";
import UpdateInHouseQuality from "./pages/qualityMaster/inhouseQuality/UpdateInHouseQuality";
import BeamCardList from "./pages/beamCard/beamCardList";
import YarnSentList from "./pages/job/sent/yarnSent/yarnSentList";
import AddYarnSent from "./pages/job/sent/yarnSent/addYarnSent";
import UpdateYarnSent from "./pages/job/sent/yarnSent/updateYarnSent";
import JobTakaList from "./pages/job/jobTaka/JobTakaList";
import AddJobTaka from "./pages/job/jobTaka/AddJobTaka";
import UpdateJobTaka from "./pages/job/jobTaka/UpdateJobTaka";
import AddBeamCard from "./pages/beamCard/AddBeamCard";
import UpdateBeamCard from "./pages/beamCard/UpdateBeamCard";
import PurchaseTakaList from "./pages/purchase/purchaseTaka/purchaseTakaList";
import AddPurchaseTaka from "./pages/purchase/purchaseTaka/addPurchaseTaka";
import AddYarnSaleChallan from "./pages/sale/challan/yarnsale/addYarnSale";
import YarnSaleChallanList from "./pages/sale/challan/yarnsale/yarnSaleListing";
import UpdateYarnSaleChallan from "./pages/sale/challan/yarnsale/updateYarnSale";
import AddJobWorkSaleChallan from "./pages/sale/challan/jobwork/addSaleJobWork";
import JobWorkChallanList from "./pages/sale/challan/jobwork/saleJobWorkList";
import UpdateJobWorkChallan from "./pages/sale/challan/jobwork/updateJobWork";
import YarnSalesBillList from "./pages/sale/bill/yarnSalesBill/yarnSalesBillList";
import JobWorkBillList from "./pages/sale/bill/jobWorkBill/jobWorkBillList";
import JobBillList from "./pages/job/bill/jobBillList";
import JobChallanList from "./pages/job/challan/jobChallan/jobChallanList";
import SaleBillList from "./pages/sale/bill/saleBill/saleBillList";
import JobGrayList from "./pages/sale/bill/jobgray/jobgrayList";
import StockTaka from "./pages/job/jobTaka/stockTaka";
import StockPurchaseTaka from "./pages/purchase/purchaseTaka/stockPurchaseTaka";
import PurchaseChallanList from "./pages/purchase/challan/purchaseChallan/purchaseChallanList";
import GrayPurchaseBillList from "./pages/purchase/bill/grayPurchaseBill/grayPurchaseBillList";
import BeamReceiveList from "./pages/job/receive/beamReceive/beamReceiveList";
import AddBeamReceive from "./pages/job/receive/beamReceive/addBeamReceive";
import UpdateBeamReceive from "./pages/job/receive/beamReceive/updateBeamReceive";
import AddSaleBill from "./pages/sale/bill/saleBill/addSaleBill";
import UpdateSaleBill from "./pages/sale/bill/saleBill/updateSaleBill";
import AddJobGrayBill from "./pages/sale/bill/jobgray/addJobGrayBill";
import YarnBillList from "./pages/purchase/bill/yarnbill/yarnBillList";
import AddProduction from "./pages/production/AddProduction";
import InhouseProduction from "./pages/production/InhouseProduction";
import MonthlyProductionReport from "./pages/production/MonthlyProductionReport";
import OpenProduction from "./pages/production/OpenProduction";
import Payment from "./pages/accounts/Payment";
import PurchaseEntryList from "./pages/purchase/purchaseEntry/PurchaseEntryList";
import AddGeneralPurchaseEntry from "./pages/purchase/purchaseEntry/addPurchaseEntry";
import BeamSentList from "./pages/job/sent/beamSent/beamSentList";
import AddBeamSent from "./pages/job/sent/beamSent/addBeamSent";
import UpdateBeamSent from "./pages/job/sent/beamSent/updateBeamSent";
import AddBeamSale from "./pages/sale/challan/beamSale/AddBeamSale";
import UpdateBeamSale from "./pages/sale/challan/beamSale/UpdateBeamSale";
import BeamSaleList from "./pages/sale/challan/beamSale/BeamSaleList";
import SizeBeamBillList from "./pages/purchase/PurchaseSizeBeam/Bill/sizeBeamBillList";
import ReceiveReworkTaka from "./pages/job/challan/receiveReworkTaka/ReceiveReworkTaka";
import AddReceiveReworkTaka from "./pages/job/challan/receiveReworkTaka/AddReceiveReworkTaka";
import ReworkChallan from "./pages/job/challan/reworkChallan/ReworkChallan";
import AddReworkChallan from "./pages/job/challan/reworkChallan/AddReworkChallan";
import TakaTpCutting from "./pages/production/TakaTpCutting";
import AddTakaTpCutting from "./pages/production/AddTakaTpCutting";
import UpdateProduction from "./pages/production/UpdateProduction";
import UpdateReworkChallan from "./pages/job/challan/reworkChallan/UpdateReworkChallan";
import ReworkChallanBill from "./pages/job/bill/reworkChallanBill";
import PurchaseReturnList from "./pages/purchase/challan/purchaseReturn/PurchaseReturnList";
import PrintPage from "./components/common/printPage";
import GstrReportListing from "./components/common/gstrReportListing";
import SaleChallanList from "./pages/sale/challan/saleChallan/SaleChallanList";
import AddSaleChallan from "./pages/sale/challan/saleChallan/AddSaleChallan";
import UpdateSaleChallan from "./pages/sale/challan/saleChallan/UpdateSaleChallan";
import SaleReturnList from "./pages/sale/challan/saleReturn/SaleReturnList";
import BeamSentReport from "./pages/job/reports/beamSentReport";
import UpdatePurchaseTaka from "./pages/purchase/purchaseTaka/updatePurchaseTaka";
import OpeningProductionStock from "./pages/production/OpeningProductionStock";
import NewPaymentVoucher from "./pages/accounts/NewPaymentVoucher";
import PassBook from "./pages/accounts/statements/PassBook";
import CashBook from "./pages/accounts/statements/CashBook";
import CreditNotes from "./pages/accounts/Notes/CreditNotes";
import DebitNote from "./components/purchase/purchaseReturn/DebitNote";
import DebitNotes from "./pages/accounts/Notes/DebitNotes";
import EmiList from "./pages/accounts/statements/emi/EmiList";
import AddEmi from "./pages/accounts/statements/emi/AddEmi";
import PassbookCashBookReport from "./pages/accounts/reports/PassbookCashBookReport";
import Material from "./pages/material";
import MonthlyTransactionReport from "./pages/accounts/reports/monthlyTransactionReport";
import Turnover from "./pages/accounts/reports/turnover";
import Gstr1 from "./pages/accounts/reports/gstr1";
import Gstr2 from "./pages/accounts/reports/gstr2";
import GstrPrint from "./pages/accounts/reports/gstrPrint";
import GstrPrint2 from "./pages/accounts/reports/gstr2Print";
import LiveStockReport from "./pages/accounts/reports/liveStockReport";
import PurchaseReport from "./pages/accounts/reports/purchaseReport";
import SalesReport from "./pages/accounts/reports/salesReport";
import SundryDebitor from "./pages/accounts/groupWiseOutStanding/sundryDebitor";
import SundryCreditor from "./pages/accounts/groupWiseOutStanding/sundryCreditor";
import AddFoldingProduction from "./pages/production/AddFoldingProduction";
import PrintCashBookStatement from "./pages/accounts/statements/PrintCashBookStatement";
import PrintPassBookStatement from "./pages/accounts/statements/PrintPassBookStatement";
import OtherUserList from "./pages/userMaster/otherUser/OtherUserList";
import UpdateOtherUser from "./pages/userMaster/otherUser/UpdateOtherUser";
import AddOtherUser from "./pages/userMaster/otherUser/AddOtherUser";
import SalaryReportList from "./pages/accounts/salaryMaster/employeeSalaryReport/SalaryReportList";
import AddSalaryReport from "./pages/accounts/salaryMaster/employeeSalaryReport/AddSalaryReport";
import AdvanceSalaryList from "./pages/accounts/salaryMaster/advanceSalary/AdvanceSalaryList";
import AddAdvanceSalary from "./pages/accounts/salaryMaster/advanceSalary/AddAdvanceSalary";
import BeamSaleBillList from "./pages/sale/bill/beamSale/beamSaleBillList";
import EmployeeAverageReport from "./pages/accounts/salaryMaster/employeeAverageReport";
import Gstr3 from "./pages/accounts/reports/gstr3";
import ParticularLedgerReport from "./pages/accounts/reports/particularLedgerReport";
import LedgerReport from "./pages/accounts/reports/ledgerReport";
import CostPerMeter from "./pages/accounts/costPerMeter";
import NotFound from "./components/common/NotFound";
import ComingSoon from "./components/common/ComingSoon";
import SignUp from "./pages/profile/signUp/SignUp";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

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
    path: "*",
    element: <NotFound />,
  },
  {
    path: "/coming-soon",
    element: <ComingSoon />,
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
      { path: "/print", element: <PrintPage /> },
      { path: "/report-list", element: <GstrReportListing /> },
      {
        path: "/print-cashbook-statement",
        element: <PrintCashBookStatement />,
      },
      {
        path: "/print-passbook-statement",
        element: <PrintPassBookStatement />,
      },
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
          {
            path: "other-user",
            children: [
              { index: true, element: <OtherUserList /> },
              { path: "add", element: <AddOtherUser /> },
              { path: "update/:id", element: <UpdateOtherUser /> },
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
        children: [
          // { index: true, element: <AddProduction /> },
          {
            path: "add-new-production",
            element: <AddProduction />,
          },
          {
            path: "update-production/:id",
            element: <UpdateProduction />,
          },
          {
            path: "inhouse-production",
            element: <InhouseProduction />,
          },
          {
            path: "opening-production",
            element: <OpenProduction />,
          },
          {
            path: "taka-tp-cutting",
            children: [
              { index: true, element: <TakaTpCutting /> },
              { path: "add", element: <AddTakaTpCutting /> },
            ],
          },
          {
            path: "monthly-production-report",
            element: <MonthlyProductionReport />,
          },
          {
            path: "opening-production-stock",
            element: <OpeningProductionStock />,
          },
          {
            path: "folding-production",
            element: (
              <div>
                <Outlet />
              </div>
            ),
            children: [
              { index: true, element: <div></div> },
              {
                path: "add-folding-production",
                element: <AddFoldingProduction />,
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
        children: [
          { index: true, element: <div>sales</div> },
          {
            path: "taka-return-request",
            element: <div>taka-return-request</div>,
          },
          {
            path: "challan",
            children: [
              { index: true, element: <div>challan</div> },
              {
                path: "grey-sale",
                element: <div>grey-sale</div>,
              },
              {
                path: "yarn-sale",
                children: [
                  { index: true, element: <YarnSaleChallanList /> },
                  { path: "add", element: <AddYarnSaleChallan /> },
                  { path: "update/:id", element: <UpdateYarnSaleChallan /> },
                ],
              },
              {
                path: "job-work",
                children: [
                  { index: true, element: <JobWorkChallanList /> },
                  { path: "add", element: <AddJobWorkSaleChallan /> },
                  { path: "update/:id", element: <UpdateJobWorkChallan /> },
                ],
              },
              {
                path: "beam-sale",
                children: [
                  { index: true, element: <BeamSaleList /> },
                  { path: "add", element: <AddBeamSale /> },
                  { path: "update/:id", element: <UpdateBeamSale /> },
                ],
              },
              {
                path: "sale-challan",
                children: [
                  { index: true, element: <SaleChallanList /> },
                  { path: "add", element: <AddSaleChallan /> },
                  { path: "update/:id", element: <UpdateSaleChallan /> },
                ],
              },
              {
                path: "sales-return",
                element: <SaleReturnList />,
              },
            ],
          },
          {
            path: "bill",
            children: [
              { index: true, element: <SaleBillList /> },
              {
                path: "sales-bill-list",
                children: [
                  { index: true, element: <SaleBillList /> },
                  { path: "add", element: <AddSaleBill /> },
                  { path: "update/:id", element: <UpdateSaleBill /> },
                ],
              },
              {
                path: "yarn-sales-bill-list",
                element: <YarnSalesBillList />,
              },
              {
                path: "beam-sales-bill-list",
                element: <BeamSaleBillList />,
              },
              {
                path: "job-grey-sales-bill-list",
                children: [
                  { index: true, element: <JobGrayList /> },
                  { path: "add", element: <AddJobGrayBill /> },
                ],
              },
              {
                path: "job-work-bill-list",
                element: <JobWorkBillList />,
              },
            ],
          },
        ],
      },
      {
        path: "/purchase",
        children: [
          { index: true, element: <Navigate to={"taka"} /> },
          {
            path: "taka",
            children: [{ index: true, element: <StockPurchaseTaka /> }],
          },
          {
            path: "purchased-taka",
            children: [
              { index: true, element: <PurchaseTakaList /> },
              { path: "add", element: <AddPurchaseTaka /> },
              { path: "update/:id", element: <UpdatePurchaseTaka /> },
            ],
          },
          {
            path: "general-purchase-entry",
            children: [
              { index: true, element: <PurchaseEntryList /> },
              { path: "add", element: <AddGeneralPurchaseEntry /> },
            ],
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
            path: "purchase-size-beam",
            children: [
              {
                path: "bills-of-size-beam",
                element: <SizeBeamBillList />,
              },
              {
                path: "receive-size-beam",
                children: [
                  { index: true, element: <ReceiveSizeBeamList /> },
                  { path: "add", element: <AddReceiveSizeBeam /> },
                  { path: "update/:id", element: <UpdateReceiveSizeBeam /> },
                ],
              },
            ],
          },
          {
            path: "challan",
            children: [
              { index: true, element: <div>challan</div> },
              {
                path: "purchase-challan",
                element: <PurchaseChallanList />,
              },
              {
                path: "purchased-return",
                element: <PurchaseReturnList />,
              },
              {
                path: "sale-purchased-taka",
                element: <div>sale-purchased-taka</div>,
              },
            ],
          },
          {
            path: "bill",
            children: [
              { index: true, element: <div>bill</div> },
              {
                path: "grey-purchased-bill",
                element: <GrayPurchaseBillList />,
              },
              {
                path: "yarn-bills",
                element: <YarnBillList />,
              },
            ],
          },
        ],
      },
      {
        path: "/job",
        children: [
          { index: true, element: <JobTakaList /> },
          {
            path: "job-taka",
            children: [
              { index: true, element: <JobTakaList /> },
              { path: "add", element: <AddJobTaka /> },
              { path: "update/:id", element: <UpdateJobTaka /> },
            ],
          },
          {
            path: "taka",
            children: [{ index: true, element: <StockTaka /> }],
          },
          {
            path: "sent",
            children: [
              { index: true, element: <BeamSentList /> },
              {
                path: "beam-sent",
                children: [
                  { index: true, element: <BeamSentList /> },
                  { path: "add", element: <AddBeamSent /> },
                  { path: "update/:id", element: <UpdateBeamSent /> },
                ],
              },
              {
                path: "yarn-sent",
                children: [
                  { index: true, element: <YarnSentList /> },
                  { path: "add", element: <AddYarnSent /> },
                  { path: "update/:id", element: <UpdateYarnSent /> },
                ],
              },
            ],
          },
          {
            path: "receive",
            children: [
              { index: true, element: <div>receive</div> },
              {
                path: "beam-receive",
                children: [
                  { index: true, element: <BeamReceiveList /> },
                  { path: "add", element: <AddBeamReceive /> },
                  { path: "update/:id", element: <UpdateBeamReceive /> },
                ],
              },
              {
                path: "taka-receive",
                element: <Navigate to={"/job/job-taka/add"} />,
              },
            ],
          },
          {
            path: "report",
            children: [
              {
                index: true,
                element: <BeamSentReport />,
              },
              {
                path: "beam-sent-report",
                element: <BeamSentReport />,
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
                  { index: true, element: <JobYarnStockReportList /> },
                  { path: "add", element: <AddJobYarnStockReport /> },
                ],
              },
              {
                path: "job-production",
                element: <div>job-production</div>,
              },
            ],
          },
          {
            path: "challan",
            children: [
              { index: true, element: <JobChallanList /> },
              {
                path: "job-challan",
                element: <JobChallanList />,
              },
              {
                path: "sale-job-taka",
                element: <div>sale-job-taka</div>,
              },
              {
                path: "rework-challan",
                children: [
                  { index: true, element: <ReworkChallan /> },
                  { path: "add", element: <AddReworkChallan /> },
                  { path: "update/:id", element: <UpdateReworkChallan /> },
                ],
                // element:<ReworkChallan/>,
              },
              {
                path: "receive-rework-taka",
                children: [
                  { index: true, element: <ReceiveReworkTaka /> },
                  { path: "add", element: <AddReceiveReworkTaka /> },
                ],
              },
            ],
          },
          {
            path: "bill",
            children: [
              { index: true, element: <div>bill</div> },
              {
                path: "job-bill",
                element: <JobBillList />,
              },
              {
                path: "rework-challan-bill",
                element: <ReworkChallanBill />,
              },
            ],
          },
        ],
      },
      orderMasterRoutes,
      {
        path: "/account",
        children: [
          { index: true, element: <div>account</div> },
          {
            path: "accounts-report",
            element: <div>accounts-report</div>,
          },
          {
            path: "payment",
            children: [
              { index: true, element: <Payment /> },
              { path: "add", element: <NewPaymentVoucher /> },
            ],
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
            children: [
              { index: true, element: <PassBook /> },
              {
                path: "passbook",
                element: <PassBook />,
              },
              {
                path: "cashbook",
                element: <CashBook />,
              },
              {
                path: "emi-loan",
                children: [
                  { index: true, element: <EmiList /> },
                  { path: "add", element: <AddEmi /> },
                ],
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
            children: [
              { index: true, element: <div>reports</div> },
              {
                path: "sales-report",
                element: <SalesReport />,
              },
              {
                path: "cost-and-profit-report",
                element: <div>cost-and-profit-report</div>,
              },
              {
                path: "purchase-report",
                element: <PurchaseReport />,
              },
              {
                path: "ledger-report",
                element: <LedgerReport />,
              },
              {
                path: "particular-ledger-report",
                element: <ParticularLedgerReport />,
              },
              {
                path: "gstr-report/print/:key",
                element: <GstrPrint />,
              },
              {
                path: "gstr-report2/print/:key",
                element: <GstrPrint2 />,
              },
              {
                path: "gstr-1-report",
                element: <Gstr1 />,
              },
              {
                path: "gstr-2-report",
                element: <Gstr2 />,
              },
              {
                path: "gstr-3b-report",
                element: <Gstr3 />,
              },
              {
                path: "passbook-cashbook-balance",
                element: <PassbookCashBookReport />,
              },
              {
                path: "turnover",
                element: <Turnover />,
              },
              {
                path: "live-stock-report",
                element: <LiveStockReport />,
              },
              {
                path: "monthly-transaction-report",
                element: <MonthlyTransactionReport />,
              },
            ],
          },
          {
            path: "notes",
            element: (
              <div>
                <Outlet />
              </div>
            ),
            children: [
              { index: true, element: "/" },
              {
                path: "credit-notes",
                element: <CreditNotes />,
              },
              {
                path: "debit-notes",
                element: <DebitNotes />,
              },
            ],
          },
          {
            path: "group-wise-outstanding",
            children: [
              { index: true, element: <SundryDebitor /> },
              {
                path: "sundry-debtors",
                element: <SundryDebitor />,
              },
              {
                path: "sundry-creditors",
                element: <SundryCreditor />,
              },
            ],
          },
          {
            path: "cost-per-meter",
            element: <CostPerMeter />,
          },
          {
            path: "salary-master",
            children: [
              { index: true, element: <div>salary-master</div> },
              {
                path: "employee-salary-report",
                children: [
                  { index: true, element: <SalaryReportList /> },
                  { path: "add", element: <AddSalaryReport /> },
                  { path: "update/:id", element: <AddSalaryReport /> },
                ],
              },
              {
                path: "employee-advance-salary",
                children: [
                  { index: true, element: <AdvanceSalaryList /> },
                  { path: "add", element: <AddAdvanceSalary /> },
                ],
              },
              {
                path: "employee-average-report",
                element: <EmployeeAverageReport />,
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
        element: <Material />,
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
        children: [
          { index: true, element: <BeamCardList /> },
          { path: "add", element: <AddBeamCard /> },
          { path: "update/:id", element: <UpdateBeamCard /> },
        ],
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
        ],
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
            path: "sign-up",
            element: <SignUp />,
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
