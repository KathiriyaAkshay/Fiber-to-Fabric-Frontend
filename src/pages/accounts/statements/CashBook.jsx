import { FilePdfOutlined, PlusCircleOutlined } from "@ant-design/icons";
import {
  Button,
  Select,
  DatePicker,
  Flex,
  Typography,
  Spin,
  Input,
} from "antd";
import { useContext, useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { GlobalContext } from "../../../contexts/GlobalContext";
import {
  PARTICULAR_OPTIONS,
  PAYMENT_OPTIONS,
} from "../../../constants/account";
import { getCashbookListRequest } from "../../../api/requests/accounts/payment";
// import { usePagination } from "../../../hooks/usePagination";
import { useNavigate } from "react-router-dom";
import { getParticularListRequest } from "../../../api/requests/accounts/particular";
import dayjs from "dayjs";
import {
  capitalizeFirstCharacter,
  localStorageHandler,
} from "../../../utils/mutationUtils";
import { PAYMENT_TYPE } from "../../../constants/localStorage";

const CashBook = () => {
  const navigate = useNavigate();
  const { companyId } = useContext(GlobalContext);

  const [fromMonth, setFromMonth] = useState(null);
  const [toMonth, setToMonth] = useState(null);
  console.log(fromMonth, toMonth);

  const [search, setSearch] = useState(null);
  const [particular, setParticular] = useState(null);
  // const [bank, setBank] = useState(null);
  const [particularOptions, setParticularOptions] = useState([]);

  // const [selectedRow, setSelectedRow] = useState(null);

  const navigateToAdd = () => {
    navigate("/account/payment/add");
    localStorageHandler("STORE", PAYMENT_TYPE, PAYMENT_OPTIONS.cashbook_update);
  };

  const { data: cashBookList, isLoading: isLoadingCashBookList } = useQuery({
    queryKey: [
      "get",
      "cashBook",
      "list",
      { company_id: companyId, fromMonth, toMonth, search, particular },
    ],
    queryFn: async () => {
      let params = {
        company_id: companyId,
        search,
        // company_bank_id: bank,
        // passbook_entry: 1,
      };
      if (fromMonth) params.from = dayjs(fromMonth).format("YYYY-MM");
      if (toMonth) params.to = dayjs(toMonth).format("YYYY-MM");
      if (particular) params.particular_type = particular;

      const response = await getCashbookListRequest({ params });
      return response.data.data;
    },
    enabled: Boolean(companyId),
    placeholderData: keepPreviousData,
  });

  // get particular list API
  const { data: particularRes, isLoading: isLoadingParticular } = useQuery({
    queryKey: [
      "dropdown/passbook_particular_type/list",
      { company_id: companyId },
    ],
    queryFn: async () => {
      const res = await getParticularListRequest({
        params: { company_id: companyId },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  useEffect(() => {
    if (particularRes) {
      const data = particularRes.rows.map(({ particular_name }) => {
        return {
          label: particular_name,
          value: particular_name,
        };
      });

      setParticularOptions([...PARTICULAR_OPTIONS, ...data]);
    }
  }, [particularRes]);

  const downloadPdf = () => {
    alert("downloadPdf");
  };

  const {
    unverifiedEntries,
    verifiedEntries,
    totalAmount,
    totalDeposit,
    closingBalance,
  } = useMemo(() => {
    if (cashBookList && !isLoadingCashBookList) {
      const unverifiedEntries = cashBookList.rows.filter(
        ({ is_verified }) => !is_verified
      );
      const verifiedEntries = cashBookList.rows.filter(
        ({ is_verified }) => is_verified
      );

      return {
        unverifiedEntries,
        verifiedEntries,
        totalAmount: cashBookList.totalAmount,
        totalDeposit: cashBookList.totalDeposit,
        closingBalance: cashBookList.closingBalance,
      };
    } else {
      return {
        unverifiedEntries: [],
        verifiedEntries: [],
        totalAmount: 0,
        totalDeposit: 0,
        closingBalance: 0,
      };
    }
  }, [cashBookList, isLoadingCashBookList]);
  console.log(verifiedEntries, unverifiedEntries);

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary">Cashbook</h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>
        <Flex align="center" justify="flex-end" gap={10}>
          <Flex align="center" gap={10}>
            <Typography>From Month</Typography>
            <DatePicker
              value={fromMonth}
              picker="month"
              onChange={setFromMonth}
            />
            <Typography>To</Typography>
            <DatePicker value={toMonth} picker="month" onChange={setToMonth} />
          </Flex>

          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Particular
            </Typography.Text>
            <Select
              allowClear
              showSearch
              placeholder="Select Particular"
              dropdownStyle={{
                textTransform: "capitalize",
              }}
              style={{
                textTransform: "capitalize",
                minWidth: "200px",
              }}
              loading={isLoadingParticular}
              options={particularOptions}
              value={particular}
              onChange={setParticular}
            />
          </Flex>
          <Flex align="center" gap={10}>
            <Input value={search} onChange={setSearch} placeholder="Search" />
          </Flex>
          {/* <Flex align="center" gap={10}>
            <Select
              allowClear
              showSearch
              placeholder="Select Bank"
              dropdownStyle={{
                textTransform: "capitalize",
              }}
              style={{
                textTransform: "capitalize",
                minWidth: "200px",
              }}
              options={company?.company_bank_details?.map(
                ({ id, bank_name }) => {
                  return { label: bank_name, value: id };
                }
              )}
              value={bank}
              onChange={setBank}
            />
          </Flex> */}

          <Button
            icon={<FilePdfOutlined />}
            type="primary"
            disabled={!cashBookList?.rows?.length}
            onClick={downloadPdf}
            className="flex-none"
          />
        </Flex>
      </div>

      {isLoadingCashBookList ? (
        <Spin />
      ) : (
        <table border={1} className="statement-passbook-table mt-2">
          <thead>
            <tr>
              <td>Date</td>
              <td>Time</td>
              {/* <td>Particular</td> */}
              <td>Particular</td>
              <td>Debit amount(Rs.)</td>
              <td>Credit amount(Rs.)</td>
              <td>Balance(Rs.)</td>
              <td>Remark</td>
              <td>Action</td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                style={{
                  padding: "12px",
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "16px",
                }}
                colSpan={9}
              >
                {unverifiedEntries && unverifiedEntries?.length
                  ? "Unverified Entries"
                  : "No unverified entry available"}
              </td>
            </tr>
            {unverifiedEntries && unverifiedEntries?.length
              ? unverifiedEntries?.map((row, index) => {
                  return (
                    <tr
                      key={index + "_unverified"}
                      className={row?.is_withdrawals ? "red" : "green"}
                    >
                      <td>{dayjs(row?.createdAt).format("DD-MM-YYYY")}</td>
                      <td>{dayjs(row?.createdAt).format("HH:mm:ss")}</td>
                      {/* <td>{row?.cheque_no}</td> */}
                      <td>
                        {capitalizeFirstCharacter(row?.particular_type)
                          .split("_")
                          .join(" ")}
                      </td>
                      <td>
                        <Typography style={{ color: "red", fontWeight: "600" }}>
                          {row?.is_withdraw
                            ? row?.amount?.toFixed(2)
                            : (0).toFixed(2)}
                        </Typography>
                      </td>
                      <td>
                        <Typography
                          style={{ color: "green", fontWeight: "600" }}
                        >
                          {!row?.is_withdraw
                            ? row?.amount?.toFixed(2)
                            : (0).toFixed(2)}
                        </Typography>
                      </td>
                      <td>{row?.balance}</td>
                      <td width={250}>{row.remarks}</td>
                      <td></td>
                    </tr>
                  );
                })
              : null}
            <tr>
              <td
                style={{
                  padding: "12px",
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "16px",
                }}
                colSpan={9}
              >
                {verifiedEntries && verifiedEntries?.length
                  ? "Verified Entries"
                  : "No verified entry available"}
              </td>
            </tr>
            {verifiedEntries && verifiedEntries?.length
              ? verifiedEntries?.map((row, index) => {
                  return (
                    <tr
                      key={index + "_verified"}
                      className={row?.is_withdrawals ? "red" : "green"}
                    >
                      <td>{dayjs(row?.createdAt).format("DD-MM-YYYY")}</td>
                      <td>{dayjs(row?.createdAt).format("HH:mm:ss")}</td>
                      {/* <td>{row?.cheque_no}</td> */}
                      <td>
                        {capitalizeFirstCharacter(row?.particular_type)
                          .split("_")
                          .join(" ")}
                      </td>
                      <td>
                        <Typography style={{ color: "red", fontWeight: "600" }}>
                          {row?.is_withdrawals
                            ? row?.amount?.toFixed(2)
                            : (0).toFixed(2)}
                        </Typography>
                      </td>
                      <td>
                        <Typography
                          style={{ color: "green", fontWeight: "600" }}
                        >
                          {!row?.is_withdrawals
                            ? row?.amount?.toFixed(2)
                            : (0).toFixed(2)}
                        </Typography>
                      </td>
                      <td>{row?.balance}</td>
                      <td>{row.remarks}</td>
                      <td></td>
                    </tr>
                  );
                })
              : null}

            {/* Display totals and closing balance */}
            <tr>
              <td>
                <Typography style={{ fontWeight: "700" }}>Total</Typography>
              </td>
              <td></td>
              <td></td>
              <td>
                <Typography style={{ fontWeight: "700" }}>
                  {totalAmount || 0}
                </Typography>
              </td>
              <td>
                <Typography style={{ fontWeight: "700" }}>
                  {totalDeposit || 0}
                </Typography>
              </td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>
                <Typography style={{ fontWeight: "700" }}>
                  Closing Balance
                </Typography>
              </td>
              <td></td>
              <td></td>
              <td></td>
              <td>
                <Typography style={{ fontWeight: "700" }}>
                  {closingBalance || 0}
                </Typography>
              </td>
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

export default CashBook;
