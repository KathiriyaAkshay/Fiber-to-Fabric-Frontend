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
  Spin,
  message,
} from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { useContext, useEffect } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { getCompanyMachineListRequest } from "../../../../api/requests/machine";
import dayjs from "dayjs";
import {
  getCheckTakaReportByIdRequest,
  updateCheckTakaReportRequest,
} from "../../../../api/requests/reports/checkTakaReport";
import { getEmployeeListRequest } from "../../../../api/requests/users";
import { getInHouseQualityListRequest } from "../../../../api/requests/qualityMaster";
import GoBackButton from "../../../../components/common/buttons/GoBackButton";
import { mutationOnErrorHandler } from "../../../../utils/mutationUtils";
import moment from "moment";

const updateCheckTakaReportSchemaResolver = yupResolver(
  yup.object().shape({
    // report_date: yup.string().required("Please enter date"),
    employee_id: yup.string().required("Please select employee"),
    // employee_name: yup.string().required("Please enter employee name"),
    machine_id: yup.string().required("Please select machine name"),
    machine_name: yup.string(),
    machine_no: yup.string().required("Please select machine number"),
    quality_id: yup.string().required("Please select quality"),
    taka_no: yup.string(),
    problem: yup.string().required("Please enter problem"),
    fault: yup.string().required("Please enter fault"),
  })
);

