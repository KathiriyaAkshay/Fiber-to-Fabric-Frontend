import {
  Button,
  Card,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  message,
  Row,
  Select,
} from "antd";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import dayjs from "dayjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addJournalRequest,
  getLastVoucherNoRequest,
} from "../../../api/requests/accounts/payment";
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { getParticularListRequest } from "../../../api/requests/accounts/particular";
import { PARTICULAR_OPTIONS } from "../../../constants/account";

const { TextArea } = Input;

const addContraValidationSchema = yupResolver(
  yup.object().shape({
    // company: yup.string().required("Please select company."),
    from_particular: yup.string().required("Please select from particular."),
    to_particular: yup.string().required("Please select To particular."),
    remark: yup.string().required("Please enter remark."),
    amount: yup.string().required("Please enter amount."),
    date: yup.date().required("Please enter date."),
    voucher_no: yup.string().required("Please enter voucher no."),
  })
);

const JournalForm = () => {
  const { companyId } = useContext(GlobalContext);
  const queryClient = useQueryClient();

  const [particularOptions, setParticularOptions] = useState([]);

  // get last voucher no API
  const { data: lastVoucherNo } = useQuery({
    queryKey: ["account/statement/last/voucher", { company_id: companyId }],
    queryFn: async () => {
      const res = await getLastVoucherNoRequest({
        params: { company_id: companyId },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  // get particular list API
  const { data: particularRes, isLoading: isLoadingParticular } = useQuery({
    queryKey: [
      "dropdown/passbook_particular_type/list",
      { company_id: companyId },
    ],
    queryFn: async () => {
      const res = await getParticularListRequest({
        params: { company_id: companyId },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const { mutateAsync: addNewJournalEntry, isPending: isPendingJournalAdd } =
    useMutation({
      mutationFn: async (data) => {
        const res = await addJournalRequest({
          data,
          params: {
            company_id: companyId,
          },
        });
        return res.data;
      },
      mutationKey: ["add", "journal", "new"],
      onSuccess: (res) => {
        queryClient.invalidateQueries([
          "account/statement/last/voucher",
          { company_id: companyId },
        ]);
        const successMessage = res?.message;
        if (successMessage) {
          message.success(successMessage);
        }
        reset();
      },
      onError: (error) => {
        const errorMessage = error?.response?.data?.message || error.message;
        message.error(errorMessage);
      },
    });

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      createdAt: dayjs(data.date).format("YYYY-MM-DD"),
      amount: +data.amount,
    };
    delete payload.date;
    await addNewJournalEntry(payload);
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm({
    defaultValues: {
      // company: null,
      from_particular: null,
      to_particular: null,
      remark: "",
      amount: "",
      date: dayjs(),
      voucher_no: "",
    },
    resolver: addContraValidationSchema,
  });

  useEffect(() => {
    if (lastVoucherNo && lastVoucherNo.length) {
      setValue("voucher_no", lastVoucherNo);
    } else {
      setValue("voucher_no", `V-1`);
    }
  }, [lastVoucherNo, setValue]);

  useEffect(() => {
    if (particularRes) {
      const otherOption = {
        label: "OTHER",
        value: "other",
        is_cost_per_meter: false,
        color: "black",
      };

      const data = particularRes.rows.map(
        ({ particular_name, label, is_cost_per_meter, head }) => {
          return {
            label: label,
            value: particular_name,
            color: "#000",
            is_cost_per_meter,
            head,
          };
        }
      );

      setParticularOptions([...PARTICULAR_OPTIONS, ...data, otherOption]);
    }
  }, [particularRes]);

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <Card
        style={{
          borderColor: "#194A6D",
          height: "auto",
          maxWidth: "50%",
          margin: "auto",
        }}
      >
        <Row gutter={12}>
          {/* <Col span={8}>
            <Form.Item
              label={"Company"}
              name="company"
              validateStatus={errors.company ? "error" : ""}
              help={errors.company && errors.company.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="company"
                render={({ field }) => {
                  return (
                    <Select
                      {...field}
                      showSearch
                      placeholder="Select Company"
                      labelInValue
                      allowClear
                    />
                  );
                }}
              />
            </Form.Item>
          </Col> */}
          <Col span={12}>
            <Form.Item
              label={"From Particular"}
              name="from_particular"
              validateStatus={errors.from_particular ? "error" : ""}
              help={errors.from_particular && errors.from_particular.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="from_particular"
                render={({ field }) => {
                  return (
                    <Select
                      {...field}
                      showSearch
                      placeholder="Select Type"
                      allowClear
                      options={particularOptions}
                      loading={isLoadingParticular}
                    />
                  );
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={"To Particular"}
              name="to_particular"
              validateStatus={errors.to_particular ? "error" : ""}
              help={errors.to_particular && errors.to_particular.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="to_particular"
                render={({ field }) => {
                  return (
                    <Select
                      {...field}
                      showSearch
                      placeholder="Select Type"
                      allowClear
                      options={particularOptions}
                      loading={isLoadingParticular}
                    />
                  );
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={8}>
            <Form.Item
              label={"Date"}
              name="date"
              validateStatus={errors.date ? "error" : ""}
              help={errors.date && errors.date.message}
              wrapperCol={{ sm: 24 }}
              required
            >
              <Controller
                control={control}
                name="date"
                render={({ field }) => {
                  return <DatePicker {...field} style={{ width: "100%" }} />;
                }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
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
                  return <Input {...field} placeholder="0" />;
                }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={"Remark"}
              name="remark"
              validateStatus={errors.remark ? "error" : ""}
              help={errors.remark && errors.remark.message}
              wrapperCol={{ sm: 24 }}
              required
            >
              <Controller
                control={control}
                name="remark"
                render={({ field }) => {
                  return (
                    <TextArea {...field} rows={1} placeholder="Hello test..." />
                  );
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={8}>
            <Form.Item
              label={"Voucher No"}
              name="voucher_no"
              validateStatus={errors.voucher_no ? "error" : ""}
              help={errors.voucher_no && errors.voucher_no.message}
              wrapperCol={{ sm: 24 }}
              required
            >
              <Controller
                control={control}
                name="voucher_no"
                render={({ field }) => {
                  return <Input {...field} placeholder="V-12" readOnly />;
                }}
              />
            </Form.Item>
          </Col>
        </Row>
        <Flex gap={10} justify="flex-end">
          <Button
            type="primary"
            htmlType="submit"
            loading={isPendingJournalAdd}
          >
            Create
          </Button>
        </Flex>
      </Card>
    </Form>
  );
};

export default JournalForm;
