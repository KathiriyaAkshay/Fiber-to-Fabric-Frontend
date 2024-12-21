import {
  Button,
  Checkbox,
  DatePicker,
  Flex,
  Select,
  Space,
  Spin,
  Typography,
} from "antd";
import { useContext, useEffect, useMemo, useState } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import dayjs from "dayjs";
import { getSupplierListRequest } from "../../../api/requests/users";
import { useQuery } from "@tanstack/react-query";
import { EyeOutlined, FilePdfOutlined } from "@ant-design/icons";
import useDebounce from "../../../hooks/useDebounce";
import { getSundryCreditorService } from "../../../api/requests/accounts/sundryCreditor";
import PaymentModal from "../../../components/accounts/groupWiseOutStanding/sundryCreditor/PaymentModal";
import ViewDebitNoteModal from "../../../components/accounts/groupWiseOutStanding/sundryCreditor/ViewDebitNoteModal";
import ViewCreditNoteModal from "../../../components/accounts/groupWiseOutStanding/sundryCreditor/ViewCreditNoteModal";

// ======= Yarn receive challan model ========//
import { getYarnReceiveBillByIdRequest } from "../../../api/requests/purchase/yarnReceive";
import ViewYarnReceiveChallan from "../../../components/purchase/receive/yarnReceive/ViewYarnReceiveChallanModal";

const orderTypeOptions = [
  { label: "Purchase", value: "purchase" },
  { label: "Job", value: "job" },
  { label: "Yarn", value: "yarn" },
  { label: "Bill of size beam", value: "bill_of_size_beam" },
  { label: "Expenses", value: "expenses" },
  { label: "Rework", value: "rework" },
];

const calculateDueDays = (createdAt, dueDate) => {
  const startDate = dayjs(createdAt);
  const endDate = dayjs(dueDate);

  // Calculate the difference in days
  const dueDays = endDate.diff(startDate, "day");

  return dueDays;
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

  const { data: sundryCreditorData, isFetching: isLoadingSundryDebtor } =
    useQuery({
      queryKey: [
        "sundry",
        "creditor",
        "data",
        {
          is_cash: debounceIsCash,
          is_only_dues: debounceIsOnlyDues,
          from_date: dayjs(debounceFromDate).format("YYYY-MM-DD"),
          to_date: dayjs(debounceToDate).format("YYYY-MM-DD"),
          supplier: debounceSupplier,
          order_type: debounceOrderType,
        },
      ],
      queryFn: async () => {
        const params = {
          company_id: companyId,
          is_cash: debounceIsCash,
          is_only_dues: debounceIsOnlyDues,
          from_date: dayjs(debounceFromDate).format("YYYY-MM-DD"),
          to_date: dayjs(debounceToDate).format("YYYY-MM-DD"),
          supplier: debounceSupplier,
          order_type: debounceOrderType,
        };
        const res = await getSundryCreditorService({ params });
        return res.data?.data;
      },
      enabled: Boolean(companyId),
    });

  const grandTotal = useMemo(() => {
    if (sundryCreditorData && sundryCreditorData?.length) {
      let meters = 0;
      let billAmount = 0;

      sundryCreditorData?.forEach((item) => {
        item?.bills?.forEach((bill) => {
          meters += bill?.meters;
          billAmount += bill?.amount;
        });
      });

      return { meters, bill_amount: billAmount };
    } else {
      return { meters: 0, bill_amount: 0 };
    }
  }, [sundryCreditorData]);

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
                    ReteriveBillInformation = {async(model, bill_id) => {
                      console.log("Run this");
                      
                      await ReteriveBillInformation(model, bill_id)
                    } }
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

    </>
  );
};

export default SundryCreditor;

const TableWithAccordion = ({
  data,
  company,
  selectedRecords,
  storeRecord,
  ReteriveBillInformation
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
                  <td>{dayjs(bill?.createdAt).format("DD-MM-YYYY")}</td>
                  <td>{bill?.bill_no || ""}</td>
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
                      
                      <Button type="primary"
                        onClick={async () => {
                          console.log("Run this function");
                          
                          await ReteriveBillInformation(bill?.model, bill?.bill_id)
                        }}>
                        <EyeOutlined />
                      </Button>

                      <PaymentModal />
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
                      {/* Credit note */}
                      <ViewCreditNoteModal />
                      {/* Debit note */}
                      <ViewDebitNoteModal />
                    </Space>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={12} style={{ textAlign: "center" }}>
                No data found
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
    </>
  );
};
