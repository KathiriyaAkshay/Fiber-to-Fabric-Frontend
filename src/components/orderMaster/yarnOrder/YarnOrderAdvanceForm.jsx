import { useForm, Controller } from "react-hook-form";
import {
  Form,
  Input,
  Button,
  message,
  Typography,
  Select,
  Col,
  Row,
} from "antd";
import { DevTool } from "@hookform/devtools";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { createYarnOrderAdvanceRequest } from "../../../api/requests/orderMaster";
import { useContext, useEffect } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { getCompanyBankListRequest } from "../../../api/requests/company";
import { getSupplierListRequest } from "../../../api/requests/users";

const yarnOrderAdvanceSchemaResolver = yupResolver(
  yup.object().shape({
    company_id: yup.string().required("Please select company"),
    bank_id: yup.string().required("please select bank"),
    supplier_id: yup.string().required("Please select supplier"),
    cheque_no: yup.string().required("please enter cheque no"),
    advance_amount: yup.string().required("please enter advance amount"),
    remaining_amount: yup.string(),
  })
);

const YarnOrderAdvanceForm = ({ yarnOrder = {} }) => {
  const { id: yarnOrderId } = yarnOrder;
  const { isLoadingCompanyList, companyListRes } = useContext(GlobalContext);
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: yarnOrderAdvanceSchemaResolver,
  });

  const { company_id } = watch();

  const { mutateAsync: createYarnOrderAdvance } = useMutation({
    mutationFn: async (data) => {
      // delete company_id
      delete data.company_id;
      const res = await createYarnOrderAdvanceRequest({
        id: yarnOrderId,
        data: data,
        params: { company_id },
      });
      return res?.data;
    },
    mutationKey: ["order-master", "yarn-order", "advances", "create"],
    onSuccess: (res) => {
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      queryClient.invalidateQueries(["company", "list"]);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message;
      if (errorMessage && typeof errorMessage === "string") {
        message.error(errorMessage);
      }
    },
  });

  const { data: companyBankListRes, isLoading: isLoadingBankDetails } =
    useQuery({
      queryKey: ["company", "bank-detail", "list", { company_id }],
      queryFn: async () => {
        const res = await getCompanyBankListRequest({
          params: { company_id },
        });
        return res.data?.data;
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

  async function onSubmit(data) {
    await createYarnOrderAdvance(data);
    reset();
  }

  useEffect(() => {
    // clear bank selection on company change
    setValue("bank_id", undefined);
    setValue("supplier_id", undefined);
  }, [company_id, setValue]);

  return (
    <>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Typography.Text className="text-xl font-medium text-primary">
          Create Advance
        </Typography.Text>
        <Row gutter={18}>
          <Col span={4}>
            <Form.Item
              label="Company"
              name="company_id"
              validateStatus={errors.company_id ? "error" : ""}
              help={errors.company_id && errors.company_id.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="company_id"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select Company"
                    loading={isLoadingCompanyList}
                    options={companyListRes?.rows?.map(
                      ({ company_name = "", id = "" }) => ({
                        label: company_name,
                        value: id,
                      })
                    )}
                    style={{
                      width: "100%",
                    }}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item
              label="Select Bank"
              name="bank_id"
              validateStatus={errors.bank_id ? "error" : ""}
              help={errors.bank_id && errors.bank_id.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="bank_id"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select Bank"
                    loading={isLoadingBankDetails}
                    options={companyBankListRes?.rows?.map(
                      ({ bank_name = "", id = "" }) => ({
                        label: bank_name,
                        value: id,
                      })
                    )}
                    style={{
                      width: "100%",
                    }}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col
            span={4}
            //   className="flex items-end gap-2"
          >
            <Form.Item
              label="Supplier"
              name="supplier_id"
              validateStatus={errors.supplier_id ? "error" : ""}
              help={errors.supplier_id && errors.supplier_id.message}
              wrapperCol={{ sm: 24 }}
              className="flex-grow"
            >
              <Controller
                control={control}
                name="supplier_id"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select supplier"
                    loading={isLoadingSupplierList}
                    options={supplierListRes?.rows?.map((supervisor) => ({
                      label: supervisor?.first_name,
                      value: supervisor?.id,
                    }))}
                  />
                )}
              />
            </Form.Item>
            {/* <Button
              icon={<PlusCircleOutlined />}
              onClick={goToAddSupplier}
              className="flex-none mb-6"
              type="primary"
            /> */}
          </Col>

          <Col span={4}>
            <Form.Item
              label="Cheque No."
              name="cheque_no"
              validateStatus={errors.cheque_no ? "error" : ""}
              help={errors.cheque_no && errors.cheque_no.message}
            >
              <Controller
                control={control}
                name="cheque_no"
                render={({ field }) => (
                  <Input {...field} placeholder="01rt34" />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item
              label="Advance Amount"
              name="advance_amount"
              validateStatus={errors.advance_amount ? "error" : ""}
              help={errors.advance_amount && errors.advance_amount.message}
            >
              <Controller
                control={control}
                name="advance_amount"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="100000"
                    type="number"
                    min={0}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={4} className="flex items-end mb-6">
            <Button type="primary" htmlType="submit">
              Add
            </Button>
          </Col>
        </Row>
      </Form>
      <DevTool control={control} />
    </>
  );
};

export default YarnOrderAdvanceForm;
