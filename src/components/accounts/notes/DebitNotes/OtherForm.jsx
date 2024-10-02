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
import dayjs from "dayjs";
import { useContext, useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { getPartyListRequest } from "../../../../api/requests/users";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import TextArea from "antd/es/input/TextArea";
import { createDebitNoteRequest } from "../../../../api/requests/accounts/notes";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

const validationSchema = yup.object().shape({
  company_id: yup.string().required("Please enter company"),
  debit_note_no: yup.string().required("Please enter debit note number"),
  invoice_number: yup.string().required("Please enter invoice number"),
  party_id: yup.string().required("Please enter party"),
  date: yup.string().required("Please enter date"),
  particular: yup.string().required("Please enter particular"),
  hsn_code: yup.string().required("Please enter hsn code"),
  amount: yup.string().required("Please enter amount"),
});

const OtherForm = ({ type, handleClose }) => {
  const queryClient = useQueryClient();
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
    mutationKey: ["add", "debit", "claim-note"],
    onSuccess: (res) => {
      queryClient.invalidateQueries(["get", "debit-notes", "last-number"]);
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
    const payload = {
      party_id: data?.party_id,
      // supplier_id: billData?.supplier_id,
      // model: selectedBillData?.model,
      debit_note_number: data?.debit_note_no || "",
      debit_note_type: type,
      // sale_challan_id: 456,
      // quality_id: data?.quality_id,
      // gray_order_id: 321,
      // party_id: 654,
      // return_id: 987,
      // total_taka: +data.total_taka,
      // total_meter: +data.total_meter,
      // discount_value: +data.discount_value,
      // discount_amount: +data.discount_amount,
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
      extra_tex_name: data.extra_tex_name,
      extra_tex_value: +data.extra_tex_value,
      extra_tex_amount: +data.extra_tex_amount,
      createdAt: dayjs(data.date).format("YYYY-MM-DD"),
      debit_note_details: [
        {
          // bill_id: data.bill_id,
          // model: selectedBillData?.model,
          // rate: +data.rate,
          // per: 1.0,
          invoice_no: data?.invoice_number,
          particular_name: data?.particular,
          // quality: billData?.inhouse_quality?.quality_weight,
          amount: +data.amount,
        },
      ],
    };
    await addDebitClaimNOte({ data: payload, companyId: data.company_id });
  };

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      debit_note_no: "",
      company_id: null,

      is_current: 1,
      date: dayjs(),
      bill_id: null,
      amount: "",
      party_id: null,

      //
      // supplier_id: "",
      // sale_challan_id: "",
      // quality_id: "",

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
      // total_taka: "",
      // total_meter: "",
      // discount_value: "",
      // discount_amount: "",
      extra_tex_value: 0,
      extra_tex_name: "",
      extra_tex_amount: 0,
    },
    resolver: yupResolver(validationSchema),
  });

  const {
    company_id,
    party_id,
    SGST_value,
    SGST_amount,
    CGST_value,
    CGST_amount,
    IGST_value,
    IGST_amount,
    round_off_amount,
    extra_tex_value,
    extra_tex_amount,
    amount,
    net_amount,
  } = watch();

  useEffect(() => {
    if (amount) {
      const SGSTAmount = (amount * SGST_value) / 100;
      setValue("SGST_amount", SGSTAmount.toFixed(2));

      const CGSTAmount = (amount * CGST_value) / 100;
      setValue("CGST_amount", CGSTAmount.toFixed(2));

      const IGSTAmount = (amount * IGST_value) / 100;
      setValue("IGST_amount", IGSTAmount.toFixed(2));

      const extraTexAmount = (amount * extra_tex_value) / 100;
      setValue("extra_tex_amount", extraTexAmount.toFixed(2));

      const netAmount =
        +amount +
        +SGSTAmount +
        +CGSTAmount +
        +IGSTAmount +
        +round_off_amount -
        +extraTexAmount;

      setValue("net_amount", netAmount.toFixed(2));
    }
  }, [
    CGST_value,
    IGST_value,
    SGST_value,
    amount,
    extra_tex_value,
    round_off_amount,
    setValue,
  ]);

  const { data: partyUserListRes, isLoading: isLoadingPartyList } = useQuery({
    queryKey: ["party", "list", { company_id: company_id }],
    queryFn: async () => {
      const res = await getPartyListRequest({
        params: { company_id: company_id },
      });
      return res.data?.data;
    },
    enabled: Boolean(company_id),
  });

  const selectedCompany = useMemo(() => {
    if (company_id) {
      return companyListRes?.rows?.find(({ id }) => id === company_id);
    }
  }, [company_id, companyListRes]);

  const selectedPartyCompany = useMemo(() => {
    if (party_id) {
      return partyUserListRes?.partyList?.rows?.find(
        ({ id }) => id === party_id
      );
    }
  }, [partyUserListRes?.partyList?.rows, party_id]);

  return (
    <>
      <table className="credit-note-table">
        <tbody>
          <tr>
            <td colSpan={8} className="text-center">
              <h2>Debit Note</h2>
              <h5>
                Debit Note No:
                <Form.Item
                  label=""
                  name="party_id"
                  validateStatus={errors.debit_note_no ? "error" : ""}
                  help={errors.debit_note_no && errors.debit_note_no.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name="debit_note_no"
                    render={({ field }) => (
                      <Input
                        {...field}
                        style={{ width: "100px", marginLeft: "10px" }}
                      />
                    )}
                  />
                </Form.Item>
              </h5>
            </td>
          </tr>
          <tr>
            <td colSpan={2} width={"20%"}>
              <div className="year-toggle">
                <div>Date:</div>
                <Form.Item
                  label=""
                  name="party_id"
                  validateStatus={errors.date ? "error" : ""}
                  help={errors.date && errors.date.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name="date"
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
            <td colSpan={2} width={"25%"}>
              <div className="year-toggle">
                <div className="year-toggle">
                  <div>Company</div>
                  <Form.Item
                    label=""
                    name="company_id"
                    validateStatus={errors.company_id ? "error" : ""}
                    help={errors.company_id && errors.company_id.message}
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
              </div>
            </td>
            <td colSpan={2} width={"25%"}>
              <div className="year-toggle">
                <div>Party Company</div>
                <Form.Item
                  label=""
                  name="party_id"
                  validateStatus={errors.party_id ? "error" : ""}
                  help={errors.party_id && errors.party_id.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name="party_id"
                    render={({ field }) => (
                      <Select
                        {...field}
                        className="width-100"
                        placeholder="Select Party Company"
                        style={{
                          textTransform: "capitalize",
                        }}
                        dropdownStyle={{
                          textTransform: "capitalize",
                        }}
                        loading={isLoadingPartyList}
                        options={partyUserListRes?.partyList?.rows?.map(
                          (party) => ({
                            label:
                              party.first_name +
                              " " +
                              party.last_name +
                              " " +
                              `| ( ${party?.username})`,
                            value: party.id,
                          })
                        )}
                      />
                    )}
                  />
                </Form.Item>
              </div>
            </td>
            <td colSpan={2} width={"30%"}>
              <div className="year-toggle">
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
                  name="invoice_number"
                  validateStatus={errors.invoice_number ? "error" : ""}
                  help={errors.invoice_number && errors.invoice_number.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name="invoice_number"
                    render={({ field }) => (
                      <Input {...field} placeholder="Invoice Number" />
                    )}
                  />
                </Form.Item>
              </div>
            </td>
          </tr>
          <tr width="50%">
            <td colSpan={4}>
              <b>{selectedCompany?.company_name || ""}</b>
              <div>
                {selectedCompany?.address_line_1 || ""}
                {selectedCompany?.address_line_2 || ""}
              </div>
              <div>GSTIN/UIN: {selectedCompany?.gst_no || ""}</div>
              <div>State Name: {selectedCompany?.state || ""}</div>
              <div>PinCode: {selectedCompany?.pincode || ""}</div>
              <div>Contact: {selectedCompany?.company_contact || ""}</div>
              <div>Email: {selectedCompany?.company_email || ""}</div>
            </td>
            <td colSpan={4}>
              <div>
                Party:{" "}
                {selectedPartyCompany
                  ? `${selectedPartyCompany?.first_name} ${selectedPartyCompany?.last_name} (${selectedPartyCompany?.party?.company_name})`
                  : ""}
              </div>
              <div>{selectedPartyCompany?.party?.delivery_address || ""}</div>
              <div>GSTIN/UIN: {selectedPartyCompany?.gst_no || ""}</div>
              <div>State Name : {selectedPartyCompany?.state || ""}</div>
            </td>
          </tr>
          <tr>
            <td>SL No.</td>
            <td colSpan={3}>Particulars</td>
            <td>HSN Code</td>
            <td>Rate</td>
            <td>Per</td>
            <td>Amount</td>
          </tr>
          <tr>
            <td></td>
            <td colSpan={3}>
              <Form.Item
                label=""
                name="particular"
                validateStatus={errors.particular ? "error" : ""}
                help={errors.particular && errors.particular.message}
                required={true}
                wrapperCol={{ sm: 24 }}
              >
                <Controller
                  control={control}
                  name="particular"
                  render={({ field }) => (
                    <TextArea {...field} placeholder="Debit note" />
                  )}
                />
              </Form.Item>
            </td>
            <td>
              <Form.Item
                label=""
                name="hsn_code"
                validateStatus={errors.hsn_code ? "error" : ""}
                help={errors.hsn_code && errors.hsn_code.message}
                required={true}
                wrapperCol={{ sm: 24 }}
              >
                <Controller
                  control={control}
                  name="hsn_code"
                  render={({ field }) => (
                    <Input {...field} placeholder="234512" />
                  )}
                />
              </Form.Item>
            </td>
            <td></td>
            <td></td>
            <td>
              <Form.Item
                label=""
                name="amount"
                validateStatus={errors.amount ? "error" : ""}
                help={errors.amount && errors.amount.message}
                required={true}
                wrapperCol={{ sm: 24 }}
              >
                <Controller
                  control={control}
                  name="amount"
                  render={({ field }) => <Input {...field} placeholder="300" />}
                />
              </Form.Item>
            </td>
          </tr>
          <tr>
            <td></td>
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
              <div style={{ marginBottom: "6px" }}>{SGST_amount}</div>
              <div style={{ marginBottom: "6px" }}>{CGST_amount}</div>
              <div style={{ marginBottom: "6px" }}>{IGST_amount}</div>
              <div style={{ marginBottom: "6px" }}>{round_off_amount}</div>
            </td>
          </tr>
          <tr>
            <td></td>
            <td colSpan={3}>
              <div>
                <Controller
                  control={control}
                  name="extra_tex_name"
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Tax name"
                      style={{ width: "65%" }}
                    />
                  )}
                />
                &nbsp;&nbsp;&nbsp;&nbsp;
                <Controller
                  control={control}
                  name="extra_tex_value"
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="3"
                      style={{ width: "20%" }}
                    />
                  )}
                />
                %
              </div>
            </td>
            <td></td>
            <td></td>
            <td></td>
            <td>{extra_tex_amount}</td>
          </tr>
          <tr>
            <td></td>
            <td colSpan={3}>Total</td>
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
        <Button>Close</Button>
      </Flex>
    </>
  );
};

export default OtherForm;
