import { ArrowLeftOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  Row,
  Select,
  TimePicker,
  message,
} from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import dayjs from "dayjs";
import {
  createYarnStockReportRequest,
  getYSCDropdownList,
} from "../../../../api/requests/reports/yarnStockReport";
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";

const addYarnStockReportSchemaResolver = yupResolver(
  yup.object().shape({
    report_date: yup.string().required("Please select date"),
    report_time: yup.string(),
    yarn_company_id: yup.string().required("Please select denier"),
    avg_stock: yup.string(),
    require_stock: yup.string(),
    current_stock: yup.string().required("please enter current stock"),
    cartoon: yup.string().required("please enter current stock"),
    yarn_company_name: yup
      .string()
      .required("Please select yarn stock company"),
  })
);

function AddYarnStockReport() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [denierOptions, setDenierOptions] = useState([]);

  const { companyId } = useContext(GlobalContext);

  const { data: yscdListRes, isLoading: isLoadingYSCDList } = useQuery({
    queryKey: ["dropdown", "yarn_company", "list"],
    queryFn: async () => {
      const res = await getYSCDropdownList({
        params: { company_id: companyId },
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
      report_time: undefined,
      yarn_company_name: undefined,
      avg_stock: undefined,
    });
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
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

  const {
    yarn_company_name,
    yarn_company_id,
    current_stock = 0,
    avg_stock = 0,
  } = watch();

  useEffect(() => {
    // set options for denier selection
    yscdListRes?.yarnCompanyList?.forEach((ysc) => {
      const { yarn_company_name: name = "", yarn_details = [] } = ysc;
      if (name === yarn_company_name) {
        const options = yarn_details?.map(
          ({
            yarn_company_id = 0,
            filament = 0,
            yarn_denier = 0,
            luster_type = "",
            yarn_color = "",
            // yarn_count,
            // current_stock,
            // avg_daily_stock,
            // pending_quantity,
          }) => {
            return {
              label: `${yarn_denier}D/${filament}F (${luster_type} - ${yarn_color})`,
              value: yarn_company_id,
            };
          }
        );
        if (options?.length) {
          setDenierOptions(options);
        }
      }
    });
  }, [yarn_company_name, yscdListRes?.yarnCompanyList]);

  useEffect(() => {
    // set Avg stock value
    yscdListRes?.yarnCompanyList?.forEach((ysc) => {
      const { yarn_company_name: name = "", yarn_details = [] } = ysc;
      if (name === yarn_company_name) {
        yarn_details?.forEach(({ avg_daily_stock, yarn_company_id: id }) => {
          if (yarn_company_id === id) {
            setValue("avg_stock", avg_daily_stock);
          }
        });
      }
    });
  }, [
    setValue,
    yarn_company_id,
    yarn_company_name,
    yscdListRes?.yarnCompanyList,
  ]);

  useEffect(() => {
    const require_stock = Number(avg_stock) - Number(current_stock);
    setValue("require_stock", Math.max(0, require_stock));
  }, [avg_stock, current_stock, setValue]);

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Yarn Stock Report</h3>
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
              required={true}
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
              name="yarn_company_name"
              validateStatus={errors.yarn_company_name ? "error" : ""}
              help={
                errors.yarn_company_name && errors.yarn_company_name.message
              }
              required={true}
              wrapperCol={{ sm: 24 }}
              className="flex-grow"
            >
              <Controller
                control={control}
                name="yarn_company_name"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select Yarn Stock Company"
                    loading={isLoadingYSCDList}
                    options={yscdListRes?.yarnCompanyList?.map(
                      ({ yarn_company_name = "" }) => {
                        return {
                          label: yarn_company_name,
                          value: yarn_company_name,
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
              name="yarn_company_id"
              validateStatus={errors.yarn_company_id ? "error" : ""}
              help={errors.yarn_company_id && errors.yarn_company_id.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="yarn_company_id"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select denier"
                    allowClear
                    loading={isLoadingYSCDList}
                    options={denierOptions}
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

          <Col span={12}>
            <Form.Item
              label="Avg stock"
              name="avg_stock"
              validateStatus={errors.avg_stock ? "error" : ""}
              help={errors.avg_stock && errors.avg_stock.message}
              wrapperCol={{ sm: 24 }}
              disabled
            >
              <Controller
                control={control}
                name="avg_stock"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="3"
                    type="number"
                    min={0}
                    disabled
                    step={0.01}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Cartoon"
              name="cartoon"
              validateStatus={errors.cartoon ? "error" : ""}
              help={errors.cartoon && errors.cartoon.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="cartoon"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="3"
                    type="number"
                    min={0}
                    step={0.01}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Current Stock"
              name="current_stock"
              validateStatus={errors.current_stock ? "error" : ""}
              help={errors.current_stock && errors.current_stock.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="current_stock"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="3"
                    type="number"
                    min={0}
                    step={0.01}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Require kg"
              name="require_stock"
              validateStatus={errors.require_stock ? "error" : ""}
              help={errors.require_stock && errors.require_stock.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="require_stock"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="3"
                    type="number"
                    min={0}
                    disabled
                    step={0.01}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Lot No"
              name="lot_no"
              validateStatus={errors.lot_no ? "error" : ""}
              help={errors.lot_no && errors.lot_no.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="lot_no"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="3"
                    type="number"
                    min={0}
                    step={0.01}
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

    </div>
  );
}

export default AddYarnStockReport;
