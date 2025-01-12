import { Link } from "react-router-dom";

export const menubarOptionsList = [
  {
    path: "/dashboard",
    key: "Dashboard",
    label: (
      <Link
        className="text-current no-underline hover:text-current"
        to="/dashboard"
      >
        Dashboard
      </Link>
    ),
  },
  {
    path: "/company",
    key: "Company",
    label: (
      <Link
        className="text-current no-underline hover:text-current"
        to="/company"
      >
        Company
      </Link>
    ),
  },
  {
    path: "/user-master",
    key: "User Master",
    label: "User Master",
    // label: (
    //   <Link
    //     className="text-current no-underline hover:text-current"
    //     to="/user-master"
    //   >
    //     User Master
    //   </Link>
    // ),
    children: [
      {
        path: "my-supervisor",
        key: "My Supervisor",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="user-master/my-supervisor"
          >
            My Supervisor
          </Link>
        ),
      },
      {
        path: "my-broker",
        key: "My Broker",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="user-master/my-broker"
          >
            My Broker
          </Link>
        ),
      },
      {
        path: "my-party",
        key: "My Parties",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="user-master/my-party"
          >
            My Parties
          </Link>
        ),
      },
      {
        path: "my-supplier",
        key: "My Supplier",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="user-master/my-supplier"
          >
            My Supplier
          </Link>
        ),
      },
      {
        path: "my-employee",
        key: "My Employee",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="user-master/my-employee"
          >
            My Employee
          </Link>
        ),
      },
      {
        path: "my-collection",
        key: "My Collection",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="user-master/my-collection"
          >
            My Collection
          </Link>
        ),
      },
      {
        path: "my-accountant",
        key: "My Accountant",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="user-master/my-accountant"
          >
            My Accountant
          </Link>
        ),
      },
      {
        path: "vehicle",
        key: "Vehicle",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="user-master/vehicle"
          >
            Vehicle
          </Link>
        ),
      },
    ],
  },
  {
    path: "/quality-master",
    key: "Quality Master",
    label: (
      <Link
        className="text-current no-underline hover:text-current"
        to="/quality-master"
      >
        Quality Master
      </Link>
    ),
    children: [
      {
        path: "/quality-master/inhouse-quality",
        key: "Inhouse Quality",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="quality-master/inhouse-quality"
          >
            Inhouse Quality
          </Link>
        ),
      },
      {
        path: "/quality-master/trading-quality",
        key: "Trading Quality",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="quality-master/trading-quality"
          >
            Trading Quality
          </Link>
        ),
      },
    ],
  },
  {
    path: "/tasks",
    key: "Tasks",
    label: (
      <Link
        className="text-current no-underline hover:text-current"
        to="/tasks"
      >
        Tasks
      </Link>
    ),
    children: [
      {
        path: "daily-task",
        key: "Daily Task",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="tasks/daily-task"
          >
            Daily Task
          </Link>
        ),
      },
      {
        path: "daily-task-report",
        key: "Daily Task Report",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="tasks/daily-task-report"
          >
            Daily Task Report
          </Link>
        ),
      },
    ],
  },
  {
    path: "production/inhouse-production",
    key: "Production",
    label: (
      <Link
        className="text-current no-underline hover:text-current"
        to="production/inhouse-production"
      >
        Production
      </Link>
    ),
    children: [
      {
        path: "add-new-production",
        key: "Add New Production",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="production/add-new-production"
          >
            Add New Production
          </Link>
        ),
      },
      {
        path: "inhouse-production",
        key: "Inhouse Production",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="production/inhouse-production"
          >
            In-House Production
          </Link>
        ),
      },
      {
        path: "opening-production",
        key: "Opening Production",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="production/opening-production"
          >
            Opening Production
          </Link>
        ),
      },
      {
        path: "taka-tp-cutting",
        key: "Taka Tp/Cutting",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="production/taka-tp-cutting"
          >
            Taka Tp/Cutting
          </Link>
        ),
      },
      // {
      //   path: "monthly-production-report",
      //   key: "Monthly Production Report",
      //   label: (
      //     <Link
      //       className="text-current no-underline hover:text-current"
      //       to="production/monthly-production-report"
      //     >
      //       Monthly Production Report
      //     </Link>
      //   ),
      // },
      {
        path: "folding-production",
        key: "Folding Production Menu",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="production/folding-production/add-folding-production"
          >
            Add Folding Production
          </Link>
        ),
      },
    ],
  },
  {
    path: "sales",
    key: "Sales",
    label: (
      <Link
        className="text-current no-underline hover:text-current"
        to="sales/challan"
      >
        Sales
      </Link>
    ),
    children: [
      // {
      //   path: "taka-return-request",
      //   key: "Taka Return Request",
      //   label: (
      //     <Link
      //       className="text-current no-underline hover:text-current"
      //       to="sales/taka-return-request"
      //     >
      //       Taka Return Request
      //     </Link>
      //   ),
      // },
      {
        path: "challan",
        key: "Challan Menu",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="sales/challan"
          >
            Challan
          </Link>
        ),
        children: [
          // {
          //   path: "grey-sale",
          //   key: "Grey Sale",
          //   label: (
          //     <Link
          //       className="text-current no-underline hover:text-current"
          //       to="sales/challan/grey-sale"
          //     >
          //       Grey Sale
          //     </Link>
          //   ),
          // },
          {
            path: "yarn-sale",
            key: "Yarn Sale",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="sales/challan/yarn-sale"
              >
                Yarn Sale
              </Link>
            ),
          },
          {
            path: "job-work",
            key: "Job Work",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="sales/challan/job-work"
              >
                Job Work
              </Link>
            ),
          },
          {
            path: "beam-sale",
            key: "Beam Sale",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="sales/challan/beam-sale"
              >
                Beam Sale
              </Link>
            ),
          },
          {
            path: "sale-challan",
            key: "Sale Challan",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="sales/challan/sale-challan"
              >
                Sale Challan
              </Link>
            ),
          },
          {
            path: "sales-return",
            key: "Sales Return",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="sales/challan/sales-return"
              >
                Sales Return
              </Link>
            ),
          },
        ],
      },
      {
        path: "bill",
        key: "Bill Menu",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="sales/bill"
          >
            Bill
          </Link>
        ),
        children: [
          {
            path: "yarn-sales-bill-list",
            key: "Yarn Sales Bill List",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="sales/bill/yarn-sales-bill-list"
              >
                Yarn Sales Bill List
              </Link>
            ),
          },
          {
            path: "job-work-bill-list",
            key: "Job Work Bill List",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="sales/bill/job-work-bill-list"
              >
                Job Work Bill List
              </Link>
            ),
          },
          {
            path: "beam-sales-bill-list",
            key: "Beam Sales Bill List",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="sales/bill/beam-sales-bill-list"
              >
                Beam Sales Bill List
              </Link>
            ),
          },
          {
            path: "sales-bill-list",
            key: "Sales Bill List",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="sales/bill/sales-bill-list"
              >
                Sales Bill List
              </Link>
            ),
          },
          {
            path: "job-grey-sales-bill-list",
            key: "Job Grey Sales Bill List",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="sales/bill/job-grey-sales-bill-list"
              >
                Job Grey Sales Bill List
              </Link>
            ),
          },
        ],
      },
    ],
  },
  {
    path: "/purchase",
    key: "Purchase",
    label: (
      <Link
        className="text-current no-underline hover:text-current"
        to="/purchase"
      >
        Purchase
      </Link>
    ),
    children: [
      {
        path: "purchased-taka",
        key: "Purchased Taka",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="purchase/purchased-taka"
          >
            Purchased Taka
          </Link>
        ),
      },
      {
        path: "general-purchase-entry",
        key: "General Purchase Entry",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="purchase/general-purchase-entry"
          >
            General Purchase Entry
          </Link>
        ),
      },
      {
        path: "receive",
        key: "Receive Menu",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="purchase/receive"
          >
            Receive
          </Link>
        ),
        children: [
          {
            path: "yarn-receive",
            key: "Yarn Receive",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="purchase/receive/yarn-receive"
              >
                Yarn Receive
              </Link>
            ),
          },
          {
            path: "yarn-bills",
            key: "Yarn Bills",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="purchase/bill/yarn-bills"
              >
                Yarn Bills
              </Link>
            ),
          },
        ],
      },
      {
        path: "/purchase-size-beam",
        key: "Purchase Size Beam",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="purchase/purchase-size-beam"
          >
            Purchase Size Beam
          </Link>
        ),
        children: [
          {
            path: "receive-size-beam",
            key: "Receive Size Beam",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="purchase/purchase-size-beam/receive-size-beam"
              >
                Receive Size Beam
              </Link>
            ),
          },
          {
            path: "bills-of-size-beam",
            key: "Bills Of Size Beam",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="purchase/purchase-size-beam/bills-of-size-beam"
              >
                Bills Of Size Beam
              </Link>
            ),
          },
        ],
      },
      {
        path: "challan",
        key: "Purchase Challan Menu",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="purchase/challan"
          >
            Challan
          </Link>
        ),
        children: [
          {
            path: "purchase-challan",
            key: "Purchase Challan",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="purchase/challan/purchase-challan"
              >
                Purchase Challan
              </Link>
            ),
          },

          {
            path: "grey-purchased-bill",
            key: "Gre Purchased Bill",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="purchase/bill/grey-purchased-bill"
              >
                Purchased Bill
              </Link>
            ),
          },
          {
            path: "purchased-return",
            key: "Purchased Return",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="purchase/challan/purchased-return"
              >
                Purchased Return
              </Link>
            ),
          },
          {
            path: "sale-purchased-taka",
            key: "Sale Purchased Taka",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="sales/challan/sale-challan"
              >
                Sale Purchased Taka
              </Link>
            ),
          },
        ],
      },
      // {
      //   path: "bill",
      //   key: "Purchase Bill",
      //   label: (
      //     <Link
      //       className="text-current no-underline hover:text-current"
      //       to="purchase/bill"
      //     >
      //       Bill
      //     </Link>
      //   ),
      //   children: [
      //     {
      //       path: "grey-purchased-bill",
      //       key: "Grey Purchased Bill",
      //       label: (
      //         <Link
      //           className="text-current no-underline hover:text-current"
      //           to="purchase/bill/grey-purchased-bill"
      //         >
      //           Grey Purchased Bill
      //         </Link>
      //       ),
      //     },
      //   ],
      // },
    ],
  },
  {
    path: "/job",
    key: "Job",
    label: (
      <Link className="text-current no-underline hover:text-current" to="/job">
        Job
      </Link>
    ),
    children: [
      {
        path: "job-taka",
        key: "Job Taka",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="job/job-taka"
          >
            Job Taka
          </Link>
        ),
      },
      {
        path: "sent",
        key: "Sent",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="job/sent"
          >
            Sent
          </Link>
        ),
        children: [
          {
            path: "beam-sent",
            key: "Beam Sent",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="job/sent/beam-sent"
              >
                Beam Sent
              </Link>
            ),
          },
          {
            path: "yarn-sent",
            key: "Yarn Sent",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="job/sent/yarn-sent"
              >
                Yarn Sent
              </Link>
            ),
          },
        ],
      },
      {
        path: "receive",
        key: "Receive",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="job/receive"
          >
            Receive
          </Link>
        ),
        children: [
          {
            path: "beam-receive",
            key: "Beam Receive",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="job/receive/beam-receive"
              >
                Beam Receive
              </Link>
            ),
          },
          {
            path: "taka-receive",
            key: "Taka Receive",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="job/receive/taka-receive"
              >
                Taka Receive
              </Link>
            ),
          },
        ],
      },
      {
        path: "report",
        key: "Report",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="job/report"
          >
            Report
          </Link>
        ),
        children: [
          {
            path: "beam-sent-report",
            key: "Beam Sent Report",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="job/report/beam-sent-report"
              >
                Beam Sent Report
              </Link>
            ),
          },
          {
            path: "yarn-sent-report",
            key: "Yarn Sent Report",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="job/report/yarn-sent-report"
              >
                Yarn Sent Report
              </Link>
            ),
          },
          {
            path: "job-cost-report",
            key: "Job Cost Report",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="job/report/job-cost-report"
              >
                Job Cost Report
              </Link>
            ),
          },
          {
            path: "job-profit-report",
            key: "Job Profit Report",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="job/report/job-profit-report"
              >
                Job Profit Report
              </Link>
            ),
          },
          {
            path: "job-yarn-stock-report",
            key: "Job Yarn Stock Report",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="job/report/job-yarn-stock-report"
              >
                Job Yarn Stock Report
              </Link>
            ),
          },
          {
            path: "job-production",
            key: "Job Production",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="job/report/job-production"
              >
                Job Production
              </Link>
            ),
          },
        ],
      },
      {
        path: "challan",
        key: "Challan",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="job/challan"
          >
            Challan
          </Link>
        ),
        children: [
          {
            path: "job-challan",
            key: "Job Challan",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="job/challan/job-challan"
              >
                Job Challan
              </Link>
            ),
          },
          {
            path: "job-bill",
            key: "Job Bill",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="job/bill/job-bill"
              >
                Job Bill
              </Link>
            ),
          },
          {
            path: "sale-job-taka",
            key: "Sale Job Taka",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="sales/challan/sale-challan"
              >
                Sale Job Taka
              </Link>
            ),
          },
        ],
      },
      {
        path: "Rework",
        key: "Rework",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="job/challan"
          >
            Rework
          </Link>
        ),
        children: [
          {
            path: "rework-challan",
            key: "Rework Challan",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="job/challan/rework-challan"
              >
                Rework Challan
              </Link>
            ),
          },
          {
            path: "receive-rework-taka",
            key: "Receive Rework Taka",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="job/challan/receive-rework-taka"
              >
                Receive Rework Taka
              </Link>
            ),
          },
          {
            path: "rework-challan-bill",
            key: "Rework Challan Bill",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="job/bill/rework-challan-bill"
              >
                Rework Challan Bill
              </Link>
            ),
          },
        ],
      },
    ],
  },
  {
    path: "/order-master",
    key: "Order Master",
    label: (
      <Link
        className="text-current no-underline hover:text-current"
        to="/order-master"
      >
        Order Master
      </Link>
    ),
    children: [
      {
        path: "my-orders",
        key: "My Orders",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="order-master/my-orders"
          >
            My Orders
          </Link>
        ),
      },
      {
        path: "my-yarn-orders",
        key: "My Yarn Orders",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="order-master/my-yarn-orders"
          >
            My Yarn Orders
          </Link>
        ),
      },
      {
        path: "size-beam-order",
        key: "Size Beam Order",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="order-master/size-beam-order"
          >
            Size Beam Order
          </Link>
        ),
      },
      {
        path: "schedule-delivery-list",
        key: "Schedule Delivery List",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="order-master/schedule-delivery-list"
          >
            Schedule Delivery List
          </Link>
        ),
      },
    ],
  },
  {
    path: "/account",
    key: "Account",
    label: (
      <Link
        className="text-current no-underline hover:text-current"
        to="/account"
      >
        Account
      </Link>
    ),
    children: [
      {
        path: "accounts-report",
        key: "Accounts Report",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="account/accounts-report"
          >
            Accounts Report
          </Link>
        ),
      },
      {
        path: "payment",
        key: "Payment",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="account/payment"
          >
            Payment
          </Link>
        ),
      },
      {
        path: "balance-sheet",
        key: "Balance Sheet",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="account/balance-sheet"
          >
            Balance Sheet
          </Link>
        ),
      },
      {
        path: "profite-and-loss",
        key: "Profite & Loss",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="account/profite-and-loss"
          >
            Profite & Loss
          </Link>
        ),
      },
      {
        path: "statement",
        key: "Statement",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="account/statement"
          >
            Statement
          </Link>
        ),
        children: [
          {
            path: "passbook",
            key: "Passbook",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="account/statement/passbook"
              >
                Passbook
              </Link>
            ),
          },
          {
            path: "cashbook",
            key: "Cashbook",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="account/statement/cashbook"
              >
                Cashbook
              </Link>
            ),
          },
          {
            path: "emi-loan",
            key: "EMI Loan",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="account/statement/emi-loan"
              >
                EMI Loan
              </Link>
            ),
          },
          {
            path: "bank-reconciliation",
            key: "Bank Reconciliation",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="account/statement/bank-reconciliation"
              >
                Bank Reconciliation
              </Link>
            ),
          },
          {
            path: "cashbook-verify",
            key: "Cashbook Verify",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="account/statement/cashbook-verify"
              >
                Cashbook Verify
              </Link>
            ),
          },
        ],
      },
      {
        path: "reports",
        key: "Reports",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="account/reports"
          >
            Reports
          </Link>
        ),
        children: [
          {
            path: "sales-report",
            key: "Sales Report",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="account/reports/sales-report"
              >
                Sales Report
              </Link>
            ),
          },
          {
            path: "cost-and-profit-report",
            key: "Cost And Profit Report",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="account/reports/cost-and-profit-report"
              >
                Cost And Profit Report
              </Link>
            ),
          },
          {
            path: "purchase-report",
            key: "Purchase Report",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="account/reports/purchase-report"
              >
                Purchase Report
              </Link>
            ),
          },
          {
            path: "ledger-report",
            key: "Ledger Report",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="account/reports/ledger-report"
              >
                Ledger Report
              </Link>
            ),
          },
          {
            path: "particular-ledger-report",
            key: "Particular Ledger Report",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="account/reports/particular-ledger-report"
              >
                Particular Ledger Report
              </Link>
            ),
          },
          {
            path: "gstr-1-report",
            key: "GSTR-1 Report",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="account/reports/gstr-1-report"
              >
                GSTR-1 Report
              </Link>
            ),
          },
          {
            path: "gstr-2-report",
            key: "GSTR-2 Report",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="account/reports/gstr-2-report"
              >
                GSTR-2 Report
              </Link>
            ),
          },
          {
            path: "gstr-3b-report",
            key: "GSTR-3B Report",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="account/reports/gstr-3b-report"
              >
                GSTR-3B Report
              </Link>
            ),
          },
          {
            path: "passbook-cashbook-balance",
            key: "Passbook/Cashbook Balance",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="account/reports/passbook-cashbook-balance"
              >
                Passbook/Cashbook Balance
              </Link>
            ),
          },
          {
            path: "turnover",
            key: "Turnover",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="account/reports/turnover"
              >
                Turnover
              </Link>
            ),
          },
          {
            path: "live-stock-report",
            key: "Live Stock Report",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="account/reports/live-stock-report"
              >
                Live Stock Report
              </Link>
            ),
          },
          {
            path: "monthly-transaction-report",
            key: "Monthly Transaction Report",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="account/reports/monthly-transaction-report"
              >
                Monthly Transaction Report
              </Link>
            ),
          },
        ],
      },
      {
        path: "notes",
        key: "Notes",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="account/notes"
          >
            Notes
          </Link>
        ),
        children: [
          {
            path: "credit-notes",
            key: "Credit Notes",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="account/notes/credit-notes"
              >
                Credit Notes
              </Link>
            ),
          },
          {
            path: "debit-notes",
            key: "Debit Notes",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="account/notes/debit-notes"
              >
                Debit Notes
              </Link>
            ),
          },
        ],
      },
      {
        path: "group-wise-outstanding",
        key: "Group Wise Outstanding",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="account/group-wise-outstanding"
          >
            Group Wise Outstanding
          </Link>
        ),
        children: [
          {
            path: "sundry-debtors",
            key: "Sundry Debtors",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="account/group-wise-outstanding/sundry-debtors"
              >
                Sundry Debtors
              </Link>
            ),
          },
          {
            path: "sundry-creditors",
            key: "Sundry Creditors",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="account/group-wise-outstanding/sundry-creditors"
              >
                Sundry Creditors
              </Link>
            ),
          },
        ],
      },
      {
        path: "cost-per-meter",
        key: "Cost Per Meter",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="account/cost-per-meter"
          >
            Cost Per Meter
          </Link>
        ),
      },
      {
        path: "salary-master",
        key: "Salary Master",
        label: (
          <Link
            className="text-current no-underline hover:text-current"
            to="account/salary-master"
          >
            Salary Master
          </Link>
        ),
        children: [
          {
            path: "employee-salary-report",
            key: "Employee Salary Report",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="account/salary-master/employee-salary-report"
              >
                Employee Salary Report
              </Link>
            ),
          },
          {
            path: "employee-advance-salary",
            key: "Eemployee Advance Salary",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="account/salary-master/employee-advance-salary"
              >
                Eemployee Advance Salary
              </Link>
            ),
          },
          {
            path: "employee-average-report",
            key: "Employee Average Report",
            label: (
              <Link
                className="text-current no-underline hover:text-current"
                to="account/salary-master/employee-average-report"
              >
                Employee Average Report
              </Link>
            ),
          },
        ],
      },
    ],
  },
  // {
  //   path: "/more",
  //   key: "More",
  //   // label: <Link className="text-current no-underline hover:text-current" to="/more">More</Link>,
  //   label: "More",
  //   children: [
  {
    path: "machine",
    key: "Machine",
    label: (
      <Link
        className="text-current no-underline hover:text-current"
        to="machine"
      >
        Machine
      </Link>
    ),
  },
  {
    path: "material",
    key: "Material",
    label: (
      <Link
        className="text-current no-underline hover:text-current"
        to="material"
      >
        Material
      </Link>
    ),
  },
  {
    path: "yarn-stock-company",
    key: "Yarn Stock Company",
    label: (
      <Link
        className="text-current no-underline hover:text-current"
        to="yarn-stock-company"
      >
        Yarn Stock Company
      </Link>
    ),
    // children: [
    //   {
    //     path: "company-list",
    //     key: "Company List",
    //     label: (
    //       <Link className="text-current no-underline hover:text-current" to="yarn-stock-company/company-list">Company List</Link>
    //     ),
    //   },
    //   {
    //     path: "manage-yarn-stock",
    //     key: "Manage Yarn Stock",
    //     label: (
    //       <Link className="text-current no-underline hover:text-current" to="yarn-stock-company/manage-yarn-stock">
    //         Manage Yarn Stock
    //       </Link>
    //     ),
    //   },
    // ],
  },
  {
    path: "beam-card",
    key: "Beam Card",
    label: (
      <Link
        className="text-current no-underline hover:text-current"
        to="beam-card"
      >
        Beam Card
      </Link>
    ),
  },
  {
    path: "require-ready-beam",
    key: "Require Ready Beam",
    label: (
      <Link
        className="text-current no-underline hover:text-current"
        to="require-ready-beam"
      >
        Require Ready Beam
      </Link>
    ),
  },
  {
    path: "seeking",
    key: "Seeking",
    label: (
      <Link
        className="text-current no-underline hover:text-current"
        to="seeking"
      >
        Seeking
      </Link>
    ),
  },
  {
    path: "cost-calculator",
    key: "Cost Calculator",
    label: (
      <Link
        className="text-current no-underline hover:text-current"
        to="cost-calculator"
      >
        Cost Calculator
      </Link>
    ),
  },
  {
    path: "today-report",
    key: "Today Report",
    label: (
      <Link
        className="text-current no-underline hover:text-current"
        to="today-report"
      >
        Today Report
      </Link>
    ),
  },
  {
    path: "gate-pass",
    key: "Gate Pass",
    label: (
      <Link
        className="text-current no-underline hover:text-current"
        to="gate-pass"
      >
        Gate Pass
      </Link>
    ),
  },
  // ],
  // },
];
