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
  Tag,
  Tooltip,
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
import { BEAM_RECEIVE_TAG_COLOR, CREDIT_NOTE_OTHER, GENERAL_PURCHASE_ENTRY_TAG_COLOR, JOB_REWORK_BILL_TAG_COLOR, JOB_TAG_COLOR, PURCHASE_TAG_COLOR, PURCHASE_YARN_BILL_TAG_COLOR } from "../../../constants/tag";
import moment from "moment";
import { generateJobBillDueDate, generatePurchaseBillDueDate } from "../reports/utils";
import { CREDIT_NOTE_BILL_MODEL, CREDIT_NOTE_MODEL_NAME, GENERAL_PURCHASE_MODEL_NAME, GENRAL_PURCHASE_BILL_MODEL, JOB_REWORK_BILL_MODEL, JOB_REWORK_MODEL_NAME, JOB_TAKA_MODEL_NAME, PURCHASE_TAKA_BILL_MODEL, PURCHASE_TAKA_MODEL_NAME, RECEIVE_SIZE_BEAM_BILL_MODEL, RECEIVE_SIZE_BEAM_MODEL_NAME, YARN_RECEIVE_BILL_MODEL, YARN_RECEIVE_MODEL_NAME } from "../../../constants/bill.model";
import { billDataHandler  } from "../../../constants/bill.handler";

const { TextArea } = Input;
const SUPPLIER_TYPES = [
  { label: "Purchase / Trading", value: "purchase/trading" },
  { label: "Job", value: "job" },
  { label: "Yarn", value: "yarn" },
  { label: "Other", value: "other" },
  { label: "Re-Work", value: "re-work" },
];

