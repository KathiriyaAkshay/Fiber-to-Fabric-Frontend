export const menubarOptionsList = [
  { index: true, title: "Dashboard" },
  { path: "/dashboard", title: "Dashboard" },
  {
    path: "/quality-master",
    title: "Quality Master",
    children: [
      { index: true, title: "Quality Master" },
      { path: "inhouse-quality", title: "Inhouse Quality" },
      { path: "trading-quality", title: "Tranding Quality" },
    ],
  },
  {
    path: "/company",
    title: "Company",
    children: [{ index: true, title: "Company" }],
  },
  {
    path: "/user-master",
    title: "User Master",
    children: [
      { index: true, title: "User Master" },
      { path: "my-supervisor", title: "My Supervisor" },
      { path: "my-broker", title: "My Broker" },
      { path: "my-parties", title: "My Parties" },
      { path: "my-supplier", title: "My Supplier" },
      { path: "my-employee", title: "My Employee" },
      { path: "my-collection", title: "My Collection" },
      { path: "my-accountant", title: "My Accountant" },
      { path: "vehicle", title: "Vehicle" },
    ],
  },
  {
    path: "/tasks",
    title: "Tasks",
    children: [
      { index: true, title: "Tasks" },
      { path: "daily-task", title: "Daily Task" },
      { path: "daily-task-report", title: "Daily Task Report" },
    ],
  },
  {
    path: "/production",
    title: "Production",
    children: [
      { index: true, title: "Production" },
      {
        path: "add-new-production",
        title: "Add New Production",
      },
      {
        path: "inhouse-production",
        title: "Inhouse Production",
      },
      {
        path: "opening-production",
        title: "Opening Production",
      },
      { path: "taka-tp-cutting", title: "Taka Tp/Cutting" },
      {
        path: "monthly-production-report",
        title: "Monthly Production Report",
      },
      {
        path: "folding-production",
        title: "Folding Production",
        children: [
          { index: true, title: "Folding Production" },
          {
            path: "add-folding-production",
            title: "Add Folding Production",
          },
          {
            path: "folding-production",
            title: "Folding Production",
          },
        ],
      },
    ],
  },
  {
    path: "sales",
    title: "Sales",
    children: [
      { index: true, title: "Sales" },
      {
        path: "taka-return-request",
        title: "Taka Return Request",
      },
      {
        path: "challan",
        title: "Challan",
        children: [
          { index: true, title: "Challan" },
          {
            path: "grey-sale",
            title: "Grey Sale",
          },
          {
            path: "yarn-sale",
            title: "Yarn Sale",
          },
          {
            path: "beam-sale",
            title: "Beam Sale",
          },
          {
            path: "sale-challan",
            title: "Sale Challan",
          },
          {
            path: "sales-return",
            title: "Sales Return",
          },
        ],
      },
      {
        path: "bill",
        title: "Bill",
        children: [
          { index: true, title: "Bill" },
          {
            path: "sales-bill-list",
            title: "Sales Bill List",
          },
          {
            path: "yarn-sales-bill-list",
            title: "Yarn Sales Bill List",
          },
          {
            path: "beam-sales-bill-list",
            title: "Beam Sales Bill List",
          },
        ],
      },
    ],
  },
  {
    path: "/purchase",
    title: "Purchase",
    children: [
      { index: true, title: "Purchase" },
      {
        path: "purchased-taka",
        title: "Purchased Taka",
      },
      {
        path: "general-purchase-entry",
        title: "General Purchase Entry",
      },
      {
        path: "receive",
        title: "Receive",
        children: [
          { index: true, title: "Receive" },
          {
            path: "yarn-receive",
            title: "Yarn Receive",
          },
        ],
      },
      {
        path: "/purchase-size-beam",
        title: "Purchase Size Beam",
        children: [
          { index: true, title: "Purchase Size Beam" },
          {
            path: "send-beam-pipe",
            title: "Send Beam Pipe",
          },
          {
            path: "bills-of-size-beam",
            title: "Bills Of Size Beam",
          },
          {
            path: "receive-size-beam",
            title: "Receive Size Beam",
          },
        ],
      },
      {
        path: "challan",
        title: "Challan",
        children: [
          { index: true, title: "Challan" },
          {
            path: "purchase-challan",
            title: "Purchase Challan",
          },
          {
            path: "purchased-return",
            title: "Purchased Return",
          },
          {
            path: "sale-purchased-taka",
            title: "Sale Purchased Taka",
          },
        ],
      },
      {
        path: "bill",
        title: "Bill",
        children: [
          { index: true, title: "Bill" },
          {
            path: "grey-purchased-bill",
            title: "Grey Purchased Bill",
          },
          {
            path: "yarn-bills",
            title: "Yarn Bills",
          },
        ],
      },
    ],
  },
  {
    path: "/job",
    title: "Job",
    children: [
      { index: true, title: "Job" },
      {
        path: "job-taka",
        title: "Job Taka",
      },
      {
        path: "sent",
        title: "Sent",
        children: [
          { index: true, title: "Sent" },
          {
            path: "beam-sent",
            title: "Beam Sent",
          },
          {
            path: "yarn-sent",
            title: "Yarn Sent",
          },
        ],
      },
      {
        path: "receive",
        title: "Receive",
        children: [
          { index: true, title: "Receive" },
          {
            path: "beam-receive",
            title: "Beam Receive",
          },
          {
            path: "taka-receive",
            title: "Taka Receive",
          },
        ],
      },
      {
        path: "report",
        title: "Report",
        children: [
          { index: true, title: "Report" },
          {
            path: "beam-sent-report",
            title: "Beam Sent Report",
          },
          {
            path: "yarn-sent-report",
            title: "Yarn Sent Report",
          },
          {
            path: "job-cost-report",
            title: "Job Cost Report",
          },
          {
            path: "job-profit-report",
            title: "Job Profit Report",
          },
          {
            path: "job-yarn-stock-report",
            title: "Job Yarn Stock Report",
          },
          {
            path: "job-production",
            title: "Job Production",
          },
        ],
      },
      {
        path: "challan",
        title: "Challan",
        children: [
          { index: true, title: "Challan" },
          {
            path: "job-challan",
            title: "Job Challan",
          },
          {
            path: "sale-job-taka",
            title: "Sale Job Taka",
          },
          {
            path: "rework-challan",
            title: "Rework Challan",
          },
          {
            path: "receive-rework-taka",
            title: "Receive Rework Taka",
          },
        ],
      },
      {
        path: "bill",
        title: "Bill",
        children: [
          { index: true, title: "Bill" },
          {
            path: "job-bill",
            title: "Job Bill",
          },
          {
            path: "rework-challan-bill",
            title: "Rework Challan Bill",
          },
        ],
      },
    ],
  },
  {
    path: "/order-master",
    title: "Order Master",
    children: [
      { index: true, title: "Order Master" },
      {
        path: "my-orders",
        title: "My Orders",
      },
      {
        path: "my-yarn-orders",
        title: "My Yarn Orders",
      },
      {
        path: "size-beam-order",
        title: "Size Beam Order",
      },
      {
        path: "schedule-delivery-list",
        title: "Schedule Delivery List",
      },
    ],
  },
  {
    path: "/account",
    title: "Account",
    children: [
      { index: true, title: "Account" },
      {
        path: "accounts-report",
        title: "Accounts Report",
      },
      {
        path: "payment",
        title: "Payment",
      },
      {
        path: "balance-sheet",
        title: "Balance Sheet",
      },
      {
        path: "profite-and-loss",
        title: "Profite & Loss",
      },
      {
        path: "statement",
        title: "Statement",
        children: [
          { index: true, title: "Statement" },
          {
            path: "passbook",
            title: "Passbook",
          },
          {
            path: "cashbook",
            title: "Cashbook",
          },
          {
            path: "emi-loan",
            title: "EMI Loan",
          },
          {
            path: "bank-reconciliation",
            title: "Bank Reconciliation",
          },
          {
            path: "cashbook-verify",
            title: "Cashbook Verify",
          },
        ],
      },
      {
        path: "reports",
        title: "Reports",
        children: [
          { index: true, title: "Reports" },
          {
            path: "sales-report",
            title: "Sales Report",
          },
          {
            path: "cost-and-profit-report",
            title: "Cost And Profit Report",
          },
          {
            path: "purchase-report",
            title: "Purchase Report",
          },
          {
            path: "ledger-report",
            title: "Ledger Report",
          },
          {
            path: "particular-ledger-report",
            title: "Particular Ledger Report",
          },
          {
            path: "gstr-1-report",
            title: "GSTR-1 Report",
          },
          {
            path: "gstr-2-report",
            title: "GSTR-2 Report",
          },
          {
            path: "gstr-3b-report",
            title: "GSTR-3B Report",
          },
          {
            path: "passbook-cashbook-balance",
            title: "Passbook/Cashbook Balance",
          },
          {
            path: "turnover",
            title: "Turnover",
          },
          {
            path: "live-stock-report",
            title: "Live Stock Report",
          },
          {
            path: "monthly-transaction-report",
            title: "Monthly Transaction Report",
          },
        ],
      },
      {
        path: "notes",
        title: "Notes",
        children: [
          { index: true, title: "Notes" },
          {
            path: "credit-notes",
            title: "Credit Notes",
          },
          {
            path: "debit-notes",
            title: "Debit Notes",
          },
        ],
      },
      {
        path: "group-wise-outstanding",
        title: "Group Wise Outstanding",
        children: [
          { index: true, title: "Group Wise Outstanding" },
          {
            path: "sundry-debtors",
            title: "Sundry Debtors",
          },
          {
            path: "sundry-creditors",
            title: "Sundry Creditors",
          },
        ],
      },
      {
        path: "cost-per-meter",
        title: "Cost Per Meter",
      },
      {
        path: "salary-master",
        title: "Salary Master",
        children: [
          { index: true, title: "Salary Master" },
          {
            path: "employee-salary-report",
            title: "Employee Salary Report",
          },
          {
            path: "employee-advance-salary",
            title: "Eemployee Advance Salary",
          },
          {
            path: "employee-average-report",
            title: "Employee Average Report",
          },
        ],
      },
    ],
  },
  {
    path: "/more",
    title: "More",
    children: [
      { index: true, title: "More" },
      {
        path: "machine",
        title: "Machine",
      },
      {
        path: "material",
        title: "Material",
      },
      {
        path: "yarn-stock-company",
        title: "Yarn Stock Company",
        children: [
          { index: true, title: "Yarn Stock Company" },
          {
            path: "company-list",
            title: "Company List",
          },
          {
            path: "manage-yarn-stock",
            title: "Manage Yarn Stock",
          },
        ],
      },
      {
        path: "beam-card",
        title: "Beam Card",
      },
      {
        path: "require-ready-beam",
        title: "Require Ready Beam",
      },
      {
        path: "seeking",
        title: "Seeking",
      },
      {
        path: "cost calculator",
        title: "Cost Calculator",
      },
      {
        path: "today-report",
        title: "Today Report",
      },
      {
        path: "gate-pass",
        title: "Gate Pass",
      },
    ],
  },
];
