import {
  Button,
  Checkbox,
  DatePicker,
  Empty,
  Flex,
  Select,
  Space,
  Spin,
  Tooltip,
  Typography,
} from "antd";
import { useContext, useEffect, useMemo, useState } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import dayjs from "dayjs";
import { getSupplierListRequest } from "../../../api/requests/users";
import { useQuery } from "@tanstack/react-query";
import { EyeOutlined, FilePdfOutlined, TabletFilled } from "@ant-design/icons";
import useDebounce from "../../../hooks/useDebounce";
import { getSundryCreditorService } from "../../../api/requests/accounts/sundryCreditor";
import PaymentModal from "../../../components/accounts/groupWiseOutStanding/sundryCreditor/PaymentModal";
import ViewDebitNoteModal from "../../../components/accounts/groupWiseOutStanding/sundryCreditor/ViewDebitNoteModal";
import ViewCreditNoteModal from "../../../components/accounts/groupWiseOutStanding/sundryCreditor/ViewCreditNoteModal";

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

const SundryCreditor = () => {
  const { company, companyId } = useContext(GlobalContext);

  const [isCash, setIsCash] = useState(false);
  const [isOnlyDues, setIsOnlyDues] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [supplier, setSupplier] = useState(null);
  const [orderType, setOrderType] = useState(null);

  const debounceIsCash = useDebounce(isCash, 500);
  const debounceIsOnlyDues = useDebounce(isOnlyDues, 500);
  const debounceFromDate = useDebounce(fromDate, 500);
  const debounceToDate = useDebounce(toDate, 500);
  const debounceSupplier = useDebounce(supplier, 500);
  const debounceOrderType = useDebounce(orderType, 500);

  const [selectedRecords, setSelectedRecords] = useState([]);
  
  // Bill Information // 
  const [billModel, setBillModel] = useState(false) ; 
  const [billInformation, setBillInformation] = useState(undefined) ; 
  const [billLayout, setBillLayout] = useState(false) ; 

  const storeRecord = (e, record) => {
    if (e.target.checked) {
      setSelectedRecords((prev) => {
        return [...prev, record?.bill_id];
      });
    } else {
      setSelectedRecords((prev) => {
        return [...prev.filter((billId) => billId !== record?.bill_id)]; // Remove the record from the array
      });
    }
  };

  useEffect(() => {
    const currentYear = dayjs().year();

    // Set the From Date to April 1st of the current year
    const calculatedFromDate = dayjs(`${currentYear}-04-01`);

    // Set the To Date to March 31st of the next year
    const calculatedToDate = dayjs(`${currentYear + 1}-03-31`);

    setFromDate(calculatedFromDate);
    setToDate(calculatedToDate);
  }, []);

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

  // ============ Sundary Credit note related information ===========================//
  const [initialCreditorData, setInitialCreditorData] = useState([]) ; 
  const [creditNoteList, setCreditNoteList] = useState([]) ; 

  const { data: sundryCreditorData, isFetching: isLoadingSundryDebtor } =
    useQuery({
      queryKey: [
        "sundry",
        "creditor",
        "data",
        {
          // is_cash: debounceIsCash,
          // is_only_dues: debounceIsOnlyDues,
          from_date: dayjs(debounceFromDate).format("YYYY-MM-DD"),
          to_date: dayjs(debounceToDate).format("YYYY-MM-DD"),
          // supplier: debounceSupplier,
          // order_type: debounceOrderType,
        },
      ],
      queryFn: async () => {
        const params = {
          company_id: companyId,
          // is_cash: debounceIsCash,
          // is_only_dues: debounceIsOnlyDues,
          from_date: dayjs(debounceFromDate).format("YYYY-MM-DD"),
          to_date: dayjs(debounceToDate).format("YYYY-MM-DD"),
          // supplier: debounceSupplier,
          // order_type: debounceOrderType,
        };
        const res = await getSundryCreditorService({ params });
        return res.data?.data;
      },
    enabled: Boolean(companyId),
  });

  useEffect(() => {
    setInitialCreditorData(sundryCreditorData) ; 
    setCreditNoteList(sundryCreditorData) ; 
  },[sundryCreditorData])

  // ======== Bill selection related option handler ======== // 

  useEffect(() => {
    if (orderType == null || orderType == undefined){
      setCreditNoteList(initialCreditorData) ; 
    } else {
      let selection_model = null ; 
      if (orderType == "purchase"){
        selection_model = "purchase_taka_bills" ; 
      } else if (orderType == "job"){
        selection_model = "job_taka_bills" ; 
      } else if (orderType == "yarn"){
        selection_model = "yarn_bills" ; 
      } else if (orderType == "bill_of_size_beam"){
        selection_model = "receive_size_beam_bill"
      } else if (orderType == "expenses"){
        selection_model = "general_purchase_entries"
      } else if (orderType == "rework") { 
        selection_model = "job_rework_bill" ; 
      }
      const temp = initialCreditorData?.map((element) => {
        const temp_bill = element?.bills?.filter((bill) => {
          return bill?.model == selection_model ; 
        })
        return {
          ...element, 
          bills: temp_bill?.length > 0 ?temp_bill:[]
        }
      })
      setCreditNoteList(temp) ; 
    }
    
  }, [orderType])


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
      bill_id
    } ; 
    let response ; 
    switch (selectedBillData?.model){
      case "yarn_bills":
        response = await getYarnReceiveBillByIdRequest({
          id : selectedBillData?.bill_id, 
          params: {company_id: companyId}
        }); 
        setBillInformation(response?.data?.yarnReciveBill) ; 
        setBillLayout(true) ; 
        setBillModel(selectedBillData?.model) ;
        return response?.data?.data ; 
    }
  }

  // ========== Debit note information model ============= // 
  const [debitNoteModelOpen, setDebitNoteModelOpen] = useState(false) ; 
  const [debitNoteSelection, setDebitNoteSelection] = useState([]) ; 
  const [debitNoteModelData, setDebitNoteModelData] = useState(undefined) ; 

  // ========= Credit note information model =============== // 
  const [creditNoteMoelOpen, setCreditNoteModelOpen] = useState(false) ; 
  const [creditNoteSelection, setCreditNoteSelection] = useState([]) ; 
  const [creditNoteModelData, setCreditNoteModelData] = useState(undefined) ;

  return (
    <>
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-5 mx-3 mb-3">
          <div className="flex items-center gap-2">
            <h3 className="m-0 text-primary">Sundry Creditors</h3>
          </div>

          <Flex gap={10} align="center" style={{ marginLeft: "auto" }}>
            <Checkbox
              value={isCash}
              onChange={(e) => setIsCash(e.target.checked)}
            >
              Cash
            </Checkbox>
            <Checkbox
              value={isOnlyDues}
              onChange={(e) => setIsOnlyDues(e.target.checked)}
            >
              Only Dues
            </Checkbox>
            <Button
              icon={<FilePdfOutlined />}
              type="primary"
              // disabled={!paymentList?.rows?.length}
              // onClick={downloadPdf}
              className="flex-none"
            />
            <Button type="primary" className="flex-none">
              Summary
            </Button>
            <Button type="primary" className="flex-none">
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
            <Button type="primary" className="flex-none">
              GEN. CREDIT NOTE
            </Button>
          ) : null}

        <Flex>
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

            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                From
              </Typography.Text>
              <DatePicker value={fromDate} onChange={setFromDate} />
            </Flex>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">To</Typography.Text>
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
          // cellSpacing={0}
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
              <th>Due Day</th>
              <th style={{ width: "105px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {sundryCreditorData ? (
              sundryCreditorData?.map((data, index) => (
                <TableWithAccordion
                  key={index}
                  data={data}
                  company={company}
                  selectedRecords={selectedRecords}
                  storeRecord={storeRecord}
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

              <tr className="sundary-total" style={{ backgroundColor: "white" }}>
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

      {billLayout ? (
        <>
          {billModel === "yarn_bills" ? (
            <ViewYarnReceiveChallan 
              details={billInformation} 
              isOpen = {billLayout}
              setLayout = {setBillLayout}
            />
          ) : null}
        </>
      ) : null}

      {debitNoteModelOpen && (
        <SundaryDebitNoteGenerate
          open={debitNoteModelOpen}
          setOpen={setDebitNoteModelOpen}
          bill_details={debitNoteSelection}
          debiteNoteData={debitNoteModelData}
          setDebitNoteSelection={setDebitNoteSelection}
        />
      )}
      
      {creditNoteMoelOpen && (
        <SunadryCreditNoteGenerate
          open={creditNoteMoelOpen}
          setOpen={setCreditNoteModelOpen}
          bill_details={creditNoteSelection}
          debiteNoteData={setCreditNoteSelection}
          setDebitNoteSelection={setCreditNoteModelData}
        />
      )}

      

    </>
  );
};

export default SundryCreditor;

const TableWithAccordion = ({
  data,
  company,
  selectedRecords,
  storeRecord,
}) => {
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

  const [creditorBillModal, setCreditorBillModal] = useState({
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

      setCreditorBillModal({
        isModalOpen: true,
        details: details,
        mode: "VIEW",
        model: bill.model,
      });
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
        <td></td>
        <td colSpan={2}>{String(data?.first_name + " " + data?.last_name).toUpperCase()}</td>
        <td colSpan={4}>{String(data?.address || "").toUpperCase()}</td>
        <td></td>
        <td></td>
        <td>
          <Button type="text">{isAccordionOpen ? "▼" : "►"}</Button>
        </td>
      </tr>

      {/* Accordion Content Rows (conditionally rendered) */}
      {isAccordionOpen === data.id && (
        <>
          {data && data?.bills?.length ? (
            data?.bills?.map((bill, index) => {
              const isChecked = selectedRecords?.includes(bill?.bill_id);
              const dueDate = bill?.due_date == null?
                bill?.model == "purchase_taka_bills"?generatePurchaseBillDueDate(bill?.bill_date):
                generateJobBillDueDate(bill?.bill_date)
              :moment(bill?.due_date).format("DD-MM-YYYY") ;
              const dueDays = calculateDaysDifference(dueDate) ; 
              const interestAmount = CalculateInterest(dueDays, bill?.amount) ; 
              
              const paid_amount = +bill?.paid_amount; 
              const debit_note_amount = +bill?.debit_note_net_amount ; 
              const bill_amount = +bill?.amount ; 

              const net_amount = bill_amount - debit_note_amount - paid_amount ; 

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
                  <td>{dayjs(bill?.bill_date).format("DD-MM-YYYY")}</td>
                  <td>
                    <div>
                      {bill?.bill_no || ""}
                      {bill?.debit_note_id !== null && (
                        <div style={{
                          fontSize: 12, 
                          color: "red", 
                          cursor: "pointer"
                        }}>
                          <Tooltip title = {`DEBIT NOTE - ${bill?.debit_note_number}`}>
                            ( {bill?.debit_note_number} )
                          </Tooltip>
                        </div>
                      )}
                      {bill?.credit_note_id !== null && (
                        <div style={{
                          fontSize: 12,
                          color: "green", 
                          cursor: "pointer"
                        }}>
                          <Tooltip title = {`CRDIT NOTE - ${bill?.credit_note_number}`}>
                            ( {bill?.credit_note_number} )
                          </Tooltip>
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{
                    fontWeight: 600
                  }}>
                    {bill?.model === "job_taka_bills" ? "JOB TAKA" :
                    bill?.model === "receive_size_beam_bill" ? "SIZE BEAM" :
                    bill?.model === "yarn_bills" ? "YARN BILL" :
                    bill?.model === "general_purchase_entries" ? "GENERAL PURCHASE" :
                    bill?.model === "purchase_taka_bills" ? "PURCHASE TAKA" :
                    bill?.model === "job_rework_bill" ? "REWORK BILL" : ""}
                  </td>
                  <td>{bill?.taka || 0}</td>

                  <td>{bill?.meters || 0}</td>
                  <td>{bill?.amount || 0}</td>
                  <td>{calculateDueDays(bill?.createdAt, bill?.due_days)}</td>
                  {/* <td></td> */}
                  <td>
                    <Space>
                      <Button type="primary">
                        <EyeOutlined />
                      </Button>
                      
                      {bill?.credit_note_id == null?<>
                        <Button
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Checkbox
                            checked={
                              selectedRecords?.includes(bill?.bill_id) || false
                            }
                            onChange={(e) => storeRecord(e, bill)}
                          />
                        </Button>
                      </>:<>
                        <TabletFilled style={{color: "blue"}}
                          onClick={() => {
                            handleCreditNoteClick(bill, data) ;
                          }}
                        /> 
                      </>}

                      {bill?.debit_note_id !== null && (
                        <>
                          <TabletFilled 
                            style={{color: "gray"}} 
                            onClick={() => {
                              handleDebitNoteClick(bill, data)
                            }}/>
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
                <Empty
                  description = {"No bills found"}
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
        <td>
          <b>{TOTAL?.meter}</b>
        </td>
        <td>
          <b>{TOTAL?.amount}</b>
        </td>
        <td></td>
        <td></td>
      </tr>

      {creditorBillModal?.isModalOpen &&
        creditorBillModal.model === BILL_MODEL.yarn_bills && (
          <ViewYarnReceiveChallan
            details={creditorBillModal.details}
            isEyeButton={false}
            open={creditorBillModal?.isModalOpen}
            close={handleCloseModal}
          />
        )}

      {creditorBillModal?.isModalOpen &&
        creditorBillModal.model === BILL_MODEL.receive_size_beam_bill && (
          <SizeBeamChallanModal
            details={creditorBillModal.details}
            mode={creditorBillModal.mode}
            isEyeButton={false}
            open={creditorBillModal?.isModalOpen}
            close={handleCloseModal}
          />
        )}

      {creditorBillModal?.isModalOpen &&
        creditorBillModal.model === BILL_MODEL.purchase_taka_bills && (
          <ViewPurchaseChallanInfo
            details={creditorBillModal?.details}
            isEyeButton={false}
            open={creditorBillModal?.isModalOpen}
            close={handleCloseModal}
          />
        )}

      {creditorBillModal?.isModalOpen &&
        creditorBillModal.model === BILL_MODEL.job_taka_bills && (
          <ViewJobTakaInfo
            details={creditorBillModal?.details}
            isEyeButton={false}
            open={creditorBillModal?.isModalOpen}
            close={handleCloseModal}
          />
        )}

      {creditorBillModal?.isModalOpen &&
        creditorBillModal.model === BILL_MODEL.job_rework_bill && (
          <ViewReworkChallanInfo
            details={creditorBillModal?.details}
            isEyeButton={false}
            open={creditorBillModal?.isModalOpen}
            close={handleCloseModal}
          />
        )}
    </>
  );
};
