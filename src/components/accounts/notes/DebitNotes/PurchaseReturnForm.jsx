import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  message,
  Radio,
  Row,
  Select,
} from "antd";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { useContext, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDebitNoteChallanNoDropDownRequest,
  getLastDebitNoteNumberRequest,
} from "../../../../api/requests/accounts/notes";
import dayjs from "dayjs";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  createYarnReturnRequest,
  getYarnReceiveByIdRequest,
} from "../../../../api/requests/purchase/yarnReceive";
import {
  addPurchaseReturnChallanRequest,
  getPurchaseTakaByIdRequest,
} from "../../../../api/requests/purchase/purchaseTaka";
import moment from "moment";
import { mutationOnErrorHandler } from "../../../../utils/mutationUtils";

const validationSchema = yup.object().shape({
  challan_no: yup.string().required("Please select challan no."),
  return_date: yup.string().required("Please enter date"),
});

const PurchaseReturnForm = ({ handleClose }) => {
  const { companyId } = useContext(GlobalContext);

  const {
    control,
    formState: { errors },
    watch,
    setError,
  } = useForm({
    defaultValues: {
      is_current: 1,
      return_date: dayjs(),
      challan_no: null,
    },
    resolver: yupResolver(validationSchema),
  });
  const { is_current, challan_no, return_date } = watch();

  const { data: debitNoteLastNumber } = useQuery({
    queryKey: [
      "get",
      "debit-notes",
      "last-number",
      {
        company_id: companyId,
      },
    ],
    queryFn: async () => {
      const params = {
        company_id: companyId,
      };
      const response = await getLastDebitNoteNumberRequest({ params });
      return response.data.data;
    },
    enabled: Boolean(companyId),
  });

  const { data: debitNoteChallanNo } = useQuery({
    queryKey: [
      "debit-note",
      "challan-no",
      "list",
      {
        company_id: companyId,
        end: is_current ? dayjs().get("year") : dayjs().get("year") - 1,
      },
    ],
    queryFn: async () => {
      const params = {
        company_id: companyId,
        end: is_current ? dayjs().get("year") : dayjs().get("year") - 1,
      };
      const response = await getDebitNoteChallanNoDropDownRequest({ params });
      return response?.data?.data || [];
    },
    enabled: Boolean(companyId),
  });

  const selectedChallan = useMemo(() => {
    if (debitNoteChallanNo && debitNoteChallanNo?.result?.length) {
      return debitNoteChallanNo?.result?.find(
        (item) => item.challan_id === challan_no
      );
    }
  }, [challan_no, debitNoteChallanNo]);

  const { data: challanData } = useQuery({
    queryKey: [
      "get",
      "selected-challan",
      "data",
      {
        company_id: companyId,
        id: selectedChallan?.challan_id,
      },
    ],
    queryFn: async () => {
      let response;
      switch (selectedChallan.model) {
        case "yarn_receive_challans":
          response = await getYarnReceiveByIdRequest({
            id: selectedChallan?.challan_id,
            params: { company_id: companyId },
          });
          return response?.data?.data;

        case "purchase_taka_challan":
          response = await getPurchaseTakaByIdRequest({
            id: selectedChallan?.challan_id,
            params: { company_id: companyId },
          });
          return response?.data?.data;

        default:
          return response;
      }
    },
    enabled: Boolean(companyId && selectedChallan?.challan_id),
  });

  return (
    <>
      <table className="credit-note-table">
        <tbody>
          <tr>
            <td colSpan={8}>
              <h2>Debit Note</h2>
            </td>
          </tr>
          <tr>
            <td colSpan={2} width={"33.33%"}>
              <div className="">
                Debit Note No.
                <div>{debitNoteLastNumber?.debitNoteNumber || "-"}</div>
              </div>
            </td>
            <td colSpan={2} width={"33.33%"}>
              <div className="">
                <div>Return Date:</div>
                <Form.Item
                  label=""
                  name="return_date"
                  validateStatus={errors.return_date ? "error" : ""}
                  help={errors.return_date && errors.return_date.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name="return_date"
                    render={({ field }) => (
                      <DatePicker
                        {...field}
                        name="date"
                        className="width-100"
                      />
                    )}
                  />
                </Form.Item>
              </div>
            </td>
            <td colSpan={2} width={"33.33%"}>
              <div className="">
                <Form.Item label="" name="is_current">
                  <Controller
                    control={control}
                    name="is_current"
                    render={({ field }) => (
                      <Radio.Group {...field}>
                        <Radio value={1}>Current Year</Radio>
                        <Radio value={0}>Previous Year</Radio>
                      </Radio.Group>
                    )}
                  />
                </Form.Item>

                <Form.Item
                  label=""
                  name="challan_no"
                  validateStatus={errors.challan_no ? "error" : ""}
                  help={errors.challan_no && errors.challan_no.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name="challan_no"
                    render={({ field }) => (
                      <Select
                        {...field}
                        className="width-100"
                        placeholder="Select Purchase Challan no."
                        style={{
                          textTransform: "capitalize",
                        }}
                        dropdownStyle={{
                          textTransform: "capitalize",
                        }}
                        options={
                          debitNoteChallanNo &&
                          debitNoteChallanNo?.result?.length
                            ? debitNoteChallanNo?.result.map((item) => {
                                return {
                                  label: item.challan_number,
                                  value: item.challan_id,
                                };
                              })
                            : []
                        }
                      />
                    )}
                  />
                </Form.Item>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {selectedChallan?.model === "yarn_receive_challans" ? (
        <YarnReceiveChallan
          companyId={companyId}
          details={challanData?.yarnRecive}
          handleClose={handleClose}
        />
      ) : null}

      {selectedChallan?.model === "purchase_taka_challan" ? (
        <PurchaseTakaChallan
          companyId={companyId}
          details={challanData}
          handleClose={handleClose}
          returnDate={return_date}
          setError={setError}
        />
      ) : null}
    </>
  );
};

export default PurchaseReturnForm;

const YarnReceiveChallan = ({ companyId, details, handleClose }) => {
  const queryClient = useQueryClient();

  function disabledFutureDate(current) {
    return current && current > moment().endOf("day");
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    // resolver: yarnReturnResolverSchema,
    defaultValues: {},
  });

  useEffect(() => {
    setValue(
      "challan_date",
      moment(details?.challan_date).format("YYYY-MM-DD")
    );
    setValue("challan_no", details?.challan_no);
    setValue("yarn_company", details?.yarn_stock_company?.yarn_company_name);
    setValue(
      "yarn_dennier",
      `${details?.yarn_stock_company?.yarn_denier} (${details?.yarn_stock_company?.yarn_Sub_type} ${details?.yarn_stock_company?.luster_type}  ${details?.yarn_stock_company?.yarn_color})`
    );
    setValue("total_quantity", details?.receive_quantity);
    setValue("total_cartoon", details?.receive_cartoon_pallet);
    setValue(
      "supplier_name",
      details?.yarn_bill_detail?.yarn_bill?.supplier?.supplier?.supplier_name
    );
    setValue(
      "supplier_company",
      details?.yarn_bill_detail?.yarn_bill?.supplier?.supplier?.supplier_company
    );
  }, [details, setValue]);

  const { total_quantity, return_quantity } = watch();

  useEffect(() => {
    if (total_quantity < return_quantity) {
      message.error("Return quantity should be less than total quantity");
    }
  }, [total_quantity, return_quantity]);

  const { mutateAsync: createReturnYarn, isPending } = useMutation({
    mutationFn: async (data) => {
      //   setLoading(true);
      const res = await createYarnReturnRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["yarn-receive", "return", "create"],
    onSuccess: (res) => {
      // setIsModalOpen(false);
      //   setLoading(false);
      queryClient.invalidateQueries([
        "yarn-stock/yarn-receive-challan/list",
        { company_id: companyId },
      ]);
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      handleClose();
    },
    onError: (error) => {
      //   setLoading(false);
      mutationOnErrorHandler({ error, message });
    },
  });

  const onSubmit = async (data) => {
    let requestPayload = {
      yarn_challan_id: details?.id,
      return_quantity: data?.return_quantity,
      return_cartoon: data?.return_cartoon,
      createdAt: data?.createdAt,
    };
    await createReturnYarn(requestPayload);
  };

  return (
    <>
      {/* MODEL: yarn_receive_challans */}
      <Form
        layout="vertical"
        style={{ margin: "0" }}
        // onFinish={handleSubmit(HandleSubmit)}
      >
        <Row gutter={24}>
          <Col span={6}>
            <Form.Item label="Challan Date" name="challan_date">
              <Controller
                control={control}
                name={`challan_date`}
                render={({ field }) => <Input readOnly {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Challan No" name="challan_no">
              <Controller
                control={control}
                name={`challan_no`}
                render={({ field }) => <Input readOnly {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Yarn Company" name="yarn_company">
              <Controller
                control={control}
                name={`yarn_company`}
                render={({ field }) => <Input readOnly {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Yarn Dennier" name="yarn_dennier">
              <Controller
                control={control}
                name={`yarn_dennier`}
                render={({ field }) => <Input readOnly {...field} />}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={6}>
            <Form.Item label="Supplier Name" name="supplier_name">
              <Controller
                control={control}
                name={`supplier_name`}
                render={({ field }) => <Input readOnly {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Supplier Company" name="supplier_company">
              <Controller
                control={control}
                name={`supplier_company`}
                render={({ field }) => <Input readOnly {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Total Quantity" name="total_quantity">
              <Controller
                control={control}
                name={`total_quantity`}
                render={({ field }) => <Input readOnly {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Total Cartoon" name="total_cartoon">
              <Controller
                control={control}
                name={`total_cartoon`}
                render={({ field }) => <Input readOnly {...field} />}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={6}>
            <Form.Item
              label="Return Quantity"
              required
              name="return_quantity"
              validateStatus={errors.return_quantity ? "error" : ""}
              help={errors.return_quantity && errors.return_quantity.message}
            >
              <Controller
                control={control}
                name={`return_quantity`}
                render={({ field }) => <Input {...field} type="number" />}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Return Cartoon"
              required
              name="return_cartoon"
              validateStatus={errors.return_cartoon ? "error" : ""}
              help={errors.return_cartoon && errors.return_cartoon.message}
            >
              <Controller
                control={control}
                name={`return_cartoon`}
                render={({ field }) => <Input {...field} type="number" />}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Return Date"
              name="createdAt"
              validateStatus={errors.createdAt ? "error" : ""}
              help={errors.createdAt && errors.createdAt.message}
            >
              <Controller
                control={control}
                name={`createdAt`}
                render={({ field }) => (
                  <DatePicker
                    format="YYYY-MM-DD"
                    {...field}
                    disabledDate={disabledFutureDate}
                  />
                )}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <Flex gap={12} justify="flex-end">
        <Button
          type="primary"
          onClick={handleSubmit(onSubmit)}
          loading={isPending}
        >
          Generate
        </Button>
        <Button>Close</Button>
      </Flex>
    </>
  );
};

const PurchaseTakaChallan = ({
  companyId,
  details,
  handleClose,
  returnDate,
  setError,
}) => {
  const queryClient = useQueryClient();

  const TakaArray = Array(12).fill(0);

  const [totalTaka1, setTotalTaka1] = useState(0);
  const [totalTaka2, setTotalTaka2] = useState(0);
  const [totalMeter, setTotalMeter] = useState(0);

  const [selectedPurchaseId, setSelectedPurchaseId] = useState([]);

  const [totalReturnMeter, setTotalReturnMeter] = useState(0);

  const { mutateAsync: createPurchaseReturnChallan } = useMutation({
    mutationFn: async (data) => {
      const res = await addPurchaseReturnChallanRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["add", "return", "purchase", "challan"],
    onSuccess: (res) => {
      queryClient.invalidateQueries([
        "purchaseTaka",
        "challan",
        "list",
        companyId,
      ]);
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      handleClose();
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(errorMessage);
    },
  });

  const submitHandler = async () => {
    if (!returnDate) {
      setError("return_date", {
        type: "custom",
        message: "Return date is required.",
      });
      return;
    }

    const payload = {
      purchase_challan_id: details.id,
      purchase_challan_detail_ids: selectedPurchaseId,
      createdAt: dayjs(returnDate).format("YYYY-MM-DD"),
      supplier_name: details.supplier.supplier_name,
      quality_id: details.quality_id,
    };
    await createPurchaseReturnChallan(payload);
  };

  const handleSelectSaleChallan = (event, index) => {
    if (event.target.checked) {
      setSelectedPurchaseId((prev) => {
        return [...prev, details?.purchase_challan_details[index]?.id];
      });
      setTotalReturnMeter(
        (prev) => prev + +details?.purchase_challan_details[index]?.meter
      );
    } else {
      setSelectedPurchaseId((prev) => {
        return prev.filter(
          (i) => i !== details?.purchase_challan_details[index]?.id
        );
      });
      setTotalReturnMeter(
        (prev) => prev - +details?.purchase_challan_details[index]?.meter
      );
    }
  };

  useEffect(() => {
    let tempTotal1 = 0;
    let tempTotal2 = 0;

    TakaArray?.map((element, index) => {
      tempTotal1 =
        Number(tempTotal1) +
        Number(details?.purchase_challan_details[index]?.meter || 0);
      tempTotal2 =
        Number(tempTotal2) +
        Number(details?.purchase_challan_details[index + 12]?.meter || 0);
    });

    let total = Number(tempTotal1) + Number(tempTotal2);

    setTotalMeter(total);
    setTotalTaka1(tempTotal1);
    setTotalTaka2(tempTotal2);
  }, [TakaArray, details]);

  return (
    <>
      {details ? (
        <>
          <Row
            className="p-4 border-0 border-b border-solid !m-0"
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
            return (
              <Row
                key={index}
                className="p-3 border-0"
                style={{ borderTop: 0 }}
              >
                <Col span={1} style={{ textAlign: "center" }}>
                  {details?.purchase_challan_details[index]?.is_returned ===
                    false && (
                    <Checkbox
                      checked={selectedPurchaseId.includes(
                        details?.purchase_challan_details[index]?.id
                      )}
                      onChange={(e) => handleSelectSaleChallan(e, index)}
                    />
                  )}
                </Col>
                <Col span={1} style={{ textAlign: "center", fontWeight: 600 }}>
                  {index + 1}
                </Col>
                <Col span={5} style={{ textAlign: "center" }}>
                  {details?.purchase_challan_details[index]?.taka_no}
                </Col>
                <Col span={5} style={{ textAlign: "center" }}>
                  {details?.purchase_challan_details[index]?.meter}
                </Col>
                <Col span={1} style={{ textAlign: "center" }}>
                  {details?.purchase_challan_details[index + 12]
                    ?.is_returned === false && (
                    <Checkbox
                      checked={details.includes(
                        details?.purchase_challan_details[index + 12]?.id
                      )}
                      // onChange={(e) => handleSelectSaleChallan(e, index + 12)}
                    />
                  )}
                </Col>
                <Col span={1} style={{ textAlign: "center", fontWeight: 600 }}>
                  {index + 13}
                </Col>
                <Col span={5} style={{ textAlign: "center" }}>
                  {details?.purchase_challan_details[index + 12]?.taka_no}
                </Col>
                <Col span={5} style={{ textAlign: "center" }}>
                  {details?.purchase_challan_details[index + 12]?.meter}
                </Col>
              </Row>
            );
          })}

          <Row className="p-3 border-0" style={{ borderTop: 0 }}>
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
            {!details ? (
              <tr>
                <td colSpan={2}>No taka found</td>
              </tr>
            ) : null}

            <tr>
              <td>Total Taka: {details?.purchase_challan_details?.length}</td>
              <td>Total Meter: {totalMeter}</td>
            </tr>

            <tr>
              <td>Return Taka: {selectedPurchaseId?.length || 0}</td>
              <td>Return Meter: {totalReturnMeter || 0}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Flex gap={12} justify="flex-end">
        <Button
          type="primary"
          onClick={submitHandler}
          // loading={isPending}
        >
          Generate
        </Button>
        <Button>Close</Button>
      </Flex>
    </>
  );
};
