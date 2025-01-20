import {
  Button,
  Checkbox,
  DatePicker,
  Dropdown,
  Empty,
  Flex,
  Input,
  message,
  Radio,
  Select,
  Spin,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { useContext, useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { GlobalContext } from "../../../contexts/GlobalContext";
import dayjs from "dayjs";
import { getBrokerListRequest } from "../../../api/requests/users";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckOutlined,
  EyeOutlined,
  FilePdfOutlined,
  FileTextFilled,
  FileTextOutlined,
  TabletFilled,
} from "@ant-design/icons";
import {
  getSundryDebtorsService,
  paidInterestRequest,
} from "../../../api/requests/accounts/sundryDebtors";
import { Link } from "react-router-dom";
import useDebounce from "../../../hooks/useDebounce";
import DebitorNotesModal from "../../../components/accounts/groupWiseOutStanding/sundryDebitor/DebitorNotesModal";
// import ViewDebitorBill from "../../../components/accounts/groupWiseOutStanding/sundryDebitor/ViewDebitorBill";
import PrintYarnSaleChallan from "../../../components/sale/challan/yarn/printYarnSaleChallan";
import {
  saleJobWorkChallanListRequest,
  saleYarnChallanListRequest,
} from "../../../api/requests/sale/challan/challan";
import { getBeamSaleChallanListRequest } from "../../../api/requests/sale/challan/beamSale";
import { getSaleBillListRequest } from "../../../api/requests/sale/bill/saleBill";
import PrintBeamSaleChallan from "../../../components/sale/challan/beamSale/printBeamSaleChallan";
import SaleBillComp from "../../../components/sale/bill/saleBillComp";
import PrintJobWorkChallan from "../../../components/sale/challan/jobwork/printJobWorkChallan";
import JobGrayBillComp from "../../../components/sale/bill/jobGrayBillComp";
import { getJobGraySaleBillListRequest } from "../../../api/requests/sale/bill/jobGraySaleBill";
import moment from "moment";
import SundaryStaticDebiteNoteViews from "../../../components/accounts/notes/DebitNotes/sundaryStaticDebiteNoteViews";
import InterestPaymentModal from "../../../components/accounts/groupWiseOutStanding/sundryDebitor/InterestPaymentModel";
import BillPaymentModel from "../../../components/accounts/groupWiseOutStanding/sundryDebitor/billPaymentModel";
import SundaryDebitNoteGenerate from "../../../components/accounts/notes/DebitNotes/sundaryDebiteNoteGenerate";
import SunadryCreditNoteGenerate from "../../../components/accounts/notes/CreditNotes/sundaryCreditNoteGenerate";
import { getCurrentFinancialYear } from "../reports/utils";
import { BEAM_SALE_BILL_MODEL, BEAM_SALE_MODEL_NAME, CREDIT_NOTE_BILL_MODEL, CREDIT_NOTE_MODEL_NAME, DEBIT_NOTE_BILL_MODEL, DEBIT_NOTE_NAME, JOB_GREAY_BILL_MODEL_NAME, JOB_GREAY_SALE_BILL_MODEL, JOB_WORK_BILL_MODEL, JOB_WORK_MODEL_NAME, SALE_BILL_MODEL, SALE_BILL_MODEL_NAME, YARN_RECEIVE_BILL_MODEL, YARN_SALE_BILL_MODEL, YARN_SALE_BILL_MODEL_NAME } from "../../../constants/bill.model";
import YarnSaleChallanModel from "../../../components/sale/challan/yarn/YarnSaleChallan";
import BeamSaleChallanModel from "../../../components/sale/challan/beamSale/BeamSaleChallan";
import JobWorkSaleChallanModel from "../../../components/sale/challan/jobwork/JobSaleChallan";

function calculateDaysDifference(dueDate) {
  const today = new Date(); // Get today's date
  const [day, month, year] = dueDate.split("-");
  const due = new Date(year, month - 1, day);
  const timeDifference = today - due; // Difference in milliseconds
  const dayDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
  return dayDifference;
}


const CalculateInterest = (due_days, bill_amount) => {
  const INTEREST_RATE = 0.12; // Annual interest rate of 12%
  if (due_days <= 0 || bill_amount <= 0) {
    return 0; // Return 0 if inputs are invalid
  }
  // Calculate interest
  const interestAmount = (+bill_amount * INTEREST_RATE * due_days) / 365;
  return interestAmount.toFixed(2); // Return the interest amount rounded to 2 decimal places
};

const selectionOption = [
  { label: "Show all bills", value: "show_all_bills" },
  { label: "Pending interest", value: "pending_interest" },
  { label: "Only Dues", value: "only_dues" },
  { label: "30+ days", value: "30" },
  { label: "45+ days", value: "45" },
  { label: "60+ days", value: "60" },
  { label: "90+ days", value: "90" },
];

const BILL_MODEL = {
  yarn_sale_bills: "yarn_sale_bills",
  beam_sale_bill: "beam_sale_bill",
  job_work_bills: "job_work_bills",
  sale_bills: "sale_bills",
  job_gray_sale_bill: "job_gray_sale_bill",
};


const NOTE_GENERATE_MODE = "Generate";
const NOTE_VIEW_MODE = "View";


const SundryDebitor = () => {
  const { company, companyId, companyListRes } = useContext(GlobalContext);
  const queryClient = useQueryClient();
  const { startDate, endDate } = getCurrentFinancialYear();
  const [billInformationLoading, setBillInformationLoading] = useState(false);

  const [selectedUser, setSelectedUser] = useState(undefined) ; 
  const [fromDate, setFromDate] = useState(dayjs(startDate));
  const [toDate, setToDate] = useState(dayjs(endDate));
  const [billNo, setBillNo] = useState("");
  const [broker, setBroker] = useState(null);
  const [selection, setSelection] = useState("show_all_bills");
  const debounceFromDate = useDebounce(fromDate, 500);
  const debounceToDate = useDebounce(toDate, 500);

  const { data: brokerUserListRes, isLoading: isLoadingBrokerList } = useQuery({
    queryKey: ["broker", "list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getBrokerListRequest({
        params: { company_id: companyId, page: 0, pageSize: 99999 },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  // Sundry debit note related date load handler ===========================================
  const [initialDebitorData, setInitialDebitorData] = useState([]);
  const [debitorDataList, setDebitorDataList] = useState([]);

  const { data: sundryDebtorData, isFetching: isLoadingSundryDebtor } =
    useQuery({
      queryKey: [
        "sundry",
        "debtor",
        "data",
        {
          from_date: dayjs(debounceFromDate).format("YYYY-MM-DD"),
          to_date: dayjs(debounceToDate).format("YYYY-MM-DD"),
          company_id: companyId,
        },
      ],
      queryFn: async () => {
        const params = {
          from_date: dayjs(debounceFromDate).format("YYYY-MM-DD"),
          to_date: dayjs(debounceToDate).format("YYYY-MM-DD"),
          company_id: companyId,
        };
        const res = await getSundryDebtorsService({ params });
        return res.data?.data;
      },
      enabled: Boolean(companyId),
    });

  useEffect(() => {
    setInitialDebitorData(sundryDebtorData);
    setDebitorDataList(sundryDebtorData);
  }, [sundryDebtorData]);

  // ===================== Handle bill selection related filter ================= //
  useEffect(() => {
    if (selection == "show_all_bills") {
      setDebitorDataList(initialDebitorData);
    } else if (selection == "pending_interest") {
      const temp = initialDebitorData?.map((element) => {
        const temp_bill = element?.bills?.filter((bill) => {
          if ([CREDIT_NOTE_BILL_MODEL, DEBIT_NOTE_BILL_MODEL].includes(bill?.model)) {
            return false;
          }
          const dueDate = moment(bill?.due_days).format("DD-MM-YYYY");
          const dueDays = isNaN(calculateDaysDifference(dueDate))
            ? 0
            : calculateDaysDifference(dueDate);
          const interest = CalculateInterest(dueDays, bill?.amount);
          const interest_paid_amount = bill?.interest_amount;
          // Return true if interest is greater than 0 and interest_paid_amount is null
          return +interest > 0 && interest_paid_amount == null;
        });

        // Ensure that if no bills meet criteria, bills will be an empty array
        return {
          ...element,
          bills: temp_bill?.length > 0 ? temp_bill : [],
        };
      });
      setDebitorDataList(temp);
    } else if (selection == "only_dues") {
      const temp = initialDebitorData?.map((element) => {
        const temp_bill = element?.bills?.filter((bill) => {
          if ([CREDIT_NOTE_BILL_MODEL, DEBIT_NOTE_BILL_MODEL].includes(bill?.model)) {
            return false;
          }
          const dueDate = moment(bill?.due_days).format("DD-MM-YYYY");
          const dueDays = isNaN(calculateDaysDifference(dueDate))
            ? 0
            : calculateDaysDifference(dueDate);
          const interest_paid_amount = bill?.interest_amount;
          const paid_amount = bill?.paid_amount;
          return (
            dueDays > 0 && (interest_paid_amount == null || paid_amount == null)
          );
        });

        // Return the element with the filtered bills (or empty array if no bills match)
        return {
          ...element,
          bills: temp_bill?.length > 0 ? temp_bill : [],
        };
      });
      setDebitorDataList(temp);
    } else if (["30", "45", "60", "90"]?.includes(selection)) {
      const temp = initialDebitorData?.map((element) => {
        const temp_bill = element?.bills?.filter((bill) => {
          if (["credit_notes", "debit_notes"].includes(bill?.model)) {
            return false;
          }
          const dueDate = moment(bill?.due_days).format("DD-MM-YYYY");
          const dueDays = isNaN(calculateDaysDifference(dueDate))
            ? 0
            : calculateDaysDifference(dueDate);
          const interest_paid_amount = bill?.interest_amount;
          const paid_amount = bill?.paid_amount;
          return (
            dueDays > +selection &&
            (interest_paid_amount == null || paid_amount == null)
          );
        });

        // Return the element with the filtered bills (or empty array if no bills match)
        return {
          ...element,
          bills: temp_bill?.length > 0 ? temp_bill : [],
        };
      });
      setDebitorDataList(temp);
    } else {
      setDebitorDataList(initialDebitorData);
    }
  }, [selection]);

  const grandTotal = useMemo(() => {
    if (debitorDataList && debitorDataList?.length) {
      let meter = 0;
      let billAmount = 0;

      debitorDataList?.forEach((item) => {
        item?.bills?.forEach((bill) => {
          let total_amount = parseFloat(+bill?.amount || 0).toFixed(2) || 0;
          let credit_note_amount =
            parseFloat(+bill?.credit_note_amount || 0).toFixed(2) || 0;
          let paid_amount = parseFloat(+bill?.paid_amount || 0).toFixed(2) || 0;
          let finalAmount = total_amount - paid_amount - credit_note_amount;
          meter += +bill?.meter;
          billAmount += +finalAmount;
        });
      });

      return { meter, bill_amount: billAmount };
    } else {
      return { meter: 0, bill_amount: 0 };
    }
  }, [debitorDataList]);

  // Interest Payment selection related functionality ============================
  const [selectedInterestBill, setSelectedInterestBill] = useState([]);
  const [totalInterestAmount, setTotalInterestAmount] = useState(0);
  const [interestPaymentModalOpen, setPaymentInterestModalOpen] =
    useState(false);

  useEffect(() => {
    if (selectedInterestBill?.length > 0) {
      let totalInterest = 0;
      selectedInterestBill?.map((bill) => {
        let dueDate = moment(bill?.due_days).format("DD-MM-YYYY");
        let dueDays = isNaN(calculateDaysDifference(dueDate))
          ? 0
          : calculateDaysDifference(dueDate);
        let interestAmount = CalculateInterest(dueDays, bill?.amount);
        totalInterest += +interestAmount || 0;
      });
      setTotalInterestAmount(totalInterest);
    }
  }, [selectedInterestBill]);

  // ===== Bill Number selection related functionality ========= //

  useEffect(() => {
    if (billNo !== "" && billNo !== undefined) {
      const temp = debitorDataList?.map((element) => {
        const temp_bill = element?.bills?.filter((bill) => {
          let temp_bill_no = bill?.bill_no;
          return String(temp_bill_no)
            .toLowerCase()
            .includes(String(billNo).toLowerCase());
        });
        return {
          ...element,
          bills: temp_bill?.length > 0 ? temp_bill : [],
        };
      });
      setDebitorDataList(temp);
    } else {
      setDebitorDataList(initialDebitorData);
    }
  }, [billNo]);

  const handleInterestCheckboxSelection = (event, bill) => {
    const { checked } = event.target;

    setSelectedInterestBill((prev) => {
      if (checked) {
        // Check if the new bill matches supplier_id or party_id with the existing elements
        const hasMatchingSupplierOrParty = prev.some(
          (item) =>
            item?.supplier_id === bill?.supplier_id ||
            item?.party_id === bill?.party_id
        );

        if (hasMatchingSupplierOrParty) {
          // Add the new bill to the array
          return [...prev, bill];
        } else {
          // Clear the state and add only the new bill
          return [bill];
        }
      } else {
        // Filter out the unselected bill
        return prev.filter(
          (item) =>
            item?.bill_id !== bill?.bill_id || item?.model !== bill?.model
        );
      }
    });
  };

  const { mutateAsync: addInterestAmount } = useMutation({
    mutationFn: async ({ data }) => {
      const res = await paidInterestRequest({
        data: data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["account", "group-wise-outstanding", "debiter", "sundry"],
    onSuccess: (res) => {
      queryClient.invalidateQueries(["sundry", "debtor", "data"]);
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      setPaymentInterestModalOpen(false);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(errorMessage);
    },
  });

  const PaidInterestAmount = async (records,due_date, data) => {
    let requestPayload = [];
    data?.map((element) => {
      requestPayload.push({
        interest_amount: +parseFloat(element?.interest).toFixed(2),
        interest_paid_date: moment(due_date).format("YYYY-MM-DD"),
        model: element?.model,
        bill_id: element?.bill_id,
      });

      if (selectedUser?.is_supplier){
        requestPayload["supplier_id"] = selectedUser?.id
      } else {
        requestPayload["party_id"] = selectedUser?.id
      }
    });
    // await addInterestAmount({ data: requestPayload });
  };

  // Bill Payment selection handler ==============================================
  const [selectedBill, setSelectedBill] = useState([]);
  const [totalBillAmount, setTotalBillAmount] = useState(undefined);
  const [billModelOpen, setBillModelOpen] = useState(false);

  useEffect(() => {
    if (selectedBill?.length > 0) {
      let totalAmount = 0;
      selectedBill?.map((bill) => {

        let total_amount = parseFloat(+bill?.amount || 0).toFixed(2) || 0; // Bill total payment 
        let credit_note_amount = parseFloat(+bill?.credit_note_amount || 0).toFixed(2) || 0; // Bill credit note amount
        let bill_deducation_amount = +total_amount - +credit_note_amount;
        let bill_remaing_amount = parseFloat(bill?.part_payment == null ? bill_deducation_amount : +bill?.part_payment).toFixed(2);
        totalAmount += +bill_remaing_amount;
      });
      setTotalBillAmount(totalAmount);
    }
  }, [selectedBill]);

  const handleBillSelection = (event, bill) => {
    const { checked } = event.target;
    setSelectedBill((prev) => {
      if (checked) {
        // Check if the new bill matches supplier_id or party_id with the existing elements
        const hasMatchingSupplierOrParty = prev.some(
          (item) =>
            item?.supplier_id === bill?.supplier_id ||
            item?.party_id === bill?.party_id
        );

        if (hasMatchingSupplierOrParty) {
          // Add the new bill to the array
          return [...prev, bill];
        } else {
          // Clear the state and add only the new bill
          return [bill];
        }
      } else {
        // Filter out the unselected bill
        return prev.filter(
          (item) =>
            item?.bill_id !== bill?.bill_id || item?.model !== bill?.model
        );
      }
    });
  };

  // Payment debit note generation ================================================
  const [debitNoteModelOpen, setDebitNoteModelOpen] = useState(false);
  const [debitNoteSelection, setDebitNoteSelection] = useState([]);
  const [debitNoteModelData, setDebitNoteModelData] = useState(undefined);
  const [debiteNoteView, setDebitNoteView] = useState(NOTE_GENERATE_MODE);

  const handleDebitNoteSelection = (event, bill, data) => {
    const { checked } = event.target;
    setDebitNoteSelection((prev) => {
      if (checked) {
        const hasMatchingSupplierOrParty = prev.some(
          (item) =>
            item?.supplier_id === bill?.supplier_id ||
            item?.party_id === bill?.party_id
        );

        if (hasMatchingSupplierOrParty) {
          return [...prev, bill];
        } else {
          return [bill];
        }
      } else {
        return prev.filter(
          (item) =>
            item?.bill_id !== bill?.bill_id || item?.model !== bill?.model
        );
      }
    });

    if (data) {
      setDebitNoteModelData(data);
    }
  };

  // ========= Credit note information model =============== //
  const [creditNoteMoelOpen, setCreditNoteModelOpen] = useState(false);
  const [creditNoteSelection, setCreditNoteSelection] = useState([]);
  const [creditNoteModelData, setCreditNoteModelData] = useState(undefined);
  const [creditNoteView, setCreditNoteView] = useState(NOTE_GENERATE_MODE);

  const setLocalStorageForPrint = (title, ownerName, tableTitle, tableData) => {
    localStorage.setItem("print-array", JSON.stringify(tableData));
    localStorage.setItem("print-title", `Sundary Debitor : ${ownerName} ${title}`);
    localStorage.setItem("print-head", JSON.stringify(tableTitle));
    localStorage.setItem("total-count", "0");
  };

  const prepareTableData = (data, filterPaid = false) => {
    let index = 1;
    let tableData = [];

    data?.bills?.forEach((bill) => {
      let billDate = moment(bill?.createdAt).format("DD-MM-YYYY");
      let dueDate = moment(bill?.due_days).format("DD-MM-YYYY");
      let dueDays = isNaN(calculateDaysDifference(dueDate)) ? 0 : calculateDaysDifference(dueDate);

      let totalAmount = parseFloat(bill?.amount || 0).toFixed(2);
      let creditNoteAmount = parseFloat(bill?.credit_note_amount || 0).toFixed(2);
      let billDeductionAmount = +totalAmount - +creditNoteAmount;
      let interestAmount = 0;

      if (bill?.credit_note_id == null) {
        interestAmount = CalculateInterest(dueDays, bill?.amount);
      }

      let billRemainingAmount = parseFloat(bill?.part_payment == null ? billDeductionAmount : +bill?.part_payment).toFixed(2);

      if (!filterPaid || !bill?.is_paid) {
        tableData.push([
          index++,
          bill?.bill_no || "N/A",
          billDate,
          data?.supplier?.supplier_company || data?.party?.company_name,
          bill?.taka || 0,
          bill?.meter || 0,
          totalAmount,
          billRemainingAmount,
          dueDays,
          dueDate,
          interestAmount || 0,
          `${data?.supplier?.broker?.first_name || ""} ${data?.supplier?.broker?.last_name || ""}`.toUpperCase(),
        ]);
      }
    });

    return tableData;
  };

  // Particular Supplier/Party all bill download option 
  const AllBillDownloadOption = (data) => {
    setBillInformationLoading(true);

    let tableTitle = [
      "ID",
      "Bill No",
      "Date",
      "Company",
      "Taka/Beam",
      "Meter/KG",
      "Net Amount",
      "Rem. Amount",
      "Due Days",
      "Due Date",
      "Interest Amt.",
      "Broker",
    ];

    let billOwnerName = String(data?.supplier?.supplier_name || data?.party?.company_name).toUpperCase();
    let tableData = prepareTableData(data);

    setLocalStorageForPrint("All bills", billOwnerName, tableTitle, tableData);
    window.open("/print");

    setBillInformationLoading(false);
  };

  // Particular Supplier/Party all due bill download option 
  const AllDueBillDownloadOption = (data) => {
    setBillInformationLoading(true);

    let tableTitle = [
      "ID",
      "Bill No",
      "Date",
      "Company",
      "Taka/Beam",
      "Meter/KG",
      "Net Amount",
      "Rem. Amount",
      "Due Days",
      "Due Date",
      "Interest Amt.",
      "Broker",
    ];

    let billOwnerName = String(data?.supplier?.supplier_name || data?.party?.company_name).toUpperCase();
    let tableData = prepareTableData(data, true);

    setLocalStorageForPrint("All bills", billOwnerName, tableTitle, tableData);
    window.open("/print");

    setBillInformationLoading(false);
  };


  // ====================== Other download option ======================= //

  const PDFDownloadOptionHandler = (option) => {
    if (initialDebitorData?.length == 0) {
      message.warning("Not available any Sundry Debitor data");
    } else {
      setBillInformationLoading(true);
      let index = 1;
      let tableTitle = [
        "ID",
        "Date",
        "Bill No",
        "Supplier",
        "Company",
        "Taka/Beam",
        "Meter/KG",
        "Net Amount",
        "Rem. Amount",
        "Due Days",
        "Interest Amt."
      ];
      let tableData = [];

      if (option == "with_broker") {
        tableTitle.push("Broker");
      }

      initialDebitorData?.map((data) => {
        let total_taka = 0;
        let total_meter = 0;
        let total_bill_amount = 0;
        let total_remain_amount = 0;
        let total_interest_amount = 0;

        data?.bills?.map((bill) => {
          let paid_amount = parseFloat(bill?.paid_amount) || 0;
          paid_amount = paid_amount.toFixed(2);

          // Bill due date calculation
          let dueDate = moment(bill?.due_days).format("DD-MM-YYYY");
          let dueDays = 0;

          if (parseFloat(paid_amount).toFixed(2) > 0) {
            dueDays = 0;
          } else {
            dueDays = isNaN(calculateDaysDifference(dueDate))
              ? 0
              : calculateDaysDifference(dueDate);
          }

          // Bill date calculation
          let billDate = moment(bill?.createdAt).format("DD-MM-YYYY");
          let billDays = isNaN(calculateDaysDifference(billDate))
            ? 0
            : calculateDaysDifference(billDate);

          let total_amount = parseFloat(+bill?.amount || 0).toFixed(2) || 0; // Total Bill amount
          let credit_note_amount = parseFloat(+bill?.credit_note_amount || 0).toFixed(2) || 0; // Credit note amount 
          let bill_deducation_amount = +total_amount - +credit_note_amount;

          let interest_amount = 0;
          if (bill?.credit_note_id == null) {
            interest_amount = CalculateInterest(dueDays, bill?.amount);
          }
          let bill_remaing_amount = parseFloat(bill?.part_payment == null ? bill_deducation_amount : +bill?.part_payment).toFixed(2);

          if (option == "due_bills") {
            if (!bill?.is_paid) {
              tableData.push([
                index,
                billDate,
                bill?.bill_no || "N/A",
                String(data?.first_name + " " + data?.last_name).toUpperCase(),
                data?.supplier?.supplier_name || data?.party?.party_company,
                bill?.tabka || 0,
                bill?.meter || 0,
                total_amount,
                bill_remaing_amount,
                `${dueDays} (${billDays})`,
                interest_amount
              ])

              // Update total information 
              total_taka = +total_taka + +bill?.taka || 0;
              total_meter = +total_meter + +bill?.meter || 0;
              total_bill_amount = +total_bill_amount + +total_amount || 0;
              total_remain_amount = +total_remain_amount + +bill_remaing_amount || 0;
              total_interest_amount = +total_interest_amount + +interest_amount || 0;
              index += 1;
            }
          } else {
            tableData.push([
              index,
              billDate,
              bill?.bill_no || "N/A",
              String(data?.first_name + " " + data?.last_name).toUpperCase(),
              data?.supplier?.supplier_name || data?.party?.party_company,
              bill?.taka || 0,
              bill?.meter || 0,
              total_amount,
              bill_remaing_amount,
              `${dueDays} (${billDays})`,
              interest_amount
            ])
            index += 1;

            // Update total information 
            total_taka = +total_taka + +bill?.taka || 0;
            total_meter = +total_meter + +bill?.meter || 0;
            total_bill_amount = +total_bill_amount + +total_amount || 0;
            total_remain_amount = +total_remain_amount + +bill_remaing_amount || 0;
            total_interest_amount = +total_interest_amount + +interest_amount || 0;
          }

          if (option == "with_broker") {
            tableData.push(String(`${data?.supplier?.broker?.first_name || data?.party?.broker?.first_name}` `${data?.supplier?.broker?.last_name || data?.party?.broker?.last_name}`).toUpperCase())
          }



        })

        tableData.push([
          "Total",
          "",
          "",
          "",
          "",
          parseFloat(total_taka).toFixed(2),
          parseFloat(total_meter).toFixed(2),
          parseFloat(total_bill_amount).toFixed(2),
          parseFloat(total_remain_amount).toFixed(2),
          "",
          parseFloat(total_interest_amount).toFixed(2)
        ])

        if (option == "with_broker") {
          tableData.push("");
        }

      })

      setLocalStorageForPrint("All bills", "", tableTitle, tableData);
      window.open("/print");

      setBillInformationLoading(false);
    }
  }

  const PDFDownloadOptionMenu = [
    {
      key: "1",
      label: (
        <div onClick={() => {
          PDFDownloadOptionHandler("all_bills")
        }}>
          All Bills
        </div>
      )
    },
    {
      key: "2",
      label: (
        <div className="sundry-dropdown-option-danger"
          onClick={() => {
            PDFDownloadOptionHandler("due_bills")
          }}>
          Due Bills
        </div>
      )
    },
    {
      key: "3",
      label: (
        <div onClick={() => {
          PDFDownloadOptionHandler("with_broker")
        }}>
          With Broker
        </div>
      )
    }
  ]

  const SummaryOptionHandler = (option) => {
    if (initialDebitorData?.length == 0) {
      message.warning("Not available any Sundry Debitor data");
    } else {
      setBillInformationLoading(true);
      if (option == "all_bills") {
        let index = 1;
        let tableTitle = [
          "ID",
          "Party",
          "Taka/Beam",
          "Meter/KG",
          "Amount",
          "Int. Receivable"
        ]
        let tableData = [];
        let temp = {};

        initialDebitorData?.map((data) => {
          temp[data?.id] = {
            "user": data?.supplier?.supplier_company || data?.party?.company_name,
            "total_taka": 0,
            "total_meter": 0,
            "total_amount": 0,
            "total_interest": 0
          }
          data?.bills?.map((bill) => {

            let paid_amount = parseFloat(bill?.paid_amount) || 0;
            paid_amount = paid_amount.toFixed(2);

            // Bill due date calculation
            let dueDate = moment(bill?.due_days).format("DD-MM-YYYY");
            let dueDays = 0;

            if (parseFloat(paid_amount).toFixed(2) > 0) {
              dueDays = 0;
            } else {
              dueDays = isNaN(calculateDaysDifference(dueDate))
                ? 0
                : calculateDaysDifference(dueDate);
            }

            let interest_amount = 0;
            if (bill?.credit_note_id == null) {
              interest_amount = CalculateInterest(dueDays, bill?.amount);
            }

            temp[data?.id]["total_taka"] = +temp[data?.id]["total_taka"] + +bill?.taka || 0;
            temp[data?.id]["total_meter"] = +temp[data?.id]["total_meter"] + +bill?.meter || 0;
            temp[data?.id]["total_amount"] = +temp[data?.id]["total_amount"] + +bill?.meter || 0;
            temp[data?.id]["total_interest"] = +temp[data?.id]["total_interest"] + +interest_amount || 0;
          })
        })

        let total_taka = 0;
        let total_meter = 0;
        let total_amount = 0;
        let total_interest_amount = 0;

        Object.entries(temp).forEach(([user_id, data]) => {
          tableData.push([
            index,
            data?.user,
            data?.total_taka,
            data?.total_meter,
            data?.total_amount,
            data?.total_interest
          ])
          index += 1;
          total_taka = +total_taka + +data?.total_taka;
          total_meter = +total_meter + +data?.total_meter;
          total_amount = +total_amount + +data?.total_amount;
          total_interest_amount = +total_interest_amount + +data?.total_interest;
        })

        tableData.push([
          index,
          "Total",
          parseFloat(total_taka).toFixed(2),
          parseFloat(total_meter).toFixed(2),
          parseFloat(total_amount).toFixed(2),
          parseFloat(total_interest_amount).toFixed(2)
        ])

        setLocalStorageForPrint("Bill Summary", "", tableTitle, tableData);
        setBillInformationLoading(false);
        window.open("/print");
      } else {
        let index = 1;
        let tableTitle = [
          "Index",
          "Party",
          "0-30 days(In. GST)",
          "30-60 days(In. GST)",
          "60-90 days(In. GST)",
          "90 + days(In. GST)"
        ];
        let tableData = [];

        let temp = {};
        initialDebitorData?.map((data) => {
          temp[data?.id] = {
            "user": data?.supplier?.supplier_company || data?.party?.company_name,
            "30": 0,
            "60": 0,
            "90": 0,
            "90+": 0
          }

          data?.bills?.map((bill) => {
            let paid_amount = parseFloat(bill?.paid_amount) || 0;
            paid_amount = paid_amount.toFixed(2);

            // Bill due date calculation
            let dueDate = moment(bill?.due_days).format("DD-MM-YYYY");
            let dueDays = 0;

            if (parseFloat(paid_amount).toFixed(2) > 0) {
              dueDays = 0;
            } else {
              dueDays = isNaN(calculateDaysDifference(dueDate))
                ? 0
                : calculateDaysDifference(dueDate);
            }

            let total_amount = parseFloat(+bill?.amount || 0).toFixed(2) || 0; // Total Bill amount
            let credit_note_amount = parseFloat(+bill?.credit_note_amount || 0).toFixed(2) || 0; // Credit note amount 
            let bill_deducation_amount = +total_amount - +credit_note_amount;

            let interest_amount = 0;
            if (bill?.credit_note_id == null) {
              interest_amount = CalculateInterest(dueDays, bill?.amount);
            }
            let bill_remaing_amount = parseFloat(bill?.part_payment == null ? bill_deducation_amount : +bill?.part_payment).toFixed(2);

            if (dueDays < 30) {
              temp[data?.id]["30"] = +temp[data?.id]["30"] + +bill_remaing_amount;
            } else if (dueDays >= 30 && dueDays < 60) {
              temp[data?.id]["60"] = +temp[data?.id]["60"] + +bill_remaing_amount;
            } else if (dueDays >= 60 && dueDays < 90) {
              temp[data?.id]["90"] = +temp[data?.id]["90"] + +bill_remaing_amount;
            } else {
              temp[data?.id]["90+"] = +temp[data?.id]["90+"] + +bill_remaing_amount;
            }
          })
        })

        let temp_total_30 = 0;
        let temp_total_60 = 0;
        let temp_total_90 = 0;
        let temp_total_90_plus = 0;

        Object.entries(temp).forEach(([user_id, data]) => {
          tableData.push([
            index,
            data["user"],
            parseFloat(data["30"]).toFixed(2),
            parseFloat(data["60"]).toFixed(2),
            parseFloat(data["90"]).toFixed(2),
            parseFloat(data["90+"]).toFixed(2)
          ])

          index += 1;

          temp_total_30 = +temp_total_30 + +data["30"];
          temp_total_60 = +temp_total_60 + +data["60"];
          temp_total_90 = +temp_total_90 + +data["90"];
          temp_total_90_plus = +temp_total_90_plus + +data["90+"];
        })
        tableData.push([
          index,
          "Total",
          parseFloat(temp_total_30).toFixed(2),
          parseFloat(temp_total_60).toFixed(2),
          parseFloat(temp_total_90).toFixed(2),
          parseFloat(temp_total_90_plus).toFixed(2)
        ])

        index += 1;

        tableData.push([
          index,
          "Grand Total",
          parseFloat(+temp_total_30 + +temp_total_60 + +temp_total_90 + +temp_total_90_plus).toFixed(2),
          "",
          "",
          ""
        ]);

        setLocalStorageForPrint("Stock Summary", "", tableTitle, tableData);
        setBillInformationLoading(false);
        window.open("/print");
      }
      setBillInformationLoading(false);
    }

  }

  const SummaryOptionMenu = [
    {
      key: "1",
      label: (
        <div onClick={() => {
          SummaryOptionHandler("all_bills")
        }}>
          All Bills
        </div>
      )
    },
    {
      key: "2",
      label: (
        <div className="sundry-dropdown-option-danger"
          onClick={() => {
            SummaryOptionHandler("stock-management")
          }}>
          Stock Management
        </div>
      )
    }
  ]

  const InterestSummaryOptionHandle = () => {
    try {
      setBillInformationLoading(true);

      let index = 1;
      let tableTitle = [
        "ID",
        "Party/Supplier",
        "Total Meter",
        "Total interest",
        "Total Amount",
        "Received Amount",
        "Not Rec. Amount"
      ];
      let tableData = [];

      let temp = {};
      initialDebitorData?.map((data) => {
        data?.bills?.map((bill) => {
          let paid_amount = parseFloat(bill?.paid_amount) || 0;
          paid_amount = paid_amount.toFixed(2);

          // Bill due date calculation
          let dueDate = moment(bill?.due_days).format("DD-MM-YYYY");
          let dueDays = 0;

          if (parseFloat(paid_amount).toFixed(2) > 0) {
            dueDays = 0;
          } else {
            dueDays = isNaN(calculateDaysDifference(dueDate))
              ? 0
              : calculateDaysDifference(dueDate);
          }

          // Bill date calculation
          let billDate = moment(bill?.createdAt).format("DD-MM-YYYY");
          let billDays = isNaN(calculateDaysDifference(billDate))
            ? 0
            : calculateDaysDifference(billDate);

          let total_amount = parseFloat(+bill?.amount || 0).toFixed(2) || 0; // Total Bill amount
          let credit_note_amount = parseFloat(+bill?.credit_note_amount || 0).toFixed(2) || 0; // Credit note amount 
          let bill_deducation_amount = +total_amount - +credit_note_amount;

          let interest_amount = 0;
          if (bill?.credit_note_id == null) {
            interest_amount = CalculateInterest(dueDays, bill?.amount);
          }
          let bill_remaing_amount = parseFloat(bill?.part_payment == null ? bill_deducation_amount : +bill?.part_payment).toFixed(2);
          let bill_paid_amount = parseFloat(+bill_deducation_amount - +bill_remaing_amount).toFixed(2);

          if (interest_amount > 0) {
            temp[data?.id] = {
              'user': data?.supplier?.supplier_company || data?.party?.company_name,
              "total_meter": 0,
              "interest_amount": 0,
              "total_amount": 0,
              "received_amount": 0,
              "not_received_amount": 0
            }

            temp[data?.id]["total_meter"] = +temp[data?.id]["total_meter"] + +bill?.meter || 0;
            temp[data?.id]["interest_amount"] = +temp[data?.id]["interest_amount"] + +interest_amount || 0;
            temp[data?.id]["total_amount"] = +temp[data?.id]["total_amount"] + +total_amount || 0;
            temp[data?.id]["received_amount"] = +temp[data?.id]["received_amount"] + +bill_paid_amount || 0;
            temp[data?.id]["not_received_amount"] = +temp[data?.id]["not_received_amount"] + +bill_remaing_amount || 0;
          }


        })
      })

      let temp_total_meter = 0;
      let temp_total_inerest = 0;
      let temp_total_amount = 0;
      let temp_total_received_amount = 0;
      let temp_total_not_received_amount = 0;

      Object.entries(temp).forEach(([user_id, data]) => {
        tableData.push([
          index,
          data["user"],
          parseFloat(data["total_meter"]).toFixed(2),
          parseFloat(data["interest_amount"]).toFixed(2),
          parseFloat(data["total_amount"]).toFixed(2),
          parseFloat(data["received_amount"]).toFixed(2),
          parseFloat(data["not_received_amount"]).toFixed(2)
        ])
        index += 1;

        temp_total_meter += +data["total_meter"];
        temp_total_inerest += +data["interest_amount"];
        temp_total_amount += +data["total_amount"];
        temp_total_received_amount += +data["received_amount"];
        temp_total_not_received_amount += +data["not_received_amount"];
      })

      tableData.push([
        index,
        "Total",
        parseFloat(temp_total_meter).toFixed(2),
        parseFloat(temp_total_inerest).toFixed(2),
        parseFloat(temp_total_amount).toFixed(2),
        parseFloat(temp_total_received_amount).toFixed(2),
        parseFloat(temp_total_not_received_amount).toFixed(2)
      ]);

      setLocalStorageForPrint("Stock Summary", "", tableTitle, tableData);
      setBillInformationLoading(false);
      window.open("/print");
    } catch (error) {
      console.log(error);

      setBillInformationLoading(false);
    }
  }
  return (
    <Spin spinning={billInformationLoading}>
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-5 mx-3 mb-3">
          <div className="flex items-center gap-2">
            <h3 className="m-0 text-primary">Sundry Debitor</h3>
          </div>

          <div style={{ marginLeft: "auto" }}>

            {/* ============== Interest payment option ============  */}
            {selectedInterestBill?.length > 0 && (
              <Flex style={{ gap: 5 }}>
                <div
                  style={{
                    marginTop: "auto",
                    marginBottom: "auto",
                    textAlign: "center",
                    color: "green"
                  }}
                >
                  {" "}
                  Total Interest :{parseFloat(totalInterestAmount).toFixed(2)}
                </div>
                <Button
                  type="primary"
                  onClick={() => {
                    setPaymentInterestModalOpen(true);
                  }}
                >
                  GET CASH INTEREST
                </Button>
              </Flex>
            )}

            {/* ============== Bill Payment option ================= */}
            {selectedBill?.length > 0 && (
              <Flex style={{ gap: 5 }}>
                <div
                  style={{
                    marginTop: "auto",
                    marginBottom: "auto",
                    textAlign: "center",
                  }}
                >
                  Total Amount: {parseFloat(totalBillAmount).toFixed(2)}
                </div>
                <Button
                  type="primary"
                  onClick={() => {
                    setBillModelOpen(true);
                  }}
                >
                  PAID AMOUNT
                </Button>
              </Flex>
            )}
            {/* <Checkbox
              value={isCash}
              onChange={(e) => setIsCash(e.target.checked)}
            >
              Cash
            </Checkbox>
            <Checkbox
              value={isPaymentDue}
              onChange={(e) => setIsPaymentDue(e.target.checked)}
            >
              Payment Due
            </Checkbox> */}
            &nbsp;&nbsp;&nbsp;&nbsp;
            {/* <Radio.Group
              name="production_filter"
              value={sundryDebitorType}
              onChange={(e) => setSundryDebitorType(e.target.value)}
              className="payment-options"
            >
              <Radio value={"current"}>Current</Radio>
              <Radio value={"previous"}>Previous</Radio>
              <Radio value={"all"}>All</Radio>
              <Radio value={"other"}>Other</Radio>
            </Radio.Group> */}
          </div>
        </div>

        <Flex align="center" justify="flex-end" gap={10}>

          {/* ============== Debit note generation option =========  */}
          {debitNoteSelection?.length > 0 && (
            <Flex>
              <Button
                onClick={() => {
                  setDebitNoteModelOpen(true);
                }}
                type="primary"
              >
                GENERATE DEBIT NOTE
              </Button>
            </Flex>
          )}

          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">Find</Typography.Text>
            <Input
              value={billNo}
              onChange={(e) => setBillNo(e.target.value)}
              placeholder="Bill No"
            />
          </Flex>

          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Broker
            </Typography.Text>
            <Select
              allowClear
              placeholder="Select broker"
              dropdownStyle={{
                textTransform: "capitalize",
              }}
              style={{
                textTransform: "capitalize",
              }}
              className="min-w-40"
              value={broker}
              onChange={(selectedValue) => setBroker(selectedValue)}
              loading={isLoadingBrokerList}
              options={brokerUserListRes?.brokerList?.rows?.map((broker) => ({
                label:
                  broker.first_name +
                  " " +
                  broker.last_name +
                  " " +
                  `| (${broker?.username})`,
                value: broker.id,
              }))}
            />
          </Flex>

          <Flex align="center" gap={10}>
            <Select
              allowClear
              placeholder="Select"
              dropdownStyle={{
                textTransform: "capitalize",
              }}
              style={{
                textTransform: "capitalize",
              }}
              className="min-w-40"
              value={selection}
              onChange={(selectedValue) => setSelection(selectedValue)}
              options={selectionOption}
            />
          </Flex>

          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">From</Typography.Text>
            <DatePicker value={fromDate} onChange={setFromDate} />
          </Flex>
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">To</Typography.Text>
            <DatePicker value={toDate} onChange={setToDate} />
          </Flex>

          {/* PDF Download option  */}
          <Dropdown menu={{ items: PDFDownloadOptionMenu }} placement="bottomLeft">
            <Button
              icon={<FilePdfOutlined />}
              type="primary"
              className="flex-none"
            />
          </Dropdown>

          {/* Summary download option  */}
          <Dropdown menu={{ items: SummaryOptionMenu }} placement="bottomLeft">
            <Button>
              SUMMARY
            </Button>
          </Dropdown>

          {/* Interest summary download option  */}
          <Button onClick={() => {
            InterestSummaryOptionHandle()
          }}>
            INTEREST SUMMARY
          </Button>
        </Flex>

        {isLoadingSundryDebtor ? (
          <Flex
            style={{
              minHeight: "200px",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Spin />
          </Flex>
        ) : (
          <table
            style={{ fontSize: "12px", borderColor: "black" }}
            border={1}
            // cellSpacing={0}
            cellPadding={6}
            className="custom-table"
          >
            <thead>
              {/* <!-- Table Header Row --> */}
              <tr>
                <th
                  style={{
                    width: "60px",
                  }}
                >
                  Debit Note
                </th>
                <th>Date</th>
                <th>Bill/DB</th>
                <th>Bill Type</th>
                <th>Company</th>
                <th>Taka/Beam</th>
                <th>Meter/KG</th>
                <th>Bill Amount</th>
                <th>Due Day</th>
                <th>Int. Receivable</th>
                <th style={{ width: "105px" }}>Action</th>
                <th>Receive Payment</th>
                <th>Cash Int.</th>
              </tr>
            </thead>
            <tbody>
              {debitorDataList ? (
                debitorDataList?.map((data, index) => (
                  <TableWithAccordion

                    key={index}

                    data={data}

                    company={company}

                    companyId={companyId}

                    handleInterestCheckboxSelection={(event, bill, user_id) => {
                      setSelectedUser(user_id)
                      handleInterestCheckboxSelection(event, bill);
                    }}

                    selectedInterestBill={selectedInterestBill}

                    selectedBill={selectedBill}
                    handleBillSelection={(event, bill) => {
                      handleBillSelection(event, bill);
                    }}

                    companyListRes={companyListRes}

                    handleDebitNoteSelection={handleDebitNoteSelection}

                    debitNoteSelection={debitNoteSelection}


                    // Handle Debit note click related handler
                    handleDebitNoteClick={(bill, data) => {
                      setDebitNoteModelOpen(true);
                      setDebitNoteSelection([bill]);
                      setDebitNoteModelData(data);
                    }}


                    // Handle credit note click related handler 
                    handleCreditNoteClick={(bill, data) => {
                      setCreditNoteModelOpen(true);
                      setCreditNoteSelection([bill]);
                      setCreditNoteModelData(data);
                    }}

                    setBillInformationLoading={setBillInformationLoading}

                    allbillDownloadHandler={(data) => {
                      AllBillDownloadOption(data);
                    }}

                    allDueBillDownloadHandler={(data) => {
                      AllDueBillDownloadOption(data);
                    }}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={11} style={{ textAlign: "center" }}>
                    No Data Found
                  </td>
                </tr>
              )}
              <tr style={{ backgroundColor: "white" }}>
                <td colSpan={11}></td>
              </tr>

              <tr style={{ backgroundColor: "white" }} className="sundary-total">
                <td>
                  <b>Grand Total</b>
                </td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td>
                  <b>{parseFloat(grandTotal?.meter).toFixed(2)}</b>
                </td>
                <td>
                  <b>{parseFloat(grandTotal?.bill_amount).toFixed(2)}</b>
                </td>
                <td></td>
                {/* <td>
                  <b>0</b>
                </td> */}
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        )}
        
        {/* ==== Inerest received payment modal ====  */}
        {interestPaymentModalOpen && (
          <InterestPaymentModal
            visible={interestPaymentModalOpen}
            onCancel={() => {
              setPaymentInterestModalOpen(false);
              setSelectedInterestBill([]);
            }}
            selectedInterestBill={selectedInterestBill}
            onConfirm={async (amount, date, data) => {
              PaidInterestAmount(amount, date, data);
            }}
          />
        )}

        {/* ======== Bill Payment model =========  */}
        {billModelOpen && (
          <BillPaymentModel
            visible={billModelOpen}
            selectedBill={selectedBill}
            onClose={() => {
              setBillModelOpen(false);
              setSelectedBill([]);
            }}
            sundryDebtorData={debitorDataList}
            companyListRes={companyListRes}
          />
        )}

        {/* ==== Debit note information ====  */}
        {debitNoteModelOpen && (
          <SundaryDebitNoteGenerate
            open={debitNoteModelOpen}
            setOpen={setDebitNoteModelOpen}
            bill_details={debitNoteSelection}
            debiteNoteData={debitNoteModelData}
            setDebitNoteSelection={setDebitNoteSelection}
            view={debiteNoteView}
          />
        )}

        {/* ==== Credit note information ====  */}
        {creditNoteMoelOpen && (
          <SunadryCreditNoteGenerate
            open={creditNoteMoelOpen}
            setOpen={setCreditNoteModelOpen}
            bill_details={creditNoteSelection}
            debiteNoteData={creditNoteModelData}
            setDebitNoteSelection={setCreditNoteSelection}
            view={creditNoteView}
            setSelectedRecords={[]}
          />
        )}
      </div>
    </Spin>
  );
};

export default SundryDebitor;

// =========== Table =================
const TableWithAccordion = ({
  data,
  company,
  companyId,
  handleInterestCheckboxSelection,
  selectedInterestBill,
  selectedBill,
  handleBillSelection,
  handleDebitNoteSelection,
  debitNoteSelection,
  setBillInformationLoading,
  handleCreditNoteClick,
  handleDebitNoteClick,
  allbillDownloadHandler,
  allDueBillDownloadHandler
}) => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(data?.id);

  // Toggle accordion open state
  const toggleAccordion = () => {
    setIsAccordionOpen((prev) => {
      if (prev) {
        return null;
      } else {
        return data.id;
      }
    });
  };

  const [debitorBillModal, setDebitorBillModal] = useState({
    isModalOpen: false,
    details: null,
    mode: "",
    model: "",
  });

  const [challanModal, setChallanModal] = useState({
    isModalOpen: false,
    details: null,
    mode: "",
    model: "",
  });

  const handleCloseModal = () => {
    setDebitorBillModal((prev) => ({
      ...prev,
      isModalOpen: false,
    }));
  };

  const handleChallanCloseModal = () => {
    setChallanModal((prev) => ({
      ...prev,
      isModalOpen: false,
    }));
  }

  const TOTAL = useMemo(() => {
    if (data && data?.bills && data?.bills?.length) {
      let meter = 0;
      let amount = 0;
      data?.bills?.forEach((item) => {
        let total_amount = parseFloat(+item?.amount || 0).toFixed(2) || 0;
        let credit_note_amount =
          parseFloat(+item?.credit_note_amount || 0).toFixed(2) || 0;
        let paid_amount = parseFloat(+item?.paid_amount || 0).toFixed(2) || 0;
        let finalAmount = total_amount - paid_amount - credit_note_amount;
        meter += +item?.meter || 0;
        amount += +finalAmount || 0;
      });

      return { meter, amount };
    } else {
      return { meter: 0, amount: 0 };
    }
  }, [data]);

  // ==== Bill information click related handler ==== // 
  const onClickViewHandler = async (bill, type) => {
    try {
      let response;
      let details;
      let params = {
        company_id: companyId,
        bill_id: bill.bill_id,
        page: 0,
        pageSize: 10,
      };

      setBillInformationLoading(true);
      if (bill.model === BILL_MODEL.yarn_sale_bills) {
        response = await saleYarnChallanListRequest({ params });
        if (response.data.success) {
          details = response?.data?.data?.list[0];
        }
      } else if (bill.model === BILL_MODEL.beam_sale_bill) {
        response = await getBeamSaleChallanListRequest({ params });
        if (response.data.success) {
          details = response?.data?.data?.rows[0];
        }
      } else if (bill.model === BILL_MODEL.sale_bills) {
        response = await getSaleBillListRequest({ params });
        if (response.data.success) {
          details = response?.data?.data?.SaleBill[0];
        }
      } else if (bill.model === BILL_MODEL.job_work_bills) {
        response = await saleJobWorkChallanListRequest({ params });
        if (response.data.success) {
          details = response?.data?.data?.list[0];
        }
      } else if (bill.model === BILL_MODEL.job_gray_sale_bill) {
        response = await getJobGraySaleBillListRequest({ params });
        if (response.data.success) {
          details = response?.data?.data?.jobGraySaleBill[0];
        }
      }

      if (type == "bill") {
        setDebitorBillModal({
          isModalOpen: true,
          details: details,
          mode: "VIEW",
          model: bill.model,
        });
      } else {
        setChallanModal({
          isModalOpen: true,
          details: details,
          mode: "VIEW",
          model: bill.model,
        });
      }

      setBillInformationLoading(false);
    } catch (error) {
      setBillInformationLoading(false);
      message.error(error.message);
    }
  };



  return (
    <>
      <tr
        style={{ cursor: "pointer", backgroundColor: "#f0f0f0" }}
        onClick={toggleAccordion}
        className="sundary-header"
      >
        <td></td>
        <td colSpan={3}>
          <div>
            <div>
              {String(data?.first_name + " " + data?.last_name).toUpperCase()}
              <Tag
                color="#108ee9"
                style={{
                  marginLeft: 10,
                }}
              >
                {data?.bills?.length} Bills
              </Tag>
            </div>
            <div style={{ fontWeight: 400, marginTop: 4 }}>
              {data?.supplier?.supplier_company || data?.party?.company_name}
            </div>
          </div>
        </td>
        <td colSpan={5}>{data?.address || ""}</td>
        <td></td>
        <td>
          {isAccordionOpen === data.id ? (
            <>
              <Flex style={{ gap: 6 }}>
                {/* <div>
                  <Input style={{ width: "60px" }} />
                </div> */}
                <div style={{ marginTop: "auto", marginBottom: "auto" }}>
                  <CheckOutlined style={{ fontSize: 18 }} />
                </div>
              </Flex>
            </>
          ) : null}
        </td>
        <td style={{ textAlign: "center" }}>
        </td>

        {/* PDF export related option  */}
        <td>
          <Flex style={{ gap: 6 }}>

            <Button type="text">{isAccordionOpen ? "▼" : "►"}</Button>

            {/* All Bill related download option   */}
            <Tooltip title="All bill">
              <FilePdfOutlined
                style={{ fontSize: 18, color: "green" }}
                onClick={() => {
                  allbillDownloadHandler(data);
                }}
              />
            </Tooltip>

            {/* All due bill related download option  */}
            <Tooltip title="Due bill">
              <FilePdfOutlined
                style={{ fontSize: 18, color: "red" }}
                onClick={() => {
                  allDueBillDownloadHandler(data);
                }}
              />
            </Tooltip>
          </Flex>

        </td>

      </tr>

      {/* Accordion Content Rows (conditionally rendered) */}
      {isAccordionOpen === data.id && (
        <>
          {data && data?.bills?.length ? (
            data?.bills?.map((bill, index) => {

              let paid_amount = parseFloat(bill?.paid_amount) || 0;
              paid_amount = paid_amount.toFixed(2);

              // Bill due date calculation
              let dueDate = moment(bill?.due_days).format("DD-MM-YYYY");
              let dueDays = 0;

              if (parseFloat(paid_amount).toFixed(2) > 0) {
                dueDays = 0;
              } else {
                dueDays = isNaN(calculateDaysDifference(dueDate))
                  ? 0
                  : calculateDaysDifference(dueDate);
              }

              // Bill date calculation
              let billDate = moment(bill?.createdAt).format("DD-MM-YYYY");
              let billDays = isNaN(calculateDaysDifference(billDate))
                ? 0
                : calculateDaysDifference(billDate);

              let model =
                bill?.model == SALE_BILL_MODEL
                  ? SALE_BILL_MODEL_NAME
                  : bill?.model == YARN_SALE_BILL_MODEL
                    ? YARN_SALE_BILL_MODEL_NAME
                    : bill?.model == JOB_GREAY_SALE_BILL_MODEL
                      ? JOB_GREAY_BILL_MODEL_NAME
                      : bill?.model == BEAM_SALE_BILL_MODEL
                        ? BEAM_SALE_MODEL_NAME
                        : bill?.model == CREDIT_NOTE_BILL_MODEL
                          ? CREDIT_NOTE_MODEL_NAME
                          : bill?.model == DEBIT_NOTE_BILL_MODEL
                            ? DEBIT_NOTE_NAME
                            : bill?.model == JOB_WORK_BILL_MODEL
                              ? JOB_WORK_MODEL_NAME
                              : "";

              let isChecked =
                selectedInterestBill?.filter(
                  (item) =>
                    item?.bill_id == bill?.bill_id && item?.model == bill?.model
                )?.length > 0
                  ? true
                  : false;

              let isBillChecked =
                selectedBill?.filter(
                  (item) =>
                    item?.bill_id == bill?.bill_id && item?.model == bill?.model
                )?.length > 0
                  ? true
                  : false;

              let debiteNoteChecked =
                debitNoteSelection?.filter(
                  (item) =>
                    item?.bill_id == bill?.bill_id && item?.model == bill?.model
                )?.length > 0
                  ? true
                  : false;

              let total_amount = parseFloat(+bill?.amount || 0).toFixed(2) || 0; // Total Bill amount
              let credit_note_amount = parseFloat(+bill?.credit_note_amount || 0).toFixed(2) || 0; // Credit note amount 
              let bill_deducation_amount = +total_amount - +credit_note_amount;

              let interest_amount = 0;
              if (bill?.credit_note_id == null) {
                interest_amount = CalculateInterest(dueDays, bill?.amount);
              }
              let bill_remaing_amount = parseFloat(bill?.part_payment == null ? bill_deducation_amount : +bill?.part_payment).toFixed(2);
              let bill_paid_amount = parseFloat(+bill_deducation_amount - +bill_remaing_amount).toFixed(2);

              return (
                <tr key={index + "_bill"} className="sundary-data">

                  {/* Debit note creation related checkbox handler  */}
                  <td>
                    {bill?.debit_note_id == null &&
                      ![CREDIT_NOTE_BILL_MODEL, DEBIT_NOTE_BILL_MODEL]?.includes(
                        bill?.model
                      ) && (
                        <Checkbox
                          checked={debiteNoteChecked}
                          onChange={(event) => {
                            handleDebitNoteSelection(event, bill, data);
                          }}
                        />
                      )}
                  </td>

                  {/* Bill date information  */}
                  <td
                    style={{
                      fontWeight: 600,
                    }}
                  >
                    {dayjs(bill?.createdAt).format("DD-MM-YYYY")}
                  </td>

                  {/* Bill number related information  */}
                  <td>
                    {
                      bill?.model === CREDIT_NOTE_BILL_MODEL ? (
                        <span style={{ color: "green" }}>{bill?.bill_no || "N/A"}</span>
                      ) : bill?.model === DEBIT_NOTE_BILL_MODEL ? (
                        <span style={{ color: "red" }}>{bill?.bill_no || "N/A"}</span>
                      ) : (
                        <span>{bill?.bill_no || "N/A"}</span>
                      )
                    }
                  </td>

                  {/* Bill type related information  */}
                  <td
                    style={{
                      color:
                        bill?.model === CREDIT_NOTE_BILL_MODEL
                          ? "green"
                          : bill?.model === DEBIT_NOTE_BILL_MODEL
                            ? "red"
                            : "#000",
                    }}
                  >
                    {model}
                  </td>

                  {/* Company information  */}
                  <td>{company?.company_name || ""}</td>

                  {/* Taka and Beam related information for
                    Yarn sale bill show cartoon information 
                    Beam sale bill show beam count information 
                  */}
                  <td>
                    {bill?.model === BEAM_SALE_BILL_MODEL ? (
                      <>
                        <span style={{ color: "blue" }}>{`Beam =>`}</span>
                        <span style={{ marginLeft: 4 }}>{bill?.taka || "0"}</span>
                      </>
                    ) : bill?.model === YARN_SALE_BILL_MODEL ? (
                      <>
                        <span style={{ color: "blue" }}>{`Cartoon =>`}</span>
                        <span style={{ marginLeft: 4 }}>{bill?.taka || "0"}</span>
                      </>
                    ) : (
                      <span>{bill?.taka || "-"}</span>
                    )}
                  </td>

                  <td>
                    {bill?.model === BEAM_SALE_BILL_MODEL ? (
                      <>
                        <span style={{ color: "blue" }}>{`KG =>`}</span>
                        <span style={{ marginLeft: 4 }}>{bill?.meter || "0"}</span>
                      </>
                    ) : bill?.model === YARN_SALE_BILL_MODEL ? (
                      <>
                        <span style={{ color: "blue" }}>{`KG =>`}</span>
                        <span style={{ marginLeft: 4 }}>{bill?.meter || "0"}</span>
                      </>
                    ) : (
                      <span>{bill?.meter || "-"}</span>
                    )}
                  </td>

                  {/* =========== Bill amount information =========  */}
                  <td>
                    <Tooltip
                      title={`${total_amount} - ${credit_note_amount} - ${bill_paid_amount} = ${parseFloat(bill_remaing_amount).toFixed(2)}`}
                    >
                      <div>
                        {/* Total bill remaing amount information  */}
                        {parseFloat(bill_remaing_amount).toFixed(2) || 0}

                        {/* Bill paid amount related information */}
                        {+paid_amount != 0 && paid_amount !== undefined && (
                          <div
                            style={{
                              fontWeight: 500,
                              color: "green",
                              fontSize: 11,
                            }}
                          >
                            Received ( {paid_amount} )
                          </div>
                        )}

                      </div>
                    </Tooltip>
                  </td>

                  {/* Due Days related information  */}
                  {/* Bill days information also showing in ()  */}

                  <td
                    style={{
                      color: +dueDays != 0 ? "red" : "#000",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >

                    {/* Due Date related information  */}
                    <Tooltip title={`Due Date : ${dueDate || ""}`}>
                      {dueDays <= 0 ? 0 : `+${dueDays}D` || 0}
                    </Tooltip>

                    {/* Bill date information  */}
                    <Tooltip title={`Bill Date: ${billDate}`}>
                      <span
                        style={{
                          color: "blue",
                          fontWeight: 500,
                          fontSize: 12,
                          paddingLeft: 5,
                        }}
                      >
                        ( {billDays} )
                      </span>
                    </Tooltip>

                  </td>

                  {/* Interest amount information  */}
                  {/* If creadit note is created than show inerest amount is 0 otherwise normal interest amount  */}
                  {/* Credit note and Debit note related interest amount not show  */}

                  <td>
                    {[CREDIT_NOTE_BILL_MODEL, DEBIT_NOTE_BILL_MODEL]?.includes(bill?.model) ? (
                      <>
                        <div>---</div>
                      </>
                    ) : (
                      <>
                        {bill?.interest_paid_date !== null &&
                          bill?.interest_amount !== null && (
                            <>
                              <div style={{ cursor: "pointer" }}>
                                <span style={{ color: "green", fontWeight: 600, fontSize: 13 }}>Rece :</span>
                                <span style={{ fontSize: 12, marginLeft: 4 }}>
                                  {moment(bill?.interest_paid_date).format(
                                    "DD-MM-YYYY"
                                  )}
                                </span>
                              </div>
                              <div style={{ marginTop: 3 }}>
                                <span style={{ color: "blue", fontWeight: 600, fontSize: 13 }}>
                                  Amount:
                                </span>
                                <span style={{ fontSize: 12, marginLeft: 4 }}>
                                  {parseFloat(bill?.interest_amount).toFixed(2)}
                                </span>
                              </div>
                            </>
                          )}

                        {bill?.interest_paid_date == null && (
                          <>{interest_amount}</>
                        )}
                      </>
                    )}
                  </td>

                  <td>
                    <Flex
                      style={{
                        gap: 5,
                      }}
                    >

                      {![CREDIT_NOTE_BILL_MODEL, DEBIT_NOTE_BILL_MODEL]?.includes(bill?.model) && (
                        <>

                          {![SALE_BILL_MODEL, JOB_GREAY_SALE_BILL_MODEL]?.includes(bill?.model) && (
                            <Tooltip title={"Challan"}>
                              <EyeOutlined
                                style={{ fontSize: 18 }}
                                onClick={() => {
                                  onClickViewHandler(bill, "challan");
                                }}
                              />
                            </Tooltip>
                          )}

                          <Tooltip title={"Bill"}>
                            <FileTextOutlined
                              style={{ fontSize: 18 }}
                              onClick={() => { onClickViewHandler(bill, "bill") }}
                            />
                          </Tooltip>
                        </>
                      )}

                      {/* Credit note information  */}
                      {bill?.model == CREDIT_NOTE_BILL_MODEL && (
                        <Tooltip title={`CREDIT NOTE : ${bill?.bill_no}`}>
                          <div style={{ cursor: "pointer" }}>
                            <TabletFilled
                              style={{ color: "green" }}
                              onClick={() => {
                                handleCreditNoteClick(bill, data)
                              }}
                            />
                          </div>
                        </Tooltip>
                      )}

                      {/* Debit note information  */}
                      {bill?.model == DEBIT_NOTE_BILL_MODEL && (
                        <Tooltip title={`DEBIT NOTE : ${bill?.bill_no}`}>
                          <div style={{ cursor: "pointer" }}>
                            <TabletFilled
                              style={{ color: "red" }}
                              onClick={() => {
                                handleDebitNoteClick(bill, data);
                              }}
                            />
                          </div>
                        </Tooltip>
                      )}

                      {bill?.debit_note_id !== null && bill?.debit_note_id !== undefined && (
                        <Tooltip title={`DEBIT NOTE : ${bill?.debit_note_number}`}>
                          <div style={{ cursor: "pointer" }}>
                            <TabletFilled
                              style={{ color: "red" }}
                              onClick={() => {
                                handleDebitNoteClick(bill, data);
                              }}
                            />
                          </div>
                        </Tooltip>
                      )}

                    </Flex>
                  </td>

                  {/* Bill Payment checkbox selection  */}
                  <td>
                    {bill?.is_paid ? (
                      <span>--</span>
                    ) : (
                      <Checkbox
                        checked={isBillChecked}
                        onChange={(event) => handleBillSelection(event, bill)}
                      />
                    )}
                  </td>


                  {/* Bill Interest payment checkbox selection  */}
                  <td>
                    {bill?.interest_paid_date ? (
                      <span>--</span>
                    ) : (
                      CalculateInterest(dueDays, bill?.amount) !== 0 && (
                        <Checkbox
                          checked={isChecked}
                          onChange={(event) => handleInterestCheckboxSelection(event, bill, {
                            "is_supplier": data?.supplier !== undefined?true:false,
                            "id": data?.id
                          })}
                        />
                      )
                    )}
                  </td>

                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={13} style={{ textAlign: "center" }}>
                <Empty
                  description="No Bill Found"
                  style={{
                    paddingTop: 10,
                    paddingBottom: 10,
                  }}
                />
              </td>
            </tr>
          )}
        </>
      )}

      <tr style={{ backgroundColor: "white" }} className="sundary-total">
        <td>
          <b>Total</b>
        </td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td>{/* <b>{TOTAL?.meter}</b> */}</td>
        <td>
          <b>{TOTAL?.meter}</b>
        </td>
        <td
          style={{
            fontWeight: 600,
          }}
        >
          {parseFloat(TOTAL?.amount).toFixed(2)}
        </td>
        {/* <td>
          <b>0</b>
        </td> */}
        <td></td>
        <td></td>
        <td></td>
      </tr>

      {/* ====== Yarn sale challan related information =====  */}
      {challanModal?.isModalOpen &&
        challanModal.model === YARN_SALE_BILL_MODEL && (
          <PrintYarnSaleChallan
            details={challanModal.details}
            isEyeButton={false}
            open={challanModal?.isModalOpen}
            close={handleChallanCloseModal}
          />
        )}

      {/* ===== Yarn sale bill related information =====  */}
      {debitorBillModal?.isModalOpen &&
        debitorBillModal.model === YARN_SALE_BILL_MODEL && (
          <YarnSaleChallanModel
            details={debitorBillModal.details}
            isEyeButton={false}
            isModelOpen={debitorBillModal?.isModalOpen}
            handleCloseModal={handleCloseModal}
            MODE={"VIEW"}
          />
        )}

      {/* ====== Beam sale challan related information ========  */}
      {challanModal?.isModalOpen &&
        challanModal.model === BEAM_SALE_BILL_MODEL && (
          <PrintBeamSaleChallan
            details={challanModal.details}
            isEyeButton={false}
            open={challanModal?.isModalOpen}
            close={handleChallanCloseModal}
          />
        )}

      {/* ===== Beam sale bill related information =====  */}
      {debitorBillModal?.isModalOpen &&
        debitorBillModal.model === BEAM_SALE_BILL_MODEL && (
          <BeamSaleChallanModel
            beamDetails={debitorBillModal.details}
            isEyeButton={false}
            isModelOpen={debitorBillModal?.isModalOpen}
            handleCloseModal={handleCloseModal}
            MODE={"VIEW"}
          />
        )}

      {/* ====== Job work challan modal information =======  */}
      {challanModal?.isModalOpen &&
        challanModal.model === JOB_WORK_BILL_MODEL && (
          <PrintJobWorkChallan
            details={challanModal.details}
            isEyeButton={false}
            open={challanModal?.isModalOpen}
            close={handleChallanCloseModal}
          />
        )}

      {/* ======= Job work bill modal information =====  */}
      {debitorBillModal?.isModalOpen &&
        debitorBillModal.model === JOB_WORK_BILL_MODEL && (
          <JobWorkSaleChallanModel
            details={debitorBillModal.details}
            isEyeButton={false}
            isModelOpen={debitorBillModal?.isModalOpen}
            handleCloseModal={handleCloseModal}
            MODE={"VIEW"}
          />
        )}

      {/* ====== Sale bill information ====  */}
      {debitorBillModal?.isModalOpen &&
        debitorBillModal.model === SALE_BILL_MODEL && (
          <SaleBillComp
            details={debitorBillModal.details}
            MODE={debitorBillModal.mode}
            isModelOpen={debitorBillModal?.isModalOpen}
            handleCloseModal={handleCloseModal}
          />
        )}

      {/* ===== Job gray sale bill information ====  */}
      {debitorBillModal?.isModalOpen &&
        debitorBillModal.model === JOB_GREAY_SALE_BILL_MODEL && (
          <JobGrayBillComp
            details={debitorBillModal.details}
            MODE={debitorBillModal.mode}
            isModelOpen={debitorBillModal.isModalOpen}
            handleCloseModal={handleCloseModal}
          />
        )}
    </>
  );
};
