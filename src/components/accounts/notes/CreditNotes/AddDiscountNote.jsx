import {
  Button,
  DatePicker,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Select,
} from "antd";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { useContext, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSaleBillListRequest } from "../../../../api/requests/sale/bill/saleBill";
import {
  createCreditNoteRequest,
  getLastCreditNoteNumberRequest,
} from "../../../../api/requests/accounts/notes";
import { Controller, useForm } from "react-hook-form";
import { getPartyListRequest } from "../../../../api/requests/users";
import "./_style.css";

const AddDiscountNote = ({ setIsAddModalOpen, isAddModalOpen }) => {
  const queryClient = useQueryClient();
  const { companyListRes } = useContext(GlobalContext);

  const [numOfBill, setNumOfBill] = useState([]);

  const { mutateAsync: addCreditClaimNOte, isPending } = useMutation({
    mutationFn: async ({ data, companyId }) => {
      const res = await createCreditNoteRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["add", "credit", "discount-note"],
    onSuccess: (res) => {
      queryClient.invalidateQueries(["get", "credit-notes", "list"]);
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      reset();
      setIsAddModalOpen(false);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(errorMessage);
    },
  });

  const onSubmit = async (data) => {
    const payload = {
      // supplier_id: billData?.supplier_id,
      // model: selectedBillData?.model,
      credit_note_number: creditNoteLastNumber?.debitNoteNumber || "",
      credit_note_type: "discount",
      // sale_challan_id: 456,
      // quality_id: data?.quality_id,
      party_id: data?.party_id,
      // gray_order_id: 321,
      // sale_return_id: 5050,
      // hsn_no: "HSN456",
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
      // extra_tex_value: 1.0,
      // extra_tex_amount: 15.0,
      createdAt: dayjs(data.date).format("YYYY-MM-DD"),
      credit_note_details: numOfBill.map((_, index) => {
        return {
          bill_id: data[`bill_id_${index}`],
          model: "sale_bills",
          rate: +data[`rate_${index}`],
          per: +data[`per_${index}`],
          // invoice_no: data?.invoice_number,
          particular_name: "Discount On Sales",
          quantity: +data[`quantity_${index}`],
          amount: +data[`amount_${index}`],
        };
      }),
    };

    await addCreditClaimNOte({ data: payload, companyId: data.company_id });
  };

  const {
    control,
    handleSubmit,
    watch,
    resetField,
    setValue,
    // formState: { errors },
    getValues,
    reset,
  } = useForm({
    defaultValues: {
      company_id: null,
      date: dayjs(),
      bill_id: null,
      supplier_id: null,

      sale_challan_id: "",
      quality_id: "",

      SGST_value: 0,
      SGST_amount: 0,
      CGST_value: 0,
      CGST_amount: 0,
      IGST_value: 0,
      IGST_amount: 0,
      round_off_amount: "",
      net_amount: "",
      // rate: "",
      invoice_number: "",
      // total_taka: "",
      // total_meter: "",
      // discount_value: "",
      // discount_amount: "",
    },
  });

  const currentValue = watch();
  const {
    company_id,
    // supplier_id,
    SGST_amount,
    CGST_amount,
    IGST_amount,
    net_amount,
    party_id,
  } = currentValue;

  useEffect(() => {
    if (party_id) {
      resetField("bill_id");
      setNumOfBill([]);
    }
  }, [resetField, party_id]);

  const { data: saleBillList } = useQuery({
    queryKey: [
      "saleBill",
      "list",
      {
        company_id: company_id,
        party_id: party_id,
      },
    ],
    queryFn: async () => {
      const params = {
        company_id: company_id,
        party_id: party_id,
        page: 0,
        pageSize: 99999,
      };
      const res = await getSaleBillListRequest({ params });
      return res.data?.data;
    },
    enabled: Boolean(company_id && party_id),
  });

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
  console.log({ selectedPartyCompany });

  const calculateTaxAmount = () => {
    let totalAmount = 0;
    let totalNetAmount = 0;
    numOfBill.forEach((_, index) => {
      const amount = getValues(`amount_${index}`);
      totalAmount += +amount;
    });

    const SGSTValue = +getValues("SGST_value");
    if (SGSTValue) {
      const SGSTAmount = (+totalAmount * +SGSTValue) / 100;
      setValue("SGST_amount", SGSTAmount.toFixed(2));
      totalNetAmount += +SGSTAmount;
    }

    const CGSTValue = +getValues("CGST_value");
    if (CGSTValue) {
      const CGSTAmount = (+totalAmount * +CGSTValue) / 100;
      setValue("CGST_amount", CGSTAmount.toFixed(2));
      totalNetAmount += +CGSTAmount;
    }

    const IGSTValue = +getValues("IGST_value");
    if (IGSTValue) {
      const IGSTAmount = (+totalAmount * +IGSTValue) / 100;
      setValue("IGST_amount", IGSTAmount.toFixed(2));
      totalNetAmount += +IGSTAmount;
    }

    totalNetAmount += totalAmount;
    setValue("net_amount", totalNetAmount.toFixed(2));
  };

  const { data: creditNoteLastNumber } = useQuery({
    queryKey: [
      "get",
      "credit-notes",
      "last-number",
      {
        company_id: company_id,
      },
    ],
    queryFn: async () => {
      const params = {
        company_id: company_id,
      };
      const response = await getLastCreditNoteNumberRequest({ params });
      return response.data.data;
    },
    enabled: Boolean(company_id),
  });

  return (
    <>
      <Modal
        open={isAddModalOpen}
        width={"75%"}
        onCancel={() => {
          setIsAddModalOpen(false);
        }}
        footer={false}
      >
        <div className="credit-note-container">
          <table className="credit-note-table">
            <tbody>
              <tr>
                <td colSpan={8} className="text-center">
                  <h2>Discount Note</h2>
                  <h5>
                    Discount Note No.{" "}
                    <span
                      style={{
                        color: "green",
                        fontWeight: "600",
                        marginTop: "-5px",
                      }}
                    >
                      {creditNoteLastNumber?.debitNoteNumber || "-"}
                    </span>
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
                    <div>Party Company</div>
                    <Form.Item
                      label=""
                      name="party_id"
                      // validateStatus={errors.challan_type ? "error" : ""}
                      // help={errors.challan_type && errors.challan_type.message}
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
                            loading={isLoadingPartyList}
                            style={{
                              textTransform: "capitalize",
                            }}
                            dropdownStyle={{
                              textTransform: "capitalize",
                            }}
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
                            placeholder="Select Bill"
                            mode="multiple"
                            style={{
                              textTransform: "capitalize",
                            }}
                            dropdownStyle={{
                              textTransform: "capitalize",
                            }}
                            options={saleBillList?.SaleBill?.map((item) => {
                              return {
                                label: item.e_way_bill_no,
                                value: item.id,
                              };
                            })}
                            onChange={(selectedValue) => {
                              setValue("bill_id", selectedValue);
                              setNumOfBill(selectedValue.map((item) => item));
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
                    Party:
                    <b>{selectedPartyCompany?.party?.company_name || "-"}</b>
                    <br />
                    {selectedPartyCompany?.address || "-"}
                  </div>
                  <div>GSTIN/UIN: {selectedPartyCompany?.gst_no || "-"}</div>
                  <div>
                    PAN/IT No : {selectedPartyCompany?.pancard_no || "-"}
                  </div>
                  <div>State Name: {selectedPartyCompany?.state || "-"}</div>
                </td>
              </tr>
            </tbody>
          </table>
          <table className="credit-note-table">
            <thead>
              <tr>
                <th>SL No.</th>
                <th colSpan={3} style={{ minWidth: "400px" }}>
                  Particulars
                </th>
                <th>Quantity</th>
                <th style={{ width: "80px" }}>Rate</th>
                <th style={{ width: "100px" }}>Per</th>
                <th style={{ width: "150px" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {numOfBill && numOfBill.length
                ? numOfBill.map((id, index) => {
                    return (
                      <SingleBillRender
                        key={index}
                        index={index}
                        billId={id}
                        control={control}
                        company_id={company_id}
                        billList={saleBillList || []}
                        setValue={setValue}
                      />
                    );
                  })
                : null}
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
                          onChange={(e) => {
                            setValue("SGST_value", +e.target.value);
                            calculateTaxAmount();
                          }}
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
                          onChange={(e) => {
                            setValue("CGST_value", +e.target.value);
                            calculateTaxAmount();
                          }}
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
                          onChange={(e) => {
                            setValue("IGST_value", +e.target.value);
                            calculateTaxAmount();
                          }}
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
                  <div>{SGST_amount}</div>
                  <div>{CGST_amount}</div>
                  <div>{IGST_amount}</div>
                  <div>0</div>
                </td>
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
                      <div>
                        .................................................
                      </div>
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
            <Button onClick={() => setIsAddModalOpen(false)}>Close</Button>
          </Flex>
        </div>
      </Modal>
    </>
  );
};

export default AddDiscountNote;

const SingleBillRender = ({
  billId,
  index,
  control,
  // company_id,
  billList,
  setValue,
}) => {
  const billData = billList?.SaleBill?.find((item) => item.id === billId);
  // const { data: billData } = useQuery({
  //   queryKey: [
  //     "get",
  //     "selected-bill",
  //     "data",
  //     {
  //       company_id: company_id,
  //       bill_id: billId,
  //     },
  //   ],
  //   queryFn: async () => {
  //     let response;
  //     const selectedBillData = billList?.SaleBill?.find(
  //       (item) => item.id === billId
  //     );

  //     switch (selectedBillData.model) {
  //       case "yarn_bills":
  //         response = await getYarnReceiveBillByIdRequest({
  //           id: selectedBillData.bill_id,
  //           params: { company_id: company_id },
  //         });
  //         return response?.data?.data;

  //       case "job_taka_bills":
  //         response = await getJobTakaBillByIdRequest({
  //           params: {
  //             company_id: company_id,
  //             bill_id: selectedBillData.bill_id,
  //           },
  //         });
  //         return response?.data?.data;

  //       case "receive_size_beam_bill":
  //         response = await getReceiveSizeBeamBillByIdRequest({
  //           id: selectedBillData.bill_id,
  //           params: {
  //             company_id: company_id,
  //           },
  //         });
  //         return response?.data?.data;

  //       default:
  //         return response;
  //     }
  //   },
  //   enabled: Boolean(company_id && billId),
  // });

  const calculateAmount = (per) => {
    const amount =
      ((billData?.total_meter || 0) * (billData?.rate || 0) * per) / 100;
    setValue(`amount_${index}`, amount.toFixed(2));
  };

  useEffect(() => {
    if (billData && Object.keys(billData).length) {
      // const selectedBillData = billList?.result?.find(
      //   (item) => item.bill_id === billId
      // );

      setValue(`quantity_${index}`, +billData?.total_meter || 0);
      setValue(`rate_${index}`, +billData?.rate || 0);

      setValue(`bill_id_${index}`, billId);
      setValue(`model_${index}`, "sale_bill");
    }
  }, [billData, billId, index, setValue]);

  return (
    <tr>
      <td style={{ textAlign: "center" }}>{index + 1}.</td>
      <td colSpan={3}>Discount On Sales</td>
      <td>
        <Controller
          control={control}
          name={`quantity_${index}`}
          render={({ field }) => (
            <Input
              {...field}
              // value={billData?.receive_quantity || 0}
              placeholder="3"
              className="remove-input-box"
            />
          )}
        />
        <Controller
          control={control}
          name={`bill_id_${index}`}
          render={({ field }) => (
            <Input {...field} type="hidden" placeholder="3" />
          )}
        />
        <Controller
          control={control}
          name={`model_${index}`}
          render={({ field }) => (
            <Input {...field} type="hidden" placeholder="3" />
          )}
        />
      </td>
      <td>
        <Controller
          control={control}
          name={`rate_${index}`}
          render={({ field }) => (
            <Input {...field} placeholder="3" className="remove-input-box" />
          )}
        />
      </td>
      <td>
        <Controller
          control={control}
          name={`per_${index}`}
          render={({ field }) => (
            <Input
              {...field}
              placeholder="3"
              onChange={(e) => {
                setValue(`per_${index}`, e.target.value);
                calculateAmount(e.target.value);
              }}
            />
          )}
        />
      </td>
      <td>
        <Controller
          control={control}
          name={`amount_${index}`}
          render={({ field }) => <Input {...field} placeholder="3" />}
        />
      </td>
    </tr>
  );
};
