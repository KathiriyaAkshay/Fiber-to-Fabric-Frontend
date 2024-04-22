import { PlusCircleOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  Button,
  Col,
  Flex,
  Form,
  Input,
  Row,
  Select,
  DatePicker,
  message,
  TimePicker,
} from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { DevTool } from "@hookform/devtools";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../../../../contexts/GlobalContext";
import { createRollStockReportRequest } from "../../../../../api/requests/reports/rollStockReport";
import dayjs from "dayjs";
import { getYSCDropdownList } from "../../../../../api/requests/reports/yarnStockReport";
import { mutationOnErrorHandler } from "../../../../../utils/mutationUtils";
import GoBackButton from "../../../../../components/common/buttons/GoBackButton";
import { YARN_TYPE_OPTION_LIST } from "../../../../../constants/yarn";

const addRollStockReportSchemaResolver = yupResolver(
  yup.object().shape({
    report_date: yup.string().required("Please select date"),
    report_time: yup.string(),
    yarn_stock_company_id: yup.string().required(),
    yarn_type: yup.string().required(),
    roll_stock: yup.string(),
    weight_stock: yup.string().required(),
  })
);

function AddRollStockReport() {
  const [denierOptions, setDenierOptions] = useState([]);
  const { companyId } = useContext(GlobalContext);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutateAsync: createRollStockReport } = useMutation({
    mutationFn: async (data) => {
      const res = await createRollStockReportRequest({
        data,
        params: { company_id: companyId },
      });
      return res.data;
    },
    mutationKey: ["reports/roll-stock-report/create"],
    onSuccess: (res) => {
      queryClient.invalidateQueries([
        "reports/roll-stock-report/list",
        {
          company_id: companyId,
        },
      ]);
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      navigate(-1);
    },
    onError: (error) => {
      mutationOnErrorHandler({ error, message });
    },
  });

  const { data: yscdListRes, isLoading: isLoadingYSCDList } = useQuery({
    queryKey: ["dropdown", "yarn_company", "list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getYSCDropdownList({
        params: { company_id: companyId },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  function goToAddYarnStockCompany() {
    navigate("/yarn-stock-company/company-list/add");
  }

  async function onSubmit(data) {
    delete data?.report_time;
    delete data?.yarn_company_name;
    await createRollStockReport(data);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: addRollStockReportSchemaResolver,
    defaultValues: {
      report_date: dayjs(),
      report_time: dayjs(),
    },
  });

  const { yarn_company_name } = watch();

  useEffect(() => {
    // set options for denier selection on yarn stock company select
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

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <GoBackButton />
        <h3 className="m-0 text-primary">Roll Stock Report</h3>
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

          <Col span={8}>
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

          <Col span={8} className="flex items-end gap-2">
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
              className="flex-none mb-6"
              type="primary"
            />
          </Col>

          <Col span={8}>
            <Form.Item
              label="Denier"
              name="yarn_stock_company_id"
              validateStatus={errors.yarn_stock_company_id ? "error" : ""}
              help={
                errors.yarn_stock_company_id &&
                errors.yarn_stock_company_id.message
              }
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="yarn_stock_company_id"
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

          <Col span={8}>
            <Form.Item
              label="Yarn Type"
              name="yarn_type"
              validateStatus={errors.yarn_type ? "error" : ""}
              help={errors.yarn_type && errors.yarn_type.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="yarn_type"
                render={({ field }) => (
                  <Select
                    allowClear
                    placeholder="Yarn Type"
                    {...field}
                    options={YARN_TYPE_OPTION_LIST}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Roll stock"
              name="roll_stock"
              validateStatus={errors.roll_stock ? "error" : ""}
              help={errors.roll_stock && errors.roll_stock.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="roll_stock"
                render={({ field }) => (
                  <Input {...field} type="number" min={0} step={0.01} />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Weight Stock"
              name="weight_stock"
              validateStatus={errors.weight_stock ? "error" : ""}
              help={errors.weight_stock && errors.weight_stock.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="weight_stock"
                render={({ field }) => (
                  <Input {...field} type="number" min={0} step={0.01} />
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

export default AddRollStockReport;