function calculateDaysDifference(dueDate) {
  const today = new Date(); // Get today's date
  const [day, month, year] = dueDate.split('-');
  const due = new Date(year, month - 1, day);
  const timeDifference = today - due; // Difference in milliseconds
  const dayDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
  return dayDifference;
}

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

  function disabledFutureDate(current) {
    return current && current > moment().endOf("day");
  }

  // ************** Bill Payment request handler ********************** //
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
          message.success("Bill Payment paid successfully");
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
    let hasError = false;
    const temp_bill_details = selectedBills?.map((element) => {

      if (
        element?.part_payment === null || 
        element?.part_payment === undefined || 
        Number.isNaN(+element?.part_payment) || 
        element?.part_payment === ''
      ) {
        message.warning('Part payment value is invalid or missing!');
        hasError = true; 
        return ; 
      }

      let tds_amount = +element?.tds ; // TDS Amount 
      let plus_amount = +element?.plus_percentage ;  // Plus amount
      let minus_amount = +element?.less_percentage ; // Minus amount
      
      let billData = billDataHandler(element) ;
      let bill_remaing_amount = element?.part_payment || 0 ; 

      // Paid amount calcuation 
      let paid_amount = +billData?.bill_net_amount - +bill_remaing_amount ; 
      paid_amount = +paid_amount - +tds_amount ; 
      paid_amount = +paid_amount + +plus_amount ; 
      paid_amount = +paid_amount - +minus_amount ; // Paid Amount calculation

      return {
        "bill_id": billData?.bill_id,
        "bill_no": billData?.bill_no,
        "amount": +billData?.bill_amount_without_gst,
        "bill_date": billData?.bill_date,
        "due_date": billData?.dueDate,
        "tds": tds_amount,
        "less_percentage": minus_amount,
        "plus_percentage": plus_amount,
        "model": billData?.model,
        "net_amount": billData?.bill_net_amount,
        "part_payment": bill_remaing_amount,
        "paid_amount": parseFloat(paid_amount).toFixed(2)
      }
    });
  

    const payload = {
      supplier_id: +data.account_name,
      bank_id: +data.bank_name,
      cheque_no: data.cheque_no,
      total_amount: +data.amount,
      voucher_no: data.voucher_no,
      remark: data.remark,
      is_passbook_entry: data.selection === "passBook_update" ? true : false,
      cheque_date: dayjs(data.cheque_date).format("YYYY-MM-DD"),
      createdAt: dayjs(data.voucher_date).format("YYYY-MM-DD"),
      bill_details: temp_bill_details,
      is_credited: false
    };

    if (!hasError){
      await addBillEntry({ company_id: data.company_id, data: payload });
    }
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    resetField,
    setValue,
    getValues
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
  
  // Bill data total count calculation ================================
  useEffect(() => {
    if (unPaidBillListRes) {
      let totalBill = 0;
      let totalAmount = 0;
      let totalNetAmount = 0;
      setUnPaidBillData(unPaidBillListRes);

      unPaidBillListRes.forEach((bill) => {
          totalBill += 1;
          let billData = billDataHandler(bill) ; 
          totalAmount += +billData?.bill_amount_without_gst;
          totalNetAmount += +billData?.bill_net_amount;
      });

      setTotalCounts({ 
        totalBills: totalBill, 
        totalAmount: parseFloat(totalAmount).toFixed(2), 
        totalNetAmount: parseFloat(totalNetAmount).toFixed(2) 
      });
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

  // ******** Bill total paid amount calculation ********* // 
  const calculateAmount = useCallback(() => {
    let totalAmount = 0;
    selectedBills.forEach((bill) => {
      let billData = billDataHandler(bill) ; 
      
      // Paid amount calculation ===================
      let tds_amount = +bill?.tds ; 
      let plus_amount = +bill?.plus_percentage ; 
      let minus_amount = +bill?.less_percentage ; 
      let bill_remaing_amount = +bill?.part_payment || 0 ;

      let paid_amount = +billData?.bill_net_amount - +bill_remaing_amount ; 
      paid_amount = +paid_amount - +tds_amount ; 
      paid_amount = +paid_amount + +plus_amount ; 
      paid_amount = +paid_amount - +minus_amount ; 
      totalAmount += paid_amount ; 
          
    });

    setValue("amount", parseFloat(totalAmount).toFixed(2));
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

  // Bill selection handler =========================
  const selectBillHandler = (e, bill) => {
    if (e.target.checked) {
      setSelectedBills((prev) => [
        ...prev,
        {
          ...bill,  
          exists_part_payment: bill?.part_payment,
          paid_amount: 0,
          is_paid: true,
          part_payment: 0,
          less_percentage: 0,
          plus_percentage: 0,
          tds_amount: 0
        },
      ]);
    } else {
      setSelectedBills((prev) => {
        return prev.filter((item) => item?.bill_id !== +bill?.bill_id && item?.model != bill?.model);
      });
    }
  };

  // Bill changes handler ==========================
  const onChangeSelectedBillHandler = (e, bill, option) => {
    if (e.target.value == undefined){
      let copyBill = { ...bill };
      copyBill[e.target] = 0;
      const updatedSelectedBills = selectedBills.map((bill) => {
        if (bill.bill_id === copyBill.bill_id) {
          return copyBill;
        } else {
          return bill;
        }
      });
      setSelectedBills(updatedSelectedBills);
    } else {
      let copyBill = { ...bill };
      copyBill[e.target.name] = +e.target.value;

      if (e.target.name == "plus_percentage"){
        copyBill["less_percentage"] = 0 ; 
      } else {
        copyBill["plus_percentage"] = 0 ; 
      }

      const updatedSelectedBills = selectedBills.map((bill) => {
        if (bill.bill_id === copyBill.bill_id) {
          return copyBill;
        } else {
          return bill;
        }
      });
      setSelectedBills(updatedSelectedBills);
    }
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

            {/* Company selection  */}
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

            {/* Supplier type selection  */}
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

            {/* Supplier name selection  */}
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
              
            {/* Supplier company selection  */}
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

                {/* Bank name selection  */}
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
                        <DatePicker {...field} style={{ width: "100%" }} disabledDate={disabledFutureDate} />
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
                        <DatePicker {...field} style={{ width: "100%" }} disabledDate={disabledFutureDate}/>
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
              <th>TDS (Less % )</th>
              <th>Less (%)</th>
              <th>Plus (%)</th>
            </tr>
          </thead>
          <tbody>
            {unPaidBillData && unPaidBillData.length ? (
              unPaidBillData?.map((bill, index) => {
                const isBillSelected = selectedBills.find(
                  ({ bill_id, model }) => bill_id === +bill.bill_id && model == bill?.model
                );

                // const dueDate = bill?.due_date == null?
                //   bill?.model == PURCHASE_TAKA_MODEL_NAME?generatePurchaseBillDueDate(bill?.bill_date):
                //   generateJobBillDueDate(bill?.bill_date)
                //   :moment(bill?.due_date).format("DD-MM-YYYY") ;

                // const dueDays = bill?.model == CREDIT_NOTE_MODEL_NAME?0:calculateDaysDifference(dueDate) ; 

                // let bill_net_amount = +bill?.net_amount ; 
                // let debit_note_amount = +bill?.debit_note_amount || 0; 
                // let bill_deducation_amount = parseFloat(+bill_net_amount - +debit_note_amount).toFixed(2) ; 
                // let bill_remaing_amount = parseFloat(bill?.part_payment == null?bill_deducation_amount:+bill?.part_payment).toFixed(2) ; 
                // bill_deducation_amount = parseFloat(+bill_deducation_amount - +bill_remaing_amount).toFixed(2) ; 

                let payment = billDataHandler(bill); 

                return (
                  <tr key={index + "_un_paid_bill"} className={isBillSelected?"checked-bill-row":""}>

                    {/* Bill selection  */}
                    <td style={{ textAlign: "center" }}>
                      <Checkbox
                        checked={isBillSelected}
                        onChange={(e) => selectBillHandler(e, bill)}
                      />
                    </td>
                    
                    {/* Bill number and debit note number related information  */}
                    <td style={{ textAlign: "center", fontWeight: 600,
                      color: bill?.model == "credit_notes"?"green":"#000", 
                      cursor: "pointer"
                     }}>

                      <Tooltip title = {payment?.debit_note_number?.length > 0?`DEBIT NOTE : ${payment?.debit_note_number?.map((element) => element?.number).join(", ")}`:""}>
                        <div>
                          {bill.bill_no}
                        </div>

                        <div style={{
                          color: "blue", 
                          fontSize: 12
                        }}>
                          {payment?.debit_note_number?.length > 0?`(${payment?.debit_note_number?.map((element) => element?.number).join(", ")})`:""}
                        </div>
                      </Tooltip>
                    </td>
                    
                    {/* Bill model  */}
                    {/* ===== Total bill information ===== 
                      1. Purchase taka
                      2. General purchase entry
                      3. Size beam receive 
                      4. Yarn receive 
                      5. Job bill 
                      6. Job Rework bill 
                    */}

                    <td style={{ textAlign: "center" }}>
                      
                      {bill?.model == PURCHASE_TAKA_BILL_MODEL?
                        <Tag color = {PURCHASE_TAG_COLOR} className="bill-payment-model-tag">
                          {PURCHASE_TAKA_MODEL_NAME}
                        </Tag>
                      :bill?.model == YARN_RECEIVE_BILL_MODEL?
                        <Tag color = {PURCHASE_YARN_BILL_TAG_COLOR} className="bill-payment-model-tag">
                          {YARN_RECEIVE_MODEL_NAME}
                        </Tag>
                      :bill?.model == RECEIVE_SIZE_BEAM_BILL_MODEL?
                        <Tag color = {BEAM_RECEIVE_TAG_COLOR} className="bill-payment-model-tag">
                          {RECEIVE_SIZE_BEAM_MODEL_NAME}
                        </Tag>
                      : bill?.model == CREDIT_NOTE_BILL_MODEL?
                        <Tag color= {CREDIT_NOTE_OTHER} className="bill-payment-model-tag">
                          {CREDIT_NOTE_MODEL_NAME}
                        </Tag>
                      : bill?.model == JOB_REWORK_BILL_MODEL?
                        <Tag color = {JOB_REWORK_BILL_TAG_COLOR} className="bill-payment-model-tag">
                          {JOB_REWORK_MODEL_NAME}
                        </Tag>
                      : bill?.model == GENRAL_PURCHASE_BILL_MODEL?
                        <Tag color = {GENERAL_PURCHASE_ENTRY_TAG_COLOR} className="bill-payment-model-tag">
                          {GENERAL_PURCHASE_MODEL_NAME}
                        </Tag>
                      :<>
                        <Tag color={JOB_TAG_COLOR} className="bill-payment-model-tag">
                          {JOB_TAKA_MODEL_NAME}
                        </Tag>
                      </>}
                    </td>
                      
                    <td style={{ textAlign: "center", color: "#000" }}>{payment?.bill_amount_without_gst || "0"}</td>
                    
                    <td style={{ textAlign: "center", fontWeight: 600, cursor: "pointer" }}>
                      <Tooltip title = {payment?.bill_net_amount_info_string}>
                        {payment?.bill_net_amount}
                      </Tooltip>
                    </td>
                    
                    <td style={{ textAlign: "center" }}>
                      {payment?.bill_date}
                    </td>
                    
                    <td style={{ textAlign: "center", color: payment?.due_days_color, fontWeight: payment?.dueDays == 0?500:600 }}>
                      {`${payment?.dueDays !== 0?'+' + payment?.dueDays + "D":payment?.dueDays}`}
                    </td>
                    
                    {/* Part payment amount information  */}
                    <td style={{ textAlign: "center", width: "200px" }}>
                      <Input
                        type="number"
                        name="part_payment"
                        style={{ width: "100%" }}
                        disabled={!isBillSelected}
                        value={
                          isBillSelected ? isBillSelected?.part_payment : ""
                        }
                        onChange={(e) =>{
                          let net_amount = +bill.net_amount
                          if (e.target.value > net_amount){
                            message.warning("Please, Provide valid part amount") ; 
                          } else {
                            onChangeSelectedBillHandler(e, isBillSelected)
                          }
                        }
                        }
                      />
                    </td> 
                      
                    {/* ======================= TDS Amount ================================  */}
                    <td style={{ textAlign: "center" }}>
                      <Input
                        type="number"
                        name="tds"
                        style={{ width: "100%", color:"red", fontWeight: 600 }}
                        disabled={!isBillSelected}
                        value={isBillSelected? isBillSelected?.tds :""}
                        onChange={(e) =>{

                          // Calculate current paid amount
                          let exist_remaing_amount = (isBillSelected?.exists_part_payment == null || isBillSelected?.exists_part_payment == undefined)?
                            +isBillSelected?.net_amount: +isBillSelected?.exists_part_payment || 0 ; 
                          let current_remaing_amount = isBillSelected?.part_payment || 0; 
                          let paid_amount = +exist_remaing_amount - +current_remaing_amount ; 


                          if (e.target.value > paid_amount){
                            message.warning("Please, Provide valid TDS amount") ; 
                          } else {
                            onChangeSelectedBillHandler(e, isBillSelected, "TDS")
                          }
                        }}
                      />
                    </td>
                    
                    {/* ================= Less amount ======================  */}
                    <td style={{ textAlign: "center", width: "200px" }}>
                      <Input
                        type="number"
                        name="less_percentage"
                        style={{ width: "100%", color:"red" }}
                        disabled={!isBillSelected}
                        value={
                          isBillSelected ? isBillSelected?.less_percentage : ""
                        }
                        onChange={(e) =>{
                          
                          // Handle Functionality if user enter less percentage than plus percentage must be zero
                          // If Plus percentage have value than less percentage will be zero

                          let exist_remaing_amount = (isBillSelected?.exists_part_payment == null || isBillSelected?.exists_part_payment == undefined)?
                            +isBillSelected?.net_amount: +isBillSelected?.exists_part_payment || 0 ; 
                          let current_remaing_amount = isBillSelected?.part_payment || 0; 
                          let paid_amount = +exist_remaing_amount - +current_remaing_amount ; 
                          if (e.target.value > paid_amount){
                            message.warning("Please, Provide Valid Less Amount") ; 
                          } else {
                            onChangeSelectedBillHandler(e, isBillSelected, "LESS")
                          }
                        }}
                      />
                    </td>

                    {/* =========== Plus amount ==========  */}
                    <td style={{ textAlign: "center", width: "200px" }}>
                      <Input
                        type="number"
                        name="plus_percentage"
                        style={{ width: "100%", color: "green" }}
                        disabled={!isBillSelected}
                        value={
                          isBillSelected ? isBillSelected?.plus_percentage : ""
                        }
                        onChange={(e) =>
                          onChangeSelectedBillHandler(e, isBillSelected, "PLUS")
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
                {parseFloat(totalCounts.totalAmount).toFixed(2)}
              </td>
              <td style={{ textAlign: "center", fontWeight: "bold" }}>
                {parseFloat(totalCounts.totalNetAmount).toFixed(2)}
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
