import {
  Button,
  Checkbox,
  DatePicker,
  Flex,
  Input,
  Radio,
  Select,
  Spin,
  Typography,
} from "antd";
import { useContext, useEffect, useMemo, useState } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import dayjs from "dayjs";
import { getBrokerListRequest } from "../../../api/requests/users";
import { useQuery } from "@tanstack/react-query";
import { CheckOutlined, EyeOutlined, FilePdfOutlined } from "@ant-design/icons";
import { getSundryDebtorsService } from "../../../api/requests/accounts/sundryDebtors";
import { Link } from "react-router-dom";
import useDebounce from "../../../hooks/useDebounce";
import DebitorNotesModal from "../../../components/accounts/groupWiseOutStanding/sundryDebitor/DebitorNotesModal";
import ViewDebitorBill from "../../../components/accounts/groupWiseOutStanding/sundryDebitor/ViewDebitorBill";

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

        {/* <Flex align="center" gap={10}>
          <Typography.Text className="whitespace-nowrap">
            Company
          </Typography.Text>
          <Select
            allowClear
            placeholder="Select company"
            dropdownStyle={{
              textTransform: "capitalize",
            }}
            style={{
              textTransform: "capitalize",
            }}
            className="min-w-40"
            value={selectedCompanyId}
            onChange={(selectedValue) => setSelectedCompanyId(selectedValue)}
            options={
              companyListRes &&
              companyListRes?.rows?.map((company) => {
                return {
                  label: company?.company_name,
                  value: company?.id,
                };
              })
            }
          />
        </Flex> */}

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
              <th>Debit Note</th>
              <th>Date</th>
              <th>Bill/DB</th>
              <th>Company</th>
              <th>Taka/Beam</th>
              <th>Meter/KG</th>
              <th>Bill Amount</th>
              <th>Due Day</th>
              {/* <th>Int. Receivable</th> */}
              <th style={{ width: "105px" }}>Action</th>
              <th>Receive Payment</th>
              <th>Cash Int.</th>
            </tr>
          </thead>
          <tbody>
            {sundryDebtorData ? (
              sundryDebtorData?.map((data, index) => (
                <TableWithAccordion key={index} data={data} company={company} />
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

            <tr style={{ backgroundColor: "white" }}>
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
    </div>
  );
};

export default SundryDebitor;

const TableWithAccordion = ({ data, company }) => {
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
      >
        <td></td>
        <td colSpan={2}>{data?.first_name + " " + data?.last_name}</td>
        <td colSpan={5}>{data?.address || ""}</td>
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
            data?.bills?.map((bill, index) => (
              <tr key={index + "_bill"}>
                <td></td>
                <td>{dayjs(bill?.createdAt).format("DD-MM-YYYY")}</td>
                <td>{bill?.bill_no || ""}</td>
                <td>{company?.company_name || ""}</td>
                <td>{bill?.taka || 0}</td>
                <td>{bill?.meter || 0}</td>
                <td>{bill?.amount || 0}</td>
                <td>{calculateDueDays(bill?.createdAt, bill?.due_days)}</td>
                {/* <td>0</td> */}
                <td>
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
                </td>
                <td>{/* Receive payment field */}</td>
                <td>{/* Cash int field */}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={12} style={{ textAlign: "center" }}>
                No data found
              </td>
            </tr>
          )}
        </>
      )}

      <tr style={{ backgroundColor: "white" }}>
        <td>
          <b>Total</b>
        </td>
        <td></td>
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
        />
      )}
    </>
  );
};
