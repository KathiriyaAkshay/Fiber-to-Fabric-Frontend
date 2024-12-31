import {
  Button,
  Checkbox,
  DatePicker,
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

// const calculateDueDays = (createdAt, dueDate) => {
//   const startDate = dayjs(createdAt);
//   const endDate = dayjs(dueDate);

//   // Calculate the difference in days
//   const dueDays = endDate.diff(startDate, "day");

//   return dueDays;
// };

const SundryDebitor = () => {
  const { company, companyId, companyListRes } = useContext(GlobalContext);
  const queryClient = useQueryClient();

  const [sundryDebitorType, setSundryDebitorType] = useState("all");
  const [isCash, setIsCash] = useState(false);
  const [isPaymentDue, setIsPaymentDue] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [billNo, setBillNo] = useState("");
  const [broker, setBroker] = useState(null);
  const [selection, setSelection] = useState("show_all_bills");
  // const debounceSundryDebitorType = useDebounce(sundryDebitorType, 500);
  // const debounceIsCash = useDebounce(isCash, 500);
  // const debounceIsPaymentDue = useDebounce(isPaymentDue, 500);
  const debounceFromDate = useDebounce(fromDate, 500);
  const debounceToDate = useDebounce(toDate, 500);
  // const debounceBillNo = useDebounce(billNo, 500);
  // const debounceBroker = useDebounce(broker, 500);
  // const debounceSelection = useDebounce(selection, 500);

  // useEffect(() => {
  //   if (companyId) setSelectedCompanyId(companyId);
  // }, [companyId]);

  useEffect(() => {
    const currentYear = dayjs().year();

    // Set the From Date to April 1st of the current year
    const calculatedFromDate = dayjs(`${currentYear}-04-01`);

    // Set the To Date to March 31st of the next year
    const calculatedToDate = dayjs(`${currentYear + 1}-03-31`);

    setFromDate(calculatedFromDate);
    setToDate(calculatedToDate);
  }, []);

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

  // ======================== Sundary Debite note related information ================= //
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
          if (["credit_notes", "debit_notes"].includes(bill?.model)) {
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

  const PaidInterestAmount = async (amount, due_date) => {
    let requestPayload = [];
    selectedInterestBill?.map((element) => {
      requestPayload.push({
        interest_amount: +amount,
        interest_paid_date: moment(due_date).format("YYYY-MM-DD"),
        model: element?.model,
        bill_id: element?.bill_id,
      });
    });

    await addInterestAmount({ data: requestPayload });
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
        let bill_deducation_amount = +total_amount - +credit_note_amount ; 
        let bill_remaing_amount = parseFloat(bill?.part_payment == null?bill_deducation_amount:+bill?.part_payment).toFixed(2) ; 
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
  const [debitNoteSelection, setDebitNoteSelection] = useState([]);
  const [tempDebiteNote, setTempDebiteNote] = useState([]);
  const [debitNoteModelOpen, setDebitNoteModelOpen] = useState(false);
  const [debitNoteData, setDebiteNoteData] = useState(undefined);

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
      setDebiteNoteData(data);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary">Sundry Debtor</h3>
        </div>

        <div style={{ marginLeft: "auto" }}>
          <Checkbox
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
          </Checkbox>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <Radio.Group
            name="production_filter"
            value={sundryDebitorType}
            onChange={(e) => setSundryDebitorType(e.target.value)}
            className="payment-options"
          >
            <Radio value={"current"}>Current</Radio>
            <Radio value={"previous"}>Previous</Radio>
            <Radio value={"all"}>All</Radio>
            <Radio value={"other"}>Other</Radio>
          </Radio.Group>
        </div>
      </div>

      <Flex align="center" justify="flex-end" gap={10}>
        {/* ============== Interest payment option ============  */}
        {selectedInterestBill?.length > 0 && (
          <Flex style={{ gap: 5 }}>
            <div
              style={{
                marginTop: "auto",
                marginBottom: "auto",
                textAlign: "center",
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
        <Button
          icon={<FilePdfOutlined />}
          type="primary"
          className="flex-none"
        />
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
                  handleInterestCheckboxSelection={(event, bill) => {
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
                  setDebiteNoteData={setDebiteNoteData}
                  handleDebitNoteClick={(bill, data) => {
                    setDebitNoteModelOpen(true);
                    setTempDebiteNote([bill]);
                    setDebiteNoteData(data);
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

      {interestPaymentModalOpen && (
        <InterestPaymentModal
          visible={interestPaymentModalOpen}
          onCancel={() => {
            setPaymentInterestModalOpen(false);
            setSelectedInterestBill([]);
          }}
          selectedInterestBill={selectedInterestBill}
          onConfirm={async (amount, date) => {
            PaidInterestAmount(amount, date);
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

      {debitNoteModelOpen && (
        <SundaryDebitNoteGenerate
          open={debitNoteModelOpen}
          setOpen={setDebitNoteModelOpen}
          bill_details={
            debitNoteSelection?.length == 0
              ? tempDebiteNote
              : debitNoteSelection
          }
          debiteNoteData={debitNoteData}
          setDebitNoteSelection={setDebitNoteSelection}
        />
      )}
    </div>
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
  companyListRes,
  handleDebitNoteSelection,
  debitNoteSelection,
  // setDebiteNoteData,
  handleDebitNoteClick,
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

  const handleCloseModal = () => {
    setDebitorBillModal((prev) => ({
      ...prev,
      isModalOpen: false,
    }));
  };

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

  const onClickViewHandler = async (bill) => {
    try {
      let response;
      let details;
      let params = {
        company_id: companyId,
        bill_id: bill.bill_id,
        page: 0,
        pageSize: 10,
      };

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
        console.log({ response });
        if (response.data.success) {
          details = response?.data?.data?.jobGraySaleBill[0];
        }
      }

      setDebitorBillModal({
        isModalOpen: true,
        details: details,
        mode: "VIEW",
        model: bill.model,
      });
    } catch (error) {
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
          {String(data?.first_name + " " + data?.last_name).toUpperCase()}
          <Tag
            color="#108ee9"
            style={{
              marginLeft: 10,
            }}
          >
            {data?.bills?.length} Bills
          </Tag>
        </td>
        <td colSpan={5}>{data?.address || ""}</td>
        <td></td>
        <td>
          {isAccordionOpen === data.id ? (
            <>
              <Input style={{ width: "60px" }} />
              &nbsp;&nbsp;&nbsp;&nbsp;
              <Button
                style={{ backgroundColor: "green", color: "#fff" }}
                icon={<CheckOutlined />}
              />
            </>
          ) : null}
        </td>
        <td style={{ textAlign: "center" }}>
          <Link>Clear</Link> &nbsp;&nbsp;&nbsp;&nbsp;
          <DebitorNotesModal />
        </td>
        <td>
          <Button type="text">{isAccordionOpen ? "▼" : "►"}</Button>
          <Button type="primary">PDF</Button>
        </td>
      </tr>

      {/* Accordion Content Rows (conditionally rendered) */}
      {isAccordionOpen === data.id && (
        <>
          {data && data?.bills?.length ? (
            data?.bills?.map((bill, index) => {

              // Bill due date calculation 
              let dueDate = moment(bill?.due_days).format("DD-MM-YYYY");
              let dueDays = isNaN(calculateDaysDifference(dueDate))
                ? 0
                : calculateDaysDifference(dueDate);
              
              // Bill date calculation
              let billDate = moment(bill?.createdAt).format("DD-MM-YYYY");
              let billDays = isNaN(calculateDaysDifference(billDate))
                ? 0
                : calculateDaysDifference(billDate);
              
                let model =
                bill?.model == "sale_bills"
                  ? "SALE BILL"
                  : bill?.model == "yarn_sale_bills"
                  ? "YARN SALE"
                  : bill?.model == "job_gray_sale_bill"
                  ? "JOB GRAY SALE"
                  : bill?.model == "beam_sale_bill"
                  ? "BEAM SALE"
                  : bill?.model == "credit_notes"
                  ? "CREDIT NOTE"
                  : bill?.model == "debit_notes"
                  ? "DEBIT NOTE"
                  : bill?.model == "job_work_bills"
                  ? "JOB WORK"
                  : bill?.model == "job_gray_sale_bill"
                  ? "JOB GRAY SALE"
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
              let bill_deducation_amount = +total_amount - +credit_note_amount ; 
              
              let paid_amount = parseFloat(+bill?.paid_amount || 0).toFixed(2) || 0; // Paid amount
              
              let interest_amount = 0;
              if (bill?.credit_note_id == null) {
                interest_amount = CalculateInterest(dueDays, bill?.amount);
              }
              
              let bill_remaing_amount = parseFloat(bill?.part_payment == null?bill_deducation_amount:+bill?.part_payment).toFixed(2) ; 
              let bill_paid_amount = parseFloat(+bill_deducation_amount - +bill_remaing_amount).toFixed(2);

              return (
                <tr key={index + "_bill"} className="sundary-data">
                  <td>
                    {bill?.debit_note_id == null &&
                      !["credit_notes", "debit_notes"]?.includes(
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

                  <td
                    style={{
                      fontWeight: 600,
                    }}
                  >
                    {dayjs(bill?.createdAt).format("DD-MM-YYYY")}
                  </td>

                  <td
                    style={{
                      color: ["credit_notes", "debit_notes"]?.includes(
                        bill?.model
                      )
                        ? "blue"
                        : "#000",
                    }}
                  >
                    {bill?.bill_no || ""}
                  </td>

                  <td>{model}</td>

                  <td>{company?.company_name || ""}</td>

                  <td>
                    {bill?.model == "credit_notes" ? "-" : bill?.taka || "-"}
                  </td>

                  <td>
                    {bill?.model == "credit_notes" ? "-" : bill?.meter || "-"}
                  </td>
                  
                  {/* =========== Bill amount information =========  */}
                  <td>
                    <Tooltip
                      title={`${total_amount} - ${credit_note_amount} - ${bill_paid_amount} = ${parseFloat(bill_remaing_amount).toFixed(2)}`}
                    >
                      <div>
                        {parseFloat(bill_remaing_amount).toFixed(2) || 0}
                        {paid_amount != 0 && (
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
                    <Tooltip title={`Due Days : ${dueDays}`}>
                      {dueDays <= 0 ? 0 : `+${dueDays}D` || 0}
                    </Tooltip>
                    <Tooltip title={`Bill Days: ${billDays}`}>
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
                    {["credit_notes", "debit_notes"]?.includes(bill?.model) ? (
                      <>
                        <div>---</div>
                      </>
                    ) : (
                      <>
                        {bill?.interest_paid_date !== null &&
                          bill?.interest_amount !== null && (
                            <>
                              <div>0</div>
                              <div
                                style={{
                                  fontSize: 12,
                                  color: "green",
                                  fontWeight: 600,
                                  marginTop: 3,
                                }}
                              >
                                (Rece.:{" "}
                                {moment(bill?.interest_paid_date).format(
                                  "DD-MM-YYYY"
                                )}
                                )
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
                      {["credit_notes", "debit_notes"]?.includes(
                        bill?.model
                      ) && (
                        <SundaryStaticDebiteNoteViews
                          bill_details={bill}
                          companyListRes={companyListRes}
                          data={data}
                        />
                      )}

                      {!["credit_notes", "debit_notes"]?.includes(
                        bill?.model
                      ) && (
                        <>
                          <Button
                            type="primary"
                            onClick={() => onClickViewHandler(bill)}
                          >
                            <EyeOutlined />
                          </Button>
                          <FileTextFilled
                            onClick={() => {
                              handleDebitNoteClick(bill, data);
                            }}
                            color="blue"
                            style={{ fontSize: 18, cursor: "pointer" }}
                          />
                        </>
                      )}
                    </Flex>
                  </td>
                  
                  {/* Bill Payment checkbox selection  */}
                  <td>
                    {!bill?.is_paid && (
                      <Checkbox
                        checked={isBillChecked}
                        onChange={(event) => {
                          handleBillSelection(event, bill);
                        }}
                      />
                    )}
                  </td>
                  
                  {/* Bill Interest payment checkbox selection  */}
                  <td>
                    {bill?.interest_paid_date == null &&
                      CalculateInterest(dueDays, bill?.amount) !== 0 && (
                        <Checkbox
                          checked={isChecked}
                          onChange={(event) => {
                            handleInterestCheckboxSelection(event, bill);
                          }}
                        />
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

      {/* {debitorBillModal?.isModalOpen && (
        <ViewDebitorBill
          MODE={"VIEW"}
          details={debitorBillModal?.details}
          handleCloseModal={handleCloseModal}
          isModelOpen={debitorBillModal?.isModalOpen}
          selectedInterestBill = {selectedInterestBill}
        />
      )} */}

      {/* yarn_sale_bills */}
      {debitorBillModal?.isModalOpen &&
        debitorBillModal.model === BILL_MODEL.yarn_sale_bills && (
          <PrintYarnSaleChallan
            details={debitorBillModal.details}
            isEyeButton={false}
            open={debitorBillModal?.isModalOpen}
            close={handleCloseModal}
          />
        )}

      {/* beam_sale_bill */}
      {debitorBillModal?.isModalOpen &&
        debitorBillModal.model === BILL_MODEL.beam_sale_bill && (
          <PrintBeamSaleChallan
            details={debitorBillModal.details}
            isEyeButton={false}
            open={debitorBillModal?.isModalOpen}
            close={handleCloseModal}
          />
        )}

      {/* sale_bills */}
      {debitorBillModal?.isModalOpen &&
        debitorBillModal.model === BILL_MODEL.sale_bills && (
          <SaleBillComp
            details={debitorBillModal.details}
            MODE={debitorBillModal.mode}
            isModelOpen={debitorBillModal?.isModalOpen}
            handleCloseModal={handleCloseModal}
          />
        )}

      {/* job_work_bills */}
      {debitorBillModal?.isModalOpen &&
        debitorBillModal.model === BILL_MODEL.job_work_bills && (
          <PrintJobWorkChallan
            details={debitorBillModal.details}
            isEyeButton={false}
            open={debitorBillModal?.isModalOpen}
            close={handleCloseModal}
          />
        )}

      {debitorBillModal?.isModalOpen &&
        debitorBillModal.model === BILL_MODEL.job_gray_sale_bill && (
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
