import { ArrowLeftOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Col,
  // DatePicker,
  TimePicker,
  Flex,
  Form,
  Input,
  Row,
  Select,
  message,
  Checkbox,
} from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useContext, useEffect } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { getCompanyMachineListRequest } from "../../../../api/requests/machine";
import dayjs from "dayjs";
import { createWastageReportTaskRequest } from "../../../../api/requests/reports/wastageReportTask";
import { getSupervisorListRequest } from "../../../../api/requests/users";
import { mutationOnErrorHandler } from "../../../../utils/mutationUtils";

const addWastageReportTaskSchemaResolver = yupResolver(
  yup.object().shape({
    user_id: yup.string().required(),
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

function AddWastageReportTask() {
  const { companyId } = useContext(GlobalContext);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: supervisorListRes, isLoading: isLoadingSupervisorList } =
    useQuery({
      queryKey: ["supervisor", "list", { company_id: companyId }],
      queryFn: async () => {
        const res = await getSupervisorListRequest({
          params: { company_id: companyId },
        });
        return res.data?.data;
      },
      enabled: Boolean(companyId),
    });

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

  const { mutateAsync: createWastageReportTask } = useMutation({
    mutationFn: async (data) => {
      const res = await createWastageReportTaskRequest({
        data,
        params: { company_id: companyId },
      });
      return res.data;
    },
    mutationKey: ["reports/wastage-report-task/create"],
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

  function goBack() {
    navigate(-1);
  }

  function goToAddSupervisor() {
    navigate("/user-master/my-supervisor/add");
  }

  async function onSubmit(data) {
    await createWastageReportTask(data);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: addWastageReportTaskSchemaResolver,
    defaultValues: {
      // report_date: dayjs(),
      assign_time: dayjs(),
      is_every_day_task: false,
    },
  });

  console.log("errors----->", errors);
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

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Assign new wastage report task</h3>
      </div>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Row
          gutter={18}
          style={{
            padding: "12px",
          }}
        >
          <Col span={8} className="flex items-end gap-2">
            <Form.Item
              label="Supervisor"
              name="user_id"
              validateStatus={errors.user_id ? "error" : ""}
              help={errors.user_id && errors.user_id.message}
              required={true}
              wrapperCol={{ sm: 24 }}
              className="flex-grow"
            >
              <Controller
                control={control}
                name="user_id"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select supervisor"
                    loading={isLoadingSupervisorList}
                    options={supervisorListRes?.supervisorList?.rows?.map(
                      (supervisor) => ({
                        label: `${supervisor?.first_name} ${supervisor?.last_name} | ( ${supervisor?.username} )`,
                        value: supervisor?.id,
                      })
                    )}
                  />
                )}
              />
            </Form.Item>
            <Button
              icon={<PlusCircleOutlined />}
              onClick={goToAddSupervisor}
              className="mb-6"
              type="primary"
            />
          </Col>

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

export default AddWastageReportTask;
