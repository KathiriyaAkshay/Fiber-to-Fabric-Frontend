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
  // TimePicker,
  message,
} from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../../../../contexts/GlobalContext";
import { createDailyTFOReportRequest } from "../../../../../api/requests/reports/dailyTFOReport";
import { getCompanyMachineListRequest } from "../../../../../api/requests/machine";
import GoBackButton from "../../../../../components/common/buttons/GoBackButton";
import { getYSCDropdownList } from "../../../../../api/requests/reports/yarnStockReport";
import { PlusCircleOutlined } from "@ant-design/icons";
import { YARN_TYPE_OPTION_LIST } from "../../../../../constants/yarn";
import dayjs from "dayjs";
import { mutationOnErrorHandler } from "../../../../../utils/mutationUtils";

const addDailyTFOReportSchemaResolver = yupResolver(
  yup.object().shape({
    machine_name: yup.string().required("Please enter Machine Name"),
    machine_no: yup.string().required("Please enter Machine Number"),
    motor_type: yup.string().required("Please enter Motor type"),
    yarn_company_name: yup
      .string()
      .required("Please select yarn stock company"),
    yarn_stock_company_id: yup
      .string()
      .required("Please select yarn stock company ID"),
    total_cops: yup.string().required("Please enter Total Cops"),
    per_cops_weight: yup.string().required("Please enter Per Cops Weight"),
    total_cops_weight: yup.string(),
    yarn_type: yup.string().required("Please enter Yarn Type"),
    load_date: yup.string(),
    task_description: yup.string(),
    tpm: yup.string().required("Please enter TPM"),
  })
);

function AddDailyTFOReport() {
  const [denierOptions, setDenierOptions] = useState([]);
  const { companyId } = useContext(GlobalContext);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: machineListRes, isLoading: isLoadingMachineList } = useQuery({
    queryKey: [
      `machine/list/${companyId}`,
      { company_id: companyId, machine_name: "tfo" },
    ],
    queryFn: async () => {
      const res = await getCompanyMachineListRequest({
        companyId,
        params: { company_id: companyId, machine_name: "tfo" },
      });
      return res.data?.data?.machineList;
    },
    enabled: Boolean(companyId),
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

  const { mutateAsync: createDailyTFOReport, isPending: isCreatingReport } =
    useMutation({
      mutationFn: async (data) => {
        const res = await createDailyTFOReportRequest({
          data,
          params: { company_id: companyId },
        });
        return res.data;
      },
      mutationKey: ["reports/daily-tfo-report/createe"],
      onSuccess: (res) => {
        queryClient.invalidateQueries(["reports", "list", companyId]);
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

  function goToAddYarnStockCompany() {
    navigate("/yarn-stock-company/company-list/add");
  }

  async function onSubmit(data) {
    // delete fields that are not allowed in API
    delete data?.yarn_company_name;
    await createDailyTFOReport(data);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: addDailyTFOReportSchemaResolver,
    defaultValues: {
      machine_name: "TFO",
      load_date: dayjs(),
    },
  });

  const { yarn_company_name, total_cops = 0, per_cops_weight = 0 } = watch();

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

  console.log("errors----->", errors);

  useEffect(() => {
    // set total_cops_weight
    const total_cops_weight = Number(total_cops) * Number(per_cops_weight);
    setValue("total_cops_weight", Math.max(0, total_cops_weight));
  }, [per_cops_weight, setValue, total_cops]);

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <GoBackButton />
        <h3 className="m-0 text-primary">Load New Motor</h3>
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
              label="Machine No."
              name="machine_no"
              validateStatus={errors.machine_no ? "error" : ""}
              help={errors.machine_no && errors.machine_no.message}
              required={true}
              wrapperCol={{ sm: 24 }}
              style={{
                marginBottom: "8px",
              }}
            >
              <Controller
                control={control}
                name="machine_no"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select Machine Name"
                    allowClear
                    loading={isLoadingMachineList}
                    options={Array.from(
                      {
                        length: machineListRes?.rows?.[0]?.no_of_machines || 0,
                      },
                      (_, index) => ({ label: index + 1, value: index + 1 })
                    )}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name={`motor_type`}
              validateStatus={errors.motor_type ? "error" : ""}
              help={errors?.motor_type?.message}
              required={true}
              className="mb-0"
              label="Motor Type"
            >
              <Controller
                control={control}
                name={`motor_type`}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={[
                      {
                        label: "Up Motor",
                        value: "up",
                      },
                      {
                        label: "Down Motor",
                        value: "down",
                      },
                    ]}
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
              label="Total Cops"
              name="total_cops"
              validateStatus={errors.total_cops ? "error" : ""}
              help={errors.total_cops && errors.total_cops.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="total_cops"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="50"
                    type="number"
                    min={0}
                    step={0.01}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Per Cops Weight"
              name="per_cops_weight"
              validateStatus={errors.per_cops_weight ? "error" : ""}
              help={errors.per_cops_weight && errors.per_cops_weight.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="per_cops_weight"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="50"
                    type="number"
                    min={0}
                    step={0.01}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Total Cops Weight"
              name="total_cops_weight"
              validateStatus={errors.total_cops_weight ? "error" : ""}
              help={
                errors.total_cops_weight && errors.total_cops_weight.message
              }
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="total_cops_weight"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="50"
                    type="number"
                    min={0}
                    step={0.01}
                    disabled={true}
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
                    {...field}
                    options={YARN_TYPE_OPTION_LIST}
                    placeholder="Select Yarn Type"
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Date"
              name="load_date"
              validateStatus={errors.load_date ? "error" : ""}
              help={errors.load_date && errors.load_date.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="load_date"
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    style={{
                      width: "100%",
                    }}
                    format="DD-MM-YYYY"
                    // disable past dates
                    disabledDate={(current) =>
                      dayjs(current).isBefore(dayjs(), "day")
                    }
                  />
                )}
              />
            </Form.Item>
          </Col>

          {/* <Col span={8}>
            <Form.Item
              label="Assign Time"
              name="assign_time"
              validateStatus={errors.assign_time ? "error" : ""}
              help={errors.assign_time && errors.assign_time.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="assign_time"
                render={({ field }) => (
                  <TimePicker
                    {...field}
                    style={{
                      width: "100%",
                    }}
                    format="h:mm:ss A"
                  />
                )}
              />
            </Form.Item>
          </Col> */}

          <Col span={8}>
            <Form.Item
              label="Write About Task"
              name="task_description"
              validateStatus={errors.task_description ? "error" : ""}
              help={errors.task_description && errors.task_description.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="task_description"
                render={({ field }) => (
                  <Input.TextArea {...field} autoSize={true} />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="TPM"
              name="tpm"
              validateStatus={errors.tpm ? "error" : ""}
              help={errors.tpm && errors.tpm.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="tpm"
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
          <Button type="primary" htmlType="submit" loading={isCreatingReport}>
            Load
          </Button>
        </Flex>
      </Form>
    </div>
  );
}

export default AddDailyTFOReport;
