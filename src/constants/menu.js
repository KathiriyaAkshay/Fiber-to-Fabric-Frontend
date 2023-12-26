export const menubarOptionsList = [
  {
    path: "/dashboard",
    key: "Dashboard",
    label: "Dashboard",
  },
  {
    path: "/quality-master",
    key: "Quality Master",
    label: "Quality Master",
    children: [
      {
        path: "inhouse-quality",
        key: "Inhouse Quality",
        label: "Inhouse Quality",
      },
      {
        path: "trading-quality",
        key: "Tranding Quality",
        label: "Tranding Quality",
      },
    ],
  },
  {
    path: "/company",
    key: "Company",
    label: "Company",
  },
  {
    path: "/user-master",
    key: "User Master",
    label: "User Master",
    children: [
      {
        path: "my-supervisor",
        key: "My Supervisor",
        label: "My Supervisor",
      },
      {
        path: "my-broker",
        key: "My Broker",
        label: "My Broker",
      },
      {
        path: "my-parties",
        key: "My Parties",
        label: "My Parties",
      },
      {
        path: "my-supplier",
        key: "My Supplier",
        label: "My Supplier",
      },
      {
        path: "my-employee",
        key: "My Employee",
        label: "My Employee",
      },
      {
        path: "my-collection",
        key: "My Collection",
        label: "My Collection",
      },
      {
        path: "my-accountant",
        key: "My Accountant",
        label: "My Accountant",
      },
      {
        path: "vehicle",
        key: "Vehicle",
        label: "Vehicle",
      },
    ],
  },
  {
    path: "/tasks",
    key: "Tasks",
    label: "Tasks",
    children: [
      {
        path: "daily-task",
        key: "Daily Task",
        label: "Daily Task",
      },
      {
        path: "daily-task-report",
        key: "Daily Task Report",
        label: "Daily Task Report",
      },
    ],
  },
  {
    path: "/production",
    key: "Production",
    label: "Production",
    children: [
      {
        path: "add-new-production",
        key: "Add New Production",
        label: "Add New Production",
      },
      {
        path: "inhouse-production",
        key: "Inhouse Production",
        label: "Inhouse Production",
      },
      {
        path: "opening-production",
        key: "Opening Production",
        label: "Opening Production",
      },
      {
        path: "taka-tp-cutting",
        key: "Taka Tp/Cutting",
        label: "Taka Tp/Cutting",
      },
      {
        path: "monthly-production-report",
        key: "Monthly Production Report",
        label: "Monthly Production Report",
      },
      {
        path: "folding-production",
        key: "Folding Production Menu",
        label: "Folding Production",
        children: [
          {
            path: "add-folding-production",
            key: "Add Folding Production",
            label: "Add Folding Production",
          },
          {
            path: "folding-production",
            key: "Folding Production",
            label: "Folding Production",
          },
        ],
      },
    ],
  },
  {
    path: "sales",
    key: "Sales",
    label: "Sales",
    children: [
      {
        path: "taka-return-request",
        key: "Taka Return Request",
        label: "Taka Return Request",
      },
      {
        path: "challan",
        key: "Challan Menu",
        label: "Challan",
        children: [
          {
            path: "grey-sale",
            key: "Grey Sale",
            label: "Grey Sale",
          },
          {
            path: "yarn-sale",
            key: "Yarn Sale",
            label: "Yarn Sale",
          },
          {
            path: "beam-sale",
            key: "Beam Sale",
            label: "Beam Sale",
          },
          {
            path: "sale-challan",
            key: "Sale Challan",
            label: "Sale Challan",
          },
          {
            path: "sales-return",
            key: "Sales Return",
            label: "Sales Return",
          },
        ],
      },
      {
        path: "bill",
        key: "Bill Menu",
        label: "Bill",
        children: [
          {
            path: "sales-bill-list",
            key: "Sales Bill List",
            label: "Sales Bill List",
          },
          {
            path: "yarn-sales-bill-list",
            key: "Yarn Sales Bill List",
            label: "Yarn Sales Bill List",
          },
          {
            path: "beam-sales-bill-list",
            key: "Beam Sales Bill List",
            label: "Beam Sales Bill List",
          },
        ],
      },
    ],
  },
  {
    path: "/purchase",
    key: "Purchase",
    label: "Purchase",
    children: [
      {
        path: "purchased-taka",
        key: "Purchased Taka",
        label: "Purchased Taka",
      },
      {
        path: "general-purchase-entry",
        key: "General Purchase Entry",
        label: "General Purchase Entry",
      },
      {
        path: "receive",
        key: "Receive Menu",
        label: "Receive",
        children: [
          {
            path: "yarn-receive",
            key: "Yarn Receive",
            label: "Yarn Receive",
          },
        ],
      },
      {
        path: "/purchase-size-beam",
        key: "Purchase Size Beam",
        label: "Purchase Size Beam",
        children: [
          {
            path: "send-beam-pipe",
            key: "Send Beam Pipe",
            label: "Send Beam Pipe",
          },
          {
            path: "bills-of-size-beam",
            key: "Bills Of Size Beam",
            label: "Bills Of Size Beam",
          },
          {
            path: "receive-size-beam",
            key: "Receive Size Beam",
            label: "Receive Size Beam",
          },
        ],
      },
      {
        path: "challan",
        key: "Purchase Challan Menu",
        label: "Challan",
        children: [
          {
            path: "purchase-challan",
            key: "Purchase Challan",
            label: "Purchase Challan",
          },
          {
            path: "purchased-return",
            key: "Purchased Return",
            label: "Purchased Return",
          },
          {
            path: "sale-purchased-taka",
            key: "Sale Purchased Taka",
            label: "Sale Purchased Taka",
          },
        ],
      },
      {
        path: "bill",
        key: "Purchase Bill",
        label: "Bill",
        children: [
          {
            path: "grey-purchased-bill",
            key: "Grey Purchased Bill",
            label: "Grey Purchased Bill",
          },
          {
            path: "yarn-bills",
            key: "Yarn Bills",
            label: "Yarn Bills",
          },
        ],
      },
    ],
  },
  {
    path: "/job",
    key: "Job",
    label: "Job",
    children: [
      {
        path: "job-taka",
        key: "Job Taka",
        label: "Job Taka",
      },
      {
        path: "sent",
        key: "Sent",
        label: "Sent",
        children: [
          {
            path: "beam-sent",
            key: "Beam Sent",
            label: "Beam Sent",
          },
          {
            path: "yarn-sent",
            key: "Yarn Sent",
            label: "Yarn Sent",
          },
        ],
      },
      {
        path: "receive",
        key: "Receive",
        label: "Receive",
        children: [
          {
            path: "beam-receive",
            key: "Beam Receive",
            label: "Beam Receive",
          },
          {
            path: "taka-receive",
            key: "Taka Receive",
            label: "Taka Receive",
          },
        ],
      },
      {
        path: "report",
        key: "Report",
        label: "Report",
        children: [
          {
            path: "beam-sent-report",
            key: "Beam Sent Report",
            label: "Beam Sent Report",
          },
          {
            path: "yarn-sent-report",
            key: "Yarn Sent Report",
            label: "Yarn Sent Report",
          },
          {
            path: "job-cost-report",
            key: "Job Cost Report",
            label: "Job Cost Report",
          },
          {
            path: "job-profit-report",
            key: "Job Profit Report",
            label: "Job Profit Report",
          },
          {
            path: "job-yarn-stock-report",
            key: "Job Yarn Stock Report",
            label: "Job Yarn Stock Report",
          },
          {
            path: "job-production",
            key: "Job Production",
            label: "Job Production",
          },
        ],
      },
      {
        path: "challan",
        key: "Challan",
        label: "Challan",
        children: [
          {
            path: "job-challan",
            key: "Job Challan",
            label: "Job Challan",
          },
          {
            path: "sale-job-taka",
            key: "Sale Job Taka",
            label: "Sale Job Taka",
          },
          {
            path: "rework-challan",
            key: "Rework Challan",
            label: "Rework Challan",
          },
          {
            path: "receive-rework-taka",
            key: "Receive Rework Taka",
            label: "Receive Rework Taka",
          },
        ],
      },
      {
        path: "bill",
        key: "Bill",
        label: "Bill",
        children: [
          {
            path: "job-bill",
            key: "Job Bill",
            label: "Job Bill",
          },
          {
            path: "rework-challan-bill",
            key: "Rework Challan Bill",
            label: "Rework Challan Bill",
          },
        ],
      },
    ],
  },
  {
    path: "/order-master",
    key: "Order Master",
    label: "Order Master",
    children: [
      {
        path: "my-orders",
        key: "My Orders",
        label: "My Orders",
      },
      {
        path: "my-yarn-orders",
        key: "My Yarn Orders",
        label: "My Yarn Orders",
      },
      {
        path: "size-beam-order",
        key: "Size Beam Order",
        label: "Size Beam Order",
      },
      {
        path: "schedule-delivery-list",
        key: "Schedule Delivery List",
        label: "Schedule Delivery List",
      },
    ],
  },
  {
    path: "/account",
    key: "Account",
    label: "Account",
    children: [
      {
        path: "accounts-report",
        key: "Accounts Report",
        label: "Accounts Report",
      },
      {
        path: "payment",
        key: "Payment",
        label: "Payment",
      },
      {
        path: "balance-sheet",
        key: "Balance Sheet",
        label: "Balance Sheet",
      },
      {
        path: "profite-and-loss",
        key: "Profite & Loss",
        label: "Profite & Loss",
      },
      {
        path: "statement",
        key: "Statement",
        label: "Statement",
        children: [
          {
            path: "passbook",
            key: "Passbook",
            label: "Passbook",
          },
          {
            path: "cashbook",
            key: "Cashbook",
            label: "Cashbook",
          },
          {
            path: "emi-loan",
            key: "EMI Loan",
            label: "EMI Loan",
          },
          {
            path: "bank-reconciliation",
            key: "Bank Reconciliation",
            label: "Bank Reconciliation",
          },
          {
            path: "cashbook-verify",
            key: "Cashbook Verify",
            label: "Cashbook Verify",
          },
        ],
      },
      {
        path: "reports",
        key: "Reports",
        label: "Reports",
        children: [
          {
            path: "sales-report",
            key: "Sales Report",
            label: "Sales Report",
          },
          {
            path: "cost-and-profit-report",
            key: "Cost And Profit Report",
            label: "Cost And Profit Report",
          },
          {
            path: "purchase-report",
            key: "Purchase Report",
            label: "Purchase Report",
          },
          {
            path: "ledger-report",
            key: "Ledger Report",
            label: "Ledger Report",
          },
          {
            path: "particular-ledger-report",
            key: "Particular Ledger Report",
            label: "Particular Ledger Report",
          },
          {
            path: "gstr-1-report",
            key: "GSTR-1 Report",
            label: "GSTR-1 Report",
          },
          {
            path: "gstr-2-report",
            key: "GSTR-2 Report",
            label: "GSTR-2 Report",
          },
          {
            path: "gstr-3b-report",
            key: "GSTR-3B Report",
            label: "GSTR-3B Report",
          },
          {
            path: "passbook-cashbook-balance",
            key: "Passbook/Cashbook Balance",
            label: "Passbook/Cashbook Balance",
          },
          {
            path: "turnover",
            key: "Turnover",
            label: "Turnover",
          },
          {
            path: "live-stock-report",
            key: "Live Stock Report",
            label: "Live Stock Report",
          },
          {
            path: "monthly-transaction-report",
            key: "Monthly Transaction Report",
            label: "Monthly Transaction Report",
          },
        ],
      },
      {
        path: "notes",
        key: "Notes",
        label: "Notes",
        children: [
          {
            path: "credit-notes",
            key: "Credit Notes",
            label: "Credit Notes",
          },
          {
            path: "debit-notes",
            key: "Debit Notes",
            label: "Debit Notes",
          },
        ],
      },
      {
        path: "group-wise-outstanding",
        key: "Group Wise Outstanding",
        label: "Group Wise Outstanding",
        children: [
          {
            path: "sundry-debtors",
            key: "Sundry Debtors",
            label: "Sundry Debtors",
          },
          {
            path: "sundry-creditors",
            key: "Sundry Creditors",
            label: "Sundry Creditors",
          },
        ],
      },
      {
        path: "cost-per-meter",
        key: "Cost Per Meter",
        label: "Cost Per Meter",
      },
      {
        path: "salary-master",
        key: "Salary Master",
        label: "Salary Master",
        children: [
          {
            path: "employee-salary-report",
            key: "Employee Salary Report",
            label: "Employee Salary Report",
          },
          {
            path: "employee-advance-salary",
            key: "Eemployee Advance Salary",
            label: "Eemployee Advance Salary",
          },
          {
            path: "employee-average-report",
            key: "Employee Average Report",
            label: "Employee Average Report",
          },
        ],
      },
    ],
  },
  {
    path: "/more",
    key: "More",
    label: "More",
    children: [
      {
        path: "machine",
        key: "Machine",
        label: "Machine",
      },
      {
        path: "material",
        key: "Material",
        label: "Material",
      },
      {
        path: "yarn-stock-company",
        key: "Yarn Stock Company",
        label: "Yarn Stock Company",
        children: [
          {
            path: "company-list",
            key: "Company List",
            label: "Company List",
          },
          {
            path: "manage-yarn-stock",
            key: "Manage Yarn Stock",
            label: "Manage Yarn Stock",
          },
        ],
      },
      {
        path: "beam-card",
        key: "Beam Card",
        label: "Beam Card",
      },
      {
        path: "require-ready-beam",
        key: "Require Ready Beam",
        label: "Require Ready Beam",
      },
      {
        path: "seeking",
        key: "Seeking",
        label: "Seeking",
      },
      {
        path: "cost calculator",
        key: "Cost Calculator",
        label: "Cost Calculator",
      },
      {
        path: "today-report",
        key: "Today Report",
        label: "Today Report",
      },
      {
        path: "gate-pass",
        key: "Gate Pass",
        label: "Gate Pass",
      },
    ],
  },
];
