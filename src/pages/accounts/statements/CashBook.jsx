import {
  DeleteOutlined,
  DeleteRowOutlined,
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
  Row,
  Col,
  Checkbox,
  Space,
  message,
  Tooltip,
} from "antd";
import { useContext, useEffect, useMemo, useState } from "react";
import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import { GlobalContext } from "../../../contexts/GlobalContext";
import {
  PARTICULAR_OPTIONS,
  PAYMENT_OPTIONS,
} from "../../../constants/account";
import {
  deleteCashbookRequest,
  getCashbookListRequest,
  updateCashbookRequest,
} from "../../../api/requests/accounts/payment";
// import { usePagination } from "../../../hooks/usePagination";
import { useNavigate } from "react-router-dom";
import { getParticularListRequest } from "../../../api/requests/accounts/particular";
import dayjs from "dayjs";
import {
  capitalizeFirstCharacter,
  localStorageHandler,
} from "../../../utils/mutationUtils";
import { PAYMENT_TYPE } from "../../../constants/localStorage";
import useDebounce from "../../../hooks/useDebounce";
import RevertPassBookEntry from "../../../components/accounts/statement/passbook/RevertPassBookEntry";
import { useMutation } from "@tanstack/react-query";
import RevertCashbookEntry from "../../../components/accounts/statement/cashbook/RevertCashbookEntry";
import EditCashbookEntry from "../../../components/accounts/statement/cashbook/EditCashbokEntry";

