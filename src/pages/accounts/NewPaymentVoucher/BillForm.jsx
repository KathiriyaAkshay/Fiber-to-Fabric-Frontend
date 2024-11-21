import {
  Button,
  Card,
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
  Spin,
} from "antd";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import dayjs from "dayjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getDropdownSupplierListRequest } from "../../../api/requests/users";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  addPaymentBillRequest,
  getLastVoucherNoRequest,
  getUnPaidPaymentBillListRequest,
} from "../../../api/requests/accounts/payment";

const { TextArea } = Input;

const SUPPLIER_TYPES = [
  { label: "Purchase / Trading", value: "purchase/trading" },
  { label: "Job", value: "job" },
  { label: "Yarn", value: "yarn" },
  { label: "Other", value: "other" },
  { label: "Re-Work", value: "re-work" },
];

const addBillValidationSchema = yupResolver(
  yup.object().shape({
    supplier_type: yup.string().required("Please select supplier type."),
    supplier_name: yup.string().required("Please select supplier name."),
    account_name: yup.string().required("Please select account name."),
    company_id: yup.string().required("Please select company name."),
    bank_name: yup.string().required("Please select bank name."),
    cheque_no: yup.string().required("Please enter cheque no."),
    cheque_date: yup.date().required("Please enter cheque date."),
    amount: yup.string().required("Please enter amount."),
    voucher_no: yup.string().required("Please enter voucher no."),
    voucher_date: yup.date().required("Please enter voucher date."),
    remark: yup.string().required("Please enter remark."),
    selection: yup.string().required("Required."),
  })
);

