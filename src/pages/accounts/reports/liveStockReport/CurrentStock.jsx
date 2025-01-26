import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Flex,
  Input,
  message,
  Row,
  Select,
  Spin,
  Typography,
} from "antd";
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import dayjs from "dayjs";
import {
  createCurrentStockRequest,
  getCurrentStockReportService,
} from "../../../../api/requests/accounts/reports";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
import moment from "moment";

const DEFAULT_PARTICULARS = [
  "Raw Yarn stock",
  "Grey stock",
  "Roll stock",
  "Beam and machine stock",
  "Grey purchase stock",
  "Job stock",
  "Yarn stock",
];

const getTZformatDate = (date) => {
  return `${dayjs(date).format("YYYY-MM-DD")}T00:00:00.000Z`;
};

const CurrentStock = () => {
  const queryClient = useQueryClient();
  const { companyListRes } = useContext(GlobalContext);

  const [date, setDate] = useState(dayjs());
  const [rightDate, setRightDate] = useState();
  const [company, setCompany] = useState(null);
  const [numOfFields, setNumOfFields] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalMeters, setTotalMeters] = useState(0);

  const [rightTotalAmount, setRightTotalAmount] = useState(0);
  const [rightTotalMeters, setRightTotalMeters] = useState(0);

  function disabledFutureDate(current) {
    return current && current > moment().endOf("day");
  }
  

  const { mutateAsync: saveCurrentStock, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await createCurrentStockRequest({
        data,
        params: {
          company_id: company,
        },
      });
      return res.data;
    },
    mutationKey: ["save", "current-stock", "report"],
    onSuccess: (res) => {
      queryClient.invalidateQueries([
        "current-stock",
        "report",
        "data",
        { company, date },
      ]);
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

  const onSubmit = async (data) => {
    const payload = numOfFields.map((item) => {
      return {
        particular_name: data[`particular_name_${item}`],
        meters: data[`meters_${item}`],
        amount: data[`amount_${item}`],
        createdAt: getTZformatDate(date),
      };
    });

    await saveCurrentStock(payload);
  };

  const { control, handleSubmit, setValue, getValues, resetField } = useForm({
    defaultValues: {},
  });

  const { data: currentStockData, isFetching: isLoadingCurrentStock } =
    useQuery({
      queryKey: ["current-stock", "report", "data", { company, date }],
      queryFn: async () => {
        const res = await getCurrentStockReportService({
          params: {
            company_id: company,
            date: getTZformatDate(date),
          },
        });
        return res.data?.data;
      },
      enabled: Boolean(company && date),
    });

  const {
    data: rightCurrentStockData,
    isFetching: isLoadingRightCurrentStock,
  } = useQuery({
    queryKey: ["right-current-stock", "report", "data", { company, rightDate }],
    queryFn: async () => {
      const res = await getCurrentStockReportService({
        params: {
          company_id: company,
          date: getTZformatDate(rightDate),
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(company && rightDate),
  });

  useEffect(() => {
    if (!isLoadingRightCurrentStock) {
      let totalAmount = 0;
      let totalMeters = 0;
      if (
        rightCurrentStockData &&
        rightCurrentStockData?.stockOpeningReport?.length
      ) {
        rightCurrentStockData?.stockOpeningReport?.forEach((item) => {
          totalAmount += +item.amount;
          totalMeters += +item.meters;
        });

        setRightTotalAmount(totalAmount);
        setRightTotalMeters(totalMeters);
      }
    }
  }, [rightCurrentStockData, isLoadingRightCurrentStock, setValue]);

  useEffect(() => {
    if (!isLoadingCurrentStock) {
      let totalAmount = 0;
      let totalMeters = 0;
      if (currentStockData && currentStockData?.stockOpeningReport?.length) {
        const numOfFields = Array.from(
          { length: currentStockData?.stockOpeningReport?.length || 0 },
          (_, i) => i
        );

        setNumOfFields(numOfFields);
        currentStockData?.stockOpeningReport?.forEach((item, index) => {
          setValue(`id_${index}`, item.id);
          setValue(`particular_name_${index}`, item.particular_name);
          setValue(`meters_${index}`, item.meters);
          setValue(`amount_${index}`, item.amount);
          totalAmount += +item.amount;
          totalMeters += +item.meters;
        });
      } else {
        const numOfFields = Array.from(
          { length: DEFAULT_PARTICULARS.length || 0 },
          (_, i) => i
        );
        setNumOfFields(numOfFields);

        DEFAULT_PARTICULARS?.forEach((item, index) => {
          setValue(`particular_name_${index}`, item);
          setValue(`meters_${index}`, 0);
          setValue(`amount_${index}`, 0);
          totalAmount += 0;
          totalMeters += 0;
        });
      }

      setTotalAmount(totalAmount);
      setTotalMeters(totalMeters);
    }
  }, [currentStockData, isLoadingCurrentStock, setValue]);

  // ***********************************************************************

  const resetEntry = (fieldNo) => {
    resetField(`particular_name_${fieldNo}`, "");
    resetField(`meters_${fieldNo}`, "");
    resetField(`amount_${fieldNo}`, "");
  };

  const addNewEntry = () => {
    let nextNo = numOfFields.length;
    setNumOfFields((prev) => {
      return [...prev, nextNo];
    });
    resetEntry(nextNo);
  };

  const deleteEntry = async (fieldNo) => {
    const id = getValues(`id_${fieldNo}`);
    const data = currentStockData?.stockOpeningReport?.filter(
      (item) => item.id !== id
    );

    let hasError = false ; 
    const payload = data.map((item) => {
      const particularName = item?.particular_name ; 
      const amount = item?.amount ; 

      if (particularName === undefined || particularName === null || particularName === ''){
        hasError = true ; 
        message.warning("Please, Enter particular name") ; 
        return ; 
      }

      if (amount === undefined || amount === null || amount === ''){
        hasError = true ; 
        message.warning("Please, Enter amount")  ; 
        return ; 
      }

      return {
        particular_name: item.particular_name,
        meters: item.meters,
        amount: item.amount,
        createdAt: getTZformatDate(date),
      };
    });

    if (!hasError){
      await saveCurrentStock(payload);
      resetEntry(fieldNo);
    }
  };

  return (
    <Row gutter={12}>
      {/* Left Part */}
      <Col span={12}>
        <Card
          style={{
            width: "100%",
            margin: "auto",
            borderColor: "var(--primary-color)",
          }}
        >
          <Flex justify="space-between">
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap font-semibold">
                Date of Stock:
              </Typography.Text>
              <DatePicker
                value={date}
                format={"DD-MM-YYYY"}
                onChange={(selectedDate) => setDate(selectedDate)}
                disabledDate={disabledFutureDate}
              />
            </Flex>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap font-semibold">
                Company:
              </Typography.Text>
              <Select
                allowClear
                placeholder="Select Company"
                dropdownStyle={{
                  textTransform: "capitalize",
                }}
                style={{
                  textTransform: "capitalize",
                }}
                className="min-w-40"
                value={company}
                onChange={setCompany}
                options={
                  companyListRes &&
                  companyListRes?.rows.map((company) => {
                    return {
                      label: company?.company_name,
                      value: company?.id,
                    };
                  })
                }
              />
            </Flex>
          </Flex>

          <Divider />

          {!currentStockData ? (
            <Flex justify="center">
              <Typography.Text
                style={{
                  textAlign: "center",
                  color: "grey",
                  fontStyle: "italic",
                }}
              >
                Select company to see current stocks..
              </Typography.Text>
            </Flex>
          ) : isLoadingCurrentStock ? (
            <Flex justify="center">
              <Spin />
            </Flex>
          ) : (
            <div
              style={{ maxHeight: "calc(100vh - 352px)", overflowY: "auto" }}
            >
              <table className="custom-table" style={{ textAlign: "left" }}>
                <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                  <tr>
                    <th>Particular</th>
                    <th>KG/Meter</th>
                    <th>Amount</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {numOfFields && numOfFields.length ? (
                    numOfFields?.map((item) => {
                      const pname = getValues(`particular_name_${item}`);
                      const isDisable = DEFAULT_PARTICULARS.includes(pname);

                      return (
                        <tr key={item + "_current_stock_list"}>
                          <td>
                            <Controller
                              control={control}
                              name={`particular_name_${item}`}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  placeholder="Particular name"
                                  className="remove-input-style"
                                  disabled={isDisable}
                                />
                              )}
                            />
                          </td>
                          <td>
                            <Controller
                              control={control}
                              name={`meters_${item}`}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  placeholder="100"
                                  type="number"
                                  onChange={(e) => {
                                    field.onChange(+e.target.value);
                                  }}
                                  className="remove-input-style"
                                  // disabled={isDisable}
                                />
                              )}
                            />
                          </td>
                          <td>
                            <Controller
                              control={control}
                              name={`amount_${item}`}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  placeholder="100"
                                  type="number"
                                  onChange={(e) => {
                                    field.onChange(+e.target.value);
                                  }}
                                  className="remove-input-style"
                                  // disabled={isDisable}
                                />
                              )}
                            />
                          </td>

                          <td style={{ textAlign: "center", width: "60px" }}>
                            <Controller
                              control={control}
                              name={`id_${item}`}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  type="hidden"
                                  style={{ width: "20px" }}
                                  disabled={isDisable}
                                />
                              )}
                            />
                            {!isDisable && (
                              <Button
                                danger
                                style={{ width: "100%" }}
                                onClick={() => deleteEntry(item)}
                              >
                                <DeleteOutlined />
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center" }}>
                        No Data Found
                      </td>
                    </tr>
                  )}
                  <tr
                    style={{
                      position: "sticky",
                      bottom: -1,
                      zIndex: 1,
                      backgroundColor: "#f0f0f0",
                    }}
                  >
                    <td>Total</td>
                    <td>{totalMeters}</td>
                    <td>{totalAmount}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {!currentStockData ? null : (
            <Flex className="mt-5" justify="space-between">
              <Button
                className="w-100"
                icon={<PlusCircleOutlined />}
                type="primary"
                disabled={isPending}
                onClick={addNewEntry}
              >
                Add New Stock
              </Button>
              <Button
                style={{ backgroundColor: "#258025", color: "#fff" }}
                onClick={handleSubmit(onSubmit)}
                loading={isPending}
              >
                Save
              </Button>
            </Flex>
          )}
        </Card>
      </Col>

      {/* Right Part */}
      <Col span={12}>
        <Card
          style={{
            width: "100%",
            margin: "auto",
            borderColor: "var(--primary-color)",
          }}
        >
          <Flex justify="space-between">
            <Typography.Text className="m-0 text-primary font-semibold">
              Current Stock Data
            </Typography.Text>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap font-semibold">
                Stock Date:
              </Typography.Text>
              <DatePicker
                value={rightDate}
                format={"DD-MM-YYYY"}
                onChange={(selectedDate) => setRightDate(selectedDate)}
                disabledDate={disabledFutureDate}
              />
            </Flex>
          </Flex>

          <Divider />

          <div style={{ maxHeight: "calc(100vh - 300px)", overflowY: "auto" }}>
            <table className="custom-table" style={{ textAlign: "left" }}>
              <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                <tr>
                  <th>Date</th>
                  <th>Particular</th>
                  <th>KG/Meter</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingRightCurrentStock ? (
                  <Flex justify="center">
                    <Spin />
                  </Flex>
                ) : rightCurrentStockData &&
                  rightCurrentStockData?.stockOpeningReport?.length ? (
                  rightCurrentStockData?.stockOpeningReport?.map(
                    (item, index) => {
                      return (
                        <tr key={index + "_right_current_stock"}>
                          <td>{dayjs(item?.createdAt).format("DD-MM-YYYY")}</td>
                          <td>{item?.particular_name}</td>
                          <td>{item?.meters}</td>
                          <td>{item?.amount}</td>
                        </tr>
                      );
                    }
                  )
                ) : (
                  <tr>
                    <td style={{ textAlign: "center" }} colSpan={4}>
                      No data found
                    </td>
                  </tr>
                )}
                <tr
                  style={{
                    position: "sticky",
                    bottom: -1,
                    zIndex: 1,
                    backgroundColor: "#f0f0f0",
                  }}
                >
                  <td colSpan={2}>Total</td>
                  <td>{rightTotalMeters}</td>
                  <td>{rightTotalAmount}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default CurrentStock;
