import {
  Button,
  Checkbox,
  DatePicker,
  Empty,
  Flex,
  Input,
  Radio,
  Select,
  Spin,
  Tooltip,
  Typography,
  message
} from "antd";
import { useContext, useEffect, useMemo, useState } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import dayjs from "dayjs";
import { getBrokerListRequest } from "../../../api/requests/users";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckOutlined, EyeOutlined, FilePdfOutlined } from "@ant-design/icons";
import { getSundryDebtorsService, paidInterestRequest } from "../../../api/requests/accounts/sundryDebtors";
import { Link } from "react-router-dom";
import useDebounce from "../../../hooks/useDebounce";
import DebitorNotesModal from "../../../components/accounts/groupWiseOutStanding/sundryDebitor/DebitorNotesModal";
import ViewDebitorBill from "../../../components/accounts/groupWiseOutStanding/sundryDebitor/ViewDebitorBill";
import moment from "moment";
import InterestPaymentModal from "../../../components/accounts/groupWiseOutStanding/sundryDebitor/InterestPaymentModel";
import { useMutation } from "@tanstack/react-query";
import BillPaymentModel from "../../../components/accounts/groupWiseOutStanding/sundryDebitor/billPaymentModel";
import { SnippetsOutlined } from "@ant-design/icons";

function calculateDaysDifference(dueDate) {
  const today = new Date(); // Get today's date
  const [day, month, year] = dueDate.split('-');
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
  { label: "30+ days", value: "30_days" },
  { label: "45+ days", value: "45_days" },
  { label: "60+ days", value: "60_days" },
  { label: "90+ days", value: "90_days" },
];

const calculateDueDays = (createdAt, dueDate) => {
  const startDate = dayjs(createdAt);
  const endDate = dayjs(dueDate);

  // Calculate the difference in days
  const dueDays = endDate.diff(startDate, "day");

  return dueDays;
};

