import { CloseOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Typography,
} from "antd";
import {
  updateCashbookRequest,
  updatePassbookRequest,
} from "../../../../api/requests/accounts/payment";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import dayjs from "dayjs";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { PARTICULAR_OPTIONS } from "../../../../constants/account";
import { getParticularListRequest } from "../../../../api/requests/accounts/particular";
import moment from "moment";

const { TextArea } = Input;

const EditCashbookEntry = ({
  open,
  handleClose,
  row,
  companyId,
  isVerifyEntry,
}) => {
  const queryClient = useQueryClient();
  const [particularOptions, setParticularOptions] = useState([]);

  let validationSchema;
  if (isVerifyEntry) {
    validationSchema = yupResolver(
      yup.object().shape({
        voucher_date: yup.string().required("Please enter voucher date."),
        remarks: yup.string().required("Please enter remark."),
        amount: yup.string().required("Please enter amount."),
        particular_type: yup.string().required("Please select particular."),
      })
    );
  } else {
    validationSchema = yupResolver(
      yup.object().shape({
        voucher_date: yup.string().required("Please enter voucher date."),
        remarks: yup.string().required("Please enter remark."),
      })
    );
  }

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

  const { mutateAsync: updatePassBookEntry, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await updateCashbookRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["update", "passbook", "entry", { companyId }],
    onSuccess: (res) => {
      queryClient.invalidateQueries([
        "get",
        "passBook",
        "list",
        { company_id: companyId },
      ]);
      const successMessage = res?.message;
      if (successMessage) {
        message.success("Cashbook Statement updated successfully");
      }
      handleClose();
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(errorMessage);
    },
  });

  const onSubmit = async (data) => {
    const payload = {
      remarks: data.remarks,
      voucher_date: dayjs(data.voucher_date).format("YYYY-MM-DD"),
      id: row?.id,
    };
    if (row?.is_manually_created) {
      payload["amount"] = +data.amount;
      payload["particular_type"] = data.particular_type;
    }
    await updatePassBookEntry(payload);
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      voucher_date: dayjs(),
      remarks: "",
      amount: "",
      particular_type: null,
    },
    resolver: validationSchema,
  });

  useEffect(() => {
    if (row) {
      const resetPayload = {
        remarks: row.remarks,
        voucher_date: dayjs(row.voucher_date),
      };
      if (isVerifyEntry) {
        resetPayload["amount"] = row.amount;
        resetPayload["particular_type"] = row.particular_type;
      }
      reset({
        ...resetPayload,
      });
    }
  }, [isVerifyEntry, reset, row]);

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

  function disabledFutureDate(current) {
    return current && current > moment().endOf("day");
  }

  return (
    <Modal
      closeIcon={<CloseOutlined className="text-white" />}
      title={
        <Typography.Text className="text-xl font-medium text-white">
          Entry Update
        </Typography.Text>
      }
      open={open}
      footer={null}
      onCancel={handleClose}
      centered={true}
      className="view-in-house-quality-model"
      classNames={{
        header: "text-center",
      }}
      styles={{
        content: {
          padding: 0,
          width: "600px",
          margin: "auto",
        },
        header: {
          padding: "16px",
          margin: 0,
        },
        body: {
          padding: "10px 16px",
        },
      }}
    >
      <Row
        gutter={18}
        style={{
          paddingTop: "12px",
        }}
      >
        <Col span={24}>
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
                  <DatePicker
                    {...field}
                    style={{ width: "100%" }}
                    disabledDate={disabledFutureDate}
                  />
                );
              }}
            />
          </Form.Item>
        </Col>

        {isVerifyEntry ? (
          <>
            {row?.is_manually_created && (
              <>
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
                        return (
                          <Input
                            value={parseFloat(row?.amount).toFixed(2)}
                            {...field}
                            readOnly={!row?.is_manually_created}
                          />
                        );
                      }}
                    />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item
                    label={"Particular"}
                    name="particular_type"
                    validateStatus={errors.particular_type ? "error" : ""}
                    help={
                      errors.particular_type && errors.particular_type.message
                    }
                    wrapperCol={{ sm: 24 }}
                    required
                  >
                    <Controller
                      control={control}
                      name="particular_type"
                      render={({ field }) => {
                        return (
                          <Select
                            {...field}
                            showSearch
                            loading={isLoadingParticular}
                            placeholder="Select Particular"
                          >
                            {particularOptions?.map((option) => (
                              <Select.Option
                                key={option.value}
                                value={option.value}
                                style={{ color: option.color }}
                              >
                                {option.label}
                              </Select.Option>
                            ))}
                          </Select>
                        );
                      }}
                    />
                  </Form.Item>
                </Col>
              </>
            )}
          </>
        ) : null}

        <Col span={24}>
          <Form.Item
            label={"Remark"}
            name="remarks"
            validateStatus={errors.remarks ? "error" : ""}
            help={errors.remarks && errors.remarks.message}
            wrapperCol={{ sm: 24 }}
            required
          >
            <Controller
              control={control}
              name="remarks"
              render={({ field }) => {
                return (
                  <TextArea {...field} rows={2} placeholder="Enter remark" />
                );
              }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Flex gap={10} justify="flex-end">
        <Button htmlType="button" onClick={handleClose}>
          Cancel
        </Button>

        <Button
          type="primary"
          htmlType="button"
          loading={isPending}
          onClick={handleSubmit(onSubmit)}
        >
          Update
        </Button>
      </Flex>
    </Modal>
  );
};

export default EditCashbookEntry;
