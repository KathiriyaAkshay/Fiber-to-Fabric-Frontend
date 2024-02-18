import { ArrowLeftOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Col,
  DatePicker,
  Flex,
  Form,
  Row,
  Select,
  TimePicker,
  message,
} from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { DevTool } from "@hookform/devtools";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import dayjs from "dayjs";
import { useCompanyList } from "../../../../api/hooks/company";
import { createYarnStockReportRequest } from "../../../../api/requests/reports/yarnStockReport";
import { getYarnStockCompanyListRequest } from "../../../../api/requests/yarnStock";

const addYarnStockReportSchemaResolver = yupResolver(
  yup.object().shape({
    report_date: yup.string().required("Please select date"),
    report_time: yup.string(),
    yarn_company_id: yup.string().required("Please select yarn stock company"),
  })
);

function AddYarnStockReport() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: companyListRes } = useCompanyList();

  const companyId = companyListRes?.rows?.[0]?.id;

  const { data: ysCompanyListRes, isLoading: isLoadingYSCompanyList } =
    useQuery({
      queryKey: ["yarn-stock", "company", "list", companyId],
      queryFn: async () => {
        const res = await getYarnStockCompanyListRequest({
          companyId,
          params: {},
        });
        return res.data?.data;
      },
      enabled: Boolean(companyId),
    });

  const { mutateAsync: createYarnStockReport } = useMutation({
    mutationFn: async (data) => {
      const res = await createYarnStockReportRequest({
        data,
        params: { company_id: companyId },
      });
      return res.data;
    },
    mutationKey: ["yarn-stock", "yarn-report", "create"],
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
    await createYarnStockReport({
      ...data,
      company_id: companyId,
      report_time: undefined,
    });
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: addYarnStockReportSchemaResolver,
    defaultValues: {
      report_date: dayjs(),
      report_time: dayjs(),
    },
  });

  function goToAddYarnStockCompany() {
    navigate("/yarn-stock-company/company-list/add");
  }

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h2 className="m-0">Yarn Stock Report</h2>
      </div>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Row
          gutter={18}
          style={{
            padding: "12px",
          }}
        >
          <Col span={12}>
            <Form.Item
              label="Date"
              name="report_date"
              validateStatus={errors.report_date ? "error" : ""}
              help={errors.report_date && errors.report_date.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="report_date"
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    style={{
                      width: "100%",
                    }}
                    format="DD-MM-YYYY"
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Time"
              name="report_time"
              validateStatus={errors.report_time ? "error" : ""}
              help={errors.report_time && errors.report_time.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="report_time"
                render={({ field }) => (
                  <TimePicker
                    {...field}
                    style={{
                      width: "100%",
                    }}
                    format="h:mm:ss A"
                    disabled={true}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12} className="flex items-end gap-2">
            <Form.Item
              label="Yarn Stock Company Name"
              name="yarn_company_id"
              validateStatus={errors.yarn_company_id ? "error" : ""}
              help={errors.yarn_company_id && errors.yarn_company_id.message}
              wrapperCol={{ sm: 24 }}
              className="flex-grow"
            >
              <Controller
                control={control}
                name="yarn_company_id"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select Yarn Stock Company"
                    loading={isLoadingYSCompanyList}
                    options={ysCompanyListRes?.yarnComanyList?.rows?.map(
                      ({ id = "", yarn_company_name = "" }) => {
                        return {
                          label: yarn_company_name,
                          value: id,
                        };
                      }
                    )}
                  />
                )}
              />
            </Form.Item>
            <Button
              icon={<PlusCircleOutlined />}
              onClick={goToAddYarnStockCompany}
              className="mb-6"
              type="primary"
            />
          </Col>

          <Col span={12}>
            <Form.Item
              label="Denier/Count"
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
                    placeholder="Select denier"
                    allowClear
                    // loading={isLoadingCompanyList}
                    options={companyListRes?.rows?.map((et) => ({
                      label: et?.company_name,
                      value: et?.id,
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

export default AddYarnStockReport;