const SundryDebitor = () => {
  const { company, companyId } = useContext(GlobalContext);
  const queryClient = useQueryClient() ; 

  const [sundryDebitorType, setSundryDebitorType] = useState("all");
  const [isCash, setIsCash] = useState(false);
  const [isPaymentDue, setIsPaymentDue] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [billNo, setBillNo] = useState("");
  const [broker, setBroker] = useState(null);
  const [selection, setSelection] = useState("show_all_bills");
  // const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  const debounceSundryDebitorType = useDebounce(sundryDebitorType, 500);
  const debounceIsCash = useDebounce(isCash, 500);
  const debounceIsPaymentDue = useDebounce(isPaymentDue, 500);
  const debounceFromDate = useDebounce(fromDate, 500);
  const debounceToDate = useDebounce(toDate, 500);
  const debounceBillNo = useDebounce(billNo, 500);
  const debounceBroker = useDebounce(broker, 500);
  const debounceSelection = useDebounce(selection, 500);

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

  const { data: sundryDebtorData, isFetching: isLoadingSundryDebtor } =
    useQuery({
      queryKey: [
        "sundry",
        "debtor",
        "data",
        {
          is_cash: debounceIsCash,
          is_payment_due: debounceIsPaymentDue,
          from_date: dayjs(debounceFromDate).format("YYYY-MM-DD"),
          to_date: dayjs(debounceToDate).format("YYYY-MM-DD"),
          broker: debounceBroker,
          bill_no: debounceBillNo,
          sundry_debitor_type: debounceSundryDebitorType,
          number_of_bills: debounceSelection,
        },
      ],
      queryFn: async () => {
        const params = {
          company_id: companyId,
          is_cash: debounceIsCash,
          is_payment_due: debounceIsPaymentDue,
          from_date: dayjs(debounceFromDate).format("YYYY-MM-DD"),
          to_date: dayjs(debounceToDate).format("YYYY-MM-DD"),
          broker: debounceBroker,
          bill_no: debounceBillNo,
          sundry_debitor_type: debounceSundryDebitorType,
          number_of_bills: debounceSelection,
        };
        const res = await getSundryDebtorsService({ params });
        return res.data?.data;
      },
      enabled: Boolean(companyId),
    });

  const grandTotal = useMemo(() => {
    if (sundryDebtorData && sundryDebtorData?.length) {
      let meter = 0;
      let billAmount = 0;

      sundryDebtorData?.forEach((item) => {
        item?.bills?.forEach((bill) => {
          meter += +bill?.meter;
          billAmount += +bill?.amount;
        });
      });

      return { meter, bill_amount: billAmount };
    } else {
      return { meter: 0, bill_amount: 0 };
    }
  }, [sundryDebtorData]);

  // Interest Payment selection related functionality // 
  const [selectedInterestBill, setSelectedInterestBill] = useState([]) ; 
  const [totalInterestAmount, setTotalInterestAmount] = useState(0) ; 
  const [interestPaymentModalOpen, setPaymentInterestModalOpen] = useState(false) ; 

  useEffect(() => {
    if (selectedInterestBill?.length > 0){
      let totalInterest = 0; 
      selectedInterestBill?.map((bill) => {
        let dueDate= moment(bill?.due_days).format("DD-MM-YYYY") ; 
        let dueDays = isNaN(calculateDaysDifference(dueDate))?0:calculateDaysDifference(dueDate) ; 
        let interestAmount = CalculateInterest(dueDays, bill?.amount) ; 
        totalInterest += +interestAmount || 0 ; 
      })
      setTotalInterestAmount(totalInterest) ; 
    }
  }, [selectedInterestBill])

  const handleInterestCheckboxSelection = (event, bill) => {
    const { checked } = event.target;
  
    setSelectedInterestBill((prev) => {
      if (checked) {
        // Add the selected bill to the array
        return [...prev, bill];
      } else {
        // Filter out the unselected bill
        return prev.filter(
          (item) => item?.bill_id !== bill?.bill_id || item?.model !== bill?.model
        );
      }
    });
  };

  const { mutateAsync: addInterestAmount, isPending: isInterestPending } = useMutation({
    mutationFn: async ({ data }) => {
      console.log(data);
      
      const res = await paidInterestRequest({
        data: data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["account", "group-wise-outstanding", "debiter", 'sundry'],
    onSuccess: (res) => {
      queryClient.invalidateQueries(["sundry", "debtor", "data"]);
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      setPaymentInterestModalOpen(false) ; 
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(errorMessage);
    },
  });

  const PaidInterestAmount = async (amount, due_date) => {
    let requestPayload = [] ; 

    selectedInterestBill?.map((element) => {
      requestPayload.push({
        "interest_amount": +amount,
        "interest_paid_date": moment(due_date).format("YYYY-MM-DD"),
        "model": element?.model,
        "bill_id": element?.bill_id
      })
    })

    await addInterestAmount({data:requestPayload})
  }

  // Bill Payment selection handler 
  const [selectedBill, setSelectedBill] = useState([]);
  const [totalBillAmount, setTotalBillAmount] = useState(undefined) ; 
  const [billModelOpen, setBillModelOpen] = useState(false);

  useEffect(() => {
    if (selectedBill?.length > 0){
      let totalAmount = 0 ; 
      selectedBill?.map((bill) => {
        let total_amount = parseFloat(+bill?.amount).toFixed(2) || 0 ; 
        let credit_note_amount = parseFloat(+bill?.credit_note_amount).toFixed(2) || 0  ; 
        let paid_amount = parseFloat(+bill?.paid_amount).toFixed(2) || 0 ;

        let finalAmount = total_amount - paid_amount - credit_note_amount;
        finalAmount = parseFloat(finalAmount).toFixed(2) ; 

        totalAmount += +finalAmount ; 
        
      })
      setTotalBillAmount(totalAmount) ; 
    }
  },[selectedBill]) ; 

  const handleBillSelection  = (event, bill) => {
    const { checked } = event.target;
    setSelectedBill((prev) => {
      if (checked) {
        // Add the selected bill to the array
        return [...prev, bill];
      } else {
        // Filter out the unselected bill
        return prev.filter(
          (item) => item?.bill_id !== bill?.bill_id || item?.model !== bill?.model
        );
      }
    });
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

        {selectedInterestBill?.length > 0 && (
          <Flex style={{gap: 5}}>
            <div style={{
              marginTop: "auto", 
              marginBottom: "auto", 
              textAlign: "center"
            }}> Total Interest :{parseFloat(totalInterestAmount).toFixed(2)}</div>
            <Button type="primary" onClick={() => {
              setPaymentInterestModalOpen(true  )
            }}>
              GET CASH INTEREST
            </Button>
          </Flex>
        )}

        {selectedBill?.length > 0 && (
          <Flex style={{gap: 5}}>
            <div style={{
              marginTop: "auto", 
              marginBottom: "auto", 
              textAlign: "center"
            }}>
                Total Amount: {totalBillAmount}
            </div>
            <Button type="primary" onClick={() => {
              setBillModelOpen(true)
            }}>
              PAID AMOUNT
            </Button>
          </Flex>
        )}

        <Flex align="center" gap={10}>
          <Typography.Text className="whitespace-nowrap">Find</Typography.Text>
          <Input
            value={billNo}
            onChange={(e) => setBillNo(e.target.value)}
            placeholder="Bill No./Party Name"
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
          // disabled={!paymentList?.rows?.length}
          // onClick={downloadPdf}
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
              <th style={{
                width: "60px"
              }}>Debit Note</th>
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
            {sundryDebtorData ? (
              sundryDebtorData?.map((data, index) => (
                <TableWithAccordion 
                  key={index} 
                  data={data} 
                  company={company} 
                  handleInterestCheckboxSelection = {(event, bill) => {
                    handleInterestCheckboxSelection(event, bill)
                  }}
                  selectedInterestBill = {selectedInterestBill}
                  selectedBill={selectedBill}
                  handleBillSelection = {(event, bill) => {
                    handleBillSelection(event, bill) ; 
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
              <td>
                <b>{grandTotal?.meter}</b>
              </td>
              <td>
                <b>{grandTotal?.bill_amount}</b>
              </td>
              <td></td>
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
          visible = {interestPaymentModalOpen}
          onCancel={() => {setPaymentInterestModalOpen(false); setSelectedInterestBill([]) ; }}
          selectedInterestBill = {selectedInterestBill}
          onConfirm = {async (amount, date) => {
            PaidInterestAmount(amount, date)
          }}
        />
      )}

      {billModelOpen && (
        <BillPaymentModel
          visible={billModelOpen}
          selectedBill = {selectedBill}
          onClose={() => {
            setBillModelOpen(false); 
            setSelectedBill([]) ; 
          }}
        />
      )}
    </div>
  );
};

export default SundryDebitor;

const TableWithAccordion = ({ data, company, handleInterestCheckboxSelection,selectedInterestBill, selectedBill, handleBillSelection }) => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(null);

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
  });
  const handleCloseModal = () => {
    setDebitorBillModal((prev) => ({
      ...prev,
      isModalOpen: false,
      mode: "",
    }));
  };

  const TOTAL = useMemo(() => {
    if (data && data?.bills && data?.bills?.length) {
      let meter = 0;
      let amount = 0;
      data?.bills?.forEach((item) => {
        meter += +item?.meter || 0;
        amount += +item?.amount || 0;
      });

      return { meter, amount };
    } else {
      return { meter: 0, amount: 0 };
    }
  }, [data]);

  return (
    <>
      <tr
        style={{ cursor: "pointer", backgroundColor: "#f0f0f0" }}
        onClick={toggleAccordion}
        className="sundary-header"
      >
        <td></td>
        <td colSpan={3}>{String(data?.first_name + " " + data?.last_name).toUpperCase()}</td>
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
          {/* <Button
            // style={{ backgroundColor: "green", color: "#fff" }}
            icon={<FileSyncOutlined />}
          /> */}
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
              
              let dueDate= moment(bill?.due_days).format("DD-MM-YYYY") ; 
              let dueDays = isNaN(calculateDaysDifference(dueDate))?0:calculateDaysDifference(dueDate) ; 
              let model = bill?.model == "sale_bills" ? "SALE BILL" :
                bill?.model == "yarn_sale_bills" ? "YARN SALE" :
                bill?.model == "job_gray_sale_bill" ? "JOB GRAY SALE" :
                bill?.model == "beam_sale_bill" ? "BEAM SALE" :
                bill?.model == "credit_notes" ? "CREDIT NOTE" : "" ; 
              let isChecked = selectedInterestBill?.filter((item) => item?.bill_id == bill?.bill_id && item?.model == bill?.model)?.length > 0?true:false ; 
              let isBillChecked = selectedBill?.filter((item) => item?.bill_id == bill?.bill_id && item?.model == bill?.model)?.length > 0?true:false ; 

              let is_paid = bill?.is_paid == null?false:bill?.is_paid == 0?false:true
              let total_amount = parseFloat(+bill?.amount).toFixed(2) || 0 ; 
              let credit_note_amount = parseFloat(+bill?.credit_note_amount).toFixed(2) || 0  ; 
              let paid_amount = parseFloat(+bill?.paid_amount).toFixed(2) || 0 ;

              let finalAmount = total_amount - paid_amount - credit_note_amount;

              // Interest amount 
              let interestAmount = CalculateInterest(dueDays, bill?.amount) ; 


              return (
                <tr key={index + "_bill"} className="sundary-data">
                  <td></td>
                  
                  <td style={{
                    fontWeight: 600
                  }}>{dayjs(bill?.createdAt).format("DD-MM-YYYY")}</td>
                  
                  <td style={{
                    color: bill?.model == "credit_notes" ? "blue" : "#000"
                  }}>{bill?.bill_no || ""}</td>
                  
                  <td>{model}</td>
                  
                  <td>{company?.company_name || ""}</td>
                  
                  <td>{bill?.model == "credit_notes" ? "-" : bill?.taka || "-"}</td>
                  
                  <td>{bill?.model == "credit_notes" ? "-" : bill?.meter || "-"}</td>
                  
                  <td>
                    <Tooltip
                      title={`${total_amount} - ${credit_note_amount} - ${paid_amount} = ${parseFloat(finalAmount).toFixed(2)}`}
                    >
                      {parseFloat(finalAmount).toFixed(2) || 0}
                    </Tooltip>
                  </td>
                  
                  <td style={{
                    color: +dueDays != 0?"red":"#000", 
                    fontWeight: 600
                  }}>{dueDays <= 0?0:`+${dueDays}` || 0}</td>

                  <td>
                    {bill?.model == "credit_notes"?<>
                      <div>
                        ---
                      </div>
                    </>:<>
                      {bill?.interest_paid_date !== null && (
                        <>
                          
                          <div>
                            0 <span style={{
                              color: "green", 
                              fontWeight: 600
                            }}>( Received )</span>
                          </div>

                          <div style={{fontSize: 12}}>
                            {moment(bill?.interest_paid_date).format("DD-MM-YYYY")}
                          </div>
                        </>
                      )}
                      {bill?.interest_paid_date == null && (
                        <>
                          {CalculateInterest(dueDays, bill?.amount)}
                        </>
                      )}
                    </>}
                  </td>
                  
                  <td>
                    <Flex style={{
                      gap: 5
                    }}>
                      <Button
                        type="primary"
                        onClick={() => {
                          setDebitorBillModal({
                            isModalOpen: true,
                            details: null,
                            mode: "VIEW",
                          });
                        }}
                      >
                        <EyeOutlined />
                      </Button>

                      <Button type="primary">
                        <SnippetsOutlined/>
                      </Button>
                    </Flex>
                  </td>
                  
                  <td>
                    {!bill?.is_paid && (
                      <Checkbox
                        checked = {isBillChecked}
                        onChange={(event) => {
                          handleBillSelection(event, bill);
                        }}
                      />
                    )}
                  </td>
                  
                  <td>
                    {bill?.interest_paid_date == null && CalculateInterest(dueDays, bill?.amount) !== 0  && (
                      <Checkbox
                        checked = {isChecked}
                        onChange={(event) => {
                          handleInterestCheckboxSelection(event, bill)
                        }}
                      />
                    )}
                  </td>
                </tr>
              )
            })
          ) : (
            <tr>
              <td colSpan={13} style={{ textAlign: "center" }}>
                <Empty
                  description = "No Bill Found"
                  style={{
                    paddingTop: 10,
                    paddingBottom: 10
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
        <td>
          {/* <b>{TOTAL?.meter}</b> */}
        </td>
        <td>
          <b>{TOTAL?.meter}</b>
        </td>
        <td style={{
          fontWeight: 600
        }}>
          {TOTAL?.amount}
        </td>
        {/* <td>
          <b>0</b>
        </td> */}
        <td></td>
        <td></td>
        <td></td>
      </tr>

      {debitorBillModal?.isModalOpen && (
        <ViewDebitorBill
          MODE={"VIEW"}
          details={debitorBillModal?.details}
          handleCloseModal={handleCloseModal}
          isModelOpen={debitorBillModal?.isModalOpen}
          selectedInterestBill = {selectedInterestBill}
        />
      )}
    </>
  );
};
