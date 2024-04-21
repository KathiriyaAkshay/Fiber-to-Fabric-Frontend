import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Col, Flex, Form, Row, Select, message } from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { DevTool } from "@hookform/devtools";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useContext } from "react";
import { GlobalContext } from "../../../../../contexts/GlobalContext";
import { createDailyTFOReportRequest } from "../../../../../api/requests/reports/dailyTFOReport";
import { getCompanyMachineListRequest } from "../../../../../api/requests/machine";
import GoBackButton from "../../../../../components/common/buttons/GoBackButton";

const addDailyTFOReportSchemaResolver = yupResolver(
  yup.object().shape({
    machine_name: yup.string().required("Please enter "),
    machine_no: yup.string().required("Please enter "),
    motor_type: yup.string().required("Please enter "),
    yarn_stock_company_id: yup.string().required("Please enter "),
    total_cops: yup.string().required("Please enter "),
    per_cops_weight: yup.string().required("Please enter "),
    total_cops_weight: yup.string().required("Please enter "),
    yarn_type: yup.string().required("Please enter "),
    load_date: yup.string().required("Please enter "),
    task_description: yup.string().required("Please enter "),
    tpm: yup.string().required("Please enter "),
  })
);

function AddDailyTFOReport() {
  const { companyId } = useContext(GlobalContext);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: machineListRes, isLoading: isLoadingMachineList } = useQuery({
    queryKey: ["machine", "list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getCompanyMachineListRequest({
        companyId,
        params: { company_id: companyId },
      });
      return res.data?.data?.machineList;
    },
    enabled: Boolean(companyId),
  });

  const { mutateAsync: createDailyTFOReport } = useMutation({
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
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(errorMessage);
    },
  });

  async function onSubmit(data) {
    await createDailyTFOReport(data);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: addDailyTFOReportSchemaResolver,
    defaultValues: {
      machine_name: "TFO",
    },
  });

  console.log("errors----->", errors);

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
                        length:
                          machineListRes?.rows?.find(
                            (mchn) => mchn?.id == "TFO"
                          )?.no_of_machines || 0,
                      },
                      (_, index) => ({ label: index + 1, value: index + 1 })
                    )}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name={`shift`}
              validateStatus={errors.shift ? "error" : ""}
              help={errors?.shift?.message}
              required={true}
              className="mb-0"
              label="Shift"
            >
              <Controller
                control={control}
                name={`shift`}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={[
                      {
                        label: "Day",
                        value: "day",
                      },
                      {
                        label: "Night",
                        value: "night",
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
        </Row>

        <Flex gap={10} justify="flex-end">
          <Button htmlType="button" onClick={() => reset()}>
            Reset
          </Button>
          <Button type="primary" htmlType="submit">
            Load
          </Button>
        </Flex>
      </Form>

      <DevTool control={control} />
    </div>
  );
}

export default AddDailyTFOReport;