const BillForm = () => {
  const { companyListRes } = useContext(GlobalContext);
  const queryClient = useQueryClient();

  const [unPaidBillData, setUnPaidBillData] = useState([]);
  const [selectedBills, setSelectedBills] = useState([]);
  const [totalCounts, setTotalCounts] = useState({
    totalBills: 0,
    totalAmount: 0,
    totalNetAmount: 0,
  });

  const { mutateAsync: addBillEntry, isPending: isPendingBillEntry } =
    useMutation({
      mutationFn: async ({ company_id, data }) => {
        const res = await addPaymentBillRequest({
          data,
          params: {
            company_id: company_id,
          },
        });
        return res.data;
      },
      mutationKey: ["add", "passbook", "new"],
      onSuccess: (res) => {
        queryClient.invalidateQueries("account/statement/last/voucher", {
          company_id: company_id,
        });
        const successMessage = res?.message;
        if (successMessage) {
          message.success(successMessage);
        }
        setSelectedBills([]);
        setUnPaidBillData([]);
        setTotalCounts({
          totalBills: 0,
          totalAmount: 0,
          totalNetAmount: 0,
        });
        reset();
      },
      onError: (error) => {
        const errorMessage = error?.response?.data?.message || error.message;
        message.error(errorMessage);
      },
    });

  const onSubmit = async (data) => {
    const payload = {
      supplier_id: +data.account_name,
      bank_id: +data.bank_name,
      cheque_no: data.cheque_no,
      total_amount: +data.amount,
      voucher_no: data.voucher_no,
      remark: data.remark,
      is_passbook_entry: data.selection === "passbook_update" ? true : false,
      cheque_date: dayjs(data.cheque_date).format("YYYY-MM-DD"),
      createdAt: dayjs(data.voucher_date).format("YYYY-MM-DD"),
      bill_details: selectedBills.map((item) => {
        delete item.bp_tds;
        return item;
      }),
    };

    await addBillEntry({ company_id: data.company_id, data: payload });
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    resetField,
    setValue,
  } = useForm({
    defaultValues: {
      supplier_type: null,
      account_name: null,
      supplier_name: null,
      company_id: null,
      bank_name: null,
      cheque_no: null,
      cheque_date: dayjs(),
      amount: "",
      voucher_no: "",
      voucher_date: dayjs(),
      remark: "",
      selection: "passBook_update",
    },
    resolver: addBillValidationSchema,
  });

  const { supplier_type, company_id, supplier_name, account_name } = watch();

  const bankOption = useMemo(() => {
    resetField("bank_name");
    if (company_id && companyListRes) {
      const selectedCompany = companyListRes.rows.find(
        ({ id }) => id === company_id
      );
      if (selectedCompany && selectedCompany?.company_bank_details.length) {
        const bankOption = selectedCompany?.company_bank_details?.map(
          ({ bank_name, id, balance }) => {
            return { label: bank_name, value: id, balance };
          }
        );

        return bankOption;
      } else {
        return [];
      }
    } else {
      return [];
    }
  }, [company_id, companyListRes, resetField]);

  const {
    data: dropdownSupplierListRes,
    isLoading: isLoadingDropdownSupplierList,
  } = useQuery({
    queryKey: [
      "dropdown/supplier/list",
      { company_id: company_id, supplier_type },
    ],
    queryFn: async () => {
      const res = await getDropdownSupplierListRequest({
        params: { company_id: company_id, supplier_type },
      });
      return res.data?.data?.supplierList;
    },
    enabled: Boolean(company_id && supplier_type),
  });

  const dropDownSupplierCompanyOption = useMemo(() => {
    if (
      supplier_name &&
      dropdownSupplierListRes &&
      dropdownSupplierListRes.length
    ) {
      resetField("account_name");
      const obj = dropdownSupplierListRes.find((item) => {
        return item.supplier_name === supplier_name;
      });
      return obj?.supplier_company;
    } else {
      return [];
    }
  }, [supplier_name, dropdownSupplierListRes, resetField]);

  const { data: unPaidBillListRes, isLoading: isLoadingUnPaidBillList } =
    useQuery({
      queryKey: [
        "account/bill/list",
        { company_id: company_id, supplier_id: account_name },
      ],
      queryFn: async () => {
        const res = await getUnPaidPaymentBillListRequest({
          params: { company_id: company_id, supplier_id: account_name },
        });
        return res.data?.data;
      },
      enabled: Boolean(company_id && account_name),
    });

  useEffect(() => {
    if (unPaidBillListRes) {
      let totalBill = 0;
      let totalAmount = 0;
      let totalNetAmount = 0;
      setUnPaidBillData(unPaidBillListRes);
      unPaidBillListRes.forEach((bill) => {
        totalBill += 1;
        totalAmount += bill.amount;
        totalNetAmount += bill.net_amount;
      });

      setTotalCounts({ totalBills: totalBill, totalAmount, totalNetAmount });
    }
  }, [unPaidBillListRes]);

  // get last voucher no API
  const { data: lastVoucherNo } = useQuery({
    queryKey: ["account/statement/last/voucher", { company_id }],
    queryFn: async () => {
      const res = await getLastVoucherNoRequest({
        params: { company_id },
      });
      return res.data?.data;
    },
    enabled: Boolean(company_id),
  });

  useEffect(() => {
    if (lastVoucherNo && lastVoucherNo.length) {
      setValue("voucher_no", lastVoucherNo);
    } else {
      setValue("voucher_no", "");
    }
  }, [lastVoucherNo, setValue]);

  // ************************************************************************************************

  const calculateAmount = useCallback(() => {
    let totalAmount = 0;
    selectedBills.forEach((bill) => {
      let netAmount = bill.net_amount;

      let finalTotalAmount = netAmount;
      finalTotalAmount += bill?.part_payment || 0;
      finalTotalAmount += bill?.plus_percentage || 0;
      finalTotalAmount -= bill?.less_percentage || 0;

      totalAmount += finalTotalAmount;
    });

    setValue("amount", totalAmount);
    setValue("remark", selectedBills.map((bill) => bill.bill_no).join(", "));
  }, [selectedBills, setValue]);

  useEffect(() => {
    if (selectedBills && selectedBills.length) {
      calculateAmount();
    } else {
      setValue("amount", 0);
      setValue("remark", "");
    }
  }, [calculateAmount, selectedBills, setValue]);

  const selectBillHandler = (e, bill) => {
    if (e.target.checked) {
      setSelectedBills((prev) => {
        return [
          ...prev,
          {
            ...bill,
            // paid_amount: bill.net_amount,
            paid_amount: 0,
            is_paid: true,
            part_payment: bill.part_payment || 0,
            less_percentage: bill.less_percentage || 0,
            plus_percentage: bill.plus_percentage || 0,
          },
        ];
      });
    } else {
      setSelectedBills((prev) => {
        return prev.filter((item) => item?.bill_id !== bill?.bill_id);
      });
    }
  };

  const onChangeSelectedBillHandler = (e, bill) => {
    let copyBill = { ...bill };
    copyBill[e.target.name] = +e.target.value;
    const updatedSelectedBills = selectedBills.map((bill) => {
      if (bill.bill_id === copyBill.bill_id) {
        return copyBill;
      } else {
        return bill;
      }
    });

    setSelectedBills(updatedSelectedBills);
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <Row gutter={12} style={{ padding: "12px" }}>

        {/* Company selection related option layout  */}
        <Col span={6}>
          <Card
            className="bill-option-card"
            style={{
              borderColor: "#194A6D",
              height: "100%",
            }}
          >
            <Form.Item
              label={"Select Company"}
              name="company_id"
              validateStatus={errors.company_id ? "error" : ""}
              help={errors.company_id && errors.company_id.message}
              wrapperCol={{ sm: 24 }}
              required
            >
              <Controller
                control={control}
                name="company_id"
                render={({ field }) => {
                  return (
                    <Select
                      {...field}
                      showSearch
                      placeholder="Select Company"
                      allowClear
                      options={
                        companyListRes &&
                        companyListRes.rows?.map((company) => {
                          return {
                            label: company.company_name,
                            value: company.id,
                          };
                        })
                      }
                    />
                  );
                }}
              />
            </Form.Item>

            <Form.Item
              label={"Supplier Type"}
              name="supplier_type"
              validateStatus={errors.supplier_type ? "error" : ""}
              help={errors.supplier_type && errors.supplier_type.message}
              wrapperCol={{ sm: 24 }}
              required
            >
              <Controller
                control={control}
                name="supplier_type"
                render={({ field }) => {
                  return (
                    <Select
                      {...field}
                      showSearch
                      placeholder="Select Supplier Type"
                      allowClear
                      options={SUPPLIER_TYPES}
                    />
                  );
                }}
              />
            </Form.Item>

            <Form.Item
              label={"Supplier Name"}
              name="supplier_name"
              validateStatus={errors.supplier_name ? "error" : ""}
              help={errors.supplier_name && errors.supplier_name.message}
              wrapperCol={{ sm: 24 }}
              required
            >
              <Controller
                control={control}
                name="supplier_name"
                render={({ field }) => {
                  return (
                    <Select
                      {...field}
                      showSearch
                      placeholder="Select Supplier"
                      allowClear
                      loading={isLoadingDropdownSupplierList}
                      options={dropdownSupplierListRes?.map((supervisor) => ({
                        label: supervisor?.supplier_name,
                        value: supervisor?.supplier_name,
                      }))}
                    />
                  );
                }}
              />
            </Form.Item>

            <Form.Item
              label={"Account Name"}
              name="account_name"
              validateStatus={errors.account_name ? "error" : ""}
              help={errors.account_name && errors.account_name.message}
              wrapperCol={{ sm: 24 }}
              required
            >
              <Controller
                control={control}
                name="account_name"
                render={({ field }) => {
                  return (
                    <Select
                      {...field}
                      showSearch
                      placeholder="Select Account"
                      allowClear
                      options={dropDownSupplierCompanyOption.map(
                        ({ supplier_id, supplier_company }) => {
                          return {
                            label: supplier_company,
                            value: supplier_id,
                          };
                        }
                      )}
                    />
                  );
                }}
              />
            </Form.Item>

          </Card>
        </Col>
        
        {/* Bank selection option layout  */}
        <Col span={12}>
          <Card
            style={{
              borderColor: "#194A6D",
              height: "100%",
            }}
          >
            <Row gutter={12}>
              <Col span={24}>
                <Form.Item
                  label={"Bank Name"}
                  name="bank_name"
                  validateStatus={errors.bank_name ? "error" : ""}
                  help={errors.bank_name && errors.bank_name.message}
                  wrapperCol={{ sm: 24 }}
                  required
                >
                  <Controller
                    control={control}
                    name="bank_name"
                    render={({ field }) => {
                      return (
                        <Select
                          {...field}
                          showSearch
                          placeholder="Select Bank"
                          allowClear
                          options={bankOption}
                        />
                      );
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  label={"Cheque No."}
                  name="cheque_no"
                  validateStatus={errors.cheque_no ? "error" : ""}
                  help={errors.cheque_no && errors.cheque_no.message}
                  wrapperCol={{ sm: 24 }}
                  required
                >
                  <Controller
                    control={control}
                    name="cheque_no"
                    render={({ field }) => {
                      return (
                        <Input {...field} showSearch placeholder="001245" />
                      );
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={"Cheque Date"}
                  name="cheque_date"
                  validateStatus={errors.cheque_date ? "error" : ""}
                  help={errors.cheque_date && errors.cheque_date.message}
                  wrapperCol={{ sm: 24 }}
                  required
                >
                  <Controller
                    control={control}
                    name="cheque_date"
                    render={({ field }) => {
                      return (
                        <DatePicker {...field} style={{ width: "100%" }} />
                      );
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={12}>
              <Col span={24}>
                <Form.Item
                  label={"Amount"}
                  name="amount"
                  validateStatus={errors.amount ? "error" : ""}
                  help={errors.amount && errors.amount.message}
                  wrapperCol={{ sm: 24 }}
                  required
                >
                  <Controller
                    control={control}
                    name="amount"
                    render={({ field }) => {
                      return <Input {...field} placeholder="0" readOnly />;
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Col>
        
        {/* Vocher number and other information */}
        <Col span={6}>
          <Card
            style={{
              borderColor: "#194A6D",
              height: "100%",
            }}
          >
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  label={"Voucher No."}
                  name="voucher_no"
                  validateStatus={errors.voucher_no ? "error" : ""}
                  help={errors.voucher_no && errors.voucher_no.message}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name="voucher_no"
                    render={({ field }) => {
                      return <Input {...field} readOnly placeholder="001245" />;
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={"Voucher Date"}
                  name="voucher_date"
                  validateStatus={errors.voucher_date ? "error" : ""}
                  help={errors.voucher_date && errors.voucher_date.message}
                  wrapperCol={{ sm: 24 }}
                  required
                >
                  <Controller
                    control={control}
                    name="voucher_date"
                    render={({ field }) => {
                      return (
                        <DatePicker {...field} style={{ width: "100%" }} />
                      );
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={12}>
              <Col span={24}>
                <Form.Item
                  label={"Remark (Printed on cheque)"}
                  name="remark"
                  validateStatus={errors.remark ? "error" : ""}
                  help={errors.remark && errors.remark.message}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name="remark"
                    render={({ field }) => {
                      return (
                        <TextArea
                          {...field}
                          rows={3}
                          placeholder="Enter remark"
                        />
                      );
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              // label={"Remark (Printed on cheque)"}
              name="selection"
              validateStatus={errors.selection ? "error" : ""}
              help={errors.selection && errors.selection.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="selection"
                render={({ field }) => {
                  return (
                    <Radio.Group {...field}>
                      <Radio value="passBook_update">PassBook Update</Radio>
                      <Radio value="cashBook_update">CashBook Update</Radio>
                    </Radio.Group>
                  );
                }}
              />
            </Form.Item>

            <Flex gap={10} justify="flex-end">
              <Button htmlType="button" onClick={() => reset()}>
                Reset
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isPendingBillEntry}
              >
                Create
              </Button>
            </Flex>
          </Card>
        </Col>
      
      </Row>

      {isLoadingUnPaidBillList ? (
        <div style={{
          display: "flex", 
          width: "100%", 
          paddingTop: "20px", 
          paddingBottom: "10px"
        }}>
          <div style={{
            marginLeft:"auto", 
            marginRight: "auto"
          }}>
            <Spin />
          </div>
        </div>
      ) : (
        <table className="custom-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Bill No</th>
              <th>Type</th>
              <th>Bill Amount</th>
              <th>Net Amount (+GST)</th>
              <th>Bill Date</th>
              <th>Due Days</th>
              <th>Part Payment</th>
              <th>TDS (Less)</th>
              <th>Less(%)</th>
              <th>Plus(%)</th>
            </tr>
          </thead>
          <tbody>
            {unPaidBillData && unPaidBillData.length ? (
              unPaidBillData?.map((bill, index) => {
                const isBillSelected = selectedBills.find(
                  ({ bill_id }) => bill_id === bill.bill_id
                );

                return (
                  <tr key={index + "_un_paid_bill"}>
                    <td style={{ textAlign: "center" }}>
                      <Checkbox
                        checked={isBillSelected}
                        onChange={(e) => selectBillHandler(e, bill)}
                      />
                    </td>
                    <td style={{ textAlign: "center" }}>{bill.bill_no}</td>
                    <td style={{ textAlign: "center" }}>Job</td>
                    <td style={{ textAlign: "center" }}>{bill.amount}</td>
                    <td style={{ textAlign: "center" }}>{bill.net_amount}</td>
                    <td style={{ textAlign: "center" }}>
                      {dayjs(bill.bill_date).format("DD-MM-YYYY")}
                    </td>
                    <td style={{ textAlign: "center" }}>4</td>
                    <td style={{ textAlign: "center", width: "200px" }}>
                      <Input
                        type="number"
                        name="part_payment"
                        style={{ width: "100%" }}
                        disabled={!isBillSelected}
                        value={
                          isBillSelected ? isBillSelected?.part_payment : ""
                        }
                        onChange={(e) =>
                          onChangeSelectedBillHandler(e, isBillSelected)
                        }
                      />
                    </td>
                    <td style={{ textAlign: "center" }}>{bill.tds || 0}</td>
                    <td style={{ textAlign: "center", width: "200px" }}>
                      <Input
                        type="number"
                        name="less_percentage"
                        style={{ width: "100%" }}
                        disabled={!isBillSelected}
                        onChange={(e) =>
                          onChangeSelectedBillHandler(e, isBillSelected)
                        }
                      />
                    </td>
                    <td style={{ textAlign: "center", width: "200px" }}>
                      <Input
                        type="number"
                        name="plus_percentage"
                        style={{ width: "100%" }}
                        disabled={!isBillSelected}
                        onChange={(e) =>
                          onChangeSelectedBillHandler(e, isBillSelected)
                        }
                      />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={11} style={{ textAlign: "center" }}>
                  Not Found
                </td>
              </tr>
            )}
            <tr style={{ backgroundColor: "var(--secondary-color)" }}>
              <td style={{ textAlign: "center", fontWeight: "bold" }}>Total</td>
              <td style={{ textAlign: "center", fontWeight: "bold" }}>
                {totalCounts.totalBills}
              </td>
              <td style={{ textAlign: "center" }}></td>
              <td style={{ textAlign: "center", fontWeight: "bold" }}>
                {totalCounts.totalAmount}
              </td>
              <td style={{ textAlign: "center", fontWeight: "bold" }}>
                {totalCounts.totalNetAmount}
              </td>
              <td style={{ textAlign: "center" }}></td>
              <td style={{ textAlign: "center" }}></td>
              <td style={{ textAlign: "center" }}></td>
              <td style={{ textAlign: "center" }}></td>
              <td style={{ textAlign: "center" }}></td>
              <td style={{ textAlign: "center" }}></td>
            </tr>
          </tbody>
        </table>
      )}
    </Form>
  );
};

export default BillForm;
