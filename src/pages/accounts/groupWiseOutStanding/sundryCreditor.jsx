import {
  Button,
  Checkbox,
  DatePicker,
  Empty,
  Flex,
  Select,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { useContext, useEffect, useMemo, useState } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import dayjs from "dayjs";
import { getSupplierListRequest } from "../../../api/requests/users";
import { useQuery } from "@tanstack/react-query";
import { EyeOutlined, FilePdfOutlined, FileTextOutlined, TabletFilled } from "@ant-design/icons";
import useDebounce from "../../../hooks/useDebounce";
import { getSundryCreditorService } from "../../../api/requests/accounts/sundryCreditor";
import {
  getPurchaseTakaListRequest,
  getYarnBillListRequest,
} from "../../../api/requests/purchase/purchaseTaka";
import { getReceiveSizeBeamListRequest } from "../../../api/requests/purchase/purchaseSizeBeam";
import { getJobTakaListRequest } from "../../../api/requests/job/jobTaka";
import { getReworkChallanListRequest } from "../../../api/requests/job/challan/reworkChallan";
import { mutationOnErrorHandler } from "../../../utils/mutationUtils";
import ViewYarnReceiveChallan from "../../../components/purchase/receive/yarnReceive/ViewYarnReceiveChallanModal";
import SunadryCreditNoteGenerate from "../../../components/accounts/notes/CreditNotes/sundaryCreditNoteGenerate";
import SundaryDebitNoteGenerate from "../../../components/accounts/notes/DebitNotes/sundaryDebiteNoteGenerate";
import {
  generateJobBillDueDate,
  generatePurchaseBillDueDate,
  getCurrentFinancialYear,
} from "../reports/utils";
import moment from "moment";
import SizeBeamChallanModal from "../../../components/purchase/PurchaseSizeBeam/ReceiveSizeBeam/ReceiveSizeChallan";
import ViewPurchaseChallanInfo from "../../../components/purchase/purchaseChallan/ViewPurchaseChallanInfo";
import ViewJobTakaInfo from "../../../components/job/jobTaka/viewJobTakaInfo";
import ViewReworkChallanInfo from "../../../components/job/challan/reworkChallan/ViewReworkChallan";
import { getYarnReceiveBillByIdRequest } from "../../../api/requests/purchase/yarnReceive";
import { CREDIT_NOTE_BILL_MODEL, CREDIT_NOTE_MODEL_NAME, GENERAL_PURCHASE_MODEL_NAME, GENRAL_PURCHASE_BILL_MODEL, JOB_REWORK_BILL_MODEL, JOB_REWORK_MODEL_NAME, JOB_TAKA_BILL_MODEL, JOB_TAKA_MODEL_NAME, PURCHASE_TAKA_BILL_MODEL, PURCHASE_TAKA_MODEL_NAME, RECEIVE_SIZE_BEAM_BILL_MODEL, RECEIVE_SIZE_BEAM_MODEL_NAME, YARN_RECEIVE_BILL_MODEL, YARN_RECEIVE_MODEL_NAME } from "../../../constants/bill.model";
import JobTakaChallanModal from "../../../components/job/jobTaka/JobTakaChallan";
import PurchaseTakaChallanModal from "../../../components/purchase/purchaseTaka/PurchaseTakaChallan";
import ReworkChallanModal from "../../../components/job/challan/reworkChallan/ReworkChallanModal";

const orderTypeOptions = [
  { label: "Purchase", value: "purchase" },
  { label: "Job", value: "job" },
  { label: "Yarn", value: "yarn" },
  { label: "Bill of size beam", value: "bill_of_size_beam" },
  { label: "Expenses", value: "expenses" },
  { label: "Rework", value: "rework" },
];

const BILL_MODEL = {
  yarn_bills: "yarn_bills",
  receive_size_beam_bill: "receive_size_beam_bill",
  purchase_taka_bills: "purchase_taka_bills",
  job_taka_bills: "job_taka_bills",
  job_rework_bill: "job_rework_bill",
};

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

const NOTE_GENERATE_MODE = "Generate" ; 
const NOTE_VIEW_MODE = "View" ; 

const SundryCreditor = () => {
  const { companyId } = useContext(GlobalContext);
  const {startDate, endDate} = getCurrentFinancialYear() ; 

  const [isCash, setIsCash] = useState(false);
  const [isOnlyDues, setIsOnlyDues] = useState(false);
  const [fromDate, setFromDate] = useState(dayjs(startDate));
  const [toDate, setToDate] = useState(dayjs(endDate));
  const [supplier, setSupplier] = useState(null);
  const [orderType, setOrderType] = useState(null);
  const debounceFromDate = useDebounce(fromDate, 500);
  const debounceToDate = useDebounce(toDate, 500);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [informationLoading, setInformationLoading] = useState(false) ; 

  const [billModel, setBillModel] = useState(false);
  const [billInformation, setBillInformation] = useState(undefined);
  const [billLayout, setBillLayout] = useState(false);

  function disabledFutureDate(current) {
    return current && current > moment().endOf("day");
  }

  // Checkbox selection related handler ================================
  const storeRecord = (e, record, supplier_id) => {
    if (e.target.checked) {
      setSelectedRecords((prev) => {
        if (
          prev.length === 0 || 
          prev.every((item) => item.supplier_id === supplier_id)
        ) {
          return [...prev, { id: record?.bill_id, model: record?.model, ...record }];
        } else {
          return [{ id: record?.bill_id, model: record?.model, supplier_id, ...record }];
        }
      });
    } else {
      setSelectedRecords((prev) => {
        return prev.filter(
          (item) => !(item?.id === record?.bill_id && item?.model === record?.model)
        );
      });
    }
  };
  

  // Supplier dropdown related api ============================================================
  const { data: supplierListRes, isLoading: isLoadingSupplierList } = useQuery({
    queryKey: ["supplier", "list", { companyId }],
    queryFn: async () => {
      const res = await getSupplierListRequest({
        params: { company_id: companyId },
      });
      return res.data?.data?.supplierList;
    },
    enabled: Boolean(companyId),
  });

  // Sundary creditor related information ====================================================
  const [initialCreditorData, setInitialCreditorData] = useState([]);
  const [creditNoteList, setCreditNoteList] = useState([]);

  const { data: sundryCreditorData, isFetching: isLoadingSundryDebtor } =
    useQuery({
      queryKey: [
        "sundry",
        "creditor",
        "data",
        {
          from_date: dayjs(debounceFromDate).format("YYYY-MM-DD"),
          to_date: dayjs(debounceToDate).format("YYYY-MM-DD"),
        },
      ],
      queryFn: async () => {
        const params = {
          company_id: companyId,
          from_date: dayjs(debounceFromDate).format("YYYY-MM-DD"),
          to_date: dayjs(debounceToDate).format("YYYY-MM-DD"),
        };
        const res = await getSundryCreditorService({ params });
        return res.data?.data;
      },
      enabled: Boolean(companyId),
  });

  useEffect(() => {
    setInitialCreditorData(sundryCreditorData);
    setCreditNoteList(sundryCreditorData);
  }, [sundryCreditorData]);

  // Bill Selection option handler ===========================================================
  useEffect(() => {
    if (orderType == null || orderType == undefined) {
      setCreditNoteList(initialCreditorData);
    } else {
      let selection_model = null;
      if (orderType == "purchase") {
        selection_model = PURCHASE_TAKA_BILL_MODEL;
      } else if (orderType == "job") {
        selection_model = JOB_TAKA_BILL_MODEL;
      } else if (orderType == "yarn") {
        selection_model = YARN_RECEIVE_BILL_MODEL;
      } else if (orderType == "bill_of_size_beam") {
        selection_model = RECEIVE_SIZE_BEAM_BILL_MODEL;
      } else if (orderType == "expenses") {
        selection_model = GENRAL_PURCHASE_BILL_MODEL;
      } else if (orderType == "rework") {
        selection_model = JOB_REWORK_BILL_MODEL;
      }
      const temp = initialCreditorData?.map((element) => {
        const temp_bill = element?.bills?.filter((bill) => {
          return bill?.model == selection_model;
        });
        return {
          ...element,
          bills: temp_bill?.length > 0 ? temp_bill : [],
        };
      });
      setCreditNoteList(temp);
    }
  }, [orderType]);

  // Supplier selection filter ========================================================
  useEffect(() => {
    if (supplier == null || supplier == undefined){
      setCreditNoteList(initialCreditorData) ; 
    } else {
      const temp = initialCreditorData?.filter((element) => +element?.id == +supplier)
      setCreditNoteList(temp) ; 
    } 
  }, [supplier]) ;

  // Only dues related filter related option handler ================================== 
  useEffect(() => {
    if (isOnlyDues){
      const temp = initialCreditorData?.map((element) => {
        const filteredBills = element?.bills?.filter((bill) => {
          const dueDate = bill?.due_date
            ? moment(bill?.due_date).format("DD-MM-YYYY")
            : bill?.model === PURCHASE_TAKA_BILL_MODEL
            ? generatePurchaseBillDueDate(bill?.bill_date)
            : generateJobBillDueDate(bill?.bill_date);
      
          let dueDays = calculateDaysDifference(dueDate);
          dueDays = Math.max(dueDays, 0); // Ensures dueDays is not negative
      
          // Include the bill if it has positive dueDays or is a credit note
          return dueDays > 0 || bill?.model === CREDIT_NOTE_BILL_MODEL;
        });
      
        return {
          ...element,
          bills: filteredBills || [], // Default to an empty array if no bills
        };
      });
      setCreditNoteList(temp) ; 
    } else {
      setCreditNoteList(initialCreditorData) ; 
    }
  }, [isOnlyDues]) 

  const grandTotal = useMemo(() => {
    if (creditNoteList && creditNoteList?.length) {
      let meters = 0;
      let billAmount = 0;

      creditNoteList?.forEach((item) => {
        item?.bills?.forEach((bill) => {
          meters += bill?.meters;
          billAmount += bill?.amount;
        });
      });

      return { meters, bill_amount: billAmount };
    } else {
      return { meters: 0, bill_amount: 0 };
    }
  }, [creditNoteList]);

  const ReteriveBillInformation = async (model, bill_id) => {
    const selectedBillData = {
      model,
      bill_id,
    };
    let response;
    switch (selectedBillData?.model) {
      case "yarn_bills":
        response = await getYarnReceiveBillByIdRequest({
          id: selectedBillData?.bill_id,
          params: { company_id: companyId },
        });
        setBillInformation(response?.data?.yarnReciveBill);
        setBillLayout(true);
        setBillModel(selectedBillData?.model);
        return response?.data?.data;
    }
  };

  // ========== Debit note information model ============= //
  const [debitNoteModelOpen, setDebitNoteModelOpen] = useState(false);
  const [debitNoteSelection, setDebitNoteSelection] = useState([]);
  const [debitNoteModelData, setDebitNoteModelData] = useState(undefined);
  const [debiteNoteView, setDebitNoteView] = useState(NOTE_GENERATE_MODE) ; 

  // ========= Credit note information model =============== //
  const [creditNoteMoelOpen, setCreditNoteModelOpen] = useState(false);
  const [creditNoteSelection, setCreditNoteSelection] = useState([]);
  const [creditNoteModelData, setCreditNoteModelData] = useState(undefined);
  const [creditNoteView, setCreditNoteView] = useState(NOTE_GENERATE_MODE) ; 

  // ===== Summary related option handler ====== // 
  const [isSummaryGenerating, setIsSummaryGenerating] = useState(false) ; 
  const SummaryOptionHandler = () => {
    try {
      
      setIsSummaryGenerating(true) ; 
      let tableTitle = [
        "ID", 
        "Supplier", 
        "Company", 
        "Type", 
        "Taka", 
        "Meter", 
        "Bill Amount", 
        "Inerest" 
      ]
      let temp = {} ;
      let tableData = [] ; 
  
      initialCreditorData?.map((element) => {
        if (!temp[element?.id]){
          temp[element?.id] = {
            "supplier": element?.supplier
          }
        }
  
        element?.bills?.map((bill) => {
          if (!temp[element?.id][bill?.model]){
            temp[element?.id][bill?.model] = {
              "totalTaka": 0, 
              "totalMeter": 0, 
              "totalBillAmount": 0 ,
              "totalInterestAmount": 0
            }
          }
  
          let current_taka = bill?.taka || 0 ; 
          let current_meter = bill?.meters || 0 ;
          let bill_amount = bill?.amount || 0; 
          const dueDate =
            bill?.due_date == null
              ? bill?.model == PURCHASE_TAKA_BILL_MODEL
                ? generatePurchaseBillDueDate(bill?.bill_date)
                : generateJobBillDueDate(bill?.bill_date)
              : moment(bill?.due_date).format("DD-MM-YYYY");
          let dueDays = calculateDaysDifference(dueDate);
          if (dueDays < 0){
            dueDays = 0 ; 
          } 
  
          const interestAmount = CalculateInterest(dueDays, bill?.amount);
          
          temp[element?.id][bill?.model]["totalTaka"] = +temp[element?.id][bill?.model]["totalTaka"] + +current_taka  ; 
          temp[element?.id][bill?.model]["totalMeter"] = +temp[element?.id][bill?.model]["totalMeter"] + +current_meter  ; 
          temp[element?.id][bill?.model]["totalBillAmount"] = +temp[element?.id][bill?.model]["totalBillAmount"] + +bill_amount  ; 
          temp[element?.id][bill?.model]["totalInterestAmount"] = +temp[element?.id][bill?.model]["totalInterestAmount"] + +interestAmount  ; 
  
        })
      })
  
      let index = 1  ;  
      Object.entries(temp).forEach(([supplier_id, data]) => {
        Object.entries(data).forEach(([model, total]) => {
          if (model !== "supplier"){
            tableData.push([
              index,
              data["supplier"]["supplier_name"],
              data["supplier"]["supplier_company"],
              model === PURCHASE_TAKA_BILL_MODEL
                ? PURCHASE_TAKA_MODEL_NAME
                : model === YARN_RECEIVE_BILL_MODEL
                ? YARN_RECEIVE_MODEL_NAME
                : model === RECEIVE_SIZE_BEAM_BILL_MODEL
                ? RECEIVE_SIZE_BEAM_MODEL_NAME
                : model === JOB_TAKA_BILL_MODEL
                ? JOB_TAKA_MODEL_NAME
                : model === JOB_REWORK_BILL_MODEL
                ? JOB_REWORK_MODEL_NAME
                : model === GENRAL_PURCHASE_BILL_MODEL
                ? GENERAL_PURCHASE_MODEL_NAME
                : model === CREDIT_NOTE_BILL_MODEL
                ? "LATE PAYMENT"
                : "" ,
              parseFloat(data[model]["totalTaka"]).toFixed(2), 
              parseFloat(data[model]["totalMeter"]).toFixed(2), 
              parseFloat(data[model]["totalBillAmount"]).toFixed(2), 
              parseFloat(data[model]["totalInterestAmount"]).toFixed(2), 
            ]);
            index += 1; 
          }
        })
      }) 
      setIsSummaryGenerating(false) ; 
  
      // Set localstorage item information
      localStorage.setItem("print-array", JSON.stringify(tableData));
      localStorage.setItem("print-title", "Sundary Creditor Summary");
      localStorage.setItem("print-head", JSON.stringify(tableTitle));
      localStorage.setItem("total-count", "0");
  
      window.open("/print");
    } catch (error) {
      setIsSummaryGenerating(false) ;    
    }
  }

  // ===== Stock management related option handler ====== // 
  const [isStockSummaryGenerating, setIsStockSumamryGenerating] = useState(false) ; 
  const StockSummaryGenerate = () => {
    try {
      
      setIsStockSumamryGenerating(true) ; 
      let tableTitle = [
        "ID", 
        "Supplier", 
        "Company", 
        "0-30 days(include GST)", 
        "30 - 60 days(include GST)", 
        "60+ days (include GST)"
      ]
      let tableData = [] ; 
  
      let temp = {} ; 
      initialCreditorData?.map((element) => {
        element?.bills?.map((bill) => {
          if (!temp[element?.id]) {
            temp[element?.id] = {
              "supplier" : element?.supplier,
              "30": 0,
              "60": 0, 
              "60+": 0
            }
          }
          const paid_amount = +bill?.paid_amount;
          const debit_note_amount = +bill?.debit_note_net_amount;
          const bill_amount = +bill?.amount;
  
          const net_amount = bill_amount - debit_note_amount - paid_amount;
          const dueDate =
          bill?.due_date == null
            ? bill?.model == PURCHASE_TAKA_BILL_MODEL
              ? generatePurchaseBillDueDate(bill?.bill_date)
              : generateJobBillDueDate(bill?.bill_date)
            : moment(bill?.due_date).format("DD-MM-YYYY");
          let dueDays = calculateDaysDifference(dueDate);
          if (dueDays < 0){
            dueDays = 0 ; 
          } 
  
          if (dueDays <= 30){
            temp[element?.id]["30"] = +temp[element?.id]["30"] + +net_amount ;
          } else if (dueDays >30 && dueDays <= 60){
            temp[element?.id]["60"] = +temp[element?.id]["60"] + +net_amount ;
          } else {
            temp[element?.id]["60+"] = +temp[element?.id]["60+"] + +net_amount ;
          }
  
        })
      })
  
      let index = 1;
      Object.entries(temp).forEach(([supplier_id, data]) => {
        tableData.push([
          index, 
          data["supplier"]?.supplier_name, 
          data["supplier"]?.supplier_company,
          parseFloat(data["30"]).toFixed(2),
          parseFloat(data["60"]).toFixed(2),
          parseFloat(data["60+"]).toFixed(2)
        ])
        index += 1 ; 
      })
  
      // Set localstorage item information
      localStorage.setItem("print-array", JSON.stringify(tableData));
      localStorage.setItem("print-title", "Sundary Stock Summary");
      localStorage.setItem("print-head", JSON.stringify(tableTitle));
      localStorage.setItem("total-count", "0");
  
      window.open("/print");
      setIsStockSumamryGenerating(false) ; 
    } catch (error) {
      setIsStockSumamryGenerating(false) ; 
    }
  }

  // ======= PDF Generation option handler ============== // 
  const [isGeneratePDF, setIsGeneratePDF] = useState(false) ; 
  const DownloadPDF = () => {
    try {
      setIsGeneratePDF(true) ; 
      let tableTitle = [
        "ID", 
        "Supplier", 
        "Company", 
        "Bill No", 
        "Type", 
        "Taka/Cart", 
        "Mtr/KG", 
        "Bill Amount", 
        "Due Day",
        "Due Date", 
        "Interest"
      ]; 

      let tableData = [] ; 
      let index = 1;

      initialCreditorData?.map((data) => {
        data?.bills?.map((bill) => {
          const dueDate =
            bill?.due_date == null
              ? bill?.model == PURCHASE_TAKA_BILL_MODEL
                ? generatePurchaseBillDueDate(bill?.bill_date)
                : generateJobBillDueDate(bill?.bill_date)
              : moment(bill?.due_date).format("DD-MM-YYYY");
          let dueDays = calculateDaysDifference(dueDate);
          if (dueDays < 0){
            dueDays = 0 ; 
          } 

          const interestAmount = CalculateInterest(dueDays, bill?.amount);

          const paid_amount = +bill?.paid_amount;
          const debit_note_amount = +bill?.debit_note_net_amount;
          const bill_amount = +bill?.amount;

          const net_amount = bill_amount - debit_note_amount - paid_amount;

          tableData.push([
            index, 
            data?.supplier?.supplier_name, 
            data?.supplier?.supplier_company,
            bill?.bill_no,
            bill?.model === JOB_TAKA_BILL_MODEL
              ? JOB_TAKA_MODEL_NAME
              : bill?.model === RECEIVE_SIZE_BEAM_BILL_MODEL
              ? RECEIVE_SIZE_BEAM_MODEL_NAME
              : bill?.model === YARN_RECEIVE_BILL_MODEL
              ? YARN_RECEIVE_MODEL_NAME
              : bill?.model === GENRAL_PURCHASE_BILL_MODEL
              ? GENERAL_PURCHASE_MODEL_NAME
              : bill?.model === PURCHASE_TAKA_BILL_MODEL
              ? PURCHASE_TAKA_MODEL_NAME
              : bill?.model === JOB_REWORK_BILL_MODEL
              ? JOB_REWORK_MODEL_NAME
              : bill?.model == CREDIT_NOTE_BILL_MODEL
              ? "LATE PAYMENT":null, 
            bill?.taka,
            bill?.meters,
            parseFloat(net_amount).toFixed(2), 
            dueDays,
            dueDate,
            interestAmount
          ])

          index += 1; 

        })
      })

      setIsGeneratePDF(false) ; 

      // Set localstorage item information
      localStorage.setItem("print-array", JSON.stringify(tableData));
      localStorage.setItem("print-title", "Sundary Stock Summary");
      localStorage.setItem("print-head", JSON.stringify(tableTitle));
      localStorage.setItem("total-count", "0");
  
      window.open("/print");


    } catch (error) {
      setIsGeneratePDF(false) ; 
    }
  }

  return (
    <>
      <Spin spinning = {informationLoading  }>
        <div className="flex flex-col gap-2 p-4">
          <div className="flex items-center justify-between gap-5 mx-3 mb-3">
            <div className="flex items-center gap-2">
              <h3 className="m-0 text-primary">Sundary Creditors</h3>
            </div>

            <Flex gap={10} align="center" style={{ marginLeft: "auto" }}>
              
              <Checkbox
                value={isOnlyDues}
                onChange={(e) => setIsOnlyDues(e.target.checked)}
              >
                Only Dues
              </Checkbox>
              
              {/* Download PDF option  */}
              <Button
                icon={<FilePdfOutlined />}
                type="primary"
                className="flex-none"
                loading = {isGeneratePDF}
                onClick={() => {DownloadPDF()}}
              />
              
              {/* Summary generation option  */}
              <Button type="primary" className="flex-none"
                loading = {isSummaryGenerating}
                onClick={() => {SummaryOptionHandler()}}
              >
                Summary
              </Button>
              
              {/* Stock summary generation option  */}
              <Button type="primary" className="flex-none"
                loading = {isStockSummaryGenerating}
                onClick={() => {StockSummaryGenerate()}}
              >
                STOCK STATMENT
              </Button>
          
            </Flex>

          </div>

          <Flex
            align="center"
            justify={selectedRecords?.length ? "space-between" : "flex-end"}
            gap={10}
          >
            {selectedRecords?.length ? (
              <Button type="primary" className="flex-none"
                onClick={() => {
                  let bill_record = selectedRecords[0] ; 
                  console.log("Bill records ===========", bill_record);
                  
                  setCreditNoteSelection(selectedRecords)
                  setCreditNoteModelOpen(true) ; 
                }}
              >
                GEN. CREDIT NOTE
              </Button>
            ) : null}

            <Flex style={{gap: 10}}>

              {/* Supplier dropdown  */}
              <Flex align="center" gap={10}>
                <Typography.Text className="whitespace-nowrap">
                  Supplier
                </Typography.Text>
                <Select
                  allowClear
                  placeholder="Select supplier"
                  dropdownStyle={{
                    textTransform: "capitalize",
                  }}
                  style={{
                    textTransform: "capitalize",
                  }}
                  className="min-w-40"
                  value={supplier}
                  onChange={(selectedValue) => setSupplier(selectedValue)}
                  loading={isLoadingSupplierList}
                  options={supplierListRes?.rows?.map((item) => {
                    return {
                      label: item?.supplier?.supplier_company,
                      value: item?.id,
                    };
                  })}
                />
              </Flex>
              
              {/* Order type dropdown  */}
              <Flex align="center" gap={10}>
                <Typography.Text className="whitespace-nowrap">
                  Order Type
                </Typography.Text>
                <Select
                  allowClear
                  placeholder="Select order type"
                  dropdownStyle={{
                    textTransform: "capitalize",
                  }}
                  style={{
                    textTransform: "capitalize",
                  }}
                  className="min-w-40"
                  value={orderType}
                  onChange={(selectedValue) => setOrderType(selectedValue)}
                  options={orderTypeOptions || []}
                />
              </Flex>
              
              {/* From date selection  */}
              <Flex align="center" gap={10}>
                <Typography.Text className="whitespace-nowrap">
                  From
                </Typography.Text>
                <DatePicker value={fromDate} onChange={setFromDate} disabledDate={disabledFutureDate} />
              </Flex>
              
              {/* To Date selection  */}
              <Flex align="center" gap={10}>
                <Typography.Text className="whitespace-nowrap">
                  To
                </Typography.Text>
                <DatePicker value={toDate} onChange={setToDate} />
              </Flex>
            
            </Flex>
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
              cellPadding={6}
              className="custom-table"
            >
              <thead>
                {/* <!-- Table Header Row --> */}
                <tr>
                  <th>Date</th>
                  <th>Bill No</th>
                  <th>Type</th>
                  <th>Taka/Crtn</th>
                  <th>Mtr/KG</th>
                  <th>Bill Amount</th>
                  <th>Due Date</th>
                  <th>Due Day</th>
                  <th>Int. Payable</th>
                  <th style={{ width: "105px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {creditNoteList ? (
                  creditNoteList?.map((data, index) => (
                    <TableWithAccordion
                      key={index}
                      data={data}
                      companyId={companyId}
                      selectedRecords={selectedRecords}
                      storeRecord={storeRecord}
                      ReteriveBillInformation={async (model, bill_id) => {
                        await ReteriveBillInformation(model, bill_id);
                      }}
                      
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
                      
                      setInformationLoading = {setInformationLoading}
                      setCreditNoteModelData = {setCreditNoteModelData}
                      setDebitNoteModelData = {setDebitNoteModelData}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={12} style={{ textAlign: "center" }}>
                      No Data Found
                    </td>
                  </tr>
                )}

                <tr style={{ backgroundColor: "white" }}>
                  <td colSpan={11}></td>
                </tr>

                <tr
                  className="sundary-total"
                  style={{ backgroundColor: "white" }}
                >
                  <td>
                    <b>Grand Total</b>
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td>
                    <b>{grandTotal?.meters}</b>
                  </td>
                  <td>
                    <b>{grandTotal?.bill_amount}</b>
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </Spin>

      {billLayout ? (
        <>
          {billModel === "yarn_bills" ? (
            <ViewYarnReceiveChallan
              details={billInformation}
              isOpen={billLayout}
              setLayout={setBillLayout}
            />
          ) : null}
        </>
      ) : null}

      {/* Debit note information =========================== */}
      {debitNoteModelOpen && (
        <SundaryDebitNoteGenerate
          open={debitNoteModelOpen}
          setOpen={setDebitNoteModelOpen}
          bill_details={debitNoteSelection}
          debiteNoteData={debitNoteModelData}
          setDebitNoteSelection={setDebitNoteSelection}
          view = {debiteNoteView}
        />
      )}
      
      {/* Credit note information ============================ */}
      {creditNoteMoelOpen && (
        <SunadryCreditNoteGenerate
          open={creditNoteMoelOpen}
          setOpen={setCreditNoteModelOpen}
          bill_details={creditNoteSelection}
          debiteNoteData={creditNoteModelData}
          setDebitNoteSelection={setCreditNoteSelection}
          view = {creditNoteView}
          setSelectedRecords = {setSelectedRecords}
        />
      )}
    </>
  );
};

export default SundryCreditor;

const TableWithAccordion = ({
  data,
  companyId,
  selectedRecords,
  storeRecord,
  handleDebitNoteClick,
  handleCreditNoteClick,
  setInformationLoading, 
  setCreditNoteModelData, 
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

  const [creditorBillModal, setCreditorBillModal] = useState({
    isModalOpen: false,
    details: null,
    mode: "",
    model: "",
  });

  const [challanModel, setChallanModel] = useState({
    isModalOpen: false,
    details: null,
    mode: "",
    model: "",
  });

  

  const handleCloseModal = () => {
    setCreditorBillModal((prev) => ({
      ...prev,
      isModalOpen: false,
    }));
  };

  const handleChallanCloseModal = () => {
    setChallanModel((prev) => ({
      ...prev,
      isModalOpen: false,
    }));
  }

  const TOTAL = useMemo(() => {
    if (data && data?.bills && data?.bills?.length) {
      let meter = 0;
      let amount = 0;
      data?.bills?.forEach((item) => {
        meter += item?.meters || 0;
        amount += item?.amount || 0;
      });

      return { meter, amount };
    } else {
      return { meter: 0, amount: 0 };
    }
  }, [data]);

  const onClickViewHandler = async (bill, option) => {
    try {
      let response;
      let details;
      let params = {
        company_id: companyId,
        bill_id: bill.bill_id,
        page: 0,
        pageSize: 10,
      };

      setInformationLoading(true) ; 
      if (bill.model === BILL_MODEL.yarn_bills) {
        response = await getYarnBillListRequest({ params });
        if (response.data.success) {
          details = response?.data?.data?.row[0];
        }
      } else if (bill.model === BILL_MODEL.receive_size_beam_bill) {
        response = await getReceiveSizeBeamListRequest({ params });
        if (response.data.success) {
          details = response?.data?.data?.rows[0];
        }
      } else if (bill.model === BILL_MODEL.purchase_taka_bills) {
        response = await getPurchaseTakaListRequest({ params });
        if (response.data.success) {
          details = response?.data?.data?.rows[0];
        }
      } else if (bill.model === BILL_MODEL.job_taka_bills) {
        response = await getJobTakaListRequest({ params });
        if (response.data.success) {
          details = response?.data?.data?.rows[0];
        }
      } else if (bill.model === BILL_MODEL.job_rework_bill) {
        response = await getReworkChallanListRequest({ params });
        if (response.data.success) {
          details = response?.data?.data?.rows[0];
        }
      }

      if (option == "challan"){
        setChallanModel({
          isModalOpen: true,
          details: details,
          mode: "VIEW",
          model: bill.model,
        });

      } else {
        setCreditorBillModal({
          isModalOpen: true,
          details: details,
          mode: "VIEW",
          model: bill.model,
        });
      }


      setInformationLoading(false) ; 
    } catch (error) {
      mutationOnErrorHandler({ error });
    }
  };


  return (
    <>
      <tr
        style={{ cursor: "pointer", backgroundColor: "#f0f0f0" }}
        onClick={toggleAccordion}
        className="sundary-header"
      >

        {/* Total bill related count information  */}
        <td>
          <Tag color="purple">
            {data?.bills?.length} Bills
          </Tag>
        </td>
        
        {/* Supplier name and Supplier company related information  */}
        <td colSpan={2}>
          <div style={{fontWeight: 600}}>
            {String(data?.supplier?.supplier_name).toUpperCase()}
          </div>
          <div style={{fontWeight: 400}}>
            {data?.supplier?.supplier_company}
          </div>
        </td>

        {/* Supplier address related information  */}
        <td colSpan={4}>{String(data?.address || "").toUpperCase()}</td>
        
        <td></td>
        
        <td></td>

        {/* Accordian open and close related option button    */}
        <td>
          <Button type="text">{isAccordionOpen ? "▼" : "►"}</Button>
        </td>
      
      </tr>

      {isAccordionOpen === data.id && (
        <>
          {data && data?.bills?.length ? (
            data?.bills?.map((bill, index) => {

              const isChecked = selectedRecords?.some(
                (item) => item?.id === bill?.bill_id && item?.model === bill?.model
              );

              const dueDate =
                bill?.due_date == null
                  ? bill?.model == PURCHASE_TAKA_BILL_MODEL
                    ? generatePurchaseBillDueDate(bill?.bill_date)
                    : generateJobBillDueDate(bill?.bill_date)
                  : moment(bill?.due_date).format("DD-MM-YYYY");
              let dueDays = calculateDaysDifference(dueDate);
              if (dueDays < 0){
                dueDays = 0 ; 
              } 

              const interestAmount = CalculateInterest(dueDays, bill?.amount);

              const paid_amount = +bill?.paid_amount;
              const debit_note_amount = +bill?.debit_note_net_amount;
              const bill_amount = +bill?.amount;

              const net_amount = parseFloat(bill_amount - debit_note_amount - paid_amount).toFixed(2);

              return (
                <tr
                  key={index + "_bill"}
                  style={
                    isChecked
                      ? { backgroundColor: "rgb(25 74 109 / 20%)" }
                      : { backgroundColor: "white" }
                  }
                  className="sundary-data"
                >

                  {/* 1. Bill Date  */}
                  <td style={{fontWeight: 550}}>
                    {dayjs(bill?.bill_date).format("DD-MM-YYYY")}
                  </td>

                  {/* Bill number  */}
                  <td style={{
                    fontWeight: 550
                  }}>
                    <div>

                      <span 
                        style={{
                          color: bill?.model == CREDIT_NOTE_BILL_MODEL ?"green":"black"
                        }}
                      >
                        {bill?.bill_no || ""}
                      </span>

                      {/* Debit note number information  */}
                      {bill?.debit_note_id !== null && (
                        <div
                          style={{
                            fontSize: 12,
                            color: "red",
                            cursor: "pointer",
                          }}
                        >
                          <Tooltip
                            title={`DEBIT NOTE : ${bill?.debit_note_number}`}
                          >
                            ( {bill?.debit_note_number} )
                          </Tooltip>
                        </div>
                      )}
                      
                      {/* Credit note number information  */}
                      {bill?.credit_note_id !== null && (
                        <div
                          style={{
                            fontSize: 12,
                            color: "green",
                            cursor: "pointer",
                          }}
                        >
                          <Tooltip
                            title={`CRDIT NOTE : ${bill?.credit_note_number}`}
                          >
                            ( {bill?.credit_note_number} )
                          </Tooltip>
                        </div>
                      )}

                    </div>
                  </td>

                  {/* Model name information  */}
                  <td style={{
                    color: bill?.model == CREDIT_NOTE_BILL_MODEL?"red":"black"
                  }}>
                    {bill?.model === JOB_TAKA_BILL_MODEL
                      ? JOB_TAKA_MODEL_NAME
                      : bill?.model === RECEIVE_SIZE_BEAM_BILL_MODEL
                      ? RECEIVE_SIZE_BEAM_MODEL_NAME
                      : bill?.model === YARN_RECEIVE_BILL_MODEL
                      ? YARN_RECEIVE_MODEL_NAME
                      : bill?.model === GENRAL_PURCHASE_BILL_MODEL
                      ? GENERAL_PURCHASE_MODEL_NAME
                      : bill?.model === PURCHASE_TAKA_BILL_MODEL
                      ? PURCHASE_TAKA_MODEL_NAME
                      : bill?.model === JOB_REWORK_BILL_MODEL
                      ? JOB_REWORK_MODEL_NAME
                      : bill?.model == CREDIT_NOTE_BILL_MODEL
                      ? "LATE PAYMENT":null}
                  </td>
                  
                  {/* Taka information  */}
                  <td>
                    {bill?.model === YARN_RECEIVE_BILL_MODEL && (
                      <>
                        <span style={{ fontWeight: 550, marginRight: 5, color: "blue", fontSize: 13 }}>{`Cartoon => `}</span>
                      </>
                    )}
                    {bill?.taka || 0} 
                  </td>
                  
                  {/* Meter information  */}
                  <td>
                    {bill?.model === YARN_RECEIVE_BILL_MODEL && (
                      <>
                        <span style={{ fontWeight: 550, marginRight: 5, color: "blue", fontSize: 13 }}>{`KG => `}</span>
                      </>
                    )}
                    {bill?.meters || 0}
                  </td>
                  
                  {/* Bill amount information  */}
                  <td>
                    <Tooltip
                      title={`${bill_amount} - ${debit_note_amount} - ${paid_amount} = ${net_amount}`}
                    >
                      {net_amount || 0}
                    </Tooltip>
                  </td>
                  
                  {/* Due date information  */}
                  <td>{dueDate}</td>

                  {/* Due days information  */}
                  <td className={dueDays !== 0 ? "sundary-due-date" : ""}>
                    {dueDays === 0 ? (
                      0
                    ) : (
                      <>
                        +<span style={{ fontWeight: 550 }}>{dueDays}</span> Days
                      </>
                    )}
                  </td>
                  
                  {/* Inerest amount related information  */}
                  <td
                    className={interestAmount !== 0 ? "sundary-due-date" : ""}
                  >
                    {bill?.credit_note_id !== null
                      ? parseFloat(bill?.credit_note_net_amount).toFixed(2)
                      : interestAmount}
                  </td>
                  
                  <td>
                    <Space>

                      {[  PURCHASE_TAKA_BILL_MODEL, 
                          JOB_REWORK_BILL_MODEL, 
                          JOB_TAKA_BILL_MODEL].includes(bill?.model) && (
                        <EyeOutlined
                          style={{fontSize: 18}}
                          onClick={() => onClickViewHandler(bill, "challan")}
                        />
                      )}
                      
                      {/* Particular model bill information  */}
                      {bill?.model !== CREDIT_NOTE_BILL_MODEL && (
                        <FileTextOutlined style={{fontSize: 18}} 
                          onClick={() => onClickViewHandler(bill, "bill")}
                        />
                      )}

                      {/* ===== Credit note creation related checkbox =====  */}
                      {bill?.credit_note_id == null && bill?.model != CREDIT_NOTE_BILL_MODEL ? (
                        <>
                          <Checkbox
                            checked={selectedRecords?.some(
                              (item) => item?.id === bill?.bill_id && item?.model === bill?.model
                            )}
                            onChange={(e) => {
                              setCreditNoteModelData(data) ; 
                              storeRecord(e, bill, data?.supplier?.user_id)
                            }}
                          />
                        </>
                      ) : (
                        <>
                          {/* Credit note option  */}
                          <Tooltip title = "Crdit Note">
                            <TabletFilled
                              style={{ color: "green" }}
                              onClick={() => {
                                handleCreditNoteClick(bill, data);
                              }}
                            />
                          </Tooltip>
                        </>
                      )}

                      {/* ======= Debit note id related information =====  */}
                      {bill?.debit_note_id !== null && (
                        <>
                          <Tooltip title = "Debit Note">
                            <TabletFilled
                              style={{ color: "red" }}
                              onClick={() => {
                                handleDebitNoteClick(bill, data);
                              }}
                            />
                          </Tooltip>
                        </>
                      )}
                    </Space>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={12} style={{ textAlign: "center" }}>
                <Empty description={"No bills found"} />
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
        <td>
          <b>{TOTAL?.meter}</b>
        </td>
        <td>
          <b>{TOTAL?.amount}</b>
        </td>
        <td></td>
        <td></td>
      </tr>

      {/* ====== Yarn receive bill ======  */}
      {creditorBillModal?.isModalOpen &&
        creditorBillModal.model === YARN_RECEIVE_BILL_MODEL && (
          <ViewYarnReceiveChallan
            details={creditorBillModal.details}
            isEyeButton={false}
            open={creditorBillModal?.isModalOpen}
            close={handleCloseModal}
          />
        )}

      {/* ==== Receive size beam challan model ====  */}
      {creditorBillModal?.isModalOpen &&
        creditorBillModal.model === RECEIVE_SIZE_BEAM_BILL_MODEL && (
          <SizeBeamChallanModal
            details={creditorBillModal.details}
            mode={creditorBillModal.mode}
            isEyeButton={false}
            open={creditorBillModal?.isModalOpen}
            close={handleCloseModal}
          />
        )}

      {/* ==== Purchase challan information model ====  */}
      {challanModel?.isModalOpen &&
        challanModel.model === PURCHASE_TAKA_BILL_MODEL && (
          <ViewPurchaseChallanInfo
            details={challanModel?.details}
            isEyeButton={false}
            open={challanModel?.isModalOpen}
            close={handleChallanCloseModal}
          />
        )}

      {/* ====== Purchase bill related information ====  */}
      {creditorBillModal?.isModalOpen &&
        creditorBillModal.model === PURCHASE_TAKA_BILL_MODEL && (
          <PurchaseTakaChallanModal
            details={creditorBillModal?.details}
            isModelOpen={creditorBillModal?.isModalOpen}
            handleCloseModal={handleCloseModal}  
            MODE = {"VIEW"}
          />
        )}

      {/* ===== Job Taka challan information =====  */}
      {challanModel?.isModalOpen &&
        challanModel.model === JOB_TAKA_BILL_MODEL && (
          <ViewJobTakaInfo
            details={challanModel?.details}
            isEyeButton={false}
            open={challanModel?.isModalOpen}
            close={handleChallanCloseModal}
          />
        )}

      {/* ===== Job Taka bill information ======  */}
      {creditorBillModal?.isModalOpen &&
        creditorBillModal.model === JOB_TAKA_BILL_MODEL && (
          <JobTakaChallanModal
            details={creditorBillModal?.details}
            isModelOpen={creditorBillModal?.isModalOpen}
            handleCloseModal={handleCloseModal}  
            MODE = {"VIEW"}
          />
        )}

      {/* ===== Rework challan bill information ======  */}
      {challanModel?.isModalOpen &&
        challanModel.model === JOB_REWORK_BILL_MODEL && (
          <ViewReworkChallanInfo
            details={challanModel?.details}
            isEyeButton={false}
            open={challanModel?.isModalOpen}
            close={handleCloseModal}
          />
        )}

      {/* ===== Rework challan bill information ===== */}

      {creditorBillModal?.isModalOpen &&
        creditorBillModal.model === JOB_REWORK_BILL_MODEL && (
          <ReworkChallanModal
            details={creditorBillModal?.details}
            isModelOpen={creditorBillModal?.isModalOpen}
            handleCloseModal={handleCloseModal}  
            MODE = {"VIEW"}
          />
        )}
    </>
  );
};
