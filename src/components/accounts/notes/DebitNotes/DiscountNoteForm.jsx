import { Button, DatePicker, Flex, Form, Input, message, Select } from "antd";
import { useContext } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createDebitNoteRequest,
  getDebitNoteBillDropDownRequest,
  getLastDebitNoteNumberRequest,
} from "../../../../api/requests/accounts/notes";
import dayjs from "dayjs";
import { Controller, useForm } from "react-hook-form";
import { getReworkChallanByIdRequest } from "../../../../api/requests/job/challan/reworkChallan";
import { getPurchaseTakaBillByIdRequest } from "../../../../api/requests/purchase/bill";
import {
  getGeneralPurchaseByIdRequest,
  getReceiveSizeBeamBillByIdRequest,
} from "../../../../api/requests/purchase/purchaseSizeBeam";
import { getJobTakaBillByIdRequest } from "../../../../api/requests/job/bill/jobBill";
import { getYarnReceiveBillByIdRequest } from "../../../../api/requests/purchase/yarnReceive";
import { getSupplierListRequest } from "../../../../api/requests/users";

const DiscountNoteForm = ({ type, handleClose }) => {
  // const queryClient = useQueryClient();
  const { companyListRes } = useContext(GlobalContext);

  const { mutateAsync: addDebitClaimNOte, isPending } = useMutation({
    mutationFn: async ({ data, companyId }) => {
      const res = await createDebitNoteRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["add", "debit", "discount-note"],
    onSuccess: (res) => {
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
    console.log("onSubmit", data);

    const payload = {
      supplier_id: billData?.supplier_id,
      // model: selectedBillData?.model,
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
          // model: selectedBillData?.model,
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

  const { control, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      company_id: null,
      date: dayjs(),
      bill_id: null,
      supplier_id: null,

      //
      // supplier_id: "",
      sale_challan_id: "",
      quality_id: "",

      SGST_value: "",
      SGST_amount: "",
      CGST_value: "",
      CGST_amount: "",
      IGST_value: "",
      IGST_amount: "",
      round_off_amount: "",
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
  const { bill_id, company_id, supplier_id } = currentValue;

  const { data: billList } = useQuery({
    queryKey: [
      "debit-note",
      "bill",
      "list",
      {
        company_id: company_id,
        supplier_id: supplier_id,
      },
    ],
    queryFn: async () => {
      const params = {
        company_id: company_id,
        type: "discount_note",
        supplier_id: supplier_id,
      };
      const response = await getDebitNoteBillDropDownRequest({ params });
      return response?.data?.data || [];
    },
    enabled: Boolean(company_id && supplier_id),
  });

  const { data: debitNoteLastNumber } = useQuery({
    queryKey: [
      "get",
      "debit-notes",
      "last-number",
      {
        company_id: company_id,
      },
    ],
    queryFn: async () => {
      const params = {
        company_id: company_id,
      };
      const response = await getLastDebitNoteNumberRequest({ params });
      return response.data.data;
    },
    enabled: Boolean(company_id),
  });

  const { data: supplierListRes, isLoading: isLoadingSupplierList } = useQuery({
    queryKey: ["supplier", "list", { company_id }],
    queryFn: async () => {
      const res = await getSupplierListRequest({
        params: { company_id },
      });
      return res.data?.data?.supplierList;
    },
    enabled: Boolean(company_id),
  });

  const { data: billData } = useQuery({
    queryKey: [
      "get",
      "selected-bill",
      "data",
      {
        company_id: company_id,
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
            params: { company_id: company_id },
          });
          return response?.data?.data;

        case "job_taka_bills":
          response = await getJobTakaBillByIdRequest({
            params: {
              company_id: company_id,
              bill_id: selectedBillData.bill_id,
            },
          });
          return response?.data?.data;

        case "receive_size_beam_bill":
          response = await getReceiveSizeBeamBillByIdRequest({
            id: selectedBillData.bill_id,
            params: {
              company_id: company_id,
            },
          });
          return response?.data?.data?.receive;

        case "general_purchase_entries":
          response = await getGeneralPurchaseByIdRequest({
            id: selectedBillData.bill_id,
            params: { company_id: company_id },
          });
          return response?.data?.data;

        case "purchase_taka_bills":
          response = await getPurchaseTakaBillByIdRequest({
            params: {
              company_id: company_id,
              challan_id: selectedBillData.bill_id,
            },
          });
          return response?.data?.data;

        case "job_rework_bill":
          response = await getReworkChallanByIdRequest({
            id: selectedBillData.bill_id,
            params: {
              company_id: company_id,
            },
          });
          return response?.data?.data;

        default:
          return response;
      }
    },
    enabled: Boolean(company_id && bill_id),
  });

  return (
    <>
      <table className="credit-note-table">
        <tbody>
          <tr>
            <td colSpan={8} className="text-center">
              <h2>Discount Note</h2>
              <h5>
                Discount Note No. {debitNoteLastNumber?.debitNoteNumber || "-"}{" "}
              </h5>
            </td>
          </tr>
          <tr>
            <td colSpan={2} width={"25%"}>
              <div className="year-toggle">
                <div>Date:</div>
                <Controller
                  control={control}
                  name="date"
                  render={({ field }) => (
                    <DatePicker {...field} className="width-100" />
                  )}
                />
              </div>
            </td>
            <td colSpan={2} width={"25%"}>
              <div className="year-toggle">
                <div>Company</div>
                <Form.Item
                  label=""
                  name="company_id"
                  // validateStatus={errors.challan_type ? "error" : ""}
                  // help={errors.challan_type && errors.challan_type.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name="company_id"
                    render={({ field }) => (
                      <Select
                        {...field}
                        className="width-100"
                        placeholder="Select Company"
                        style={{
                          textTransform: "capitalize",
                        }}
                        dropdownStyle={{
                          textTransform: "capitalize",
                        }}
                        options={companyListRes.rows.map((company) => {
                          return {
                            label: company?.company_name,
                            value: company?.id,
                          };
                        })}
                      />
                    )}
                  />
                </Form.Item>
              </div>
            </td>
            <td colSpan={2} width={"25%"}>
              <div className="year-toggle">
                <div>Supplier Company</div>
                <Form.Item
                  label=""
                  name="supplier_id"
                  // validateStatus={errors.challan_type ? "error" : ""}
                  // help={errors.challan_type && errors.challan_type.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name="supplier_id"
                    render={({ field }) => (
                      <Select
                        {...field}
                        className="width-100"
                        placeholder="Select Company"
                        loading={isLoadingSupplierList}
                        style={{
                          textTransform: "capitalize",
                        }}
                        dropdownStyle={{
                          textTransform: "capitalize",
                        }}
                        options={supplierListRes?.rows?.map((item) => {
                          return {
                            label: item?.supplier?.supplier_company,
                            value: item?.supplier?.id,
                          };
                        })}
                      />
                    )}
                  />
                </Form.Item>
              </div>
            </td>
            <td colSpan={2} width={"25%"}>
              <div className="year-toggle">
                <div>Bill</div>
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
                        className="width-100"
                        placeholder="Select Company"
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
              <div>GSTIN/UIN:</div>
              <div>State Name:</div>
              <div>PinCode:</div>
              <div>Contact:</div>
              <div>Email:</div>
            </td>
            <td colSpan={4}>
              <div>Supplier:</div>
              <div>GSTIN/UIN:</div>
              <div>PAN/IT No :</div>
              <div>State Name:</div>
            </td>
          </tr>
        </tbody>
      </table>
      <table className="credit-note-table">
        <thead>
          <tr>
            <th>SL No.</th>
            <th colSpan={3}>Particulars</th>
            <th>Quantity</th>
            <th>Rate</th>
            <th>Per</th>
            <th style={{ width: "150px" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td></td>
            <td colSpan={3}>Discount On Purchase</td>
            <td></td>
            <td></td>
            <td></td>
            <td>
              <Input />
            </td>
          </tr>
          <tr>
            <td></td>
            {/* <td colSpan={3}>
              <div>SGST @ 0 %</div>
              <div>CGST @ 0 %</div>
              <div>CGST @ 0%</div>
              <div>Round Off</div>
            </td> */}
            <td colSpan={3}>
              <div style={{ marginBottom: "6px" }}>
                SGST @{" "}
                <Controller
                  control={control}
                  name="SGST_value"
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="3"
                      style={{ width: "100px" }}
                    />
                  )}
                />{" "}
                %
              </div>
              <div style={{ marginBottom: "6px" }}>
                CGST @{" "}
                <Controller
                  control={control}
                  name="CGST_value"
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="3"
                      style={{ width: "100px" }}
                    />
                  )}
                />{" "}
                %
              </div>
              <div style={{ marginBottom: "6px" }}>
                IGST @{" "}
                <Controller
                  control={control}
                  name="IGST_value"
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="3"
                      style={{ width: "100px" }}
                    />
                  )}
                />{" "}
                %
              </div>
              <div>Round Off</div>
            </td>
            <td></td>
            <td></td>
            <td></td>
            <td>
              <div>0</div>
              <div>0</div>
              <div>0</div>
              <div>0</div>
            </td>
          </tr>
          <tr>
            <td></td>
            <td colSpan={3}>Total</td>
            <td></td>
            <td></td>
            <td></td>
            <td>00.00</td>
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
    </>
  );
};

export default DiscountNoteForm;
