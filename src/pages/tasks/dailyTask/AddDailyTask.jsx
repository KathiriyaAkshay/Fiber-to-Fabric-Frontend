import { ArrowLeftOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  Radio,
  Row,
  Select,
  message,
} from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useCompanyList } from "../../../api/hooks/company";
import { createTaskRequest } from "../../../api/requests/task";
import { useMemo } from "react";
import { getSupervisorListRequest } from "../../../api/requests/users";
import dayjs from "dayjs";
import { ASSIGN_TIME_LIST } from "../../../constants/task";

const addTaskSchemaResolver = yupResolver(
  yup.object().shape({
    user_id: yup.string().required("Please select supervisor"),
    is_every_day_task: yup
      .boolean()
      .required("Please select one time or everyday"),
    task_detail: yup.string().required("Please enter task details"),
    assign_time: yup.string().required("Please select time"),
    task_days: yup.array().of(yup.string()),
  })
);

function AddDailyTask() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: companyListRes } = useCompanyList();

  const companyId = useMemo(
    () => companyListRes?.rows?.[0]?.id,
    [companyListRes?.rows]
  );

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

  const { mutateAsync: createDailyTask } = useMutation({
    mutationFn: async (data) => {
      const res = await createTaskRequest({
        data,
        params: { company_id: companyId },
      });
      return res.data;
    },
    mutationKey: ["task-assignment", "create"],
    onSuccess: (res) => {
      queryClient.invalidateQueries(["task-assignment", "list", companyId]);
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

  function goToAddSupervisor() {
    navigate("/user-master/my-supervisor/add");
  }

  async function onSubmit(data) {
    await createDailyTask({ ...data, company_id: companyId });
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: addTaskSchemaResolver,
    defaultValues: {
      is_every_day_task: true,
      task_days: [],
    },
  });

  const { is_every_day_task } = watch();

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Assign Task</h3>
      </div>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Row
          gutter={18}
          style={{
            padding: "12px",
          }}
        >
          <Col span={12} className="flex items-end gap-2">
            <Form.Item
              label="Select Supervisor Name"
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
                        label: supervisor?.first_name,
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

          <Col span={12}>
            <Form.Item
              label="Created Date"
              name="created_date"
              validateStatus={errors.created_date ? "error" : ""}
              help={errors.created_date && errors.created_date.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="created_date"
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    style={{
                      width: "100%",
                    }}
                    format="DD/MM/YYYY"
                    disabled
                    value={dayjs()}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              name="is_every_day_task"
              validateStatus={errors.is_every_day_task ? "error" : ""}
              help={
                errors.is_every_day_task && errors.is_every_day_task.message
              }
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="is_every_day_task"
                render={({ field }) => (
                  <Radio.Group {...field}>
                    <Radio value={true}>Everyday task</Radio>
                    <Radio value={false}>One time task</Radio>
                  </Radio.Group>
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            {is_every_day_task && (
              <Form.Item
                label="Days"
                name="task_days"
                validateStatus={errors.task_days ? "error" : ""}
                help={
                  (errors.task_days && errors.task_days.message) ||
                  "[Select One Or More Days]"
                }
                required={true}
                wrapperCol={{ sm: 24 }}
              >
                <Controller
                  control={control}
                  name="task_days"
                  render={({ field }) => (
                    <Checkbox.Group
                      options={[
                        { value: 0, label: "Sunday" },
                        { value: 1, label: "Monday" },
                        { value: 2, label: "Tuesday" },
                        { value: 3, label: "Wednesday" },
                        { value: 4, label: "Thursday" },
                        { value: 5, label: "Friday" },
                        { value: 6, label: "Saturday" },
                      ]}
                      {...field}
                    />
                  )}
                />
              </Form.Item>
            )}
          </Col>

          <Col span={12} style={{ display: "flex", alignItems: "end" }}>
            <Col span={18}>
              <Form.Item
                label="Write About Task"
                name="task_detail"
                validateStatus={errors.task_detail ? "error" : ""}
                help={errors.task_detail && errors.task_detail.message}
                wrapperCol={{ sm: 24 }}
              >
                <Controller
                  control={control}
                  name="task_detail"
                  render={({ field }) => (
                    <Input.TextArea {...field} placeholder="Task 1" autoSize />
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
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
                    <Select
                      allowClear
                      placeholder="Time"
                      {...field}
                      options={ASSIGN_TIME_LIST}
                    />
                  )}
                />
              </Form.Item>
            </Col>
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

export default AddDailyTask;
