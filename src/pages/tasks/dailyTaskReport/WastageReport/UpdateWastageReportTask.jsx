import { ArrowLeftOutlined } from "@ant-design/icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Col,
  Flex,
  Form,
  Input,
  Row,
  Select,
  message,
  TimePicker,
  Checkbox,
} from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { DevTool } from "@hookform/devtools";
import { useContext, useEffect } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { getCompanyMachineListRequest } from "../../../../api/requests/machine";
import dayjs from "dayjs";
import {
  getWastageReportTaskByIdRequest,
  updateWastageReportTaskRequest,
} from "../../../../api/requests/reports/wastageReportTask";

const updateWastageReportTaskSchemaResolver = yupResolver(
  yup.object().shape({
    // user_id: yup.string().required(),
    machine_type: yup.string().required(),
    floor: yup.string().required(),
    notes: yup.string().required(),
    is_every_day_task: yup.boolean().required(),
    machine_id: yup.string().required(),
    machine_name: yup.string().required(),
    machine_from: yup.string().required(),
    machine_to: yup.string().required(),
    task_days: yup.array().of(yup.string()),
    // everyday: yup.string().required(),
    assign_time: yup.string().required(),
    // comment: yup.string().required(),
    // wastage: yup.string().required(),
    // wastage_percent: yup.string().required(),
  })
);

function UpdateWastageReportTask() {
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;
  const { companyId } = useContext(GlobalContext);

  function goBack() {
    navigate(-1);
  }

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

  const { mutateAsync: updateWastageReportTask } = useMutation({
    mutationFn: async (data) => {
      const res = await updateWastageReportTaskRequest({
        id,
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["reports/wastage-report-task/update", id],
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
    queryKey: ["reports/wastage-report-task/get", id],
    queryFn: async () => {
      const res = await getWastageReportTaskByIdRequest({
        id,
        params: { company_id: companyId },
      });
      return res.data?.data?.report;
    },
    enabled: Boolean(companyId),
  });

  async function onSubmit(data) {
    // delete parameter's those are not allowed
    delete data?.report_time;
    await updateWastageReportTask(data);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: updateWastageReportTaskSchemaResolver,
  });

  const { machine_id, is_every_day_task, task_days } = watch();

  useEffect(() => {
    // set machine name as it is required from backend
    machineListRes?.rows?.forEach((mchn) => {
      if (mchn?.id == machine_id) {
        setValue("machine_name", mchn?.machine_name);
      }
    });
  }, [machineListRes?.rows, machine_id, setValue]);

  useEffect(() => {
    // set all values if it is every day task
    if (is_every_day_task) {
      setValue("task_days", [0, 1, 2, 3, 4, 5, 6]);
    }
  }, [is_every_day_task, setValue]);

  useEffect(() => {
    // check is every day if all days selected
    setValue("is_every_day_task", task_days?.length === 7);
  }, [setValue, task_days]);

  useEffect(() => {
    if (reportDetails) {
      const {
        machine_type,
        floor,
        notes,
        is_every_day_task,
        machine_id,
        machine_name,
        machine_from,
        machine_to,
        task_days,
        assign_time,
      } = reportDetails;

      reset({
        machine_type,
        floor,
        notes,
        is_every_day_task,
        machine_id,
        machine_name,
        machine_from,
        machine_to,
        task_days,
        assign_time: dayjs(assign_time),
      });
    }
  }, [reportDetails, reset]);

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Edit Wastage Report</h3>
      </div>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Row
          gutter={18}
          style={{
            padding: "12px",
          }}
        >
          {/* <Col span={8}>
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
          </Col> */}

          <Col span={8}>
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
          </Col>

          <Col span={8}>
            <Form.Item
              label="Machine Type"
              name="machine_type"
              validateStatus={errors.machine_type ? "error" : ""}
              help={errors.machine_type && errors.machine_type.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="machine_type"
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Floor"
              name="floor"
              validateStatus={errors.floor ? "error" : ""}
              help={errors.floor && errors.floor.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="floor"
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Weekly"
              name="task_days"
              validateStatus={errors.task_days ? "error" : ""}
              help={
                errors.task_days && errors.task_days.message
                // || "[Select One Or More Days]"
              }
              required={true}
              wrapperCol={{ sm: 24 }}
              className="mb-0"
            >
              <Controller
                control={control}
                name="task_days"
                render={({ field }) => (
                  <Checkbox.Group
                    options={[
                      {
                        value: 0,
                        // label: "Sunday"
                        label: "S",
                      },
                      {
                        value: 1,
                        // label: "Monday"
                        label: "M",
                      },
                      {
                        value: 2,
                        // label: "Tuesday"
                        label: "T",
                      },
                      {
                        value: 3,
                        // label: "Wednesday"
                        label: "W",
                      },
                      {
                        value: 4,
                        // label: "Thursday"
                        label: "T",
                      },
                      {
                        value: 5,
                        // label: "Friday"
                        label: "F",
                      },
                      {
                        value: 6,
                        // label: "Saturday"
                        label: "S",
                      },
                    ]}
                    {...field}
                  />
                )}
              />
            </Form.Item>
            <Controller
              name="is_every_day_task"
              control={control}
              defaultValue={false}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                >
                  Everyday
                </Checkbox>
              )}
            />
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
              label="Machine From"
              name="machine_from"
              validateStatus={errors.machine_from ? "error" : ""}
              help={errors.machine_from && errors.machine_from.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="machine_from"
                render={({ field }) => (
                  <Input {...field} type="number" min={0} step={0.01} />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Machine To"
              name="machine_to"
              validateStatus={errors.machine_to ? "error" : ""}
              help={errors.machine_to && errors.machine_to.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="machine_to"
                render={({ field }) => (
                  <Input {...field} type="number" min={0} step={0.01} />
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

      <DevTool control={control} />
    </div>
  );
}

export default UpdateWastageReportTask;