const CashBook = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { companyId } = useContext(GlobalContext);

  const [isDeleted, setIsDeleted] = useState(false);
  const [fromMonth, setFromMonth] = useState(null);
  const [toMonth, setToMonth] = useState(null);
  const [search, setSearch] = useState(null);
  const [particular, setParticular] = useState(null);
  const [particularOptions, setParticularOptions] = useState([]);

  const debounceIsDelete = useDebounce(isDeleted, 500);
  const debounceFrom = useDebounce(fromMonth, 500);
  const debounceTo = useDebounce(toMonth, 500);
  const debounceSearch = useDebounce(search, 500);
  const debounceParticular = useDebounce(particular, 500);

  const navigateToAdd = () => {
    navigate("/account/payment/add");
    localStorageHandler("STORE", PAYMENT_TYPE, PAYMENT_OPTIONS.cashbook_update);
  };

  // Update cashbook statement related api
  const { mutateAsync: updatePassBookEntry, isPending: isCashbookPending } =
    useMutation({
      mutationFn: async (data) => {
        const res = await updateCashbookRequest({
          data,
          params: {
            company_id: companyId,
          },
        });
        return res.data;
      },
      mutationKey: ["update", "passbook", "entry", { companyId }],
      onSuccess: (res) => {
        queryClient.invalidateQueries([
          "get",
          "cashBook",
          "list",
          { company_id: companyId },
        ]);
        const successMessage = res?.message;
        if (successMessage) {
          message.success("Cashbook statement updated successfully");
        }
      },
      onError: (error) => {
        const errorMessage = error?.response?.data?.message || error.message;
        message.error(errorMessage);
      },
    });

  // Cashbook listing related api ==================================
  const { data: cashBookList, isLoading: isLoadingCashBookList } = useQuery({
    queryKey: [
      "get",
      "cashBook",
      "list",
      {
        company_id: companyId,
        from: debounceFrom,
        to: debounceTo,
        search: debounceSearch,
        particular_type: debounceParticular,
        is_delete: debounceIsDelete,
      },
    ],
    queryFn: async () => {
      let params = {
        company_id: companyId,
        search: debounceSearch,
        is_delete: debounceIsDelete,
        // company_bank_id: bank,
        // passbook_entry: 1,
      };
      if (fromMonth) params.from = dayjs(debounceFrom).format("YYYY-MM");
      if (toMonth) params.to = dayjs(debounceTo).format("YYYY-MM");
      if (particular) params.particular_type = debounceParticular;

      const response = await getCashbookListRequest({ params });
      return response.data.data;
    },
    enabled: Boolean(companyId),
  });

  // Particular user list fetch API
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
      "Particular",
      "Debit amount(Rs.)",
      "Credit amount(Rs.)",
      "Balance(Rs.)",
      "Remark",
    ];

    localStorage.setItem("print-array", JSON.stringify(body));
    localStorage.setItem("print-head", JSON.stringify(tableTitle));

    window.open("/print-cashbook-statement");
  }

  // Cashbook statement related handler
  const CashbookStatementVerify = async (row) => {
    let requestPayload = {
      id: row?.id,
      is_verified: !row?.is_verified,
    };
    await updatePassBookEntry(requestPayload);
  };

  // Edit cashbook related functionality handle
  const [selectedRow, setSelectedRow] = useState(null);
  const [isOpenEditEntry, setIsOpenEditEntry] = useState(false);

  // Delete cashbook entry related handler ====================
  const { mutateAsync: deleteCashbookEntry } = useMutation({
    mutationFn: async ({ id }) => {
      const res = await deleteCashbookRequest({
        id,
        params: {
          company_id: companyId,
        },
      });
      return res?.data;
    },
    mutationKey: ["payment", "cashbook", "delete"],
    onSuccess: (res) => {
      const successMessage = res?.message;
      if (successMessage) {
        message.success("Cashbook entry deleted successfully");
      }
      queryClient.invalidateQueries([
        "get",
        "cashBook",
        "list",
        {
          company_id: companyId,
        },
      ]);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message;
      if (errorMessage && typeof errorMessage === "string") {
        message.error(errorMessage);
      }
    },
  });

  const DeleteCashbookEntryHandler = async (record) => {
    await deleteCashbookEntry({ id: record?.id });
  };

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
          <Button
            icon={<FilePdfOutlined />}
            type="primary"
            disabled={!cashBookList?.rows?.length}
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

            {/* ============ Unverified entries information ============  */}
            {unverifiedEntries && unverifiedEntries?.length
              ? unverifiedEntries?.map((row, index) => {
                  return (
                    <tr
                      key={index + "_unverified"}
                      className={row?.is_withdraw ? "red" : "green"}
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
                      <td width={250}>{row.remarks || "----"}</td>
                      <td>
                        <Flex style={{ gap: 10 }}>
                          <Tooltip title="Verify Statement">
                            <div
                              style={{
                                cursor: "pointer",
                                color: row?.is_verified ? "green" : "red",
                                fontWeight: 600,
                                marginTop: "auto",
                                marginBottom: "auto",
                              }}
                              onClick={() => {
                                CashbookStatementVerify(row);
                              }}
                            >
                              {row?.is_verified ? "Confirmed" : "Confirm"}
                            </div>
                          </Tooltip>

                          {/* Delete cashbook entry option  */}
                          <Button
                            icon={<DeleteOutlined />}
                            danger
                            onClick={() => {
                              DeleteCashbookEntryHandler(row);
                            }}
                          ></Button>
                        </Flex>
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

            {/* ======= Verified enteries information ============  */}
            {verifiedEntries && verifiedEntries?.length
              ? verifiedEntries?.map((row, index) => {
                  return (
                    <tr
                      key={index + "_verified"}
                      className={row?.is_withdraw ? "red" : "green"}
                    >
                      <td>{dayjs(row?.createdAt).format("DD-MM-YYYY")}</td>
                      <td>{dayjs(row?.createdAt).format("HH:mm:ss")}</td>
                      <td>
                        {capitalizeFirstCharacter(row?.particular_type)
                          .split("_")
                          .join(" ")}

                        <span
                          style={{
                            fontSize: 12,
                          }}
                        >
                          {row?.is_reverted ? "(Reverse Entry)" : ""}
                        </span>
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
                      <td>{row.remarks || "-----"}</td>
                      <td>
                        <Space>
                          <div>
                            {!row.is_reverted && (
                              <Tooltip title="Un-verified statement">
                                <div
                                  style={{
                                    cursor: "pointer",
                                    color: row?.is_verified ? "green" : "red",
                                    fontWeight: 600,
                                  }}
                                  onClick={() => {
                                    CashbookStatementVerify(row);
                                  }}
                                >
                                  {row?.is_verified ? "Confirmed" : "Confirm"}
                                </div>
                              </Tooltip>
                            )}

                            <Flex style={{ gap: 7, marginTop: 4 }}>
                              {/* Revert action ===========  */}
                              {row.able_to_revert ? (
                                <RevertCashbookEntry details={row} />
                              ) : null}

                              {/* Edit action ====================  */}
                              <Button
                                style={{
                                  borderColor: "var(--menu-item-hover-color)",
                                }}
                                onClick={() => {
                                  setSelectedRow(row);
                                  setIsOpenEditEntry(true);
                                  // setIsVerifyEntry(false);
                                }}
                              >
                                <EditOutlined
                                  style={{
                                    color: "var(--menu-item-hover-color)",
                                  }}
                                />
                              </Button>
                            </Flex>
                          </div>
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
              <td>
                <Typography style={{ fontWeight: "700" }}>
                  {parseFloat(totalAmount).toFixed(2) || 0}
                </Typography>
              </td>
              <td>
                <Typography style={{ fontWeight: "700" }}>
                  {parseFloat(totalDeposit).toFixed(2) || 0}
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

      {/* Edit cashbook related functionality  */}
      {isOpenEditEntry && (
        <EditCashbookEntry
          open={isOpenEditEntry}
          handleClose={() => {
            setIsOpenEditEntry(false);
          }}
          row={selectedRow}
          companyId={companyId}
          isVerifyEntry={true}
        />
      )}
    </div>
  );
};

export default CashBook;
