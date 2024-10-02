import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  DatePicker,
  Flex,
  Form,
  Input,
  message,
  Radio,
  Select,
} from "antd";
import { Controller, useForm } from "react-hook-form";
import {
  createDebitNoteRequest,
  getDebitNoteBillDropDownRequest,
  getLastDebitNoteNumberRequest,
} from "../../../../api/requests/accounts/notes";
import { useContext, useEffect } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import dayjs from "dayjs";
import { getYarnReceiveBillByIdRequest } from "../../../../api/requests/purchase/yarnReceive";
import { getJobTakaBillByIdRequest } from "../../../../api/requests/job/bill/jobBill";
import {
  getGeneralPurchaseByIdRequest,
  getReceiveSizeBeamBillByIdRequest,
} from "../../../../api/requests/purchase/purchaseSizeBeam";
import { getPurchaseTakaBillByIdRequest } from "../../../../api/requests/purchase/bill";
import { getReworkChallanByIdRequest } from "../../../../api/requests/job/challan/reworkChallan";

const ClaimNoteForm = ({ type, handleClose }) => {
  const queryClient = useQueryClient();
  const { companyId, company } = useContext(GlobalContext);

  const { mutateAsync: addDebitClaimNOte, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await createDebitNoteRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["add", "debit", "claim-note"],
    onSuccess: (res) => {
      queryClient.invalidateQueries([
        "get",
        "debit-notes",
        "last-number",
        {
          company_id: companyId,
        },
      ]);
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      reset();
      handleClose();
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(errorMessage);
    },
  });

  const onSubmit = async (data) => {
    const selectedBillData = billList?.result?.find(
      (item) => item.bill_id === data?.bill_id
    );

    const payload = {
      supplier_id: billData?.supplier_id,
      model: selectedBillData?.model,
      debit_note_number: debitNoteLastNumber?.debitNoteNumber || "",
      debit_note_type: type,
      // sale_challan_id: 456,
      quality_id: data?.quality_id,
      // gray_order_id: 321,
      // party_id: 654,
      // return_id: 987,
      total_taka: +data.total_taka,
      total_meter: +data.total_meter,
      discount_value: +data.discount_value,
      discount_amount: +data.discount_amount,
      SGST_value: +data.SGST_value,
      SGST_amount: +data.SGST_amount,
      CGST_value: +data.CGST_value,
      CGST_amount: +data.CGST_amount,
      IGST_value: +data.IGST_value,
      IGST_amount: +data.IGST_amount,
      round_off_amount: +data.round_off_amount,
      net_amount: +data.net_amount,
      // net_rate: 6.67,
      // tcs_value: 0.75,
      // tcs_amount: 11.25,
      // extra_tex_value: 1.0,
      // extra_tex_amount: 15.0,
      createdAt: dayjs(data.date).format("YYYY-MM-DD"),
      debit_note_details: [
        {
          bill_id: data.bill_id,
          model: selectedBillData?.model,
          rate: +data.rate,
          per: 1.0,
          invoice_no: data?.invoice_number,
          particular_name: "Claim On Purchase",
          quality: billData?.inhouse_quality?.quality_weight,
          amount: +data.amount,
        },
      ],
    };

    await addDebitClaimNOte(payload);
  };

  const { control, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: {
      is_current: 1,
      date: dayjs(),
      bill_id: null,
      amount: "",

      //
      supplier_id: "",
      sale_challan_id: "",
      quality_id: "",

      SGST_value: 0,
      SGST_amount: 0,
      CGST_value: 0,
      CGST_amount: 0,
      IGST_value: 0,
      IGST_amount: 0,
      round_off_amount: 0,
      net_amount: "",
      rate: "",
      invoice_number: "",
      total_taka: "",
      total_meter: "",
      discount_value: "",
      discount_amount: "",
    },
  });

  const currentValue = watch();
  const {
    is_current,
    bill_id,
    SGST_value,
    SGST_amount,
    CGST_value,
    CGST_amount,
    IGST_value,
    IGST_amount,
    round_off_amount,
    amount,
    net_amount,
  } = currentValue;

  useEffect(() => {
    if (amount) {
      const SGSTAmount = (amount * SGST_value) / 100;
      setValue("SGST_amount", SGSTAmount.toFixed(2));

      const CGSTAmount = (amount * CGST_value) / 100;
      setValue("CGST_amount", CGSTAmount.toFixed(2));

      const IGSTAmount = (amount * IGST_value) / 100;
      setValue("IGST_amount", IGSTAmount.toFixed(2));

      const netAmount =
        +amount + +SGSTAmount + +CGSTAmount + +IGSTAmount + +round_off_amount;

      setValue("net_amount", netAmount.toFixed(2));
    }
  }, [CGST_value, IGST_value, SGST_value, amount, round_off_amount, setValue]);

  const { data: billList } = useQuery({
    queryKey: [
      "debit-note",
      "bill",
      "list",
      { company_id: companyId, type: "claim_note", is_current },
    ],
    queryFn: async () => {
      const params = {
        company_id: companyId,
        type: "claim_note",
        supplier_id: 0,
        is_current,
      };
      const response = await getDebitNoteBillDropDownRequest({ params });
      return response?.data?.data || [];
    },
    enabled: Boolean(companyId),
  });

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

  const { data: billData } = useQuery({
    queryKey: [
      "get",
      "selected-bill",
      "data",
      {
        company_id: companyId,
        bill_id: bill_id,
      },
    ],
    queryFn: async () => {
      let response;
      const selectedBillData = billList?.result?.find(
        (item) => item.bill_id === bill_id
      );
      switch (selectedBillData.model) {
        case "yarn_bills":
          response = await getYarnReceiveBillByIdRequest({
            id: selectedBillData.bill_id,
            params: { company_id: companyId },
          });
          return response?.data?.data;

        case "job_taka_bills":
          response = await getJobTakaBillByIdRequest({
            params: {
              company_id: companyId,
              bill_id: selectedBillData.bill_id,
            },
          });
          return response?.data?.data;

        case "receive_size_beam_bill":
          response = await getReceiveSizeBeamBillByIdRequest({
            id: selectedBillData.bill_id,
            params: {
              company_id: companyId,
            },
          });
          return response?.data?.data?.receive;

        case "general_purchase_entries":
          response = await getGeneralPurchaseByIdRequest({
            id: selectedBillData.bill_id,
            params: { company_id: companyId },
          });
          return response?.data?.data;

        case "purchase_taka_bills":
          response = await getPurchaseTakaBillByIdRequest({
            params: {
              company_id: companyId,
              challan_id: selectedBillData.bill_id,
            },
          });
          return response?.data?.data;

        case "job_rework_bill":
          response = await getReworkChallanByIdRequest({
            id: selectedBillData.bill_id,
            params: {
              company_id: companyId,
            },
          });
          return response?.data?.data;

        default:
          return response;
      }
    },
    enabled: Boolean(companyId && bill_id),
  });

  useEffect(() => {
    if (billData && Object.keys(billData)) {
      setValue("supplier_id", billData?.supplier_id);
      // setValue("sale_challan_id", billData?.supplier_id);
      setValue("quality_id", billData?.inhouse_quality_id);

      setValue("SGST_value", billData?.SGST_value);
      // setValue("SGST_amount", billData?.SGST_amount);
      setValue("CGST_value", billData?.CGST_value);
      // setValue("CGST_amount", billData?.CGST_amount);
      setValue("IGST_value", billData?.IGST_value);
      // setValue("IGST_amount", billData?.IGST_amount);
      setValue("round_off_amount", billData?.round_off);
      setValue("net_amount", billData?.net_amount);
      setValue("rate", billData?.rate);
      setValue("invoice_number", billData?.invoice_number);

      setValue("total_taka", billData?.total_taka);
      setValue("total_meter", billData?.total_meter);
      setValue("discount_value", billData?.discount_value);
      setValue("discount_amount", billData?.discount_amount);
    }
  }, [billData, setValue]);

  return (
    <Form>
      <table className="credit-note-table">
        <tbody>
          <tr>
            <td colSpan={8} className="text-center">
              <h2>Claim Note</h2>
            </td>
          </tr>
          <tr>
            <td colSpan={3} width={"33.33%"}>
              <div className="p-2">
                Debit Note No.
                <div>{debitNoteLastNumber?.debitNoteNumber || "-"}</div>
              </div>
            </td>
            <td colSpan={3} width={"33.33%"}>
              <div className="p-2">
                <div>Date:</div>
                <Controller
                  control={control}
                  name="date"
                  render={({ field }) => (
                    <DatePicker {...field} name="date" className="width-100" />
                  )}
                />
              </div>
            </td>
            <td colSpan={3} width={"33.33%"}>
              <div className="p-2">
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
                  name="bill_id"
                  // validateStatus={errors.challan_type ? "error" : ""}
                  // help={errors.challan_type && errors.challan_type.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name="bill_id"
                    render={({ field }) => (
                      <Select
                        {...field}
                        placeholder="Select Bill"
                        options={
                          billList && billList.result.length
                            ? billList?.result?.map((item) => {
                                return {
                                  label: item?.bill_no,
                                  value: item.bill_id,
                                };
                              })
                            : []
                        }
                        style={{
                          textTransform: "capitalize",
                        }}
                        dropdownStyle={{
                          textTransform: "capitalize",
                        }}
                      />
                    )}
                  />
                </Form.Item>
              </div>
            </td>
          </tr>
          <tr width="50%">
            <td colSpan={4}>
              <div>GSTIN/UIN: {company?.gst_no || ""}</div>
              <div>State Name: {company?.state || ""}</div>
              <div>PinCode: {company?.pincode || ""}</div>
              <div>Contact: {company?.company_contact || ""}</div>
              <div>Email: {company?.company_email || ""}</div>
            </td>
            <td colSpan={4}>
              <div>Party: {billData?.supplier?.supplier_name || ""}</div>
              <div>GSTIN/UIN: {billData?.supplier?.user?.gst_no || ""}</div>
              <div>PAN/IT No : {billData?.supplier?.user?.pancard_no}</div>
              <div>State Name:</div>
            </td>
          </tr>
        </tbody>
      </table>
      <table className="credit-note-table">
        <thead>
          <tr>
            <th style={{ width: "50px" }}>SL No.</th>
            <th colSpan={2}>Particulars</th>
            <th>Quantity</th>
            <th>Rate</th>
            <th>Per</th>
            <th style={{ width: "100px" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {/* <tr style={{ height: "50px" }}>
            <td></td>
            <td colSpan={2}></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr> */}
          <tr>
            <td></td>
            <td colSpan={2}>Claim On Purchase</td>
            <td></td>
            <td></td>
            <td></td>
            <td>
              <Controller
                control={control}
                name="amount"
                render={({ field }) => <Input {...field} placeholder="12" />}
              />
            </td>
          </tr>
          <tr>
            <td></td>
            <td colSpan={2}>
              <div>SGST @ {SGST_value} %</div>
              <div>CGST @ {CGST_value} %</div>
              <div>IGST @ {IGST_value}%</div>
              <div>Round Off</div>
            </td>
            <td></td>
            <td></td>
            <td></td>
            <td>
              <div>{SGST_amount}</div>
              <div>{CGST_amount}</div>
              <div>{IGST_amount}</div>
              <div>{round_off_amount}</div>
            </td>
          </tr>
          <tr>
            <td></td>
            <td colSpan={2}>
              <b>Total</b>
            </td>
            <td></td>
            <td></td>
            <td></td>
            <td>{net_amount}</td>
          </tr>
          <tr>
            <td colSpan={8}>
              <Flex
                justify="space-between"
                style={{ width: "100%" }}
                className="mt-3"
              >
                <div>
                  <div>Amount Chargable(in words)</div>
                  <div>Xero Only</div>
                  <div>Remarks:</div>
                </div>
                <div>E & O.E</div>
              </Flex>
              <Flex
                justify="space-between"
                style={{ width: "100%" }}
                className="mt-3"
              >
                <div></div>
                <div>
                  <div>For,</div>
                  <div>.................................................</div>
                  <div>Authorized Signatory</div>
                </div>
              </Flex>
            </td>
          </tr>
        </tbody>
      </table>

      <Flex gap={12} justify="flex-end">
        <Button
          type="primary"
          onClick={handleSubmit(onSubmit)}
          loading={isPending}
        >
          Generate
        </Button>
        <Button onClick={handleClose}>Close</Button>
      </Flex>
    </Form>
  );
};

export default ClaimNoteForm;
