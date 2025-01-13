import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Flex, Input, message, Spin } from "antd";
import dayjs from "dayjs";
import { useContext, useEffect, useMemo, useState } from "react";
import {
  confirmCostPerMeterRequest,
  getCostPerMeterReportService,
} from "../../../api/requests/accounts/costPerMeter";
import { GlobalContext } from "../../../contexts/GlobalContext";
import {
  formatString,
  mutationOnErrorHandler,
} from "../../../utils/mutationUtils";
import { FilePdfOutlined, SaveOutlined } from "@ant-design/icons";
import { createParticularRequest } from "../../../api/requests/accounts/particular";

const CostPerMeter = () => {
  const { companyId } = useContext(GlobalContext);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const { data: costPerMeterData, isLoading } = useQuery({
    queryKey: ["ledger-report", "list", { company_id: companyId }],
    queryFn: async () => {
      const params = {
        company_id: companyId,
      };
      if (fromDate && toDate) {
        params.from = dayjs(fromDate).format("YYYY-MM");
        params.to = dayjs(toDate).format("YYYY-MM");
      }
      const res = await getCostPerMeterReportService({
        params,
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId && fromDate && toDate),
  });

  const formattedData = useMemo(() => {
    let columns = [];
    let data = [];
    if (costPerMeterData && costPerMeterData?.result) {
      // const keysData = Object.keys(costPerMeterData?.result);
      // columns = keysData.map((key) => dayjs(key, "MM-YYYY").format("MMM"));
      columns = Object.keys(costPerMeterData?.result);

      const firstKey = columns[0];
      const firstData = costPerMeterData?.result[firstKey];
      data = Object.keys(firstData?.particular_list);
    }
    return { columns, data };
  }, [costPerMeterData]);

  useEffect(() => {
    // Get the current date
    const today = dayjs();

    // Determine the start and end of the financial year
    const currentYear = today.year();
    const financialYearStart =
      today.month() < 3
        ? dayjs(`${currentYear - 1}-04-01`) // Previous year April 1st
        : dayjs(`${currentYear}-04-01`); // Current year April 1st

    const financialYearEnd =
      today.month() < 3
        ? dayjs(`${currentYear}-03-31`) // Current year March 31st
        : dayjs(`${currentYear + 1}-03-31`); // Next year March 31st

    // Set the fromDate and toDate
    setFromDate(financialYearStart); // Start of the financial year
    setToDate(financialYearEnd); // End of the financial year
  }, []);

  const rowTotal = useMemo(() => {
    if (formattedData) {
      const data = {};
      let totalAmount = 0;

      formattedData.data?.forEach((particular) => {
        let total = 0;
        formattedData.columns?.forEach((month) => {
          const monthData = costPerMeterData?.result[month];
          const particularData = monthData?.particular_list[particular];
          total = total + +particularData?.total;
        });
        data[particular] = { total: total || 0 };
        totalAmount = totalAmount + total;
      });

      data["TotalAmount"] = { total: totalAmount || 0 };
      return data;
    }
  }, [costPerMeterData?.result, formattedData]);

  // create new particular API
  const { mutateAsync: confirmCostPerMeter, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await confirmCostPerMeterRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["confirm", "cost-per-meter"],
    onSuccess: (res) => {
      // queryClient.invalidateQueries([
      //   "dropdown/passbook_particular_type/list",
      //   { company_id: companyId },
      // ]);
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
    },
    onError: (error) => {
      mutationOnErrorHandler({ error });
    },
  });

  const [clickedMonth, setClickedMonth] = useState("");
  const onClickConfirmAndFreez = async (month) => {
    const payload = {
      month: month,
      metadata: JSON.stringify(costPerMeterData.result[month]),
    };
    await confirmCostPerMeter(payload);
  };

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary">
            Cost Per Meter ({dayjs(fromDate).format("DD-MM-YYYY")} -{" "}
            {dayjs(toDate).format("DD-MM-YYYY")})
          </h3>
        </div>

        <Flex align="center" gap={10}>
          <Button type="primary" className="flex-none">
            Save
          </Button>
          <Button
            icon={<FilePdfOutlined />}
            type="primary"
            // disabled={!creditNotesList?.creditNotes?.rows?.length}
            // onClick={downloadPdf}
            className="flex-none"
          />
        </Flex>
      </div>

      {isLoading ? (
        <Flex style={{ height: "200px" }} justify="center" align="center">
          <Spin />
        </Flex>
      ) : (
        <div style={{ width: "100%", overflowX: "auto" }}>
          <table
            className="custom-table"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              position: "relative",
              tableLayout: "fixed",
            }}
          >
            <thead>
              <tr>
                <td
                  style={{
                    width: "50px",
                    position: "sticky",
                    left: 0,
                    backgroundColor: "rgb(25 74 109)",
                    zIndex: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  No
                </td>
                <td
                  style={{
                    width: "250px",
                    position: "sticky",
                    left: "60px",
                    backgroundColor: "rgb(25 74 109)",
                    zIndex: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  Particular
                </td>

                {/*  */}
                {formattedData && formattedData.columns?.length
                  ? formattedData.columns?.map((month, index) => {
                      return (
                        <>
                          <td
                            key={`${month}_${index}`}
                            style={{ width: "80px", whiteSpace: "nowrap" }}
                          >
                            {dayjs(month, "MM-YYYY").format("MMM")}
                          </td>
                          <td style={{ width: "50px", whiteSpace: "nowrap" }}>
                            Rs.
                          </td>
                        </>
                      );
                    })
                  : null}

                <td
                  style={{
                    width: "100px",
                    position: "sticky",
                    right: "110px",
                    backgroundColor: "rgb(25 74 109)",
                    zIndex: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  Total
                </td>
                <td
                  style={{
                    width: "100px",
                    position: "sticky",
                    right: 0,
                    backgroundColor: "rgb(25 74 109)",
                    zIndex: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  Avg Rs.
                </td>
              </tr>
            </thead>
            <tbody>
              {formattedData && formattedData.data?.length > 0
                ? formattedData.data?.map((particular, index) => {
                    return (
                      <tr key={particular}>
                        <td
                          style={{
                            width: "50px",
                            position: "sticky",
                            left: 0,
                            backgroundColor: "rgb(25 74 109)",
                            color: "#fff",
                            textAlign: "center",
                            zIndex: 1,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {index + 1}
                        </td>
                        <td
                          style={{
                            width: "250px",
                            position: "sticky",
                            left: "60px",
                            backgroundColor: "rgb(25 74 109)",
                            color: "#fff",
                            textAlign: "center",
                            zIndex: 1,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatString(particular)}
                        </td>
                        {formattedData && formattedData.columns?.length
                          ? formattedData.columns?.map((month, index) => {
                              const monthData = costPerMeterData?.result[month];
                              const particularData =
                                monthData?.particular_list[particular];

                              return (
                                <>
                                  <td
                                    key={`${month}_${index}`}
                                    style={{
                                      width: "80px",
                                      whiteSpace: "nowrap",
                                      textAlign: "center",
                                    }}
                                  >
                                    {particularData?.total.toFixed(2)}
                                  </td>
                                  <td
                                    style={{
                                      width: "50px",
                                      whiteSpace: "nowrap",
                                      textAlign: "center",
                                    }}
                                  >
                                    {0}
                                  </td>
                                </>
                              );
                            })
                          : null}

                        <td
                          style={{
                            width: "100px",
                            position: "sticky",
                            right: "111px",
                            backgroundColor: "rgb(25 74 109)",
                            color: "#fff",
                            textAlign: "center",
                            zIndex: 1,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {rowTotal[particular]?.total?.toFixed(2) || 0}
                        </td>
                        <td
                          style={{
                            width: "100px",
                            position: "sticky",
                            right: 0,
                            backgroundColor: "rgb(25 74 109)",
                            color: "#fff",
                            textAlign: "center",
                            zIndex: 1,
                            whiteSpace: "nowrap",
                          }}
                        >
                          0
                        </td>
                      </tr>
                    );
                  })
                : null}

              {Array.from({ length: 2 }).map((_, index) => {
                return (
                  <AddNewParticular
                    key={index}
                    lastIndex={formattedData.data.length}
                    COLUMNS={formattedData.columns}
                    companyId={companyId}
                  />
                );
              })}

              {/* Total Amount ------------------------------------------------------ */}
              <tr>
                <td
                  style={{
                    width: "50px",
                    position: "sticky",
                    left: 0,
                    backgroundColor: "rgb(25 74 109)",
                    color: "#fff",
                    textAlign: "center",
                    zIndex: 1,
                    whiteSpace: "nowrap",
                  }}
                ></td>
                <td
                  style={{
                    width: "250px",
                    position: "sticky",
                    left: "60px",
                    backgroundColor: "rgb(25 74 109)",
                    color: "#fff",
                    textAlign: "center",
                    zIndex: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  Total Amount
                </td>
                {formattedData && formattedData.columns?.length
                  ? formattedData.columns?.map((month, index) => {
                      const monthData = costPerMeterData?.result[month];
                      const convertedData = Object.values(
                        monthData?.particular_list
                      );
                      const totalAmount = convertedData.reduce(
                        (acc, obj) => acc + obj.total,
                        0
                      );

                      // const particularData =
                      //   monthData?.particular_list[particular];

                      return (
                        <>
                          <td
                            key={`${month}_${index}`}
                            style={{
                              width: "80px",
                              whiteSpace: "nowrap",
                              textAlign: "center",
                            }}
                          >
                            {totalAmount.toFixed(2)}
                          </td>
                          <td
                            style={{
                              width: "50px",
                              whiteSpace: "nowrap",
                              textAlign: "center",
                            }}
                          >
                            {0}
                          </td>
                        </>
                      );
                    })
                  : null}
                <td
                  style={{
                    width: "100px",
                    position: "sticky",
                    right: "111px",
                    backgroundColor: "rgb(25 74 109)",
                    color: "#fff",
                    textAlign: "center",
                    zIndex: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  {rowTotal["TotalAmount"]?.total?.toFixed(2) || 0}
                </td>
                <td
                  style={{
                    width: "100px",
                    position: "sticky",
                    right: 0,
                    backgroundColor: "rgb(25 74 109)",
                    color: "#fff",
                    textAlign: "center",
                    zIndex: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  0
                </td>
              </tr>

              {/* Total Production ------------------------------------------------------ */}
              <tr>
                <td
                  style={{
                    width: "50px",
                    position: "sticky",
                    left: 0,
                    backgroundColor: "rgb(25 74 109)",
                    color: "#fff",
                    textAlign: "center",
                    zIndex: 1,
                    whiteSpace: "nowrap",
                  }}
                ></td>
                <td
                  style={{
                    width: "250px",
                    position: "sticky",
                    left: "60px",
                    backgroundColor: "rgb(25 74 109)",
                    color: "#fff",
                    textAlign: "center",
                    zIndex: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  Total Production
                </td>
                {formattedData && formattedData.columns?.length
                  ? formattedData.columns?.map((month, index) => {
                      // const monthData = costPerMeterData?.result[month];
                      // const particularData =
                      //   monthData?.particular_list[particular];

                      return (
                        <>
                          <td
                            key={`${month}_${index}`}
                            style={{
                              width: "80px",
                              whiteSpace: "nowrap",
                              textAlign: "center",
                            }}
                          >
                            {0}
                          </td>
                          <td
                            style={{
                              width: "50px",
                              whiteSpace: "nowrap",
                              textAlign: "center",
                            }}
                          >
                            {0}
                          </td>
                        </>
                      );
                    })
                  : null}
                <td
                  style={{
                    width: "100px",
                    position: "sticky",
                    right: "111px",
                    backgroundColor: "rgb(25 74 109)",
                    color: "#fff",
                    textAlign: "center",
                    zIndex: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  {0}
                </td>
                <td
                  style={{
                    width: "100px",
                    position: "sticky",
                    right: 0,
                    backgroundColor: "rgb(25 74 109)",
                    color: "#fff",
                    textAlign: "center",
                    zIndex: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  0
                </td>
              </tr>

              {/* Cost Per Meter ------------------------------------------------------ */}
              <tr>
                <td
                  style={{
                    width: "50px",
                    position: "sticky",
                    left: 0,
                    backgroundColor: "rgb(25 74 109)",
                    color: "#fff",
                    textAlign: "center",
                    zIndex: 1,
                    whiteSpace: "nowrap",
                  }}
                ></td>
                <td
                  style={{
                    width: "250px",
                    position: "sticky",
                    left: "60px",
                    backgroundColor: "rgb(25 74 109)",
                    color: "#fff",
                    textAlign: "center",
                    zIndex: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  Cost Per Meter
                </td>
                {formattedData && formattedData.columns?.length
                  ? formattedData.columns?.map((month, index) => {
                      // const monthData = costPerMeterData?.result[month];
                      // const particularData =
                      //   monthData?.particular_list[particular];

                      return (
                        <>
                          <td
                            key={`${month}_${index}`}
                            style={{
                              width: "80px",
                              whiteSpace: "nowrap",
                              textAlign: "center",
                            }}
                          >
                            {0}
                          </td>
                          <td
                            style={{
                              width: "50px",
                              whiteSpace: "nowrap",
                              textAlign: "center",
                            }}
                          >
                            {0}
                          </td>
                        </>
                      );
                    })
                  : null}
                <td
                  style={{
                    width: "100px",
                    position: "sticky",
                    right: "111px",
                    backgroundColor: "rgb(25 74 109)",
                    color: "#fff",
                    textAlign: "center",
                    zIndex: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  {0}
                </td>
                <td
                  style={{
                    width: "100px",
                    position: "sticky",
                    right: 0,
                    backgroundColor: "rgb(25 74 109)",
                    color: "#fff",
                    textAlign: "center",
                    zIndex: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  0
                </td>
              </tr>

              {/* Confirm and Freez */}
              <tr>
                <td
                  style={{
                    width: "50px",
                    position: "sticky",
                    left: 0,
                    backgroundColor: "rgb(25 74 109)",
                    color: "#fff",
                    textAlign: "center",
                    zIndex: 1,
                    whiteSpace: "nowrap",
                  }}
                ></td>
                <td
                  style={{
                    width: "250px",
                    position: "sticky",
                    left: "60px",
                    backgroundColor: "rgb(25 74 109)",
                    color: "#fff",
                    textAlign: "center",
                    zIndex: 1,
                    whiteSpace: "nowrap",
                  }}
                ></td>
                {formattedData && formattedData.columns?.length
                  ? formattedData.columns?.map((month, index) => {
                      // const monthData = costPerMeterData?.result[month];
                      // const convertedData = Object.values(
                      //   monthData?.particular_list
                      // );
                      // const totalAmount = convertedData.reduce(
                      //   (acc, obj) => acc + obj.total,
                      //   0
                      // );

                      // const particularData =
                      //   monthData?.particular_list[particular];

                      return (
                        <>
                          <td
                            key={`${month}_${index}`}
                            style={{
                              width: "80px",
                              whiteSpace: "nowrap",
                              textAlign: "center",
                            }}
                            colSpan={2}
                          >
                            <Button
                              type="primary"
                              onClick={() => {
                                setClickedMonth(month);
                                onClickConfirmAndFreez(month);
                              }}
                              loading={clickedMonth === month && isPending}
                            >
                              Confirm & Freez
                            </Button>
                          </td>
                        </>
                      );
                    })
                  : null}
                <td
                  style={{
                    width: "100px",
                    position: "sticky",
                    right: "111px",
                    backgroundColor: "rgb(25 74 109)",
                    color: "#fff",
                    textAlign: "center",
                    zIndex: 1,
                    whiteSpace: "nowrap",
                  }}
                ></td>
                <td
                  style={{
                    width: "100px",
                    position: "sticky",
                    right: 0,
                    backgroundColor: "rgb(25 74 109)",
                    color: "#fff",
                    textAlign: "center",
                    zIndex: 1,
                    whiteSpace: "nowrap",
                  }}
                ></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CostPerMeter;

const AddNewParticular = ({ lastIndex, COLUMNS, companyId }) => {
  const [particularName, setParticularName] = useState("");

  // create new particular API
  const { mutateAsync: addNewParticular, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await createParticularRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["add", "particular", "new"],
    onSuccess: (res) => {
      setParticularName("");
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(errorMessage);
    },
  });

  const AddNewParticularHandler = async () => {
    if (!particularName) {
      message.error("Particular is required.");
      return;
    }

    const payload = {
      particular_name: particularName.split(" ").join("_"),
      // head: headName,
      label: particularName,
      is_cost_per_meter: true,
      is_main: true,
    };

    await addNewParticular(payload);
  };

  return (
    <tr>
      <td
        style={{
          width: "50px",
          position: "sticky",
          left: 0,
          backgroundColor: "rgb(25 74 109)",
          color: "#fff",
          textAlign: "center",
          zIndex: 1,
          whiteSpace: "nowrap",
        }}
      >
        {lastIndex + 1}
      </td>
      <td
        style={{
          width: "250px",
          position: "sticky",
          left: "60px",
          backgroundColor: "rgb(25 74 109)",
          color: "#fff",
          textAlign: "center",
          zIndex: 1,
          whiteSpace: "nowrap",
        }}
      >
        <Flex gap={6}>
          <Input
            placeholder="Add New Particular"
            className="remove-input-box"
            value={particularName}
            onChange={(e) => setParticularName(e.target.value)}
          />
          <Button
            icon={<SaveOutlined />}
            loading={isPending}
            onClick={AddNewParticularHandler}
          />
        </Flex>
      </td>
      {COLUMNS && COLUMNS?.length
        ? COLUMNS?.map((month, index) => {
            // const monthData = costPerMeterData?.result[month];
            // const particularData = monthData?.particular_list[particular];

            return (
              <>
                <td
                  key={`${month}_${index}`}
                  style={{
                    width: "80px",
                    whiteSpace: "nowrap",
                    textAlign: "center",
                  }}
                >
                  <Input
                    placeholder="Amount"
                    className="remove-input-box"
                    readOnly
                  />
                </td>
                <td
                  style={{
                    width: "50px",
                    whiteSpace: "nowrap",
                    textAlign: "center",
                  }}
                >
                  <Input
                    placeholder="0.00"
                    className="remove-input-box"
                    readOnly
                  />
                </td>
              </>
            );
          })
        : null}

      <td
        style={{
          width: "100px",
          position: "sticky",
          right: "111px",
          backgroundColor: "rgb(25 74 109)",
          color: "#fff",
          textAlign: "center",
          zIndex: 1,
          whiteSpace: "nowrap",
        }}
      ></td>
      <td
        style={{
          width: "100px",
          position: "sticky",
          right: 0,
          backgroundColor: "rgb(25 74 109)",
          color: "#fff",
          textAlign: "center",
          zIndex: 1,
          whiteSpace: "nowrap",
        }}
      ></td>
    </tr>
  );
};