function UpdateCheckTakaReport() {
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;
  const { companyId } = useContext(GlobalContext);

  const { data: machineListRes, isLoading: isLoadingMachineList } = useQuery({
    queryKey: [`machine/list/${companyId}`, { company_id: companyId }],
    queryFn: async () => {
      const res = await getCompanyMachineListRequest({
        companyId,
        params: { company_id: companyId },
      });
      return res.data?.data?.machineList;
    },
    enabled: Boolean(companyId),
  });

  const { data: inHouseQualityList, isLoading: isLoadingInHouseQualityList } =
    useQuery({
      queryKey: [
        "quality-master/inhouse-quality/list",
        {
          company_id: companyId,
        },
      ],
      queryFn: async () => {
        const res = await getInHouseQualityListRequest({
          params: {
            company_id: companyId,
          },
        });
        return res.data?.data;
      },
      enabled: Boolean(companyId),
    });

  const { data: employeeListRes, isLoading: isLoadingEmployeeList } = useQuery({
    queryKey: [
      "employee/list",
      {
        company_id: companyId,
      },
    ],
    queryFn: async () => {
      const res = await getEmployeeListRequest({
        params: {
          company_id: companyId,
        },
      });
      return res.data?.data?.empoloyeeList;
    },
    enabled: Boolean(companyId),
  });

  const { mutateAsync: updateCheckTakaReport, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await updateCheckTakaReportRequest({
        id,
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["reports/check-taka-report/update", id],
    onSuccess: (res) => {
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

  const { data: reportDetails, isLoading: isLoadingReportDetails } = useQuery({
    queryKey: ["reports/check-taka-report/get", id],
    queryFn: async () => {
      const res = await getCheckTakaReportByIdRequest({
        id,
        params: { company_id: companyId },
      });
      return res.data?.data?.report;
    },
    enabled: Boolean(companyId),
  });

  async function onSubmit(data) {
    // delete parameter's those are not allowed
    delete data?.machine_id;
    delete data?.report_time;
    await updateCheckTakaReport(data);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: updateCheckTakaReportSchemaResolver,
  });

  const { machine_id, machine_no } = watch();

  useEffect(() => {
    // set machine name as it is required from backend
    machineListRes?.rows?.forEach((mchn) => {
      if (mchn?.id == machine_id) {
        setValue("machine_name", mchn?.machine_name);
        // reset machine no if selected machine number is greater than total machines
        if (machine_no > mchn?.no_of_machines) {
          setValue("machine_no", undefined);
        }
      }
    });
  }, [machineListRes?.rows, machine_id, machine_no, setValue]);

  useEffect(() => {
    if (reportDetails) {
      const {
        report_date,
        employee_id,
        machine_name,
        machine_no,
        quality_id,
        taka_no,
        problem,
        fault,
      } = reportDetails;

      let machine_id;
      // set machine_id based on machine_name
      machineListRes?.rows?.forEach((mchn) => {
        if (mchn?.machine_name == machine_name) {
          machine_id = mchn?.id;
        }
      });

      reset({
        report_date: dayjs(report_date),
        employee_id,
        machine_id,
        machine_no,
        quality_id,
        taka_no,
        problem,
        fault,
      });
    }
  }, [machineListRes?.rows, reportDetails, reset]);

  const disabledDate = current => {
    // Disable dates that are after the current date
    return current && current > moment().endOf('day');
  };

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <GoBackButton />
        <h3 className="m-0 text-primary">Edit Taka Report</h3>
      </div>
      <Spin spinning={isLoadingReportDetails}>
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
                  disabled
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

            <Col span={8}>
              <Form.Item
                label="Employee Name"
                name="employee_id"
                validateStatus={errors.employee_id ? "error" : ""}
                help={errors.employee_id && errors.employee_id.message}
                required={true}
              >
                <Controller
                  control={control}
                  name="employee_id"
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder="Employee"
                      allowClear
                      loading={isLoadingEmployeeList}
                      options={employeeListRes?.rows?.map(
                        ({ id = 0, first_name = "" }) => ({
                          label: first_name,
                          value: id,
                        })
                      )}
                    />
                  )}
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Quality"
                name="quality_id"
                validateStatus={errors.quality_id ? "error" : ""}
                help={errors.quality_id && errors.quality_id.message}
                required={true}
              >
                <Controller
                  control={control}
                  name="quality_id"
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder="Quality"
                      allowClear={true}
                      loading={isLoadingInHouseQualityList}
                      options={inHouseQualityList?.rows?.map(
                        ({ id = 0, quality_name = "" }) => ({
                          label: quality_name,
                          value: id,
                        })
                      )}
                    />
                  )}
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Machine Name"
                name="machine_id"
                validateStatus={errors.machine_id ? "error" : ""}
                help={errors.machine_id && errors.machine_id.message}
                required={true}
                wrapperCol={{ sm: 24 }}
                style={{
                  marginBottom: "8px",
                }}
              >
                <Controller
                  control={control}
                  name="machine_id"
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder="Select Machine Name"
                      allowClear
                      loading={isLoadingMachineList}
                      options={machineListRes?.rows?.map((machine) => ({
                        label: machine?.machine_name,
                        value: machine?.id,
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
                              (mchn) => mchn?.id == machine_id
                            )?.no_of_machines || 0,
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
                label="Taka No."
                name="taka_no"
                validateStatus={errors.taka_no ? "error" : ""}
                help={errors.taka_no && errors.taka_no.message}
                required={true}
              >
                <Controller
                  control={control}
                  name="taka_no"
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      min={0}
                      step={0.01}
                      placeholder="10"
                    />
                  )}
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Problem"
                name="problem"
                validateStatus={errors.problem ? "error" : ""}
                help={errors.problem && errors.problem.message}
                required={true}
                wrapperCol={{ sm: 24 }}
              >
                <Controller
                  control={control}
                  name="problem"
                  render={({ field }) => (
                    <Input.TextArea
                      {...field}
                      placeholder="Ankdi, Chira, Chhapa"
                      autoSize
                    />
                  )}
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Who's Fault"
                name="fault"
                validateStatus={errors.fault ? "error" : ""}
                help={errors.fault && errors.fault.message}
                required={true}
                wrapperCol={{ sm: 24 }}
              >
                <Controller
                  control={control}
                  name="fault"
                  render={({ field }) => (
                    <Input.TextArea
                      {...field}
                      placeholder="Master, Karigar, Mender"
                      autoSize
                    />
                  )}
                />
              </Form.Item>
            </Col>
          </Row>

          <Flex gap={10} justify="flex-end">
            <Button type="primary" htmlType="submit" loading = {isPending}>
              Update
            </Button>
          </Flex>
        </Form>
      </Spin>
    </div>
  );
}

export default UpdateCheckTakaReport;
