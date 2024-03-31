import { ArrowLeftOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Col, Flex, Form, Input, Row, Select, message } from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { DevTool } from "@hookform/devtools";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useContext, useEffect } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import {
  createWastageSaleReportRequest,
  getDropdownParticularWastageListRequest,
} from "../../../../api/requests/reports/wastageSaleReport";

const addWastageSalesReportSchemaResolver = yupResolver(
  yup.object().shape({
    particular: yup.string().required("Please select particular"),
    particular_type: yup.string().required("Please select particular type"),
    pis: yup.string().required("Please enter pis"),
    rate_par_pis: yup.string().required("Please enter rate per pis"),
    total: yup.string(),
    notes: yup.string(),
  })
);

function AddWastageSalesReport() {
  const { companyId } = useContext(GlobalContext);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data: particularWastageListRes,
    isLoading: isLoadingParticularWastageList,
  } = useQuery({
    queryKey: ["dropdown/particular_wastage/list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getDropdownParticularWastageListRequest({
        companyId,
        params: { company_id: companyId },
      });
      return res.data?.data?.particularWastageList;
    },
    enabled: Boolean(companyId),
  });

  const { mutateAsync: createWastageSalesReport } = useMutation({
    mutationFn: async (data) => {
      const res = await createWastageSaleReportRequest({
        data,
        params: { company_id: companyId },
      });
      return res.data;
    },
    mutationKey: ["reports/wastage-sale-report/create"],
    onSuccess: (res) => {
      queryClient.invalidateQueries(["reports", "list", companyId]);
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      navigate(-1);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(errorMessage);
    },
  });

  function goBack() {
    navigate(-1);
  }

  async function onSubmit(data) {
    await createWastageSalesReport(data);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: addWastageSalesReportSchemaResolver,
    defaultValues: {},
  });

  const { particular, rate_par_pis, pis } = watch();

  useEffect(() => {
    if (pis && rate_par_pis) {
      const total = Number(pis) * Number(rate_par_pis);
      setValue("total", Math.max(0, total));
    }
  }, [pis, rate_par_pis, setValue]);

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Wastage Sales report</h3>
      </div>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Row
          gutter={18}
          style={{
            padding: "12px",
          }}
        >
          <Col span={8}>
            <Form.Item
              label="Particular"
              name="particular"
              validateStatus={errors.particular ? "error" : ""}
              help={errors.particular && errors.particular.message}
              required={true}
              wrapperCol={{ sm: 24 }}
              style={{
                marginBottom: "8px",
              }}
            >
              <Controller
                control={control}
                name="particular"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select Particular"
                    allowClear
                    loading={isLoadingParticularWastageList}
                    options={particularWastageListRes?.map(
                      ({ particular }) => ({
                        label: particular,
                        value: particular,
                      })
                    )}
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
          </Col>
          <Col span={8}>
            <Form.Item
              label="Type"
              name="particular_type"
              validateStatus={errors.particular_type ? "error" : ""}
              help={errors.particular_type && errors.particular_type.message}
              required={true}
              wrapperCol={{ sm: 24 }}
              style={{
                marginBottom: "8px",
              }}
            >
              <Controller
                control={control}
                name="particular_type"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select Particular type"
                    allowClear
                    loading={isLoadingParticularWastageList}
                    options={particularWastageListRes
                      ?.find(({ particular: p }) => p === particular)
                      ?.type?.map((type) => ({
                        label: type,
                        value: type,
                      }))}
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
          </Col>

          <Col span={8}>
            <Form.Item
              label="Pis/KG"
              name="pis"
              validateStatus={errors.pis ? "error" : ""}
              help={errors.pis && errors.pis.message}
              required={true}
            >
              <Controller
                control={control}
                name="pis"
                render={({ field }) => (
                  <Input {...field} type="number" min={0} step={0.01} />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Rate per Pis/KG/Meter"
              name="rate_par_pis"
              validateStatus={errors.rate_par_pis ? "error" : ""}
              help={errors.rate_par_pis && errors.rate_par_pis.message}
              required={true}
            >
              <Controller
                control={control}
                name="rate_par_pis"
                render={({ field }) => (
                  <Input {...field} type="number" min={0} step={0.01} />
                )}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Total"
              name="total"
              validateStatus={errors.total ? "error" : ""}
              help={errors.total && errors.total.message}
              required={true}
            >
              <Controller
                control={control}
                name="total"
                render={({ field }) => (
                  <Input {...field} type="number" min={0} step={0.01} />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Notes"
              name="notes"
              validateStatus={errors.notes ? "error" : ""}
              help={errors.notes && errors.notes.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="notes"
                render={({ field }) => (
                  <Input.TextArea
                    {...field}
                    placeholder="Please enter note"
                    autoSize
                  />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Flex gap={10} justify="flex-end">
          <Button htmlType="button" onClick={() => reset()}>
            Reset
          </Button>
          <Button type="primary" htmlType="submit">
            Create
          </Button>
        </Flex>
      </Form>

      <DevTool control={control} />
    </div>
  );
}

export default AddWastageSalesReport;
