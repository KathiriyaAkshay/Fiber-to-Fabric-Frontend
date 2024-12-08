import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Empty,
  Flex,
  message,
  Modal,
  Radio,
  Row,
  Select,
  Typography,
} from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { useContext, useEffect, useState } from "react";
import {
  createSaleChallanReturnRequest,
  getSaleChallanByIdRequest,
  getSaleChallanListRequest,
} from "../../../../api/requests/sale/challan/challan";
// import "./_style.css";
import dayjs from "dayjs";
import { getLastCreditNoteNumberRequest } from "../../../../api/requests/accounts/notes";
import moment from "moment";
import { CloseOutlined } from "@ant-design/icons";

const AddSaleReturnType = ({ setIsAddModalOpen, isAddModalOpen }) => {
  const TakaArray = Array(12).fill(0);

  const { companyId } = useContext(GlobalContext);
  const queryClient = useQueryClient();
  const [returnDate, setReturnDate] = useState(dayjs());
  const [yearValue, setYearValue] = useState("previous");
  const [challanNo, setChallanNo] = useState(null);

  const [totalTaka1, setTotalTaka1] = useState(0);
  const [totalTaka2, setTotalTaka2] = useState(0);
  const [totalMeter, setTotalMeter] = useState(0);

  const [selectedSaleChallan, setSelectedSaleChallan] = useState([]);
  const [totalReturnMeter, setTotalReturnMeter] = useState(0);

  const { mutateAsync: AddSaleChallanReturn, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await createSaleChallanReturnRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["sale", "challan", "return", "add"],
    onSuccess: (res) => {
      queryClient.invalidateQueries(["get", "credit-notes", "list", companyId]);
      queryClient.invalidateQueries(["get", "credit-notes", "list"]);
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      setIsAddModalOpen(false);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(errorMessage);
    },
  });

  const submitHandler = async () => {
    if (!challanNo) {
      message.error("Challan no is required.");
      return;
    }
    if (!selectedSaleChallan || !selectedSaleChallan?.length) {
      message.error("Please select at least one sale challan.");
      return;
    }
    const payload = {
      sale_challan_id: saleChallanData?.saleChallan?.id,
      sale_challan_detail_ids: selectedSaleChallan,
      createdAt: dayjs(returnDate).format("YYYY-MM-DD"),
      supplier_name: saleChallanData?.saleChallan?.supplier?.supplier_name,
      quality_id: saleChallanData?.saleChallan?.quality_id,
    };
    await AddSaleChallanReturn(payload);
  };

  const handleSelectSaleChallan = (event, index) => {
    if (event.target.checked) {
      setSelectedSaleChallan((prev) => {
        return [
          ...prev,
          saleChallanData?.saleChallan?.sale_challan_details[index]?.id,
        ];
      });
      setTotalReturnMeter(
        (prev) =>
          prev +
          +saleChallanData?.saleChallan?.sale_challan_details[index]?.meter
      );
    } else {
      setSelectedSaleChallan((prev) => {
        return prev.filter(
          (i) =>
            i !== saleChallanData?.saleChallan?.sale_challan_details[index]?.id
        );
      });
      setTotalReturnMeter(
        (prev) =>
          prev -
          +saleChallanData?.saleChallan?.sale_challan_details[index]?.meter
      );
    }
  };

  const { data: saleChallanList, isLoadingSaleChallan } = useQuery({
    queryKey: [
      "saleChallan",
      "list",
      {
        company_id: companyId,
        end:
          yearValue === "previous"
            ? dayjs().get("year") - 1
            : dayjs().get("year"),
      },
    ],
    queryFn: async () => {
      const params = {
        company_id: companyId,
        page: 0,
        pageSize: 99999,
        endInclude : `bill_status,pending`,
        end:
          yearValue === "previous"
            ? dayjs().get("year") 
            : dayjs().get("year") + 1,
             
      };
      const res = await getSaleChallanListRequest({ params });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const { data: saleChallanData } = useQuery({
    queryKey: [
      "saleChallan",
      "data",
      {
        company_id: companyId,
        challanNo: challanNo,
      },
    ],
    queryFn: async () => {
      const params = {
        company_id: companyId,
      };
      const res = await getSaleChallanByIdRequest({ id: challanNo, params });
      return res.data?.data;
    },
    enabled: Boolean(challanNo),
  });

  useEffect(() => {
    let tempTotal1 = 0;
    let tempTotal2 = 0;

    TakaArray?.map((element, index) => {
      tempTotal1 =
        Number(tempTotal1) +
        Number(
          saleChallanData?.saleChallan?.sale_challan_details[index]?.meter || 0
        );
      tempTotal2 =
        Number(tempTotal2) +
        Number(
          saleChallanData?.saleChallan?.sale_challan_details[index + 12]
            ?.meter || 0
        );
    });

    let total = Number(tempTotal1) + Number(tempTotal2);

    setTotalMeter(total);
    setTotalTaka1(tempTotal1);
    setTotalTaka2(tempTotal2);
  }, [TakaArray, saleChallanData]);

  const { data: creditNoteLastNumber } = useQuery({
    queryKey: [
      "get",
      "credit-notes",
      "last-number",
      {
        company_id: companyId,
      },
    ],
    queryFn: async () => {
      const params = {
        company_id: companyId,
      };
      const response = await getLastCreditNoteNumberRequest({ params });
      return response.data.data;
    },
    enabled: Boolean(companyId),
  });

  function disabledFutureDate(current) {
    return current && current > moment().endOf("day");
  }

  return (
    <Modal
      open={isAddModalOpen}
      closeIcon={<CloseOutlined className="text-white" />}
      width={"75%"}
      title="Credit Note - Sale Return"
      onCancel={() => {
        setIsAddModalOpen(false);
        setSelectedSaleChallan([]);
      }}
      footer={false}
      centered
      className={{
        header: "text-center",
      }}
      classNames={{
        header: "text-center",
      }}
      styles={{
        content: {
          padding: 0,
        },
        header: {
          padding: "16px",
          margin: 0,
        },
        body: {
          padding: "16px 32px",
        },
      }}
    >
      <div className="credit-note-container">
        {/* <h2>Credit Note</h2> */}
        <table className="credit-note-table">
          <tbody>
            <tr>
              <td colSpan={2} width={"33.33%"}>
                <div className="year-toggle">
                  <Typography.Text style={{ fontSize: 20 }}>
                    Credit Note No.
                  </Typography.Text>
                  <div>{creditNoteLastNumber?.debitNoteNumber || ""}</div>
                </div>
              </td>

              <td colSpan={2} width={"33.33%"}>
                <div
                  className="year-toggle"
                  style={{
                    paddingLeft: 10,
                    paddingRight: 10,
                  }}
                >
                  <label style={{ textAlign: "left" }}>Return Date:</label>
                  <DatePicker
                    value={returnDate}
                    onChange={(selectedDate) => setReturnDate(selectedDate)}
                    className="width-100"
                    disabledDate={disabledFutureDate}
                  />
                </div>
              </td>

              <td colSpan={2} width={"33.33%"}>
                <div
                  className="year-toggle"
                  style={{
                    paddingLeft: 10,
                    paddingRight: 10,
                  }}
                >
                  <Radio.Group
                    value={yearValue}
                    onChange={(e) => setYearValue(e.target.value)}
                  >
                    <Flex>
                      <Radio style={{ fontSize: "12px" }} value={"previous"}>
                        Previous Year
                      </Radio>
                      <Radio style={{ fontSize: "12px" }} value={"current"}>
                        Current Year
                      </Radio>
                    </Flex>
                  </Radio.Group>
                  <Select
                    className="width-100 mt-3"
                    placeholder="Select Sale Challan No"
                    loading={isLoadingSaleChallan}
                    options={
                      saleChallanList &&
                      saleChallanList?.row?.map((challan) => ({
                        label: challan.challan_no,
                        value: challan.id,
                      }))
                    }
                    style={{
                      textTransform: "capitalize",
                    }}
                    dropdownStyle={{
                      textTransform: "capitalize",
                    }}
                    value={challanNo}
                    onChange={setChallanNo}
                  />
                </div>
              </td>
            </tr>
            <tr width="50%">
              <td colSpan={3}>
                <div className="credit-note-info-title">
                  <span>GSTIN/UIN:</span>
                </div>
                <div className="credit-note-info-title">
                  <span>State Name:</span>
                </div>
                <div className="credit-note-info-title">
                  <span>PinCode:</span>
                </div>
                <div className="credit-note-info-title">
                  <span>Contact:</span>
                </div>
                <div className="credit-note-info-title">
                  <span>Email:</span>
                </div>
              </td>
              <td colSpan={3}>
                <div className="credit-note-info-title">
                  <span>Party:</span>{" "}
                  <span
                    style={{
                      fontWeight: 400,
                      marginLeft: 10,
                    }}
                  >
                    {String(
                      `${
                        saleChallanData?.saleChallan?.party?.first_name || ""
                      } ${saleChallanData?.saleChallan?.party?.last_name || ""}`
                    ).toUpperCase()}
                  </span>
                </div>
                <div className="credit-note-info-title">
                  <span>GSTIN/UIN:</span>
                  <span style={{ fontWeight: 400, marginLeft: 10 }}>
                    {
                      saleChallanData?.saleChallan?.party?.party
                        ?.company_gst_number
                    }
                  </span>
                </div>
                <div className="credit-note-info-title">
                  <span>Order No:</span>
                  <span style={{ fontWeight: 400, marginLeft: 10 }}>
                    {saleChallanData?.saleChallan?.gray_order?.order_no}
                  </span>
                </div>
                <div className="credit-note-info-title">
                  <span>Quality Name:</span>
                  <span
                    style={{
                      fontWeight: 400,
                      marginLeft: 10,
                    }}
                  >
                    {
                      saleChallanData?.saleChallan?.inhouse_quality
                        ?.quality_name
                    }{" "}
                    (
                    {
                      saleChallanData?.saleChallan?.inhouse_quality
                        ?.quality_weight
                    }
                    )
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {saleChallanData ? (
          <>
            <div
              style={{
                paddingTop: 20,
                borderLeft: "1px solid #ccc",
                borderRight: "1px solid #ccc",
              }}
            >
              <Row
                className="border-0 border-b border-solid !m-0"
                style={{ borderBottom: 0 }}
              >
                <Col span={1} style={{ textAlign: "center" }}>
                  <strong></strong>
                </Col>
                <Col span={1} style={{ textAlign: "center" }}>
                  <strong>No</strong>
                </Col>
                <Col span={5} style={{ textAlign: "center" }}>
                  <strong>TAKA NO</strong>
                </Col>
                <Col span={5} style={{ textAlign: "center" }}>
                  <strong>Meter</strong>
                </Col>
                <Col span={1} style={{ textAlign: "center" }}>
                  <strong></strong>
                </Col>
                <Col span={1} style={{ textAlign: "center" }}>
                  <strong>No</strong>
                </Col>
                <Col span={5} style={{ textAlign: "center" }}>
                  <strong>TAKA NO</strong>
                </Col>
                <Col span={5} style={{ textAlign: "center" }}>
                  <strong>Meter</strong>
                </Col>
              </Row>
              {TakaArray?.map((element, index) => {
                const isReturned =
                  saleChallanData?.saleChallan?.sale_challan_details[index]
                    ?.is_returned;

                const isReturned2 =
                  saleChallanData?.saleChallan?.sale_challan_details[index + 12]
                    ?.is_returned;

                return (
                  <Row
                    key={index}
                    className="p-3 border-0"
                    style={{ borderTop: 0 }}
                  >
                    <Col span={1} style={{ textAlign: "center" }}>
                      {saleChallanData?.saleChallan?.sale_challan_details[index]
                        ?.is_returned === false && (
                        <Checkbox
                          checked={selectedSaleChallan.includes(
                            saleChallanData?.saleChallan?.sale_challan_details[
                              index
                            ]?.id
                          )}
                          onChange={(e) => handleSelectSaleChallan(e, index)}
                        />
                      )}
                    </Col>

                    <Col
                      span={1}
                      style={{ textAlign: "center", fontWeight: 600 }}
                    >
                      {index + 1}
                    </Col>

                    <Col
                      span={5}
                      style={{
                        textAlign: "center",
                        color: isReturned ? "red" : "inherit",
                      }}
                    >
                      {
                        saleChallanData?.saleChallan?.sale_challan_details[
                          index
                        ]?.taka_no
                      }
                      {isReturned ? "(return)" : ""}
                    </Col>

                    <Col
                      span={5}
                      style={{
                        textAlign: "center",
                        color: isReturned ? "red" : "inherit",
                      }}
                    >
                      {
                        saleChallanData?.saleChallan?.sale_challan_details[
                          index
                        ]?.meter
                      }
                    </Col>

                    <Col span={1} style={{ textAlign: "center" }}>
                      {saleChallanData?.saleChallan?.sale_challan_details[
                        index + 12
                      ]?.is_returned === false && (
                        <Checkbox
                          checked={selectedSaleChallan.includes(
                            saleChallanData?.saleChallan?.sale_challan_details[
                              index + 12
                            ]?.id
                          )}
                          onChange={(e) =>
                            handleSelectSaleChallan(e, index + 12)
                          }
                        />
                      )}
                    </Col>
                    <Col
                      span={1}
                      style={{ textAlign: "center", fontWeight: 600 }}
                    >
                      {index + 13}
                    </Col>
                    <Col
                      span={5}
                      style={{
                        textAlign: "center",
                        color: isReturned2 ? "red" : "inherit",
                      }}
                    >
                      {
                        saleChallanData?.saleChallan?.sale_challan_details[
                          index + 12
                        ]?.taka_no
                      }
                      {isReturned2 ? "(return)" : ""}
                    </Col>
                    <Col
                      span={5}
                      style={{
                        textAlign: "center",
                        color: isReturned2 ? "red" : "inherit",
                      }}
                    >
                      {
                        saleChallanData?.saleChallan?.sale_challan_details[
                          index + 12
                        ]?.meter
                      }
                    </Col>
                  </Row>
                );
              })}
            </div>

            <Row
              className="p-3 border-0"
              style={{
                borderTop: "1px solid #ccc",
                borderLeft: "1px solid #ccc",
                borderRight: "1px solid #ccc",
              }}
            >
              <Col span={1} style={{ textAlign: "center" }}></Col>
              <Col span={1} style={{ textAlign: "center" }}></Col>
              <Col span={5} style={{ textAlign: "center" }}></Col>
              <Col span={5} style={{ textAlign: "center" }}>
                <strong>{totalTaka1}</strong>
              </Col>

              <Col span={1} style={{ textAlign: "center" }}></Col>
              <Col span={1} style={{ textAlign: "center" }}></Col>
              <Col span={5} style={{ textAlign: "center" }}></Col>
              <Col span={5} style={{ textAlign: "center" }}>
                <strong>{totalTaka2}</strong>
              </Col>
            </Row>
          </>
        ) : null}

        <div className="total-summary">
          <table className="summary-table">
            <tbody>
              {!saleChallanData ? (
                <tr>
                  <td colSpan={2}>
                    <Empty description="No Taka Found" />
                  </td>
                </tr>
              ) : null}

              <tr>
                <td className="total-information-data">
                  Total Taka:{" "}
                  {saleChallanData?.saleChallan?.sale_challan_details?.length}
                </td>
                <td className="total-information-data">
                  Total Meter: {totalMeter}
                </td>
              </tr>

              <tr>
                <td className="return-information-data">
                  Return Taka: {selectedSaleChallan?.length || 0}
                </td>
                <td className="return-information-data">
                  Return Meter: {totalReturnMeter || 0}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Flex
          style={{
            marginTop: "1rem",
            alignItems: "center",
            width: "100%",
            justifyContent: "flex-end",
            gap: "1rem",
            marginBottom: 10,
          }}
        >
          <Button
            type="primary"
            onClick={submitHandler}
            loading={isPending}
            style={{ marginRight: 10 }}
          >
            Sales Return
          </Button>
        </Flex>
      </div>
    </Modal>
  );
};

export default AddSaleReturnType;
