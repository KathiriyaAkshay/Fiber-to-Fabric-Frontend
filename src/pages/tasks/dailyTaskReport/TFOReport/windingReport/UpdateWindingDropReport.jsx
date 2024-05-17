import { PlusCircleOutlined } from "@ant-design/icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  Row,
  Select,
  message,
} from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { useContext, useEffect, useState } from "react";
import {
  getWindingDropsReportByIdRequest,
  updateWindingDropsReportRequest,
} from "../../../../../api/requests/reports/windingDropsReport";
import { GlobalContext } from "../../../../../contexts/GlobalContext";
import { getYSCDropdownList } from "../../../../../api/requests/reports/yarnStockReport";
import dayjs from "dayjs";
import GoBackButton from "../../../../../components/common/buttons/GoBackButton";
import moment from "moment";

const updateWindingDropReportSchemaResolver = yupResolver(
  yup.object().shape({
    report_date: yup.string().required(),
    yarn_stock_company_id: yup.string().required(),
    cartoon_open: yup.string().required(),
    cops: yup.string().required(),
    weight: yup.string().required(),
    total_weight: yup.string().required(),
  })
);

function UpdateWindingDropReport() {
  const [denierOptions, setDenierOptions] = useState([]);
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;
  const { companyId } = useContext(GlobalContext);

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

  const { mutateAsync: updateWindingDropReport } = useMutation({
    mutationFn: async (data) => {
      const res = await updateWindingDropsReportRequest({
        id,
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["reports/winding-drops-report/update", id],
    onSuccess: (res) => {
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      navigate(-1);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message;
      if (errorMessage && typeof errorMessage === "string") {
        message.error(errorMessage);
      }
    },
  });

  const { data: reportDetails } = useQuery({
    queryKey: ["reports/winding-drops-report/get", id],
    queryFn: async () => {
      const res = await getWindingDropsReportByIdRequest({
        id,
        params: { company_id: companyId },
      });
      return res.data?.data?.task;
    },
    enabled: Boolean(companyId),
  });

  function goToAddYarnStockCompany() {
    navigate("/yarn-stock-company/company-list/add");
  }

  async function onSubmit(data) {
    // delete parameter's those are not allowed
    delete data?.yarn_company_name;
    await updateWindingDropReport(data);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: updateWindingDropReportSchemaResolver,
  });

  const { yarn_company_name, cops, weight } = watch();

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

  useEffect(() => {
    setValue("total_weight", Number(cops) * Number(weight));
  }, [cops, setValue, weight]);

  useEffect(() => {
    if (reportDetails) {
      const {
        report_date,
        yarn_stock_company_id,
        yarn_stock_company,
        cartoon_open,
        cops,
        weight,
        total_weight,
      } = reportDetails;
      const { yarn_company_name } = yarn_stock_company;

      reset({
        report_date: dayjs(report_date),
        yarn_stock_company_id,
        yarn_company_name,
        cartoon_open,
        cops,
        weight,
        total_weight,
      });
    }
  }, [reportDetails, reset]);

  const disabledDate = (current) => {
    // Disable dates after today
    return current && current > moment().endOf('day');
  }

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <GoBackButton />
        <h3 className="m-0 text-primary">Update Notes</h3>
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
                    disabledDate={disabledDate}
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
              label="Cartoons/pallet open"
              name="cartoon_open"
              validateStatus={errors.cartoon_open ? "error" : ""}
              help={errors.cartoon_open && errors.cartoon_open.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="cartoon_open"
                render={({ field }) => (
                  <Input {...field} type="number" min={0} step={0.01} />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Cops"
              name="cops"
              validateStatus={errors.cops ? "error" : ""}
              help={errors.cops && errors.cops.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="cops"
                render={({ field }) => (
                  <Input {...field} type="number" min={0} step={0.01} />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Weight"
              name="weight"
              validateStatus={errors.weight ? "error" : ""}
              help={errors.weight && errors.weight.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="weight"
                render={({ field }) => (
                  <Input {...field} type="number" min={0} step={0.01} />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Total Weight"
              name="total_weight"
              validateStatus={errors.total_weight ? "error" : ""}
              help={errors.total_weight && errors.total_weight.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="total_weight"
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    step={0.01}
                    disabled={true}
                  />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Flex gap={10} justify="flex-end">
          <Button type="primary" htmlType="submit">
            Update
          </Button>
        </Flex>
      </Form>

    </div>
  );
}

export default UpdateWindingDropReport;
