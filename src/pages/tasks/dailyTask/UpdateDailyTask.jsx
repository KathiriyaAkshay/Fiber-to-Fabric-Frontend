import { ArrowLeftOutlined } from "@ant-design/icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Checkbox,
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
import { useContext, useEffect } from "react";
import {
  getTaskByIdRequest,
  updateTaskRequest,
} from "../../../api/requests/task";
import { getSupervisorListRequest } from "../../../api/requests/users";
import dayjs from "dayjs";
import { ASSIGN_TIME_LIST } from "../../../constants/task";
import { GlobalContext } from "../../../contexts/GlobalContext";

const updateTaskSchemaResolver = yupResolver(
  yup.object().shape({
    user_id: yup.string().required("Please select supervisor"),
    task_detail: yup.string().required("Please enter task details"),
    assign_time: yup.string().required("Please select time"),
    task_days: yup.array().of(yup.string()),
  })
);

function UpdateDailyTask() {
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;

  function goBack() {
    navigate(-1);
  }
  const { companyId } = useContext(GlobalContext);

  const { mutateAsync: updateTask } = useMutation({
    mutationFn: async (data) => {
      const res = await updateTaskRequest({
        id,
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["task-assignment", "update", id],
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

  const { data: taskDetails } = useQuery({
    queryKey: ["task-assignment", "get", id],
    queryFn: async () => {
      const res = await getTaskByIdRequest({
        id,
        params: { company_id: companyId },
      });
      return res.data?.data?.task;
    },
    enabled: Boolean(companyId),
  });

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

  async function onSubmit(data) {
    // delete parameter's those are not allowed
    delete data?.user_id;
    delete data?.created_date;
    await updateTask(data);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: updateTaskSchemaResolver,
  });

  const { is_every_day_task = false } = taskDetails || {};

  useEffect(() => {
    if (taskDetails) {
      const {
        user_id,
        createdAt,
        task_detail,
        monday,
        tuesday,
        wednesday,
        thursday,
        friday,
        saturday,
        sunday,
        everyday,
        assign_time,
      } = taskDetails;
      let task_days = [];
      if (sunday) task_days.push(0);
      if (monday) task_days.push(1);
      if (tuesday) task_days.push(2);
      if (wednesday) task_days.push(3);
      if (thursday) task_days.push(4);
      if (friday) task_days.push(5);
      if (saturday) task_days.push(6);
      if (everyday) task_days = [0, 1, 2, 3, 4, 5, 6];

      reset({
        user_id,
        created_date: dayjs(createdAt),
        task_detail,
        task_days,
        assign_time,
      });
    }
  }, [taskDetails, reset]);

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Edit Assign Task</h3>
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
                    disabled
                  />
                )}
              />
            </Form.Item>
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
                  />
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
                help={errors.task_days && errors.task_days.message}
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
                required={true}
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
                      placeholder="Please select time"
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
          <Button type="primary" htmlType="submit">
            Update
          </Button>
        </Flex>
      </Form>

    </div>
  );
}

export default UpdateDailyTask;
