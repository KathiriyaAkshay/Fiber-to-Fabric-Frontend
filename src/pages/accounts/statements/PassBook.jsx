import {
  CalendarOutlined,
  CheckCircleOutlined,
  EditOutlined,
  FilePdfOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import {
  Button,
  Select,
  DatePicker,
  Flex,
  Typography,
  Spin,
  Input,
  Space,
  Row,
  Col,
  Checkbox,
} from "antd";
import { useContext, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GlobalContext } from "../../../contexts/GlobalContext";
import {
  PARTICULAR_OPTIONS,
  PAYMENT_OPTIONS,
} from "../../../constants/account";
import { getPassbookListRequest } from "../../../api/requests/accounts/payment";
// import { usePagination } from "../../../hooks/usePagination";
import { useNavigate } from "react-router-dom";
import { getParticularListRequest } from "../../../api/requests/accounts/particular";
import dayjs from "dayjs";
import {
  capitalizeFirstCharacter,
  localStorageHandler,
} from "../../../utils/mutationUtils";
import { PAYMENT_TYPE } from "../../../constants/localStorage";
import EditPassBookEntry from "../../../components/accounts/statement/passbook/EditPassBookEntry";
import VerifyPassBookEntry from "../../../components/accounts/statement/passbook/VerifyPassBookEntry";
import DeletePassBookEntry from "../../../components/accounts/statement/passbook/DeletePassBookEntry";
import RevertPassBookEntry from "../../../components/accounts/statement/passbook/RevertPassBookEntry";
import EditPassBookVoucherDate from "../../../components/accounts/statement/passbook/EditPassBookVoucherDate";
import useDebounce from "../../../hooks/useDebounce";
import moment from "moment";

const PassBook = () => {
  const navigate = useNavigate();
  const { companyId, company } = useContext(GlobalContext);

  const [isDeleted, setIsDeleted] = useState(false);

  const [month, setMonth] = useState(null);
  const [search, setSearch] = useState(null);
  const [particular, setParticular] = useState(null);
  const [bank, setBank] = useState(null);

  const debounceIsDelete = useDebounce(isDeleted, 500);
  const debounceMonth = useDebounce(month, 500);
  const debounceSearch = useDebounce(search, 500);
  const debounceParticular = useDebounce(particular, 500);
  const debounceBank = useDebounce(bank, 500);

  const [particularOptions, setParticularOptions] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isOpenEditEntry, setIsOpenEditEntry] = useState(false);
  const [isOpenVerifyEntry, setIsOpenVerifyEntry] = useState(false);
  const [isOpenEditVoucherDate, setIsOpenEditVoucherDate] = useState(false);
  const [isVerifyEntry, setIsVerifyEntry] = useState(null);

  useEffect(() => {
    if (company?.company_bank_details?.length > 0) {
      let option = company?.company_bank_details[0];
      setBank(option?.id);
    }
  }, [company]);

  const navigateToAdd = () => {
    navigate("/account/payment/add");
    localStorageHandler("STORE", PAYMENT_TYPE, PAYMENT_OPTIONS.passbook_update);
  };

  const { data: passBookList, isLoading: isLoadingPassBookList } = useQuery({
    queryKey: [
      "get",
      "passBook",
      "list",
      {
        company_id: companyId,
        from: debounceMonth,
        search: debounceSearch,
        particular_type: debounceParticular,
        company_bank_id: debounceBank,
        is_delete: debounceIsDelete,
      },
    ],
    queryFn: async () => {
      let params = {
        passbook_entry: 1,
        company_id: companyId,
        search: debounceSearch,
        company_bank_id: debounceBank,
        particular_type: debounceParticular,
        is_delete: debounceIsDelete,
      };
      if (debounceMonth) {
        params.from = dayjs(debounceMonth).format("YYYY-MM");
      }
      const response = await getPassbookListRequest({ params });
      return response.data.data;
    },
    enabled: Boolean(companyId),
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
      const data = particularRes.rows.map(({ particular_name, label }) => {
        return {
          label: label,
          value: particular_name,
        };
      });

      setParticularOptions([...PARTICULAR_OPTIONS, ...data]);
    }
  }, [particularRes]);

  const {
    unverifiedEntries,
    verifiedEntries,
    totalAmount,
    totalDeposit,
    closingBalance,
  } = useMemo(() => {
    if (passBookList && !isLoadingPassBookList) {
      const unverifiedEntries = passBookList.rows.filter(
        ({ is_verified }) => !is_verified
      );
      const verifiedEntries = passBookList.rows.filter(
        ({ is_verified }) => is_verified
      );

      return {
        unverifiedEntries,
        verifiedEntries,
        totalAmount: passBookList.totalAmount,
        totalDeposit: passBookList.totalDeposit,
        closingBalance: passBookList.closingBalance,
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
  }, [isLoadingPassBookList, passBookList]);

  function downloadPdf() {
    const body = {
      unverifiedEntries,
      verifiedEntries,
      totalAmount,
      totalDeposit,
      closingBalance,
    };

    const tableTitle = [
      "Date",
      "Time",
      "Cheque No",
      "Particular",
      "Withdrawals",
      "Deposits",
      "Balance",
      "Remark",
    ];

    // Set localstorage item information
    localStorage.setItem("print-array", JSON.stringify(body));
    // localStorage.setItem("print-title", "PassBook Entries");
    localStorage.setItem("print-head", JSON.stringify(tableTitle));
    // localStorage.setItem("total-count", "0");

    window.open("/print-passbook-statement");
  }

  // function disabledFutureDate(current) {
  //   return current && current > moment().endOf("day");
  // }

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary">Passbook</h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>
        <Flex align="center" justify="flex-end" gap={10}>
          {/* Month selection  */}
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Month
            </Typography.Text>
            <DatePicker value={month} picker="month" onChange={setMonth} />
          </Flex>

          {/* Particular selection  */}
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
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
            />
          </Flex>

          {/* Bank selection  */}
          <Flex align="center" gap={10}>
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
          </Flex>

          <Button
            icon={<FilePdfOutlined />}
            type="primary"
            disabled={!passBookList?.rows?.length}
            onClick={downloadPdf}
            className="flex-none"
          />
        </Flex>
      </div>

      <Row style={{ justifyContent: "flex-end" }}>
        <Col span={6} style={{ textAlign: "right" }}>
          <Checkbox
            checked={isDeleted}
            onChange={(e) => setIsDeleted(e.target.checked)}
            style={{ fontSize: "16px", color: "red" }}
          >
            Deleted
          </Checkbox>
        </Col>
      </Row>

      {isLoadingPassBookList ? (
        <Spin />
      ) : (
        <table border={1} className="statement-passbook-table mt-2">
          <thead>
            <tr>
              <td>Date</td>
              <td>Time</td>
              <td>Cheque No</td>
              <td>Particular</td>
              <td>Withdrawals</td>
              <td>Deposits</td>
              <td>Balance</td>
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
                  paddingTop: 20,
                  paddingBottom: 20,
                }}
                colSpan={9}
              >
                {unverifiedEntries && unverifiedEntries?.length
                  ? "Unverified Entries"
                  : "No unverified entry available"}
              </td>
            </tr>

            {/* ============= Unverified enteries related information ===============  */}
            {unverifiedEntries && unverifiedEntries?.length
              ? unverifiedEntries?.map((row, index) => {
                  return (
                    <tr
                      key={index + "_unverified"}
                      className={
                        row?.is_withdraw
                          ? "red"
                          : row?.particular_type == "OPENING BALANCE"
                          ? "opening-balance-entry"
                          : "green"
                      }
                    >
                      <td>{dayjs(row?.createdAt).format("DD-MM-YYYY")}</td>
                      <td>{dayjs(row?.createdAt).format("HH:mm:ss")}</td>
                      <td>{row?.cheque_no || "----"}</td>
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
                      <td>
                        <Space>
                          {/* verify action */}
                          <Button
                            style={{ borderColor: "green" }}
                            onClick={() => {
                              setSelectedRow(row);
                              setIsOpenVerifyEntry(true);
                            }}
                          >
                            <CheckCircleOutlined style={{ color: "green" }} />
                          </Button>

                          {/* delete action */}
                          <DeletePassBookEntry details={row} />

                          {/* edit action */}
                          <Button
                            style={{
                              borderColor: "var(--menu-item-hover-color)",
                            }}
                            onClick={() => {
                              setSelectedRow(row);
                              setIsOpenEditEntry(true);
                              setIsVerifyEntry(false);
                            }}
                          >
                            <EditOutlined
                              style={{ color: "var(--menu-item-hover-color)" }}
                            />
                          </Button>
                        </Space>
                      </td>
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

            {/* =========== Verified entries related information ===============  */}
            {verifiedEntries && verifiedEntries?.length
              ? verifiedEntries?.map((row, index) => {
                  return (
                    <tr
                      key={index + "_verified"}
                      className={
                        row?.is_withdraw
                          ? "red"
                          : row?.particular_type == "OPENING BALANCE"
                          ? "opening-balance-entry"
                          : "green"
                      }
                    >
                      <td>{dayjs(row?.createdAt).format("DD-MM-YYYY")}</td>
                      <td>{dayjs(row?.createdAt).format("HH:mm:ss")}</td>
                      <td>{row?.cheque_no || "----"}</td>
                      <td
                        style={{
                          fontWeight:
                            capitalizeFirstCharacter(row?.particular_type)
                              .split("_")
                              .join(" ") == "OPENING BALANCE"
                              ? 600
                              : 500,
                        }}
                      >
                        {capitalizeFirstCharacter(row?.particular_type)
                          .split("_")
                          .join(" ")}

                        {row?.is_reverted && (
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            {" "}
                            ( Reverse entry ){" "}
                          </span>
                        )}
                      </td>
                      <td>
                        {row?.is_reverted ? (
                          <>
                            <span
                              style={{
                                fontWeight: 600,
                                color: "blue",
                              }}
                            >
                              {row?.is_withdraw
                                ? row?.amount?.toFixed(2)
                                : (0).toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <>
                            <Typography
                              style={{ color: "red", fontWeight: "600" }}
                            >
                              {row?.is_withdraw
                                ? row?.amount?.toFixed(2)
                                : (0).toFixed(2)}
                            </Typography>
                          </>
                        )}
                      </td>
                      <td>
                        {row?.is_reverted ? (
                          <span
                            style={{
                              fontWeight: 600,
                              color: "blue",
                            }}
                          >
                            {!row?.is_withdraw
                              ? row?.amount?.toFixed(2)
                              : (0).toFixed(2)}
                          </span>
                        ) : (
                          <>
                            <Typography
                              style={{ color: "green", fontWeight: "600" }}
                            >
                              {!row?.is_withdraw
                                ? row?.amount?.toFixed(2)
                                : (0).toFixed(2)}
                            </Typography>
                          </>
                        )}
                      </td>
                      <td>{row?.balance}</td>
                      <td>{row.remarks}</td>
                      <td>
                        <Space>
                          {/* revert action */}
                          {row.able_to_revert ? (
                            <RevertPassBookEntry details={row} />
                          ) : null}
                          {/* edit action */}
                          <Button
                            style={{
                              borderColor: "var(--menu-item-hover-color)",
                            }}
                            onClick={() => {
                              setSelectedRow(row);
                              setIsOpenEditEntry(true);
                              setIsVerifyEntry(true);
                            }}
                          >
                            <EditOutlined
                              style={{ color: "var(--menu-item-hover-color)" }}
                            />
                          </Button>
                          {/* date update action */}
                          <Button
                            style={{ borderColor: "#c48208" }}
                            onClick={() => {
                              setSelectedRow(row);
                              setIsOpenEditVoucherDate(true);
                            }}
                          >
                            <CalendarOutlined style={{ color: "#c48208 " }} />
                          </Button>
                        </Space>
                      </td>
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

      {/* Passbook entry update related model  */}
      {isOpenEditEntry && (
        <EditPassBookEntry
          open={isOpenEditEntry}
          handleClose={() => setIsOpenEditEntry(false)}
          row={selectedRow}
          companyId={companyId}
          isVerifyEntry={isVerifyEntry}
        />
      )}

      {/* Passbook entry vocher date related model  */}
      {isOpenEditVoucherDate && (
        <EditPassBookVoucherDate
          open={isOpenEditVoucherDate}
          handleClose={() => setIsOpenEditVoucherDate(false)}
          row={selectedRow}
          companyId={companyId}
        />
      )}

      {/* Passbook entry verified or not verified related model  */}
      {isOpenVerifyEntry && (
        <VerifyPassBookEntry
          open={isOpenVerifyEntry}
          handleClose={() => setIsOpenVerifyEntry(false)}
          row={selectedRow}
          companyId={companyId}
          company={company}
        />
      )}
    </div>
  );
};

export default PassBook;
