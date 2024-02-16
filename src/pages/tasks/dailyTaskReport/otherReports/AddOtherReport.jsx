import { ArrowLeftOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Col,
  DatePicker,
  Flex,
  Form,
  Row,
  Select,
  message,
} from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { DevTool } from "@hookform/devtools";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMemo } from "react";
import dayjs from "dayjs";
import { createOtherReportRequest } from "../../../../api/requests/reports/otherReport";
import { useCompanyList } from "../../../../api/hooks/company";
import { getSupervisorListRequest } from "../../../../api/requests/users";

const addOtherReportSchemaResolver = yupResolver(
  yup.object().shape({
    user_id: yup.string().required("Please select supervisor"),
    assign_time: yup.string().required("Please select time"),
  })
);

function AddOtherReport() {
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

  console.log("supervisorListRes", supervisorListRes);

  const { mutateAsync: createOtherReport } = useMutation({
    mutationFn: async (data) => {
      const res = await createOtherReportRequest({
        data,
        params: { company_id: companyId },
      });
      return res.data;
    },
    mutationKey: ["reports", "other-report", "create"],
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

  function goToAddSupervisor() {
    navigate("/user-master/my-supervisor/add");
  }

  async function onSubmit(data) {
    await createOtherReport({ ...data, company_id: companyId });
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: addOtherReportSchemaResolver,
  });

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h2 className="m-0">Add New Other Report</h2>
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

export default AddOtherReport;
